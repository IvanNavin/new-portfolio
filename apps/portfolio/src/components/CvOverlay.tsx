import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

/**
 * The full, scrollable CV page — the END state of the zoom. The card→page
 * animation runs in CvZoomLayer; this just shows the finished page once it's
 * grown to full size (seam invisible). Back asks the card to play the reverse
 * zoom (which navigates back to /about).
 */
export function CvOverlay() {
  const { requestClose } = useCvZoom();
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f]">
      <CvPage onBack={requestClose} />
    </div>
  );
}
