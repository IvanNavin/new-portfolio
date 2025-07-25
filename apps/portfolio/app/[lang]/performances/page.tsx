'use client';
import { NavMenuItem } from '@app/[lang]/nav-menu-item';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation();

  const reports = [
    {
      first: t('performances.accessibility'),
      second: t('performances.accessibility'),
      href: ROUTES.accessibility(lang),
    },
    {
      first: t('performances.regexp'),
      second: t('performances.regexp'),
      href: ROUTES.regexp(lang),
    },
    {
      first: t('performances.testingWithJest'),
      second: t('performances.testingWithJest'),
      href: ROUTES.jest(lang),
    },
    {
      first: 'Type vs Interface',
      second: 'Type vs Interface',
      href: ROUTES.typeVsInterface(lang),
    },
  ];

  return (
    <Container lang={lang} backText={t('ivan')} title={t('performances.title')}>
      <nav className='absolute left-12 top-1/2 flex -translate-y-1/2 flex-col items-center md:left-[114px]'>
        {reports.map((item, idx) => (
          <NavMenuItem
            key={item.first}
            item={item}
            textClassName={clsxm('text-[3vw]', idx !== 0 && 'text-red-600')}
            index={idx}
          />
        ))}
      </nav>
    </Container>
  );
}
