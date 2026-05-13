/**
 * Property-based test — hero headline SplitText accessibility.
 *
 * Feature: e1-editorial-ui-overhaul, Property 14
 *
 * For every `headline` drawn from
 *   `fc.string({ minLength: 1, maxLength: 200 })
 *      .filter(s => s.trim().length > 0)`
 * the property asserts two invariants the `<HeroSection>` must uphold
 * after the SplitText entrance wires up:
 *
 *   1. The parent `<h1>` element's `aria-label` attribute equals the
 *      raw headline string verbatim (Requirement 13.7). This is the
 *      only surface assistive tech reads once SplitText fragments the
 *      headline into per-character spans — it must mirror the
 *      original copy exactly, including whitespace and punctuation.
 *
 *   2. Every character span created by SplitText inside the `<h1>`
 *      carries `aria-hidden="true"` (Requirement 13.8), so AT never
 *      announces the fragmented glyphs alongside the `aria-label`.
 *
 * ### Strategy: deterministic SplitText substitution
 *
 * `SplitText` is a commercial GSAP plugin that requires a license key
 * to construct at runtime, and its real behaviour depends on layout
 * metrics jsdom does not compute. We sidestep both by jest-mocking
 * the `gsap/SplitText` module with a deterministic stub that matches
 * the surface `<HeroSection>` consumes:
 *
 *   - `new SplitText(el, { type: "chars" })` reads the element's
 *     `textContent`, clears the element, and appends one
 *     `<span class="e1-splittext-char">` per Unicode code point (via
 *     `Array.from(text)` so surrogate pairs are not split).
 *   - The stub exposes `chars` as the array of those spans, which is
 *     exactly what `<HeroSection>` iterates to set `aria-hidden="true"`.
 *   - `revert()` restores the original text and is a no-op for this
 *     property because the property only inspects the fragmented
 *     state.
 *
 * This makes Requirement 13.8 directly testable in jsdom: we can
 * query `h1 > span.e1-splittext-char` after mount and assert every
 * one of them carries `aria-hidden="true"`.
 *
 * ### Strategy: force the motion branch of `gsap.matchMedia`
 *
 * `<HeroSection>` calls `gsap.matchMedia().add(query, fn)` twice (once
 * for `(prefers-reduced-motion: no-preference)`, once for the reduce
 * branch) and only the no-preference branch constructs the SplitText
 * instance. The test spies on `gsap.matchMedia` to route handlers
 * through a stub that fires the motion handler and skips the reduce
 * handler, guaranteeing the SplitText code path runs every sample.
 * Every other GSAP surface the hero uses (`gsap.set`, `gsap.timeline`,
 * `gsap.to`, `tl.from`, `tl.to`) executes normally — the timeline
 * tweens never run to completion because we do not advance
 * `gsap.ticker`, but SplitText substitution and the aria-hidden
 * assignment are synchronous and complete before the first frame.
 *
 * ### Strategy: matchMedia / scrollTo / navigator stubs
 *
 * jsdom does not ship `window.matchMedia` or `window.scrollTo`, and
 * `<HeroSection>` (via `prefersReducedMotion()` / `isSaveData()`)
 * consults both at mount to decide between the ambient video and the
 * static poster fallback. The property only cares about the headline,
 * so we install permissive stubs that default both queries to `false`
 * (full-motion path) before the first require of `@/lib/gsap`.
 *
 * ### Why `numRuns: 50`
 *
 * Each iteration performs a full React mount of `<HeroSection>` inside
 * a `<MemoryRouter>` (for `useNavigate`), exercises the useGSAP scope,
 * and unmounts. `numRuns: 50` keeps the suite under a couple of
 * seconds while still giving fast-check ample shrinking coverage of
 * the 1–200-character headline input space.
 *
 * Validates: Requirements 13.1, 13.7, 13.8
 */

