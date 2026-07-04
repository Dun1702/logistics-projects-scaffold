# 3D Warehouse/Yard Simulator

Mô phỏng và tối ưu vị trí xếp container trong bãi (yard slotting).

## Đã có
- `src/algorithms/slotting.js` — thuật toán slotting: container xuất bãi sớm được
  ưu tiên vị trí gần lối ra/tier thấp, tránh xếp chồng gây reshuffle
- `src/scene/index.html` — visualizer 3D bằng Three.js (mở trực tiếp bằng trình
  duyệt, kéo chuột để xoay, cuộn để zoom)

## Chạy thử
```bash
# Test thuật toán
npm test

# Xem 3D scene — mở trực tiếp file này bằng trình duyệt
src/scene/index.html
```

## Test coverage hiện có
- Xếp container xuất muộn ở dưới, container xuất sớm ở trên
- Ước tính reshuffle theo thứ tự xuất bãi thực tế
- Báo container không xếp được khi bãi đầy
- Kiểm tra KPI capacity used

## Roadmap
1. Nối kết quả từ `planYardSlotting()` vào `scene/index.html` qua fetch API
   thay vì hard-code dữ liệu mẫu trong file HTML
2. Thêm animation xe nâng di chuyển container (dùng Three.js AnimationMixer
   hoặc tween thủ công theo thời gian)
3. Thêm KPI dashboard: tổng thời gian lấy hàng ước tính, số lần reshuffle,
   tỷ lệ lấp đầy bãi theo block
4. So sánh nhiều chiến lược slotting khác nhau (vd. random vs heuristic hiện tại)
   và xuất báo cáo so sánh — đây là phần sẽ làm nổi bật thuật toán trong README
