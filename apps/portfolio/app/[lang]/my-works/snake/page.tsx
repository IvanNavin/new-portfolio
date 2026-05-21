import { Snake } from '@app/[lang]/my-works/snake/Snake';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params }: DefaultProps) {
  const { lang } = await params;
  const isIframeAvailable = await isUrlAvailable(
    'https://snake-native.vercel.app/',
  );

  return <Snake lang={lang} isIframeAvailable={isIframeAvailable} />;
}
