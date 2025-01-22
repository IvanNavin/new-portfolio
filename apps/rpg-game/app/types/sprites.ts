type Frame = [number, number, number, number];

interface Terrain {
  img: string; // Path to image
  frames: Frame[]; // Array of frames
}

interface Terrains {
  [key: string]: Terrain; // Dynamic keys, for example "grass", "water", "wall"
}

interface Character {
  img: string; // Path to image
  frames: Frame[]; // Array of frames
}

interface Characters {
  [key: string]: Character; // Dynamic keys, for example "girl1", "boy1"
}

export interface SpritesType {
  terrain: Terrains; // Object with all types of terrain
  characters: Characters; // Object with all characters
}
