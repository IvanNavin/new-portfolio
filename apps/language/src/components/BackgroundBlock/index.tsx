import { StaticImageData } from 'next/image';
import { CSSProperties, ReactNode } from 'react';

import s from './HeaderBlock.module.scss';

type Props = {
  children: ReactNode;
  backgroundImg: string | StaticImageData;
  fullHeight?: boolean;
};

export const BackgroundBlock = ({
  children,
  backgroundImg,
  fullHeight = false,
}: Props) => {
  const styleCover: CSSProperties = {
    backgroundImage: `url(${backgroundImg})`,
  };

  if (fullHeight) {
    styleCover.height = '100vh';
  }

  return (
    <section className={s.cover} style={styleCover}>
      <div className={s.wrap}>{children}</div>
    </section>
  );
};
