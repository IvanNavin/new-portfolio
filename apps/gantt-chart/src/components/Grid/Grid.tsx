import {ReactElement, ReactNode } from "react";

import s from './Grid.module.sass';

interface IGrid {
  children: ReactNode | ReactElement | ReactElement[];
}

export const Grid = ({ children }: IGrid) => {
  return (
    <div className={s.Grid}>
      { children }
    </div>
  );
};