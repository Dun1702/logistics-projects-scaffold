const { planPicking } = require('../engine/pick-planner');

const warehouse = {
  depot: { x: 0, y: 0 },
  locations: {
    SKU_A: { x: 4, y: 2, zone: 'A' },
    SKU_B: { x: 7, y: 2, zone: 'A' },
    SKU_C: { x: 2, y: 9, zone: 'B' },
    SKU_D: { x: 8, y: 10, zone: 'C' },
  },
};

const orders = [
  { id: 'ORD-1', priority: 2, dueAt: '2026-07-11T09:00:00Z', lines: [{ sku: 'SKU_A', quantity: 2 }, { sku: 'SKU_B', quantity: 1 }] },
  { id: 'ORD-2', priority: 1, dueAt: '2026-07-11T10:00:00Z', lines: [{ sku: 'SKU_C', quantity: 3 }] },
  { id: 'ORD-3', priority: 1, dueAt: '2026-07-11T11:00:00Z', lines: [{ sku: 'SKU_A', quantity: 1 }, { sku: 'SKU_D', quantity: 1 }] },
];

console.log(JSON.stringify(planPicking({ warehouse, orders, options: { maxOrdersPerWave: 2 } }), null, 2));
