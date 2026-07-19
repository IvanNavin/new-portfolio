const fs = require("fs");
const path = require("path");

const targetPath = path.join(__dirname, "../src/configs/world.json");
const originalConfig = require(targetPath);

const width = 50;
const height = 20;

// ---------------------------------------------------------------------------
// Deterministic PRNG so the generated map is stable across runs.
// ---------------------------------------------------------------------------
let seed = 1337;
function rand() {
  // Mulberry32
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const chance = (p) => rand() < p;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ---------------------------------------------------------------------------
// Ground layer (opaque base) + decoration layer (drawn on top).
// ground: 'grass' | 'grassLush' | 'grassDry' | 'water' | 'sand' | 'path'
// deco:   null | 'tree' | 'bush' | 'rock' | 'flower' | 'mushroom' | 'spawn'
// Impassable decos: tree, bush, rock. Impassable ground: water, wall.
// ---------------------------------------------------------------------------
const ground = Array.from({ length: height }, () => Array(width).fill("grass"));
const deco = Array.from({ length: height }, () => Array(width).fill(null));

const inBounds = (x, y) => x >= 0 && x < width && y >= 0 && y < height;
const isBorder = (x, y) =>
  x === 0 || y === 0 || x === width - 1 || y === height - 1;

// The ground is a single, calm green meadow. A per-cell mix of grass variants
// read as a noisy "dead patch" quilt, so we keep one clean base grass and let
// the lake, groves and flowers provide the variety instead.

// 1) The lake: an organic blob of water, low-centre-right of the map --------
const lakeCx = 37;
const lakeCy = 12;
const lakeRx = 7;
const lakeRy = 4;
function lakeField(x, y) {
  // squared radial distance with a little noise for a wobbly shoreline
  const dx = (x - lakeCx) / lakeRx;
  const dy = (y - lakeCy) / lakeRy;
  return dx * dx + dy * dy;
}
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const f = lakeField(x, y) + (rand() - 0.5) * 0.22;
    if (f < 1.0) {
      ground[y][x] = "water";
    }
  }
}
// Sand shore: any land cell touching water becomes a soft beach ring --------
const dirs8 = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];
const touchesWater = (x, y) =>
  dirs8.some(
    ([dx, dy]) =>
      inBounds(x + dx, y + dy) && ground[y + dy][x + dx] === "water",
  );
const shore = [];
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    if (ground[y][x] !== "water" && touchesWater(x, y)) shore.push([x, y]);
  }
}
for (const [x, y] of shore) ground[y][x] = "sand";

// 2) Forest groves: dense-centre tree clusters on grass, thinning at the edge
//    so you can still weave through. Trees only sit on plain grass.
// Dense, compact groves read as real woods (the tree sprite is small, so
// scattered trees look like lonely saplings). We keep the very centre solid
// and only thin the outermost ring so a grove still has a walk-around shape.
function forestBlob(cx, cy, radius) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (!inBounds(x, y) || isBorder(x, y)) continue;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > radius + 0.3) continue;
      if (ground[y][x] !== "grass") continue;
      // Solid core, ragged edge → an organic clump of trees.
      const keep = d <= radius - 1 ? 0.97 : 0.55;
      if (chance(keep)) deco[y][x] = "tree";
    }
  }
}
forestBlob(9, 5, 2);
forestBlob(8, 15, 2);
forestBlob(22, 6, 2);
forestBlob(23, 15, 2);
forestBlob(44, 7, 2);
forestBlob(43, 16, 2);

// 3) Mushrooms hug the forest floor: sprinkle them on grass next to trees ---
const touchesTree = (x, y) =>
  dirs8.some(
    ([dx, dy]) => inBounds(x + dx, y + dy) && deco[y + dy][x + dx] === "tree",
  );
const hasMushroomNear = (x, y) =>
  dirs8.some(
    ([dx, dy]) =>
      inBounds(x + dx, y + dy) && deco[y + dy][x + dx] === "mushroom",
  );
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    if (ground[y][x] !== "grass" || deco[y][x] !== null) continue;
    // Rare accent on the forest floor, and never two mushrooms touching.
    if (touchesTree(x, y) && !hasMushroomNear(x, y) && chance(0.08)) {
      deco[y][x] = "mushroom";
    }
  }
}

