# Logistics Projects Scaffold

[![CI](https://github.com/Dun1702/logistics-projects-scaffold/actions/workflows/ci.yml/badge.svg)](https://github.com/Dun1702/logistics-projects-scaffold/actions/workflows/ci.yml)

Một monorepo các dự án logistics có tính ứng dụng cao: tối ưu đóng container, tính thuế nhập khẩu Việt Nam, học luật hàng hải/thương mại, và mô phỏng bãi container 3D.

## Project Map

| Project | Use case | Current signal |
| --- | --- | --- |
| [container-packing-pro](./container-packing-pro) | Tối ưu xếp hàng container + lộ trình giao đa điểm | Packing engine, route optimizer, tests |
| [vn-customs-toolkit](./vn-customs-toolkit) | Tra cứu HS demo, tính thuế NK/VAT, gợi ý C/O FTA | Express API, web demo, tariff engine, tests |
| [logistics-law-hub](./logistics-law-hub) | Học logistics và luật thương mại bằng nội dung + calculator | General Average engine, lesson, static widget, tests |
| [yard-simulator](./yard-simulator) | Mô phỏng xếp bãi container và KPI reshuffle | Slotting heuristic, Three.js scene, tests |

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

- `logistics-law-hub/components/GACalculator.html`
- `yard-simulator/src/scene/index.html`

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

The customs and legal examples are educational/demo material. They are not legal, tax, customs, or professional advice. Always verify official rates, laws, treaties, and operational assumptions before using results in production.

## License

MIT
