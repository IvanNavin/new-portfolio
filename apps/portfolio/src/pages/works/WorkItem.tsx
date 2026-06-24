import { type CSSProperties } from "react";
import { useRouter } from "@/router/router";
import { clsxm } from "@/lib/utils";
import type { Work } from "./works";
import styles from "./work-item.module.css";

/**
 * A single work card: a faux browser window. Clicking opens the project's
 * detail overlay (/works/<id>); hovering lifts the front image to reveal the
 * tech-stack tags (and the optional back screenshot).
 */
export const WorkItem = ({ item }: { item: Work }) => {
  const { navigate } = useRouter();
  const { id, name, status, frontPicture, backPicture, stack } = item;

  return (
    <div className={styles.item}>
      <button
        type="button"
        className={styles.screen}
        onClick={() => navigate(`/works/${id}`)}
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
              {stack.map((skill, index) => (
                <li
                  key={skill}
                  className={styles.skill}
                  style={
                    {
                      "--delay": `${(0.3 + index * 0.1).toFixed(1)}s`,
                    } as CSSProperties
                  }
                >
                  {skill}
                </li>
              ))}
            </ul>
            <picture className={clsxm(styles.img)}>
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
    </div>
  );
};
