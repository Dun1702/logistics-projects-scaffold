function planPicking({ warehouse, orders, options = {} }) {
  const settings = {
    maxOrdersPerWave: 4,
    maxLinesPerWave: 30,
    metersPerMinute: 55,
    pickSecondsPerLine: 18,
    ...options,
  };

  const sortedOrders = [...orders].sort(orderSort);
  const waves = [];

  for (const order of sortedOrders) {
    const orderStats = summarizeOrder(order, warehouse);
    let selectedWave = null;
    let selectedScore = -Infinity;

    for (const wave of waves) {
      if (!canFitWave(wave, orderStats, settings)) continue;
      const score = zoneOverlapScore(wave.zones, orderStats.zones);
      if (score > selectedScore) {
        selectedWave = wave;
        selectedScore = score;
      }
    }

    if (!selectedWave) {
      selectedWave = createWave(waves.length + 1);
      waves.push(selectedWave);
    }

    selectedWave.orders.push(order);
    selectedWave.lineCount += orderStats.lineCount;
    for (const zone of orderStats.zones) selectedWave.zones.add(zone);
  }

  return {
    waveCount: waves.length,
    waves: waves.map(wave => buildWavePlan({ wave, warehouse, settings })),
  };
}

function buildWavePlan({ wave, warehouse, settings }) {
  const aggregated = aggregateWaveLines(wave.orders, warehouse);
  const route = routeStops({
    depot: warehouse.depot ?? { x: 0, y: 0 },
    stops: aggregated.stops,
  });

  const pickMinutes = aggregated.stops.length * settings.pickSecondsPerLine / 60;
  const travelMinutes = route.distance / settings.metersPerMinute;

  return {
    waveId: wave.id,
    orderIds: wave.orders.map(order => order.id),
    zones: [...wave.zones].sort(),
    missingSkus: aggregated.missingSkus,
    stops: route.stops,
    routeDistanceMeters: round2(route.distance),
    estimatedLaborMinutes: round2(pickMinutes + travelMinutes),
    units: aggregated.stops.reduce((sum, stop) => sum + stop.quantity, 0),
  };
}

function routeStops({ depot, stops }) {
  const remaining = stops.map(stop => ({ ...stop }));
  const ordered = [];
  let current = depot;
  let distance = 0;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;

    for (let index = 0; index < remaining.length; index++) {
      const candidateDistance = manhattan(current, remaining[index]);
      if (candidateDistance < bestDistance) {
        bestDistance = candidateDistance;
        bestIndex = index;
      }
    }

    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    distance += bestDistance;
    current = next;
  }

  distance += manhattan(current, depot);

  return { stops: ordered, distance };
}

function aggregateWaveLines(orders, warehouse) {
  const bySku = new Map();
  const missingSkus = [];

  for (const order of orders) {
    for (const line of order.lines) {
      const location = warehouse.locations[line.sku];
      if (!location) {
        missingSkus.push({ orderId: order.id, sku: line.sku, quantity: line.quantity });
        continue;
      }

      const current = bySku.get(line.sku) ?? {
        sku: line.sku,
        quantity: 0,
        x: location.x,
        y: location.y,
        zone: location.zone ?? 'unassigned',
        orders: [],
      };

      current.quantity += line.quantity;
      current.orders.push(order.id);
      bySku.set(line.sku, current);
    }
  }

  return {
    stops: [...bySku.values()].sort((a, b) => a.zone.localeCompare(b.zone) || a.sku.localeCompare(b.sku)),
    missingSkus,
  };
}

function summarizeOrder(order, warehouse) {
  const zones = new Set();
  let lineCount = 0;

  for (const line of order.lines) {
    lineCount += 1;
    const location = warehouse.locations[line.sku];
    if (location) zones.add(location.zone ?? 'unassigned');
  }

  return { lineCount, zones };
}

function createWave(index) {
  return {
    id: `WAVE-${String(index).padStart(3, '0')}`,
    orders: [],
    lineCount: 0,
    zones: new Set(),
  };
}

function canFitWave(wave, orderStats, settings) {
  return wave.orders.length < settings.maxOrdersPerWave &&
    wave.lineCount + orderStats.lineCount <= settings.maxLinesPerWave;
}

function zoneOverlapScore(waveZones, orderZones) {
  if (waveZones.size === 0 || orderZones.size === 0) return 0;
  let overlap = 0;
  for (const zone of orderZones) {
    if (waveZones.has(zone)) overlap += 1;
  }
  return overlap / new Set([...waveZones, ...orderZones]).size;
}

function orderSort(a, b) {
  const priorityA = a.priority ?? 0;
  const priorityB = b.priority ?? 0;
  if (priorityA !== priorityB) return priorityB - priorityA;
  return String(a.dueAt ?? '').localeCompare(String(b.dueAt ?? ''));
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = {
  planPicking,
  routeStops,
};
