import { useEffect, useRef, memo } from "react";

// Ported from React Bits (reactbits.dev/backgrounds/dot-field). A Canvas2D grid
// of dots that bulge away from the cursor, with a soft radial glow following it.
// Sizing uses clientWidth/Height (transform-immune on a rotated cube face).

const TWO_PI = Math.PI * 2;

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

type Props = {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  glowRadius?: number;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  className?: string;
};

const DotField = memo(
  ({
    dotRadius = 1.5,
    dotSpacing = 14,
    cursorRadius = 500,
    bulgeStrength = 67,
    glowRadius = 160,
    waveAmplitude = 0,
    gradientFrom = "rgba(232, 185, 35, 0.32)",
    gradientTo = "rgba(255, 243, 214, 0.16)",
    glowColor = "rgba(232, 185, 35, 0.12)",
    className = "",
  }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glowRef = useRef<SVGCircleElement>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef({
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      speed: 0,
    });
    const rafRef = useRef<number | null>(null);
    const sizeRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
    const glowOpacity = useRef(0);
    const engagement = useRef(0);
    const propsRef = useRef({
      dotRadius,
      dotSpacing,
      cursorRadius,
      bulgeStrength,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    });
    propsRef.current = {
      dotRadius,
      dotSpacing,
      cursorRadius,
      bulgeStrength,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    };
    const glowId = useRef(
      `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`,
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const glowEl = glowRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let resizeTimer: ReturnType<typeof setTimeout>;

      const buildDots = (w: number, h: number) => {
        const p = propsRef.current;
        const step = p.dotRadius + p.dotSpacing;
        const cols = Math.floor(w / step);
        const rows = Math.floor(h / step);
        const padX = (w % step) / 2;
        const padY = (h % step) / 2;
        const dots: Dot[] = new Array(rows * cols);
        let idx = 0;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const ax = padX + col * step + step / 2;
            const ay = padY + row * step + step / 2;
            dots[idx++] = {
              ax,
              ay,
              sx: ax,
              sy: ay,
              vx: 0,
              vy: 0,
              x: ax,
              y: ay,
            };
          }
        }
        dotsRef.current = dots;
      };

      const doResize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        // Layout size (client*) is immune to the cube's 3D transforms; the rect
        // is only used for the (position) offset that maps the cursor.
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        const rect = parent.getBoundingClientRect();
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sizeRef.current = {
          w,
          h,
          offsetX: rect.left + window.scrollX,
          offsetY: rect.top + window.scrollY,
        };
        buildDots(w, h);
      };

      const resize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(doResize, 100);
      };

      const onMouseMove = (e: MouseEvent) => {
        const s = sizeRef.current;
        mouseRef.current.x = e.pageX - s.offsetX;
        mouseRef.current.y = e.pageY - s.offsetY;
      };

      const updateMouseSpeed = () => {
        const m = mouseRef.current;
        const dx = m.prevX - m.x;
        const dy = m.prevY - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        m.speed += (dist - m.speed) * 0.5;
        if (m.speed < 0.001) m.speed = 0;
        m.prevX = m.x;
        m.prevY = m.y;
      };
      const speedInterval = setInterval(updateMouseSpeed, 20);

      let frameCount = 0;
      const tick = () => {
        frameCount++;
        const dots = dotsRef.current;
        const m = mouseRef.current;
        const { w, h } = sizeRef.current;
        const p = propsRef.current;
        const len = dots.length;
        const t = frameCount * 0.02;

        const targetEngagement = Math.min(m.speed / 5, 1);
        engagement.current += (targetEngagement - engagement.current) * 0.06;
        if (engagement.current < 0.001) engagement.current = 0;
        const eng = engagement.current;

        glowOpacity.current += (eng - glowOpacity.current) * 0.08;
        if (glowEl) {
          glowEl.setAttribute("cx", String(m.x));
          glowEl.setAttribute("cy", String(m.y));
          glowEl.style.opacity = String(glowOpacity.current);
        }

        ctx.clearRect(0, 0, w, h);
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, p.gradientFrom);
        grad.addColorStop(1, p.gradientTo);
        ctx.fillStyle = grad;

        const cr = p.cursorRadius;
        const crSq = cr * cr;
        const rad = p.dotRadius / 2;
        ctx.beginPath();

        for (let i = 0; i < len; i++) {
          const d = dots[i];
          const dx = m.x - d.ax;
          const dy = m.y - d.ay;
          const distSq = dx * dx + dy * dy;

          if (distSq < crSq && eng > 0.01) {
            const dist = Math.sqrt(distSq);
            const tt = 1 - dist / cr;
            const push = tt * tt * p.bulgeStrength * eng;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            d.sx += (d.ax - d.sx) * 0.1;
            d.sy += (d.ay - d.sy) * 0.1;
          }

          let drawX = d.sx;
          let drawY = d.sy;
          if (p.waveAmplitude > 0) {
            drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
            drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
          }

          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
        ctx.fill();
        rafRef.current = requestAnimationFrame(tick);
      };

      doResize();
      window.addEventListener("resize", resize);
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        clearInterval(speedInterval);
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouseMove);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        className={`pointer-events-none relative h-full w-full overflow-hidden ${className}`.trim()}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id={glowId.current}>
              <stop offset="0%" stopColor={glowColor} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle
            ref={glowRef}
            cx="-9999"
            cy="-9999"
            r={glowRadius}
            fill={`url(#${glowId.current})`}
            style={{ opacity: 0, willChange: "opacity" }}
          />
        </svg>
      </div>
    );
  },
);

DotField.displayName = "DotField";

export default DotField;
