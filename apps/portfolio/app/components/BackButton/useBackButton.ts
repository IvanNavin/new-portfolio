import { btnRayon, canvasSize } from '@components/BackButton/constants';
import {
  calcAngle,
  createButton,
  createShadow,
  getDistance,
} from '@components/BackButton/helpers';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

import { MousePositionType } from './types';

export const useBackButton = () => {
  const [mousePos, setMousePos] = useState<MousePositionType>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const canvasPos = canvas.getBoundingClientRect();
    const canvasCenter = {
      x: canvasPos.left + canvas.width / 2,
      y: canvasPos.top + canvas.height / 2,
    };

    context.clearRect(0, 0, canvas.width, canvas.height);

    let angle = calcAngle({ x: canvasCenter.x, y: canvasCenter.y }, mousePos);

    if (!angle) angle = 2.77;

    const distance = getDistance(
      { x: canvasCenter.x, y: canvasCenter.y },
      mousePos,
    );

    setHovered(distance < btnRayon);

    createButton(context);
    createShadow(angle, context);
  };

  const onMouseMove = (e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    gsap.ticker.add(update);
  }, [mousePos]);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    setCanvasReady(true);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      gsap.ticker.remove(update);
    };
  }, []);

  return {
    ref: canvasRef,
    hovered,
    canvasReady,
  };
};
