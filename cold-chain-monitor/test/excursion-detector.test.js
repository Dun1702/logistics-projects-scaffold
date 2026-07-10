const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeColdChain, calculateTimeWeightedAverage } = require('../engine/excursion-detector');

test('detects temperature excursions and classifies warning', () => {
  const result = analyzeColdChain({
    shipmentId: 'S1',
    profile: {
      minTempC: 2,
      maxTempC: 8,
      maxContinuousMinutesOutOfRange: 45,
      stabilityBudgetMinutes: 120,
    },
    readings: [
      { timestamp: '2026-07-10T00:00:00Z', tempC: 5 },
      { timestamp: '2026-07-10T00:30:00Z', tempC: 9 },
      { timestamp: '2026-07-10T01:00:00Z', tempC: 6 },
    ],
  });

  assert.equal(result.status, 'warning');
  assert.equal(result.summary.totalOutOfRangeMinutes, 30);
  assert.equal(result.excursions[0].direction, 'high');
});

test('fails when a continuous excursion exceeds the allowed limit', () => {
  const result = analyzeColdChain({
    shipmentId: 'S1',
    profile: {
      minTempC: 2,
      maxTempC: 8,
      maxContinuousMinutesOutOfRange: 20,
      stabilityBudgetMinutes: 120,
    },
    readings: [
      { timestamp: '2026-07-10T00:00:00Z', tempC: 9 },
      { timestamp: '2026-07-10T00:30:00Z', tempC: 10 },
      { timestamp: '2026-07-10T01:00:00Z', tempC: 6 },
    ],
  });

  assert.equal(result.status, 'fail');
  assert.equal(result.summary.longestExcursionMinutes, 60);
});

test('reports sensor gaps for quality review', () => {
  const result = analyzeColdChain({
    shipmentId: 'S1',
    profile: {
      minTempC: 2,
      maxTempC: 8,
      maxGapMinutes: 30,
    },
    readings: [
      { timestamp: '2026-07-10T00:00:00Z', tempC: 5 },
      { timestamp: '2026-07-10T01:00:00Z', tempC: 5 },
    ],
  });

  assert.equal(result.status, 'review');
  assert.equal(result.gaps[0].durationMinutes, 60);
});

test('calculates time-weighted average from intervals', () => {
  const average = calculateTimeWeightedAverage({
    field: 'tempC',
    intervals: [
      { minutes: 10, reading: { tempC: 4 } },
      { minutes: 20, reading: { tempC: 10 } },
    ],
  });

  assert.equal(average, 8);
});
