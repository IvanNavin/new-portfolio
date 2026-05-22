'use client';
import { updateUrlLang } from '@app/utils/updateUrlLang';
import { clsxm } from '@repo/utils'; // import * as Flag from 'country-flag-icons/react/3x2';
import { DE, GB, RU, UA } from 'country-flag-icons/react/3x2';
import { useRouter } from 'next/navigation';

type Props = {
  lang: string;
};

const flags = [
  { lng: 'en', flag: <GB />, label: 'English' },
  { lng: 'de', flag: <DE />, label: 'Deutsch' },
  { lng: 'ua', flag: <UA />, label: 'Українська' },
  { lng: 'ru', flag: <RU />, label: 'Русский' },
];

export const LanguageSwitcher = ({ lang }: Props) => {
  const router = useRouter();

  return (
    <section
      className={clsxm(
        'fixed hover:right-0 -right-8 top-64 z-50',
        'w-[50px] flex flex-col items-end py-2.5 justify-around shadow-custom-glow',
        'rounded-l transition-all duration-300 ease-linear',
      )}
    >
      <span
        className={`text-white ${clsxm(
          'absolute left-0.5 rotate-180 select-none leading-none shadow-black text-shadow',
          '[writing-mode:tb-rl]',
        )}`}
      >
        Language
      </span>
      {flags.map(({ lng, flag, label }) => {
        const isCurrent = lang === lng;
        return (
          <button
            key={lng}
            type='button'
            aria-label={`Switch language to ${label}`}
            aria-current={isCurrent ? 'true' : undefined}
            disabled={isCurrent}
            className={clsxm(
              'm-1 h-4 w-5 cursor-pointer',
              isCurrent && 'shadow-full-glow cursor-not-allowed',
            )}
            onClick={() => {
              router.replace(updateUrlLang(lng));
            }}
          >
            {flag}
          </button>
        );
      })}
    </section>
  );
};
