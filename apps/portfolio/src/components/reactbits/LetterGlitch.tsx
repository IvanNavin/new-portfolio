import { useRef, useEffect } from "react";

// Ported from React Bits (reactbits.dev/backgrounds/letter-glitch). A Canvas2D
// grid of monospace glyphs that randomly reshuffle and fade between colours.
// Sizing uses client* dimensions (transform-immune, unlike getBoundingClientRect
// which is skewed on a rotated cube face).

type Props = {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  className?: string;
};

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789";

export default function LetterGlitch({
  glitchColors = ["#3a2f10", "#e8b923", "#8a6d1f"],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = DEFAULT_CHARS,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(0);
  const size = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext("2d");

    const fontSize = 16;
    const charWidth = 10;
    const charHeight = 20;
    const chars = Array.from(characters);

    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const randomColor = () =>
      glitchColors[Math.floor(Math.random() * glitchColors.length)];

    const hexToRgb = (hex: string) => {
      const full = hex.replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (_m, r, g, b) => r + r + g + g + b + b,
      );
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
      return m
        ? {
            r: parseInt(m[1], 16),
            g: parseInt(m[2], 16),
            b: parseInt(m[3], 16),
          }
        : null;
    };

    const lerpColor = (
      a: { r: number; g: number; b: number },
      b: { r: number; g: number; b: number },
      f: number,
    ) =>
      `rgb(${Math.round(a.r + (b.r - a.r) * f)}, ${Math.round(
        a.g + (b.g - a.g) * f,
      )}, ${Math.round(a.b + (b.b - a.b) * f)})`;

    const initLetters = (columns: number, rows: number) => {
      grid.current = { columns, rows };
      letters.current = Array.from({ length: columns * rows }, () => ({
        char: randomChar(),
        color: randomColor(),
        targetColor: randomColor(),
        colorProgress: 1,
      }));
    };

    const draw = () => {
      const ctx = context.current;
      if (!ctx || !letters.current.length) return;
      const { width, height } = size.current;
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";
      letters.current.forEach((letter, i) => {
        const x = (i % grid.current.columns) * charWidth;
        const y = Math.floor(i / grid.current.columns) * charHeight;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent || !context.current) return;
      const dpr = window.devicePixelRatio || 1;
      // clientWidth/Height: layout size, immune to the cube's 3D transforms.
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      size.current = { width, height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      initLetters(Math.ceil(width / charWidth), Math.ceil(height / charHeight));
      draw();
    };

    const update = () => {
      const count = Math.max(1, Math.floor(letters.current.length * 0.05));
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * letters.current.length);
        const letter = letters.current[index];
        if (!letter) continue;
        letter.char = randomChar();
        letter.targetColor = randomColor();
        if (!smooth) {
          letter.color = letter.targetColor;
          letter.colorProgress = 1;
        } else {
          letter.colorProgress = 0;
        }
      }
    };

    const smoothTransitions = () => {
      let redraw = false;
      letters.current.forEach((letter) => {
        if (letter.colorProgress < 1) {
          letter.colorProgress = Math.min(1, letter.colorProgress + 0.05);
          const a = hexToRgb(letter.color);
          const b = hexToRgb(letter.targetColor);
          if (a && b) {
            letter.color = lerpColor(a, b, letter.colorProgress);
            redraw = true;
          }
        }
      });
      if (redraw) draw();
    };

    const animate = (now: number) => {
      if (now - lastGlitchTime.current >= glitchSpeed) {
        update();
        draw();
        lastGlitchTime.current = now;
      }
      if (smooth) smoothTransitions();
      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animationRef.current = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [glitchColors, glitchSpeed, smooth, characters]);

  return (
    <div
      className={`pointer-events-none relative h-full w-full overflow-hidden bg-black ${className}`.trim()}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {outerVignette && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(0,0,0,0)_55%,_rgba(10,10,15,1)_100%)]" />
      )}
      {centerVignette && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]" />
      )}
    </div>
  );
}
