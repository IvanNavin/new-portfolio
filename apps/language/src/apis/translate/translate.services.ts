export const translate = async (word: string) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word }),
    });
    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error(error);
  }
};
