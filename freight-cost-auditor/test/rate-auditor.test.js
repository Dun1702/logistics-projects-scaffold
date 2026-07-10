const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateChargeableWeight,
  buildExpectedCharges,
  auditFreightInvoice,
} = require('../engine/rate-auditor');

const rateCard = {
  currency: 'USD',
  taxRate: 0.1,
  baseRates: [
    {
      laneId: 'SGN-DAD',
      serviceLevel: 'standard',
      minCharge: 50,
      ratePerKg: 0.5,
      fuelSurchargePct: 0.1,
    },
  ],
  accessorials: {
    liftgate: 20,
    residential: 10,
  },
};

test('calculates chargeable weight from actual and volumetric weight', () => {
  const weight = calculateChargeableWeight({
    actualKg: 30,
    packages: [{ lengthCm: 100, widthCm: 50, heightCm: 40, quantity: 1 }],
  });

  assert.equal(weight, 40);
});

test('builds expected freight charges from a rate card', () => {
  const expected = buildExpectedCharges({
    rateCard,
    shipment: {
      id: 'S1',
      laneId: 'SGN-DAD',
      serviceLevel: 'standard',
      billableWeightKg: 120,
      accessorials: ['liftgate'],
    },
  });

  assert.equal(expected.total, 94.6);
  assert.deepEqual(expected.lines.map(line => line.key), ['base', 'fuel', 'accessorial:liftgate', 'tax']);
});

test('flags overbilled invoice lines and unknown charges', () => {
  const audit = auditFreightInvoice({
    rateCard,
    shipments: [
      {
        id: 'S1',
        laneId: 'SGN-DAD',
        serviceLevel: 'standard',
        billableWeightKg: 120,
        accessorials: ['liftgate'],
      },
    ],
    invoiceLines: [
      { shipmentId: 'S1', type: 'base', amount: 60 },
      { shipmentId: 'S1', type: 'fuel', amount: 6 },
      { shipmentId: 'S1', type: 'accessorial', code: 'liftgate', amount: 25 },
      { shipmentId: 'S1', type: 'accessorial', code: 'admin_fee', amount: 7 },
      { shipmentId: 'S1', type: 'tax', amount: 8.6 },
    ],
  });

  assert.equal(audit.summary.flaggedShipments, 1);
  assert.equal(audit.shipments[0].status, 'overbilled');
  assert.equal(audit.shipments[0].variance, 12);
  assert.ok(audit.shipments[0].issues.some(issue => issue.direction === 'unknown-charge'));
});
