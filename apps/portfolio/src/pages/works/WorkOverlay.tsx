import { useState } from "react";
import type { TFunction } from "i18next";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { SafeIframe } from "@/components/SafeIframe";
import { RenderTextArea } from "@/components/RenderTextArea";
import { findWork, type Work } from "./works";
import { consumeDiveRect } from "./diveStore";

const DIVE_EASE = [0.65, 0, 0.35, 1] as const;

/** Transform that places the full-screen overlay exactly over the clicked card
    (so it can grow out of it). Falls back to a plain fade when there's no rect. */
function diveFromRect() {
  const rect = consumeDiveRect();
  if (!rect || typeof window === "undefined") return null;
  return {
    opacity: 0.3,
    scale: rect.width / window.innerWidth,
    x: rect.left + rect.width / 2 - window.innerWidth / 2,
    y: rect.top + rect.height / 2 - window.innerHeight / 2,
  };
}

const POKEDEX_STACK = [
  "React",
  "Hook",
  "HookRouter",
  "Redux",
  "Webpack",
  "TypeScript",
  "ESLint",
  "Axios",
  "Jest",
  "SSR",
  "Hapi",
];

/** A title / description / features-list block (solitaire, snake, 2048). */
const FeatureBlock = ({ t, prefix }: { t: TFunction; prefix: string }) => (
  <div>
    <p className="my-4">{t(`${prefix}.title`)}</p>
    <p>{t(`${prefix}.description`)}</p>
    <p className="my-4">{t(`${prefix}.features`)}</p>
    <ul className="list-inside list-disc">
      <li>{t(`${prefix}.li1`)}</li>
      <li>{t(`${prefix}.li2`)}</li>
      <li>{t(`${prefix}.li3`)}</li>
      <li>{t(`${prefix}.li4`)}</li>
    </ul>
  </div>
);

const WorkBody = ({ t, work }: { t: TFunction; work: Work }) => {
  switch (work.id) {
    case "solitaire":
      return <FeatureBlock t={t} prefix="works.solitaire" />;
    case "snake":
      return <FeatureBlock t={t} prefix="works.snake" />;
    case "2048":
      return <FeatureBlock t={t} prefix="works.2048" />;
    case "miner":
      return <p>{t("works.miner.text")}</p>;
    case "gantt-chart":
      return <p>{t("works.ganttChart.text")}</p>;
    case "rpg":
      return (
        <section>
          <RenderTextArea t={t} tKey="works.rpg.text" />
        </section>
      );
    case "english-learn":
      return (
        <section>
          <RenderTextArea t={t} tKey="works.english.text" />
        </section>
      );
    case "thanos-effect":
      return (
        <section>
          <RenderTextArea t={t} tKey="works.thanos.text" />
        </section>
      );
    case "portfolio":
      return (
        <section>
          <RenderTextArea t={t} tKey="works.portfolio.text" />
        </section>
      );
    case "pokedex":
      return (
        <div className="flex flex-col gap-6">
          <section>
            <RenderTextArea t={t} tKey="works.pokedex.text" />
            <ul className="ml-6 list-disc">
              {POKEDEX_STACK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <RenderTextArea t={t} tKey="works.pokedex.secondText" />
          </section>
          <section>
            <RenderTextArea t={t} tKey="works.pokedex.thirdText" />
          </section>
          <section>
            <RenderTextArea t={t} tKey="works.pokedex.fourText" />
          </section>
        </div>
      );
    default:
      return null;
  }
};

const Embed = ({ work }: { work: Work }) => {
  if (work.embed.type === "video") {
    return (
      <video
        controls
        autoPlay
        loop
        muted
        className="w-full rounded-lg"
        src={work.embed.src}
      />
    );
  }
  if (work.embed.type === "image") {
    return (
      <img
        src={work.embed.src}
        alt={work.name}
        className="max-h-[500px] w-full rounded-lg object-contain"
      />
    );
  }
  return (
    <SafeIframe
      iframeSrc={work.embed.src}
      imgSrc={work.frontPicture}
      title={work.name}
    />
  );
};

/**
 * Detail page for a single work (/works/<id>), a full-screen overlay above the
 * cube parked on the Works face — an embed (iframe / video / image) plus the
 * project write-up and external "live / code" buttons.
 */
export function WorkOverlay({ id }: { id: string }) {
  const { t } = useTranslation();
  const work = findWork(id);
  // Capture the dive-from rect once (on mount), reused for the exit too.
  const [dive] = useState(diveFromRect);

  if (!work) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f] text-white"
      style={{ transformOrigin: "center center" }}
      initial={dive ?? { opacity: 0 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={dive ?? { opacity: 0 }}
      transition={{ duration: 0.6, ease: DIVE_EASE }}
    >
      <BackButton text={t("myWorks.myWorks")} to="/works" />

      <main className="mx-auto max-w-[900px] px-6 py-24">
        <h1 className="font-russo mb-8 text-[clamp(24px,4vw,40px)]">
          {work.name}
        </h1>

        <Embed work={work} />

        <div className="mt-8 leading-relaxed text-white/85">
          <WorkBody t={t} work={work} />
        </div>

        <footer className="mt-10 flex flex-wrap gap-8">
          {work.liveUrl && <Button text="See live" href={work.liveUrl} />}
          <Button text="See code" href={work.codeUrl} />
        </footer>
      </main>
    </motion.div>
  );
}
