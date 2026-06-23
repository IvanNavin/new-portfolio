import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

/**
 * The full, scrollable CV page — the END state of the zoom. It is OPAQUE (no
 * fade-in): a semi-transparent overlay would let the About page bleed through.
 * It mounts beneath the grown card, which then dissolves into it (card opacity
 * → 0), so the page is fully covered the whole time. Back flips `closing`.
 */
export function CvOverlay() {
  const { startClose } = useCvZoom();
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f]">
      <CvPage onBack={startClose} />
    </div>
  );
}
