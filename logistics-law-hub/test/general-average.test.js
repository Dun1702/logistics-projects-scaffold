const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateGeneralAverage,
  calcCargoContributoryValue,
  calcShipContributoryValue,
} = require('../engine/general-average');

test('allocates general average contribution by contributory value', () => {
  const result = calculateGeneralAverage({
    gaLoss: 100000,
    contributoryValues: [
      { party: 'Ship', value: 500000 },
      { party: 'Cargo A', value: 300000 },
      { party: 'Cargo B', value: 200000 },
    ],
  });

  assert.equal(result.totalContributoryValue, 1000000);
  assert.equal(result.contributionRate, 0.1);
  assert.equal(result.checksum, 100000);
  assert.equal(result.contributions.find(item => item.party === 'Cargo A').contribution, 30000);
});

test('calculates ship and cargo contributory values', () => {
  assert.equal(calcShipContributoryValue({ soundValueAtDestination: 900000, gaSacrificeToShip: 50000 }), 950000);
  assert.equal(calcCargoContributoryValue({ cifValueAtDestination: 120000, gaSacrificeToCargo: 10000 }), 130000);
});

test('rejects invalid total contributory value', () => {
  assert.throws(() => {
    calculateGeneralAverage({
      gaLoss: 1000,
      contributoryValues: [{ party: 'Cargo', value: 0 }],
    });
  }, /phải lớn hơn 0/);
});
