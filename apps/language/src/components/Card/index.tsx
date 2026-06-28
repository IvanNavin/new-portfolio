import { clsxm } from '@repo/utils';
import { CheckSquareOutlined, DeleteOutlined } from '@src/components';
import { useState } from 'react';

import s from './Card.module.scss';

type Props = {
  isDone: boolean;
  word: string;
  translation: string;
  onDone: () => void;
  onDelete: () => void;
};

export const Card = ({
  isDone,
  word,
  translation,
  onDone,
  onDelete,
}: Props) => {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((prev) => !prev);

  return (
    <div className={s.root}>
      <div
        className={clsxm(s.card, flipped && s.flipped, isDone && s.done)}
        role='button'
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`Flip the card for "${word}"`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className={s.front}>{word}</div>
        <div className={s.back}>{translation}</div>
      </div>
      <div className={s.icons}>
        <CheckSquareOutlined onClick={onDone} />
      </div>
      <div className={clsxm(s.icons, s.deleted)}>
        <DeleteOutlined onClick={onDelete} />
      </div>
    </div>
  );
};
