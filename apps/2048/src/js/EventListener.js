import { Box } from "./Box.js";

export class EventListener {
  constructor(opts) {
    Object.assign(this, opts);
    this.touchStartX = null;
    this.touchStartY = null;
    // Guard against overlapping moves while tiles are still animating.
    this.isMoving = false;

    // Bind once so the same references can be added/removed as listeners.
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
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

  moveUp() {
    return this.slideTiles(this.board.cellsGroupedByColumn);
  }

  moveDown() {
    return this.slideTiles(this.board.cellsGroupedByReversedColumn);
  }

  moveLeft() {
    return this.slideTiles(this.board.cellsGroupedByRow);
  }

  moveRight() {
    return this.slideTiles(this.board.cellsGroupedByReversedRow);
  }

  gameIsOver() {
    return (
      !this.canMoveUp() &&
      !this.canMoveDown() &&
      !this.canMoveLeft() &&
      !this.canMoveRight()
    );
  }

  // Shared move pipeline for both keyboard and touch input.
  async handleMove(direction) {
    if (this.isMoving) {
      return;
    }

    const moves = {
      up: { canMove: () => this.canMoveUp(), move: () => this.moveUp() },
      down: { canMove: () => this.canMoveDown(), move: () => this.moveDown() },
      left: { canMove: () => this.canMoveLeft(), move: () => this.moveLeft() },
      right: {
        canMove: () => this.canMoveRight(),
        move: () => this.moveRight(),
      },
    };

    const action = moves[direction];

    if (!action || !action.canMove()) {
      return;
    }

    this.isMoving = true;
    await action.move();

    const newTile = new Box(this.boardElement);
    this.board.getRandomEmptyCell().linkTile(newTile);

    if (this.gameIsOver()) {
      await newTile.waitForAnimationEnd();
      const gameOverModal = document.querySelector("[data-game-over]");
      gameOverModal.classList.remove("hide");
      this.stop();
      return;
    }

    this.isMoving = false;
  }

  onKeyDown(event) {
    const keyToDirection = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };

    const direction = keyToDirection[event.key];

    if (!direction) {
      return;
    }

    // Prevent the page from scrolling while playing with the arrow keys.
    event.preventDefault();
    this.handleMove(direction);
  }

  onTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event) {
    if (this.touchStartX === null || this.touchStartY === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    this.touchStartX = null;
    this.touchStartY = null;

    // Ignore taps / tiny drags so they don't register as a swipe.
    const SWIPE_THRESHOLD = 10;
    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD &&
      Math.abs(deltaY) < SWIPE_THRESHOLD
    ) {
      return;
    }

    let direction;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? "right" : "left";
    } else {
      direction = deltaY > 0 ? "down" : "up";
    }

    this.handleMove(direction);
  }

  // Attach persistent input listeners. Safe to call repeatedly because
  // stop() removes the exact same bound references first.
  listen() {
    this.stop();
    document.addEventListener("keydown", this.onKeyDown);
    this.boardElement.addEventListener("touchstart", this.onTouchStart, {
      passive: true,
    });
    this.boardElement.addEventListener("touchend", this.onTouchEnd);
  }

  stop() {
    document.removeEventListener("keydown", this.onKeyDown);
    this.boardElement.removeEventListener("touchstart", this.onTouchStart);
    this.boardElement.removeEventListener("touchend", this.onTouchEnd);
  }
}
