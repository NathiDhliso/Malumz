import { createRef, useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, Heart, TrendingUp, Mail } from "lucide-react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { ST } from "@/lib/motion";
import assets, {
  ABOUT_COLLAGE_A,
  ABOUT_COLLAGE_B,
  ABOUT_COLLAGE_C,
} from "@/lib/assets";

/**
 * AboutPage — E1 editorial treatment.
 *
 * Renders the new AboutPage composition mandated by Requirement 23:
 *
 *   Hero title →
 *   Two-column band with a large numeric counter on the left and
 *   pull-quote paragraphs on the right →
 *   Editorial collage of `ABOUT_COLLAGE_A/B/C` in a staggered two-column
 *   layout →
 *   Preserved narrative sections (timeline, mission, contact) restyled
 *   in E1 tokens.
 *
 * ## Animations
 *
 * **Counter (Requirements 23.1, 23.2).** The left column hosts a single
 * large numeric readout. Inside `gsap.matchMedia()`:
 *
 *   - `no-preference`: a `ScrollTrigger` with `start: ST.counterStart`
 *     (`"top 70%"`) fires once; its `onEnter` callback runs
 *     `gsap.to({ v: 0 }, { v: target, snap: { value: 1 }, duration: 2,
 *     onUpdate })` and writes each integer value into the element's
 *     `textContent` so assistive tech and the visual reading agree.
 *   - `reduce`: the target value is written directly into
 *     `textContent` on mount with no tween.
 *
 * The target is `200`, sourced from the preserved pilot stat
 * "200 Men in the 2026–2030 pilot" so the counter animates toward a
 * number that already lives in the page's narrative.
 *
 * **Pull-quote paragraphs (Requirements 23.3, 23.4).** Each paragraph
 * in the right column is wrapped by `new SplitText(el, { type: "words" })`
 * and animated on its own `ScrollTrigger` at `start: "top 70%"`:
 *
 *   - `no-preference`: every word animates `{ opacity: 0, y: 20 } →
 *     { opacity: 1, y: 0 }` with a per-word stagger, `ease: "power3.out"`,
 *     and `duration: 0.6`.
 *   - `reduce`: the paragraph itself fades from `opacity: 0` to `1` over
 *     150 ms. No `SplitText` is constructed in this branch and no
 *     transform-based tweens are created.
 *
 * The `SplitText` constructor is wrapped in `try/catch` so a missing
 * plugin bundle leaves the plain paragraph in place at full opacity with
 * only a container-level fade applied (mirrors the HeroSection
 * fallback pattern from §"SplitText failure" in the design doc).
 *
 * **Collage (Requirements 23.5, 23.6).** Three `<img>` elements render
 * `ABOUT_COLLAGE_A`, `ABOUT_COLLAGE_B`, and `ABOUT_COLLAGE_C` in a
 * two-column grid with alternating vertical offsets — the right column
 * sits below the left column's top edge to produce the staggered
 * editorial rhythm. Every image declares explicit `width`, `height`,
 * `loading="lazy"`, and `alt` populated from the Assets_Module's
 * `altPlaceholder` metadata (Requirements 32.1, 32.3, 32.5).
 *
 * ## Preserved copy (Requirement 30.3)
 *
 * Every data constant and copy string from the prior revision is kept
 * below the editorial band so the new treatment is additive rather than
 * destructive. Only the styling changes: `malumz-*` tokens and
 * `font-serif`/`font-accent` references are replaced with their `e1-*`
 * / `font-display` / `font-sans` equivalents.
 *
 * ## Cleanup
 *
 * Every tween, `ScrollTrigger`, and `SplitText` instance is created
 * inside the scoped `useGSAP` context so the library auto-reverts them
 * on unmount or when `gsap.matchMedia()` re-evaluates. The `SplitText`
 * instances are collected in a cleanup list so their `.revert()` method
 * runs before the scoped context tear-down, restoring the original
 * paragraph DOM.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 30.3, 32.1, 32.3, 32.5
 */

