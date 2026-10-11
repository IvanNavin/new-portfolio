import Image from "next/image";

import { cn } from "@/lib/cn";
import { posterUrl } from "@/lib/tmdb/client";

/** Falls back to the title's initials so the grid keeps its rhythm offline. */
export const TitlePoster = ({
  path,
  alt,
  sizes,
  className,
  priority,
}: {
  path: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) => {
  const url = posterUrl(path, "w342");

  if (!url) {
    const initials = alt
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    return (
      <div
        className={cn(
          "poster-ratio flex items-center justify-center bg-surface-sunken text-2xl font-semibold text-ink-faint",
          className,
        )}
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
};
