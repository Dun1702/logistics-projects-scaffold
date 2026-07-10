# Freight Cost Auditor

Engine kiểm tra hóa đơn cước vận tải theo rate card: base freight, fuel surcharge, phụ phí accessorial, tax, và tổng tiền.

## Use Cases

- Audit hóa đơn carrier/3PL trước khi thanh toán.
- Phát hiện overbilling theo lane, service level, phụ phí, fuel.
- Chuẩn hóa dữ liệu để sau này nối với TMS/ERP.
- Demo tốt cho GitHub vì có logic tài chính rõ ràng, input/output nhỏ, dễ test.

## Quick Start

```bash
npm test
npm run demo
```

## Example

```js
const { auditFreightInvoice } = require('./engine/rate-auditor');

const result = auditFreightInvoice({
  rateCard,
  shipments,
  invoiceLines,
});

console.log(result.summary);
```

## Input Model

- `rateCard.baseRates`: lane + service + min charge + rate/kg + fuel surcharge.
- `rateCard.accessorials`: bảng phụ phí như `liftgate`, `residential`, `remote_area`.
- `shipments`: từng shipment cần audit.
- `invoiceLines`: dòng hóa đơn thực tế từ carrier.

## Notes

Rate card trong demo là dữ liệu giả lập. Khi dùng thực tế cần đối chiếu hợp đồng carrier, currency, tax rules, fuel table, và điều kiện áp dụng phụ phí.
