import { motion } from "framer-motion";
import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

/**
 * The full, scrollable CV page — the END state of the zoom. The card→page
 * animation runs on the real card (DownloadButton); this fades in beneath the
 * card during the last stretch of the grow so the two crossfade (the card
 * dissolves into it). Back asks the card to play the reverse zoom.
 */
export function CvOverlay() {
  const { startClose } = useCvZoom();
  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <CvPage onBack={startClose} />
    </motion.div>
  );
}
