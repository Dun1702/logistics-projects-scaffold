const { analyzeColdChain } = require('../engine/excursion-detector');

const profile = {
  minTempC: 2,
  maxTempC: 8,
  minHumidityPct: 30,
  maxHumidityPct: 70,
  maxContinuousMinutesOutOfRange: 30,
  stabilityBudgetMinutes: 90,
  maxGapMinutes: 60,
};

const readings = [
  { timestamp: '2026-07-10T00:00:00Z', tempC: 5, humidityPct: 55 },
  { timestamp: '2026-07-10T00:15:00Z', tempC: 6, humidityPct: 54 },
  { timestamp: '2026-07-10T00:30:00Z', tempC: 10, humidityPct: 52 },
  { timestamp: '2026-07-10T01:00:00Z', tempC: 9, humidityPct: 50 },
  { timestamp: '2026-07-10T01:15:00Z', tempC: 6, humidityPct: 48 },
];

console.log(JSON.stringify(analyzeColdChain({ shipmentId: 'CC-2026-001', profile, readings }), null, 2));
