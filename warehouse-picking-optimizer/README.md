# Warehouse Picking Optimizer

Project tối ưu picking trong kho: gom đơn thành pick wave, tổng hợp SKU cần lấy, sắp xếp tuyến đi bằng nearest-neighbor, và ước tính thời gian lao động.

## Use Cases

- Kho e-commerce, retail, spare parts, FMCG.
- Demo logic WMS căn bản: wave planning, pick path, missing SKU.
- Có thể mở rộng thành UI sơ đồ kho, API nhận đơn hàng, hoặc dashboard năng suất.

## Quick Start

```bash
npm test
npm run demo
```

## Model

- `warehouse.locations`: tọa độ SKU trong kho.
- `orders`: danh sách đơn và dòng SKU.
- `options.maxOrdersPerWave`: giới hạn số đơn trong một wave.
- `options.maxLinesPerWave`: giới hạn số dòng pick trong một wave.

## Notes

Thuật toán route là nearest-neighbor theo khoảng cách Manhattan, phù hợp demo và kho layout lưới. Khi triển khai thực tế cần bổ sung one-way aisle, congestion, replenishment, batch/zone picking, và worker/device constraints.
