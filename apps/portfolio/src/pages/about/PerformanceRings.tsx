import type { TFunction } from "i18next";
import { Magnetic } from "@/components/Magnetic";
import { AnimatedRing, type Ring } from "./AnimatedRing";

// Real Lighthouse scores (desktop) for holovko-ivan.vercel.app.
const buildScores = (t: TFunction): Ring[] => [
  {
    label: t("about.lighthouse.perf"),
    value: 97,
    max: 100,
    numberClass: "text-green-400",
    stroke: "#4ade80",
  },
  {
    label: t("about.lighthouse.a11y"),
    value: 100,
    max: 100,
    numberClass: "text-green-400",
    stroke: "#4ade80",
  },
  {
    label: t("about.lighthouse.bestPractices"),
    value: 96,
    max: 100,
    numberClass: "text-green-400",
    stroke: "#4ade80",
  },
  {
    label: t("about.lighthouse.seo"),
    value: 100,
    max: 100,
    numberClass: "text-green-400",
    stroke: "#4ade80",
  },
];

const PAGESPEED_URL =
  "https://pagespeed.web.dev/analysis?url=https://holovko-ivan.vercel.app";

type Props = {
  t: TFunction;
  title: string;
  subtitle: string;
};

export const PerformanceRings = ({ t, title, subtitle }: Props) => {
  const scores = buildScores(t);
  return (
    <section
      aria-label={t("about.lighthouse.ariaLabel")}
      className="mx-auto my-10 flex max-w-[640px] flex-col items-center"
    >
      <h2 className="font-roboto text-center text-lg font-semibold tracking-widest text-white/80 uppercase">
        {title}
      </h2>
      <p className="font-roboto mt-2 mb-6 text-center text-xs text-white/50">
        {subtitle}
      </p>
      <a
        href={PAGESPEED_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={t("about.lighthouse.linkTitle")}
        className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4"
      >
        {scores.map((ring, i) => (
          <Magnetic key={ring.label}>
            <div className="flex items-center justify-center">
              <AnimatedRing ring={ring} delay={i * 120} />
            </div>
          </Magnetic>
        ))}
      </a>
    </section>
  );
};
