import { StaticImageData } from 'next/image';

type WorkStatus = 'New' | 'in process';

export type Work = {
  id: string;
  name: string;
  status?: WorkStatus;
  route: string;
  stack: string[];
  frontPicture?: StaticImageData;
  backPicture?: StaticImageData;
};
