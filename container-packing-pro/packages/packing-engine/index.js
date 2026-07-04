/**
 * 3D Bin Packing Engine cho container
 * Thuật toán: First-Fit-Decreasing theo thể tích, có ràng buộc:
 * - Trọng lượng tối đa container
 * - Thứ tự dỡ hàng (unload order): hàng dỡ trước phải được xếp gần cửa container
 */

class Container {
  constructor({ id, length, width, height, maxWeight }) {
    this.id = id;
    this.length = length;
    this.width = width;
    this.height = height;
    this.maxWeight = maxWeight;
    this.currentWeight = 0;
    this.placedBoxes = [];
    // Không gian trống còn lại, biểu diễn đơn giản bằng danh sách "free spaces"
    this.freeSpaces = [{ x: 0, y: 0, z: 0, length, width, height }];
  }

  get usedVolume() {
    return this.placedBoxes.reduce((sum, b) => sum + b.length * b.width * b.height, 0);
  }

  get totalVolume() {
    return this.length * this.width * this.height;
  }

  get utilization() {
    return this.usedVolume / this.totalVolume;
  }

  canFit(box) {
    if (this.currentWeight + box.weight > this.maxWeight) return false;
    return this.freeSpaces.some(space => this._fitsInSpace(box, space));
  }

  _fitsInSpace(box, space) {
    return box.length <= space.length && box.width <= space.width && box.height <= space.height;
  }

  /**
   * Đặt box vào không gian trống đầu tiên vừa vặn (First-Fit)
   * Ưu tiên không gian gần gốc tọa độ (0,0,0) = gần cửa container nếu unloadPriority cao
   */
  place(box) {
    if (this.currentWeight + box.weight > this.maxWeight) return false;

    // Sắp xếp free spaces: nếu box cần dỡ sớm (unloadPriority thấp = dỡ trước),
    // ưu tiên đặt gần x=0 (cửa container)
    const sortedSpaces = [...this.freeSpaces].sort((a, b) => {
      if (box.unloadPriority <= 1) return a.x - b.x; // dỡ trước -> gần cửa
      return b.x - a.x; // dỡ sau -> để sâu trong
    });

    const space = sortedSpaces.find(s => this._fitsInSpace(box, s));
    if (!space) return false;

    const position = { x: space.x, y: space.y, z: space.z };
    this.placedBoxes.push({ ...box, position });
    this.currentWeight += box.weight;

    this._splitSpace(space, box);
    return true;
  }

  /**
   * Chia không gian trống sau khi đặt box (guillotine split đơn giản theo 3 trục)
   */
  _splitSpace(space, box) {
    this.freeSpaces = this.freeSpaces.filter(s => s !== space);

    // Không gian còn lại theo trục X (bên phải box)
    if (space.length - box.length > 0) {
      this.freeSpaces.push({
        x: space.x + box.length, y: space.y, z: space.z,
        length: space.length - box.length, width: space.width, height: space.height,
      });
    }
    // Không gian còn lại theo trục Y (phía sau box)
    if (space.width - box.width > 0) {
      this.freeSpaces.push({
        x: space.x, y: space.y + box.width, z: space.z,
        length: box.length, width: space.width - box.width, height: space.height,
      });
    }
    // Không gian còn lại theo trục Z (phía trên box)
    if (space.height - box.height > 0) {
      this.freeSpaces.push({
        x: space.x, y: space.y, z: space.z + box.height,
        length: box.length, width: box.width, height: space.height - box.height,
      });
    }
  }
}

/**
 * Đóng gói danh sách box vào container
 * boxes: [{ id, length, width, height, weight, unloadPriority }]
 * unloadPriority: số càng nhỏ = dỡ càng sớm (dỡ tại điểm dừng đầu tiên)
 */
function packContainer({ containerSpec, boxes }) {
  const container = new Container(containerSpec);

  // First-Fit-Decreasing: sắp theo thể tích giảm dần để xếp hiệu quả hơn
  const sortedBoxes = [...boxes].sort((a, b) =>
    (b.length * b.width * b.height) - (a.length * a.width * a.height)
  );

  const unplaced = [];
  for (const box of sortedBoxes) {
    if (!container.place(box)) {
      unplaced.push(box);
    }
  }

  return {
    containerId: container.id,
    utilization: round4(container.utilization),
    totalWeight: container.currentWeight,
    weightCapacityUsed: round4(container.currentWeight / container.maxWeight),
    placedBoxes: container.placedBoxes,
    unplacedBoxes: unplaced,
  };
}

function round4(n) { return Math.round(n * 10000) / 10000; }

module.exports = { Container, packContainer };
