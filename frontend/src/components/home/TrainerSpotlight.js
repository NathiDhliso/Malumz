/**
 * `<TrainerSpotlight>` — HomePage pinned six-trainer spotlight.
 *
 * Renders six stacked trainer cards. On desktop viewports at or above the
 * shared 1024 px pin breakpoint AND with `prefers-reduced-motion` reporting
 * `no-preference`, the section pins for 300 vh of scroll and a
 * `scrub: 1` timeline cycles focus through the cards one at a time: the
 * active card sits at `{ opacity: 1, scale: 1 }` with a terracotta left
 * border whose `scaleY` tweens 0 → 1, while the inactive cards sit at
 * `{ opacity: 0.3, scale: 0.95 }`. Outside that window (reduced motion or
 * `< 1024 px`), the pin is inert and each card is a sequential `.gs-reveal`
 * entry in document order, fading in through the global `<RevealRoot>`
 * batch as it scrolls into view.
 *
 * Implementation notes:
 *
 * - The motion gate is expressed as a single `gsap.matchMedia()` branch
 *   keyed on `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"`.
 *   When the query stops matching (e.g., the user resizes below 1024 px or
 *   toggles reduced motion mid-session), `gsap.matchMedia`'s library-owned
 *   cleanup reverts every `gsap.set`, tween, and ScrollTrigger created by
 *   the branch, handing the cards back to the `.gs-reveal` pipeline.
 * - The `.gs-reveal` class is authored unconditionally on every card. In
 *   the desktop branch, `gsap.set(cards, { opacity: 0.3, scale: 0.95 })`
 *   overrides the pre-reveal CSS state so the spotlight starts from the
 *   inactive baseline rather than the batch's hidden baseline.
 * - The scrub timeline gives each card a one-second beat: at time `i` the
 *   card activates and its border draws in, and at the same moment the
 *   previous card (if any) returns to the inactive baseline. This keeps
 *   exactly one card fully active at any playhead position, which is the
 *   invariant asserted by Property 16 (`Trainer Spotlight active-card
 *   state`).
 * - The pin config uses `ST.trainerSpotlightScrollDuration` (`"+=300%"`)
 *   and `ST.trainerSpotlightScrub` (`1`) from `@/lib/motion` so the
 *   breakpoint, duration, and scrub values live in a single source shared
 *   with the resize-refresh listener and the other editorial accents.
 *
 * Cleanup: every tween, `gsap.set`, and ScrollTrigger created above lives
 * inside the `useGSAP` context scoped to `sectionRef`, so the library
 * auto-reverts them on unmount (Requirement 3.8 / 34).
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 4.4, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 22.1, 22.2
 *
 * @param {{ trainers?: ReadonlyArray<{ name: string, description: string }> }} props
 * @returns {JSX.Element}
 */
import { createRef, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ST } from "@/lib/motion";

// Reference `ScrollTrigger` so bundlers keep the registration side-effects
// performed in `@/lib/gsap`. The pin is configured through the `scrollTrigger`
// property on the timeline, not via a direct `ScrollTrigger(...)` call, so
// the import would otherwise appear unused.
void ScrollTrigger;

/**
 * Default trainer list matching the Six Trainers narrative shared with
 * `<TrainerConnector>` and the HomePage copy. Frozen so consumers cannot
 * mutate the shared default array.
 */
const DEFAULT_TRAINERS = Object.freeze([
  {
    name: "Family Trainer",
    description:
      "Love, protection, provision — stability before survival.",
  },
  {
    name: "Masculine Trainer",
    description: "Strength as service, never dominance.",
  },
  {
    name: "Community Trainer",
    description:
      "Find your pack. Build accountability. Stop bleeding alone.",
  },
  {
    name: "Economic Trainer",
    description: "From survival mode to legacy mode.",
  },
  {
    name: "Academic Trainer",
    description:
      "You were never stupid — you were just never trained right.",
  },
  {
    name: "Spiritual Trainer",
    description: "The moral anchor when everything else collapses.",
  },
]);

export const TrainerSpotlight = ({ trainers = DEFAULT_TRAINERS }) => {
  const sectionRef = useRef(null);

  // Stable ref arrays sized to the current trainer list. `createRef()`
  // objects expose `.current` in the shape `useGSAP` expects, so we can
  // gather them via `refs.map(r => r.current)` inside the effect without
  // worrying about callback-ref timing.
  const cardRefs = useMemo(
    () => Array.from({ length: trainers.length }, () => createRef()),
    [trainers.length]
  );
  const borderRefs = useMemo(
    () => Array.from({ length: trainers.length }, () => createRef()),
    [trainers.length]
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = cardRefs.map((r) => r.current).filter(Boolean);
          const borders = borderRefs.map((r) => r.current).filter(Boolean);
          if (cards.length === 0) return;

          // Seed baseline: every card inactive, every border collapsed.
          // This overrides the `.gs-reveal` pre-reveal CSS state so the
          // spotlight begins from the inactive baseline rather than the
          // Reveal Batch's hidden baseline.
          gsap.set(cards, { opacity: 0.3, scale: 0.95, y: 0 });
          gsap.set(borders, { scaleY: 0, transformOrigin: "top center" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: ST.trainerSpotlightScrollDuration,
              pin: true,
              scrub: ST.trainerSpotlightScrub,
            },
          });

          // Each trainer owns a one-second beat on the timeline. At the
          // start of its beat the card activates and the border draws in;
          // at the same moment the previous card (if any) returns to the
          // inactive baseline. This keeps exactly one card fully active
          // at any playhead position (Property 16).
          cards.forEach((card, i) => {
            const t = i;
            tl.to(
              card,
              { opacity: 1, scale: 1, duration: 0.25 },
              t
            ).to(
              borders[i],
              { scaleY: 1, duration: 0.25 },
              t
            );
            if (i > 0) {
              tl.to(
                cards[i - 1],
                { opacity: 0.3, scale: 0.95, duration: 0.25 },
                t
              ).to(
                borders[i - 1],
                { scaleY: 0, duration: 0.25 },
                t
              );
            }
          });
        }
      );
    },
    { scope: sectionRef, dependencies: [trainers] }
  );

  return (
    <section ref={sectionRef} className="relative w-full py-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col gap-8">
        {trainers.map((trainer, i) => (
          <article
            key={`${trainer.name}-${i}`}
            ref={cardRefs[i]}
            data-spotlight-card
            className="gs-reveal relative px-8 py-12 border-l border-e1-text-muted"
          >
            <span
              ref={borderRefs[i]}
              data-spotlight-border
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-px bg-e1-primary origin-top"
              style={{ transform: "scaleY(0)" }}
            />
            <h3 className="font-display text-e1-text text-3xl">
              {trainer.name}
            </h3>
            <p className="text-e1-text-muted mt-2">{trainer.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TrainerSpotlight;
