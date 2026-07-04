import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@/router/router";
import { HomeNav } from "@/components/HomeNav";
const Fluid = lazy(() => import("@/components/Fluid"));
import { clsxm, isTouchDevice } from "@/lib/utils";
import myPhoto from "@/assets/iam-wb-1.webp";
import type { PageProps } from "./types";

export function HomePage(_props: PageProps) {
  const { t } = useTranslation();
  const { path } = useRouter();
  // Client-only SPA: window always exists, so detect at first render.
  const [isTouch] = useState(() => isTouchDevice());

  // A live fluid sim can't be resized cleanly — resizing stretches the moving
  // dye. So once a resize settles, remount the whole sim (bump its key) for a
  // fresh start at the new size instead of carrying a stretched frame over.
  const [fluidKey, setFluidKey] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setFluidKey((k) => k + 1), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="relative h-full w-full overflow-hidden bg-black">
      {/* Mounted only while Home is the live face — the fluid sim is the
          heaviest WebGL background, so don't run it behind hidden faces (every
          other face gates its background the same way). */}
      {path === "/" && (
        <Suspense fallback={null}>
          <Fluid key={fluidKey} />
        </Suspense>
      )}

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
          fetchPriority="high"
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
