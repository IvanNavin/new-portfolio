import { Magnetic } from "@/components/Magnetic";
import { AnimatedRing, type Ring } from "./AnimatedRing";

export type { Ring };

type Props = {
  rings: Ring[];
  ariaLabel: string;
};

export const AchievementRings = ({ rings, ariaLabel }: Props) => (
  <section
    className="mx-auto my-10 grid max-w-[640px] grid-cols-2 gap-6 sm:grid-cols-4"
    aria-label={ariaLabel}
  >
    {rings.map((ring, i) => (
      <Magnetic key={ring.label}>
        <div className="flex items-center justify-center">
          <AnimatedRing ring={ring} delay={i * 120} />
        </div>
      </Magnetic>
    ))}
  </section>
);