/* eslint-disable global-require, import/first, import/newline-after-import */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo stubs — installed before any module import so
// `@/lib/gsap`'s import-time side effects (ScrollTrigger.config /
// ScrollTrigger.defaults, which reach into `gsap.matchMedia()` which
// in turn reads `window.matchMedia`) see a populated stub at module
// evaluation time.
// ---------------------------------------------------------------------------

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
if (typeof window !== "undefined") {
  window.scrollTo = window.scrollTo || (() => {});
}

// ---------------------------------------------------------------------------
// GSAP plugin subpath mocks — the ESM sub-paths are not parseable by
// Jest's default transform. `ScrollTrigger` proxies the CJS-compatible
// UMD twin so the runtime singleton's `.defaults` / `.config` calls
// succeed. `SplitText` is replaced with a deterministic stub (see
// module-level docblock) so the property can inspect the fragmented
// DOM without depending on the commercial plugin runtime.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = () => {};
  Real.config = () => {};
  return { __esModule: true, ScrollTrigger: Real };
});

const SPLIT_CHAR_CLASS = "e1-splittext-char";

jest.mock("gsap/SplitText", () => {
  /**
   * Minimal SplitText substitute. Matches the surface
   * `<HeroSection>` consumes:
   *   - `new SplitText(el, { type: "chars" })` fragments `el` by
   *     Unicode code point, replacing its `textContent` with one
   *     `<span class="e1-splittext-char">` per code point.
   *   - `.chars` is the array of those spans.
   *   - `.revert()` restores the original text content.
   */
  class MockSplitText {
    constructor(el) {
      this._el = el;
      this._originalText = el.textContent;
      const codePoints = Array.from(this._originalText);
      // Clear existing children without touching element attributes
      // (in particular `aria-label`, which is the assertion target).
      while (el.firstChild) el.removeChild(el.firstChild);
      this.chars = codePoints.map((cp) => {
        const span = el.ownerDocument.createElement("span");
        span.className = SPLIT_CHAR_CLASS;
        span.textContent = cp;
        el.appendChild(span);
        return span;
      });
    }

    revert() {
      const el = this._el;
      while (el.firstChild) el.removeChild(el.firstChild);
      el.textContent = this._originalText;
    }
  }

  return { __esModule: true, SplitText: MockSplitText };
});

jest.mock("gsap/DrawSVGPlugin", () => ({
  __esModule: true,
  DrawSVGPlugin: {},
}));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({
  __esModule: true,
  MorphSVGPlugin: {},
}));

// Deferred requires — ES module imports hoist above the
// matchMedia / jest.mock bootstrap. Routing the gsap runtime and
// component imports through `require(...)` preserves initialization
// order so stubs are in place when the runtime singleton and the
// hero module evaluate.
const fc = require("fast-check");
const React = require("react");
const { act, cleanup, render } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");
const { gsap } = require("../../lib/gsap");
const { HeroSection } = require("../home/HeroSection");

// ---------------------------------------------------------------------------
// gsap.matchMedia stub — route handlers so only the motion branch
// fires. `<HeroSection>` registers two branches on the same `mm`
// instance; we want only `(prefers-reduced-motion: no-preference)`
// to execute so the SplitText path runs, matching Requirement 13.1
// (the SplitText entrance is the motion-enabled path).
// ---------------------------------------------------------------------------

/**
 * Install a `gsap.matchMedia` spy that fires handlers registered
 * against `(prefers-reduced-motion: no-preference)` immediately and
 * ignores every other query. Returns a restore callback.
 *
 * @returns {() => void}
 */
function installMotionOnlyMatchMedia() {
  const spy = jest.spyOn(gsap, "matchMedia").mockImplementation(() => ({
    add: (query, fn) => {
      if (/prefers-reduced-motion:\s*no-preference/.test(query)) {
        // The useGSAP scope cleanup expects matchMedia `add` handlers
        // to return either `undefined` or a teardown callback — match
        // the real library's contract by swallowing whatever the
        // handler returns. We intentionally do not invoke the teardown
        // in this property since we never mid-session flip motion
        // preference.
        fn();
      }
    },
    revert: () => {},
    kill: () => {},
  }));
  return () => spy.mockRestore();
}

