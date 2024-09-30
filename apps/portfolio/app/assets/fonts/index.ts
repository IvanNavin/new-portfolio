import { Roboto, Russo_One } from 'next/font/google';

export const roboto = Roboto({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin'],
});
