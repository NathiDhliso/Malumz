import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smooth-scroll to the element matching `location.hash` whenever the hash
 * (or pathname) changes. When the hash is empty, no-ops so other route-
 * change scroll behaviour (e.g., scroll-to-top in `<PageTransition>`) is
 * preserved.
 *
 * Mounted once at the app shell so cross-route anchor navigation works
 * uniformly: visiting `/#join` from any deep-dive page routes to home,
 * waits for the new DOM to commit, then scrolls to `#join`.
 */
export function useScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const id = hash.replace(/^#/, "");
    if (!id) return undefined;

    let cancelled = false;

    // Wait two animation frames so the new route's DOM has committed
    // and any opening-paint animations have settled before measuring.
    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(() => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (!el) return;
        const top =
          el.getBoundingClientRect().top + window.pageYOffset - 80; // 80px nav offset
        window.scrollTo({ top, behavior: "smooth" });
      });
      // Fallback in case raf2 never fires (rare; primarily for jsdom).
      window.setTimeout(() => window.cancelAnimationFrame(raf2), 1000);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf1);
    };
  }, [pathname, hash]);
}

export default useScrollToHash;
