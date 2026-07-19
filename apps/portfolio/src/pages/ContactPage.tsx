import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@/router/router";
import { BackButton } from "@/components/BackButton";
import type { PageProps } from "./types";

const Ferrofluid = lazy(() => import("@/components/reactbits/Ferrofluid"));

// Stable identity: an inline array would re-trigger Ferrofluid's effect (which
// rebuilds the whole WebGL renderer) on every re-render.
const FERROFLUID_COLORS = ["#fde047", "#e7a92c", "#fff3d6"];
import { ContactLinks } from "./contact/ContactLinks";
import { BookingEmbed } from "./contact/BookingEmbed";
import {
  CAL_BOOKING_LINK,
  CAL_EMBED_SCRIPT_SRC,
  CAL_ORIGIN,
} from "./contact/contactConfig";

/**
 * Contact page (cube "top" face). Two tracks over the signature cosmic
 * RotateStar background: direct links (mail / LinkedIn / GitHub) and a Cal.com
 * inline booking embed.
 */
export function ContactPage(_props: PageProps) {
  const { t } = useTranslation();
  const { path } = useRouter();

  return (
    <div className="relative h-full w-full overflow-x-clip overflow-y-auto bg-black text-white">
      {/* Ferrofluid background (reactbits), pinned to the viewport while content
          scrolls. Only mounted while Contact is the live route so its WebGL
          loop doesn't run behind the other faces. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 left-0 -mb-[100dvh] h-[100dvh] w-full overflow-hidden"
      >
        {path === "/contact" && (
          <Suspense fallback={null}>
            <Ferrofluid colors={FERROFLUID_COLORS} />
          </Suspense>
        )}
      </div>

      {/* Fixed to the viewport corner → only while Contact is the live route
          (all faces stay mounted, otherwise it leaks onto other pages). */}
      {path === "/contact" && <BackButton text={t("ivan")} />}

      <main className="relative z-10 mx-auto flex min-h-full max-w-[820px] flex-col items-center gap-10 p-8 pb-[100px]">
        <h1 className="font-russo mt-6 text-center text-[clamp(28px,5vw,44px)]">
          {t("contacts.sayHi")}
        </h1>

        <p className="max-w-[520px] text-center text-sm leading-relaxed text-white/70">
          {t("contacts.intro")}
        </p>

        <ContactLinks t={t} />

        {/* Only mount the Cal.eu embed once we're actually on Contact — the cube
            keeps every face mounted, so an ungated embed would load its script,
            iframe and cookies on the home page (hurting perf + best-practices). */}
        {path === "/contact" && (
          <BookingEmbed
            calLink={CAL_BOOKING_LINK}
            origin={CAL_ORIGIN}
            scriptSrc={CAL_EMBED_SCRIPT_SRC}
            caption={t("contacts.bookCall")}
            resetLabel={t("contacts.changeDuration")}
          />
        )}
      </main>
    </div>
  );
}
