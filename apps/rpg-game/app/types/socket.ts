export type ServerToClientEvents = {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  playerMoved: (data: { x: number; y: number }) => void;
  startGame: (message: string) => void; // Сповіщення про старт гри
  enableChat: (playerId: string) => void; // Вмикає чат із гравцем
};

export type ClientToServerEvents = {
  hello: () => void;
  move: (data: { x: number; y: number }) => void;
  setName: (name: string) => void; // Передача імені гравця
  startGame: () => void; // Гравець натискає StartGame
};

export type InterServerEvents = {
  ping: () => void;
};

export type SocketData = {
  name: string;
  age: number;
  position: { x: number; y: number }; // Позиція гравця
};
