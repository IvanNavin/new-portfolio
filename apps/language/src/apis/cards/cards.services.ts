const API_URL = '/api/cards';

// GET: Get all user cards
export const fetchUserCards = async (userEmail: string) => {
  const response = await fetch(`${API_URL}?userEmail=${userEmail}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user cards');
  }

  const cards = await response.json();

  return cards.sort((a: { createdAt: string }, b: { createdAt: string }) =>
    a.createdAt.localeCompare(b.createdAt),
  );
};

// POST: Add a new card
export const addCard = async (cardData: {
  userEmail: string;
  word: string;
  translation: string;
}) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    throw new Error('Failed to add card');
  }
  return response.json();
};

// PATCH: Update the card
export const updateCard = async (cardData: {
  id: string;
  word?: string;
  translation?: string;
  remembered?: boolean;
}) => {
  const response = await fetch(API_URL, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    throw new Error('Failed to update card');
  }
  return response.json();
};

// DELETE: Delete the card
export const deleteCard = async (cardId: string) => {
  const response = await fetch(`${API_URL}?cardId=${cardId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete card');
  }
  return response.json();
};
