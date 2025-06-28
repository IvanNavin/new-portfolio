import { Solitaire } from '@app/[lang]/my-works/solitaire/Solitaire';
import { DefaultProps } from '@app/types';

export default async function Page({ params: { lang } }: DefaultProps) {
  const iframeUrl = 'https://hi-solitaire.vercel.app/';
  let isIframeAvailable: boolean;

  try {
    const res = await fetch(iframeUrl, { method: 'HEAD' });
    isIframeAvailable = res.ok;
  } catch (e) {
    isIframeAvailable = false;
  }

  return <Solitaire lang={lang} isIframeAvailable={isIframeAvailable} />;
}
