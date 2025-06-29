import { Cell } from "./Cell.js";
export class Board {
  constructor(opts) {
    Object.assign(this, opts);
    this.reset();
  }

  getRandomEmptyCell() {
    const emptyCells = this.board.filter((cell) => cell.isEmpty());
    const randomIndex = Math.floor(Math.random() * emptyCells.length);

    return emptyCells[randomIndex];
  }

  groupCellsByColumn() {
    return this.board.reduce((groupedCells, cell) => {
      groupedCells[cell.x] = groupedCells[cell.x] || [];
      groupedCells[cell.x][cell.y] = cell;
      return groupedCells;
    }, []);
  }

  groupCellsByRow() {
    return this.board.reduce((groupedCells, cell) => {
      groupedCells[cell.y] = groupedCells[cell.y] || [];
      groupedCells[cell.y][cell.x] = cell;
      return groupedCells;
    }, []);
  }

  reset() {
    const cellsCount = this.rows * this.cols;
    this.boardElement.innerHTML = "";
    this.board = [];

    for (let i = 0; i < cellsCount; i++) {
      this.board.push(
        new Cell(this.boardElement, i % this.cols, Math.floor(i / this.rows)),
      );
    }

    this.cellsGroupedByColumn = this.groupCellsByColumn();
    this.cellsGroupedByReversedColumn = this.cellsGroupedByColumn.map(
      (column) => [...column].reverse(),
    );
    this.cellsGroupedByRow = this.groupCellsByRow();
    this.cellsGroupedByReversedRow = this.cellsGroupedByRow.map((raw) =>
      [...raw].reverse(),
    );
  }
}
