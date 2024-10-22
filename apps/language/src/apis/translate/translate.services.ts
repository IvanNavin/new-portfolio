export const translate = async (word: string) => {
  const res = await fetch(`/api/translate?word=${word}`);
  const getWord = await res.json();

  return getWord?.result;
};
