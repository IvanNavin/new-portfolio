import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        russo: ['Russo One', 'sans-serif'],
      },
      boxShadow: {
        'custom-glow': '0 0 1.5em #ffeacc, 0 1.25em 1.5em rgba(0, 0, 0, .2)',
        'full-glow':
          '0 0 1.5em #ffeacc, 0 0 2em rgba(0, 0, 0, .2), 0 0 5px #ffeacc',
        'white-offset': '8px 8px 0 rgba(255, 255, 255, 0.15)',
        'dark-sm': '1px 1px 4px rgba(0, 0, 0, 0.9)',
        'dark-inset': '0 0 50px rgba(0, 0, 0, 0.75) inset',
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
        none: 'none',
      },
      keyframes: {
        slideText: {
          '0%': { opacity: '0', top: '30vh' },
          '100%': { opacity: '1', top: '0' },
        },
        fadeInWithScale: {
          '0%': { opacity: '0.5', transform: 'scale(1.1)' },
          '100%': { opacity: '0.8', transform: 'scale(1)' },
        },
        animate1: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        animate2: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        animate3: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        animate4: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        rotateStar: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(1turn)' },
        },
        reRotateStar: {
          '0%': {
            opacity: '1',
            transform: 'scale(0.8) translate(-50%, -50%) rotate(-180deg)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(2.8) translate(-50%, -50%) rotate(180deg)',
          },
        },
        flyGrid: {
          '0%': {
            transform: 'translate3d(0px, 0px, 0px)',
          },
          '75%': {
            transform: 'translate3d(-200px, 0px, 0px)',
          },
          '99%': {
            transform: 'translate3d(100px, 0px, 0px)',
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        'linkedin-rotate': {
          to: {
            transform: 'translate(-80px, 0) rotate(-1080deg)',
            opacity: '1',
          },
        },
        'github-rotate': {
          to: {
            transform: 'translate(-60px, 60px) rotate(1080deg)',
            opacity: '1',
          },
        },
        'instagram-rotate': {
          to: {
            transform: 'translate(0px, 70px) rotate(1080deg)',
            opacity: '1',
          },
        },
        delay: {
          '0%': { opacity: '0' },
          '100%': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        rotate: {
          '0%': {
            transform: 'rotate3d(1, 1, 1, 65deg) rotate(0)',
          },
          '100%': {
            transform: 'rotate3d(1, 1, 1, 65deg) rotate(360deg)',
          },
        },
        'move-twink-back': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-10000px 5000px' },
        },
        progress: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        slideText: 'slideText 1s forwards',
        fadeInWithScale: 'fadeInWithScale 1s forwards',
        animate1: 'animate1 2s linear infinite 1s',
        animate2: 'animate2 2s linear infinite',
        animate3: 'animate3 2s linear infinite 1s',
        animate4: 'animate4 2s linear infinite',
        rotateStar: 'rotateStar 60s linear infinite alternate',
        reRotateStar: 'rotateStar 30s linear infinite normal',
        flyGrid: 'flyGrid 1s linear forwards',
        'linkedin-rotate': 'linkedin-rotate 0.4s linear forwards',
        'github-rotate': 'github-rotate 0.4s linear 0.4s forwards',
        'instagram-rotate': 'instagram-rotate 0.8s linear 0.4s forwards',
        delay: '.4s delay var(--delay) forwards;',
        rotate: 'rotate 15s linear infinite',
        'move-twink-back': 'move-twink-back 200s linear infinite',
        progress: 'progress 7s linear infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
};
export default config;
