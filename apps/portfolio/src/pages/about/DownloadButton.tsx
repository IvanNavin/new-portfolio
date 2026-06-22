import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/router/router";
import { ReadCvText3D } from "@/components/ReadCvText3D";

/**
 * "Read full CV" 3D button. A dark card sits behind, the volumetric gold text
 * floats in front (translateZ), and the whole thing tilts toward the cursor so
 * the viewing angle of both the card and the text shifts in perspective.
 *
 * TODO(next iteration): on click, scale this card up seamlessly INTO the full
 * CV page (igloo.inc-style zoom) instead of the instant overlay.
 */
export function DownloadButton() {
  const { t } = useTranslation();
  const innerRef = useRef<HTMLDivElement>(null);

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

          {/* Real extruded 3D text filling the card. Canvas = card (inset-0):
              an oversized canvas gets skewed/clipped on the rotated cube face
              and overflows narrow viewports, so we keep it card-sized and fill
              it. No CSS translateZ for the same skew reason — depth comes from
              the Text3D geometry + the card's tilt. */}
          <div className="pointer-events-none absolute inset-0">
            <ReadCvText3D text={t("about.readCv").toUpperCase()} />
          </div>
        </div>
      </Link>
    </div>
  );
}
