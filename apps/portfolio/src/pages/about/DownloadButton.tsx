import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/router/router";
import { ReadCvText3D } from "@/components/ReadCvText3D";

/**
 * "Read full CV" 3D button. A dark card sits behind, the volumetric gold text
 * floats in front, and the whole thing tilts toward the cursor so the viewing
 * angle of both the card and the text shifts in perspective.
 *
 * Two layouts:
 *  - desktop (≥900px) → one line that spills PAST the card edges (the canvas is
 *    larger than the card; on a wide viewport it neither clips nor skews on the
 *    rotated cube face).
 *  - narrow (<900px)  → each word on its own line, stacked on a diagonal inside
 *    the card (so it can't overflow the phone viewport / cube face).
 *
 * TODO(next iteration): on click, scale this card up seamlessly INTO the full
 * CV page (igloo.inc-style zoom) instead of the instant overlay.
 */
export function DownloadButton() {
  const { t } = useTranslation();
  const innerRef = useRef<HTMLDivElement>(null);

  // Desktop spills the lettering past the card; narrow screens stack it.
  const [wide, setWide] = useState(
    () => window.matchMedia("(min-width: 900px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
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
  };

  const handleLeave = () => {
    const el = innerRef.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="mt-12 flex justify-center [perspective:1000px]">
      <Link
        to="/about/cv"
        aria-label={t("about.readCv")}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group block aspect-[1.6] w-[clamp(300px,80vw,520px)]"
      >
        <div
          ref={innerRef}
          className="relative h-full w-full rounded-[28px] transition-transform duration-200 ease-out [transform-style:preserve-3d]"
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

          {/* Real extruded 3D text. On desktop the canvas is larger than the
              card so the lettering spills over its edges; on narrow screens it
              stays card-sized (inset-0) so the diagonal word-stack can't clip
              or skew on the rotated cube face. No CSS translateZ — depth comes
              from the Text3D geometry + the card's tilt. */}
          <div
            className={
              wide
                ? "pointer-events-none absolute -inset-[22%]"
                : "pointer-events-none absolute inset-0"
            }
          >
            <ReadCvText3D
              text={t("about.readCv").toUpperCase()}
              mode={wide ? "line" : "stack"}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
