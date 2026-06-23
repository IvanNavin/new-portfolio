import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** The "Read full CV" card's on-screen rect, captured at click time. */
export type Rect = { x: number; y: number; w: number; h: number };

/** An in-flight zoom: the card rect to grow from / shrink to, and direction. */
export type Zoom = { rect: Rect; mode: "open" | "close" };

type CvZoomValue = {
  zoom: Zoom | null;
  /** Card click → grow out of `rect`. */
  open: (rect: Rect) => void;
  /** Card's own closer (scrolls itself into view, measures, then shrinks). */
  close: (rect: Rect) => void;
  /** Zoom layer finished → tear down. */
  finish: () => void;
  /** CV overlay's Back → invoke the card's registered closer. */
  requestClose: () => void;
  setCloser: (fn: (() => void) | null) => void;
};

const CvZoomContext = createContext<CvZoomValue | null>(null);

/**
 * Coordinates the card→page zoom: the card hands its rect over, a full-screen
 * layer (outside the cube, so it owns true viewport coords) animates the page
 * opening out of that rect, and the CV overlay's Back asks the card to reverse.
 */
export function CvZoomProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const closerRef = useRef<(() => void) | null>(null);
  return (
    <CvZoomContext
      value={{
        zoom,
        open: (rect) => setZoom({ rect, mode: "open" }),
        close: (rect) => setZoom({ rect, mode: "close" }),
        finish: () => setZoom(null),
        requestClose: () => closerRef.current?.(),
        setCloser: (fn) => {
          closerRef.current = fn;
        },
      }}
    >
      {children}
    </CvZoomContext>
  );
}

export function useCvZoom(): CvZoomValue {
  const ctx = useContext(CvZoomContext);
  if (!ctx) throw new Error("useCvZoom must be used within <CvZoomProvider>");
  return ctx;
}
