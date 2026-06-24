import { useTranslation } from "react-i18next";
import { useRouter } from "@/router/router";
import { BackButton } from "@/components/BackButton";
import { NavMenuItem, type NavMenuItemData } from "@/components/NavMenuItem";
import { clsxm } from "@/lib/utils";
import Galaxy from "@/components/reactbits/Galaxy";
import { buildTalks } from "./talks/talks";
import type { PageProps } from "./types";

/**
 * Talks page (cube "bottom" face). A vertical menu of the four talks over the
 * Light Rays background (reactbits). Each item flips to navigate to its detail
 * overlay at /talks/<slug>.
 */
export function TalksPage(_props: PageProps) {
  const { t } = useTranslation();
  const { path } = useRouter();

  const items: NavMenuItemData[] = buildTalks(t).map((talk) => ({
    first: talk.navTitle,
    second: talk.navTitle,
    href: `/talks/${talk.slug}`,
  }));

  return (
    <div className="relative h-full w-full overflow-x-clip overflow-y-auto bg-black text-white">
      {/* Galaxy background (reactbits), pinned to the viewport while content
          scrolls. Only mounted while Talks is the live route so its WebGL loop
          doesn't run behind the other faces. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 left-0 -mb-[100dvh] h-[100dvh] w-full overflow-hidden"
      >
        {path === "/talks" && <Galaxy mouseRepulsion mouseInteraction />}
      </div>

      {path === "/talks" && <BackButton text={t("ivan")} />}

      <main className="relative z-10 flex min-h-full w-full flex-col">
        <h1 className="font-russo px-[clamp(24px,8vw,114px)] pt-12 text-[clamp(28px,5vw,44px)]">
          {t("talks.title")}
        </h1>

        <nav className="flex flex-1 flex-col items-start justify-center gap-1 pl-[clamp(24px,8vw,114px)]">
          {items.map((item, index) => (
            <NavMenuItem
              key={item.href}
              item={item}
              index={index}
              textClassName={clsxm("text-[3vw]", index !== 0 && "text-red-600")}
            />
          ))}
        </nav>
      </main>
    </div>
  );
}
