const test = require('node:test');
const assert = require('node:assert/strict');
const {
  forecastDemand,
  calculateSafetyStock,
  recommendReorder,
  standardDeviation,
} = require('../engine/demand-planner');

test('forecasts demand with weighted moving average', () => {
  const forecast = forecastDemand({
    history: [10, 20, 30, 40],
    periods: 3,
    method: 'weighted-moving-average',
  });

  assert.equal(forecast, 33.33);
});

test('forecasts demand with exponential smoothing', () => {
  const forecast = forecastDemand({
    history: [10, 20, 20],
    method: 'exponential-smoothing',
    alpha: 0.5,
  });

  assert.equal(forecast, 17.5);
});

test('calculates safety stock from demand variability and lead time', () => {
  assert.equal(calculateSafetyStock({ demandStdDev: 4, leadTimeDays: 9, serviceLevelZ: 1.65 }), 19.8);
});

test('recommends reorder quantity rounded to pack size', () => {
  const result = recommendReorder({
    sku: 'A',
    dailyDemandHistory: [10, 12, 11, 13, 12, 14],
    onHand: 30,
    onOrder: 10,
    leadTimeDays: 4,
    reviewPeriodDays: 6,
    packSize: 5,
    forecastOptions: { method: 'moving-average', periods: 3 },
  });

  assert.equal(result.stockoutRisk, 'medium');
  assert.equal(result.recommendedOrderQty % 5, 0);
  assert.ok(result.recommendedOrderQty > 0);
});

test('standard deviation uses sample formula', () => {
  assert.equal(round2(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])), 2.14);
});

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
