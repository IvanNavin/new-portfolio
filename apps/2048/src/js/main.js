import { Game } from "./game.js";

const opts = {
  cols: 5,
  rows: 5,
  "board-border": "#000",
  "board-background": "#bbada0",
  "board-padding": "4px",
  "board-gap": "2px",
  "cell-width": "48px",
  "cell-height": "48px",
  "empty-cell-background": "#cdc1b4",
  "cell-font-size": "18px",
  "cell-text-color": "#776e65",
};

// Calculate the remaining values after defining the object
opts["board-width"] =
  opts.cols * parseFloat(opts["cell-width"]) +
  opts.cols * parseFloat(opts["board-gap"]) +
  2 * parseFloat(opts["board-padding"]);
opts["board-height"] =
  opts.rows * parseFloat(opts["cell-height"]) +
  opts.rows * parseFloat(opts["board-gap"]) +
  2 * parseFloat(opts["board-padding"]);

document.addEventListener("DOMContentLoaded", function () {
  const startGameButton = document.querySelector("[data-start-game]");
  const restartGameButton = document.querySelector("[data-restart-game]");
  const gameOverModal = document.querySelector("[data-game-over]");
  const toMenuButton = document.querySelector("[data-to-menu]");
  const wrapper = document.querySelector("[data-screen]");
  const root = document.documentElement;

  opts.boardElement = document.querySelector("[data-board]");

  const game = new Game(opts);

  // Loop through all the properties of the opts object and set them as :root properties
  for (const [key, value] of Object.entries(opts)) {
    root.style.setProperty(`--${key}`, value);
  }

  startGameButton.addEventListener("click", function () {
    wrapper.setAttribute("data-screen", "game");
    game.startGame();
  });

  restartGameButton.addEventListener("click", function () {
    gameOverModal.classList.add("hide");
    game.startGame();
  });

  toMenuButton.addEventListener("click", function () {
    gameOverModal.classList.add("hide");
    game.startGame();
    wrapper.setAttribute("data-screen", "menu");
  });
});
