const coForms = require('../data/co-forms.json');
const { findBestFtaRate } = require('./tariff-calculator');

/**
 * Gợi ý form C/O tối ưu nhất dựa trên HS code và các FTA mà lô hàng đủ điều kiện
 */
function recommendCoForm(hsCode, availableFtas = []) {
  const best = findBestFtaRate(hsCode, availableFtas);

  if (!best || best.scheme === 'mfn') {
    return {
      recommendation: 'Không có FTA nào lợi hơn thuế MFN, hoặc lô hàng chưa đủ điều kiện hưởng ưu đãi.',
      form: null,
    };
  }

  const formInfo = coForms[best.scheme];
  return {
    scheme: best.scheme,
    form: formInfo.form,
    agreement: formInfo.agreement,
    requirement: formInfo.requirement,
    dutyRate: best.rate,
  };
}

module.exports = { recommendCoForm };
