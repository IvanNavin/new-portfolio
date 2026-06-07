"use client";

import {
  dismissItem,
  readDismissed,
  readSaved,
  toggleSaved,
} from "@lib/storage";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

type Props = {
  url: string;
  children: ReactNode;
};

/**
 * Mobile swipe affordance wrapping a NewsCard.
 *
 * Right swipe → toggle Save. Left swipe → Hide (with a confirm flash
 * since this is harder to undo on a phone).
 *
 * Visual feedback: the card translates with the finger and a colored
 * action label fades in behind it as the user crosses the commit
 * threshold. Below the threshold the card snaps back; above it the
 * action fires.
 *
 * Desktop / mouse users get nothing extra (handlers ignore mouse by
 * default). The card link still navigates on tap.
 */

const COMMIT = 90; // px past which we commit the action

async function syncSaved(url: string, saved: boolean): Promise<void> {
  try {
    await fetch("/api/saved", {
      method: saved ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* ignore */
  }
}
async function syncDismissed(url: string): Promise<void> {
  try {
    await fetch("/api/dismissed", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* ignore */
  }
}

export function SwipeableCard({ url, children }: Props) {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);
  const [dx, setDx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync hidden state from localStorage if user previously dismissed
  // this URL on another device.
  useEffect(() => {
    if (readDismissed().has(url)) setHidden(true);
  }, [url]);

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      // Lock vertical scroll out only when horizontal is clearly winning,
      // otherwise the page becomes hard to scroll on tall cards.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5) {
        setDx(e.deltaX);
      }
    },
    onSwiped: (e) => {
      const x = e.deltaX;
      setDx(0);
      if (x > COMMIT) {
        // Right swipe — save toggle.
        const willSave = toggleSaved(url);
        if (isAuthed) void syncSaved(url, willSave);
        // Quick visual ping
        flashCard("saved");
      } else if (x < -COMMIT) {
        // Left swipe — dismiss with fade.
        dismissItem(url);
        if (isAuthed) void syncDismissed(url);
        const el = containerRef.current;
        if (el) {
          el.style.transition = "opacity 180ms ease, transform 180ms ease";
          el.style.transform = "translateX(-100%)";
          el.style.opacity = "0";
          setTimeout(() => setHidden(true), 200);
        } else {
          setHidden(true);
        }
      }
    },
    trackMouse: false,
    delta: 18,
    preventScrollOnSwipe: true,
  });

  const flashCard = (kind: "saved") => {
    const el = containerRef.current;
    if (!el) return;
    el.dataset.flash = kind;
    setTimeout(() => {
      if (el.dataset.flash === kind) delete el.dataset.flash;
    }, 700);
  };

  if (hidden) return null;

  const isSaved = typeof window !== "undefined" ? readSaved().has(url) : false;

  // react-swipeable returns its own ref callback. Merge it with our
  // local containerRef so both the swipe library and our flash/fade
  // helpers can find the same DOM node.
  const setRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    swipeHandlers.ref(el);
  };
  const { ref: _swipeRef, ...handlers } = swipeHandlers;
  void _swipeRef;

  return (
    <div
      {...handlers}
      ref={setRef}
      className="relative touch-pan-y data-[flash=saved]:animate-saved-flash"
      style={{
        transform: `translateX(${dx}px)`,
        transition: dx === 0 ? "transform 180ms ease" : "none",
      }}
    >
      {/* Save hint — visible when swiping right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-sm font-semibold text-[var(--c-save-fg)]"
        style={{ opacity: Math.min(1, Math.max(0, dx) / COMMIT) }}
      >
        ★ {isSaved ? "Unsave" : "Save"}
      </div>
      {/* Hide hint — visible when swiping left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6 text-sm font-semibold text-[var(--c-danger-fg)]"
        style={{ opacity: Math.min(1, Math.max(0, -dx) / COMMIT) }}
      >
        × Hide
      </div>
      {children}
    </div>
  );
}
