'use client';
import { Magnetic } from '@components/Magnetic';
import { GitHub, LinkedIn, Mail } from '@components/svg';
import { clsxm } from '@repo/utils';
import { TFunction } from 'i18next';
import { ReactNode } from 'react';

import {
  CONTACT_EMAIL,
  CONTACT_GITHUB,
  CONTACT_LINKEDIN,
} from './contactConfig';

type Props = {
  t: TFunction;
};

type DirectLink = {
  key: string;
  href: string;
  label: string;
  external: boolean;
  icon: ReactNode;
};

/**
 * Direct contact buttons row: Email (mailto), LinkedIn, GitHub.
 *
 * Sits *above* the Calendly embed as a fast-path for folks who'd
 * rather drop a line than book a slot. Each button uses `<Magnetic>`
 * for the same cursor-pull as the rest of the site's CTAs, and a
 * gold-on-hover border so the affordance lights up clearly against
 * the cosmic background.
 */
export const ContactLinks = ({ t }: Props) => {
  const links: DirectLink[] = [
    {
      key: 'email',
      href: `mailto:${CONTACT_EMAIL}`,
      label: t('contacts.email'),
      external: false,
      icon: <Mail width={20} height={20} />,
    },
    {
      key: 'linkedin',
      href: CONTACT_LINKEDIN,
      label: 'LinkedIn',
      external: true,
      icon: <LinkedIn width={20} height={20} />,
    },
    {
      key: 'github',
      href: CONTACT_GITHUB,
      label: 'GitHub',
      external: true,
      icon: <GitHub width={20} height={20} />,
    },
  ];

  return (
    <ul className='flex flex-wrap items-center justify-center gap-4'>
      {links.map((link) => (
        <li key={link.key}>
          <Magnetic>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel='noopener noreferrer'
              className={clsxm(
                'group inline-flex items-center gap-2.5 rounded-full',
                'border border-white/20 bg-white/[0.03] px-5 py-2.5',
                'text-sm uppercase tracking-widest text-white/85',
                'transition-colors duration-200',
                'hover:border-yellow-400/70 hover:bg-yellow-400/[0.06]',
                'hover:text-yellow-300 focus-visible:outline-none',
                'focus-visible:border-yellow-400 focus-visible:bg-yellow-400/10',
              )}
            >
              <span className='transition-transform duration-200 group-hover:scale-110'>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </a>
          </Magnetic>
        </li>
      ))}
    </ul>
  );
};
