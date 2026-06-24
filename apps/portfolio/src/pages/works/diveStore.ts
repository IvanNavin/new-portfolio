// Hands the clicked card's on-screen rect from the grid to the detail overlay
// so the overlay can "dive" (grow) out of that exact card. Module-level because
// the two live in different parts of the tree and a navigation happens between.

type Rect = { top: number; left: number; width: number; height: number };

let diveRect: Rect | null = null;

export const setDiveRect = (rect: Rect | null) => {
  diveRect = rect;
};

export const consumeDiveRect = (): Rect | null => {
  const r = diveRect;
  diveRect = null;
  return r;
};
