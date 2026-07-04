import ClientEngine from "./ClientEngine";
import ClientWorld from "./ClientWorld";

import sprites from "../configs/sprites";
import levelCfg from "../configs/world.json";
import gameObjects from "../configs/gameObjects.json";
import ClientApi from "./ClientApi";

const MOVE_DIRS = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

class ClientGame {
  constructor(cfg) {
    Object.assign(this, {
      cfg,
      gameObjects: cfg.gameObjects || gameObjects,
      player: null,
      players: {},
      api: new ClientApi({
        game: this,
        ...cfg.apiCfg,
      }),
      spawnPoint: [],
    });

    this.api.connect();
    this.engine = this.createEngine();
    this.map = this.createWorld();
    this.initEngine();
  }

  setPlayer(player) {
    this.player = player;
  }

  createEngine() {
    return new ClientEngine(document.getElementById(this.cfg.tagID), this);
  }

  createWorld() {
    return new ClientWorld(this, this.engine, this.cfg.world || levelCfg);
  }

  getWorld() {
    return this.map;
  }

  initEngine() {
    this.engine.loadSprites(this.cfg.sprites || sprites).then(() => {
      this.map.init();
      this.engine.on("render", (_, time) => {
        if (this.player) {
          this.engine.camera.focusGameObject(this.player);
          this.updatePlayerMovement(this.readMoveDir());
        }
        this.map.render(time);
      });
      this.engine.start();
      this.engine.focus();
      this.api.join(this.cfg.playerName);
    });
  }

  // Which direction the movement keys are asking for this frame (null = none).
  readMoveDir() {
    const keys = this.engine.input.keysPressed;
    if (keys.has("ArrowUp") || keys.has("KeyW")) return "up";
    if (keys.has("ArrowRight") || keys.has("KeyD")) return "right";
    if (keys.has("ArrowDown") || keys.has("KeyS")) return "down";
    if (keys.has("ArrowLeft") || keys.has("KeyA")) return "left";
    return null;
  }

  // Drive the player's animation state straight from the held direction so the
  // walk cycle runs continuously. We never bounce back to the front-facing
  // 'main' state between steps (that caused a one-frame "face flash"); idle is
  // only shown once the player has actually stopped.
  updatePlayerMovement(dir) {
    const { player } = this;
    if (!player) return;

    // Face the requested direction immediately. setState() restarts the walk
    // cycle, so only call it when the direction truly changes.
    if (dir && player.state !== dir) {
      player.setState(dir);
    }

    // A new cell step can only begin once the previous slide has finished.
    if (player.motionProgress !== 1) return;

    if (dir) {
      const [dcol, drow] = MOVE_DIRS[dir];
      const moved = player.moveByCellCoord(
        dcol,
        drow,
        (cell) => cell && cell.findObjectsByType("grass").length,
      );

      if (moved) this.api.move(dir);
    } else if (player.state !== "main") {
      // Standing still with no key held → idle animation.
      player.setState("main");
    }
  }

  setPlayers(playerList) {
    playerList.forEach((player) => this.createPlayer(player));
  }

  createCurrentPlayer(playerCfg) {
    const playerObj = this.createPlayer(playerCfg);

    this.setPlayer(playerObj);
  }

  createPlayer({ id, col, row, layer, skin, name }) {
    if (!this.players[id]) {
      const cell = this.map.cellAt(col, row);
      const playerObj = cell.createGameObject(
        {
          class: "player",
          type: skin,
          playerId: id,
          playerName: name,
        },
        layer,
      );

      cell.addGameObject(playerObj);

      this.players[id] = playerObj;
    }

    return this.players[id];
  }

  getPlayerById(id) {
    return this.players[id];
  }

  addSpawnPoint(spawnPoint) {
    this.spawnPoint.push(spawnPoint);
  }

  removePlayerById(id) {
    const player = this.getPlayerById(id);

    if (player) {
      player.detouch();
      delete this.players[id];
    }
  }

  static init(cfg) {
    if (!ClientGame.game) {
      ClientGame.game = new ClientGame(cfg);
    }
  }
}

export default ClientGame;
