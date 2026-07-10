const { recommendReorder } = require('../engine/demand-planner');

const recommendation = recommendReorder({
  sku: 'SKU-COFFEE-250G',
  dailyDemandHistory: [18, 20, 21, 19, 23, 26, 24, 25, 27, 29, 28, 30],
  onHand: 120,
  onOrder: 40,
  leadTimeDays: 5,
  reviewPeriodDays: 7,
  serviceLevelZ: 1.65,
  packSize: 12,
  forecastOptions: {
    method: 'weighted-moving-average',
    periods: 5,
  },
});

console.log(JSON.stringify(recommendation, null, 2));
