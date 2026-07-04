/**
 * Tính toán General Average (Tổn thất chung) theo York-Antwerp Rules
 *
 * Nguyên tắc: Tổn thất chung được phân bổ theo tỷ lệ giữa các bên
 * có quyền lợi trong hành trình (tàu, hàng, cước phí) dựa trên
 * "contributory value" (giá trị đóng góp) của từng bên tại thời điểm
 * kết thúc hành trình an toàn.
 *
 * Contribution Rate = Tổng tổn thất chung (GA Loss) / Tổng giá trị đóng góp (CV)
 * Số tiền mỗi bên đóng góp = CV của bên đó x Contribution Rate
 */
function calculateGeneralAverage({ gaLoss, contributoryValues }) {
  // contributoryValues: [{ party: 'Ship', value: 500000 }, { party: 'Cargo A', value: 200000 }, ...]
  const totalCV = contributoryValues.reduce((sum, p) => sum + p.value, 0);

  if (totalCV <= 0) {
    throw new Error('Tổng giá trị đóng góp (contributory value) phải lớn hơn 0');
  }

  const contributionRate = gaLoss / totalCV;

  const contributions = contributoryValues.map(p => ({
    party: p.party,
    contributoryValue: p.value,
    shareOfTotal: round4(p.value / totalCV),
    contribution: round2(p.value * contributionRate),
  }));

  return {
    gaLoss: round2(gaLoss),
    totalContributoryValue: round2(totalCV),
    contributionRate: round4(contributionRate),
    contributions,
    // Kiểm tra: tổng các khoản đóng góp phải bằng gaLoss
    checksum: round2(contributions.reduce((s, c) => s + c.contribution, 0)),
  };
}

/**
 * Tính giá trị đóng góp của tàu (Ship's Contributory Value)
 * = Giá trị tàu tại cảng đến (sound value) sau khi cộng lại phần đã hy sinh (nếu có)
 */
function calcShipContributoryValue({ soundValueAtDestination, gaSacrificeToShip = 0 }) {
  return soundValueAtDestination + gaSacrificeToShip;
}

/**
 * Tính giá trị đóng góp của hàng hóa
 * = Giá trị CIF tại cảng đến + phần đã hy sinh (nếu hàng đó bị ném xuống biển)
 * - Không tính hàng không tham gia hành trình chung (on-deck cargo không khai báo, hành lý...)
 */
function calcCargoContributoryValue({ cifValueAtDestination, gaSacrificeToCargo = 0 }) {
  return cifValueAtDestination + gaSacrificeToCargo;
}

function round2(n) { return Math.round(n * 100) / 100; }
function round4(n) { return Math.round(n * 10000) / 10000; }

module.exports = {
  calculateGeneralAverage,
  calcShipContributoryValue,
  calcCargoContributoryValue,
};
