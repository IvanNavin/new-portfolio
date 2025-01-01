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
          }

          element.classList.add("open");
        }
      }
    }
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
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
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
    if (!this.stopwatch.running) {
      this.stopwatch.start();
    }

    const index = target.getAttribute("index");
    const y = Math.floor(index / this.opts.cols);
    const x = index % this.opts.cols;

    if (this.opts.cover[y][x] === 1) {
      return;
    }

    target.removeEventListener("click", this.onCell);

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
          }
        }
      });
    });
  };

  markAsMine = (target) => {
    if (target.classList.contains("flag")) {
      target.classList.remove("flag");
      this.opts.flags++;
    } else {
      target.classList.add("flag");
      this.opts.flags--;
    }

    this.opts.counterBomb.innerText = this.opts.pad(this.opts.flags, 3);
  };

  onRightClick = (e) => {
    e.preventDefault();
    const { target } = e;
    const index = e.target.getAttribute("index");
    const y = Math.floor(index / this.opts.cols);
    const x = index % this.opts.cols;

    if (this.opts.cover[y][x] === 1) {
      target.removeEventListener("click", this.onRightClick);
      return;
    }

    this.markAsMine(target, y, x);
  };

  touchStart = (e) => {
    e.preventDefault();
    if (!this.opts.touchTimer) {
      this.opts.touchTimer = setTimeout(() => this.onCell(e), 500);
    }
  };

  doubleTap = (e) => {
    const now = new Date().getTime();
    const timeSince = now - this.opts.myLatestTap;

    if (timeSince < 600 && timeSince > 0) {
      this.onRightClick(e);
    }

    this.opts.myLatestTap = new Date().getTime();
  };

  touchEnd = (e) => {
    e.preventDefault();
    if (this.opts.touchTimer) {
      clearTimeout(this.opts.touchTimer);
      this.opts.touchTimer = 0;
    }

    this.doubleTap(e);
  };

  listenCells = () => {
    this.opts.cells.querySelectorAll(".cell").forEach((cell) => {
      if (this.opts.isMob()) {
        cell.addEventListener("touchstart", this.touchStart);
        cell.addEventListener("touchend", this.touchEnd);
      } else {
        cell.addEventListener("click", this.onCell);
        cell.addEventListener("contextmenu", this.onRightClick);
      }
    });
  };

  onReset = () => {
    this.menu.resetMenu();
    this.generateField.resetField();
    this.stopwatch.stop();
    this.stopwatch.resetStopwatch();
  };

  onStart = () => {
    this.opts.matrix = this.generateField.createMatrix();
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
    start?.addEventListener("click", this.onStart);
  };
}
