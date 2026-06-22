import { type ReactNode, useState } from "react";
import { Magnetic } from "@/components/Magnetic";
import { clsxm } from "@/lib/utils";
import { QRPopover } from "./QRPopover";

type Props = {
  labels: {
    print: string;
    share: string;
    copied: string;
    scanHint: string;
    downloadPdf: string;
  };
};

const CV_PDF_PATH = "/cv/Ivan_Holovko_CV.pdf";

const AnimatedFx = ({ children }: { children: ReactNode }) => (
  <>
    <span className="animate-animate1 absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#0c002b] to-yellow-500" />
    <span className="animate-animate2 absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-[#0c002b] to-yellow-500" />
    <span className="animate-animate3 absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-l from-[#0c002b] to-yellow-500" />
    <span className="animate-animate4 absolute top-0 left-0 h-full w-0.5 bg-gradient-to-t from-[#0c002b] to-yellow-500" />
    <span className="star-blink">
      <div />
    </span>
    <b className="relative z-10">{children}</b>
  </>
);

const BTN_CLASS = clsxm(
  "text-gold relative inline-block cursor-pointer overflow-hidden",
  "bg-transparent px-6 py-4 text-base tracking-widest uppercase",
);

/** CV action bar: print, share (QR), download PDF. */
export const CVToolbar = ({ labels }: Props) => {
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const openShare = () => {
    setShareUrl(window.location.href);
    setShowShare(true);
  };

  return (
    <>
      <div
        data-print-hide=""
        className="cv-toolbar"
        role="toolbar"
        aria-label="CV actions"
      >
        <Magnetic>
          <button
            type="button"
            onClick={() => window.print()}
            className={BTN_CLASS}
          >
            <AnimatedFx>{labels.print}</AnimatedFx>
          </button>
        </Magnetic>

        <Magnetic>
          <button
            type="button"
            onClick={openShare}
            className={BTN_CLASS}
            aria-haspopup="dialog"
            aria-expanded={showShare}
          >
            <AnimatedFx>{labels.share}</AnimatedFx>
          </button>
        </Magnetic>

        <Magnetic>
          <a
            href={CV_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_CLASS}
          >
            <AnimatedFx>{labels.downloadPdf}</AnimatedFx>
          </a>
        </Magnetic>
      </div>

      {showShare && (
        <QRPopover
          url={shareUrl}
          labels={{ copied: labels.copied, scanHint: labels.scanHint }}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
};
