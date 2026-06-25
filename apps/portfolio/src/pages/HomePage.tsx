import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HomeNav } from "@/components/HomeNav";
import Fluid from "@/components/Fluid";
import { clsxm, isTouchDevice } from "@/lib/utils";
import myPhoto from "@/assets/iam-wb-1.png";
import type { PageProps } from "./types";

export function HomePage(_props: PageProps) {
  const { t } = useTranslation();
  // Client-only SPA: window always exists, so detect at first render.
  const [isTouch] = useState(() => isTouchDevice());

  return (
    <main className="relative h-full w-full overflow-hidden bg-black">
      <Fluid />

      {/* Left scrim keeps the white nav legible whatever the fluid is doing. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-2/3 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

      <section
        className={clsxm(
          "animate-fade-in-scale pointer-events-none absolute right-0 bottom-0 z-40",
          "max-h-full w-1/2 max-w-[666px] opacity-80",
        )}
      >
        <img
          alt="Ivan Holovko"
          src={myPhoto}
          draggable={false}
          className="h-full w-full object-contain object-bottom"
        />
      </section>

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
