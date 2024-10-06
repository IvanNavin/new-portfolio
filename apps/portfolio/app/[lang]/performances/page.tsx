'use client';
import { NavMenuItem } from '@app/[lang]/nav-menu-item';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

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
  ];

  return (
    <Container lang={lang} backText={t('ivan')} title={t('performances.title')}>
      <nav className='absolute left-[114px] top-1/2 flex -translate-y-1/2 flex-col items-center'>
        {reports.map((item, idx) => (
          <NavMenuItem
            key={item.first}
            item={item}
            textClassName={clsxm('text-[3vw]', idx !== 0 && 'text-red-600')}
          />
        ))}
      </nav>
    </Container>
  );
}
