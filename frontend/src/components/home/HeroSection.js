import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";

import NotchedSection from "@/components/NotchedSection";
import MagneticButton from "@/components/MagneticButton";
import assets, {
  HERO_AMBIENT_VIDEO,
  HERO_CARD_IMAGE,
  HERO_POSTER_IMAGE,
} from "@/lib/assets";
import { prefersReducedMotion, isSaveData } from "@/lib/motion";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * `<HeroSection>` — the HomePage hero atmosphere.
 *
 * Task 4.2 established the base ambient video + overlay + poster fallback
 * inside a `<NotchedSection tone="charcoal">`. Task 4.3 filled the
 * foreground `relative z-10` slot with three orchestrated elements: a
 * `SplitText` headline, a subtitle, and a `<MagneticButton>`-wrapped CTA
 * — all driven from a single master timeline. Task 4.4 adds the hero
 * Flip card on the same master timeline.
 *
 * Master timeline (motion branch):
 *
 *   - The full headline text is wrapped by `new SplitText(el, { type: "chars" })`.
 *     The timeline tweens every character `from`
 *     `{ opacity: 0, yPercent: 110, rotationX: -60 }` toward identity with
 *     `stagger: 0.6`, `ease: "expo.out"`, `duration: 1` (Requirement 13.2,
 *     13.3).
 *   - The subtitle joins at `"-=0.3"` relative to the headline and the CTA
 *     joins at `"-=0.3"` relative to the subtitle (Requirements 13.5, 13.6).
 *   - The Flip card starts at `{ rotationY: 180, scale: 0.5, opacity: 0 }`
 *     via `gsap.set` applied in the scoped `useGSAP` context (Requirement
 *     14.1). The master timeline tweens the card to
 *     `{ rotationY: 0, scale: 1, opacity: 1 }` with `duration: 1.2`,
 *     `ease: "back.out(1.4)"` (Requirement 14.2), timed at position `0`
 *     so it unfolds alongside the headline reveal. On tween complete,
 *     the idle float tween `{ y: -12, duration: 2.4, ease: "sine.inOut",
 *     yoyo: true, repeat: -1 }` starts (Requirement 14.3) and is
 *     captured in the scoped context so it is killed automatically on
 *     unmount. The card `<img>` references `HERO_CARD_IMAGE` with
 *     explicit `width`, `height`, `fetchpriority="high"`, and
 *     `alt={assets.HERO_CARD_IMAGE.altPlaceholder}` (Requirements 14.4,
 *     14.5, 32.4). The card's `transform-style: preserve-3d` and parent
 *     `transformPerspective: 600` ensure the `rotationY` tween renders
 *     with legitimate 3D depth.
 *
 * Accessibility:
 *
 *   - The `<h1>` parent carries `aria-label={headline}` so assistive tech
 *     reads the original string even after SplitText fragments the DOM
 *     (Requirement 13.7).
 *   - Every `SplitText` character span is marked `aria-hidden="true"` so
 *     the split glyphs don't duplicate the headline to assistive tech
 *     (Requirement 13.8).
 *   - `transformPerspective: 600` is applied to the `<h1>` via `gsap.set`
 *     inside the scoped `useGSAP` context so the per-character `rotationX`
 *     tween renders with the 3D depth the spec calls for, and so the
 *     property is reverted automatically on unmount (Requirement 13.4).
 *   - The Flip card `<img>` supplies meaningful `alt` text sourced from
 *     the Assets module so screen readers announce the portrait rather
 *     than a filename.
 *
 * Reduced-motion branch (opacity-only, 150 ms per tween):
 *
 *   - No `SplitText` is constructed; the headline remains a plain string
 *     and is fade-in via a single opacity-only tween.
 *   - Subtitle and CTA receive matching 150 ms opacity fades.
 *   - The Flip card receives a 150 ms opacity fade only — no `rotationY`,
 *     `scale`, or idle float (Requirement 14 reduced branch). The card
 *     rests at identity `{ rotationY: 0, scale: 1, opacity: 1, y: 0 }`.
 *
 * Fallback policy:
 *
 *   - `new SplitText(...)` is wrapped in a try/catch so a missing plugin
 *     bundle leaves the plain headline string in place at full opacity
 *     (per design §"SplitText failure").
 *
 * Cleanup: every tween, `gsap.matchMedia` branch, the idle-float tween,
 * and the `SplitText` instance itself are owned by the `useGSAP` context
 * scoped to `foregroundRef`, so the library auto-reverts them on unmount
 * (Requirement 3.8 / 34). The `split.revert()` cleanup is returned from
 * the matchMedia handler so mid-session motion-preference flips restore
 * the plain headline markup before the reduced-motion branch runs.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @param {object} props
 * @param {string} [props.headline="Rebuilding what apartheid destroyed."]
 *   The hero headline copy; mirrored into `aria-label` verbatim.
 * @param {string} [props.subtitle="Through the Six Trainers framework."]
 *   Secondary line that enters at `"-=0.3"` relative to the headline.
 * @param {string} [props.ctaLabel="Book a Session"] - CTA button copy.
 * @param {string} [props.ctaHref="/book"] - CTA destination; navigated
 *   via `useNavigate` so the route change participates in the
 *   `<PageTransition>` curtain sweep.
 * @returns {JSX.Element}
 * @see Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8,
 *   14.1, 14.2, 14.3, 14.4, 14.5,
 *   15.1, 15.2, 15.3, 15.4, 15.5, 15.6,
 *   32.4
 */
