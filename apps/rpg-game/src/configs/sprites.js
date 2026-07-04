import overworldIMG from "../assets/Overworld.png";
import charactersIMG from "../assets/characters.png";

// Terrain now comes from ArMM1998's CC0 "Zelda-like" Overworld tileset
// (16x16 pixel tiles), which matches the pixel-art character sprites.
// Tile at grid (col,row) => frame [col*16, row*16, 16, 16].
const T = (col, row) => ({
  img: overworldIMG,
  frames: [[col * 16, row * 16, 16, 16]],
});

export default {
  terrain: {
    grass: T(0, 0),
    // Aliases kept so old references never break; all map to grass for now.
    grassLush: T(0, 0),
    grassDry: T(0, 0),
    sand: T(0, 0),
    path: T(0, 0),
    npcSpawn: T(0, 0),
    // Spawn markers render as plain grass (invisible) — the server only needs
    // the 'spawn' object in the map to place players; no occult pentagram.
    spawn: T(0, 0),

    water: T(3, 3), // deep water fill (used for the ocean border + lakes)
    tree: T(7, 16), // solid leafy canopy — clusters read as dense forest
    bush: T(7, 16), // (alias canopy)
    rock: T(1, 12), // boulder (whole tile — not a fragment)
    flower: T(0, 8), // grassy flowers
    mushroom: T(0, 8), // (alias flower — a light accent)
    wall: T(3, 3), // (alias water — the border is an ocean)
  },
  characters: {
    girl1: {
      img: charactersIMG,
      frames: [
        [0, 0, 96, 96],
        [96, 0, 96, 96],
        [192, 0, 96, 96],
        [0, 96, 96, 96],
        [96, 96, 96, 96],
        [192, 96, 96, 96],
        [0, 192, 96, 96],
        [96, 192, 96, 96],
        [192, 192, 96, 96],
        [0, 288, 96, 96],
        [96, 288, 96, 96],
        [192, 288, 96, 96],
      ],
    },
    girl2: {
      img: charactersIMG,
      frames: [
        [288, 0, 96, 96],
        [384, 0, 96, 96],
        [480, 0, 96, 96],
        [288, 96, 96, 96],
        [384, 96, 96, 96],
        [480, 96, 96, 96],
        [288, 192, 96, 96],
        [384, 192, 96, 96],
        [480, 192, 96, 96],
        [288, 288, 96, 96],
        [384, 288, 96, 96],
        [480, 288, 96, 96],
      ],
    },
    girl3: {
      img: charactersIMG,
      frames: [
        [576, 0, 96, 96],
        [672, 0, 96, 96],
        [768, 0, 96, 96],
        [576, 96, 96, 96],
        [672, 96, 96, 96],
        [768, 96, 96, 96],
        [576, 192, 96, 96],
        [672, 192, 96, 96],
        [768, 192, 96, 96],
        [576, 288, 96, 96],
        [672, 288, 96, 96],
        [768, 288, 96, 96],
      ],
    },
    boy1: {
      img: charactersIMG,
      frames: [
        [0, 384, 96, 96],
        [96, 384, 96, 96],
        [192, 384, 96, 96],
        [0, 480, 96, 96],
        [96, 480, 96, 96],
        [192, 480, 96, 96],
        [0, 576, 96, 96],
        [96, 576, 96, 96],
        [192, 576, 96, 96],
        [0, 672, 96, 96],
        [96, 672, 96, 96],
        [192, 672, 96, 96],
      ],
    },
    boy2: {
      img: charactersIMG,
      frames: [
        [288, 384, 96, 96],
        [384, 384, 96, 96],
        [480, 384, 96, 96],
        [288, 480, 96, 96],
        [384, 480, 96, 96],
        [480, 480, 96, 96],
        [288, 576, 96, 96],
        [384, 576, 96, 96],
        [480, 576, 96, 96],
        [288, 672, 96, 96],
        [384, 672, 96, 96],
        [480, 672, 96, 96],
      ],
    },
    boy3: {
      img: charactersIMG,
      frames: [
        [576, 384, 96, 96],
        [672, 384, 96, 96],
        [768, 384, 96, 96],
        [576, 480, 96, 96],
        [672, 480, 96, 96],
        [768, 480, 96, 96],
        [576, 576, 96, 96],
        [672, 576, 96, 96],
        [768, 576, 96, 96],
        [576, 672, 96, 96],
        [672, 672, 96, 96],
        [768, 672, 96, 96],
      ],
    },
  },
};
