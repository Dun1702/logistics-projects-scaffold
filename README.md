# Logistics Projects Scaffold

[![CI](https://github.com/Dun1702/logistics-projects-scaffold/actions/workflows/ci.yml/badge.svg)](https://github.com/Dun1702/logistics-projects-scaffold/actions/workflows/ci.yml)

Một monorepo các dự án logistics có tính ứng dụng cao: tối ưu đóng container, tính thuế nhập khẩu Việt Nam, học luật hàng hải/thương mại, mô phỏng bãi container 3D, audit cước vận tải, tối ưu picking kho, giám sát cold-chain, và lập kế hoạch tồn kho.

## One-Click Web Hub

Mở trực tiếp bộ app tại:

[https://dun1702.github.io/logistics-projects-scaffold/](https://dun1702.github.io/logistics-projects-scaffold/)

Khi push lên `main`, workflow `Pages` sẽ publish bản static web. Ở local có thể mở file `index.html` bằng trình duyệt.

Local preview:

```bash
npm run serve
```

Then open `http://127.0.0.1:4173`.

## Project Map

| Project | Use case | Current signal |
| --- | --- | --- |
| [container-packing-pro](./container-packing-pro) | Tối ưu xếp hàng container + lộ trình giao đa điểm | Browser app, packing engine, route optimizer, tests |
| [vn-customs-toolkit](./vn-customs-toolkit) | Tra cứu HS demo, tính thuế NK/VAT, gợi ý C/O FTA | Static browser app, optional Express API, tariff engine, tests |
| [logistics-law-hub](./logistics-law-hub) | Học logistics và luật thương mại bằng nội dung + calculator | General Average engine, lesson, static widget, tests |
| [yard-simulator](./yard-simulator) | Mô phỏng xếp bãi container và KPI reshuffle | Slotting heuristic, Three.js scene, tests |
| [freight-cost-auditor](./freight-cost-auditor) | Kiểm tra hóa đơn cước theo rate card, phụ phí, fuel, tax | Browser app, audit engine, chargeable weight helper, demo, tests |
| [warehouse-picking-optimizer](./warehouse-picking-optimizer) | Gom đơn thành pick wave và tối ưu lộ trình picking trong kho | Browser app, wave planner, nearest-neighbor route, labor estimate, demo, tests |
| [cold-chain-monitor](./cold-chain-monitor) | Phát hiện excursion nhiệt độ/độ ẩm cho hàng lạnh, dược phẩm, thực phẩm | Browser app, time-series analyzer, compliance summary, demo, tests |
| [demand-planning-lite](./demand-planning-lite) | Dự báo nhu cầu, safety stock, reorder point cho SKU | Browser app, forecasting + reorder engine, demo, tests |

## Quick Start

```bash
npm test
```

Run the customs web/API demo:

```bash
cd vn-customs-toolkit
npm install
npm start
```

Then open `http://localhost:3000`.

Open the static demos directly in a browser:

- `index.html`
- `container-packing-pro/web/index.html`
- `vn-customs-toolkit/web/index.html`
- `freight-cost-auditor/web/index.html`
- `warehouse-picking-optimizer/web/index.html`
- `cold-chain-monitor/web/index.html`
- `demand-planning-lite/web/index.html`
- `logistics-law-hub/components/GACalculator.html`
- `yard-simulator/src/scene/index.html`

Run individual project demos:

```bash
npm --prefix freight-cost-auditor run demo
npm --prefix warehouse-picking-optimizer run demo
npm --prefix cold-chain-monitor run demo
npm --prefix demand-planning-lite run demo
```

## Architecture Direction

```txt
logistics engines -> API/demo wrappers -> visual tools -> learning/product layer
```

The repo is intentionally dependency-light so each engine can be studied, tested, and reused independently before being connected into larger apps.

## Quality Bar

- Every calculation engine has focused tests.
- Every project has a README and runnable script where relevant.
- Demo data is labeled as demo data, not official operational data.
- CI runs on every push and pull request.
- The roadmap is explicit so future upgrades can move toward real product use.

## Important Disclaimer

The customs, legal, tariff, rate-card, cold-chain, and planning examples are educational/demo material. They are not legal, tax, customs, commercial, quality, or professional advice. Always verify official rates, laws, treaties, standards, and operational assumptions before using results in production.

## License

MIT
