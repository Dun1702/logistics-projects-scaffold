const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendCoForm } = require('../engine/fta-matcher');

test('recommends certificate of origin form for the best FTA', () => {
  const recommendation = recommendCoForm('1006.30.90', ['vjepa', 'acfta']);

  assert.equal(recommendation.scheme, 'acfta');
  assert.equal(recommendation.form, 'E');
  assert.equal(recommendation.dutyRate, 0);
});

test('returns no form when MFN is already best', () => {
  const recommendation = recommendCoForm('8471.30.90', ['evfta']);

  assert.equal(recommendation.form, null);
  assert.match(recommendation.recommendation, /Không có FTA/);
});
