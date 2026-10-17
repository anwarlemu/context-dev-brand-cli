const CELL_SIZE = 5;
const STEP_SECONDS = 1 / 60;

export function createWaterSimulation(width: number, height: number) {
  const columns = Math.max(3, Math.min(320, Math.ceil(width / CELL_SIZE)));
  const rows = Math.max(3, Math.min(200, Math.ceil(height / CELL_SIZE)));
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const propagationX = 0.22 * (Math.min(cellWidth, cellHeight) / cellWidth) ** 2;
  const propagationY = 0.22 * (Math.min(cellWidth, cellHeight) / cellHeight) ** 2;
  let current = new Float32Array(columns * rows);
  let previous = new Float32Array(columns * rows);
  const pixels = new Uint8Array(columns * rows * 4);
  const damping = new Float32Array(columns * rows);
  let accumulatedTime = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const edgeDistance = Math.min(x, y, columns - x - 1, rows - y - 1);
      damping[y * columns + x] = 0.985 - Math.max(0, 1 - edgeDistance / 12) * 0.12;
    }
  }

  function disturb(fromX: number, fromY: number, toX: number, toY: number, strength: number, radius = 22) {
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const lengthSquared = deltaX * deltaX + deltaY * deltaY;
    const startX = Math.max(1, Math.floor((Math.min(fromX, toX) - radius * 2) / cellWidth));
    const endX = Math.min(columns - 2, Math.ceil((Math.max(fromX, toX) + radius * 2) / cellWidth));
    const startY = Math.max(1, Math.floor((Math.min(fromY, toY) - radius * 2) / cellHeight));
    const endY = Math.min(rows - 2, Math.ceil((Math.max(fromY, toY) + radius * 2) / cellHeight));
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const pointX = (x + 0.5) * cellWidth - fromX;
        const pointY = (y + 0.5) * cellHeight - fromY;
        const along = lengthSquared > 0 ? Math.max(0, Math.min(1, (pointX * deltaX + pointY * deltaY) / lengthSquared)) : 0;
        const distanceSquared = (pointX - deltaX * along) ** 2 + (pointY - deltaY * along) ** 2;
        const falloff = Math.exp(-distanceSquared / (radius * radius * 0.5));
        const index = y * columns + x;
        previous[index] += strength * falloff;
      }
    }
  }

  function advance(seconds: number) {
    accumulatedTime += Math.min(seconds, 0.05);
    while (accumulatedTime >= STEP_SECONDS) {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < columns - 1; x++) {
          const index = y * columns + x;
          const height = current[index];
          const acceleration =
            (current[index - 1] + current[index + 1] - height * 2) * propagationX + (current[index - columns] + current[index + columns] - height * 2) * propagationY;
          const edgeAbsorption = 1 - (0.985 - damping[index]) * 0.4;
          previous[index] = (height + (height - previous[index]) * damping[index] + acceleration) * edgeAbsorption;
        }
      }
      [current, previous] = [previous, current];
      accumulatedTime -= STEP_SECONDS;
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = y * columns + x;
        const slopeX = (current[y * columns + Math.min(columns - 1, x + 1)] - current[y * columns + Math.max(0, x - 1)]) / (2 * cellWidth);
        const slopeY = (current[Math.min(rows - 1, y + 1) * columns + x] - current[Math.max(0, y - 1) * columns + x]) / (2 * cellHeight);
        const encodedX = Math.round(Math.max(0, Math.min(65535, 32768 + slopeX * 32767)));
        const encodedY = Math.round(Math.max(0, Math.min(65535, 32768 + slopeY * 32767)));
        pixels[index * 4] = encodedX >> 8;
        pixels[index * 4 + 1] = encodedX & 255;
        pixels[index * 4 + 2] = encodedY >> 8;
        pixels[index * 4 + 3] = encodedY & 255;
      }
    }
    return pixels;
  }

  return { columns, rows, disturb, advance };
}
