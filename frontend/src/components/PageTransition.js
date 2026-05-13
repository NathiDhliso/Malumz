import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * `<PageTransition>` — lightweight, CSS-only route change transition.
 *
 * Previous versions used a full-viewport GSAP curtain that animated
 * `yPercent: 100 → 0 → -100` around each route change. That approach
 * is fundamentally hostile to mobile Safari: iOS suspends
 * `requestAnimationFrame` during scroll, during address-bar chrome
 * transitions, during tab backgrounding, and during bfcache
 * restoration, all of which could leave the terracotta curtain parked
 * at `yPercent: 0` covering the whole viewport. No failsafe timer
 * could reliably rescue every failure mode.
 *
 * This implementation is rAF-independent and cannot stall:
 *
 *   1. The outgoing route renders for one animation frame at
 *      `opacity: 0` with a pure CSS `transition: opacity 150ms`.
 *   2. On the next paint, React commits the new route and we
 *      restore `opacity: 1`, producing a 150ms crossfade between
 *      old and new DOM.
 *   3. Scroll resets to `(0, 0)` synchronously at the hand-off so
 *      the incoming route always starts at the top.
 *   4. `ScrollTrigger.refresh()` fires once per route change via the
 *      same CSS transition-end event.
 *
 * No full-viewport overlay is ever rendered — if this component
 * fails in any way, the worst case is an instant route swap, not a
 * locked orange screen.
 *
 * Accessibility:
 *   - Honours `prefers-reduced-motion` by short-circuiting the
 *     opacity transition when the user requests it.
 *
 * Feature: mobile-stability-2026-05
 */
export const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [opacity, setOpacity] = useState(1);
  const contentRef = useRef(null);
  const pendingLocationRef = useRef(null);

  // When the pathname changes, fade the current content to 0, swap
  // the rendered location once React has committed the fade-out,
  // then fade back to 1. All three steps are driven by CSS
  // transitions, so nothing here depends on GSAP / rAF staying alive.
  useLayoutEffect(() => {
    if (location.pathname === displayLocation.pathname) return undefined;

    pendingLocationRef.current = location;

    // Honour reduced-motion: instant swap, no opacity dance.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayLocation(location);
      if (typeof window !== "undefined") window.scrollTo(0, 0);
      pendingLocationRef.current = null;
      if (typeof ScrollTrigger?.refresh === "function") ScrollTrigger.refresh();
      return undefined;
    }

    // 1. Fade the outgoing content out.
    setOpacity(0);

    // 2. After the fade-out completes (or 200ms max — strictly a
    //    safety cap against a missed transitionend event), commit
    //    the DOM swap and fade back in.
    const node = contentRef.current;
    let cleanupFired = false;
    let fallbackTimer = 0;

    const commitSwap = () => {
      if (cleanupFired) return;
      cleanupFired = true;
      clearTimeout(fallbackTimer);
      node?.removeEventListener("transitionend", handleTransitionEnd);

      const target = pendingLocationRef.current || location;
      setDisplayLocation(target);
      pendingLocationRef.current = null;

      if (typeof window !== "undefined") window.scrollTo(0, 0);

      // Fade back in on the very next frame so React has committed
      // the new route's DOM before the transition runs.
      requestAnimationFrame(() => {
        setOpacity(1);
        if (typeof ScrollTrigger?.refresh === "function") {
          ScrollTrigger.refresh();
        }
      });
    };

    const handleTransitionEnd = (event) => {
      if (event.target !== node) return;
      if (event.propertyName !== "opacity") return;
      commitSwap();
    };

    node?.addEventListener("transitionend", handleTransitionEnd);
    // Safety cap — even if transitionend never fires (e.g., tab
    // backgrounded mid-fade), force the swap at 200ms so the page
    // never freezes behind a 0-opacity layer.
    fallbackTimer = window.setTimeout(commitSwap, 200);

    return () => {
      cleanupFired = true;
      clearTimeout(fallbackTimer);
      node?.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [location, displayLocation.pathname]);

  // Guarantee the content is visible on mount and on every re-render
  // that doesn't kick off a transition, so nothing can leave the page
  // invisible after hydration or HMR.
  useEffect(() => {
    if (location.pathname === displayLocation.pathname && opacity !== 1) {
      setOpacity(1);
    }
  }, [location.pathname, displayLocation.pathname, opacity]);

  // Pass the outgoing location to the children so React Router
  // resolves `<Routes>` against the frozen location during fade-out,
  // then swaps to the new location once `displayLocation` updates.
  const renderedChildren = React.isValidElement(children)
    ? React.cloneElement(children, { location: displayLocation })
    : children;

  return (
    <div
      ref={contentRef}
      style={{
        opacity,
        transition: "opacity 150ms ease-out",
      }}
    >
      {renderedChildren}
    </div>
  );
};

export default PageTransition;
