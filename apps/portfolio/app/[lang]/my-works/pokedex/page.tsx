import { Pokedex } from '@app/[lang]/my-works/pokedex/Pokedex';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params }: DefaultProps) {
  const { lang } = await params;
  const isIframeAvailable = await isUrlAvailable(
    'https://pokedex-pedia.vercel.app',
  );

  return <Pokedex lang={lang} isIframeAvailable={isIframeAvailable} />;
}
