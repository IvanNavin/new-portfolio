'use client';
import { Logo } from '@app/src/components/svg';
import { GENERAL_MENU } from '@src/constants/routes';
import cn from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import s from './Header.module.scss';

const Header = () => {
  const pathname = usePathname();

  return (
    <header className={s.root}>
      <div className={s.wrap}>
        <Link href='/'>
          <Logo className={s.pokemonLogo} />
        </Link>
        <nav className={s.menuWrap}>
          {GENERAL_MENU.map(({ title, link }) => (
            <Link
              key={title}
              href={link}
              className={cn(s.menuLink, {
                [s.activeLink]: link === pathname,
              })}
            >
              {title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header);
