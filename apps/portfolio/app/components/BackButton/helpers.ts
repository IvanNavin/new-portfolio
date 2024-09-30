import { btnLineWidth, btnRayon } from '@components/BackButton/constants';
import { MousePositionType } from '@components/BackButton/types';

export const calcAngle = (p1: MousePositionType, p2: MousePositionType) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

export const getDistance = (p1: MousePositionType, p2: MousePositionType) => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

export const createButton = (context: CanvasRenderingContext2D) => {
  context.beginPath();
  context.arc(
    btnRayon,
    btnRayon,
    btnRayon - btnLineWidth,
    0,
    2 * Math.PI,
    false,
  );
  context.lineWidth = btnLineWidth;
  context.strokeStyle = '#FFFFFF';
  context.stroke();
  context.closePath();
};

export const createShadow = (
  angle: number,
  context: CanvasRenderingContext2D,
) => {
  const rayon = btnRayon * 2;
  const center = {
    x: (rayon / 2) * Math.cos(angle) + btnRayon,
    y: (rayon / 2) * Math.sin(angle) + btnRayon,
  };

  context.beginPath();
  context.arc(center.x, center.y, rayon, 0, 2 * Math.PI, false);
  context.lineWidth = 3;

  const grd = context.createRadialGradient(
    center.x,
    center.y,
    rayon / 10,
    center.x,
    center.y,
    rayon,
  );

  grd.addColorStop(0.1, 'rgba(0,0,0,0.85)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = grd;
  context.fill();
  context.closePath();
};
