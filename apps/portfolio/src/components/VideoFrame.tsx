import type { IframeHTMLAttributes } from "react";

/**
 * Responsive 16:9 YouTube embed. The padding-bottom trick keeps the aspect
 * ratio while the iframe absolutely fills the box.
 */
export const VideoFrame = ({
  src,
  ...rest
}: IframeHTMLAttributes<HTMLIFrameElement>) => (
  <div className="relative h-0 w-full pb-[56.25%]">
    <iframe
      src={src}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 size-full rounded-lg"
      {...rest}
    />
  </div>
);
