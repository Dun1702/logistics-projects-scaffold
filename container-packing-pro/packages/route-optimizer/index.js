/**
 * Route Optimizer đơn giản cho bài toán giao hàng đa điểm dừng (VRP đơn giản hóa, 1 xe)
 * Thuật toán: Nearest Neighbor (khởi tạo) + 2-opt (cải thiện cục bộ)
 * Đủ tốt cho demo/quy mô nhỏ (<100 điểm). Với quy mô lớn hơn nên thay bằng OR-Tools.
 */

function haversineDistance(a, b) {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
function toRad(deg) { return (deg * Math.PI) / 180; }

function buildDistanceMatrix(stops) {
  return stops.map(a => stops.map(b => haversineDistance(a, b)));
}

function routeDistance(route, matrix) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += matrix[route[i]][route[i + 1]];
  }
  return total;
}

function nearestNeighborRoute(matrix, startIndex = 0) {
  const n = matrix.length;
  const visited = new Set([startIndex]);
  const route = [startIndex];

  while (visited.size < n) {
    const last = route[route.length - 1];
    let nearest = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && matrix[last][i] < nearestDist) {
        nearest = i;
        nearestDist = matrix[last][i];
      }
    }
    route.push(nearest);
    visited.add(nearest);
  }
  return route;
}

/**
 * Cải thiện route bằng 2-opt: hoán đổi 2 cạnh nếu giảm được tổng quãng đường
 */
function twoOptImprove(route, matrix) {
  let improved = true;
  let bestRoute = [...route];

  while (improved) {
    improved = false;
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1),
        ];
        if (routeDistance(newRoute, matrix) < routeDistance(bestRoute, matrix)) {
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }
  return bestRoute;
}

/**
 * Tối ưu lộ trình giao hàng đa điểm dừng
 * stops: [{ id, lat, lng }], điểm đầu tiên trong mảng được coi là kho xuất phát
 */
function optimizeRoute(stops) {
  if (stops.length < 2) {
    return { order: stops.map(s => s.id), totalDistanceKm: 0 };
  }

  const matrix = buildDistanceMatrix(stops);
  const initialRoute = nearestNeighborRoute(matrix, 0);
  const improvedRoute = twoOptImprove(initialRoute, matrix);

  return {
    order: improvedRoute.map(i => stops[i].id),
    totalDistanceKm: round2(routeDistance(improvedRoute, matrix)),
    initialDistanceKm: round2(routeDistance(initialRoute, matrix)),
  };
}

function round2(n) { return Math.round(n * 100) / 100; }

module.exports = { optimizeRoute, haversineDistance, buildDistanceMatrix };
