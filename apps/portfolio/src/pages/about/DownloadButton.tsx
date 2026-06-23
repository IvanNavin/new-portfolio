import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/router/router";
import { ReadCvText3D, type Pointer } from "@/components/ReadCvText3D";
import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

const REST_BLUR = 6; // frosted-glass CV thumbnail at rest (matches CvZoomLayer)

/**
 * "Read full CV" button. At rest it's a frosted-glass card showing the real CV
 * page as a thumbnail under the volumetric gold lettering, tilting toward the
 * cursor. Clicking hands the card's rect to CvZoomLayer, which grows the page
 * out of it; the card is hidden during the zoom so only the layer is seen.
 */
export function DownloadButton() {
  const { t } = useTranslation();
  const { zoom, open, close, setCloser } = useCvZoom();
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  // Hidden while the zoom layer stands in for it (so it never peeks around it).
  const hidden = zoom !== null;

  const rectOf = () => {
    const r = cardRef.current!.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (cardRef.current && !zoom) open(rectOf());
  };

  // Register how to close: scroll the card into view (it may be off-screen after
  // a reload on /about/cv) so the page shrinks back to a visible card.
  useEffect(() => {
    setCloser(() => {
      const card = cardRef.current;
      if (!card) return;
      const sc = card.closest(".overflow-y-auto") as HTMLElement | null;
      if (sc) {
        const r = card.getBoundingClientRect();
        sc.scrollTop += r.top + r.height / 2 - window.innerHeight / 2;
      }
      close(rectOf());
    });
    return () => setCloser(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mini CV thumbnail: a viewport-framed snapshot of the full CV page scaled
  // into the card (same framing as CvZoomLayer's first frame → exact seam).
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

  // Tilt measured from the card's CENTRE so it feels the same over the card
  // while the full-width <a> lets the surrounding space drive it too.
  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    const el = innerRef.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
    pointer.current.x = 0;
    pointer.current.y = 0;
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
        <div
          ref={cardRef}
          className="mx-auto aspect-[1.6] w-[clamp(300px,80vw,520px)] transition-opacity duration-150"
          style={{ opacity: hidden ? 0 : 1 }}
        >
          {/* pointer-events-none so the tilting visual never becomes the hover
              hit-target (that caused edge jitter); hover is the stable <a> box. */}
          <div
            ref={innerRef}
            className="pointer-events-none relative h-full w-full rounded-[28px] [transform-style:preserve-3d]"
          >
            {/* Card face: the real CV page, frosted (behind glass), under a dark
                veil. Clipped here so the spilling text isn't cut off. */}
            <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12] shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-colors duration-300 group-hover:border-yellow-300/30">
              <div
                aria-hidden="true"
                className="absolute top-0 left-1/2 origin-top"
                style={{
                  width: designW,
                  transform: `translateX(-50%) scale(${
                    cardW ? cardW / designW : 0.4
                  })`,
                  filter: `blur(${REST_BLUR}px)`,
                }}
              >
                <CvPage preview />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/82 via-[#0a0a0f]/70 to-[#0a0a0f]/88" />
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(253,224,71,0.12), transparent 60%)",
                }}
              />
            </div>

            {/* Gold lettering. Oversized canvas so it spills past the card. */}
            <div
              className={`pointer-events-none absolute ${
                wide ? "-inset-[18%]" : "-inset-x-[6%] -inset-y-[34%]"
              }`}
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
