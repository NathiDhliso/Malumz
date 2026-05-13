import { useGSAP } from "@gsap/react";
import { useLocation } from "react-router-dom";

import { gsap, ScrollTrigger } from "./gsap";
import { ST } from "./motion";

/**
 * Per-route `.gs-reveal` batch driver.
 *
 * Selects every `.gs-reveal` element inside `scopeRef` and wires a single
 * `ScrollTrigger.batch(...)` so entries animate to identity once they cross
 * `ST.revealStart` (`"top 88%"`). The hook is authored inside `useGSAP`,
 * scoped to the caller's ref and re-keyed by `useLocation().pathname`, so
 * every matchMedia context and every ScrollTrigger owned by this hook is
 * automatically reverted on route change - there is no hand-rolled cleanup.
 *
 * Motion policy is expressed as a `gsap.matchMedia()` split:
 *
 * - `(prefers-reduced-motion: no-preference)` - batch `onEnter` tweens to
 *   `{ opacity: 1, y: 0, scale: 1 }` with `duration: 0.8`, `stagger: 0.1`,
 *   and `ease: "power3.out"`, matching the base `.gs-reveal` utility class
 *   authored in `src/index.css` (`opacity:0; translate:0 50px; scale:0.96;`).
 * - `(prefers-reduced-motion: reduce)` - same selector and batch start,
 *   but the `onEnter` tween is an opacity-only 150 ms fade with `y` and
 *   `scale` held at identity. This matches the reduced-motion row of the
 *   feature's motion gating matrix.
 *
 * Both branches pass `once: true` so each element reveals exactly once per
 * route lifetime, and both read `start` from `ST.revealStart` so the
 * trigger position stays consistent with other editorial accents.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 *
 * @param {React.RefObject<HTMLElement>} scopeRef
 *   Ref to the root element whose subtree is searched for `.gs-reveal`
 *   entries. Passed as the `scope` to `useGSAP` so every tween, matchMedia
 *   context, and ScrollTrigger created here is tied to that node's mount
 *   lifetime.
 * @returns {void}
 */
export function useRevealBatch(scopeRef) {
  const { pathname } = useLocation();

  useGSAP(
    () => {
      const root = scopeRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const els = root.querySelectorAll(".gs-reveal");
        if (!els.length) return;
        ScrollTrigger.batch(els, {
          start: ST.revealStart,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
            }),
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const els = root.querySelectorAll(".gs-reveal");
        if (!els.length) return;
        ScrollTrigger.batch(els, {
          start: ST.revealStart,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              duration: 0.15,
            }),
        });
      });
    },
    { scope: scopeRef, dependencies: [pathname] }
  );
}
