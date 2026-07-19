const path = require("path");
const Hapi = require("@hapi/hapi");
const { Server } = require("socket.io");
const world = require("../src/configs/world.json");

const port = process.env.PORT || 3000;

// A destination cell is blocked if any object in any of its layers has one of
// these types. Grounds (grass/path/sand) and decorations never block. Must stay
// in sync with the client BLOCKERS list in ClientGame.js.
const BLOCKERS = new Set(["wall", "water", "tree", "rock", "bush"]);

// Read the type name of a cell object, which may be a plain string ("grass")
// or, defensively, an object of the shape { type }.
const objType = (obj) => (typeof obj === "string" ? obj : obj && obj.type);

// Whether a map cell contains at least one blocker object across all its layers.
// `cell` is an array of layers, each layer an array of type-name strings.
const cellIsBlocked = (cell) =>
  Array.isArray(cell) &&
  cell.some(
    (layer) =>
      Array.isArray(layer) && layer.some((obj) => BLOCKERS.has(objType(obj))),
  );

// Scan the world map once for spawn cells — any cell whose layers contain the
// string 'spawn'. Collect their { col, row } (col = x index, row = y index).
const spawnPoints = [];
if (world && Array.isArray(world.map)) {
  world.map.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      const hasSpawn =
        Array.isArray(cell) &&
        cell.some(
          (layer) =>
            Array.isArray(layer) &&
            layer.some((obj) => objType(obj) === "spawn"),
        );
      if (hasSpawn) spawnPoints.push({ col, row });
    });
  });
}
console.log(`Found ${spawnPoints.length} spawn point(s)`);

// Pick a spawn cell for a joining player. Randomly choose from the scanned spawn
// points; if there are none, fall back to the first walkable (non-blocked) cell,
// and ultimately to (1, 1).
const pickSpawn = () => {
  if (spawnPoints.length) {
    return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  }

  if (world && Array.isArray(world.map)) {
    for (let row = 0; row < world.map.length; row += 1) {
      const rowCells = world.map[row];
      for (let col = 0; col < rowCells.length; col += 1) {
        if (!cellIsBlocked(rowCells[col])) return { col, row };
      }
    }
  }

  return { col: 1, row: 1 };
};

// Valid player skins the client may request. Anything outside this
// allow-list is ignored so a client can't inject an arbitrary sprite key.
const VALID_SKINS = ["girl1", "girl2", "girl3", "boy1", "boy2", "boy3"];

// Authoritative: coerce/trim/cap the name; never trust a modified/legacy client.
const MAX_NAME_LEN = 12;
const cleanName = (raw) => {
  const s = (typeof raw === "string" ? raw : "").trim().slice(0, MAX_NAME_LEN);
  return s || "Anonymous";
};

const FILES =
  /\.(js|js.map|woff|woff2|svg|bmp|jpg|jpeg|gif|png|ico)(\?v=\d+\.\d+\.\d+)?$/;

const PATH = {
  "/": "index.html",
};

