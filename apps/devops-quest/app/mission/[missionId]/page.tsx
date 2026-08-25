import { notFound } from 'next/navigation';

import { MissionView } from '@/components/mission/MissionView';
import { ALL_MISSIONS, getMission } from '@/lib/content/registry';

export const generateStaticParams = () =>
  ALL_MISSIONS.map((mission) => ({ missionId: mission.id }));

type MissionPageProps = {
  params: Promise<{ missionId: string }>;
};

/**
 * Only the id crosses into the client component. A Mission carries `boot()`
 * and `check()` closures, and functions can't be serialised across the RSC
 * boundary — the client re-reads the mission from the same registry instead.
 */
const MissionPage = async ({ params }: MissionPageProps) => {
  const { missionId } = await params;
  if (!getMission(missionId)) notFound();

  return <MissionView missionId={missionId} />;
};

export default MissionPage;
