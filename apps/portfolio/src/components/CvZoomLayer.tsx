import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CvPage } from "@/pages/about/cv/CvPage";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { useCvZoom } from "@/pages/about/cvZoom";
import { useRouter } from "@/router/router";

const GROW = { duration: 0.85, ease: [0.4, 0, 0.2, 1] as const }; // window (slower)
const FLY = { duration: 0.45, ease: "easeIn" as const }; // text (faster)
const REST_BLUR = 6; // frosted glass on the card, clears as it opens

/**
 * The card→page zoom, rendered in true viewport coords (outside the cube).
 *
 * The window (a clipping frame) morphs its SHAPE from the card's rect to the
 * full viewport, while the CV page inside is always pinned fit-to-width and
 * top-anchored — so the page never distorts and lands exactly 1:1 = the real
 * page (the card "opens up" to reveal it). The gold lettering flies faster
 * straight through the camera and fades. Driven imperatively; reverses for
 * `mode === "close"`.
 */
export function CvZoomLayer() {
  const { zoom, finish } = useCvZoom();
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const flyPointer = useRef<Pointer>({ x: 0, y: 0 });

  // zoom is always set while this component is mounted (App gates it).
  const rect = zoom!.rect;
  const mode = zoom!.mode;
  const opening = mode === "open";
  const W = window.innerWidth;
  const H = window.innerHeight;
  const wide = W >= 768;

  // Window frame (its SIZE morphs card→viewport).
  const w = useMotionValue(opening ? rect.w : W);
  const h = useMotionValue(opening ? rect.h : H);
  const left = useMotionValue(opening ? rect.x : 0);
  const top = useMotionValue(opening ? rect.y : 0);
  // CV page inside: fit-to-width → uniform scale by current window width.
  const contentScale = useTransform(w, (v) => v / W);
  const veilOpacity = useMotionValue(opening ? 1 : 0);
  const cvBlur = useMotionValue(opening ? REST_BLUR : 0);
  const cvFilter = useTransform(cvBlur, (b) => `blur(${b}px)`);
  // Text fly + fade. It starts at the card's centre then drifts to screen
  // centre as it flies straight through the camera.
  const textDX = rect.x + rect.w / 2 - W / 2;
  const textDY = rect.y + rect.h / 2 - H / 2;
  const flyProgress = useMotionValue(opening ? 0 : 1);
  const textOpacity = useMotionValue(opening ? 1 : 0);
  const textX = useMotionValue(opening ? textDX : 0);
  const textY = useMotionValue(opening ? textDY : 0);

  useEffect(() => {
    if (opening) {
      animate(flyProgress, 1, FLY);
      animate(textOpacity, 0, { duration: 0.3, ease: "easeIn" });
      animate(textX, 0, FLY);
      animate(textY, 0, FLY);
      animate(w, W, GROW);
      animate(h, H, GROW);
      animate(left, 0, GROW);
      animate(veilOpacity, 0, GROW);
      animate(cvBlur, 0, GROW);
      const last = animate(top, 0, GROW);
      last.finished.then(() => {
        navigate("/about/cv"); // hand off to the static, scrollable CV page
        requestAnimationFrame(finish);
      });
      return () => last.stop();
    }
    // Closing: page is up → shrink back into the card.
    navigate("/about");
    animate(flyProgress, 0, { duration: 0.45, ease: "easeOut" });
    animate(textOpacity, 1, { duration: 0.45, ease: "easeOut" });
    animate(textX, textDX, GROW);
    animate(textY, textDY, GROW);
    animate(w, rect.w, GROW);
    animate(h, rect.h, GROW);
    animate(left, rect.x, GROW);
    animate(veilOpacity, 1, GROW);
    animate(cvBlur, REST_BLUR, GROW);
    const last = animate(top, rect.y, GROW);
    last.finished.then(finish);
    return () => last.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      {/* The morphing window frame. */}
      <motion.div
        className="absolute overflow-hidden bg-[#0a0a0f]"
        style={{ left, top, width: w, height: h }}
      >
        {/* CV page, fit-to-width and top-anchored → never distorts. */}
        <motion.div
          className="absolute top-0 left-1/2"
          style={{
            width: W,
            x: "-50%",
            scale: contentScale,
            transformOrigin: "top center",
            filter: cvFilter,
          }}
        >
          <CvPage preview />
        </motion.div>
        {/* Dark veil (frosted-glass look on the card), fades as it opens. */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/82 via-[#0a0a0f]/70 to-[#0a0a0f]/88"
          style={{ opacity: veilOpacity }}
        />
      </motion.div>

      {/* Gold lettering flying through the camera (fullscreen canvas so it can
          grow past the card without clipping). */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: textOpacity, x: textX, y: textY }}
      >
        <ReadCvText3D
          text={t("about.readCv").toUpperCase()}
          mode={wide ? "line" : "stack"}
          pointer={flyPointer}
          progress={flyProgress}
        />
      </motion.div>
    </div>
  );
}
