import { getLang } from '@app/utils/getLang';

export const ROUTES = {
  root: () => `/${getLang()}`,
  about: () => `/${getLang()}/about`,
  myWorks: () => `/${getLang()}/my-works`,
  english: () => `/${getLang()}/my-works/english`,
  ganttChart: () => `/${getLang()}/my-works/gantt-chart`,
  miner: () => `/${getLang()}/my-works/miner`,
  pokedex: () => `/${getLang()}/my-works/pokedex`,
  portfolio: () => `/${getLang()}/my-works/portfolio`,
  rpg: () => `/${getLang()}/my-works/rpg`,
  thanos: () => `/${getLang()}/my-works/thanos`,
  contact: () => `/${getLang()}/contact`,
  performances: () => `/${getLang()}/performances`,
  accessibility: () => `/${getLang()}/performances/accessibility`,
  regexp: () => `/${getLang()}/performances/regexp`,
};
