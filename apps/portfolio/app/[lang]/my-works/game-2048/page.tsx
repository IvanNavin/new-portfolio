import { Game2048 } from '@app/[lang]/my-works/game-2048/Game2048';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params: { lang } }: DefaultProps) {
  const isIframeAvailable = await isUrlAvailable(
    'https://2048-native.netlify.app/',
  );

  return <Game2048 lang={lang} isIframeAvailable={isIframeAvailable} />;
}
