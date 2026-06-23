import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CvPage } from "@/pages/about/cv/CvPage";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { useCvZoom } from "@/pages/about/cvZoom";
import { useRouter } from "@/router/router";

const EASE = [0.4, 0, 0.2, 1] as const;
const DURATION = 0.7;

/**
 * Full-screen CV overlay with an igloo-style zoom. Opened from the "Read full
 * CV" card, ONE stage (the CV page) grows uniformly out of the card's rect to
 * fill the screen, while the gold lettering — a single instance, the card's own
 * text is hidden — flies straight through the camera (its extruded side faces
 * sweep past) and fades. Everything is driven by one `progress` value (0 = card,
 * 1 = full screen) so it's perfectly in sync and reverses on Back. A blur during
 * the motion (sharp at both ends) sells the card→site morph. Direct URL opens
 * jump straight to progress 1.
 */
export function CvOverlay() {
  const { t } = useTranslation();
  const { origin, setOrigin } = useCvZoom();
  const { navigate } = useRouter();
  const staticPointer = useRef<Pointer>({ x: 0, y: 0 });

  const W = window.innerWidth;
  const H = window.innerHeight;
  const wide = W >= 768;
  const fromCard = origin !== null;

  // Uniform grow about the card's centre → full screen.
  const s = fromCard ? origin.w / W : 1;
  const tx = fromCard ? origin.x + origin.w / 2 - W / 2 : 0;
  const ty = fromCard ? origin.y + origin.h / 2 - H / 2 : 0;

  const progress = useMotionValue(fromCard ? 0 : 1);

  useEffect(() => {
    if (!fromCard) return;
    const controls = animate(progress, 1, { duration: DURATION, ease: EASE });
    return () => controls.stop();
  }, [fromCard, progress]);

  const handleBack = () => {
    if (!fromCard) {
      navigate("/about");
      return;
    }
    animate(progress, 0, { duration: DURATION, ease: EASE });
    window.setTimeout(() => {
      navigate("/about");
      setOrigin(null);
    }, DURATION * 1000);
  };

  // Stage transform + blur, derived from progress.
  const scale = useTransform(progress, [0, 1], [s, 1]);
  const x = useTransform(progress, [0, 1], [tx, 0]);
  const y = useTransform(progress, [0, 1], [ty, 0]);
  const blurPx = useTransform(progress, [0, 0.18, 0.82, 1], [0, 11, 11, 0]);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);
  const backdropOpacity = useTransform(progress, [0, 1], [fromCard ? 0 : 1, 1]);
  const textOpacity = useTransform(progress, [0, 0.5, 0.82], [1, 1, 0]);

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden">
      {/* Backdrop: transparent while small (cube shows around the card), opaque
          once the page fills the screen. */}
      <motion.div
        className="absolute inset-0 bg-[#0a0a0f]"
        style={{ opacity: backdropOpacity }}
      />

      {/* The stage — CV page + flying text — grows as one unit. */}
      <motion.div
        className="absolute inset-0 overflow-y-auto"
        style={{ scale, x, y, filter, transformOrigin: "center center" }}
      >
        <CvPage onBack={handleBack} />

        {fromCard && (
          <motion.div
            className={`pointer-events-none absolute ${
              wide ? "-inset-[18%]" : "-inset-x-[6%] -inset-y-[34%]"
            }`}
            style={{ opacity: textOpacity }}
          >
            <ReadCvText3D
              text={t("about.readCv").toUpperCase()}
              mode={wide ? "line" : "stack"}
              pointer={staticPointer}
              progress={progress}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
