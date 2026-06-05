'use client';
import { russoOne } from '@assets/fonts';
import { clsxm } from '@repo/utils';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

type Props = {
  url: string;
  labels: {
    copyLink: string;
    copied: string;
    scanHint: string;
  };
  onClose: () => void;
};

/**
 * Centered glass modal with a yellow QR encoding the current page URL.
 * Generated client-side via `qrcode` so the QR follows whatever locale
 * the visitor is reading (`/en/about/cv` vs `/uk/about/cv` etc.) and
 * any future domain move stays in sync without re-baking images.
 *
 * No close (×) button by design: clicking the backdrop or pressing
 * Esc closes — keeps the modal visually clean. A small kbd hint at
 * the bottom of the card surfaces both options.
 *
 * Hidden from print via data-print-hide on the root backdrop.
 */
export const QRPopover = ({ url, labels, onClose }: Props) => {
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);

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
        /* QR fallback handled by Copy link below if generation fails. */
      });
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = async () => {
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
        className={clsxm(russoOne.className, 'qr-popover')}
        role='dialog'
        aria-modal='true'
        aria-label='Share CV via QR code'
        onClick={(e) => e.stopPropagation()}
      >
        {qrSvg ? (
          <div
            className='qr-popover__qr'
            // qrcode lib outputs trusted SVG markup we generated locally.
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <div className='qr-popover__qr qr-popover__qr--placeholder' />
        )}
        <p className='qr-popover__hint'>{labels.scanHint}</p>
        <p className='qr-popover__url' title={url}>
          {url}
        </p>
        <button
          type='button'
          onClick={handleCopy}
          className='qr-popover__copy'
          aria-live='polite'
        >
          {copied ? labels.copied : labels.copyLink}
        </button>
      </div>
    </div>
  );
};
