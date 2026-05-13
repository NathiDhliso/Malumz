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
      console.log("[useRevealBatch] found", els.length, ".gs-reveal elements");
      if (!els.length) return;

      gsap.set(els, { opacity: 0, y: 120, scale: 0.85 });
      ScrollTrigger.batch(els, {
        start: "top 85%",
        once: true,
        onEnter: (batch) => {
          console.log("[useRevealBatch] onEnter fired for", batch.length, "elements");
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.15,
            ease: "power3.out",
          });
        },
      });
    },
    { scope: scopeRef, dependencies: [pathname] }
  );
}
