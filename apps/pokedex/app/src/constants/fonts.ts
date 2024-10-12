import { Karla, Source_Sans_3 } from 'next/font/google';

export const karla = Karla({
  subsets: ['latin'], // Ти можеш вибрати необхідні набори символів
  weight: ['400', '700'], // Ти можеш вибрати різні ваги шрифтів
});

export const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});
