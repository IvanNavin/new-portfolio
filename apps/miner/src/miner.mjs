import { Menu } from "./menu.mjs";
import { GlobalVariablesClass } from "./globalVariablesClass.mjs";
import { Stopwatch } from "./stopwatch.mjs";
import { GenerateField } from "./generateField.mjs";
export class Miner {
  constructor() {
    this.opts = new GlobalVariablesClass();
    this.menu = new Menu(this.opts);
    this.stopwatch = new Stopwatch(document.querySelector(".counter.timer"));
    this.generateField = new GenerateField(this.opts);

    this.init();
  }

  markFreeCells = (x, y) => {
    x = +x;
    y = +y;
    if (this.opts.cover[y][x] === 1) return;

    this.opts.cover[y][x] = 1;

    if (y - 1 >= 0) {
      if (x - 1 >= 0) {
        if (this.opts.matrix[y - 1][x - 1] === 0) {
          this.markFreeCells(x - 1, y - 1);
        } else {
          this.opts.cover[y - 1][x - 1] = 1;
        }
      }

      if (this.opts.matrix[y - 1][x] === 0) {
        this.markFreeCells(x, y - 1);
      } else {
        this.opts.cover[y - 1][x] = 1;
      }

      if (x + 1 < this.opts.cols) {
        if (this.opts.matrix[y - 1][x + 1] === 0) {
          this.markFreeCells(x + 1, y - 1);
        } else {
          this.opts.cover[y - 1][x + 1] = 1;
        }
      }
    }
    if (y + 1 < this.opts.rows) {
      if (x - 1 >= 0) {
        if (this.opts.matrix[y + 1][x - 1] === 0) {
          this.markFreeCells(x - 1, y + 1);
        } else {
          this.opts.cover[y + 1][x - 1] = 1;
        }
      }
      if (this.opts.matrix[y + 1][x] === 0) {
        this.markFreeCells(x, y + 1);
      } else {
        this.opts.cover[y + 1][x] = 1;
      }

      if (x + 1 < this.opts.cols) {
        if (this.opts.matrix[y + 1][x + 1] === 0) {
          this.markFreeCells(x + 1, y + 1);
        } else {
          this.opts.cover[y + 1][x + 1] = 1;
        }
      }
    }

    if (x - 1 >= 0) {
      if (this.opts.matrix[y][x - 1] === 0) {
        this.markFreeCells(x - 1, y);
      } else {
        this.opts.cover[y][x - 1] = 1;
      }
    }

    if (x + 1 < this.opts.cols) {
      if (this.opts.matrix[y][x + 1] === 0) {
        this.markFreeCells(x + 1, y);
      } else {
        this.opts.cover[y][x + 1] = 1;
      }
    }
  };

  findIndex = (y, x) => {
    return (y + 1) * this.opts.cols - this.opts.cols + x;
  };

  openFreeCells = () => {
    for (let y = 0; y < this.opts.rows; y++) {
      for (let x = 0; x < this.opts.cols; x++) {
        if (this.opts.cover[y][x] === 1) {
          const index = this.findIndex(y, x);
          const element = document.querySelector(`[index="${index}"]`);

          if (this.opts.matrix[y][x] !== 0) {
            element.innerText = this.opts.matrix[y][x];
            element.dataset.value = this.opts.matrix[y][x];
            element.setAttribute(
              "aria-label",
              `${this.opts.matrix[y][x]} adjacent mines`
            );
          } else {
            element.setAttribute("aria-label", "Empty cell");
          }

          element.classList.add("open");
        }
      }
    }
  };

  // Once won/lost, ignore input — else the player can keep revealing cells and
  // even flip a lost board into a win.
  isOver = () => {
    const state = this.opts.field.dataset.state;
    return state === "gameOver" || state === "youWin";
  };

  gameOver = () => {
    this.showAllMine();
    this.opts.field.dataset.state = "gameOver";
    this.stopwatch.stop();
  };

