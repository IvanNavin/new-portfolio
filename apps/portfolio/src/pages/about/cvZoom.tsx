import { createContext, useContext, useState, type ReactNode } from "react";

/** The "Read full CV" card's on-screen rect, captured at click time. */
export type ZoomOrigin = { x: number; y: number; w: number; h: number };

type CvZoomValue = {
  /** Set while a card→page zoom is in flight; null for a plain CV open. */
  origin: ZoomOrigin | null;
  setOrigin: (o: ZoomOrigin | null) => void;
};

const CvZoomContext = createContext<CvZoomValue | null>(null);

/**
 * Shares the zoom origin between the "Read full CV" card (which measures it on
 * click) and the CV overlay (which animates the page growing out of it).
 */
export function CvZoomProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<ZoomOrigin | null>(null);
  return (
    <CvZoomContext value={{ origin, setOrigin }}>{children}</CvZoomContext>
  );
}

export function useCvZoom(): CvZoomValue {
  const ctx = useContext(CvZoomContext);
  if (!ctx) throw new Error("useCvZoom must be used within <CvZoomProvider>");
  return ctx;
}
