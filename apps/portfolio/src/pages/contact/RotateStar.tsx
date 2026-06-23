import lightDots from "@/assets/light_dots.png";
import { clsxm } from "@/lib/utils";

/**
 * Cosmic background for the Contact page: two counter-rotating, brightened
 * light-dot layers pinned to the centre. Decorative + inert.
 */
export const RotateStar = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <img
        src={lightDots}
        width={543}
        height={382}
        alt=""
        draggable={false}
        className={clsxm(
          "absolute top-1/2 left-1/2 brightness-200",
          "animate-rotateStar",
        )}
      />
      <img
        src={lightDots}
        width={543}
        height={382}
        alt=""
        draggable={false}
        className={clsxm(
          "absolute top-1/2 left-1/2 w-full brightness-200",
          "animate-reRotateStar",
        )}
      />
    </div>
  );
};
