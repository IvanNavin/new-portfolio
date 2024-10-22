'use client';
import {
  addCard,
  deleteCard,
  fetchUserCards,
  updateCard,
} from '@src/apis/cards/cards.services';
import { translate } from '@src/apis/translate/translate.services';
import { Input } from '@src/components/Input';
import { CardType } from '@src/types';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import s from './CardList.module.scss';

import { Card } from '../Card';

export const CardList = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState<CardType[]>([]);
  const [value, setValue] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmitForm = async () => {
    setIsBusy(true);
    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  const onDone = async (id: string, remembered: boolean) => {
    await updateCard({ id, remembered: !remembered });
    await loadCards();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCard(id);
      await loadCards();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    userEmail && void loadCards();
  }, [userEmail]);

  return (
    <>
      <div className={s.form}>
        <Input
          placeholder='Enter a word here:'
          buttonLabel='Search'
          loading={isBusy}
          value={value}
          onSearch={handleSubmitForm}
          onChange={handleInputChange}
          error={error}
        />
        {error && <div className={s.error}>{error}</div>}
      </div>
      <div className={s.root}>
        {items.map(({ word, translation, id, remembered }) => (
          <Card
            key={id}
            onDelete={() => handleDelete(id)}
            onDone={() => onDone(id, !!remembered)}
            isDone={!!remembered}
            word={word}
            translation={translation}
          />
        ))}
      </div>
    </>
  );
};
