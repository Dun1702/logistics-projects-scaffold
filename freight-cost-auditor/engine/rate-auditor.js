function calculateChargeableWeight({ actualKg = 0, packages = [], divisor = 5000 }) {
  if (actualKg < 0) throw new Error('actualKg must be non-negative');
  if (divisor <= 0) throw new Error('divisor must be positive');

  const volumetricKg = packages.reduce((sum, pkg) => {
    const quantity = pkg.quantity ?? 1;
    return sum + (pkg.lengthCm * pkg.widthCm * pkg.heightCm * quantity) / divisor;
  }, 0);

  return round3(Math.max(actualKg, volumetricKg));
}

function buildExpectedCharges({ rateCard, shipment }) {
  const rate = findRate(rateCard, shipment);
  const billableWeightKg = shipment.billableWeightKg ?? calculateChargeableWeight(shipment);
  const baseAmount = Math.max(rate.minCharge ?? 0, billableWeightKg * rate.ratePerKg);
  const fuelAmount = baseAmount * (rate.fuelSurchargePct ?? rateCard.fuelSurchargePct ?? 0);

  const accessorialLines = normalizeAccessorials(shipment.accessorials).map(accessorial => {
    const amount = resolveAccessorialAmount(rateCard, accessorial);
    return {
      key: `accessorial:${accessorial.code}`,
      type: 'accessorial',
      code: accessorial.code,
      amount,
    };
  });

  const taxableBase = baseAmount + fuelAmount + accessorialLines.reduce((sum, line) => sum + line.amount, 0);
  const taxRate = shipment.taxExempt ? 0 : (rate.taxRate ?? rateCard.taxRate ?? 0);
  const taxAmount = taxableBase * taxRate;

  const lines = [
    { key: 'base', type: 'base', code: 'base', amount: baseAmount },
    { key: 'fuel', type: 'fuel', code: 'fuel', amount: fuelAmount },
    ...accessorialLines,
    { key: 'tax', type: 'tax', code: 'tax', amount: taxAmount },
  ].map(line => ({ ...line, amount: round2(line.amount) }));

  const total = round2(lines.reduce((sum, line) => sum + line.amount, 0));

  return {
    shipmentId: shipment.id,
    laneId: shipment.laneId,
    serviceLevel: shipment.serviceLevel,
    billableWeightKg: round3(billableWeightKg),
    currency: rate.currency ?? rateCard.currency ?? 'USD',
    lines,
    total,
  };
}

function auditFreightInvoice({ rateCard, shipments, invoiceLines, tolerance = 0.01 }) {
  const shipmentAudits = shipments.map(shipment => {
    const expected = buildExpectedCharges({ rateCard, shipment });
    const actualLines = invoiceLines.filter(line => line.shipmentId === shipment.id);
    const actualByKey = groupInvoiceLines(actualLines);
    const expectedByKey = new Map(expected.lines.map(line => [line.key, line]));
    const issues = [];

    for (const expectedLine of expected.lines) {
      const actualAmount = actualByKey.get(expectedLine.key) ?? 0;
      const variance = round2(actualAmount - expectedLine.amount);
      if (Math.abs(variance) > tolerance) {
        issues.push({
          key: expectedLine.key,
          type: expectedLine.type,
          code: expectedLine.code,
          expected: expectedLine.amount,
          actual: round2(actualAmount),
          variance,
          direction: variance > 0 ? 'overcharge' : 'undercharge',
        });
      }
    }

    for (const [key, amount] of actualByKey) {
      if (!expectedByKey.has(key) && key !== 'total') {
        issues.push({
          key,
          type: key.split(':')[0],
          code: key.split(':')[1] ?? key,
          expected: 0,
          actual: round2(amount),
          variance: round2(amount),
          direction: 'unknown-charge',
        });
      }
    }

    const actualTotal = calculateActualTotal(actualLines, actualByKey);
    const variance = round2(actualTotal - expected.total);

    return {
      shipmentId: shipment.id,
      expected,
      actualTotal,
      variance,
      status: classifyStatus(variance, issues, tolerance),
      issues,
    };
  });

  const expectedTotal = round2(shipmentAudits.reduce((sum, audit) => sum + audit.expected.total, 0));
  const actualTotal = round2(shipmentAudits.reduce((sum, audit) => sum + audit.actualTotal, 0));
  const variance = round2(actualTotal - expectedTotal);

  return {
    currency: rateCard.currency ?? 'USD',
    shipments: shipmentAudits,
    summary: {
      shipmentCount: shipmentAudits.length,
      expectedTotal,
      actualTotal,
      variance,
      overbilledAmount: round2(shipmentAudits.reduce((sum, audit) => sum + Math.max(0, audit.variance), 0)),
      underbilledAmount: round2(shipmentAudits.reduce((sum, audit) => sum + Math.max(0, -audit.variance), 0)),
      flaggedShipments: shipmentAudits.filter(audit => audit.status !== 'matched').length,
    },
  };
}

function findRate(rateCard, shipment) {
  const rate = rateCard.baseRates.find(candidate =>
    candidate.laneId === shipment.laneId &&
    candidate.serviceLevel === shipment.serviceLevel
  );

  if (!rate) {
    throw new Error(`No rate found for lane ${shipment.laneId} and service ${shipment.serviceLevel}`);
  }

  return rate;
}

function normalizeAccessorials(accessorials = []) {
  return accessorials.map(accessorial => {
    if (typeof accessorial === 'string') return { code: accessorial, quantity: 1 };
    return { quantity: 1, ...accessorial };
  });
}

function resolveAccessorialAmount(rateCard, accessorial) {
  const rule = rateCard.accessorials?.[accessorial.code];
  if (rule === undefined) throw new Error(`Unknown accessorial ${accessorial.code}`);

  const quantity = accessorial.quantity ?? 1;
  if (typeof rule === 'number') return rule * quantity;
  if (rule.type === 'per-shipment') return rule.amount * quantity;
  if (rule.type === 'per-kg') return rule.amount * (accessorial.weightKg ?? 0);

  throw new Error(`Unsupported accessorial rule for ${accessorial.code}`);
}

function groupInvoiceLines(lines) {
  const grouped = new Map();

  for (const line of lines) {
    const key = invoiceLineKey(line);
    grouped.set(key, round2((grouped.get(key) ?? 0) + line.amount));
  }

  return grouped;
}

function invoiceLineKey(line) {
  if (line.type === 'accessorial') return `accessorial:${line.code}`;
  return line.type;
}

function calculateActualTotal(actualLines, actualByKey) {
  if (actualByKey.has('total') && actualByKey.size === 1) {
    return round2(actualByKey.get('total'));
  }

  return round2(actualLines
    .filter(line => line.type !== 'total')
    .reduce((sum, line) => sum + line.amount, 0));
}

function classifyStatus(variance, issues, tolerance) {
  if (issues.length === 0 && Math.abs(variance) <= tolerance) return 'matched';
  if (variance > tolerance) return 'overbilled';
  if (variance < -tolerance) return 'underbilled';
  return 'review';
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round3(n) {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

module.exports = {
  calculateChargeableWeight,
  buildExpectedCharges,
  auditFreightInvoice,
};
