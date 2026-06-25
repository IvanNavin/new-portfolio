import { type CSSProperties, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "@/router/router";
import type { Work } from "./works";
import styles from "./work-item.module.css";

const TILT = 8; // max degrees

/**
 * A single work card: a faux browser window. Clicking morphs this exact window
 * into the detail overlay (shared `layoutId`), so the original card grows —
 * no scaled copy. Hovering tilts it toward the cursor and lifts the front image
 * to reveal the tech tags.
 */
export const WorkItem = ({ item, index }: { item: Work; index: number }) => {
  const { navigate, path } = useRouter();
  const { id, name, status, frontPicture, backPicture, stack } = item;

  const isOpen = path === `/works/${id}`;

  // Pointer-driven 3D tilt (springed for smoothness).
  const rotateX = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * TILT);
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * TILT);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const open = () => {
    reset(); // flatten before the morph so framer measures the card square-on
    navigate(`/works/${id}`);
  };

  return (
    <motion.div
      layout
      className={styles.item}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
      >
        {/* The shared element: this window morphs into the detail overlay. While
            its detail is open it's hidden here (the overlay holds the live one). */}
        <motion.button
          type="button"
          layoutId={`work-window-${id}`}
          className={styles.screen}
          onClick={open}
          style={{ visibility: isOpen ? "hidden" : "visible" }}
        >
          {status && <span className={styles.status}>{status}</span>}
          <div className={styles.bar}>
            <h5 className={styles.h5}>{name}</h5>
            <i />
          </div>
          <div className={styles.main}>
            <img src={frontPicture} alt={name} className={styles.back} />
            <div className={styles.tags}>
              <ul className={styles.skills}>
                {stack.map((skill, i) => (
                  <li
                    key={skill}
                    className={styles.skill}
                    style={
                      {
                        "--delay": `${(0.3 + i * 0.1).toFixed(1)}s`,
                      } as CSSProperties
                    }
                  >
                    {skill}
                  </li>
                ))}
              </ul>
              <picture className={styles.img}>
                {backPicture && (
                  <img
                    src={backPicture}
                    alt={name}
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
              </picture>
            </div>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
