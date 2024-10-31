export const translate = async (word: string) => {
  const url = `https://lingvanex-translate.p.rapidapi.com/translate?from=en_GB&to=ru&text=${word}`;
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': process.env.X_RAPIDAPI_KEY!,
      'x-rapidapi-host': process.env.X_RAPIDAPI_HOST!,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    const getWord = await response.json();

    return getWord?.result;
  } catch (error) {
    console.error(error);
  }
};
