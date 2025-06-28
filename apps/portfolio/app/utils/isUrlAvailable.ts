export const isUrlAvailable = (url: string) => {
  return fetch(url, { method: 'GET' })
    .then((response) => !!response?.ok)
    .catch(() => false);
};
