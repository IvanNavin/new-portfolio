import { Thanos } from '@app/[lang]/my-works/thanos/Thanos';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params: { lang } }: DefaultProps) {
  const isIframeAvailable = await isUrlAvailable(
    'https://thanos-effect-example.vercel.app/',
  );

  return <Thanos lang={lang} isIframeAvailable={isIframeAvailable} />;
}
