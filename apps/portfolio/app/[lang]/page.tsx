'use client';
import { NavMenuItem } from '@app/[lang]/nav-menu-item';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import myPhoto from '@assets/img/iam-wb-1.png';
import Fluid from '@components/Fluid';
import { useTranslation } from '@i18n/client';
import { clsxm, isTouchDevice } from '@repo/utils';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';

// Ivan started at Evoplay in October 2018. Count full years since then so we
// don't jump to 8+ on Jan 1, 2026 — full 8 years lands in October 2026.
const CAREER_START = new Date(2018, 9, 1);

export default function Home({ params }: DefaultProps) {
  const { lang } = use(params);
  const [isTouch, setIsTouch] = useState(false);
  const { t } = useTranslation();
  const now = new Date();
  const monthsSinceStart =
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth());
  const yearsOfExperience = Math.max(0, Math.floor(monthsSinceStart / 12));

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
      second: t('main.talks'),
      href: ROUTES.talks(lang),
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
          'animate-fadeInWithScale ease-linear duration-1000 opacity-80 z-40',
        )}
      >
        <Image
          alt='Ivan Holovko'
          src={myPhoto}
          width={666}
          height={666}
          priority={true}
          fetchPriority='high'
          sizes='(max-width: 768px) 80vw, 50vw'
          draggable={false}
          className='animate-fadeInWithScale object-contain opacity-80'
        />
      </section>
      <p
        className={clsxm(
          'pointer-events-none absolute right-6 bottom-20 z-50 max-w-[50vw] text-right',
          'text-[clamp(11px,1.6vw,18px)] tracking-wider text-white/85',
          'animate-fadeInWithScale ease-linear duration-1000',
        )}
      >
        {t('main.tagline', { years: yearsOfExperience })}
      </p>
      <div className='pointer-events-none absolute bottom-6 block w-full animate-bounce text-center text-[3.6vmin] text-white'>
        {isTouch ? t('main.tap') : t('main.slide')}
      </div>
      <span className='absolute bottom-0 left-0 text-[8px]'>
        {t('main.presPForPause')}
      </span>
    </main>
  );
}
