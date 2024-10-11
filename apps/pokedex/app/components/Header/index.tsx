'use client';
import React from 'react';
import cn from 'classnames';

import { GENERAL_MENU } from '@app/routes';

import s from './Header.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@app/components/svg';

const Header = () => {
  const pathname = usePathname();

  return (
    <header className={s.root}>
      <div className={s.wrap}>
        <Logo className={s.pokemonLogo} />
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
