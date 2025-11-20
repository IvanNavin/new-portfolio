import { io } from 'socket.io-client';

class ClientApi {
  constructor(cfg) {
    Object.assign(this, {
      ...cfg,
      game: cfg.game,
    });
  }

  connect() {
    const { url, path } = this;

    this.io = io(url, {
      path,
    });

    this.io.on('welcome', this.onWelcome);
    this.io.on('join', this.onJoin.bind(this));
    this.io.on('newPlayer', this.onNewPlayer.bind(this));
    this.io.on('playerMove', this.onPlayerMove.bind(this));
    this.io.on('playerDisconnect', this.onPlayerDisconnect.bind(this));
  }

  onWelcome(serverStatus) {
    window.console.log('Server is online ', serverStatus);
  }

  onJoin(player) {
    this.game.createCurrentPlayer(player.player);
    this.game.setPlayers(player.playersList);
    window.console.log('JOINED A GAME', player);
  }

  onNewPlayer(player) {
    this.game.createPlayer(player);
  }

  getDir(col, row, oldCol, oldRow) {
    if (row < oldRow) {
      return 'up';
    }
    if (col > oldCol) {
      return 'right';
    }
    if (row > oldRow) {
      return 'down';
    }
    if (col < oldCol) {
      return 'left';
    }
    return 'main';
  }

  onPlayerMove({ col, row, id, oldRow, oldCol }) {
    const { game } = this;
    // Ignore moves for the local player to prevent jitter (client prediction)
    if (game.player && game.player.playerId === id) {
        return;
    }
    const player = game.getPlayerById(id);

    if (player) {
      player.moveToCellCoord(col, row);
      player.setState(this.getDir(col, row, oldCol, oldRow));
      player.once('motion-stopped', () => player.setState('main'));
    }
  }

  onPlayerDisconnect(id) {
    this.game.removePlayerById(id);
  }

  join(playerName) {
    this.io.emit('join', playerName);
  }

  move(dir) {
    this.io.emit('move', dir);
  }
}

export default ClientApi;
