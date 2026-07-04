import { Game } from "./Game.js";

const opts = {
  cols: 5,
  rows: 5,
  "board-border": "#000",
  "board-background": "#bbada0",
  "board-gap": "5px",
  "cell-width": "48px",
  "cell-height": "48px",
  "empty-cell-background": "#cdc1b4",
  "cell-font-size": "18px",
  "cell-text-color": "#776e65",
};

// Board dimensions are derived from the cell/gap variables in CSS (see
// --board-width / --board-height), so they resize automatically on small
// screens without JS having to recompute anything.

document.addEventListener("DOMContentLoaded", function () {
  const startGameButton = document.querySelector("[data-start-game]");
  // There are multiple restart triggers (the in-game icon and the game-over
  // modal button), so select all of them, not just the first.
  const restartGameButtons = document.querySelectorAll("[data-restart-game]");
  const gameOverModal = document.querySelector("[data-game-over]");
  const toMenuButton = document.querySelector("[data-to-menu]");
  const wrapper = document.querySelector("[data-screen]");
  const root = document.documentElement;

  opts.boardElement = document.querySelector("[data-board]");

  const game = new Game(opts);

  // Loop through the scalar options and expose them as :root CSS variables
  // (skip DOM/object values like boardElement).
  for (const [key, value] of Object.entries(opts)) {
    if (typeof value === "string" || typeof value === "number") {
      root.style.setProperty(`--${key}`, value);
    }
  }

  startGameButton.addEventListener("click", function () {
    wrapper.setAttribute("data-screen", "game");
    game.startGame();
  });

  restartGameButtons.forEach((button) => {
    button.addEventListener("click", function () {
      gameOverModal.classList.add("hide");
      game.startGame();
    });
  });

  toMenuButton.addEventListener("click", function () {
    gameOverModal.classList.add("hide");
    game.startGame();
    wrapper.setAttribute("data-screen", "menu");
  });
});
