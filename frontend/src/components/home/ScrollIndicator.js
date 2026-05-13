import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";

/**
 * `<ScrollIndicator>` — chevron affordance rendered directly below the
 * HomePage hero `<NotchedSection>` to signal that the page continues below
 * the fold.
 *
 * Behaviour:
 * - On mount, an infinite-yoyo GSAP tween bobs the chevron between `y: 0`
 *   and `y: 10` with `ease: "sine.inOut"`, `yoyo: true`, `repeat: -1`
 *   (Requirement 20.2).
 * - Motion is gated via `gsap.matchMedia()`:
 *   - `(prefers-reduced-motion: no-preference)` — the bob tween is
 *     registered.
 *   - `(prefers-reduced-motion: reduce)` — no tween is created; the
 *     chevron renders statically (Requirement 20.3).
 * - The SVG glyph uses `currentColor` so it picks up the `e1-text-muted`
 *   token from the wrapping `<div>`.
 *
 * Cleanup: the tween is owned by the `useGSAP` context scoped to the
 * chevron ref, so the library auto-reverts it on unmount (Requirement 3.8
 * / 34). The `gsap.matchMedia()` instance is returned from the
 * `useGSAP` body so its handlers are torn down alongside the context.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @returns {JSX.Element}
 * @see Requirements 20.1, 20.2, 20.3
 */
export const ScrollIndicator = () => {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const node = ref.current;
        if (!node) return;
        gsap.to(node, {
          y: 10,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Intentionally empty: Requirement 20.3 asks for a static chevron
        // when reduced motion is requested. The branch is registered so
        // future additions (e.g., a CSS-only emphasis) can hang here.
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [] }
  );

  return (
    <div className="flex justify-center text-e1-text-muted">
      <svg
        ref={ref}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
};

export default ScrollIndicator;
