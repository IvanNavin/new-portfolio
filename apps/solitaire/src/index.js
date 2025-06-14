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

  // Занурюємо 8 back-картинок
  const current = localStorage.getItem("cardBack") || backs[0];
  backs.forEach((path) => {
    const img = document.createElement("img");
    img.src = path;
    if (path === current) img.classList.add("selected");
    img.addEventListener("click", () => {
      // оновлюємо вибір
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
  // щоб width/height="100%" працювали, треба встановити реальні розміри
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const game = new Game(ctx, canvas);
  game.init();
  game.render();

  // Слухачі для drag’n’drop
  canvas.addEventListener("mousedown", (e) => game.onMouseDown(e));
  canvas.addEventListener("mousemove", (e) => game.onMouseMove(e));
  canvas.addEventListener("mouseup", (e) => game.onMouseUp(e));
  undoBtn.addEventListener("click", () => game.undo());

  // Новa гра
  newGameBtn.addEventListener("click", () => {
    menuOverlay.classList.add("hidden");
    game.init();
    game.render();
  });

  // Меню відкриття/закриття
  menuBtn.addEventListener("click", () => {
    game.pause();
    menuOverlay.classList.remove("hidden");
  });

  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("hidden");
    game.resume();
    // одразу один рендер, щоби оновити HUD
    game.render();
  });

  playAgain.addEventListener("click", () => {
    winOverlay.classList.add("hidden");
    game.init();
    game.render();
  });

  // Опціонально: ресайз
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.render();
  });

  function animate() {
    game.render();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});
