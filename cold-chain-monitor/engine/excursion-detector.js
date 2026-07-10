function analyzeColdChain({ shipmentId, profile, readings }) {
  const ordered = [...readings]
    .map(reading => ({ ...reading, time: new Date(reading.timestamp).getTime() }))
    .sort((a, b) => a.time - b.time);

  if (ordered.length === 0) {
    return emptyResult(shipmentId);
  }

  const intervals = buildIntervals(ordered);
  const temperatureExcursions = detectExcursions({
    intervals,
    field: 'tempC',
    min: profile.minTempC,
    max: profile.maxTempC,
  });
  const humidityExcursions = detectExcursions({
    intervals,
    field: 'humidityPct',
    min: profile.minHumidityPct,
    max: profile.maxHumidityPct,
  });
  const gaps = detectGaps(ordered, profile.maxGapMinutes);
  const excursions = [...temperatureExcursions, ...humidityExcursions];

  const totalOutOfRangeMinutes = round2(excursions.reduce((sum, excursion) => sum + excursion.durationMinutes, 0));
  const longestExcursionMinutes = round2(excursions.reduce((max, excursion) => Math.max(max, excursion.durationMinutes), 0));
  const twaTempC = calculateTimeWeightedAverage({ intervals, field: 'tempC' });

  const status = classifyStatus({
    totalOutOfRangeMinutes,
    longestExcursionMinutes,
    gapCount: gaps.length,
    profile,
  });

  return {
    shipmentId,
    readingCount: ordered.length,
    window: {
      start: new Date(ordered[0].time).toISOString(),
      end: new Date(ordered[ordered.length - 1].time).toISOString(),
    },
    status,
    summary: {
      totalOutOfRangeMinutes,
      longestExcursionMinutes,
      excursionCount: excursions.length,
      gapCount: gaps.length,
      timeWeightedAverageTempC: twaTempC,
    },
    excursions,
    gaps,
  };
}

function detectExcursions({ intervals, field, min, max }) {
  if (min === undefined && max === undefined) return [];

  const excursions = [];
  let current = null;

  for (const interval of intervals) {
    const value = interval.reading[field];
    if (value === undefined || value === null) {
      current = closeExcursion(current, interval.start, excursions);
      continue;
    }

    const direction = classifyDirection(value, min, max);
    if (!direction) {
      current = closeExcursion(current, interval.start, excursions);
      continue;
    }

    if (!current || current.direction !== direction || current.field !== field) {
      current = closeExcursion(current, interval.start, excursions);
      current = {
        field,
        direction,
        start: interval.start,
        end: interval.end,
        durationMinutes: 0,
        peakValue: value,
        maxDeviation: deviation(value, min, max, direction),
      };
    }

    current.end = interval.end;
    current.durationMinutes += interval.minutes;
    current.peakValue = direction === 'high'
      ? Math.max(current.peakValue, value)
      : Math.min(current.peakValue, value);
    current.maxDeviation = Math.max(current.maxDeviation, deviation(value, min, max, direction));
  }

  closeExcursion(current, intervals.at(-1)?.end, excursions);

  return excursions.map(excursion => ({
    ...excursion,
    start: new Date(excursion.start).toISOString(),
    end: new Date(excursion.end).toISOString(),
    durationMinutes: round2(excursion.durationMinutes),
    maxDeviation: round2(excursion.maxDeviation),
  }));
}

function buildIntervals(ordered) {
  if (ordered.length === 1) {
    return [{
      start: ordered[0].time,
      end: ordered[0].time,
      minutes: 0,
      reading: ordered[0],
    }];
  }

  return ordered.slice(0, -1).map((reading, index) => {
    const next = ordered[index + 1];
    return {
      start: reading.time,
      end: next.time,
      minutes: (next.time - reading.time) / 60000,
      reading,
    };
  });
}

function detectGaps(ordered, maxGapMinutes) {
  if (!maxGapMinutes) return [];
  const gaps = [];

  for (let index = 0; index < ordered.length - 1; index++) {
    const current = ordered[index];
    const next = ordered[index + 1];
    const minutes = (next.time - current.time) / 60000;

    if (minutes > maxGapMinutes) {
      gaps.push({
        start: new Date(current.time).toISOString(),
        end: new Date(next.time).toISOString(),
        durationMinutes: round2(minutes),
      });
    }
  }

  return gaps;
}

function calculateTimeWeightedAverage({ intervals, field }) {
  const totals = intervals.reduce((acc, interval) => {
    const value = interval.reading[field];
    if (value === undefined || value === null) return acc;
    acc.weighted += value * interval.minutes;
    acc.minutes += interval.minutes;
    return acc;
  }, { weighted: 0, minutes: 0 });

  if (totals.minutes === 0) return null;
  return round2(totals.weighted / totals.minutes);
}

function classifyStatus({
  totalOutOfRangeMinutes,
  longestExcursionMinutes,
  gapCount,
  profile,
}) {
  if (gapCount > 0) return 'review';
  if (longestExcursionMinutes > (profile.maxContinuousMinutesOutOfRange ?? Infinity)) return 'fail';
  if (totalOutOfRangeMinutes > (profile.stabilityBudgetMinutes ?? Infinity)) return 'fail';
  if (totalOutOfRangeMinutes > 0) return 'warning';
  return 'pass';
}

function classifyDirection(value, min, max) {
  if (min !== undefined && value < min) return 'low';
  if (max !== undefined && value > max) return 'high';
  return null;
}

function deviation(value, min, max, direction) {
  return direction === 'high' ? value - max : min - value;
}

function closeExcursion(current, fallbackEnd, excursions) {
  if (current) {
    current.end = current.end ?? fallbackEnd;
    excursions.push(current);
  }
  return null;
}

function emptyResult(shipmentId) {
  return {
    shipmentId,
    readingCount: 0,
    window: null,
    status: 'no-data',
    summary: {
      totalOutOfRangeMinutes: 0,
      longestExcursionMinutes: 0,
      excursionCount: 0,
      gapCount: 0,
      timeWeightedAverageTempC: null,
    },
    excursions: [],
    gaps: [],
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = {
  analyzeColdChain,
  calculateTimeWeightedAverage,
};