/** Counter target sourced from the preserved "200 Men in the 2026–2030 pilot" stat. */
const COUNTER_TARGET = 200;
const COUNTER_LABEL = "Men in the 2026–2030 pilot";

/**
 * Narrative paragraphs rendered in the right column. Each string is
 * preserved verbatim from the prior AboutPage revision (the mission
 * quote and the Book / Brotherhood Circles descriptions) so the
 * per-word SplitText animation operates on the page's existing copy.
 */
const PULL_QUOTE_PARAGRAPHS = [
  "We cannot fix the cycle by only treating the symptoms. We must address the root: untrained men mass-producing broken families.",
  "The Dog Trainer is a memoir and framework. It tells the story of growing up across seven schools in post-apartheid South Africa and formalises the Six Trainers framework — the six dimensions every man needs to rebuild.",
  "The community-based model where 20 men meet weekly for 6 months to rebuild themselves across all six dimensions. The book is the constitution. The Circles are the practice.",
];

/**
 * Staggered layout recipe for the three collage images. `column` decides
 * which flex column the image lives in; `offsetClass` applies the
 * vertical offset that produces the editorial stagger. The collage
 * reads left-top, right-mid, left-bottom from a reader's perspective.
 */
const COLLAGE_ITEMS = [
  { key: "ABOUT_COLLAGE_A", src: ABOUT_COLLAGE_A, column: "left", offsetClass: "" },
  { key: "ABOUT_COLLAGE_B", src: ABOUT_COLLAGE_B, column: "right", offsetClass: "md:mt-24" },
  { key: "ABOUT_COLLAGE_C", src: ABOUT_COLLAGE_C, column: "left", offsetClass: "mt-8 md:mt-16" },
];

/** Preserved "The Story" timeline data — copy strings unchanged. */
const TIMELINE = [
  {
    year: "Late Dec 1991",
    event:
      "Born. Post-apartheid South Africa. The first generation that was supposed to be free.",
    icon: Calendar,
  },
  {
    year: "Seven Schools",
    event:
      "Moved across seven schools. Each one a different lesson in what apartheid left behind.",
    icon: Calendar,
  },
  {
    year: "2020",
    event:
      "Big P dies. The anchor is gone. The man who had been running a six-part training programme my entire life — without ever naming it.",
    icon: Heart,
  },
  {
    year: "2024",
    event:
      "Scored 21/60. Finally understood: I'm not broken. I'm untrained. The Six Trainers framework crystallises.",
    icon: TrendingUp,
  },
  {
    year: "2025",
    event:
      "37/60. Married. Building. Started training others. The Brotherhood Circles concept takes shape.",
    icon: Heart,
  },
  {
    year: "2026",
    event:
      'Published "The Dog Trainer." Launched the first Brotherhood Circles pilot.',
    icon: TrendingUp,
  },
];

