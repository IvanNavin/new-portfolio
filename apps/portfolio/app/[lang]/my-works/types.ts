import { StaticImageData } from 'next/image';

type WorkStatus = 'New' | 'in process';

export type Option = {
  label: string;
  value: string | EWorkType;
};

export enum EWorkType {
  Game = 'Game',
  Education = 'Education',
  Productivity = 'Productivity',
  Portfolio = 'Portfolio',
  VisualEffect = 'VisualEffect',
}

export type Work = {
  id: string;
  name: string;
  workType?: EWorkType[];
  status?: WorkStatus;
  route: string;
  stack: string[];
  frontPicture?: StaticImageData;
  backPicture?: StaticImageData;
};

export type Filters = {
  workType: EWorkType[];
  stack: string[];
};

export enum ESkill {
  React = 'React',
  NextJS = 'Next.js',
  TypeScript = 'TypeScript',
  Tailwind = 'Tailwind',
  Sass = 'Sass',
  ESLint = 'ESLint',
  Prettier = 'Prettier',
  Prisma = 'Prisma',
  Mantine = 'Mantine UI',
  NextAuth = 'NextAuth',
  GoogleOneTap = 'Google One Tap',
  HTML = 'HTML',
  CSS = 'CSS',
  JavaScript = 'JavaScript',
  ReduxToolkit = 'Redux Toolkit',
  ReactDatepicker = 'React Datepicker',
  ReactHookForm = 'React Hook Form',
  MaterialUI = 'Material UI',
  TurboRepo = 'TurboRepo',
  GSAP = 'GSAP',
  ReactI18Next = 'React i18next',
  Canvas = 'Canvas',
  Node = 'Node',
  Hapi = 'Hapi',
  Websockets = 'Websockets',
  Chat = 'Chat',
  Yup = 'Yup',
}
