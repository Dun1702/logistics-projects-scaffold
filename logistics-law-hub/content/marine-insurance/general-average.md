# Tổn thất chung (General Average) trong Bảo hiểm Hàng hải

## Định nghĩa
Tổn thất chung là hy sinh hoặc chi phí bất thường, được thực hiện một cách cố ý và
hợp lý, vì sự an toàn chung của tàu và hàng hóa trong một hành trình chung trên biển.

## Nguyên tắc phân bổ
Tổn thất chung được phân bổ theo tỷ lệ **giá trị đóng góp** (Contributory Value - CV)
của từng bên có quyền lợi trong hành trình:

```
Tỷ lệ đóng góp = Tổng tổn thất chung / Tổng giá trị đóng góp
Số tiền mỗi bên đóng góp = CV của bên đó × Tỷ lệ đóng góp
```

## Lưu ý quan trọng khi tính Contributory Value
- **Giá trị tàu (Ship's CV)**: dùng giá trị thực tế (sound value) của tàu **tại cảng đến**,
  cộng thêm phần giá trị đã bị hy sinh trong sự cố GA (nếu tàu bị hư hại do hành động GA).
  ⚠️ Sai lầm thường gặp: dùng giá trị tàu tại thời điểm khởi hành thay vì tại cảng đến.
- **Giá trị hàng hóa (Cargo CV)**: dùng giá trị CIF tại cảng đến, cộng phần đã hy sinh
  nếu hàng đó bị ném xuống biển hoặc hư hỏng do hành động GA.
- Hàng hóa không khai báo hoặc chở trên boong không đúng quy định thường **không được
  tính vào CV** và cũng không được bồi thường nếu bị hy sinh.

## Bài tập tương tác
Dùng công cụ tính bên dưới để nhập giá trị tàu, hàng hóa và tổn thất chung, hệ thống
sẽ tự động tính tỷ lệ đóng góp của từng bên.

<GACalculator />