// 4) Flower meadows: soft patches of walkable flowers on open grass ---------
function meadow(cx, cy, radius, density) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (!inBounds(x, y) || isBorder(x, y)) continue;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > radius + 0.3) continue;
      if (ground[y][x] !== "grass" || deco[y][x] !== null) continue;
      // Denser centre, sparser edge -> a natural clump, not a grid.
      if (chance(density * (1 - d / (radius + 1.2)))) deco[y][x] = "flower";
    }
  }
}
meadow(14, 9, 3, 0.8);
meadow(27, 9, 3, 0.75);
meadow(31, 4, 2, 0.75);
meadow(5, 10, 2, 0.75);

// 5) A handful of boulders as accents: a few on the shore, a couple inland --
for (const [x, y] of shore) {
  if (deco[y][x] === null && chance(0.05)) deco[y][x] = "rock";
}
for (let i = 0; i < 6; i++) {
  const x = 2 + Math.floor(rand() * (width - 4));
  const y = 2 + Math.floor(rand() * (height - 4));
  if (ground[y][x] === "grass" && deco[y][x] === null) deco[y][x] = "rock";
}

// ---------------------------------------------------------------------------
// 7) Spawn points: spread across walkable, open ground. -------------------
//    A cell is walkable if ground is not water and deco is not tree/bush/rock.
// ---------------------------------------------------------------------------
const BLOCKING_DECO = new Set(["tree", "bush", "rock"]);
function isWalkable(x, y) {
  if (!inBounds(x, y) || isBorder(x, y)) return false;
  if (ground[y][x] === "water") return false;
  if (BLOCKING_DECO.has(deco[y][x])) return false;
  return true;
}
// Ensure a cell is a clean, open walkable spot for a spawn.
function clearForSpawn(x, y) {
  if (ground[y][x] === "water" || ground[y][x] === "sand")
    ground[y][x] = "grass";
  deco[y][x] = "spawn";
}
const spawnTargets = [
  [3, 3], // top-left corner
  [46, 3], // top-right corner
  [3, 16], // bottom-left corner
  [46, 16], // bottom-right corner
  [25, 10], // centre
  [30, 15], // near the lake shore
  [12, 6], // by the north-west forest / main road
];
const spawns = [];
for (const [tx, ty] of spawnTargets) {
  // Nudge to the nearest walkable cell if the exact target is blocked.
  let placed = null;
  for (let r = 0; r < 4 && !placed; r++) {
    for (let dy = -r; dy <= r && !placed; dy++) {
      for (let dx = -r; dx <= r && !placed; dx++) {
        const x = tx + dx;
        const y = ty + dy;
        // A real walkable spot (excludes blocking deco) so the nudge finds an
        // open cell instead of bulldozing whatever the target landed on.
        if (isWalkable(x, y)) {
          placed = [x, y];
        }
      }
    }
  }
  const [sx, sy] = placed || [tx, ty];
  clearForSpawn(sx, sy);
  spawns.push([sy, sx]); // report as [row, col]
}

// ---------------------------------------------------------------------------
// 8) Border walls all the way around. -------------------------------------
// ---------------------------------------------------------------------------
// (build cells below; the border is applied as a wall layer)

// ---------------------------------------------------------------------------
// Assemble the layered map. Every walkable cell keeps an opaque ground base.
// ---------------------------------------------------------------------------
const finalMap = [];
for (let y = 0; y < height; y++) {
  const row = [];
  for (let x = 0; x < width; x++) {
    if (isBorder(x, y)) {
      row.push([["wall"]]);
      continue;
    }
    const cell = [[ground[y][x]]];
    if (deco[y][x]) cell.push([deco[y][x]]);
    row.push(cell);
  }
  finalMap.push(row);
}

const newConfig = {
  ...originalConfig,
  camera: {
    height: 15,
    width: 15,
    x: 2,
    y: 2,
  },
  map: finalMap,
};

fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 4));
console.log("Map regenerated: lake + forests + meadows + paths.");
console.log(
  "Spawns (row,col):",
  spawns.map((s) => `(${s[0]},${s[1]})`).join(" "),
);
