import { opts } from "./constants.js";
import { Game } from "./game.js";
import { resetStopwatch } from "./stopwatch.js";

const BOARD_PX = 400;

let game = null;
let animationFrameId = null;

// Scale the board to fit small screens. transform: scale() doesn't shrink the
// layout box, so we also collapse the leftover space with a negative margin to
// keep the game vertically centred.
function fitBoard() {
  const container = document.querySelector(".game-container");
  if (!container) return;

  const availW = window.innerWidth - 24;
  const availH = window.innerHeight - 150;
  const scale = Math.min(1, availW / BOARD_PX, availH / BOARD_PX);

  container.style.setProperty("--board-scale", `${scale}`);
  container.style.marginBottom = `${-BOARD_PX * (1 - scale)}px`;
}

function startGame(speed) {
  document.querySelector(".start-screen").classList.add("display-none");
  document.querySelector(".game-screen").classList.remove("display-none");
  fitBoard();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Tear down the previous game's listeners before starting a new one.
  if (game) {
    game.removeControls();
  }

  const newOpts = {
    ...structuredClone(opts),
    speed,
  };

  game = new Game(newOpts, (id) => {
    animationFrameId = id;
  });
  game.init();
}

function exitToMenu() {
  if (game) {
    game.running = false;
    game.removeControls();
  }

  document.querySelector(".pause-menu").classList.add("display-none");
  document.querySelector(".game-over").classList.add("display-none");
  document.querySelector(".game-screen").classList.add("display-none");
  document.querySelector(".start-screen").classList.remove("display-none");
  resetStopwatch();
}

document.addEventListener("DOMContentLoaded", () => {
  fitBoard();
  window.addEventListener("resize", fitBoard);
  window.addEventListener("orientationchange", fitBoard);

  // Difficulty buttons start (or restart) the game.
  document.querySelectorAll(".difficulty").forEach((button) => {
    button.addEventListener("click", () => {
      startGame(parseInt(button.dataset.speed, 10));
    });
  });

  // Menu buttons are wired once — the Game instance is swapped underneath them.
  document.getElementById("restart").addEventListener("click", () => {
    if (game) game.reset();
  });

  document.getElementById("resume").addEventListener("click", () => {
    if (game) game.togglePause(true);
  });

  document.getElementById("pause-btn").addEventListener("click", () => {
    if (game) game.togglePause();
  });

  document
    .getElementById("restart-from-pause")
    .addEventListener("click", () => {
      if (game) game.reset();
      document.querySelector(".pause-menu").classList.add("display-none");
    });

  document.querySelectorAll(".exit-to-menu").forEach((el) => {
    el.addEventListener("click", exitToMenu);
  });
});
