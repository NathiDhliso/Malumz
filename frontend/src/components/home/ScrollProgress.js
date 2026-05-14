import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * `<ScrollProgress>` — fixed top progress bar.
 *
 * A 2-pixel terracotta bar pinned to the top of the viewport that fills
 * left-to-right as the user scrolls the page. Drives a `scaleX` tween
 * via ScrollTrigger `scrub: true` so the bar tracks the scroll position
 * exactly (no jank, no rAF staleness).
 *
 * Re-keys on `pathname` so the bar resets cleanly on route change.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return undefined;

      gsap.set(bar, { scaleX: 0, transformOrigin: "0% 50%" });
      const tween = gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });

      return () => {
        if (tween && tween.scrollTrigger) tween.scrollTrigger.kill();
        tween && tween.kill();
      };
    },
    { dependencies: [pathname] }
  );

  // Safety net: ensure the bar gets a refresh after fonts/images load
  // because ScrollTrigger needs accurate document height.
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-e1-primary/10 pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-e1-primary will-change-transform"
      />
    </div>
  );
}
