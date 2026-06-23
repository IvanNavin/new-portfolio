import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CvPage } from "@/pages/about/cv/CvPage";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { useCvZoom } from "@/pages/about/cvZoom";

const EASE = [0.22, 0.8, 0.2, 1] as const;

/**
 * Full-screen CV overlay. When opened from the "Read full CV" card it grows
 * seamlessly out of the card's rect (the card already shows the same CV page),
 * while the gold lettering flies forward through the camera and fades. Opened
 * any other way (direct URL), it just appears.
 */
export function CvOverlay() {
  const { t } = useTranslation();
  const { origin, setOrigin } = useCvZoom();
  const staticPointer = useRef<Pointer>({ x: 0, y: 0 });

  const W = window.innerWidth;
  const H = window.innerHeight;
  const fromCard = origin !== null;

  // Map the full-screen page down onto the card's rect for the entrance frame.
  const initial = origin
    ? {
        x: origin.x + origin.w / 2 - W / 2,
        y: origin.y + origin.h / 2 - H / 2,
        scaleX: origin.w / W,
        scaleY: origin.h / H,
        borderRadius: 28,
      }
    : { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 0 };

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <motion.div
        className="pointer-events-auto absolute inset-0 overflow-y-auto bg-black"
        style={{ transformOrigin: "50% 50%" }}
        initial={initial}
        animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 0 }}
        transition={{ duration: 0.62, ease: EASE }}
        onAnimationComplete={() => fromCard && setOrigin(null)}
      >
        <CvPage />
      </motion.div>

      {/* Gold lettering flying through the camera as the page opens. */}
      {fromCard && origin && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: origin.x + origin.w / 2,
            top: origin.y + origin.h / 2,
            width: origin.w * 1.3,
            height: origin.h * 1.3,
          }}
        >
          <motion.div
            className="h-full w-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 4.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          >
            <ReadCvText3D
              text={t("about.readCv").toUpperCase()}
              mode="line"
              pointer={staticPointer}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
