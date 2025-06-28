import { Miner } from '@app/[lang]/my-works/miner/Miner';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params: { lang } }: DefaultProps) {
  const isIframeAvailable = await isUrlAvailable(
    'https://miner-native.vercel.app/',
  );

  return <Miner lang={lang} isIframeAvailable={isIframeAvailable} />;
}
