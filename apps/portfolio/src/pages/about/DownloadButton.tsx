import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/router/router";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";

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
  const innerRef = useRef<HTMLDivElement>(null);
  // Cursor fed into the 3D scene without re-rendering (read each frame).
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

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

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = innerRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    const ry = (px - 0.5) * 30; // rotateY
    const rx = -(py - 0.5) * 30; // rotateX
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    pointer.current.x = px * 2 - 1;
    pointer.current.y = 1 - py * 2;
  };

  const handleLeave = () => {
    const el = innerRef.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
    pointer.current.x = 0;
    pointer.current.y = 0;
  };

  return (
    <div className="mt-28 flex justify-center [perspective:1000px] md:mt-12">
      <Link
        to="/about/cv"
        aria-label={t("about.readCv")}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group block aspect-[1.6] w-[clamp(300px,80vw,520px)]"
      >
        {/* pointer-events-none so the tilting visual never becomes the hover
            hit-target: hover is decided solely by the stable <a> box, otherwise
            the tilt moves the card's projection under/away from the cursor at
            the edges and it jitters in a hover/leave feedback loop. */}
        <div
          ref={innerRef}
          className="pointer-events-none relative h-full w-full rounded-[28px] transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        >
          {/* Card face (behind) */}
          <div
            className="absolute inset-0 rounded-[28px] border border-white/10 bg-[#0d0d12] shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-colors duration-300 group-hover:border-yellow-300/30"
            style={{ transform: "translateZ(0)" }}
          >
            {/* Cursor-following sheen (subtle, not a gradient fill) */}
            <div
              className="absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
            className={
              wide
                ? "pointer-events-none absolute -inset-[18%]"
                : "pointer-events-none absolute -inset-x-[6%] -inset-y-[34%]"
            }
          >
            <ReadCvText3D
              text={t("about.readCv").toUpperCase()}
              mode={wide ? "line" : "stack"}
              pointer={pointer}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
