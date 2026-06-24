import { type CSSProperties, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "@/router/router";
import type { Work } from "./works";
import { setDiveRect } from "./diveStore";
import styles from "./work-item.module.css";

const TILT = 8; // max degrees

/**
 * A single work card: a faux browser window. Clicking opens the project's
 * detail overlay (/works/<id>), diving out of this card. Hovering tilts the
 * card toward the cursor and lifts the front image to reveal the tech tags.
 */
export const WorkItem = ({ item, index }: { item: Work; index: number }) => {
  const { navigate } = useRouter();
  const { id, name, status, frontPicture, backPicture, stack } = item;

  // Pointer-driven 3D tilt (springed for smoothness).
  const rotateX = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotateX.set(-py * TILT);
    rotateY.set(px * TILT);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const open = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDiveRect({ top: r.top, left: r.left, width: r.width, height: r.height });
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
        <button type="button" className={styles.screen} onClick={open}>
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
        </button>
      </motion.div>
    </motion.div>
  );
};