const init = async () => {
  const server = Hapi.server({
    port,
    host: "0.0.0.0", // Allow external connections (required for Render)
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register(require("@hapi/inert"));

  server.route({
    method: "GET",
    path: "/{path*}",
    handler: (request, h) => {
      if (FILES.test(request.path)) {
        return h.file(path.join(process.cwd(), "dist", request.path));
      }

      // SPA fallback: any non-asset path (e.g. a refresh on "/anything") serves
      // index.html. Previously PATH[request.path] was undefined for anything
      // but "/", so path.join threw and Hapi returned a 500.
      const file = PATH[request.path] || "index.html";
      return h.file(path.join(process.cwd(), "dist", file));
    },
  });

  await server.start();

  console.log("Server running on %s", server.info.uri);

  // Socket.io setup
  const io = new Server(server.listener, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Game Logic
    socket.on("join", (payload) => {
      // Accept either a plain name string (legacy) or { name, skin }.
      const isObj = typeof payload === "object" && payload !== null;
      const name = cleanName(isObj ? payload.name : payload);
      const joinSkin = isObj ? payload.skin : undefined;
      // Prefer the skin sent with join, fall back to the one from 'start',
      // then the default — so skin never depends on event ordering.
      const skin = VALID_SKINS.includes(joinSkin)
        ? joinSkin
        : socket.data.skin || "boy1";

      console.log("Player joined:", name, skin);

      // Random spawn cell so players don't stack on top of each other.
      const spawn = pickSpawn();
      const newPlayer = {
        id: socket.id,
        name,
        skin,
        // Top dynamic layer (above ground=0 and decorations=1) so a
        // player always renders over the mushroom/flower they stand on,
        // never underneath it.
        col: spawn.col,
        row: spawn.row,
        layer: 2,
      };

      // In a real backend, we would store players in a DB or memory
      // For now, we just echo back to the client as if they joined
      // and tell everyone else about the new player

      // Mocking the response expected by ClientApi.onJoin
      // It expects { player: current_player_obj, playersList: [all_players] }
      // Since we don't have persistent state in this simple script,
      // we'll just send back the current player as the only player for now,
      // or we could try to maintain a simple in-memory list.

      // Let's try a simple in-memory list
      socket.data.player = newPlayer;

      // Only fully-joined players: one that emitted 'start' (partial { name })
      // but not 'join' has no col/row/id → would crash the receiver's onJoin.
      const isJoined = (p) =>
        p && Number.isInteger(p.col) && Number.isInteger(p.row) && p.id;
      const playersList = [];
      io.sockets.sockets.forEach((s) => {
        if (isJoined(s.data.player)) {
          playersList.push(s.data.player);
        }
      });

      socket.emit("join", {
        player: newPlayer,
        playersList: playersList,
      });

      socket.broadcast.emit("newPlayer", newPlayer);
    });

    socket.on("move", (dir) => {
      const player = socket.data.player;
      if (!player) return;

      const dirs = {
        up: [0, -1],
        right: [1, 0],
        down: [0, 1],
        left: [-1, 0],
      };

      const [dCol, dRow] = dirs[dir];
      const newCol = player.col + dCol;
      const newRow = player.row + dRow;

      // Collision detection
      if (
        newCol < 0 ||
        newRow < 0 ||
        newRow >= world.map.length ||
        newCol >= world.map[0].length
      ) {
        return;
      }

      const cell = world.map[newRow][newCol];
      // Block the move if ANY object in ANY layer of the destination cell
      // is a blocker (wall/water/tree/rock/bush). Everything else — grounds
      // and decorations — is walkable.
      if (cellIsBlocked(cell)) {
        return;
      }

      const oldCol = player.col;
      const oldRow = player.row;

      player.col = newCol;
      player.row = newRow;

      io.emit("playerMove", {
        id: socket.id,
        col: player.col,
        row: player.row,
        oldCol,
        oldRow,
      });
    });

    // Chat Logic
    socket.on("start", (payload) => {
      // Accept either a plain string (legacy) or { name, skin }.
      const name = cleanName(
        typeof payload === "object" && payload !== null
          ? payload.name
          : payload,
      );
      const skin =
        typeof payload === "object" && payload !== null
          ? payload.skin
          : undefined;

      console.log(
        "START event received:",
        name,
        skin,
        "Current player:",
        socket.data.player,
      );

      // Store the chosen skin only if it's a known, valid skin.
      if (VALID_SKINS.includes(skin)) {
        socket.data.skin = skin;
      }

      // Save the name to socket data so it's available for chat
      if (!socket.data.player) {
        socket.data.player = { name };
      } else {
        socket.data.player.name = name;
      }

      io.emit("chat connection", {
        time: Date.now(),
        msg: `${name} connected`,
        id: socket.id,
      });

      // Update online count - use actual socket count
      const onlineCount = io.sockets.sockets.size;
      io.emit("chat online", { online: onlineCount });
    });

    socket.on("chat message", (msg) => {
      console.log(
        "CHAT MESSAGE event. socket.data.player:",
        socket.data.player,
      );
      const player = socket.data.player;
      const name = player ? player.name : "Anonymous";
      console.log("Sending chat message with name:", name);
      io.emit("chat message", {
        name,
        time: Date.now(),
        msg,
        id: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const player = socket.data.player;
      if (player) {
        io.emit("playerDisconnect", socket.id);
        io.emit("chat disconnect", {
          time: Date.now(),
          msg: `${player.name} disconnected`,
        });
      }

      // Update online count after disconnect
      const onlineCount = io.sockets.sockets.size;
      io.emit("chat online", { online: onlineCount });
    });
  });
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
