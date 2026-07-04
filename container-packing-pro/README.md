# Container Packing Pro 2.0

Nâng cấp từ project 3D packing gốc: thêm route optimization đa điểm dừng.

## Đã có
- `packages/packing-engine/index.js` — 3D bin packing (First-Fit-Decreasing + guillotine
  split), có ràng buộc trọng lượng và thứ tự dỡ hàng (`unloadPriority`)
- `packages/route-optimizer/index.js` — tối ưu lộ trình giao hàng đa điểm dừng
  (Nearest Neighbor + 2-opt), dùng khoảng cách Haversine

## Chạy test
```bash
npm test
```

Test hiện kiểm tra ràng buộc trọng lượng container, utilization/capacity, khoảng cách Haversine, và route optimizer không làm route tệ hơn route khởi tạo.

## Roadmap
1. Ghép `packing-engine` với 3D visualizer Three.js đã có sẵn ở project gốc
   (`Container Packing Pro`) — hiện engine này độc lập, chưa nối UI
2. Tích hợp bản đồ thật (Mapbox/Leaflet) để hiển thị route đã tối ưu
3. `route-optimizer` hiện chỉ hỗ trợ 1 xe — muốn thành VRP đa xe cần thêm ràng buộc
   tải trọng/số điểm mỗi xe, độ phức tạp tăng đáng kể, nên cân nhắc OR-Tools
   (Python) cho bài toán quy mô lớn thay vì thuần JS
4. Viết API Express để expose 2 package này, theo mẫu của `vn-customs-toolkit/api/server.js`
