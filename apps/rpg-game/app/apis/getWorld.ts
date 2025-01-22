import { backendUrl } from '@app/lib/env';

export const getWorld = async () => {
  const response = await fetch(`${backendUrl}/api/v1/world`).then((r) =>
    r.json(),
  );

  if (!response) {
    throw new Error('Failed to fetch data');
  }

  return response;
};
