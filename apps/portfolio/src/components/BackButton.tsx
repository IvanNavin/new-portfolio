import { Link } from "@/router/router";

/**
 * Circular "back to Home" control. The original used a fixed-position canvas
 * flourish, but `position: fixed` is relative to the transformed cube ancestor
 * (not the viewport), so this sticks within the page's scroll container instead.
 */
export function BackButton({ text, to = "/" }: { text: string; to?: string }) {
  return (
    <div className="sticky top-0 z-50 flex justify-end pt-2">
      <Link
        to={to}
        aria-label="Back to home"
        className="font-russo grid size-20 place-items-center rounded-full border border-white/20 bg-black/40 text-center text-base text-white backdrop-blur-sm transition-colors hover:border-white/60"
      >
        {text}
      </Link>
    </div>
  );
}
