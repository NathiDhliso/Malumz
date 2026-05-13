import { useEffect } from "react";

import { ScrollTrigger } from "./gsap";
import { ST } from "./motion";

/**
 * React hook that installs a single debounced `window.resize` listener at the
 * scope of the calling component and calls `ScrollTrigger.refresh()` at most
 * once per burst of resize events, no later than `ST.resizeRefreshDebounceMs`
 * (250 ms) after the last resize event settles.
 *
 * This hook exists so every feature-authored pin picks up viewport
 * re-measurement in a single pass — bursts of resize events (e.g. dragging a
 * window edge, entering / exiting full-screen) collapse to one refresh rather
 * than one refresh per frame. Feature-authored pins themselves remain gated
 * by `DESKTOP_PIN_QUERY` / `matchMedia` so they stay inert below 1024 px or
 * under reduced motion (Requirements 22.1, 22.2).
 *
 * Behaviour:
 * - Each `resize` event clears the pending timeout (if any) and schedules a
 *   fresh `setTimeout(ScrollTrigger.refresh, ST.resizeRefreshDebounceMs)`.
 * - On unmount, the listener is removed and any pending timeout cleared so
 *   `ScrollTrigger.refresh()` never fires against a torn-down shell.
 * - SSR-safe: returns early when `window` is undefined.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirement 22.3
 */
export function useResizeRefreshDebounce() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let timerId = null;

    const onResize = () => {
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        timerId = null;
        ScrollTrigger.refresh();
      }, ST.resizeRefreshDebounceMs);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };
  }, []);
}

export default useResizeRefreshDebounce;
