import { getGameObjects } from '@app/apis/getGameObjects';
import { getSprites } from '@app/apis/getSprites';
import { getWorld } from '@app/apis/getWorld';
import { GameObjectsType, SpritesType, WorldType } from '@app/types';
import { Layout } from '@components/Layout';
import { use } from 'react';

export default function Home() {
  const world: WorldType = use(getWorld());
  const sprites: SpritesType = use(getSprites());
  const gameObjects: GameObjectsType = use(getGameObjects());
  const opts = {
    world,
    sprites,
    gameObjects,
  };

  return <Layout opts={opts} />;
}
