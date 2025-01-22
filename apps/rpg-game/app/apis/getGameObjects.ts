import { backendUrl } from '@app/lib/env';

export const getGameObjects = async () => {
  const response = await fetch(`${backendUrl}/api/v1/gameObjects`).then((r) =>
    r.json(),
  );

  if (!response) {
    throw new Error('Failed to fetch data');
  }

  return response;
};
