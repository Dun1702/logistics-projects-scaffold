const test = require('node:test');
const assert = require('node:assert/strict');
const { planYardSlotting, Yard } = require('../src/algorithms/slotting');

test('places later departures below earlier departures to reduce reshuffles', () => {
  const result = planYardSlotting({
    yardSpec: {
      blocks: 1,
      baysPerBlock: 1,
      rowsPerBay: 1,
      tiersPerStack: 3,
    },
    containers: [
      { id: 'early', departureTime: 100 },
      { id: 'middle', departureTime: 200 },
      { id: 'late', departureTime: 300 },
    ],
  });

  assert.deepEqual(result.unplaced, []);
  assert.deepEqual(
    result.placements.map(item => [item.containerId, item.tier]),
    [
      ['late', 0],
      ['middle', 1],
      ['early', 2],
    ]
  );
  assert.equal(result.totalEstimatedReshuffles, 0);
  assert.equal(result.capacityUsed, 1);
});

test('reports unplaced containers when the yard is full', () => {
  const result = planYardSlotting({
    yardSpec: {
      blocks: 1,
      baysPerBlock: 1,
      rowsPerBay: 1,
      tiersPerStack: 1,
    },
    containers: [
      { id: 'a', departureTime: 100 },
      { id: 'b', departureTime: 200 },
    ],
  });

  assert.equal(result.placements.length, 1);
  assert.deepEqual(result.unplaced, ['a']);
});

test('estimates reshuffles for a specific stack lookup', () => {
  const yard = new Yard({ blocks: 1, baysPerBlock: 1, rowsPerBay: 1, tiersPerStack: 2 });
  yard.place({ id: 'bottom', departureTime: 200 });
  yard.place({ id: 'top', departureTime: 100 });

  assert.equal(yard.estimateReshuffles(0, 0, 0, 'bottom'), 1);
  assert.equal(yard.estimateReshuffles(0, 0, 0, 'top'), 0);
});
