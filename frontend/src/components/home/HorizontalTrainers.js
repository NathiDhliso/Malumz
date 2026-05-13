/**
 * `<HorizontalTrainers>` — HomePage horizontal scroll section.
 *
 * Renders the Six Trainers as horizontally-scrolling cards driven by
 * vertical scroll input. On desktop viewports (≥ 768 px) with
 * `prefers-reduced-motion: no-preference`, the container pins to the
 * viewport and the inner track translates horizontally as the user scrolls.
 * The scroll distance equals the track's scrollable width minus one
 * viewport width, ensuring all cards are reachable.
 *
 * On mobile (< 768 px) or when reduced motion is preferred, the section
 * renders as a standard vertical card stack. Each card carries the
 * `.gs-reveal` class so it participates in the global staggered reveal
 * batch managed by `<RevealRoot>`.
 *
 * Implementation notes:
 *
 * - The motion gate uses `gsap.matchMedia()` with two named conditions
 *   (`isDesktop` and `isMobile`). Only the desktop branch creates the
 *   pin + scrub animation; the mobile branch is inert (cards rely on
 *   `.gs-reveal` for entry animation).
 * - `will-change: transform` is applied to the track element during the
 *   desktop animation via `gsap.set` and removed on cleanup via the
 *   matchMedia revert mechanism.
 * - All ScrollTrigger instances live inside a `useGSAP` hook scoped to
 *   `containerRef`, so they auto-revert on unmount (Requirement 12.1).
 *
 * Feature: page-consolidation-and-animations
 * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 *
 * @param {{ trainers: ReadonlyArray<{ name: string, description: string, icon: import('lucide-react').LucideIcon }> }} props
 * @returns {JSX.Element}
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

// Reference `ScrollTrigger` so bundlers keep the registration side-effects
// performed in `@/lib/gsap`.
void ScrollTrigger;

export const HorizontalTrainers = ({ trainers }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop } = context.conditions;
          console.log("[HorizontalTrainers] matchMedia conditions:", { isDesktop });

          if (isDesktop && trackRef.current && containerRef.current) {
            const trackWidth = trackRef.current.scrollWidth;
            const viewportWidth = window.innerWidth;
            console.log("[HorizontalTrainers] Desktop: pinning. trackWidth:", trackWidth, "viewportWidth:", viewportWidth, "scrollDist:", trackWidth - viewportWidth);

            gsap.set(trackRef.current, { willChange: "transform" });

            gsap.to(trackRef.current, {
              x: -(trackWidth - viewportWidth),
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                pin: true,
                scrub: 1,
                end: () =>
                  "+=" +
                  (trackRef.current.scrollWidth - window.innerWidth),
              },
            });
          } else {
            console.log("[HorizontalTrainers] Mobile: vertical stack fallback");
          }
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      aria-label="The Six Trainers"
    >
      <div
        ref={trackRef}
        className="flex gap-8 px-8 py-16 md:h-screen md:items-center md:flex-nowrap flex-wrap"
      >
        {trainers.map((trainer) => {
          const Icon = trainer.icon;
          return (
            <article
              key={trainer.name}
              className="gs-reveal flex-shrink-0 w-full md:w-[400px] bg-e1-surface border border-e1-text/10 rounded-xl p-8"
            >
              {Icon && (
                <Icon
                  size={32}
                  className="text-e1-primary mb-4"
                  aria-hidden="true"
                />
              )}
              <h3 className="font-display text-2xl font-bold text-e1-text mb-3">
                {trainer.name}
              </h3>
              <p className="text-e1-text-muted leading-relaxed">
                {trainer.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default HorizontalTrainers;
