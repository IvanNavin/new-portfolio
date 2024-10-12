import { PropsWithChildren } from 'react';

interface IGeneralMenu {
  title: string;
  link: LinkEnum;
}

export enum LinkEnum {
  HOME = '/',
  POKEDEX = '/pokedex',
  LEGENDARIES = '/legendaries',
  DOCUMENTATION = '/documentation',
  POKEMON = '/pokedex/:id',
}

export const GENERAL_MENU: IGeneralMenu[] = [
  {
    title: 'Home',
    link: LinkEnum.HOME,
  },
  {
    title: 'Pokédex',
    link: LinkEnum.POKEDEX,
  },
  {
    title: 'Legendaries',
    link: LinkEnum.LEGENDARIES,
  },
  {
    title: 'Documentation',
    link: LinkEnum.DOCUMENTATION,
  },
];

const SECOND_ROUTES: IGeneralMenu[] = [
  {
    title: 'Pokemon',
    link: LinkEnum.POKEMON,
  },
];

interface IAccMenu {
  [n: string]: (props: PropsWithChildren<any>) => JSX.Element;
}

// const routes = [...GENERAL_MENU, ...SECOND_ROUTES].reduce(
//   (acc: IAccMenu, item: IGeneralMenu) => {
//     acc[item.link] = item.component;
//     return acc;
//   },
//   {},
// );

// export default routes;
