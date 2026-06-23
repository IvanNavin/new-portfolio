import { createContext, useContext, useState, type ReactNode } from "react";

type CvZoomValue = {
  /** True while the CV page is shrinking back into the card (Back pressed). */
  closing: boolean;
  /** CV overlay's Back → ask the card to play the reverse zoom. */
  startClose: () => void;
  /** Card → reverse zoom finished. */
  endClose: () => void;
};

const CvZoomContext = createContext<CvZoomValue | null>(null);

/**
 * Bridges the CV overlay's Back button and the "Read full CV" card: the card
 * owns the zoom animation (it animates its own real elements), the overlay just
 * flips `closing` to trigger the reverse.
 */
export function CvZoomProvider({ children }: { children: ReactNode }) {
  const [closing, setClosing] = useState(false);
  return (
    <CvZoomContext
      value={{
        closing,
        startClose: () => setClosing(true),
        endClose: () => setClosing(false),
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
