import { backendUrl } from '@app/lib/env';

export const getSprites = async () => {
  const response = await fetch(`${backendUrl}/api/v1/sprites`).then((r) =>
    r.json(),
  );

  if (!response) {
    throw new Error('Failed to fetch data');
  }

  return response;
};
