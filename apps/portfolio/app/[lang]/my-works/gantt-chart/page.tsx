import { GantChart } from '@app/[lang]/my-works/gantt-chart/GantChart';
import { DefaultProps } from '@app/types';
import { isUrlAvailable } from '@app/utils/isUrlAvailable';

export default async function Page({ params }: DefaultProps) {
  const { lang } = await params;
  const isIframeAvailable = await isUrlAvailable(
    'https://gantt-chart-test.vercel.app/',
  );

  return <GantChart lang={lang} isIframeAvailable={isIframeAvailable} />;
}
