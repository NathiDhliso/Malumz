import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useLocation } from "react-router-dom";

import { gsap, ScrollTrigger } from "./gsap";

/**
 * Per-route `.gs-reveal` batch driver.
 *
 * Selects every `.gs-reveal` element inside `scopeRef` and wires a single
 * `ScrollTrigger.batch(...)` so entries animate to identity once they cross
 * `"top 85%"` of the viewport. Animations always play regardless of OS
 * reduced-motion settings — the site prioritises visual impact for all users.
 *
 * Safety net: a 2-second fallback timer unconditionally reveals every
 * `.gs-reveal` element if ScrollTrigger has not done so yet. This prevents
 * the whole page from staying invisible on mobile Safari where rAF-driven
 * ScrollTrigger can stall during scroll gestures or tab backgrounding.
 *
 * Feature: page-consolidation-and-animations
 * @see Requirements 7.1, 7.2, 7.3
 *
 * @param {React.RefObject<HTMLElement>} scopeRef
 * @returns {void}
 */
export function useRevealBatch(scopeRef) {
  const { pathname } = useLocation();

  useGSAP(
    () => {
      const root = scopeRef.current;
      if (!root) return;

      const els = root.querySelectorAll(".gs-reveal");
      if (!els.length) return;

      gsap.set(els, { opacity: 0, y: 80, scale: 0.95 });
      ScrollTrigger.batch(els, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          });
        },
      });
    },
    { scope: scopeRef, dependencies: [pathname] }
  );

  // Mobile-Safari safety net. ScrollTrigger is rAF-driven and can be
  // parked by iOS during scroll gestures, tab visibility changes, and
  // bfcache restoration — any of which leaves .gs-reveal elements stuck
  // at opacity 0. After 2 seconds, force every reveal element visible
  // so the page cannot be permanently blank.
  useEffect(() => {
    const timer = setTimeout(() => {
      const root = scopeRef.current;
      if (!root) return;
      const hidden = root.querySelectorAll(".gs-reveal");
      if (!hidden.length) return;
      gsap.to(hidden, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        overwrite: "auto",
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname, scopeRef]);
}
