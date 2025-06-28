import { English } from '@app/[lang]/my-works/english/English';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params: { lang } }: DefaultProps) {
  const isIframeAvailable = await isUrlAvailable(
    'https://my-learning-language.vercel.app/',
  );

  return <English lang={lang} isIframeAvailable={isIframeAvailable} />;
}
