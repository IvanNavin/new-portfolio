import { GameObjectsType } from '@app/types/gameObjects';
import { SpritesType } from '@app/types/sprites';
import { WorldType } from '@app/types/world';
import { Dispatch, SetStateAction } from 'react';

export type OptsType = {
  world: WorldType;
  sprites: SpritesType;
  gameObjects: GameObjectsType;
};

export type GlobalContextType = {
  opts: OptsType | null;
  setOpts: Dispatch<SetStateAction<OptsType | null>>;
  inGame: boolean;
  setInGame: Dispatch<SetStateAction<boolean>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
};
