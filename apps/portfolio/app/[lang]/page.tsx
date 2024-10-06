'use client';
import { NavMenuItem } from '@app/[lang]/nav-menu-item';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import myPhoto from '@assets/img/iam-wb-1.png';
import Fluid from '@components/Fluid';
import { useTranslation } from '@i18n/client';
import { clsxm, isTouchDevice } from '@repo/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home({ params: { lang } }: DefaultProps) {
  const [isTouch, setIsTouch] = useState(false);
  const { t } = useTranslation(lang);

  const navMenu = [
    {
      first: t('main.hello'),
      second: t('main.aboutMe'),
      href: ROUTES.about(lang),
    },
    {
      first: t('main.my'),
      second: t('main.myWorks'),
      href: ROUTES.myWorks(lang),
    },
    {
      first: t('main.names'),
      second: t('main.contacts'),
      href: ROUTES.contact(lang),
    },
    {
      first: t('main.ivan'),
      second: t('main.performances'),
      href: ROUTES.performances(lang),
    },
  ];

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return (
    <main className='relative h-screen w-screen overflow-hidden'>
      <Fluid />
      <nav className='absolute left-[114px] top-1/2 flex -translate-y-1/2 flex-col items-center'>
        {navMenu.map((item, index) => (
          <NavMenuItem key={item.first} item={item} index={index} />
        ))}
      </nav>
      <section
        className={clsxm(
          'pointer-events-none absolute bottom-0 right-0 max-h-screen w-1/2 max-w-[666px]',
          'animate-fadeInWithScale ease-linear duration-1000 opacity-80',
        )}
      >
        <Image
          alt='Ivan Holovko'
          src={myPhoto}
          width={666}
          height={666}
          priority={true}
          className='animate-fadeInWithScale object-contain opacity-80'
        />
      </section>
      <div className='pointer-events-none absolute bottom-6 block w-full animate-bounce text-center text-[3.6vmin] text-white'>
        {`${isTouch ? 'tap' : 'slide'} anywhere`}
      </div>
      <span className='absolute bottom-0 left-0 text-[8px]'>
        {t('main.presPForPause')}
      </span>
    </main>
  );
}
