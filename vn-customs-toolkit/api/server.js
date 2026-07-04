const express = require('express');
const cors = require('cors');
const { calculateShipmentTax } = require('../engine/tariff-calculator');
const { recommendCoForm } = require('../engine/fta-matcher');
const tariffData = require('../data/tariff-schedules.json');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '../web')));

// GET danh sách HS code có trong hệ thống (để autocomplete)
app.get('/api/hs-codes', (req, res) => {
  const list = Object.entries(tariffData).map(([code, data]) => ({
    code,
    description: data.description,
  }));
  res.json(list);
});

// POST tính thuế cho một lô hàng
app.post('/api/calculate', (req, res) => {
  try {
    const result = calculateShipmentTax(req.body);
    const coRecommendation = recommendCoForm(req.body.hsCode, req.body.availableFtas || []);
    res.json({ ...result, coRecommendation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VN Customs Toolkit API đang chạy tại http://localhost:${PORT}`);
});
