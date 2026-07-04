// Purpose: Game class to create new game instances
import { Board } from "./Board.js";
import { Box } from "./Box.js";
import { EventListener } from "./EventListener.js";

export class Game {
  constructor(opts) {
    Object.assign(this, opts);
    this.board = new Board(opts);
    this.eventListener = new EventListener(this);
  }

  startGame() {
    // Hide the win banner from any previous round before resetting.
    document.querySelector("[data-win]")?.classList.add("hide");
    this.board.reset();
    this.init();
  }

  init() {
    // Reset any lingering win banner / input guard from a previous round.
    this.eventListener.isMoving = false;
    this.board.getRandomEmptyCell().linkTile(new Box(this.boardElement));
    this.board.getRandomEmptyCell().linkTile(new Box(this.boardElement));
    this.eventListener.listen();
  }
}
