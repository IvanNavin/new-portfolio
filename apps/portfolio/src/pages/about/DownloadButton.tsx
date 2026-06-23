import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouter } from "@/router/router";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

/**
 * "Read full CV" 3D button. A dark card sits behind, the volumetric gold text
 * floats in front, and the whole thing tilts toward the cursor so the viewing
 * angle of both the card and the text shifts in perspective.
 *
 * Two layouts:
 *  - tablet/desktop (≥768px) → one line that spills PAST the card edges (the
 *    canvas is larger than the card; on these widths it neither clips nor skews
 *    on the rotated cube face).
 *  - phones (<768px) → each word centered on its own line, the whole block
 *    rotated 45°, fit inside the card (so it can't overflow the viewport).
 *
 * TODO(next iteration): on click, scale this card up seamlessly INTO the full
 * CV page (igloo.inc-style zoom) instead of the instant overlay.
 */
export function DownloadButton() {
  const { t } = useTranslation();
  const { path } = useRouter();
  const { setOrigin } = useCvZoom();
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // Cursor fed into the 3D scene without re-rendering (read each frame).
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  // While the CV is open the card sits behind the overlay; drop its lettering so
  // it doesn't double up with the flying text mid-zoom.
  const zooming = path === "/about/cv";

  // Hand the card's screen rect to the overlay so it can grow the page out of it.
  const handleClick = () => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
  };

  // Mini CV thumbnail: a viewport-framed snapshot of the full CV page, scaled
  // into the card. Using the *viewport* width as the design width makes the
  // thumbnail identical to CvOverlay's first frame (full page scaled to the
  // card), so the click→zoom seam is exact. Tracked across viewport changes.
  const [cardW, setCardW] = useState(0);
  const [designW, setDesignW] = useState(() => window.innerWidth);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      setCardW(el.getBoundingClientRect().width);
      setDesignW(window.innerWidth);
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

  // Tilt is measured from the card's CENTRE (not the hover box), so it feels the
  // same over the card while the full-width <a> lets the surrounding space drive
  // it too. Offsets are in card-widths/heights: ±0.5 = card edge.
  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = innerRef.current;
    const card = cardRef.current;
    if (!el || !card) return;
    const r = card.getBoundingClientRect();
    const clamp = (v: number, a: number, b: number) =>
      Math.min(b, Math.max(a, v));
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    const ry = clamp(dx, -0.8, 0.8) * 30; // rotateY (±15° at card edge)
    const rx = -clamp(dy, -0.8, 0.8) * 30; // rotateX
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    el.style.setProperty("--mx", `${(clamp(dx, -0.5, 0.5) + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(clamp(dy, -0.5, 0.5) + 0.5) * 100}%`);
    pointer.current.x = clamp(dx * 2, -1, 1);
    pointer.current.y = clamp(-dy * 2, -1, 1);
  };

  const handleLeave = () => {
    const el = innerRef.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
    pointer.current.x = 0;
    pointer.current.y = 0;
  };

  return (
    <div className="mt-28 [perspective:1000px] md:mt-12">
      {/* Full-width hover/click area so the tilt reacts to the cursor in the
          space around the card, not only directly over it. The visual card
          stays a fixed size, centred inside. */}
      <Link
        to="/about/cv"
        aria-label={t("about.readCv")}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        className="group block w-full"
      >
        {/* pointer-events-none so the tilting visual never becomes the hover
            hit-target: hover is decided solely by the stable <a> box, otherwise
            the tilt moves the card's projection under/away from the cursor at
            the edges and it jitters in a hover/leave feedback loop. */}
        <div
          ref={cardRef}
          className="mx-auto aspect-[1.6] w-[clamp(300px,80vw,520px)]"
        >
          <div
            ref={innerRef}
            className="pointer-events-none relative h-full w-full rounded-[28px] transition-transform duration-200 ease-out [transform-style:preserve-3d]"
          >
            {/* Card face (behind): the real CV page, scaled into the card as a
                live thumbnail, under a dark veil so the gold text stays legible.
                Clipped here (own layer) — the card itself can't clip or it would
                cut off the spilling text. */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12] shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-colors duration-300 group-hover:border-yellow-300/30"
              style={{ transform: "translateZ(0)" }}
            >
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  width: designW,
                  transform: `scale(${cardW ? cardW / designW : 0.5})`,
                }}
              >
                <CvPage preview />
              </div>
              {/* Dark veil for text legibility. */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/82 via-[#0a0a0f]/70 to-[#0a0a0f]/88" />
              {/* Cursor-following sheen (subtle, not a gradient fill) */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(253,224,71,0.12), transparent 60%)",
                }}
              />
            </div>

            {/* Real extruded 3D text in an oversized canvas so the lettering
              spills past the card edges. Desktop spills symmetrically; phones
              spill mostly top/bottom (narrow side insets keep the canvas inside
              the viewport, generous vertical insets let the 45° stack overflow
              the short card). No CSS translateZ — depth comes from the Text3D
              geometry + the resting view angle. */}
            <div
              className={`pointer-events-none absolute transition-opacity duration-200 ${
                zooming ? "opacity-0" : "opacity-100"
              } ${wide ? "-inset-[18%]" : "-inset-x-[6%] -inset-y-[34%]"}`}
            >
              <ReadCvText3D
                text={t("about.readCv").toUpperCase()}
                mode={wide ? "line" : "stack"}
                pointer={pointer}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
