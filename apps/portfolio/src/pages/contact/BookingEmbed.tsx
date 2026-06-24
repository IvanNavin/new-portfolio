import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Bootstraps Cal.com's `window.Cal` queue (adapted from the official embed
 * snippet): a stub buffers calls until the real `embed.js` loads and drains
 * them. `scriptSrc` points at the EU instance (`app.cal.eu`).
 */
function ensureCal(scriptSrc: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (typeof w.Cal === "function" && w.Cal.loaded) return w.Cal;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = (target: any, args: unknown[]) => target.q.push(args);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Cal: any =
    w.Cal ||
    function (...args: unknown[]) {
      if (!Cal.loaded) {
        Cal.ns = {};
        Cal.q = Cal.q || [];
        const s = document.createElement("script");
        s.src = scriptSrc;
        s.async = true;
        document.head.appendChild(s);
        Cal.loaded = true;
      }
      if (args[0] === "init") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api: any = (...a: unknown[]) => push(api, a);
        const ns = args[1];
        api.q = api.q || [];
        if (typeof ns === "string") {
          Cal.ns[ns] = Cal.ns[ns] || api;
          push(Cal.ns[ns], args);
          push(Cal, ["initNamespace", ns]);
        } else {
          push(Cal, args);
        }
        return;
      }
      push(Cal, args);
    };
  Cal.q = Cal.q || [];
  w.Cal = Cal;
  return Cal;
}

type Props = {
  /** `<username>` (event picker) or `<username>/<slug>` (straight to calendar). */
  calLink: string;
  /** Cal.com instance origin (EU = `https://cal.eu`). */
  origin: string;
  /** Embed loader URL, paired to the same instance as `origin`. */
  scriptSrc: string;
  /** Localized helper label above the widget. */
  caption: string;
  /** Localized "back to event picker" label (profile mode only). */
  resetLabel: string;
  /** Brand accent (hex w/o `#`) → Cal's `cal-brand` so CTAs match the gold. */
  brandColor?: string;
};

/**
 * Cal.com inline booking widget. Rendered into a target div; embed.js injects
 * the iframe. In profile mode (no event slug) Cal's inline widget has no
 * back-to-picker control, so a "choose a different duration" button re-fires
 * inline() to reset it.
 */
export const BookingEmbed = ({
  calLink,
  origin,
  scriptSrc,
  caption,
  resetLabel,
  brandColor = "fde047",
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [resetTick, setResetTick] = useState(0);

  const namespace = calLink.split("/").pop() || "default";
  const isProfileMode = !calLink.includes("/");

  useEffect(() => {
    if (!ref.current) return;
    // Wipe any iframe Cal injected before — re-calling inline() on a populated
    // container would stack a second iframe.
    ref.current.innerHTML = "";
    const Cal = ensureCal(scriptSrc);
    Cal("init", namespace, { origin });
    Cal.ns[namespace]("inline", {
      elementOrSelector: ref.current,
      calLink,
      config: { layout: "month_view" },
    });
    Cal.ns[namespace]("ui", {
      theme: "dark",
      cssVarsPerTheme: { dark: { "cal-brand": `#${brandColor}` } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, [calLink, namespace, origin, scriptSrc, brandColor, resetTick]);

  const handleReset = useCallback(() => setResetTick((n) => n + 1), []);

  return (
    <div className="w-full">
      <p className="mb-4 text-center text-xs tracking-[0.25em] text-white/55 uppercase">
        {caption}
      </p>
      {/* No outer frame — Cal renders its own card inside the iframe. */}
      {/* Cal's inline embed is a fixed-height widget (cal-inline inherits this
          height, the iframe fills it, content scrolls INSIDE). Give it enough
          height to fit the event-picker so nothing scrolls inside the iframe —
          only the page scrolls. */}
      <div
        ref={ref}
        style={{ width: "100%", height: 920 }}
        aria-label="Cal.com booking widget"
      />
      {isProfileMode && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleReset}
            className="inline-block text-xs tracking-[0.2em] text-white/55 uppercase transition-colors hover:text-yellow-300 focus-visible:text-yellow-300 focus-visible:outline-none"
          >
            ← {resetLabel}
          </button>
        </div>
      )}
    </div>
  );
};
