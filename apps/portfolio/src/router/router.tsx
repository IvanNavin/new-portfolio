import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

interface RouterValue {
  /** Current pathname, kept in sync with the URL. */
  path: string;
  /** Push a new path (updates the URL via History API, no remount). */
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

/**
 * Custom hook-based router — the whole thing.
 *
 * No React Router / TanStack / Next: those unmount the active page on
 * navigation, which kills the cube transition. We only flip `path`; every
 * page stays mounted as a face of the cube. The URL is the single source of
 * truth, synced through `history.pushState` + `popstate`.
 */
export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) return;
    window.history.pushState(null, "", to);
    setPath(to);
  }, []);

  return <RouterContext value={{ path, navigate }}>{children}</RouterContext>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within a <RouterProvider>");
  return ctx;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** A `to` the browser must handle itself: an absolute URL (http:, mailto:,
 *  tel:, …) or a protocol-relative `//host` — never an in-app SPA route. */
const isExternalHref = (to: string): boolean =>
  /^[a-z][a-z0-9+.-]*:/i.test(to) || to.startsWith("//");

/** Anchor that navigates through the custom router instead of reloading. */
export function Link({ to, onClick, target, download, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      target={target}
      download={download}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          // Let the browser handle new-tab / download / external targets —
          // routing these through the SPA would swallow the navigation.
          (target != null && target !== "_self") ||
          download != null ||
          isExternalHref(to)
        ) {
          return;
        }
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    />
  );
}
