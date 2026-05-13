import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * `<PageTransition>` — terracotta curtain for route changes.
 *
 * Wraps `<Routes>` inside `<App>` and orchestrates the two-phase curtain
 * sweep on every `useLocation().pathname` change:
 *
 *   1. Enter tween — the curtain sweeps `yPercent: 100 → 0` over 0.5 s with
 *      `power3.inOut`.
 *   2. DOM swap — `displayLocation` is updated to the incoming location
 *      (freezing the outgoing `<Routes>` render until the curtain covers
 *      the viewport) and the window scroll is reset to `(0, 0)`.
 *   3. Exit tween — the curtain sweeps `yPercent: 0 → -100` over 0.5 s
 *      with `power3.inOut`, then calls `ScrollTrigger.refresh()` exactly
 *      once so scroll-linked layouts measured before the new DOM painted
 *      pick up their final metrics.
 *
 * The full cycle completes within 1.0 s of the pathname change
 * (Requirement 9.5). When `prefers-reduced-motion: reduce` is active, the
 * curtain is skipped and a 150 ms opacity crossfade is run on the content
 * wrapper instead; `ScrollTrigger.refresh()` still fires exactly once at
 * the end of the reduced cycle.
 *
 * Accessibility invariants:
 *   - The curtain carries `aria-hidden="true"`, `tabindex="-1"`, and the
 *     `inert` attribute so it never receives focus and never traps focus
 *     (Requirement 33.5).
 *   - Focus rings on any underlying element are never mutated by this
 *     component.
 *
 * Re-entrancy:
 *   - `useGSAP`'s scoped context auto-reverts on every re-run, which is
 *     keyed on `location.pathname`. A pathname change mid-cycle therefore
 *     kills the in-flight timeline and the next run sets the curtain back
 *     to `yPercent: 100` before building a new timeline.
 *
 * Feature: e1-editorial-ui-overhaul
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 21.2, 33.5
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const curtainRef = useRef(null);
  const contentRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  // Tracks the route we're transitioning TO so the stall / visibility /
  // bfcache handlers can finish the DOM swap if they fire before the
  // timeline reaches its mid-point `.call()`.
  const pendingLocationRef = useRef(null);

  // React 18 does not pass the HTML `inert` attribute through JSX as a
  // boolean prop (that lands in React 19). Apply it imperatively so the
  // curtain is excluded from the focus order and accessibility tree
  // regardless of React version. Requirement 33.5.
  useEffect(() => {
    const node = curtainRef.current;
    if (!node) return;
    node.setAttribute("inert", "");
  }, []);

  // Snap-release the curtain off-screen. Idempotent so the fallback timer
  // and GSAP's onComplete can both fire without double-refreshing or
  // leaving residue. Exposed outside the useGSAP scope so
  // visibilitychange / pageshow / unmount listeners can call it too.
  const forceRelease = (nextLocation) => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (curtainRef.current) {
      // Kill any live tween so it can't re-apply a covering transform
      // after we snap the curtain off-screen.
      gsap.killTweensOf(curtainRef.current);
      gsap.set(curtainRef.current, {
        yPercent: -100,
        clearProps: "willChange",
      });
    }
    if (contentRef.current) {
      gsap.killTweensOf(contentRef.current);
      gsap.set(contentRef.current, { opacity: 1, clearProps: "willChange" });
    }
    const target = nextLocation || pendingLocationRef.current;
    if (target) {
      pendingLocationRef.current = null;
      setDisplayLocation(target);
    }
  };

  // If the tab is hidden mid-transition (iOS Safari suspends rAF, so the
  // GSAP ticker can stall with the curtain at yPercent: 0), or the page
  // is restored from the bfcache with a frozen transition state, release
  // the curtain immediately so visitors never see a solid orange screen.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        forceRelease();
      }
    };
    const handlePageShow = (event) => {
      // `event.persisted` means the page was restored from the bfcache.
      if (event.persisted) forceRelease();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Final cleanup on unmount: clear the fallback timer and snap the
  // curtain off-screen so a React tree swap mid-transition (HMR,
  // ErrorBoundary reset, etc.) cannot leave the curtain painted.
  useEffect(() => {
    const curtainNode = curtainRef.current;
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (curtainNode) {
        gsap.killTweensOf(curtainNode);
        gsap.set(curtainNode, { yPercent: -100 });
      }
    };
  }, []);

  // Drive the curtain / crossfade timeline. `useGSAP`'s context is re-run
  // whenever `location.pathname` changes — the previous context reverts
  // first (killing any in-flight tween and restoring starting transforms),
  // which satisfies the "kill in-flight tweens on mid-cycle pathname
  // change and restart from yPercent: 100" contract.
  useGSAP(
    () => {
      const curtain = curtainRef.current;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (curtain) {
        gsap.set(curtain, { yPercent: 100 });
      }

      // First render (and any spurious re-run without a pathname change):
      // there is no transition to play yet.
      if (location.pathname === displayLocation.pathname) return;

      const reduced = prefersReducedMotion();
      const nextLocation = location;
      pendingLocationRef.current = nextLocation;

      // Fallback: if the GSAP timeline stalls for any reason (mobile
      // Safari suspending rAF during scroll, a tab briefly hidden, a
      // compositor hiccup), force the curtain off-screen so visitors
      // never see a solid terracotta lockup. 1.2s sits just past the
      // authored 1.0s budget (Requirement 9.5) plus a handful of frames
      // of scheduling-granularity headroom.
      fallbackTimerRef.current = window.setTimeout(() => {
        forceRelease(nextLocation);
        ScrollTrigger.refresh();
      }, 1200);

      if (reduced) {
        // Reduced-motion branch — 150ms opacity crossfade on the content
        // wrapper; the curtain element itself stays off-screen. The DOM
        // swap happens at opacity 0 so the hand-off is imperceptible,
        // which reads as a crossfade between old and new DOM.
        // Requirement 9.7.
        const content = contentRef.current;
        if (!content) return;

        gsap.timeline({
          onComplete: () => {
            if (fallbackTimerRef.current) {
              clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }
            pendingLocationRef.current = null;
            ScrollTrigger.refresh();
          },
        })
          .to(content, { opacity: 0, duration: 0.075, ease: "none" })
          .call(() => {
            setDisplayLocation(nextLocation);
            if (typeof window !== "undefined") {
              window.scrollTo(0, 0);
            }
          })
          .to(content, { opacity: 1, duration: 0.075, ease: "none" });
        return;
      }

      // Full-motion branch — terracotta curtain sweep.
      if (!curtain) return;

      // Always start each cycle from `yPercent: 100` regardless of where
      // the previous (now-killed) tween left the curtain.
      gsap.set(curtain, { yPercent: 100 });

      gsap.timeline({
        onComplete: () => {
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
          pendingLocationRef.current = null;
          // ScrollTrigger.refresh() is called exactly once per completed
          // sweep. Requirements 9.6, 21.2.
          ScrollTrigger.refresh();
        },
      })
        // 1. Enter sweep: curtain enters the viewport from below.
        .to(curtain, {
          yPercent: 0,
          duration: 0.5,
          ease: "power3.inOut",
        })
        // 2. DOM swap behind the fully-covered curtain; reset scroll so
        //    the incoming route starts at the top of the viewport.
        .call(() => {
          setDisplayLocation(nextLocation);
          if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
          }
        })
        // 3. Exit sweep: curtain exits upward, revealing the new DOM.
        .to(curtain, {
          yPercent: -100,
          duration: 0.5,
          ease: "power3.inOut",
        });
    },
    { dependencies: [location.pathname] }
  );

  // React Router v6 resolves `<Routes>` against the `location` prop when
  // one is provided, falling back to the ambient `useLocation()`. By
  // cloning the children and passing `location={displayLocation}`, the
  // outgoing route keeps rendering until the curtain has fully covered
  // the viewport — at which point `setDisplayLocation` swaps the prop
  // and React renders the incoming route under cover.
  const renderedChildren = React.isValidElement(children)
    ? React.cloneElement(children, { location: displayLocation })
    : children;

  return (
    <>
      <div ref={contentRef} style={{ willChange: "opacity" }}>
        {renderedChildren}
      </div>
      <div
        ref={curtainRef}
        aria-hidden="true"
        tabIndex={-1}
        className="bg-e1-primary"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 500,
          transform: "translateY(100%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
    </>
  );
};

export default PageTransition;
