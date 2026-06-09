'use client';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import { use } from 'react';

import { BookingEmbed } from './BookingEmbed';
import {
  CAL_BOOKING_LINK,
  CAL_EMBED_SCRIPT_SRC,
  CAL_ORIGIN,
} from './contactConfig';
import { ContactLinks } from './ContactLinks';
import { RotateStar } from './RotateStar';

/**
 * Contact page — replaced the old name/message form (which routed
 * to a Telegram bot) with a richer two-track surface:
 *
 *   1. Direct contact links (mail, LinkedIn, GitHub) for folks who
 *      already know what they want to say.
 *   2. A Cal.com inline embed for booking a real call — feels more
 *      "open for work" than a blind contact form would. Cal.com over
 *      Calendly because its free tier covers unlimited event types
 *      and lets us drop the third-party watermark.
 *
 * The cosmic RotateStar background stays — it's signature to this
 * page and doesn't conflict with the new layout.
 */
export default function Page({ params }: DefaultProps) {
  const { lang } = use(params);
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('ivan')}
      title={t('contacts.sayHi')}
      titleClassName='text-center'
    >
      <RotateStar />
      <div className='relative z-10 mx-auto flex max-w-[820px] flex-col items-center gap-10'>
        <p className='max-w-[520px] text-center text-sm leading-relaxed text-white/70'>
          {t('contacts.intro')}
        </p>
        <ContactLinks t={t} />
        <BookingEmbed
          calLink={CAL_BOOKING_LINK}
          origin={CAL_ORIGIN}
          scriptSrc={CAL_EMBED_SCRIPT_SRC}
          caption={t('contacts.bookCall')}
          resetLabel={t('contacts.changeDuration')}
        />
      </div>
    </Container>
  );
}
