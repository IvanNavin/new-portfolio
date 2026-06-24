import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, animate } from "framer-motion";
import { useRouter } from "@/router/router";
import { BackButton } from "@/components/BackButton";
import { NavMenuItem, type NavMenuItemData } from "@/components/NavMenuItem";
import { clsxm } from "@/lib/utils";
import Galaxy from "@/components/reactbits/Galaxy";
import { buildTalks } from "./talks/talks";
import type { PageProps } from "./types";

/**
 * Talks page (cube "bottom" face). A vertical menu of the four talks over the
 * Galaxy background (reactbits). Opening a talk dives "into the depths": the
 * starfield warps to hyperspace and the menu flies past the camera while the
 * detail overlay emerges from the centre.
 */
export function TalksPage(_props: PageProps) {
  const { t } = useTranslation();
  const { path } = useRouter();

  // On a talk subroute (/talks/<slug>) we're diving in; on /talks we're at the
  // list. Keep the Galaxy mounted across both so the warp animation is visible.
  const onTalks = path.startsWith("/talks");
  const diving = path.startsWith("/talks/");

  // Live warp amount fed to the Galaxy shader (a ref → animating it never
  // rebuilds the WebGL program).
  const warpRef = useRef(0);
  useEffect(() => {
    const controls = animate(warpRef.current, diving ? 1 : 0, {
      duration: 1.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        warpRef.current = v;
      },
    });
    return () => controls.stop();
  }, [diving]);

  const items: NavMenuItemData[] = buildTalks(t).map((talk) => ({
    first: talk.navTitle,
    second: talk.navTitle,
    href: `/talks/${talk.slug}`,
  }));

  return (
    <div className="relative h-full w-full overflow-x-clip overflow-y-auto bg-black text-white">
      {/* Galaxy background (reactbits), pinned to the viewport while content
          scrolls. Mounted across the list and its talk subroutes so the warp
          dive stays visible during the transition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 left-0 -mb-[100dvh] h-[100dvh] w-full overflow-hidden"
      >
        {onTalks && (
          <Galaxy mouseRepulsion mouseInteraction warpRef={warpRef} />
        )}
      </div>

      {path === "/talks" && <BackButton text={t("ivan")} />}

      {/* The list + title fly forward past the camera as we dive in. */}
      <motion.main
        className="relative z-10 flex min-h-full w-full flex-col"
        animate={{ scale: diving ? 1.6 : 1, opacity: diving ? 0 : 1 }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        style={{ transformOrigin: "center center" }}
      >
        <h1 className="font-russo px-[clamp(24px,8vw,114px)] pt-12 text-[clamp(28px,5vw,44px)]">
          {t("talks.title")}
        </h1>

        <nav className="flex flex-1 flex-col items-start justify-center gap-1 pl-[clamp(24px,8vw,114px)]">
          {items.map((item, index) => (
            <NavMenuItem
              key={item.href}
              item={item}
              index={index}
              flipOnTouch={false}
              textClassName={clsxm("text-[3vw]", index !== 0 && "text-red-600")}
            />
          ))}
        </nav>
      </motion.main>
    </div>
  );
}
