import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { clsxm } from "@/lib/utils";

type Props = {
  url: string;
  labels: {
    copied: string;
    scanHint: string;
  };
  onClose: () => void;
};

/**
 * Centered glass modal with a yellow QR encoding the current page URL.
 * Click the QR to enlarge for scanning; click the URL to copy. Closes on
 * backdrop click or Esc (Esc shrinks first if enlarged).
 */
export const QRPopover = ({ url, labels, onClose }: Props) => {
  const [qrSvg, setQrSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    QRCode.toString(url, {
      type: "svg",
      color: { dark: "#fde047", light: "#00000000" },
      margin: 1,
      width: 240,
      errorCorrectionLevel: "M",
    })
      .then(setQrSvg)
      .catch(() => {
        /* If QR generation fails the URL below is still copyable. */
      });
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (enlarged) setEnlarged(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, enlarged]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard API can fail (insecure context, permissions). */
    }
  };

  return (
    <div
      data-print-hide=""
      className="qr-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={clsxm(
          "font-russo qr-popover",
          enlarged && "qr-popover--enlarged",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Share CV via QR code"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setEnlarged((v) => !v)}
          aria-label={enlarged ? "Shrink QR code" : "Enlarge QR code"}
          className={clsxm(
            "qr-popover__qr",
            enlarged && "qr-popover__qr--enlarged",
          )}
        >
          {qrSvg ? (
            <span dangerouslySetInnerHTML={{ __html: qrSvg }} />
          ) : (
            <span className="qr-popover__qr-placeholder" />
          )}
        </button>

        {!enlarged && (
          <>
            <p className="qr-popover__hint">{labels.scanHint}</p>
            <button
              type="button"
              onClick={copyUrl}
              className="qr-popover__url"
              title={url}
              aria-live="polite"
            >
              {copied ? labels.copied : url}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
