import { Cell } from "./cell.js";
import { getRandomInt } from "./utils.js";
import { opposite } from "./constants.js";
import { resetStopwatch, startStopwatch, stopStopwatch } from "./stopwatch.js";

const CELL_SIZE = 20;
const HIGH_SCORE_KEY = "snake-high-score";

export class Game {
  constructor(opts, setAnimationFrameIdCallback) {
    this.opts = opts;
    this.running = true;
    this.gameOver = false;
    this.inputQueue = [];
    this.cellEls = [];
    this.food = { x: -1, y: -1 };
    this.setAnimationFrameId = setAnimationFrameIdCallback;
    this.keydownHandler = this.handleKeydown.bind(this);
    this.touchStartHandler = this.handleTouchStart.bind(this);
    this.touchMoveHandler = this.handleTouchMove.bind(this);
    this.touchStart = null;
  }

  togglePause(forceState) {
    if (this.gameOver) return;

    const pauseMenu = document.querySelector(".pause-menu");
    this.running = typeof forceState === "boolean" ? forceState : !this.running;

    if (this.running) {
      pauseMenu.classList.add("display-none");
      startStopwatch();
    } else {
      pauseMenu.classList.remove("display-none");
      stopStopwatch();
    }
  }

  handleKeydown(e) {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      e.preventDefault();
      this.togglePause();
      return;
    }

    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      W: "up",
      S: "down",
      A: "left",
      D: "right",
    };
    const newDirection = keyMap[e.key];
    if (!newDirection) return;

    e.preventDefault();
    this.queueDirection(newDirection);
  }

  queueDirection(newDirection) {
    if (!this.running) return;

    const lastDirection =
      this.inputQueue.length > 0
        ? this.inputQueue[this.inputQueue.length - 1]
        : this.opts.direction;

    if (
      newDirection !== opposite[lastDirection] &&
      newDirection !== lastDirection
    ) {
      this.inputQueue.push(newDirection);
    }

    if (this.inputQueue.length > 2) {
      this.inputQueue.shift();
    }
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  handleTouchMove(e) {
    if (!this.touchStart) return;

    const touch = e.touches[0];
    const dx = touch.clientX - this.touchStart.x;
    const dy = touch.clientY - this.touchStart.y;
    const threshold = 24;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    // Prevent the page from scrolling while swiping to steer.
    e.preventDefault();

    if (Math.abs(dx) > Math.abs(dy)) {
      this.queueDirection(dx > 0 ? "right" : "left");
    } else {
      this.queueDirection(dy > 0 ? "down" : "up");
    }

    this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  removeControls() {
    document.removeEventListener("keydown", this.keydownHandler);
    const main = document.getElementById("main");
    main.removeEventListener("touchstart", this.touchStartHandler);
    main.removeEventListener("touchmove", this.touchMoveHandler);
  }

  setupControls() {
    document.addEventListener("keydown", this.keydownHandler);
    const main = document.getElementById("main");
    main.addEventListener("touchstart", this.touchStartHandler, {
      passive: true,
    });
    main.addEventListener("touchmove", this.touchMoveHandler, {
      passive: false,
    });
  }

  makeBoard() {
    const { xSize, ySize } = this.opts;
    const board = [];

    for (let y = 0; y < ySize; y++) {
      board[y] = [];

      for (let x = 0; x < xSize; x++) {
        board[y][x] = new Cell(x, y);
      }
    }

    return board;
  }

  // Build the grid of cell elements once and cache references so the render
  // loop can toggle classes instead of rebuilding 400 nodes every frame.
  buildCells() {
    const { xSize, ySize } = this.opts;
    const main = document.getElementById("main");
    main.innerHTML = "";
    this.cellEls = [];

    const fragment = document.createDocumentFragment();

    for (let y = 0; y < ySize; y++) {
      this.cellEls[y] = [];

      for (let x = 0; x < xSize; x++) {
        const el = document.createElement("div");
        el.className = "cell";
        el.dataset.x = x;
        el.dataset.y = y;
        fragment.appendChild(el);
        this.cellEls[y][x] = el;
      }
    }

    main.appendChild(fragment);
  }

  updateBoard() {
    const scoreEl = document.getElementById("score");
    const headCoordinates = this.opts.snake[0];
    scoreEl.textContent = `${this.getScore()}`;

    const foodX = this.food.x;
    const foodY = this.food.y;
    const hasFood = foodX !== -1;

    for (let y = 0; y < this.opts.ySize; y++) {
      for (let x = 0; x < this.opts.xSize; x++) {
        const cell = this.opts.board[y][x];
        const el = this.cellEls[y][x];
        const isHead = x === headCoordinates.x && y === headCoordinates.y;
        const isFoodRowCol = hasFood && (x === foodX || y === foodY);

        el.classList.toggle("snake", cell.isSnake);
        el.classList.toggle("snake-head", isHead);
        el.classList.toggle("dot", isFoodRowCol && !cell.isSnake);
      }
    }
  }

  getScore() {
    return Math.max(0, (this.opts.snake.length - 3) * 3);
  }

  getHighScore() {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10) || 0;
    } catch {
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      if (score > this.getHighScore()) {
        localStorage.setItem(HIGH_SCORE_KEY, `${score}`);
      }
    } catch {
      /* localStorage unavailable (e.g. sandboxed iframe) — ignore. */
    }
  }

  renderHighScore() {
    const el = document.getElementById("high-score");
    if (el) el.textContent = `${this.getHighScore()}`;
  }

  addFood() {
    let x, y;

    do {
      x = getRandomInt(this.opts.xSize);
      y = getRandomInt(this.opts.ySize);
    } while (this.opts.board[y][x].isSnake);

    this.opts.board[y][x].setFood();
    this.food = { x, y };

    const foodEl = document.getElementById("food");
    foodEl.style.left = `${x * CELL_SIZE}px`;
    foodEl.style.top = `${y * CELL_SIZE}px`;
  }

  addFirstSnake() {
    const x = Math.floor(this.opts.xSize / 2);
    const y = Math.floor(this.opts.ySize / 2);

    for (let i = 0; i < 3; i++) {
      this.opts.board[y][x - i].setSnake();
      this.opts.snake.push({ x: x - i, y });
    }
  }

  endGame() {
    stopStopwatch();
    this.running = false;
    this.gameOver = true;

    const score = this.getScore();
    this.saveHighScore(score);
    this.renderHighScore();

    const finalScoreEl = document.getElementById("final-score");
    if (finalScoreEl) finalScoreEl.textContent = `${score}`;

    document.querySelector(".game-over").classList.remove("display-none");
  }

  moveSnake() {
    if (!this.running) return;

    if (this.inputQueue.length > 0) {
      const nextDirection = this.inputQueue.shift();

      if (nextDirection !== opposite[this.opts.direction]) {
        this.opts.direction = nextDirection;
      }
    }

    const head = { ...this.opts.snake[0] };

    switch (this.opts.direction) {
      case "up":
        head.y -= 1;
        break;
      case "down":
        head.y += 1;
        break;
      case "left":
        head.x -= 1;
        break;
      case "right":
        head.x += 1;
        break;
    }

    if (head.x < 0) head.x = this.opts.xSize - 1;
    if (head.x >= this.opts.xSize) head.x = 0;
    if (head.y < 0) head.y = this.opts.ySize - 1;
    if (head.y >= this.opts.ySize) head.y = 0;

    const newCell = this.opts.board[head.y][head.x];

    // Moving into the tail's current square is safe: it vacates this tick.
    const tailEnd = this.opts.snake[this.opts.snake.length - 1];
    const movingIntoTail = head.x === tailEnd.x && head.y === tailEnd.y;

    if (newCell.isSnake && !movingIntoTail) {
      this.endGame();
      return;
    }

    if (newCell.isFood) {
      this.opts.snake.unshift(head);
      newCell.setSnake();
      this.addFood();
    } else {
      const tail = this.opts.snake.pop();
      this.opts.board[tail.y][tail.x].clear();
      this.opts.snake.unshift(head);
      this.opts.board[head.y][head.x].setSnake();
    }
  }

  gameLoop(timestamp) {
    if (this.running && timestamp - this.opts.lastUpdate > this.opts.speed) {
      this.opts.lastUpdate = timestamp;
      this.moveSnake();
      this.updateBoard();
    }

    const id = requestAnimationFrame(this.gameLoop.bind(this));
    if (this.setAnimationFrameId) {
      this.setAnimationFrameId(id);
    }
  }

  reset() {
    this.running = true;
    this.gameOver = false;
    this.inputQueue = [];

    // Clean and restore the initial state
    this.opts.board = this.makeBoard();
    this.opts.snake = [];
    this.opts.direction = "right";
    this.opts.lastUpdate = 0;

    // Hide Game Over
    const gameOverEl = document.querySelector(".game-over");
    if (gameOverEl) {
      gameOverEl.classList.add("display-none");
    }

    // Add a snake and food again
    this.addFood();
    this.addFirstSnake();
    this.updateBoard();

    resetStopwatch();
    startStopwatch();
  }

  init() {
    this.opts.board = this.makeBoard();
    this.buildCells();
    this.addFood();
    this.addFirstSnake();
    this.renderHighScore();
    this.updateBoard();
    resetStopwatch();
    startStopwatch();
    this.setupControls();

    this.setAnimationFrameId(requestAnimationFrame(this.gameLoop.bind(this)));
  }
}
