import { Children, isValidElement, type ReactNode } from "react";
import { FACE_TRANSFORM, faceForPath, VIEW_TRANSFORM } from "./faces";
import "./cube.css";

interface CubeChildProps {
  path: string;
}

interface CubeWrapperProps {
  /** Current active path — drives which face faces the camera. */
  active: string;
  /** Page elements, each carrying a `path` prop (e.g. <HomePage path="/" />). */
  children: ReactNode;
}

/**
 * Mounts every page simultaneously as a face of a CSS 3D cube and rotates the
 * cube to bring the active page to the front. Nothing unmounts on navigation —
 * that is what keeps the transition seamless and both pages visible mid-spin.
 *
 * The leaving/parked faces are marked `inert` + `aria-hidden` so they are
 * removed from the tab order and the accessibility tree while still rendered.
 */
export function CubeWrapper({ active, children }: CubeWrapperProps) {
  const containerTransform = VIEW_TRANSFORM[faceForPath(active)];

  return (
    <div className="cube-scene">
      <div className="cube" style={{ transform: containerTransform }}>
        {Children.map(children, (child) => {
          if (!isValidElement<CubeChildProps>(child)) return null;
          const { path } = child.props;
          const face = faceForPath(path);
          const isActive = path === active;
          return (
            <section
              className="cube-face"
              data-face={face}
              data-path={path}
              style={{ transform: FACE_TRANSFORM[face] }}
              inert={!isActive}
              aria-hidden={!isActive}
            >
              <div className="cube-face__inner">{child}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
