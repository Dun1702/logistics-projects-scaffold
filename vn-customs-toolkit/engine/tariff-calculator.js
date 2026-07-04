const tariffData = require('../data/tariff-schedules.json');

/**
 * Quy đổi giá trị FOB sang CIF nếu người dùng chỉ có FOB
 * CIF = FOB + Freight (cước vận chuyển) + Insurance (bảo hiểm)
 */
function fobToCif({ fob, freight = 0, insurance = 0 }) {
  return fob + freight + insurance;
}

/**
 * Nếu không có phí bảo hiểm cụ thể, ước tính theo công thức phổ biến
 * I = (FOB + F) * R / (1 - R), với R là tỷ lệ phí bảo hiểm (thường 0.15%-0.3%)
 */
function estimateInsurance({ fob, freight = 0, rate = 0.002 }) {
  return ((fob + freight) * rate) / (1 - rate);
}

/**
 * Tính thuế nhập khẩu = Trị giá tính thuế (CIF) x Thuế suất
 */
function calcImportDuty({ cifValue, dutyRate }) {
  return cifValue * dutyRate;
}

/**
 * Tính VAT nhập khẩu = (CIF + Thuế NK + Thuế TTĐB nếu có + Thuế BVMT nếu có) x Thuế suất VAT
 */
function calcVAT({ cifValue, importDuty, specialConsumptionTax = 0, environmentTax = 0, vatRate }) {
  const taxableBase = cifValue + importDuty + specialConsumptionTax + environmentTax;
  return taxableBase * vatRate;
}

/**
 * Tìm thuế suất ưu đãi tốt nhất trong số các FTA áp dụng được (đã có C/O hợp lệ)
 */
function findBestFtaRate(hsCode, availableFtas = []) {
  const entry = tariffData[hsCode];
  if (!entry) return null;

  let best = { scheme: 'mfn', rate: entry.mfn };
  for (const fta of availableFtas) {
    if (entry[fta] !== undefined && entry[fta] < best.rate) {
      best = { scheme: fta, rate: entry[fta] };
    }
  }
  return best;
}

/**
 * Hàm tổng hợp: tính toán đầy đủ nghĩa vụ thuế cho một lô hàng
 */
function calculateShipmentTax({
  hsCode,
  fob,
  freight = 0,
  insurance = null,
  quantity = 1,
  availableFtas = [],
  specialConsumptionTaxRate = 0,
  environmentTaxPerUnit = 0,
}) {
  const entry = tariffData[hsCode];
  if (!entry) {
    throw new Error(`Không tìm thấy HS code ${hsCode} trong biểu thuế. Vui lòng kiểm tra lại mã hoặc bổ sung dữ liệu.`);
  }

  const insuranceValue = insurance !== null ? insurance : estimateInsurance({ fob, freight });
  const cifValue = fobToCif({ fob, freight, insurance: insuranceValue });

  const bestRate = findBestFtaRate(hsCode, availableFtas);
  const importDuty = calcImportDuty({ cifValue, dutyRate: bestRate.rate });

  const specialConsumptionTax = specialConsumptionTaxRate > 0
    ? (cifValue + importDuty) * specialConsumptionTaxRate
    : 0;

  const environmentTax = environmentTaxPerUnit * quantity;

  const vat = calcVAT({
    cifValue,
    importDuty,
    specialConsumptionTax,
    environmentTax,
    vatRate: entry.vat_rate,
  });

  const totalTax = importDuty + specialConsumptionTax + environmentTax + vat;

  return {
    hsCode,
    description: entry.description,
    cifValue: round2(cifValue),
    insuranceUsed: round2(insuranceValue),
    dutyScheme: bestRate.scheme,
    dutyRate: bestRate.rate,
    importDuty: round2(importDuty),
    specialConsumptionTax: round2(specialConsumptionTax),
    environmentTax: round2(environmentTax),
    vatRate: entry.vat_rate,
    vat: round2(vat),
    totalTax: round2(totalTax),
    totalLandedCost: round2(cifValue + totalTax),
    // So sánh với MFN để thấy tiết kiệm được bao nhiêu nhờ FTA
    savingsVsMfn: round2((entry.mfn - bestRate.rate) * cifValue),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  fobToCif,
  estimateInsurance,
  calcImportDuty,
  calcVAT,
  findBestFtaRate,
  calculateShipmentTax,
};
