'use client';
import { russoOne } from '@assets/fonts';
import { clsxm } from '@repo/utils';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

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
 * Generated client-side via `qrcode` so the QR follows whatever locale
 * the visitor is reading (`/en/about/cv` vs `/uk/about/cv`) and any
 * future domain move stays in sync without re-baking images.
 *
 * Two affordances, no dedicated buttons:
 *   • Click the QR → it grows to ~320px so a phone camera can lock on
 *     even when the laptop is half a metre away. Click again to shrink.
 *   • Click the URL → it's copied to the clipboard and the link text
 *     is momentarily replaced with the localized "Copied" label.
 *
 * Close: backdrop click or Esc. If the QR is enlarged Esc shrinks it
 * first and only closes the modal on a second press — matches the
 * unwind-then-dismiss flow you get from any lightbox.
 *
 * No × close button by design — keeps the card visually clean. Hidden
 * from print via data-print-hide on the root backdrop.
 */
export const QRPopover = ({ url, labels, onClose }: Props) => {
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    QRCode.toString(url, {
      type: 'svg',
      // Yellow modules on transparent — composes against our dark
      // glass card without a hard white bg fighting the theme.
      color: { dark: '#fde047', light: '#00000000' },
      margin: 1,
      width: 240,
      errorCorrectionLevel: 'M',
    })
      .then(setQrSvg)
      .catch(() => {
        /* If QR generation fails the URL below is still copyable. */
      });
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (enlarged) setEnlarged(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
      data-print-hide=''
      className='qr-backdrop'
      onClick={onClose}
      role='presentation'
    >
      <div
        className={clsxm(
          russoOne.className,
          'qr-popover',
          enlarged && 'qr-popover--enlarged',
        )}
        role='dialog'
        aria-modal='true'
        aria-label='Share CV via QR code'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={() => setEnlarged((v) => !v)}
          aria-label={
            enlarged ? 'Shrink QR code' : 'Enlarge QR code for scanning'
          }
          className={clsxm(
            'qr-popover__qr',
            enlarged && 'qr-popover__qr--enlarged',
          )}
        >
          {qrSvg ? (
            // qrcode lib outputs trusted SVG markup we generated locally.
            <span dangerouslySetInnerHTML={{ __html: qrSvg }} />
          ) : (
            <span className='qr-popover__qr-placeholder' />
          )}
        </button>

        {/* In enlarged mode we hide the chrome so the QR is the only
            thing in view — easier for the scanner to find the symbol. */}
        {!enlarged && (
          <>
            <p className='qr-popover__hint'>{labels.scanHint}</p>
            <button
              type='button'
              onClick={copyUrl}
              className='qr-popover__url'
              title={url}
              aria-live='polite'
            >
              {copied ? labels.copied : url}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
