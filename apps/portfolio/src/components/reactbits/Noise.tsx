import { useEffect, useRef } from "react";

// Ported from React Bits (reactbits.dev/animations/noise). A Canvas2D film
// grain: a 1024² buffer is reseeded with random luminance every few frames and
// stretched over its container.

interface NoiseProps {
  patternRefreshInterval?: number;
  patternAlpha?: number;
  className?: string;
}

export default function Noise({
  patternRefreshInterval = 2,
  patternAlpha = 15,
  className = "",
}: NoiseProps) {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId: number;
    const canvasSize = 1024;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) drawGrain();
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };
    loop();

    return () => window.cancelAnimationFrame(animationId);
  }, [patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      ref={grainRef}
      className={`pointer-events-none h-full w-full ${className}`.trim()}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
