import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HomeNav } from "@/components/HomeNav";
import Fluid from "@/components/Fluid";
import { clsxm, isTouchDevice } from "@/lib/utils";
import myPhoto from "@/assets/ivan.png";
import type { PageProps } from "./types";

// Ivan started at Evoplay in October 2018. Count full years since then so we
// don't jump a year on Jan 1 — full N years lands in October.
const CAREER_START = new Date(2018, 9, 1);

export function HomePage(_props: PageProps) {
  const { t } = useTranslation();
  // Client-only SPA: window always exists, so detect at first render.
  const [isTouch] = useState(() => isTouchDevice());

  const now = new Date();
  const monthsSinceStart =
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth());
  const yearsOfExperience = Math.max(0, Math.floor(monthsSinceStart / 12));

  return (
    <main className="relative h-full w-full overflow-hidden bg-black">
      <Fluid />

      {/* Left scrim keeps the white nav legible whatever the fluid is doing. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-2/3 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

      {/* Hero portrait: anchored to the bottom-right, height-driven so Ivan
          stands in the scene; transparent cutout blends onto the fluid. */}
      <section
        className={clsxm(
          "animate-fade-in-scale pointer-events-none absolute right-0 bottom-0 z-40",
          "h-[88vh] max-h-[940px] w-[clamp(300px,48vw,620px)]",
        )}
      >
        <img
          alt="Ivan Holovko"
          src={myPhoto}
          draggable={false}
          className="h-full w-full object-contain object-right-bottom grayscale contrast-110 drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
        />
      </section>

      <p
        className={clsxm(
          "animate-fade-in-scale text-shadow pointer-events-none absolute right-6 bottom-20 z-50 max-w-[50vw] text-right",
          "text-[clamp(11px,1.6vw,18px)] tracking-wider text-white/90",
        )}
      >
        {t("main.tagline", { years: yearsOfExperience })}
      </p>

      <div className="text-shadow pointer-events-none absolute bottom-6 z-50 block w-full animate-bounce text-center text-[3.6vmin] text-white">
        {isTouch ? t("main.tap") : t("main.slide")}
      </div>

      <span className="pointer-events-none absolute bottom-0 left-0 z-50 text-[8px] text-white/60">
        {t("main.presPForPause")}
      </span>

      <HomeNav />
    </main>
  );
}
