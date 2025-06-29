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
    this.board.reset();
    this.init();
  }

  init() {
    this.board.getRandomEmptyCell().linkTile(new Box(this.boardElement));
    this.board.getRandomEmptyCell().linkTile(new Box(this.boardElement));
    this.eventListener.listen();
  }
}
