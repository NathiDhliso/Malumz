import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { ScrollTrigger } from "./gsap";

/**
 * React hook that calls `ScrollTrigger.refresh()` exactly once after every
 * route change, deferred until after the new route has mounted and painted.
 *
 * This hook is a safety-net companion to the refresh emitted by
 * `<PageTransition>` on its curtain exit sweep: even when the curtain is
 * skipped (reduced-motion branch, programmatic navigation, or any future
 * transition variant), every `useLocation().pathname` change still produces
 * exactly one `ScrollTrigger.refresh()` call so scroll-driven animations
 * re-measure against the new DOM.
 *
 * Behaviour:
 * - Runs a `useEffect` keyed on `useLocation().pathname`.
 * - Defers the refresh call to the next `requestAnimationFrame` (falling
 *   back to `setTimeout(..., 0)` when rAF is unavailable) so the new route
 *   has been committed to the DOM and painted before ScrollTrigger measures.
 * - SSR-safe: guards every `window` reference so the hook is a no-op when
 *   executed outside a browser environment.
 * - Cancels any pending frame on unmount or on a subsequent pathname change
 *   so the refresh is never invoked against a torn-down route.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 21.1, 21.2
 */
export function useRouteScrollRefresh() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const raf = window.requestAnimationFrame;
    const caf = window.cancelAnimationFrame;
    let rafId = 0;
    let timeoutId = 0;

    if (typeof raf === "function") {
      rafId = raf(() => {
        ScrollTrigger.refresh();
      });
    } else {
      timeoutId = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 0);
    }

    return () => {
      if (rafId && typeof caf === "function") {
        caf(rafId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname]);
}

export default useRouteScrollRefresh;
