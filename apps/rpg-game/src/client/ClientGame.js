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

// A cell is BLOCKED if it contains at least one object of any of these types.
// Grounds (grass/path/sand) and decorations (flower/mushroom/spawn) never
// block, so walkability = the cell exists AND has none of these.
const BLOCKERS = new Set(["wall", "water", "tree", "rock", "bush"]);

// True if any layer holds a blocker. One pass (vs. findObjectsByType per type),
// which matters in the per-tap BFS.
const cellIsBlocked = (cell) =>
  cell.objects.some((layer) => layer.some((obj) => BLOCKERS.has(obj.type)));

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
      // Queue of step directions ('up'/'down'/'left'/'right') produced by a
      // tap/click. Consumed one step per finished slide in the render loop.
      movePath: [],
      // Destination cell { col, row } of the current tap-to-move path, drawn as
      // a marker for visual feedback. Cleared when the path ends or is interrupted.
      tapTarget: null,
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
        this.drawTapTarget();
      });
      this.engine.start();
      this.engine.focus();
      this.api.join(this.cfg.playerName, this.cfg.skin);
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
  //
  // The keyboard always wins: whenever a direction key is held we abandon any
  // pending tap/click path and move by keyboard exactly as before. Otherwise, a
  // queued path (from onCanvasTap) is consumed one step per finished slide.
  updatePlayerMovement(dir) {
    const { player } = this;
    if (!player) return;

    if (dir) {
      // A key is held → keyboard control, cancel any auto-walk path/marker.
      this.movePath = [];
      this.tapTarget = null;
      this.stepPlayer(dir);
      return;
    }

    // No key held: follow the queued path if there is one.
    if (this.movePath.length && player.motionProgress === 1) {
      const nextDir = this.movePath.shift();
      const moved = this.stepPlayer(nextDir);

      // A step that was expected to be walkable but got blocked (e.g. the world
      // changed) means the rest of the path is stale — drop it.
      if (!moved) this.movePath = [];

      // Path fully consumed (or dropped) → the marker's job is done.
      if (!this.movePath.length) this.tapTarget = null;
      return;
    }

    // Nothing to do: return to the idle animation once truly standing still.
    if (player.motionProgress === 1 && player.state !== "main") {
      player.setState("main");
    }
  }

  // Perform a single cell step in `dir`. Returns whether the player actually
  // moved. setState() restarts the walk cycle, so we only call it when the
  // direction truly changes (keeps the walk continuous, no front-facing flash).
  stepPlayer(dir) {
    const { player } = this;

    if (player.state !== dir) {
      player.setState(dir);
    }

    // A new cell step can only begin once the previous slide has finished.
    if (player.motionProgress !== 1) return false;

    const [dcol, drow] = MOVE_DIRS[dir];
    const moved = player.moveByCellCoord(
      dcol,
      drow,
      (cell) => !!cell && !cellIsBlocked(cell),
    );

    if (moved) this.api.move(dir);

    return moved;
  }

  // Draw a subtle pulsing ring on the current tap-to-move destination so the
  // tap has visible feedback. Drawn after the map so it sits on top; cell world
  // position is converted to screen space by subtracting the camera offset.
  drawTapTarget() {
    if (!this.tapTarget) return;

    const { ctx, camera } = this.engine;
    const { cellWidth, cellHeight } = this.map;
    const { col, row } = this.tapTarget;

    // Centre of the target cell in screen space.
    const cx = col * cellWidth + cellWidth / 2 - camera.x;
    const cy = row * cellHeight + cellHeight / 2 - camera.y;

    // Gentle pulse over a ~1s cycle using the shared render clock.
    const t = (this.engine.lastRenderTime || 0) / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
    const baseRadius = cellWidth * 0.28;
    const radius = baseRadius + pulse * cellWidth * 0.12;

    ctx.save();
    ctx.globalAlpha = 0.35 + 0.35 * pulse;
    ctx.strokeStyle = "#3aebca";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Handle a tap/click on the canvas. `x`/`y` are in the canvas's INTERNAL
  // pixel space (0..canvas.width / 0..canvas.height) — the DOM listener is
  // responsible for converting client coordinates (getBoundingClientRect + CSS
  // scaling) into internal pixels before calling this. Runs a BFS from the
  // player's cell to the tapped cell and stores the resulting step directions
  // on this.movePath for the render loop to consume.
  onCanvasTap(x, y) {
    const { player, map } = this;
    if (!player || !player.cell) return;

    // Screen pixels → world pixels (account for camera scroll).
    const worldX = x + this.engine.camera.x;
    const worldY = y + this.engine.camera.y;

    // cellAtXY clamps to bounds, so a tap always resolves to a cell — no null case.
    const targetCell = map.cellAtXY(worldX, worldY);

    const path = this.findPath(
      player.cell.cellCol,
      player.cell.cellRow,
      targetCell.cellCol,
      targetCell.cellRow,
    );

    // Unreachable or already standing there → clear any pending walk.
    this.movePath = path || [];

    // Show a marker on the destination only when we actually have a path to it.
    this.tapTarget = this.movePath.length
      ? { col: targetCell.cellCol, row: targetCell.cellRow }
      : null;
  }

  // Whether a cell (by col/row) is walkable. A cell is walkable iff it exists
  // and contains NO blocker object (see BLOCKERS). Out-of-bounds cells are
  // null, so they are never walkable.
  isWalkable(col, row) {
    const cell = this.map.cellAt(col, row);
    return !!cell && !cellIsBlocked(cell);
  }

  // Breadth-first search over the 4-neighbour grid from (startCol,startRow) to
  // (endCol,endRow). Returns an array of step directions ('up'/'down'/'left'/
  // 'right'), or null if the target is unreachable or equals the start.
  findPath(startCol, startRow, endCol, endRow) {
    const { worldWidth, worldHeight } = this.map;

    if (startCol === endCol && startRow === endRow) return null;
    if (!this.isWalkable(endCol, endRow)) return null;

    const key = (col, row) => `${col},${row}`;
    const visited = new Set([key(startCol, startRow)]);
    const queue = [{ col: startCol, row: startRow }];
    // Maps a visited cell to { from, dir } so we can reconstruct the path.
    const cameFrom = new Map();

    const dirEntries = Object.entries(MOVE_DIRS);

    while (queue.length) {
      const { col, row } = queue.shift();

      if (col === endCol && row === endRow) {
        // Walk the parent chain back to the start, collecting directions.
        const steps = [];
        let curKey = key(col, row);
        while (cameFrom.has(curKey)) {
          const { from, dir } = cameFrom.get(curKey);
          steps.unshift(dir);
          curKey = from;
        }
        return steps;
      }

      for (const [dir, [dcol, drow]] of dirEntries) {
        const nCol = col + dcol;
        const nRow = row + drow;

        if (nCol < 0 || nCol >= worldWidth || nRow < 0 || nRow >= worldHeight) {
          continue;
        }

        const nKey = key(nCol, nRow);
        if (visited.has(nKey)) continue;
        if (!this.isWalkable(nCol, nRow)) continue;

        visited.add(nKey);
        cameFrom.set(nKey, { from: key(col, row), dir });
        queue.push({ col: nCol, row: nRow });
      }
    }

    return null;
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
      // Defensive: a partial player (bad col/row) has no cell — skip, don't crash.
      if (!cell) return null;
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
