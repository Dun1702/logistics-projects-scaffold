const test = require('node:test');
const assert = require('node:assert/strict');
const { packContainer } = require('../packages/packing-engine');

test('packs fitting boxes and reports capacity metrics', () => {
  const result = packContainer({
    containerSpec: {
      id: '20ft-demo',
      length: 10,
      width: 10,
      height: 10,
      maxWeight: 100,
    },
    boxes: [
      { id: 'box-a', length: 5, width: 5, height: 5, weight: 10, unloadPriority: 2 },
      { id: 'box-b', length: 5, width: 5, height: 5, weight: 10, unloadPriority: 1 },
      { id: 'too-heavy', length: 2, width: 2, height: 2, weight: 200, unloadPriority: 3 },
    ],
  });

  assert.equal(result.containerId, '20ft-demo');
  assert.equal(result.placedBoxes.length, 2);
  assert.equal(result.unplacedBoxes.length, 1);
  assert.equal(result.utilization, 0.25);
  assert.equal(result.weightCapacityUsed, 0.2);
});
