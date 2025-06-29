import { Box } from "./Box.js";

export class EventListener {
  constructor(opts) {
    Object.assign(this, opts);
    this.touchStartX = null;
    this.touchStartY = null;
  }

  canMoveUp() {
    return this.canMove(this.board.cellsGroupedByColumn);
  }

  canMoveDown() {
    return this.canMove(this.board.cellsGroupedByReversedColumn);
  }

  canMoveLeft() {
    return this.canMove(this.board.cellsGroupedByRow);
  }

  canMoveRight() {
    return this.canMove(this.board.cellsGroupedByReversedRow);
  }

  canMove(groupedCells) {
    return groupedCells.some((group) => this.canMoveInGroup(group));
  }

  canMoveInGroup(group) {
    return group.some((cell, index) => {
      if (index === 0) {
        return false;
      }

      if (cell.isEmpty()) {
        return false;
      }

      const targetCell = group[index - 1];
      return targetCell.canAccept(cell.linkedTile);
    });
  }

  slideTilesInGroup(group, promises) {
    for (let i = 1; i < group.length; i++) {
      if (group[i].isEmpty()) {
        continue;
      }

      const cellWithTile = group[i];

      let targetCell;
      let j = i - 1;
      while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
        targetCell = group[j];
        j--;
      }

      if (!targetCell) {
        continue;
      }

      promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

      if (targetCell.isEmpty()) {
        targetCell.linkTile(cellWithTile.linkedTile);
      } else {
        targetCell.linkTileForMerge(cellWithTile.linkedTile);
      }

      cellWithTile.unlinkTile();
    }
  }

  async slideTiles(groupedCells) {
    const promises = [];

    groupedCells.forEach((group) => this.slideTilesInGroup(group, promises));

    await Promise.all(promises);
    this.board.board.forEach((cell) => {
      cell.hasTileForMerge() && cell.mergeTiles();
    });
  }

  async moveUp() {
    await this.slideTiles(this.board.cellsGroupedByColumn);
  }

  async moveDown() {
    await this.slideTiles(this.board.cellsGroupedByReversedColumn);
  }

  async moveLeft() {
    await this.slideTiles(this.board.cellsGroupedByRow);
  }

  async moveRight() {
    await this.slideTiles(this.board.cellsGroupedByReversedRow);
  }

  gameIsOver() {
    return (
      !this.canMoveUp() &&
      !this.canMoveDown() &&
      !this.canMoveLeft() &&
      !this.canMoveRight()
    );
  }

  async onKeyDown(event) {
    switch (event.key) {
      case "ArrowUp":
        if (!this.canMoveUp()) {
          this.listen();
          return;
        }
        await this.moveUp();
        break;
      case "ArrowDown":
        if (!this.canMoveDown()) {
          this.listen();
          return;
        }
        await this.moveDown();
        break;
      case "ArrowLeft":
        if (!this.canMoveLeft()) {
          this.listen();
          return;
        }
        await this.moveLeft();
        break;
      case "ArrowRight":
        if (!this.canMoveRight()) {
          this.listen();
          return;
        }
        await this.moveRight();
        break;
      default:
        this.listen();
        return;
    }

    const newTile = new Box(this.boardElement);
    this.board.getRandomEmptyCell().linkTile(newTile);

    if (this.gameIsOver()) {
      await newTile.waitForAnimationEnd();
      const gameOverModal = document.querySelector("[data-game-over]");

      gameOverModal.classList.remove("hide");

      return;
    }

    this.listen();
  }

  onTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;

    return this;
  }

  async onTouchEnd(event) {
    // Determining the direction of movement while moving on the touch screen
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    let direction = null;

    if (this.touchStartX === touchEndX && this.touchStartY === touchEndY)
      return;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    // Determination of the displacement direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? "right" : "left";
    } else {
      direction = deltaY > 0 ? "down" : "up";
    }

    switch (direction) {
      case "up":
        if (!this.canMoveUp()) {
          this.listen();
          return;
        }
        await this.moveUp();
        break;
      case "down":
        if (!this.canMoveDown()) {
          this.listen();
          return;
        }
        await this.moveDown();
        break;
      case "left":
        if (!this.canMoveLeft()) {
          this.listen();
          return;
        }
        await this.moveLeft();
        break;
      case "right":
        if (!this.canMoveRight()) {
          this.listen();
          return;
        }
        await this.moveRight();
        break;
      default:
        this.listen();
        return;
    }

    const newTile = new Box(this.boardElement);
    this.board.getRandomEmptyCell().linkTile(newTile);

    if (this.gameIsOver()) {
      await newTile.waitForAnimationEnd();
      const gameOverModal = document.querySelector("[data-game-over]");

      gameOverModal.classList.remove("hide");

      return;
    }

    this.listen();
  }

  listen() {
    document.addEventListener(
      "keydown",
      (e) => {
        this.onKeyDown(e);
      },
      { once: true },
    );
    this.boardElement.addEventListener(
      "touchstart",
      (e) => {
        this.onTouchStart(e);
      },
      { once: true },
    );
    this.boardElement.addEventListener(
      "touchend",
      (e) => {
        this.onTouchEnd(e);
      },
      { once: true },
    );
  }
}
