# VN Customs & Tariff Toolkit

Công cụ tra cứu HS code và tính thuế nhập khẩu Việt Nam, hỗ trợ so sánh MFN và các FTA (VJEPA, AKFTA, ACFTA, EVFTA).

## Chạy thử
```bash
npm install
npm test
npm start
# mở http://localhost:3000
```

## Kiến trúc
- `data/` — biểu thuế mẫu (6 HS code demo), dữ liệu form C/O theo từng FTA
- `engine/tariff-calculator.js` — lõi tính CIF, thuế NK, VAT, tự động chọn FTA lợi nhất
- `engine/fta-matcher.js` — gợi ý form C/O phù hợp
- `api/server.js` — Express API (`GET /api/hs-codes`, `POST /api/calculate`)
- `web/index.html` — giao diện test nhanh

## Test coverage hiện có
- Chọn thuế suất FTA tốt nhất
- Tính CIF, thuế nhập khẩu, VAT, landed cost
- Gợi ý form C/O theo FTA tốt nhất
- Kiểm tra lỗi HS code không có trong dữ liệu demo

## Roadmap thật
1. **Mở rộng dữ liệu**: hiện chỉ có 6 HS code demo. Cần nhập đầy đủ biểu thuế từ
   Biểu thuế xuất nhập khẩu ưu đãi hiện hành (Nghị định của Chính phủ) — có thể
   viết script parse từ file Excel/PDF công khai của Tổng cục Hải quan.
2. **OCR tờ khai hải quan**: dùng Tesseract hoặc Google Vision API để tự động đọc
   invoice/packing list, trích xuất HS code + trị giá.
3. **Validation quy tắc xuất xứ (ROO)**: hiện tại chỉ so sánh thuế suất, chưa kiểm
   tra điều kiện RVC/CTC thực tế của từng lô hàng.
4. Mở rộng test cho API Express và các rule xuất xứ phức tạp.

## Lưu ý quan trọng
Số liệu thuế suất trong `data/tariff-schedules.json` là **dữ liệu mẫu để demo**,
không phải biểu thuế chính thức — cần đối chiếu với văn bản pháp luật hiện hành
trước khi dùng cho mục đích thực tế.
