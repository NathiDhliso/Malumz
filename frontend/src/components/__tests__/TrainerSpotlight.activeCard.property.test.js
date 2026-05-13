/**
 * Property-based test — `<TrainerSpotlight>` active-card state.
 *
 * Feature: e1-editorial-ui-overhaul, Property 16
 *
 * For any generated active index `i ∈ [0, 5]` drawn from
 * `fc.integer({ min: 0, max: 5 })`, the test drives the spotlight
 * timeline to the end of beat `i` and asserts:
 *
 *   1. The card at index `i` renders `{ opacity: 1, scale: 1 }`.
 *   2. Every other card renders `{ opacity: 0.3, scale: 0.95 }`.
 *   3. The terracotta left-border on card `i` has `scaleY` animated
 *      from 0 to 1 (terminal state `scaleY === 1`).
 *   4. Every other border sits at `scaleY === 0`, so the "0 → 1"
 *      witness on the active card is unambiguous.
 *
 * Strategy notes
 * --------------
 * - `<TrainerSpotlight>` wraps the full timeline inside
 *   `gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", …)`.
 *   To exercise the pinned branch under jsdom the test installs a
 *   `window.matchMedia` stub whose `matches` is `true` only for that
 *   query (and for the individual `(min-width: 1024px)` / `no-preference`
 *   probes the motion lib performs independently). Every other media
 *   query resolves to `matches: false` so no sibling branch fires.
 *
 * - Real GSAP drives the test — the runtime singleton at
 *   `@/lib/gsap` is used exactly as production imports it. `gsap.timeline`
 *   is spied with `mockImplementation` that delegates to the original,
 *   captures the returned timeline, and lets the component's wiring run
 *   untouched. The captured timeline is the one whose `.time()` the
 *   property drives.
 *
 * - The timeline is created with `{ scrollTrigger: { pin, scrub: 1, … } }`.
 *   jsdom has no layout engine, so ScrollTrigger cannot produce a
 *   scroll-driven progression; instead we kill `tl.scrollTrigger`
 *   immediately after capture, turning the spotlight timeline into a
 *   plain timeline that `tl.time(t)` can seek synchronously without
 *   scrub-smoothing or scroll-position re-evaluation interfering.
 *
 * - Each card owns a one-second beat starting at `t = i`: `tl.to(card, {
 *   opacity: 1, scale: 1, duration: 0.25 }, i)` activates it and
 *   completes at `t = i + 0.25`, at which moment `tl.to(prevCard, {
 *   opacity: 0.3, scale: 0.95, duration: 0.25 }, i)` (present when
 *   `i > 0`) has also completed. Seeking to `t = i + 0.25` therefore
 *   places the playhead at the unique instant where:
 *     * card[i] is at `{ opacity: 1, scale: 1 }` (activation complete);
 *     * card[i-1] is at `{ opacity: 0.3, scale: 0.95 }` (deactivation
 *       complete);
 *     * card[j] with `j < i - 1` has already been deactivated at
 *       `t = j + 1 + 0.25 < i + 0.25`;
 *     * card[j] with `j > i` has never been touched by a tween and
 *       still holds the initial `gsap.set(cards, { opacity: 0.3,
 *       scale: 0.95 })` baseline.
 *   Combined, this proves exactly one active card per beat, which is
 *   the invariant Property 16 polices.
 *
 * - Values are read via `gsap.getProperty(el, prop)`, which reports the
 *   live animated property the GSAP runtime has applied to the element
 *   (not the CSS-authored initial). This is the same read path
 *   production consumers would see at runtime.
 *
 * - `numRuns` is dialled to 30 — the input space has only six discrete
 *   values, so fast-check covers each index multiple times while
 *   keeping the per-iteration full-render cost bounded.
 *
 * Validates: Requirements 17.3, 17.4, 17.5
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo permissive stubs — installed before any module
// import so the `@/lib/gsap` runtime singleton and `<TrainerSpotlight>`
// see a populated `window.matchMedia` at module-evaluation time. jsdom
// does not provide it by default. Each fast-check sample overwrites this
// with the desktop + no-preference implementation and restores it at
// teardown.
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
// GSAP plugin sub-path mocks — `gsap/ScrollTrigger` et al. ship ESM that
// Jest's default transform cannot parse. The `dist/` twin is a UMD CJS
// bundle, so the `ScrollTrigger` mock proxies the real object (we need
// `ScrollTrigger` to actually function so the spotlight's timeline
// `scrollTrigger` config resolves). The remaining four plugins are only
// referenced by the runtime singleton's `gsap.registerPlugin(...)` call —
// empty sentinels suffice. `defaults` / `config` are patched to no-ops
// so the one-time import side effects do not accumulate across runs.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = () => {};
  Real.config = () => {};
  return { __esModule: true, ScrollTrigger: Real };
});
jest.mock("gsap/SplitText", () => ({ __esModule: true, SplitText: {} }));
jest.mock("gsap/DrawSVGPlugin", () => ({
  __esModule: true,
  DrawSVGPlugin: {},
}));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({
  __esModule: true,
  MorphSVGPlugin: {},
}));

const fc = require("fast-check");
const React = require("react");
const { act, cleanup, render } = require("@testing-library/react");

const { gsap } = require("../../lib/gsap");
const { TrainerSpotlight } = require("../home/TrainerSpotlight");

// ---------------------------------------------------------------------------
// Desktop + no-preference matchMedia stub.
//
// The spotlight's `gsap.matchMedia().add(query, fn)` only fires `fn` when
// its query matches, and the motion lib probes `(min-width: 1024px)` and
// `(prefers-reduced-motion: reduce)` independently. The stub below
// therefore returns `true` for:
//
//   - `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`
//     (the spotlight's exact gate),
//   - `(min-width: 1024px)` (the pin-breakpoint probe),
//   - `(prefers-reduced-motion: no-preference)` (the inverse of the
//     reduced-motion probe).
//
// and `false` for every other query — notably
// `(prefers-reduced-motion: reduce)` and `(pointer: fine) and
// (hover: hover)`, so no sibling motion branch fires alongside the
// spotlight.
// ---------------------------------------------------------------------------

function installDesktopMotionMatchMedia() {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockImplementation((query) => {
    const q = String(query);
    const desktopPin = q.includes("min-width: 1024px");
    const noPref = /prefers-reduced-motion:\s*no-preference/.test(q);
    const reduce = /prefers-reduced-motion:\s*reduce/.test(q);

    let matches;
    if (reduce) {
      matches = false;
    } else if (desktopPin && noPref) {
      matches = true;
    } else if (desktopPin && !reduce) {
      matches = true;
    } else if (noPref) {
      matches = true;
    } else {
      matches = false;
    }

    return {
      matches,
      media: q,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  });
  return () => {
    window.matchMedia = original;
  };
}

// ---------------------------------------------------------------------------
// Floating-point comparison helper — `gsap.getProperty` returns numeric
// values that may carry tiny sub-epsilon residue from the tween engine's
// bezier interpolation. A 1e-3 tolerance is well below any animator-
// perceptible difference and comfortably above the engine's numeric noise
// floor.
// ---------------------------------------------------------------------------

const EPS = 1e-3;
function approxEqual(actual, expected) {
  return Math.abs(Number(actual) - Number(expected)) < EPS;
}

describe("<TrainerSpotlight> — Property 16: active-card state", () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 16 — For every generated active index `i ∈ [0, 5]`,
   * driving the spotlight timeline to the end of beat `i` leaves
   * exactly card `i` at `{ opacity: 1, scale: 1 }`, every other card
   * at `{ opacity: 0.3, scale: 0.95 }`, border `i` at `scaleY === 1`
   * (the 0 → 1 animation terminal state), and every other border at
   * `scaleY === 0`.
   *
   * Feature: e1-editorial-ui-overhaul, Property 16
   *
   * Validates: Requirements 17.3, 17.4, 17.5
   */
  it("drives each active index to the documented opacity/scale/scaleY state", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 5 }), (activeIdx) => {
        // Per-iteration environment — desktop + no-preference so the
        // `gsap.matchMedia` branch inside the component fires.
        const restoreMatchMedia = installDesktopMotionMatchMedia();

        // Delegate-and-capture spy on `gsap.timeline`: we need the real
        // timeline so the component's `.to(...)` wiring runs unchanged,
        // and we need the returned object so the property can seek it.
        const originalTimeline = gsap.timeline.bind(gsap);
        let capturedTimeline = null;
        const timelineSpy = jest
          .spyOn(gsap, "timeline")
          .mockImplementation((...args) => {
            const tl = originalTimeline(...args);
            // The spotlight creates exactly one timeline per mount (the
            // pinned scrub timeline). Record the first one; any
            // subsequent creation would be a regression worth
            // surfacing, but the property does not police that here.
            if (!capturedTimeline) capturedTimeline = tl;
            return tl;
          });

        let utils;
        try {
          utils = render(<TrainerSpotlight />);

          // Allow React to commit effects + `useGSAP` to run the
          // matchMedia branch and create the timeline.
          act(() => {});

          // If the matchMedia gate did not fire the branch — e.g., a
          // regression re-keyed the query — surface that early with a
          // clear message rather than a cryptic null-dereference later.
          if (!capturedTimeline) {
            throw new Error(
              "TrainerSpotlight did not create a timeline under the " +
                "desktop + no-preference matchMedia stub. The `gsap." +
                "matchMedia` branch gate may have regressed."
            );
          }

          // Kill the scrollTrigger so the timeline behaves as a plain,
          // seek-driven timeline. Without this, `tl.time(t)` is
          // observable for one frame but the next ticker tick asks the
          // live ScrollTrigger for the scroll position (0 in jsdom) and
          // snaps the playhead back to 0, invalidating the read.
          if (capturedTimeline.scrollTrigger) {
            capturedTimeline.scrollTrigger.kill();
          }
          // Pause so no ambient ticker progression competes with our
          // manual seek.
          capturedTimeline.pause();

          // The spotlight's beats live at integer times; the card-`i`
          // activation tween completes at `t = i + 0.25`, and any
          // previous-card deactivation fired at the same `t = i`
          // position also completes at `t = i + 0.25`. Seek there.
          capturedTimeline.time(activeIdx + 0.25);

          // Read the rendered cards / borders. `querySelectorAll`
          // returns a live `NodeList` so we materialise an array for
          // stable indexing.
          const cards = Array.from(
            utils.container.querySelectorAll("[data-spotlight-card]")
          );
          const borders = Array.from(
            utils.container.querySelectorAll("[data-spotlight-border]")
          );

          // Basic cardinality sanity — the default trainer list is six
          // entries, so six cards and six borders.
          expect(cards).toHaveLength(6);
          expect(borders).toHaveLength(6);

          // ---- Card state ----------------------------------------------------
          for (let j = 0; j < cards.length; j += 1) {
            const opacity = gsap.getProperty(cards[j], "opacity");
            const scale = gsap.getProperty(cards[j], "scale");

            if (j === activeIdx) {
              if (!approxEqual(opacity, 1)) {
                throw new Error(
                  `Active card ${j} had opacity ${opacity}; expected 1 ` +
                    `(activeIdx=${activeIdx}).`
                );
              }
              if (!approxEqual(scale, 1)) {
                throw new Error(
                  `Active card ${j} had scale ${scale}; expected 1 ` +
                    `(activeIdx=${activeIdx}).`
                );
              }
            } else {
              if (!approxEqual(opacity, 0.3)) {
                throw new Error(
                  `Inactive card ${j} had opacity ${opacity}; ` +
                    `expected 0.3 (activeIdx=${activeIdx}).`
                );
              }
              if (!approxEqual(scale, 0.95)) {
                throw new Error(
                  `Inactive card ${j} had scale ${scale}; ` +
                    `expected 0.95 (activeIdx=${activeIdx}).`
                );
              }
            }
          }

          // ---- Border state --------------------------------------------------
          for (let j = 0; j < borders.length; j += 1) {
            const scaleY = gsap.getProperty(borders[j], "scaleY");
            if (j === activeIdx) {
              if (!approxEqual(scaleY, 1)) {
                throw new Error(
                  `Active border ${j} had scaleY ${scaleY}; expected 1 ` +
                    `(the 0 → 1 animation terminal state, ` +
                    `activeIdx=${activeIdx}).`
                );
              }
            } else if (!approxEqual(scaleY, 0)) {
              throw new Error(
                `Inactive border ${j} had scaleY ${scaleY}; ` +
                  `expected 0 (activeIdx=${activeIdx}).`
              );
            }
          }

          return true;
        } finally {
          if (utils) utils.unmount();
          cleanup();
          timelineSpy.mockRestore();
          restoreMatchMedia();
        }
      }),
      { numRuns: 30 }
    );
  });
});
