import { Solitaire } from '@app/[lang]/my-works/solitaire/Solitaire';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params }: DefaultProps) {
  const { lang } = await params;
  const isIframeAvailable = await isUrlAvailable(
    'https://hi-solitaire.vercel.app/',
  );

  return <Solitaire lang={lang} isIframeAvailable={isIframeAvailable} />;
}
