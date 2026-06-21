import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { RenderTextArea } from "@/components/RenderTextArea";
import { Css, EmptyGear, Html, Js } from "@/components/svg";
import { clsxm } from "@/lib/utils";
import stars from "@/assets/stars.png";
import twinkling from "@/assets/twinkling.png";
import type { PageProps } from "./types";

import "./about/style.css";
import { AchievementRings } from "./about/AchievementRings";
import { CareerTimeline } from "./about/CareerTimeline";
import {
  buildAchievementRings,
  buildCareerTimeline,
  cssSkills,
  htmlSkills,
  JSSkills,
  otherSkills,
} from "./about/constants";
import { PerformanceRings } from "./about/PerformanceRings";
import { SkillsSection, type SkillBlock } from "./about/SkillsSection";

const buildSkillBlocks = (): SkillBlock[] => [
  { side: "left", icon: <Html className="mx-auto mb-2" />, skills: htmlSkills },
  { side: "right", icon: <Css className="mx-auto mb-2" />, skills: cssSkills },
  { side: "left", icon: <Js className="mx-auto mb-2" />, skills: JSSkills },
  {
    side: "right",
    icon: (
      <div className="relative mx-auto mb-2 size-[100px]">
        <div
          className={clsxm(
            "font-russo flex items-center justify-center",
            "absolute top-1/2 left-1/2 size-[47px] rounded-full bg-white",
            "-translate-x-1/2 -translate-y-1/2 text-black",
            "text-[9px] before:content-['{_OTHER_}']",
          )}
        />
        <EmptyGear />
      </div>
    ),
    skills: otherSkills,
  },
];

export function AboutPage(_props: PageProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const achievementRings = buildAchievementRings(t);
  const careerTimeline = buildCareerTimeline(t);
  const skillBlocks = buildSkillBlocks();

  return (
    <div
      ref={scrollRef}
      className="relative h-full w-full overflow-x-clip overflow-y-auto text-white"
      style={{ background: `#000 url(${stars}) repeat top center` }}
    >
      {/* Twinkling layer pinned to the viewport while content scrolls. */}
      <div
        aria-hidden="true"
        className="animate-move-twink-back pointer-events-none sticky top-0 left-0 -mb-[100dvh] h-[100dvh] w-full"
        style={{
          background: `transparent url(${twinkling}) repeat top center`,
        }}
      />

      <main className="relative z-10 mx-auto min-h-full max-w-[1000px] p-8 pb-[100px]">
        <BackButton text={t("ivan")} />

        <h2 className="mt-5 mb-10 text-[32px]">{t("about.helloThere")}</h2>

        <section className="font-roboto space-y-4 text-white/85">
          <RenderTextArea t={t} tKey="about.text" />
        </section>

        <AchievementRings
          rings={achievementRings}
          ariaLabel={t("about.achievementsAriaLabel")}
        />

        <CareerTimeline
          title={t("about.careerTitle")}
          ariaLabel={t("about.careerAriaLabel")}
          nowLabel={t("about.now")}
          entries={careerTimeline}
          scrollRef={scrollRef}
        />

        <SkillsSection blocks={skillBlocks} scrollRef={scrollRef} />

        <PerformanceRings
          t={t}
          title={t("about.perfTitle")}
          subtitle={t("about.perfSubtitle")}
        />
      </main>
    </div>
  );
}
