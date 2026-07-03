// src/index.js
import Card from "./js/Card.js";
import Game from "./js/Game.js";

document.addEventListener("DOMContentLoaded", async () => {
  const menuBtn = document.getElementById("menuBtn");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const themeOptions = document.getElementById("themeOptions");
  const undoBtn = document.getElementById("undoBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const winOverlay = document.getElementById("winOverlay");
  const playAgain = document.getElementById("playAgain");

  const backs = Array.from(
    { length: 8 },
    (_, i) => `src/assets/cards/back0${i + 1}.png`,
  );

  const current = localStorage.getItem("cardBack") || backs[7];
  backs.forEach((path) => {
    const img = document.createElement("img");
    img.src = path;
    if (path === current) img.classList.add("selected");
    img.addEventListener("click", () => {
      document
        .querySelectorAll(".theme-options img")
        .forEach((i) => i.classList.remove("selected"));
      img.classList.add("selected");
      localStorage.setItem("cardBack", path);
      Card.loadBackImage(path).then(() => game.render());
    });
    themeOptions.appendChild(img);
  });

  await Card.loadBackImage();
  await Card.preloadFaces();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const sizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  sizeCanvas();

  const game = new Game(ctx, canvas);
  game.init();
  game.render();

  // Mouse
  canvas.addEventListener("mousedown", (e) => game.onMouseDown(e));
  canvas.addEventListener("mousemove", (e) => game.onMouseMove(e));
  window.addEventListener("mouseup", (e) => game.onMouseUp(e));
  canvas.addEventListener("dblclick", (e) => game.onDoubleClick(e));

  // Touch (map to the mouse handlers + double-tap → auto-to-foundation)
  let lastTap = 0;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const t0 = Date.now();
      const isDouble =
        t0 - lastTap < 300 &&
        Math.hypot(t.clientX - lastX, t.clientY - lastY) < 30;
      lastTap = t0;
      lastX = t.clientX;
      lastY = t.clientY;
      if (isDouble) {
        lastTap = 0;
        game.onDoubleClick(e);
        return;
      }
      game.onMouseDown(e);
    },
    { passive: false },
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      game.onMouseMove(e);
    },
    { passive: false },
  );
  canvas.addEventListener("touchend", (e) => game.onMouseUp(e));

  undoBtn.addEventListener("click", () => game.undo());

  const newGame = () => {
    menuOverlay.classList.add("hidden");
    winOverlay.classList.add("hidden");
    game.init();
    game.render();
  };
  newGameBtn.addEventListener("click", newGame);
  playAgain.addEventListener("click", newGame);

  menuBtn.addEventListener("click", () => {
    game.pause();
    menuOverlay.classList.remove("hidden");
  });
  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("hidden");
    game.resume();
    game.render();
  });

  window.addEventListener("resize", () => {
    sizeCanvas();
    game.render();
  });

  // Keep the HUD clock ticking without repainting 60fps when idle. Active
  // animations drive their own render loop; this only covers the idle state.
  setInterval(() => {
    if (!game.paused && !game.isAnimating()) game.render();
  }, 1000);
});