  youWin = () => {
    this.showAllMine();
    this.opts.field.dataset.state = "youWin";
    this.stopwatch.stop();
    if (typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  checkCell = (target, y, x) => {
    if (this.opts.matrix[y][x] === this.opts.bomb) {
      target.classList.add("bomb");
      this.gameOver();
    } else if (this.opts.matrix[y][x] === 0) {
      this.markFreeCells(x, y);
      this.openFreeCells();
    } else {
      target.innerText = this.opts.matrix[y][x];
      target.dataset.value = this.opts.matrix[y][x];
      target.setAttribute(
        "aria-label",
        `${this.opts.matrix[y][x]} adjacent mines`
      );
      target.classList.add("open");
      this.opts.cover[y][x] = 1;
    }

    const countFreeCells = this.opts.cover.reduce((a, b) => {
      return (
        a +
        b.reduce((c, d) => {
          return c + d;
        }, 0)
      );
    }, 0);

    if (countFreeCells >= this.opts.winResult) {
      this.youWin();
    }
  };

  onCell = ({ target }) => {
    if (this.isOver()) return;

    const index = target.getAttribute("index");
    const y = Math.floor(index / this.opts.cols);
    const x = index % this.opts.cols;

    // Don't reveal a flagged cell.
    if (target.classList.contains("flag")) {
      return;
    }

    if (this.opts.cover[y][x] === 1) {
      return;
    }

    // First-click safety: build the mine layout only once the player
    // reveals their first cell, guaranteeing that cell is never a mine.
    if (!this.opts.matrix.length) {
      this.opts.matrix = this.generateField.createMatrix({ x, y });
    }

    if (!this.stopwatch.running) {
      this.stopwatch.start();
    }

    this.checkCell(target, y, x);
  };

  showAllMine = () => {
    this.opts.matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === this.opts.bomb) {
          const index = this.findIndex(y, x);
          const element = document.querySelector(`[index="${index}"]`);

          if (!element.classList.contains("flag")) {
            element.classList.add(this.opts.bomb);
            element.setAttribute("aria-label", "Mine");
          }
        }
      });
    });
  };

  markAsMine = (target) => {
    if (target.classList.contains("flag")) {
      target.classList.remove("flag");
      target.setAttribute("aria-label", "Hidden cell");
      this.opts.flags++;
    } else {
      target.classList.add("flag");
      target.setAttribute("aria-label", "Flagged cell");
      this.opts.flags--;
    }

    this.opts.counterBomb.innerText = this.opts.pad(this.opts.flags, 3);
  };

  onRightClick = (e) => {
    e.preventDefault();
    if (this.isOver()) return;
    const { target } = e;
    const index = target.getAttribute("index");
    const y = Math.floor(index / this.opts.cols);
    const x = index % this.opts.cols;

    // Can't flag an already-revealed cell.
    if (this.opts.cover[y][x] === 1) {
      return;
    }

    this.markAsMine(target);
  };

  // Long-press flags, short tap reveals.
  touchStart = (e) => {
    const target = e.currentTarget;
    this.opts.longPressed = false;

    const touch = e.touches ? e.touches[0] : e;
    this.opts.touchStartX = touch ? touch.clientX : 0;
    this.opts.touchStartY = touch ? touch.clientY : 0;

    const index = target.getAttribute("index");
    const y = Math.floor(index / this.opts.cols);
    const x = index % this.opts.cols;

    clearTimeout(this.opts.touchTimer);
    this.opts.touchTimer = setTimeout(() => {
      this.opts.longPressed = true;
      // Can't flag an already-revealed cell.
      if (this.opts.cover[y] && this.opts.cover[y][x] === 1) {
        return;
      }
      this.markAsMine(target);
    }, 400);
  };

  touchMove = (e) => {
    // Cancel the long-press if the finger moves too far (scroll/drag).
    const touch = e.touches ? e.touches[0] : e;
    if (!touch) return;

    const dx = Math.abs(touch.clientX - this.opts.touchStartX);
    const dy = Math.abs(touch.clientY - this.opts.touchStartY);

    if (dx > 10 || dy > 10) {
      clearTimeout(this.opts.touchTimer);
      this.opts.touchTimer = 0;
      this.opts.longPressed = true; // suppress the reveal on touchend
    }
  };

  touchEnd = (e) => {
    clearTimeout(this.opts.touchTimer);
    this.opts.touchTimer = 0;

    if (this.opts.longPressed) {
      // The long-press (flag) already fired, or the gesture was a scroll.
      return;
    }

    e.preventDefault();
    this.onCell({ target: e.currentTarget });
  };

  onKeyDown = (e) => {
    const target = e.currentTarget;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.onCell({ target });
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      const index = target.getAttribute("index");
      const y = Math.floor(index / this.opts.cols);
      const x = index % this.opts.cols;
      if (this.opts.cover[y][x] !== 1) {
        this.markAsMine(target);
      }
    }
  };

  listenCells = () => {
    this.opts.cells.querySelectorAll(".cell").forEach((cell) => {
      if (this.opts.isMob()) {
        cell.addEventListener("touchstart", this.touchStart, { passive: true });
        cell.addEventListener("touchmove", this.touchMove, { passive: true });
        cell.addEventListener("touchend", this.touchEnd);
      } else {
        cell.addEventListener("click", this.onCell);
        cell.addEventListener("contextmenu", this.onRightClick);
      }
      cell.addEventListener("keydown", this.onKeyDown);
    });
  };

  onReset = () => {
    this.menu.resetMenu();
    this.generateField.resetField();
    this.stopwatch.stop();
    this.stopwatch.resetStopwatch();
  };

  onStart = () => {
    // Matrix is generated lazily on the first reveal (first-click safety).
    this.opts.matrix = [];
    this.opts.cover = this.generateField.createField();

    this.opts.winResult = this.opts.rows * this.opts.cols - this.opts.mine;

    this.generateField.createHtml();
    this.listenCells();
    this.opts.field.dataset.state = "game";
  };

  init = () => {
    this.menu.listenSelect();
    const start = document.getElementById("start");
    const resetBtn = document.querySelector(".img");

    resetBtn.addEventListener("click", this.onReset);
    resetBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.onReset();
      }
    });
    start?.addEventListener("click", this.onStart);
  };
}
