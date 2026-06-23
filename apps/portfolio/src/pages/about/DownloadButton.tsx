import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useRouter } from "@/router/router";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

const GROW = { duration: 1.0, ease: [0.4, 0, 0.2, 1] as const }; // card (slower)
const FLY = { duration: 0.4, ease: "easeIn" as const }; // text (much faster)
// Frosted-glass blur on the CV thumbnail at rest; clears as the card zooms in
// so it resolves into the sharp real page (no jump at the handoff).
const REST_BLUR = 6;

/**
 * "Read full CV" 3D button → seamless zoom INTO the CV page.
 *
 * The card and its gold lettering are the SAME elements that animate (no
 * duplicate overlay): on click the tilt straightens (200ms), then the real card
 * grows uniformly from its centre to fill the screen — its scaled-down CV
 * thumbnail un-scales into the full page — while the same lettering flies faster
 * straight through the camera (its extruded side faces sweep past) and fades.
 * At the end we hand off to the scrollable CV overlay (identical frame). Back
 * plays it in reverse. The hover tilt reacts to the whole row around the card.
 */
export function DownloadButton() {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const { closing, endClose } = useCvZoom();
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const zoomingRef = useRef(false);

  // Lift the card above the rest of the About page (incl. the z-50 back button)
  // while it grows; reset when done. Imperative to avoid set-state-in-effect.
  const elevate = (on: boolean) => {
    if (cardRef.current) cardRef.current.style.zIndex = on ? "60" : "";
  };

  // The zoom is driven by motion values on the real card + text.
  const cardScale = useMotionValue(1);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardOpacity = useMotionValue(1); // dissolves into the real page at handoff
  const radius = useMotionValue(28);
  const textOpacity = useMotionValue(1);
  const flyProgress = useMotionValue(0); // 0 = on card, 1 = flown through camera
  const cvBlur = useMotionValue(REST_BLUR); // frosted at rest, 0 when full
  const cvFilter = useTransform(cvBlur, (b) => `blur(${b}px)`);

  // Mini CV thumbnail: a viewport-framed snapshot of the full CV page, scaled
  // into the card. Using the *viewport* width as the design width makes the
  // thumbnail un-scale to the real page exactly as the card grows. Tracked
  // across viewport changes.
  const [cardW, setCardW] = useState(0);
  const [designW, setDesignW] = useState(() => window.innerWidth);
  const [designH, setDesignH] = useState(() => window.innerHeight);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      setCardW(el.getBoundingClientRect().width);
      setDesignW(window.innerWidth);
      setDesignH(window.innerHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Phones get the rotated word-stack; tablet+ spills a single line.
  const [wide, setWide] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Grow the card to fill the viewport, centred. The card matches the viewport
  // aspect, so a single uniform scale (W / cardW) lands it exactly on the
  // viewport — no over-scale, so its CV content == the real page 1:1.
  const growTarget = () => {
    const card = cardRef.current;
    if (!card) return null;
    const r = card.getBoundingClientRect();
    const W = window.innerWidth;
    const H = window.innerHeight;
    return {
      scale: W / r.width,
      x: W / 2 - (r.left + r.width / 2),
      y: H / 2 - (r.top + r.height / 2),
    };
  };

  const straighten = () =>
    new Promise<void>((resolve) => {
      const el = innerRef.current;
      if (!el) return resolve();
      el.style.transition = "transform 0.2s ease";
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
      pointer.current.x = 0;
      pointer.current.y = 0;
      window.setTimeout(() => {
        el.style.transition = "";
        resolve();
      }, 200);
    });

  const runOpen = async () => {
    const target = growTarget();
    if (!target) {
      navigate("/about/cv");
      return;
    }
    zoomingRef.current = true;
    elevate(true);
    await straighten();
    // Text flies through the camera fast (stays visible while it rushes past,
    // then fades as it crosses the lens); card grows slower behind it,
    // un-blurring as it approaches the real page.
    animate(flyProgress, 1, FLY);
    animate(textOpacity, [1, 1, 0], {
      duration: FLY.duration,
      times: [0, 0.55, 1],
      ease: "easeIn",
    });
    animate(cardX, target.x, GROW);
    animate(cardY, target.y, GROW);
    animate(radius, 0, GROW);
    animate(cvBlur, 0, GROW);
    const grow = animate(cardScale, target.scale, GROW);

    // In the last stretch of the grow, mount the real CV overlay (it fades in)
    // beneath the card and dissolve the card into it — a crossfade, not a hard
    // swap, so it resolves smoothly into the real page.
    const handoff = window.setTimeout(
      () => {
        if (cardRef.current) cardRef.current.style.zIndex = "90";
        navigate("/about/cv");
        animate(cardOpacity, 0, { duration: 0.32, ease: "easeOut" });
      },
      GROW.duration * 1000 * 0.82,
    );

    await grow.finished;
    await new Promise((r) => window.setTimeout(r, 240)); // let the dissolve finish
    window.clearTimeout(handoff);
    // Reset the card behind the overlay.
    cardScale.set(1);
    cardX.set(0);
    cardY.set(0);
    radius.set(28);
    textOpacity.set(1);
    flyProgress.set(0);
    cvBlur.set(REST_BLUR);
    cardOpacity.set(1);
    elevate(false);
    zoomingRef.current = false;
  };

  const runClose = async () => {
    // After a reload/direct-open the About page behind the overlay is scrolled
    // to the top and the card is off-screen — centre it first (hidden under the
    // overlay) so the page shrinks back to a visible card.
    const card = cardRef.current;
    const sc = card?.closest(".overflow-y-auto") as HTMLElement | null;
    if (card && sc) {
      const r = card.getBoundingClientRect();
      sc.scrollTop += r.top + r.height / 2 - window.innerHeight / 2;
    }
    const target = growTarget();
    if (!target) {
      navigate("/about");
      endClose();
      return;
    }
    zoomingRef.current = true;
    elevate(true);
    // Snap to the full-screen state (matches the overlay's last frame), then
    // reveal the card by removing the overlay and shrink it back down.
    cardScale.set(target.scale);
    cardX.set(target.x);
    cardY.set(target.y);
    cardOpacity.set(1);
    radius.set(0);
    textOpacity.set(0);
    flyProgress.set(1);
    cvBlur.set(0);
    navigate("/about");
    animate(flyProgress, 0, { duration: 0.45, ease: "easeOut" });
    animate(textOpacity, 1, { duration: 0.45, ease: "easeOut" });
    animate(cardX, 0, GROW);
    animate(cardY, 0, GROW);
    animate(radius, 28, GROW);
    animate(cvBlur, REST_BLUR, GROW);
    await animate(cardScale, 1, GROW).finished;
    // Guarantee the exact rest state regardless of any interruption.
    cardScale.set(1);
    cardX.set(0);
    cardY.set(0);
    radius.set(28);
    textOpacity.set(1);
    flyProgress.set(0);
    cvBlur.set(REST_BLUR);
    elevate(false);
    zoomingRef.current = false;
    endClose();
  };

  // Back button (in the CV overlay) flips `closing` → play the reverse zoom.
  useEffect(() => {
    if (closing) runClose();
    // runClose is stable enough for this one-shot trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  // Tilt measured from the card's CENTRE so it feels the same over the card
  // while the full-width <a> lets the surrounding space drive it too.
  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (zoomingRef.current) return;
    const el = innerRef.current;
    const card = cardRef.current;
    if (!el || !card) return;
    const r = card.getBoundingClientRect();
    const clamp = (v: number, a: number, b: number) =>
      Math.min(b, Math.max(a, v));
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    const ry = clamp(dx, -0.8, 0.8) * 30;
    const rx = -clamp(dy, -0.8, 0.8) * 30;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    el.style.setProperty("--mx", `${(clamp(dx, -0.5, 0.5) + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(clamp(dy, -0.5, 0.5) + 0.5) * 100}%`);
    pointer.current.x = clamp(dx * 2, -1, 1);
    pointer.current.y = clamp(-dy * 2, -1, 1);
  };

  const handleLeave = () => {
    if (zoomingRef.current) return;
    const el = innerRef.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
    pointer.current.x = 0;
    pointer.current.y = 0;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!zoomingRef.current) runOpen();
  };

  return (
    <div className="mt-28 [perspective:1000px] md:mt-12">
      {/* Full-width hover/click area so the tilt reacts to the cursor in the
          space around the card; the visual card stays a fixed size, centred. */}
      <Link
        to="/about/cv"
        aria-label={t("about.readCv")}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        className="group block w-full"
      >
        {/* Card is the SAME proportion as the viewport and holds the same CV
            content scaled down — so a uniform grow to scale 1 matches the real
            page exactly (no distortion, no over-scale). */}
        <motion.div
          ref={cardRef}
          className="relative mx-auto w-[clamp(280px,72vw,520px)]"
          style={{
            scale: cardScale,
            x: cardX,
            y: cardY,
            opacity: cardOpacity,
            aspectRatio: `${designW} / ${designH}`,
          }}
        >
          {/* pointer-events-none so the tilting visual never becomes the hover
              hit-target (that caused edge jitter); hover is the stable <a> box. */}
          <div
            ref={innerRef}
            className="pointer-events-none relative h-full w-full [transform-style:preserve-3d]"
          >
            {/* Card face: the real CV page scaled in as a live thumbnail, under
                a dark veil. Clipped here (its own layer) so the spilling text
                isn't cut off. Its border-radius animates to 0 as it grows. */}
            <motion.div
              className="absolute inset-0 overflow-hidden border border-white/10 bg-[#0d0d12] shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-colors duration-300 group-hover:border-yellow-300/30"
              style={{ borderRadius: radius, transform: "translateZ(0)" }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  width: designW,
                  transform: `scale(${cardW ? cardW / designW : 0.5})`,
                  filter: cvFilter,
                }}
              >
                <CvPage preview />
              </motion.div>
              {/* Dark veil for text legibility. */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/82 via-[#0a0a0f]/70 to-[#0a0a0f]/88" />
              {/* Cursor-following sheen. */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(253,224,71,0.12), transparent 60%)",
                }}
              />
            </motion.div>

            {/* The gold lettering — same instance that flies through the camera
                during the zoom (driven by flyProgress). Oversized canvas so it
                spills past the card and doesn't clip as it flies. */}
            <motion.div
              className={`pointer-events-none absolute ${
                wide ? "-inset-[18%]" : "-inset-x-[6%] -inset-y-[34%]"
              }`}
              style={{ opacity: textOpacity }}
            >
              <ReadCvText3D
                text={t("about.readCv").toUpperCase()}
                mode={wide ? "line" : "stack"}
                pointer={pointer}
                progress={flyProgress}
              />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
