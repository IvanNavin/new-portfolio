import type { TFunction } from "i18next";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { SafeIframe } from "@/components/SafeIframe";
import { RenderTextArea } from "@/components/RenderTextArea";
import { findWork, type Work } from "./works";
import styles from "./work-item.module.css";

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
    case "devpulse":
      return (
        <section>
          <RenderTextArea t={t} tKey="works.devpulse.text" />
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
        poster={work.frontPicture}
        className="block w-full"
        src={work.embed.src}
      />
    );
  }
  if (work.embed.type === "image") {
    return (
      <img
        src={work.embed.src}
        alt={work.name}
        className="block max-h-[560px] w-full object-cover"
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

  if (!work) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <BackButton text={t("myWorks.myWorks")} to="/works" />

      <main className="mx-auto max-w-[900px] px-6 py-24">
        {/* Shared element: this window is the grid card grown up. The faux
            browser bar + the front image (the embed's poster) match the card,
            so the morph is seamless. */}
        <motion.div
          layoutId={`work-window-${id}`}
          className="overflow-hidden rounded-lg bg-black shadow-[8px_8px_0_rgba(255,255,255,0.12)]"
        >
          <div className={styles.bar}>
            <h5 className={styles.h5}>{work.name}</h5>
            <i />
          </div>
          <Embed work={work} />
        </motion.div>

        {/* Write-up fades in once the window has grown. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="font-russo mt-8 leading-relaxed text-white/85">
            <WorkBody t={t} work={work} />
          </div>

          <footer className="mt-10 flex flex-wrap gap-8">
            {work.liveUrl && (
              <Button text="See the result here" href={work.liveUrl} />
            )}
            <Button text="See the code here" href={work.codeUrl} />
          </footer>
        </motion.div>
      </main>
    </motion.div>
  );
}
