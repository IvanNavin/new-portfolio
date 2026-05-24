'use client';
import { updateUrlLang } from '@app/utils/updateUrlLang';
import { clsxm } from '@repo/utils'; // import * as Flag from 'country-flag-icons/react/3x2';
import { DE, GB, RU, UA } from 'country-flag-icons/react/3x2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  // Tap on the "Language" label toggles the panel open. Desktop also
  // keeps the original hover-to-open affordance via `md:hover:right-0`,
  // so we cover both pointer types without disturbing the design intent
  // of "flags are hidden until you ask for them".
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className={clsxm(
        'fixed top-64 z-50',
        'w-[50px] flex flex-col items-end py-2.5 justify-around shadow-custom-glow',
        'rounded-l transition-all duration-300 ease-linear',
        isOpen ? 'right-0' : '-right-8',
        'md:hover:right-0',
      )}
    >
      <button
        type='button'
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
        aria-label={
          isOpen ? 'Hide language switcher' : 'Show language switcher'
        }
        className={clsxm(
          'absolute left-0.5 rotate-180 select-none leading-none shadow-black text-shadow',
          '[writing-mode:tb-rl]',
          'cursor-pointer border-0 bg-transparent p-0 text-white',
        )}
      >
        Language
      </button>
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
