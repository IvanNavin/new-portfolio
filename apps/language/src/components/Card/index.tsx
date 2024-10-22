'use client';
import { clsxm } from '@repo/utils';
import { CheckSquareOutlined, DeleteOutlined } from '@src/components';

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
  return (
    <div className={s.root}>
      <div className={clsxm(s.card, isDone && s.done)}>
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
