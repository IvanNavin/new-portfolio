/**
 * Cube geometry.
 *
 * The cube is a true cube of edge `100vmax`. Every face is a `100vmax` square,
 * so each face always covers the (non-square) viewport — the scene crops the
 * overflow. The cube container is pushed back by `50vmax` (half an edge) so the
 * active front face lands exactly on the screen plane (z = 0) with zero
 * perspective distortion. Rotating the container 90° swings the next face into
 * that same plane → seamless transition with both pages visible mid-rotation.
 */

export type FaceName = "front" | "right" | "left" | "top" | "bottom";

const HALF = "50vmax";

/** Static transform placing each face on its side of the cube. */
export const FACE_TRANSFORM: Record<FaceName, string> = {
  front: `translateZ(${HALF})`,
  right: `rotateY(90deg) translateZ(${HALF})`,
  left: `rotateY(-90deg) translateZ(${HALF})`,
  top: `rotateX(90deg) translateZ(${HALF})`,
  bottom: `rotateX(-90deg) translateZ(${HALF})`,
};

/** Container transform that brings each face to the front (screen plane). */
export const VIEW_TRANSFORM: Record<FaceName, string> = {
  front: `translateZ(-${HALF})`,
  right: `translateZ(-${HALF}) rotateY(-90deg)`,
  left: `translateZ(-${HALF}) rotateY(90deg)`,
  top: `translateZ(-${HALF}) rotateX(-90deg)`,
  bottom: `translateZ(-${HALF}) rotateX(90deg)`,
};

/**
 * Compass mapping — which cube face each route lives on, chosen by the
 * direction the incoming page should slide in from:
 *   /about   → right face   (About arrives from the right)
 *   /works   → left face    (Works arrives from the left)
 *   /talks   → bottom face  (Talks arrives from below)   — added later
 *   /contact → top face     (Contact arrives from the top) — added later
 */
export const PATH_FACE: Record<string, FaceName> = {
  "/": "front",
  "/about": "right",
  "/works": "left",
  "/talks": "bottom",
  "/contact": "top",
};

export function faceForPath(path: string): FaceName {
  return PATH_FACE[path] ?? "front";
}
