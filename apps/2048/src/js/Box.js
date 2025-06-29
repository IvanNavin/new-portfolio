import { getValue } from "./helpers.js";

export class Box {
  constructor(gridElement) {
    this.winElement = document.querySelector("[data-win]");
    this.tileElement = document.createElement("div");
    this.tileElement.classList.add("box");
    this.setValue(getValue());
    gridElement.append(this.tileElement);
  }

  setValue(value) {
    this.value = value;
    this.tileElement.textContent = value;
    const bgLightness = 100 - Math.log2(value) * 9;
    this.tileElement.style.setProperty("--bg-lightness", `${bgLightness}%`);
    this.tileElement.style.setProperty(
      "--text-lightness",
      `${bgLightness < 50 ? 90 : 10}%`,
    );

    if (value > 2048 && this.winElement.classList.contains("hide")) {
      this.winElement.classList.remove("hide");
    }
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
    this.tileElement.style.setProperty("--x", x);
    this.tileElement.style.setProperty("--y", y);
  }

  removeFromDOM() {
    this.tileElement.remove();
  }

  waitForTransitionEnd() {
    return new Promise((resolve) => {
      this.tileElement.addEventListener("transitionend", resolve, {
        once: true,
      });
    });
  }

  waitForAnimationEnd() {
    return new Promise((resolve) => {
      this.tileElement.addEventListener("animationend", resolve, {
        once: true,
      });
    });
  }
}
