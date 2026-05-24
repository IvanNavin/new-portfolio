'use client';
import { ROUTES } from '@app/constants/routes';
import { updateUrlLang } from '@app/utils/updateUrlLang';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { Locale } from '@root/i18n-config';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import './styles.css';

type Props = {
  lang: Locale;
};

const LANGUAGES: Array<{ lng: Locale; label: string; emoji: string }> = [
  { lng: 'en', label: 'English', emoji: '🇬🇧' },
  { lng: 'de', label: 'Deutsch', emoji: '🇩🇪' },
  { lng: 'ua', label: 'Українська', emoji: '🇺🇦' },
  { lng: 'ru', label: 'Русский', emoji: '🇷🇺' },
];

// Chord shortcuts (GitHub / Gmail style): press G, then within ~1.2s
// press one of the second keys to navigate. No modifier so we don't
// collide with native browser shortcuts (Cmd+1 = tab switch, etc.).
const CHORD_TIMEOUT_MS = 1200;
const NAV_SHORTCUTS = {
  about: ['G', 'A'],
  myWorks: ['G', 'W'],
  talks: ['G', 'T'],
  contact: ['G', 'C'],
} as const;

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className='command-palette__kbd'>{children}</kbd>
);

const Shortcut = ({ keys }: { keys: readonly string[] }) => (
  <span className='command-palette__shortcut'>
    {keys.map((k, i) => (
      <Kbd key={i}>{k}</Kbd>
    ))}
  </span>
);

/**
 * Returns true if the user is currently typing into an input-like
 * element. We use this to ignore single-letter chord shortcuts so
 * they don't fire while someone fills out the contact form, types
 * into the cmdk search, etc.
 */
const isTypingInInput = () => {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
};

export const CommandPalette = ({ lang }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Chord state lives in refs so the keydown handler doesn't need to
  // be re-created on every chord tick.
  const chordPrimedRef = useRef(false);
  const chordResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const navigate = (path: string) => {
      router.push(path);
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K — toggle the palette from anywhere.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // Bail on any modifier-bearing key, while a text field has
      // focus, or while the palette is open (cmdk handles its own
      // keys then).
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingInInput()) return;
      if (open) return;

      const key = e.key.toUpperCase();

      if (!chordPrimedRef.current) {
        if (key === 'G') {
          chordPrimedRef.current = true;
          if (chordResetRef.current) clearTimeout(chordResetRef.current);
          chordResetRef.current = setTimeout(() => {
            chordPrimedRef.current = false;
          }, CHORD_TIMEOUT_MS);
        }
        return;
      }

      // Chord is primed — interpret next key.
      if (chordResetRef.current) clearTimeout(chordResetRef.current);
      chordPrimedRef.current = false;

      // Match against NAV_SHORTCUTS second keys.
      const matches: Record<string, () => void> = {
        [NAV_SHORTCUTS.about[1]]: () => navigate(ROUTES.about(lang)),
        [NAV_SHORTCUTS.myWorks[1]]: () => navigate(ROUTES.myWorks(lang)),
        [NAV_SHORTCUTS.talks[1]]: () => navigate(ROUTES.talks(lang)),
        [NAV_SHORTCUTS.contact[1]]: () => navigate(ROUTES.contact(lang)),
      };
      const action = matches[key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (chordResetRef.current) clearTimeout(chordResetRef.current);
    };
  }, [lang, open, router]);

  const runAndClose = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label='Command palette'
      className='command-palette'
    >
      <div className='command-palette__inner'>
        <Command.Input
          autoFocus
          placeholder='Type a command or search…'
          className='command-palette__input'
        />
        <Command.List className='command-palette__list'>
          <Command.Empty className='command-palette__empty'>
            No results found.
          </Command.Empty>

          <Command.Group heading='Navigate' className='command-palette__group'>
            <Command.Item
              onSelect={() =>
                runAndClose(() => router.push(ROUTES.about(lang)))
              }
            >
              <span className='command-palette__icon'>👋</span>
              <span className='command-palette__label'>
                {t('main.aboutMe')}
              </span>
              <Shortcut keys={NAV_SHORTCUTS.about} />
            </Command.Item>
            <Command.Item
              onSelect={() =>
                runAndClose(() => router.push(ROUTES.myWorks(lang)))
              }
            >
              <span className='command-palette__icon'>🛠️</span>
              <span className='command-palette__label'>
                {t('main.myWorks')}
              </span>
              <Shortcut keys={NAV_SHORTCUTS.myWorks} />
            </Command.Item>
            <Command.Item
              onSelect={() =>
                runAndClose(() => router.push(ROUTES.talks(lang)))
              }
            >
              <span className='command-palette__icon'>🎤</span>
              <span className='command-palette__label'>{t('main.talks')}</span>
              <Shortcut keys={NAV_SHORTCUTS.talks} />
            </Command.Item>
            <Command.Item
              onSelect={() =>
                runAndClose(() => router.push(ROUTES.contact(lang)))
              }
            >
              <span className='command-palette__icon'>✉️</span>
              <span className='command-palette__label'>
                {t('main.contacts')}
              </span>
              <Shortcut keys={NAV_SHORTCUTS.contact} />
            </Command.Item>
          </Command.Group>

          <Command.Group heading='Language' className='command-palette__group'>
            {LANGUAGES.map(({ lng, label, emoji }) => {
              const isCurrent = lang === lng;
              return (
                <Command.Item
                  key={lng}
                  disabled={isCurrent}
                  onSelect={() =>
                    runAndClose(() => router.replace(updateUrlLang(lng)))
                  }
                  className={clsxm(
                    isCurrent && 'command-palette__item--current',
                  )}
                >
                  <span className='command-palette__icon'>{emoji}</span>
                  <span className='command-palette__label'>{label}</span>
                  {isCurrent && (
                    <span className='command-palette__hint'>current</span>
                  )}
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
        <div className='command-palette__footer'>
          <span>
            <Kbd>↑↓</Kbd> navigate
          </span>
          <span>
            <Kbd>↵</Kbd> select
          </span>
          <span>
            <Kbd>esc</Kbd> close
          </span>
          <span className='command-palette__footer-spacer' />
          <span>
            <Kbd>G</Kbd> <Kbd>A/W/T/C</Kbd> jump from anywhere
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
};