describe("<HeroSection> — Property 14: hero headline SplitText accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 14 — aria-label mirrors the headline and every
   * SplitText character span is hidden from the accessibility tree.
   *
   * Feature: e1-editorial-ui-overhaul, Property 14
   *
   * Generator: `fc.string({ minLength: 1, maxLength: 200 })
   *              .filter(s => s.trim().length > 0)`
   *
   * For each sampled `headline`:
   *   1. Install the motion-only `gsap.matchMedia` stub so the
   *      SplitText branch of `<HeroSection>` runs synchronously at
   *      mount.
   *   2. Render `<HeroSection headline={headline} />` inside a
   *      `<MemoryRouter>` so `useNavigate` has a router context.
   *   3. Query the rendered `<h1>` and assert
   *      `h1.getAttribute("aria-label") === headline` (Requirement
   *      13.7).
   *   4. Query every `span.e1-splittext-char` child of the `<h1>`
   *      and assert each one carries `aria-hidden="true"` (Requirement
   *      13.8). The mock SplitText produces at least one such span
   *      because the generator guarantees the headline contains at
   *      least one non-whitespace character, so the assertion is
   *      never vacuous.
   *   5. Unmount and restore the gsap.matchMedia spy.
   *
   * Validates: Requirements 13.1, 13.7, 13.8
   */
  it("mirrors the raw headline into aria-label and marks every SplitText character span aria-hidden", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 200 })
          .filter((s) => s.trim().length > 0),
        (headline) => {
          const restoreMatchMedia = installMotionOnlyMatchMedia();

          let container;
          let unmount;
          try {
            act(() => {
              ({ container, unmount } = render(
                <MemoryRouter>
                  <HeroSection headline={headline} />
                </MemoryRouter>
              ));
            });

            const h1 = container.querySelector("h1");
            if (h1 === null) {
              throw new Error(
                "Hero headline <h1> not found in rendered output."
              );
            }

            // Requirement 13.7 — aria-label equals the raw headline
            // verbatim (whitespace, punctuation, and all).
            if (h1.getAttribute("aria-label") !== headline) {
              throw new Error(
                `aria-label mismatch: expected ${JSON.stringify(
                  headline
                )}, got ${JSON.stringify(h1.getAttribute("aria-label"))}.`
              );
            }

            // Requirement 13.8 — every character span carries
            // aria-hidden="true". The mock SplitText creates one
            // span per code point, so the filter on the generator
            // (at least one non-whitespace char ⇒ at least one
            // code point overall) guarantees this set is non-empty
            // and the assertion is non-vacuous.
            const charSpans = h1.querySelectorAll(
              `span.${SPLIT_CHAR_CLASS}`
            );
            if (charSpans.length === 0) {
              throw new Error(
                "Expected at least one SplitText character span inside the <h1>, found zero."
              );
            }
            charSpans.forEach((span, idx) => {
              if (span.getAttribute("aria-hidden") !== "true") {
                throw new Error(
                  `SplitText char span at index ${idx} missing aria-hidden="true". ` +
                    `Actual aria-hidden: ${JSON.stringify(
                      span.getAttribute("aria-hidden")
                    )}. Headline sample: ${JSON.stringify(headline)}.`
                );
              }
            });
          } finally {
            if (unmount) {
              act(() => {
                unmount();
              });
            }
            restoreMatchMedia();
            // Explicit per-iteration cleanup — fast-check's predicate
            // is synchronous and `afterEach` only runs between
            // `it()` blocks, so without this the prior iteration's
            // DOM remains mounted in parallel with the next render.
            cleanup();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
