import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { VideoFrame } from "@/components/VideoFrame";
import Noise from "@/components/reactbits/Noise";
import { findTalk } from "./talks";

/**
 * Detail page for a single talk (/talks/<slug>), rendered as a full-screen
 * overlay above the cube while it stays parked on the Talks face — mirrors
 * how the CV overlays the About face. A YouTube embed plus related links.
 */
export function TalkOverlay({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const talk = findTalk(slug, t);

  if (!talk) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f] text-white">
      {/* Film-grain background (reactbits), pinned to the viewport behind the
          content while the page scrolls. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <Noise patternAlpha={40} />
      </div>

      <BackButton text={t("main.talks")} to="/talks" />

      <main className="relative z-10 mx-auto max-w-[900px] px-6 py-24">
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
      </main>
    </div>
  );
}
