import { Cell } from "./cell.js";
import { getRandomInt } from "./utils.js";
import { opposite } from "./constants.js";
import { resetStopwatch, startStopwatch, stopStopwatch } from "./stopwatch.js";

export class Game {
  constructor(opts, setAnimationFrameIdCallback) {
    this.opts = opts;
    this.running = true;
    this.inputQueue = [];
    this.setAnimationFrameId = setAnimationFrameIdCallback;
    this.keydownHandler = this.handleKeydown.bind(this);
  }

  handleKeydown(e) {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      const pauseMenu = document.querySelector(".pause-menu");
      this.running = !this.running;

      if (this.running) {
        pauseMenu.classList.add("display-none");
        startStopwatch();
      } else {
        pauseMenu.classList.remove("display-none");
        stopStopwatch();
      }

      return;
    }

    const direction = this.opts.direction;
    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const newDirection = keyMap[e.key];
    if (!newDirection) return;

    const lastDirection =
      this.inputQueue.length > 0
        ? this.inputQueue[this.inputQueue.length - 1]
        : this.opts.direction;

    if (
      newDirection !== opposite[direction] &&
      newDirection !== lastDirection
    ) {
      this.inputQueue.push(newDirection);
    }

    if (this.inputQueue.length > 2) {
      this.inputQueue.shift();
    }
  }

  removeControls() {
    document.removeEventListener("keydown", this.keydownHandler);
  }

  setupControls() {
    document.addEventListener("keydown", this.keydownHandler);
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

  updateBoard() {
    const main = document.getElementById("main");
    const scoreEl = document.getElementById("score");
    const headCoordinates = this.opts.snake[0];
    scoreEl.innerHTML = `${(this.opts.snake.length - 3) * 3}`;

    main.innerHTML = "";

    let foodX = -1;
    let foodY = -1;
    this.opts.board.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isFood) {
          foodX = cell.x;
          foodY = cell.y;
        }
      }),
    );

    this.opts.board.forEach((row) => {
      row.forEach((cell) => {
        const isHead =
          cell.x === headCoordinates.x && cell.y === headCoordinates.y;
        const isFoodRowCol =
          foodX !== -1 && (cell.x === foodX || cell.y === foodY);

        main.insertAdjacentHTML(
          "beforeend",
          `<div class='cell${cell.isFood ? " food" : ""}${cell.isSnake ? " snake" : ""}${isHead ? " snake-head" : ""}${isFoodRowCol ? " dot" : ""}' data-x='${cell.x}' data-y='${cell.y}'/>`,
        );
      });
    });
  }

  addFood() {
    let x, y;

    do {
      x = getRandomInt(this.opts.xSize);
      y = getRandomInt(this.opts.ySize);
    } while (this.opts.board[y][x].isSnake);

    this.opts.board[y][x].setFood();

    const foodEl = document.getElementById("food");
    foodEl.style.left = `${x * 20}px`;
    foodEl.style.top = `${y * 20}px`;
  }

  addFirstSnake() {
    const x = Math.floor(this.opts.xSize / 2);
    const y = Math.floor(this.opts.ySize / 2);

    for (let i = 0; i < 3; i++) {
      this.opts.board[y][x - i].setSnake();
      this.opts.snake.push({ x: x - i, y });
    }
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

    if (newCell.isSnake) {
      stopStopwatch();
      const gameOverEl = document.querySelector(".game-over");
      gameOverEl.classList.remove("display-none");
      this.running = false;
      return;
    }

    if (newCell.isFood) {
      this.opts.snake.unshift(head);
      newCell.setSnake();
      this.addFood();
    } else {
      this.opts.snake.unshift(head);
      newCell.setSnake();
      const tail = this.opts.snake.pop();
      this.opts.board[tail.y][tail.x].clear();
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

    startStopwatch();
  }

  init() {
    this.opts.board = this.makeBoard();
    this.addFood();
    this.addFirstSnake();
    this.updateBoard();
    startStopwatch();
    this.setupControls();
    const restartButton = document.getElementById("restart");

    restartButton.addEventListener("click", () => {
      this.reset();
    });

    document.getElementById("resume").addEventListener("click", () => {
      this.running = true;
      document.querySelector(".pause-menu").classList.add("display-none");
      startStopwatch();
    });

    document
      .getElementById("restart-from-pause")
      .addEventListener("click", () => {
        resetStopwatch();
        this.reset();
        document.querySelector(".pause-menu").classList.add("display-none");
      });

    const exitToMenuEls = document.querySelectorAll(".exit-to-menu");

    exitToMenuEls.forEach((el) => {
      el.addEventListener("click", () => {
        this.running = false;
        const pauseMenu = document.querySelector(".pause-menu");
        const gameOverEl = document.querySelector(".game-over");

        if (!pauseMenu.classList.contains("display-none")) {
          pauseMenu.classList.add("display-none");
        }
        if (!gameOverEl.classList.contains("display-none")) {
          gameOverEl.classList.add("display-none");
        }

        document
          .querySelector(".start-screen")
          .classList.remove("display-none");
        resetStopwatch();
        this.removeControls();
      });
    });

    this.setAnimationFrameId(requestAnimationFrame(this.gameLoop.bind(this)));
  }
}
