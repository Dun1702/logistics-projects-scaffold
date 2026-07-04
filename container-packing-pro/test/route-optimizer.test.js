const test = require('node:test');
const assert = require('node:assert/strict');
const { haversineDistance, optimizeRoute } = require('../packages/route-optimizer');

test('calculates real-world distance between two coordinates', () => {
  const distance = haversineDistance(
    { lat: 10.8231, lng: 106.6297 },
    { lat: 21.0278, lng: 105.8342 }
  );

  assert.ok(distance > 1100);
  assert.ok(distance < 1200);
});

test('optimizes a single-vehicle delivery order', () => {
  const result = optimizeRoute([
    { id: 'depot', lat: 10.8231, lng: 106.6297 },
    { id: 'cat-lai', lat: 10.7694, lng: 106.7871 },
    { id: 'tan-son-nhat', lat: 10.8188, lng: 106.6519 },
    { id: 'song-than', lat: 10.9037, lng: 106.7131 },
  ]);

  assert.equal(result.order[0], 'depot');
  assert.equal(new Set(result.order).size, 4);
  assert.ok(result.totalDistanceKm > 0);
  assert.ok(result.totalDistanceKm <= result.initialDistanceKm);
});
