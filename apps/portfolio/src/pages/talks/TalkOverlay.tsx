import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { VideoFrame } from "@/components/VideoFrame";
import Noise from "@/components/reactbits/Noise";
import { findTalk } from "./talks";

// Easing for the dive — a sharp ease-out (expo-ish) so the page rushes in from
// depth and settles.
const DIVE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Detail page for a single talk (/talks/<slug>), rendered as a full-screen
 * overlay above the cube while it stays parked on the Talks face — mirrors
 * how the CV overlays the About face. Enters with a "warp dive": the backdrop
 * fades in (letting the hyperspacing Galaxy show through) while the content
 * emerges from the centre. AnimatePresence (in App) reverses it on exit.
 */
export function TalkOverlay({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const talk = findTalk(slug, t);

  if (!talk) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Film-grain background (reactbits), pinned to the viewport behind the
          content while the page scrolls. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <Noise patternAlpha={40} />
      </div>

      <BackButton text={t("main.talks")} to="/talks" />

      <motion.main
        className="relative z-10 mx-auto max-w-[900px] px-6 py-24"
        style={{ transformOrigin: "center center" }}
        initial={{ scale: 0.5, filter: "blur(16px)" }}
        animate={{ scale: 1, filter: "blur(0px)" }}
        exit={{ scale: 0.5, opacity: 0, filter: "blur(16px)" }}
        transition={{ duration: 0.6, ease: DIVE_EASE }}
      >
        <h1 className="font-russo mb-8 text-[clamp(24px,4vw,40px)]">
          {talk.title}
        </h1>

        <VideoFrame src={talk.videoSrc} />

        {talk.heading && (
          <h2 className="font-russo mt-10 mb-5 text-[clamp(18px,2.6vw,28px)]">
            {talk.heading}
          </h2>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {talk.links.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-[16px] text-yellow-300/90 transition-colors hover:text-yellow-300 hover:underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </motion.main>
    </motion.div>
  );
}
