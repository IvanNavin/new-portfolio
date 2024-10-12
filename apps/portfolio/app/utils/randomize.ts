export const randomCount = (arr: string[], count = 4): string[] => {
  let i = 0;
  const result: string[] = [];

  while (i < count) {
    const random = Math.floor(Math.random() * arr.length);
    const randomFact = arr[random];

    if (!result.includes(randomFact)) {
      result.push(randomFact);
      i++;
    }
  }

  return result;
};
