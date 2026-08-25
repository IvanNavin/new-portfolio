import { notFound } from 'next/navigation';

import { LevelView } from '@/components/map/LevelView';
import { getLevel, LEVELS } from '@/lib/content/registry';

export const generateStaticParams = () =>
  LEVELS.map((level) => ({ levelId: level.id }));

type LevelPageProps = {
  params: Promise<{ levelId: string }>;
};

/** Same reason as the mission page: goals are closures, so only the id travels. */
const LevelPage = async ({ params }: LevelPageProps) => {
  const { levelId } = await params;
  if (!getLevel(levelId)) notFound();

  return <LevelView levelId={levelId} />;
};

export default LevelPage;
