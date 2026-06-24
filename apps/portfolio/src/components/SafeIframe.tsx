import { useState } from "react";
import { clsxm } from "@/lib/utils";

type Props = {
  iframeSrc: string;
  /** Poster shown until the embed loads (and as a fallback if it's blocked). */
  imgSrc: string;
  title?: string;
};

/**
 * Renders a project embed in a 16:9 frame. The poster image covers the frame
 * until the iframe fires `load`, then fades out — so a slow or frame-blocked
 * site still shows a meaningful preview (the "See live" button is the escape
 * hatch for sites that refuse framing).
 */
export const SafeIframe = ({ iframeSrc, imgSrc, title }: Props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={iframeSrc}
        title={title ?? "Project preview"}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 size-full border-none"
        allowFullScreen
      />
      <img
        src={imgSrc}
        alt={title ?? "Preview"}
        className={clsxm(
          "pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
        )}
      />
    </div>
  );
};
