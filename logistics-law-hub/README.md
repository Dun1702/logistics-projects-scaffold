# Logistics & Trade Law Learning Hub

Nền tảng học tập mở cho sinh viên ngành logistics/luật thương mại — biến tài liệu
học tập (slide, essay, bài tập) thành bài học có cấu trúc + công cụ tính toán tương tác.

## Đã có
- `engine/general-average.js` — engine tính phân bổ Tổn thất chung (GA), đã test
  đúng công thức York-Antwerp Rules (checksum tổng đóng góp = tổng GA loss)
- `content/marine-insurance/general-average.md` — bài học mẫu kèm chú thích sai lầm
  thường gặp khi tính contributory value
- `components/GACalculator.html` — widget tính toán tương tác, mở trực tiếp bằng
  trình duyệt để test (không cần build)

## Cách mở rộng
1. Chuyển các slide PPT (vd. Chapter 6 Civil Code 2015) và essay cold chain đã có
   thành file `.md` trong `content/` theo từng chủ đề
2. Tái sử dụng `vn-customs-toolkit/engine/tariff-calculator.js` cho phần bài học
   về thuế nhập khẩu (tránh viết lại logic)
3. Dựng khung Next.js thật để render MDX + component React thay vì HTML tĩnh
4. Thêm `QuizEngine` — có thể bắt đầu bằng JSON câu hỏi đơn giản + chấm điểm client-side

## Chạy thử calculator ngay
Mở trực tiếp `components/GACalculator.html` bằng trình duyệt — không cần server.

## Chạy test

```bash
npm test
```

Test hiện kiểm tra engine phân bổ Tổn thất chung, contributory value, checksum tổng đóng góp, và lỗi dữ liệu không hợp lệ.
