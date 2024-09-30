import { DirectionType } from '@components/AnimatedPage/types';

export const getAnimation = (
  direction: DirectionType,
  screenWidth: number,
  screenHeight: number,
) => {
  switch (direction) {
    case 'left':
      return {
        initial: { x: -screenWidth },
        exit: { x: screenWidth },
      };
    case 'right':
      return {
        initial: { x: screenWidth },
        exit: { x: -screenWidth },
      };
    case 'up':
      return {
        initial: { y: screenHeight },
        exit: { y: -screenHeight },
      };
    case 'down':
      return {
        initial: { y: -screenHeight },
        exit: { y: screenHeight },
      };
    default:
      return {
        initial: {
          opacity: 1,
        },
      };
  }
};
