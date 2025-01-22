type SpriteReference = [string, string];

interface StaticEntity {
  name: string; // The name of the entity
  type: 'static'; // The type is static
  sprite: SpriteReference; // Reference to sprite
  frame: number; // Number of frame
}

interface AnimationState {
  duration: number; // Animation duration in ms
  frames: number[]; // Array of frames
}

interface AnimatedEntity {
  name: string; // The name of the entity
  type: 'animated'; // Type — animated
  size: number; // Entity size
  spriteSize: number; // Sprite size
  sprite: SpriteReference; // Reference to sprite
  states: {
    [key: string]: AnimationState; // Animation states (eg "main", "down", "left")
  };
}

type GameEntity = StaticEntity | AnimatedEntity;

export interface GameObjectsType {
  [key: string]: GameEntity; // The key is the name of the entity (for example, "grass", "boy1")
}
