import { motion } from "framer-motion";
import { CvPage } from "@/pages/about/cv/CvPage";
import { useCvZoom } from "@/pages/about/cvZoom";

/**
 * The full, scrollable CV page — the END state of the zoom. It fades in beneath
 * the growing card during the last stretch of the grow so the two crossfade
 * (the card dissolves into it). Back flips `closing` → the card reverses.
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
