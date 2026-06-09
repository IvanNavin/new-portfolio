'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Bootstraps Cal.com's `window.Cal` queue. Adapted from the official
 * snippet at <https://cal.com/docs/core-features/embed> — we create a
 * stub function that buffers calls in a queue, then inject the real
 * `embed.js` which drains the queue on load. Subsequent renders re-
 * use the same stub instead of re-injecting the script.
 *
 * `scriptSrc` parameterizes the loader path so we can point at the
 * EU instance (`app.cal.eu`) for accounts that live there — the
 * cal.com URL would 404 for them.
 */
function ensureCal(scriptSrc: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (typeof w.Cal === 'function' && w.Cal.loaded) return w.Cal;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = (target: any, args: unknown[]) => target.q.push(args);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Cal: any =
    w.Cal ||
    function (...args: unknown[]) {
      if (!Cal.loaded) {
        Cal.ns = {};
        Cal.q = Cal.q || [];
        const s = document.createElement('script');
        s.src = scriptSrc;
        s.async = true;
        document.head.appendChild(s);
        Cal.loaded = true;
      }
      if (args[0] === 'init') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api: any = (...a: unknown[]) => push(api, a);
        const ns = args[1];
        api.q = api.q || [];
        if (typeof ns === 'string') {
          Cal.ns[ns] = Cal.ns[ns] || api;
          push(Cal.ns[ns], args);
          push(Cal, ['initNamespace', ns]);
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
  /**
   * Cal.com booking handle. Two forms:
   *   • `<username>` (e.g. `ivan-holovko`) — renders profile with all
   *     active event types listed; visitor picks one then books.
   *   • `<username>/<event-slug>` — jumps straight to the calendar.
   */
  calLink: string;
  /**
   * Cal.com instance origin — `https://cal.com` for US, `https://cal.eu`
   * for EU, or a self-host URL. Embed.js routes its iframe to this
   * origin to talk to the right backend.
   */
  origin: string;
  /** URL of the Cal embed loader. Pair to the same instance as `origin`. */
  scriptSrc: string;
  /** Localized helper label shown above the widget. */
  caption: string;
  /**
   * Localized label for the "reset to event picker" button. Only
   * rendered when `calLink` is a profile URL (no event slug) — once
   * the visitor drills into a specific event the iframe loses its
   * own back navigation, so we re-render the embed to the picker.
   */
  resetLabel: string;
  /**
   * Brand accent color (hex without `#`). Threaded into Cal's
   * `cssVarsPerTheme.dark['cal-brand']` so CTAs inside the booking
   * widget pick up the site's gold accent instead of Cal's blue.
   */
  brandColor?: string;
};

/**
 * Cal.com inline booking widget.
 *
 * Two reasons we picked Cal.com over Calendly:
 *   • Free plan covers unlimited event types + lets us strip the
 *     "Powered by" branding.
 *   • Open-source escape hatch — if Cal.com ever rugs the free tier
 *     we can self-host with the same `cal.com/<user>/<slug>` API
 *     surface.
 *
 * The widget is rendered into a target `<div>` whose ref we hand to
 * Cal.ns[ns]('inline'). Cal's embed.js injects an iframe inside.
 * On dark themes we override `cal-brand` so confirm/select buttons
 * inside the iframe match the site's gold accent.
 *
 * Reset behavior: when `calLink` is just a username (profile mode),
 * the embed first renders an event-type picker. After a visitor
 * clicks into a specific event the iframe navigates internally to
 * that event's calendar — and Cal.com's inline widget exposes no
 * back-to-picker control. To work around it we add an external
 * "Choose a different duration" link that re-fires Cal's inline()
 * call on the same ref, which forces Cal to re-render from the
 * profile root. Only shown in profile mode (no `/` in calLink) since
 * direct-event embeds have nothing to go back to.
 */
export const BookingEmbed = ({
  calLink,
  origin,
  scriptSrc,
  caption,
  resetLabel,
  brandColor = 'fde047',
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  // Bump to force re-init. Used by the "Choose a different duration"
  // button so the visitor can drill into another event after picking
  // one — without it Cal's inline widget gets stuck on the calendar
  // view they last opened.
  const [resetTick, setResetTick] = useState(0);

  // Namespace = the event-type slug, or the username if we're in
  // profile mode. Cal queues per-namespace.
  const namespace = calLink.split('/').pop() || 'default';

  // Profile mode = no event slug. Only then does "back to picker"
  // make sense as a UI affordance.
  const isProfileMode = !calLink.includes('/');

  useEffect(() => {
    if (!ref.current) return;
    // Wipe any iframe Cal injected previously — calling inline()
    // again on a populated container would otherwise stack a second
    // iframe on top. Empty-then-reinit gives us a clean reset.
    ref.current.innerHTML = '';
    const Cal = ensureCal(scriptSrc);
    Cal('init', namespace, { origin });
    Cal.ns[namespace]('inline', {
      elementOrSelector: ref.current,
      calLink,
      config: { layout: 'month_view' },
    });
    Cal.ns[namespace]('ui', {
      theme: 'dark',
      cssVarsPerTheme: {
        dark: { 'cal-brand': `#${brandColor}` },
      },
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
  }, [calLink, namespace, origin, scriptSrc, brandColor, resetTick]);

  const handleReset = useCallback(() => {
    setResetTick((t) => t + 1);
  }, []);

  return (
    <div className='w-full'>
      <p className='mb-4 text-center text-xs uppercase tracking-[0.25em] text-white/55'>
        {caption}
      </p>
      {/* No wrapper border/background — Cal's own widget renders its
          own card inside the iframe, so an outer frame reads as a
          double border. Let the embed float over the cosmic bg. */}
      <div
        ref={ref}
        // 700px reserves enough vertical room that the iframe doesn't
        // bounce the layout when it mounts. Cal's widget is
        // responsive inside.
        style={{ width: '100%', height: 700 }}
        aria-label='Cal.com booking widget'
      />
      {isProfileMode && (
        <div className='mt-3 text-center'>
          <button
            type='button'
            onClick={handleReset}
            className='inline-block text-xs uppercase tracking-[0.2em] text-white/55 transition-colors hover:text-yellow-300 focus-visible:text-yellow-300 focus-visible:outline-none'
          >
            ← {resetLabel}
          </button>
        </div>
      )}
    </div>
  );
};
