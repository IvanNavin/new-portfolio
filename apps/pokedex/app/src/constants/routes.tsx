interface IGeneralMenu {
  title: string;
  link: LinkEnum;
}

export enum LinkEnum {
  HOME = '/',
  POKEDEX = '/pokedex',
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
];
