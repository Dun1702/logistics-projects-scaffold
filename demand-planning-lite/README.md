# Demand Planning Lite

Engine nhỏ cho supply chain planning: dự báo nhu cầu, tính safety stock, reorder point, target stock, và đề xuất số lượng đặt hàng.

## Use Cases

- SKU planning cho SME, retail, spare parts, kho thương mại điện tử.
- Demo thuật toán tồn kho dễ hiểu để đưa lên GitHub.
- Nền để mở rộng thành dashboard tồn kho, API reorder, hoặc connector Excel/ERP.

## Quick Start

```bash
npm test
npm run demo
```

## Supported Methods

- Moving average.
- Weighted moving average.
- Exponential smoothing.

## Notes

Demo này dùng lịch sử nhu cầu đơn giản. Khi triển khai thực tế cần xử lý seasonal demand, promotions, MOQ, lead-time variability, backorders, lost sales, substitution, và service-level policy theo từng nhóm SKU.
