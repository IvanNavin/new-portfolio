import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CvPage } from "@/pages/about/cv/CvPage";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { useCvZoom } from "@/pages/about/cvZoom";
import { useRouter } from "@/router/router";

const EASE = [0.22, 0.8, 0.2, 1] as const;
const DURATION = 0.6;
// CV design width — the card thumbnail uses the same so the seam is exact.
const DESIGN_W = 860;

/**
 * Full-screen CV overlay. Opened from the "Read full CV" card, the whole page
 * AND the gold lettering live in one scaling stage, so they grow out of the
 * card together (in sync) and — on Back — shrink back into it. The card already
 * renders the same CV thumbnail, so the seam is invisible. Opened any other way
 * (direct URL) it just appears.
 */
export function CvOverlay() {
  const { t } = useTranslation();
  const { origin, setOrigin } = useCvZoom();
  const { navigate } = useRouter();
  const staticPointer = useRef<Pointer>({ x: 0, y: 0 });

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  // Start at the card, then animate to full on the next frame.
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const W = window.innerWidth;
  const dw = Math.min(DESIGN_W, W);
  const wide = W >= 768;
  const fromCard = origin !== null;

  // Map the centered design-width stage down onto the card's rect.
  const s = fromCard ? origin.w / dw : 1;
  const tx = fromCard ? origin.x + origin.w / 2 - W / 2 : 0;
  const ty = fromCard ? origin.y : 0;

  const target = open && !closing ? "full" : "card";

  const handleBack = () => {
    if (!fromCard) {
      navigate("/about");
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      navigate("/about");
      setOrigin(null);
    }, DURATION * 1000);
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden">
      {/* Backdrop: transparent while small (cube shows around the card),
          opaque once the page fills the screen. */}
      <motion.div
        className="absolute inset-0 bg-[#0a0a0f]"
        initial={{ opacity: fromCard ? 0 : 1 }}
        animate={{ opacity: target === "full" ? 1 : fromCard ? 0 : 1 }}
        transition={{ duration: DURATION, ease: EASE }}
      />

      <div className="absolute inset-0 overflow-y-auto">
        <motion.div
          className="relative mx-auto"
          style={{ width: dw, transformOrigin: "top center" }}
          initial={fromCard ? "card" : "full"}
          animate={target}
          variants={{
            card: { scale: s, x: tx, y: ty },
            full: { scale: 1, x: 0, y: 0 },
          }}
          transition={{ duration: DURATION, ease: EASE }}
        >
          <CvPage onBack={handleBack} />

          {/* Gold lettering, overlaying the card's text region; scales with the
              stage (so it's in sync) and flies forward + fades as we pass it. */}
          {fromCard && (
            <motion.div
              className="pointer-events-none absolute top-0 left-0"
              style={{ width: dw, height: origin.h / s }}
              initial="card"
              animate={target}
              variants={{
                card: { opacity: 1, scale: 1 },
                full: { opacity: 0, scale: 1.45 },
              }}
              transition={{ duration: DURATION * 0.8, ease: "easeIn" }}
            >
              <ReadCvText3D
                text={t("about.readCv").toUpperCase()}
                mode={wide ? "line" : "stack"}
                pointer={staticPointer}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