export const AboutPage = () => {
  const pageRef = useRef(null);
  const counterRef = useRef(null);
  // Pre-allocate a stable array of refs for the pull-quote paragraphs so
  // the per-paragraph `SplitText` instances and ScrollTriggers can be
  // wired up inside `useGSAP` without touching React state on each render.
  const paragraphRefs = useRef(
    PULL_QUOTE_PARAGRAPHS.map(() => createRef()),
  );

  useGSAP(
    () => {
      const counterEl = counterRef.current;
      const paragraphEls = paragraphRefs.current
        .map((r) => r.current)
        .filter(Boolean);
      if (!counterEl || paragraphEls.length === 0) return undefined;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // --- Counter (Requirements 23.1, 23.2) -----------------------------
        // The tween target is a plain object whose `v` field is snapped to
        // integers; `onUpdate` writes the rounded value back into the DOM so
        // the visible number steps rather than displaying a float mid-tween.
        ScrollTrigger.create({
          trigger: counterEl,
          start: ST.counterStart,
          once: true,
          onEnter: () => {
            const counterState = { v: 0 };
            gsap.to(counterState, {
              v: COUNTER_TARGET,
              snap: { value: 1 },
              duration: 2,
              ease: "power1.out",
              onUpdate: () => {
                counterEl.textContent = String(Math.round(counterState.v));
              },
              onComplete: () => {
                counterEl.textContent = String(COUNTER_TARGET);
              },
            });
          },
        });

        // --- Pull-quote paragraphs (Requirements 23.3, 23.4) ---------------
        // Each paragraph owns its own SplitText instance and ScrollTrigger
        // so the words fade up independently as each paragraph enters the
        // viewport. Collecting the instances lets the cleanup below call
        // `.revert()` on every split in one sweep.
        const splits = [];

        paragraphEls.forEach((el) => {
          let split = null;
          try {
            split = new SplitText(el, { type: "words" });
          } catch (err) {
            split = null;
          }

          if (split && Array.isArray(split.words) && split.words.length > 0) {
            splits.push(split);
            gsap.set(split.words, { opacity: 0, y: 20 });

            ScrollTrigger.create({
              trigger: el,
              start: "top 70%",
              once: true,
              onEnter: () => {
                gsap.to(split.words, {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power3.out",
                  stagger: 0.03,
                });
              },
            });
          } else {
            // SplitText unavailable — fall back to a paragraph-level fade
            // so the copy still animates in rather than popping.
            gsap.set(el, { opacity: 0 });
            ScrollTrigger.create({
              trigger: el,
              start: "top 70%",
              once: true,
              onEnter: () => {
                gsap.to(el, { opacity: 1, duration: 0.6, ease: "power3.out" });
              },
            });
          }
        });

        return () => {
          splits.forEach((s) => {
            if (s && typeof s.revert === "function") s.revert();
          });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Counter: render the final value directly, no tween.
        counterEl.textContent = String(COUNTER_TARGET);

        // Paragraphs: opacity-only 150 ms fade, whole paragraph at a time.
        paragraphEls.forEach((el) => {
          gsap.set(el, { opacity: 0 });
          ScrollTrigger.create({
            trigger: el,
            start: "top 70%",
            once: true,
            onEnter: () => {
              gsap.to(el, { opacity: 1, duration: 0.15 });
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-e1-bg text-e1-text">
      {/* ------------------------------------------------------------------
          Hero title band (preserved copy: "About" + Nkosinathi subtitle).
          ------------------------------------------------------------------ */}
      <section className="pt-32 pb-16 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-display text-e1-text text-5xl md:text-6xl lg:text-7xl leading-none mb-6">
            About
          </h1>
          <p className="font-sans text-e1-text-muted text-lg md:text-xl uppercase tracking-wider">
            Nkosinathi Dhliso. Born late December 1991. Seven schools. The full journey.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Two-column band: counter (left) + pull-quote paragraphs (right)
          — Requirements 23.1–23.4.
          ------------------------------------------------------------------ */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div className="flex flex-col items-start md:sticky md:top-32">
              <div
                ref={counterRef}
                className="font-display text-e1-primary text-8xl md:text-9xl leading-none tabular-nums"
                aria-label={`${COUNTER_TARGET} ${COUNTER_LABEL}`}
              >
                0
              </div>
              <div
                className="mt-4 font-sans text-e1-text-muted text-sm uppercase tracking-wider"
                aria-hidden="true"
              >
                {COUNTER_LABEL}
              </div>
            </div>

            <div className="flex flex-col gap-10">
              {PULL_QUOTE_PARAGRAPHS.map((paragraph, i) => (
                <p
                  key={i}
                  ref={paragraphRefs.current[i]}
                  className="font-display italic text-e1-text text-2xl md:text-3xl leading-snug"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Editorial collage — Requirements 23.5, 23.6, 32.1, 32.3, 32.5.
          ------------------------------------------------------------------ */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="flex flex-col gap-6 md:gap-10">
              {COLLAGE_ITEMS.filter((c) => c.column === "left").map((item) => {
                const meta = assets[item.key];
                return (
                  <img
                    key={item.key}
                    src={item.src}
                    width={meta.width}
                    height={meta.height}
                    loading="lazy"
                    alt={meta.altPlaceholder}
                    className={`w-full h-auto object-cover ${item.offsetClass}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-col gap-6 md:gap-10">
              {COLLAGE_ITEMS.filter((c) => c.column === "right").map((item) => {
                const meta = assets[item.key];
                return (
                  <img
                    key={item.key}
                    src={item.src}
                    width={meta.width}
                    height={meta.height}
                    loading="lazy"
                    alt={meta.altPlaceholder}
                    className={`w-full h-auto object-cover ${item.offsetClass}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Preserved "The Story" timeline — Requirement 30.3. Copy strings
          and icon assignments are unchanged; only the token palette /
          typography is swapped to the E1 system.
          ------------------------------------------------------------------ */}
      <section className="py-24 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-e1-text text-4xl md:text-5xl text-center mb-16">
            The Story
          </h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-e1-primary hidden md:block" />
            <div className="space-y-12">
              {TIMELINE.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex gap-8 items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-e1-primary rounded-full flex items-center justify-center text-e1-text relative z-10">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 bg-e1-bg border border-e1-primary/20 rounded-xl p-6 hover:border-e1-primary/60 transition-colors">
                      <div className="font-sans text-e1-primary uppercase tracking-wider text-sm mb-2">
                        {item.year}
                      </div>
                      <p className="font-sans text-e1-text-muted leading-relaxed">
                        {item.event}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Preserved "The Mission" block — Requirement 30.3. The pull-quote
          copy and the Book / Brotherhood Circles descriptions are
          identical to the prior revision; only the tokens and fonts are
          updated.
          ------------------------------------------------------------------ */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-e1-text text-4xl md:text-5xl text-center mb-12">
            The Mission
          </h2>
          <div className="bg-e1-surface border-l-2 border-e1-primary p-8 md:p-12 rounded-lg mb-12">
            <p className="font-display italic text-xl md:text-2xl text-e1-text leading-relaxed">
              "We cannot fix the cycle by only treating the symptoms. We must address the root: untrained men mass-producing broken families."
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-e1-surface rounded-xl p-8 border border-e1-primary/20">
              <h3 className="font-display text-e1-text text-2xl mb-4">
                The Book
              </h3>
              <p className="font-sans text-e1-text-muted leading-relaxed">
                The Dog Trainer is a memoir and framework. It tells the story of growing up across seven schools in post-apartheid South Africa and formalises the Six Trainers framework — the six dimensions every man needs to rebuild.
              </p>
              <Link
                to="/book"
                className="inline-block mt-4 font-sans uppercase tracking-wider text-sm text-e1-primary hover:text-e1-highlight"
              >
                Get the book →
              </Link>
            </div>
            <div className="bg-e1-surface rounded-xl p-8 border border-e1-primary/20">
              <h3 className="font-display text-e1-text text-2xl mb-4">
                Brotherhood Circles
              </h3>
              <p className="font-sans text-e1-text-muted leading-relaxed">
                The community-based model where 20 men meet weekly for 6 months to rebuild themselves across all six dimensions. The book is the constitution. The Circles are the practice.
              </p>
              <Link
                to="/join"
                className="inline-block mt-4 font-sans uppercase tracking-wider text-sm text-e1-primary hover:text-e1-highlight"
              >
                Start a Circle →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Preserved "Contact" block — Requirement 30.3.
          ------------------------------------------------------------------ */}
      <section className="py-16 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-e1-text text-3xl md:text-4xl mb-8 text-center">
            Contact
          </h2>
          <div className="flex flex-col items-center gap-4">
            <a
              href="mailto:nkosinathi.dhliso@gmail.com"
              className="inline-flex items-center gap-3 font-sans text-e1-primary hover:text-e1-highlight text-lg"
            >
              <Mail size={20} />
              nkosinathi.dhliso@gmail.com
            </a>
            <Link
              to="/contact"
              className="font-sans uppercase tracking-wider text-sm bg-e1-primary text-e1-text hover:bg-e1-secondary rounded-full px-8 py-3 transition-colors inline-block"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
