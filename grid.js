export class Grid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.halfCellSize = cellSize / 2;
  }

  worldToGridCoordinates(worldX, worldY) {
    const isoX = (worldX / this.halfCellSize + worldY / this.halfCellSize) / 2;
    const isoY = (worldY / this.halfCellSize - worldX / this.halfCellSize) / 2;
    return { x: Math.floor(isoX), y: Math.floor(isoY) };
  }

  gridToWorldCoordinates(gridX, gridY) {
    return {
      x: (gridX - gridY) * this.halfCellSize,
      y: (gridX + gridY) * this.halfCellSize,
    };
  }

  drawGrid(ctx, width, height) {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.5;

    const columns = Math.ceil(width / this.halfCellSize);
    const rows = Math.ceil(height / this.halfCellSize);

    for (let row = -rows; row < rows; row++) {
      for (let col = -columns; col < columns; col++) {
        const { x, y } = this.gridToWorldCoordinates(col, row);
        this.drawIsometricCell(ctx, x, y);
      }
    }
  }

  drawIsometricCell(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y + this.halfCellSize);
    ctx.lineTo(x + this.halfCellSize, y);
    ctx.lineTo(x + this.cellSize, y + this.halfCellSize);
    ctx.lineTo(x + this.halfCellSize, y + this.cellSize);
    ctx.closePath();
    ctx.stroke();
  }
}
