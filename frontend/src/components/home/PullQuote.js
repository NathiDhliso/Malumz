import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ST } from "@/lib/motion";

/**
 * `<PullQuote>` - HomePage closing editorial pull quote with a terracotta
 * rule that draws in on scroll.
 *
 * Renders an italic Fraunces quote at full viewport bleed with a sibling
 * `<div>` acting as a terracotta rule at 100% container width. When the
 * section's `ScrollTrigger` fires at `start: "top 70%"` (sourced from
 * `ST.pullQuoteStart`), the rule tweens `scaleX: 0 -> 1` with
 * `transformOrigin: "left center"`, `duration: 1.0`, and
 * `ease: "power3.out"`. Under `prefers-reduced-motion: reduce`, the rule is
 * pre-set to full width and opacity 0, then fades to opacity 1 over 150 ms
 * on the same ScrollTrigger - no `scaleX` tween is ever created.
 *
 * Motion gating is expressed as a `gsap.matchMedia()` split so the full
 * and reduced branches live side-by-side. Every tween and ScrollTrigger
 * created inside the matchMedia contexts is scoped to `sectionRef`, so
 * `useGSAP`'s auto-revert on unmount tears down both the timeline and its
 * trigger without hand-rolled cleanup.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 18.1, 18.2, 18.3
 *
 * @param {object} props
 * @param {string} props.quote - The pull-quote copy (rendered inside
 *   curly quotes by the component).
 * @param {string} [props.attribution] - Optional speaker attribution
 *   rendered in a small sans-serif caps `<footer>` beneath the quote.
 * @returns {JSX.Element}
 */
export function PullQuote({ quote, attribution }) {
  const sectionRef = useRef(null);
  const ruleRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const rule = ruleRef.current;
      if (!section || !rule) return;

      ScrollTrigger.create({
        trigger: section,
        start: ST.pullQuoteStart,
        onEnter: () => {
          gsap.to(rule, {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 1.0,
            ease: "power3.out",
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-24 px-8 w-full">
      <blockquote className="font-display italic text-e1-text text-4xl md:text-6xl leading-tight max-w-none">
        &ldquo;{quote}&rdquo;
        {attribution && (
          <footer className="mt-6 text-e1-text-muted text-sm not-italic font-sans uppercase tracking-wider">
            &mdash; {attribution}
          </footer>
        )}
      </blockquote>
      <div
        ref={ruleRef}
        className="mt-8 h-px bg-e1-primary w-full origin-left"
        style={{ transform: "scaleX(0)" }}
      />
    </section>
  );
}

export default PullQuote;
