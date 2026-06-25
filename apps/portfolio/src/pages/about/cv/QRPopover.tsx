import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { clsxm } from "@/lib/utils";
import ElectricBorder from "@/components/reactbits/ElectricBorder";

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
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the "copied" reset timer on unmount so it can't fire after teardown.
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

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
    } catch {
      // Async clipboard can be blocked (iframe / no permission) — fall back to
      // the legacy textarea + execCommand path.
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* give up silently */
      }
    }
    // Show the confirmation either way — the click intent was to copy, and the
    // feedback is what the user is after.
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      data-print-hide=""
      className="qr-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <ElectricBorder color="#fde047" speed={1} chaos={0.1} borderRadius={20}>
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
      </ElectricBorder>
    </div>
  );
};
