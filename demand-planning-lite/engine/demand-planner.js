function forecastDemand({ history, periods = 4, method = 'weighted-moving-average', alpha = 0.4 }) {
  validateHistory(history);
  const window = history.slice(-periods);

  if (method === 'moving-average') {
    return round2(average(window));
  }

  if (method === 'weighted-moving-average') {
    const weighted = window.reduce((sum, value, index) => sum + value * (index + 1), 0);
    const totalWeight = window.reduce((sum, _, index) => sum + index + 1, 0);
    return round2(weighted / totalWeight);
  }

  if (method === 'exponential-smoothing') {
    if (alpha <= 0 || alpha > 1) throw new Error('alpha must be in (0, 1]');
    let forecast = history[0];
    for (let index = 1; index < history.length; index++) {
      forecast = alpha * history[index] + (1 - alpha) * forecast;
    }
    return round2(forecast);
  }

  throw new Error(`Unsupported forecast method ${method}`);
}

function calculateSafetyStock({ demandStdDev, leadTimeDays, serviceLevelZ = 1.65 }) {
  if (demandStdDev < 0) throw new Error('demandStdDev must be non-negative');
  if (leadTimeDays < 0) throw new Error('leadTimeDays must be non-negative');
  return round2(serviceLevelZ * demandStdDev * Math.sqrt(leadTimeDays));
}

function recommendReorder({
  sku,
  dailyDemandHistory,
  onHand,
  onOrder = 0,
  backorders = 0,
  leadTimeDays,
  reviewPeriodDays = 7,
  serviceLevelZ = 1.65,
  packSize = 1,
  forecastOptions = {},
}) {
  validateHistory(dailyDemandHistory);
  if (packSize <= 0) throw new Error('packSize must be positive');

  const forecastDailyDemand = forecastDemand({
    history: dailyDemandHistory,
    ...forecastOptions,
  });
  const demandStdDev = standardDeviation(dailyDemandHistory);
  const safetyStock = calculateSafetyStock({ demandStdDev, leadTimeDays, serviceLevelZ });
  const reorderPoint = round2(forecastDailyDemand * leadTimeDays + safetyStock);
  const targetStock = round2(forecastDailyDemand * (leadTimeDays + reviewPeriodDays) + safetyStock);
  const inventoryPosition = onHand + onOrder - backorders;
  const rawOrderQty = Math.max(0, targetStock - inventoryPosition);
  const recommendedOrderQty = roundToPack(rawOrderQty, packSize);

  return {
    sku,
    forecastDailyDemand,
    demandStdDev: round2(demandStdDev),
    safetyStock,
    reorderPoint,
    targetStock,
    inventoryPosition,
    recommendedOrderQty,
    daysOfCover: forecastDailyDemand === 0 ? Infinity : round2(onHand / forecastDailyDemand),
    stockoutRisk: classifyRisk({ inventoryPosition, reorderPoint, safetyStock }),
  };
}

function classifyRisk({ inventoryPosition, reorderPoint, safetyStock }) {
  if (inventoryPosition <= safetyStock) return 'high';
  if (inventoryPosition <= reorderPoint) return 'medium';
  return 'low';
}

function standardDeviation(values) {
  if (values.length <= 1) return 0;
  const avg = average(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundToPack(quantity, packSize) {
  return Math.ceil(quantity / packSize) * packSize;
}

function validateHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error('history must contain at least one value');
  }
  if (history.some(value => typeof value !== 'number' || value < 0)) {
    throw new Error('history values must be non-negative numbers');
  }
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = {
  forecastDemand,
  calculateSafetyStock,
  recommendReorder,
  standardDeviation,
};
