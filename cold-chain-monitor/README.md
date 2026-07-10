# Cold Chain Monitor

Engine phân tích dữ liệu cảm biến nhiệt độ/độ ẩm cho cold-chain. Project phù hợp cho dược phẩm, thực phẩm, vaccine, hàng đông lạnh, hoa tươi, và các shipment cần kiểm soát điều kiện bảo quản.

## Use Cases

- Phát hiện excursion ngoài ngưỡng nhiệt độ/độ ẩm.
- Tính tổng thời gian ngoài ngưỡng và excursion liên tục dài nhất.
- Gắn cờ khoảng mất tín hiệu cảm biến.
- Sinh summary để nối với dashboard chất lượng hoặc báo cáo claim.

## Quick Start

```bash
npm test
npm run demo
```

## Profile Example

```js
const profile = {
  minTempC: 2,
  maxTempC: 8,
  maxContinuousMinutesOutOfRange: 30,
  stabilityBudgetMinutes: 120,
  maxGapMinutes: 45,
};
```

## Notes

Đây là analyzer demo, không thay thế thẩm định GDP/GSP, SOP chất lượng, thiết bị đã hiệu chuẩn, hoặc đánh giá ổn định sản phẩm.
