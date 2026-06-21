import { type CSSProperties, useState } from "react";
import { Link } from "@/router/router";
import { clsxm, isTouchDevice } from "@/lib/utils";
import styles from "./nav-menu-item.module.css";

export type NavMenuItemData = {
  first: string;
  second: string;
  href: string;
};

type Props = {
  item: NavMenuItemData;
  index: number;
  className?: string;
  textClassName?: string;
};

export const NavMenuItem = ({
  item: { first, second, href },
  index,
  className,
  textClassName,
}: Props) => {
  const [hovered, setHovered] = useState(false);
  // Client-only SPA: window always exists, so detect touch at first render.
  const [isTouch] = useState(() => isTouchDevice());

  const baseTextClass = clsxm(
    "text-shadow font-russo text-[8vw] text-white shadow-black",
    textClassName,
  );

  // Spacer needs the longer string so the cube box never clips a face.
  const spacer = first.length >= second.length ? first : second;

  // Per-item delay so the four menu items flip in a wave on mobile, and slide
  // in on mount.
  const cubeStyle = {
    "--flip-delay": `${index * 0.4}s`,
    animation: `slideText 0.5s forwards ${index + 0.5}s`,
  } as CSSProperties;

  return (
    <Link
      to={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsxm(
        "group relative flex self-start border-transparent bg-transparent p-0 text-left",
        "focus-within:border-transparent focus-within:outline-transparent select-none",
        isTouch && "touch",
        className,
      )}
    >
      <span
        className={clsxm(
          styles.cubeScene,
          "opacity-0 transition-[margin] duration-500 ease-in-out group-hover:ml-10",
        )}
        style={cubeStyle}
      >
        <span className={styles.cube}>
          {/* spacer — invisible, dictates cube box size */}
          <span className={clsxm(baseTextClass, styles.spacer)}>{spacer}</span>

          {/* front face — desktop variant: hover swaps the text in place */}
          <span
            className={clsxm(
              baseTextClass,
              styles.face,
              styles.faceFront,
              styles.desktopOnly,
            )}
          >
            {hovered ? second : first}
          </span>

          {/* front face — touch variant: always shows the first text;
              the cube animation reveals the bottom face below */}
          <span
            className={clsxm(
              baseTextClass,
              styles.face,
              styles.faceFront,
              styles.touchOnly,
            )}
          >
            {first}
          </span>

          {/* bottom face — only used while the cube is rotating on touch */}
          <span
            className={clsxm(
              baseTextClass,
              styles.face,
              styles.faceBottom,
              styles.touchOnly,
            )}
          >
            {second}
          </span>
        </span>
      </span>
    </Link>
  );
};
