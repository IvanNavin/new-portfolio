import { Pokedex } from '@app/[lang]/my-works/pokedex/Pokedex';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params: { lang } }: DefaultProps) {
  const isIframeAvailable = await isUrlAvailable(
    'https://pokedex-pedia.vercel.app',
  );

  return <Pokedex lang={lang} isIframeAvailable={isIframeAvailable} />;
}
