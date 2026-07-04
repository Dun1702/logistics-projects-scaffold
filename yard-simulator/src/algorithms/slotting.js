/**
 * Thuật toán tối ưu vị trí bãi container (Yard Slotting)
 *
 * Ý tưởng: bãi container gồm các "block" (dãy), mỗi block có nhiều "bay" (cột) x "row" (hàng) x "tier" (tầng xếp chồng)
 * Container có thời gian dự kiến xuất bãi (departureTime) càng sớm thì nên được xếp ở
 * vị trí dễ lấy nhất (tier thấp, gần lối ra) để giảm số lần "reshuffle" (đảo chuyển) khi lấy hàng.
 */

class Yard {
  constructor({ blocks, baysPerBlock, rowsPerBay, tiersPerStack, exitBlockIndex = 0 }) {
    this.blocks = blocks;
    this.baysPerBlock = baysPerBlock;
    this.rowsPerBay = rowsPerBay;
    this.tiersPerStack = tiersPerStack;
    this.exitBlockIndex = exitBlockIndex;
    // grid[block][bay][row] = array các container xếp chồng (index 0 = dưới cùng)
    this.grid = Array.from({ length: blocks }, () =>
      Array.from({ length: baysPerBlock }, () =>
        Array.from({ length: rowsPerBay }, () => [])
      )
    );
  }

  /**
   * Tính "điểm ưu tiên" vị trí: càng thấp càng tốt (gần lối ra, tier thấp)
   */
  _slotScore(block, bay, row) {
    const distanceFromExit = Math.abs(block - this.exitBlockIndex) * 10 + bay;
    return distanceFromExit;
  }

  /**
   * Tìm vị trí tốt nhất còn trống cho container, ưu tiên:
   * - Container xuất bãi sớm -> vị trí gần lối ra, tier thấp
   * - Container xuất bãi muộn -> có thể xếp sâu/cao hơn (dưới container xuất muộn hơn)
   */
  findBestSlot(container, allContainers) {
    let best = null;
    let bestScore = Infinity;

    for (let b = 0; b < this.blocks; b++) {
      for (let bay = 0; bay < this.baysPerBlock; bay++) {
        for (let row = 0; row < this.rowsPerBay; row++) {
          const stack = this.grid[b][bay][row];
          if (stack.length >= this.tiersPerStack) continue;

          // Ràng buộc: chỉ đặt lên trên nếu container bên dưới xuất bãi MUỘN HƠN
          // (tránh phải đảo chuyển sau này)
          const topContainer = stack[stack.length - 1];
          if (topContainer && topContainer.departureTime < container.departureTime) {
            continue; // sẽ gây reshuffle, bỏ qua vị trí này
          }

          const score = this._slotScore(b, bay, row) + stack.length * 5;
          if (score < bestScore) {
            bestScore = score;
            best = { block: b, bay, row, tier: stack.length };
          }
        }
      }
    }
    return best;
  }

  place(container) {
    const slot = this.findBestSlot(container);
    if (!slot) return null;
    this.grid[slot.block][slot.bay][slot.row].push(container);
    return slot;
  }

  /**
   * Ước tính số lần reshuffle cần thiết khi lấy 1 container ra
   * (đếm số container xếp trên nó phải di chuyển tạm)
   */
  estimateReshuffles(block, bay, row, containerId) {
    const stack = this.grid[block][bay][row];
    const index = stack.findIndex(c => c.id === containerId);
    if (index === -1) return 0;
    return stack.length - 1 - index;
  }

  /**
   * Mô phỏng lấy container theo thứ tự xuất bãi.
   * Nếu thuật toán xếp đúng, container xuất sớm nằm trên container xuất muộn,
   * nên tổng reshuffle thực tế trong mô phỏng sẽ thấp.
   */
  simulateRetrievalReshuffles(containers) {
    const grid = this.grid.map(block => block.map(bay => bay.map(stack => [...stack])));
    const byDeparture = [...containers].sort((a, b) => a.departureTime - b.departureTime);
    let reshuffles = 0;

    for (const container of byDeparture) {
      const location = findContainer(grid, container.id);
      if (!location) continue;

      const stack = grid[location.block][location.bay][location.row];
      const above = stack.length - 1 - location.index;
      reshuffles += above;

      const movedAside = stack.splice(location.index + 1);
      stack.splice(location.index, 1);
      stack.push(...movedAside);
    }

    return reshuffles;
  }

  get occupiedSlots() {
    let count = 0;
    for (const block of this.grid) {
      for (const bay of block) {
        for (const stack of bay) {
          count += stack.length;
        }
      }
    }
    return count;
  }

  get capacity() {
    return this.blocks * this.baysPerBlock * this.rowsPerBay * this.tiersPerStack;
  }
}

/**
 * Chạy toàn bộ quá trình xếp bãi cho danh sách container, trả về vị trí + thống kê
 */
function planYardSlotting({ yardSpec, containers }) {
  const yard = new Yard(yardSpec);

  // Xếp container xuất muộn trước để container xuất sớm có thể nằm phía trên,
  // giúp giảm reshuffle khi lấy hàng theo thứ tự departureTime tăng dần.
  const sorted = [...containers].sort((a, b) => b.departureTime - a.departureTime);

  const placements = [];
  const unplaced = [];

  for (const container of sorted) {
    const slot = yard.place(container);
    if (slot) {
      placements.push({ containerId: container.id, ...slot });
    } else {
      unplaced.push(container.id);
    }
  }

  const totalEstimatedReshuffles = yard.simulateRetrievalReshuffles(containers);

  return {
    placements,
    unplaced,
    totalEstimatedReshuffles,
    capacityUsed: round4(yard.occupiedSlots / yard.capacity),
  };
}

function findContainer(grid, containerId) {
  for (let block = 0; block < grid.length; block++) {
    for (let bay = 0; bay < grid[block].length; bay++) {
      for (let row = 0; row < grid[block][bay].length; row++) {
        const index = grid[block][bay][row].findIndex(c => c.id === containerId);
        if (index !== -1) return { block, bay, row, index };
      }
    }
  }
  return null;
}

function round4(n) { return Math.round(n * 10000) / 10000; }

module.exports = { Yard, planYardSlotting };
