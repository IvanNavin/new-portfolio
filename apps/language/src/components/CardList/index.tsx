'use client';
import { useLocalStorage } from '@mantine/hooks';
import {
  addCard,
  deleteCard,
  fetchUserCards,
  updateCard,
} from '@src/apis/cards/cards.services';
import { translate } from '@src/apis/translate/translate.services';
import { CustomLoader } from '@src/components/CustomLoader';
import { Input } from '@src/components/Input';
import { CardType } from '@src/types';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import s from './CardList.module.scss';

import { Card } from '../Card';

export const CardList = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState<CardType[]>([]);
  const [value, setValue] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [cards, setCards] = useLocalStorage<CardType[]>({
    key: 'cards',
    defaultValue: [],
  });

  const userEmail = session?.user?.email || '';

  const handleInputChange = (val: string) => {
    setError('');
    setValue(val);
  };

  const loadCards = async () => {
    if (!userEmail) return;

    const cards = await fetchUserCards(userEmail);
    setItems(cards?.length ? cards : []);
  };

  const moveLocalStorageCardsToDB = async () => {
    for (const card of cards) {
      await addCard({
        userEmail,
        word: card.word,
        translation: card.translation,
      });
    }
    setCards([]);
  };

  const handleSubmitForm = async () => {
    setIsBusy(true);
    try {
      if (session) {
        if (items.some((item) => item.word === value)) {
          setError('This word is already in your list');
          setIsBusy(false);
          return;
        }

        const translation = await translate(value);

        if (!translation) {
          setError('Failed to translate the word');
          setIsBusy(false);
          return;
        }

        await addCard({
          userEmail,
          word: value,
          translation,
        });

        await loadCards();
        setValue('');
      } else {
        const translation = await translate(value);

        if (!translation) {
          setError('Failed to translate the word');
          setIsBusy(false);
          return;
        }

        setCards((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            word: value,
            translation,
          } as CardType,
        ]);
        setValue('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const onDone = async (id: string, remembered: boolean) => {
    setIsBusy(true);
    if (userEmail) {
      await updateCard({ id, remembered: !remembered });
      await loadCards();
    } else {
      const updatedCards = cards.map((card) =>
        card.id === id ? { ...card, remembered: !remembered } : card,
      );
      setCards(updatedCards);
    }
    setIsBusy(false);
  };

  const handleDelete = async (id: string) => {
    setIsBusy(true);
    try {
      if (userEmail) {
        await deleteCard(id);
        await loadCards();
      } else {
        const updatedCards = cards.filter((card) => card.id !== id);
        setCards(updatedCards);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  // Run the guest→DB migration at most once per login.
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!userEmail) {
      migratedRef.current = false;
      return;
    }

    (async () => {
      setIsBusy(true);

      // useLocalStorage returns [] on first render and hydrates later. Keep
      // `cards` in the deps so guest cards migrate once they hydrate instead of
      // being dropped against the empty default.
      if (!migratedRef.current && cards.length) {
        migratedRef.current = true;
        await moveLocalStorageCardsToDB();
      }

      await loadCards();

      setIsBusy(false);
    })();
    // moveLocalStorageCardsToDB/loadCards are stable enough for this flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, cards]);

  return (
    <>
      {isBusy && <CustomLoader className='fixed bottom-6 right-6' />}
      <div className={s.form}>
        <Input
          placeholder='Enter a word here:'
          buttonLabel='Search'
          value={value}
          loading={isBusy}
          onSearch={handleSubmitForm}
          onChange={handleInputChange}
          error={error}
        />
        {error && <div className={s.error}>{error}</div>}
      </div>
      <div className={s.root}>
        {(userEmail ? items : cards).map(
          ({ word, translation, id, remembered }) => (
            <Card
              key={id}
              onDelete={() => handleDelete(id)}
              onDone={() => onDone(id, !!remembered)}
              isDone={!!remembered}
              word={word}
              translation={translation}
            />
          ),
        )}
      </div>
    </>
  );
};
