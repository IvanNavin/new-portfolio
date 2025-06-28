export class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isEmpty = true;
    this.isSnake = false;
    this.isFood = false;
  }

  setSnake() {
    this.isSnake = true;
    this.isEmpty = false;
    this.isFood = false;
  }

  setFood() {
    this.isFood = true;
    this.isEmpty = false;
    this.isSnake = false;
  }

  clear() {
    this.isEmpty = true;
    this.isSnake = false;
    this.isFood = false;
  }
}
