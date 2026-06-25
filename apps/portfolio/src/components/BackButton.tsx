import { useEffect, useRef, useState } from "react";
import { Link } from "@/router/router";

const RADIUS = 50;
const LINE_WIDTH = 2;
const SIZE = RADIUS * 2;

/**
 * Circular "back to Home" control, ported from the original: a canvas-drawn
 * ring with a soft radial shadow that follows the cursor's direction. Uses rAF
 * instead of gsap. `position: fixed` is relative to the transformed cube
 * ancestor, so it sticks within the page's scroll container instead.
 */
export function BackButton({
  text,
  to = "/",
  onBack,
}: {
  text: string;
  to?: string;
  /** Intercept the click (e.g. to play a close animation) instead of navigating. */
  onBack?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = SIZE;
    canvas.height = SIZE;

    const mouse = { x: 0, y: 0 };
    let isHover = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + SIZE / 2;
      const cy = rect.top + SIZE / 2;

      let angle = Math.atan2(mouse.y - cy, mouse.x - cx);
      if (!angle) angle = 2.77;
      const dist = Math.hypot(cx - mouse.x, cy - mouse.y);
      const nowHover = dist < RADIUS;
      if (nowHover !== isHover) {
        isHover = nowHover;
        setHovered(nowHover);
      }

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Ring
      ctx.beginPath();
      ctx.arc(RADIUS, RADIUS, RADIUS - LINE_WIDTH, 0, 2 * Math.PI);
      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.closePath();

      // Shadow blob riding the cursor direction
      const sx = RADIUS * Math.cos(angle) + RADIUS;
      const sy = RADIUS * Math.sin(angle) + RADIUS;
      const grd = ctx.createRadialGradient(sx, sy, SIZE / 10, sx, sy, SIZE);
      grd.addColorStop(0.1, "rgba(0,0,0,0.85)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(sx, sy, SIZE, 0, 2 * Math.PI);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.closePath();
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div data-print-hide="" className="fixed top-4 right-6 z-[55]">
      <Link
        to={to}
        aria-label="Back to home"
        onClick={
          onBack
            ? (e) => {
                e.preventDefault();
                onBack();
              }
            : undefined
        }
        className={`relative block size-[100px] overflow-hidden rounded-full ${
          hovered ? "cursor-pointer" : ""
        }`}
      >
        <canvas ref={canvasRef} className="block size-[100px]" />
        <span className="font-russo pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-base leading-tight text-white">
          {text}
        </span>
      </Link>
    </div>
  );
}