export const HeroSection = ({
  headline = "Rebuilding what apartheid destroyed.",
  subtitle = "Through the Six Trainers framework.",
  ctaLabel = "Book a Session",
  ctaHref = "/book",
}) => {
  // Sample motion / save-data preference once at mount. Re-probing on every
  // render would risk a mid-session background swap, which is out of scope.
  const [useStaticPoster] = useState(
    () => prefersReducedMotion() || isSaveData(),
  );

  const foregroundRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const cardRef = useRef(null);

  const navigate = useNavigate();

  useGSAP(
    () => {
      const headlineEl = headlineRef.current;
      const subtitleEl = subtitleRef.current;
      const ctaEl = ctaRef.current;
      const cardEl = cardRef.current;
      if (!headlineEl || !subtitleEl || !ctaEl || !cardEl) return undefined;

      // Requirement 13.4: the headline parent sets `transformPerspective: 600`
      // so the per-character `rotationX` tween renders with 3D depth. Applied
      // via `gsap.set` on both motion branches so the property is present on
      // the element before any timeline reads transforms from it, and so the
      // scoped `useGSAP` context auto-reverts it on unmount.
      gsap.set(headlineEl, { transformPerspective: 600 });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Requirement 14.1: the Flip card initializes at
        // `{ rotationY: 180, scale: 0.5, opacity: 0 }` via `gsap.set`
        // before any timeline frame runs, so there is no flash of the
        // fully-flipped card on mount. Pair it with a matching
        // `transformPerspective: 600` on the card so the `rotationY`
        // tween renders with 3D depth comparable to the headline.
        gsap.set(cardEl, {
          rotationY: 180,
          scale: 0.5,
          opacity: 0,
          transformPerspective: 600,
        });

        // SplitText may be unavailable (plugin bundle failed to load or
        // missing license); the catch branch leaves the headline as plain
        // text rendered at full opacity — subtitle and CTA still animate.
        let split;
        try {
          split = new SplitText(headlineEl, { type: "chars" });
        } catch (err) {
          split = null;
        }

        const tl = gsap.timeline();

        if (split && Array.isArray(split.chars) && split.chars.length > 0) {
          // Requirement 13.8: every split glyph is hidden from the
          // accessibility tree — the parent `aria-label` is the only
          // thing AT should read.
          split.chars.forEach((c) => c.setAttribute("aria-hidden", "true"));

          tl.from(split.chars, {
            opacity: 0,
            yPercent: 110,
            rotationX: -60,
            stagger: 0.6,
            ease: "expo.out",
            duration: 1,
          });
        } else {
          // SplitText failed — fall back to a whole-headline opacity lift
          // so the master timeline still has a first entry for the
          // subtitle / CTA to chain against.
          tl.from(headlineEl, {
            opacity: 0,
            duration: 1,
            ease: "expo.out",
          });
        }

        tl.from(
          subtitleEl,
          {
            opacity: 0,
            yPercent: 40,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.3",
        ).from(
          ctaEl,
          {
            opacity: 0,
            yPercent: 40,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.3",
        );

        // Requirement 14.2: Flip card flips in on the master timeline
        // with `duration: 1.2`, `ease: "back.out(1.4)"`, targeting
        // identity `{ rotationY: 0, scale: 1, opacity: 1 }`. Positioned
        // at absolute time `0` so the card unfolds in parallel with the
        // headline character reveal — per the design, this is the
        // "hero focal" motion, not a trailing flourish.
        //
        // Requirement 14.3: when the flip-in completes, the idle float
        // tween starts and loops indefinitely. We capture the returned
        // tween reference so a subsequent call to `mm.revert()` (either
        // on unmount or on a mid-session motion-preference flip) kills
        // it via the `useGSAP` context.
        tl.to(
          cardEl,
          {
            rotationY: 0,
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: "back.out(1.4)",
            onComplete: () => {
              gsap.to(cardEl, {
                y: -12,
                duration: 2.4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
              });
            },
          },
          0,
        );

        return () => {
          if (split && typeof split.revert === "function") {
            split.revert();
          }
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Opacity-only 150 ms fades per the reduced-motion policy
        // (Requirements 4.1, 4.2, 13.1–13.3 reduced branch, 14 reduced
        // branch). No SplitText is constructed — the plain headline
        // string is fine in this branch because AT would already be
        // reading the text directly. The Flip card rests at identity
        // (no `rotationY`, `scale`, or idle float) and only opacity
        // fades in.
        gsap.from(headlineEl, { opacity: 0, duration: 0.15 });
        gsap.from(subtitleEl, { opacity: 0, duration: 0.15 });
        gsap.from(ctaEl, { opacity: 0, duration: 0.15 });
        gsap.from(cardEl, { opacity: 0, duration: 0.15 });
      });

      return () => mm.revert();
    },
    { scope: foregroundRef, dependencies: [headline, subtitle, ctaLabel] },
  );

  return (
    <NotchedSection
      tone="charcoal"
      className="relative min-h-[90vh] overflow-hidden"
    >
      {/* Background media layer (Requirements 15.1, 15.3, 15.4, 15.5, 15.6). */}
      <div className="absolute inset-0 w-full h-full">
        {useStaticPoster ? (
          <img
            src={HERO_POSTER_IMAGE}
            width={assets.HERO_POSTER_IMAGE.width}
            height={assets.HERO_POSTER_IMAGE.height}
            loading="eager"
            alt={assets.HERO_POSTER_IMAGE.altPlaceholder}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={HERO_AMBIENT_VIDEO}
            poster={HERO_POSTER_IMAGE}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/*
        Charcoal wash overlay (Requirement 15.2). The 75 % opacity `e1-bg`
        layer brings the net video opacity down to ~ 25 %, leaving headroom
        for legible foreground typography while preserving the ambient feel.
      */}
      <div
        className="absolute inset-0 w-full h-full bg-e1-bg opacity-75 pointer-events-none"
        aria-hidden="true"
      />

      {/*
        Foreground content slot. Populated by task 4.3 with the SplitText
        headline, subtitle, and CTA; task 4.4 appends the Flip card here
        on the same master timeline. The card sits below the CTA so the
        reading order remains headline → subtitle → CTA → focal portrait.
      */}
      <div
        ref={foregroundRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-8 py-24 text-center"
      >
        <h1
          ref={headlineRef}
          className="font-display text-e1-text text-5xl md:text-7xl lg:text-8xl leading-none"
          aria-label={headline}
        >
          {headline}
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 font-sans text-e1-text-muted text-lg md:text-xl uppercase tracking-wider"
        >
          {subtitle}
        </p>
        <div ref={ctaRef} className="mt-10">
          <MagneticButton
            className="font-sans uppercase text-sm tracking-wider px-8 py-4 border border-e1-primary text-e1-primary hover:bg-e1-primary hover:text-e1-text transition-colors"
            onClick={() => navigate(ctaHref)}
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </MagneticButton>
        </div>
        {/*
          Hero Flip card (Requirement 14). Explicit `width` / `height`
          and `fetchpriority="high"` keep CLS at zero and prioritize
          the above-the-fold portrait (Requirement 32.4). React 18
          forwards unknown lowercase DOM attributes verbatim, so
          `fetchpriority` renders as the standards-compliant HTML
          attribute name expected by browsers.
        */}
        <img
          ref={cardRef}
          src={HERO_CARD_IMAGE}
          width={assets.HERO_CARD_IMAGE.width}
          height={assets.HERO_CARD_IMAGE.height}
          alt={assets.HERO_CARD_IMAGE.altPlaceholder}
          fetchpriority="high"
          className="mt-12 w-64 md:w-80 h-auto"
        />
      </div>
    </NotchedSection>
  );
};

export default HeroSection;
