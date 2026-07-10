const { auditFreightInvoice } = require('../engine/rate-auditor');

const rateCard = {
  currency: 'USD',
  taxRate: 0.08,
  baseRates: [
    {
      laneId: 'HCM-HN',
      serviceLevel: 'standard',
      minCharge: 120,
      ratePerKg: 0.42,
      fuelSurchargePct: 0.12,
    },
  ],
  accessorials: {
    liftgate: 35,
    residential: 18,
  },
};

const shipments = [
  {
    id: 'SHP-1001',
    laneId: 'HCM-HN',
    serviceLevel: 'standard',
    billableWeightKg: 400,
    accessorials: ['liftgate'],
  },
];

const invoiceLines = [
  { shipmentId: 'SHP-1001', type: 'base', amount: 168 },
  { shipmentId: 'SHP-1001', type: 'fuel', amount: 20.16 },
  { shipmentId: 'SHP-1001', type: 'accessorial', code: 'liftgate', amount: 45 },
  { shipmentId: 'SHP-1001', type: 'tax', amount: 17.85 },
];

console.log(JSON.stringify(auditFreightInvoice({ rateCard, shipments, invoiceLines }), null, 2));
