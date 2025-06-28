import { opts } from "./constants.js";
import { Game } from "./game.js";

let game = null;
let animationFrameId = null;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".difficulty").forEach((button) => {
    button.addEventListener("click", () => {
      const newOpts = {
        ...structuredClone(opts),
        speed: parseInt(button.dataset.speed, 10),
      };

      document.querySelector(".start-screen").classList.add("display-none");
      document.querySelector(".game-screen").classList.remove("display-none");

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      game = new Game(newOpts, (id) => {
        animationFrameId = id;
      });
      game.init();
    });
  });
});
