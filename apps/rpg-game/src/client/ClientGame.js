import ClientEngine from './ClientEngine';
import ClientWorld from './ClientWorld';

import sprites from '../configs/sprites';
import levelCfg from '../configs/world.json';
import gameObjects from '../configs/gameObjects.json';
import ClientApi from './ClientApi';

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
      this.engine.on('render', (_, time) => {
        if (this.player) {
          this.engine.camera.focusGameObject(this.player);

          if (this.engine.input.keysPressed.has('ArrowUp')) this.movePlayerToDir('up');
          else if (this.engine.input.keysPressed.has('ArrowRight')) this.movePlayerToDir('right');
          else if (this.engine.input.keysPressed.has('ArrowDown')) this.movePlayerToDir('down');
          else if (this.engine.input.keysPressed.has('ArrowLeft')) this.movePlayerToDir('left');
        }
        this.map.render(time);
      });
      this.engine.start();
      this.engine.focus();
      this.api.join(this.cfg.playerName);
    });
  }

  movePlayerToDir(dir) {
    const dirs = {
      up: [0, -1],
      right: [1, 0],
      down: [0, 1],
      left: [-1, 0],
    };

    const { player } = this;

    if (player && player.motionProgress === 1) {
      const canMovie = player.moveByCellCoord(
        dirs[dir][0],
        dirs[dir][1],
        (cell) => cell && cell.findObjectsByType('grass').length,
      );

      if (canMovie) {
        player.setState(dir);
        player.once('motion-stopped', () => player.setState('main'));
        this.api.move(dir);
      }
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
          class: 'player',
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
