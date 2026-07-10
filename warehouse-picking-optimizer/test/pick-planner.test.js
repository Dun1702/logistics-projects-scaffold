const test = require('node:test');
const assert = require('node:assert/strict');
const { planPicking, routeStops } = require('../engine/pick-planner');

const warehouse = {
  depot: { x: 0, y: 0 },
  locations: {
    A1: { x: 2, y: 0, zone: 'A' },
    A2: { x: 4, y: 0, zone: 'A' },
    B1: { x: 0, y: 5, zone: 'B' },
  },
};

test('routes stops using nearest-neighbor Manhattan distance', () => {
  const route = routeStops({
    depot: { x: 0, y: 0 },
    stops: [
      { sku: 'B1', x: 0, y: 5 },
      { sku: 'A1', x: 2, y: 0 },
    ],
  });

  assert.equal(route.stops[0].sku, 'A1');
  assert.equal(route.distance, 14);
});

test('creates pick waves and aggregates repeated SKUs', () => {
  const plan = planPicking({
    warehouse,
    orders: [
      { id: 'O1', priority: 1, dueAt: '2026-07-11T08:00:00Z', lines: [{ sku: 'A1', quantity: 1 }] },
      { id: 'O2', priority: 1, dueAt: '2026-07-11T09:00:00Z', lines: [{ sku: 'A1', quantity: 2 }, { sku: 'A2', quantity: 1 }] },
      { id: 'O3', priority: 1, dueAt: '2026-07-11T10:00:00Z', lines: [{ sku: 'B1', quantity: 1 }] },
    ],
    options: { maxOrdersPerWave: 2, maxLinesPerWave: 3 },
  });

  assert.equal(plan.waveCount, 2);
  assert.deepEqual(plan.waves[0].orderIds, ['O1', 'O2']);
  assert.equal(plan.waves[0].stops.find(stop => stop.sku === 'A1').quantity, 3);
});

test('reports missing SKU locations without crashing the plan', () => {
  const plan = planPicking({
    warehouse,
    orders: [
      { id: 'O1', lines: [{ sku: 'UNKNOWN', quantity: 1 }] },
    ],
  });

  assert.deepEqual(plan.waves[0].missingSkus, [{ orderId: 'O1', sku: 'UNKNOWN', quantity: 1 }]);
});
