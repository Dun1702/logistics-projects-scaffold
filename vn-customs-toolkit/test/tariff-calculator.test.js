const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateShipmentTax,
  findBestFtaRate,
} = require('../engine/tariff-calculator');

test('finds the best available FTA rate', () => {
  const best = findBestFtaRate('8703.23.99', ['evfta', 'akfta']);

  assert.deepEqual(best, { scheme: 'akfta', rate: 0.5 });
});

test('calculates landed cost with explicit insurance', () => {
  const result = calculateShipmentTax({
    hsCode: '8517.12.00',
    fob: 1000,
    freight: 100,
    insurance: 20,
    availableFtas: ['vjepa'],
  });

  assert.equal(result.cifValue, 1120);
  assert.equal(result.dutyScheme, 'vjepa');
  assert.equal(result.importDuty, 0);
  assert.equal(result.vat, 112);
  assert.equal(result.totalLandedCost, 1232);
});

test('throws on unknown HS code', () => {
  assert.throws(() => {
    calculateShipmentTax({ hsCode: '0000.00.00', fob: 100 });
  }, /Không tìm thấy HS code/);
});
