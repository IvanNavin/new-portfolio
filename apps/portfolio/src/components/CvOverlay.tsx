import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

/**
 * The full, scrollable CV page. This is only the END state of the zoom — the
 * card→page animation runs on the real "Read full CV" card (see DownloadButton),
 * and this overlay simply shows the finished page once it's grown to full size,
 * so the seam is invisible. Back flips `closing`, which tells the card to play
 * the reverse zoom.
 */
export function CvOverlay() {
  const { startClose } = useCvZoom();
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f]">
      <CvPage onBack={startClose} />
    </div>
  );
}
