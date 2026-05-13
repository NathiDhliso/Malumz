/**
 * Property-based tests for the `<Marquee>` seamless-loop wrap invariant.
 *
 * The Marquee tween drives `track.x` with a `modifiers.x` callback that
 * delegates to `gsap.utils.wrap(-trackWidth, 0, x)` (see
 * `frontend/src/components/Marquee.js`). The wrap function is the
 * mathematical source of the "seamless loop": for any real `x` it must
 * return a value in the half-open interval `[-trackWidth, 0)`, and the
 * wrap must be exactly periodic with period `trackWidth`.
 *
 * These tests pin down that invariant directly against `gsap.utils.wrap`
 * from the runtime singleton (`src/lib/gsap.js`) so the property-based
 * check exercises the actual mapping used by the component rather than a
 * re-implementation. Plugin sub-paths (`gsap/ScrollTrigger`,
 * `gsap/SplitText`, `gsap/DrawSVGPlugin`, `gsap/Flip`, `gsap/MorphSVGPlugin`)
 * ship as ESM and are not parseable by the CRA/Jest runtime out of the
 * box, so the test mocks each plugin with a stub object whose
 * `registerPlugin`-required surface is satisfied. This preserves the
 * "gsap.utils.wrap from the runtime singleton" contract without dragging
 * in the plugins' ESM transitive dependencies.
 *
 * Feature: e1-editorial-ui-overhaul, Property 11
 *
 * Validates: Requirement 10.3
 */
import fc from "fast-check";

// Silence plugin-module ESM imports so `require('../../lib/gsap')` can
// evaluate the runtime-singleton side effects without Jest tripping over
// the ESM-only plugin files shipped by gsap@3.x.
const scrollTriggerStub = {
  defaults: () => {},
  config: () => {},
};
jest.mock("gsap/ScrollTrigger", () => ({
  __esModule: true,
  ScrollTrigger: scrollTriggerStub,
}));
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

// eslint-disable-next-line import/first, import/newline-after-import
const { gsap } = require("../../lib/gsap");

/**
 * Wrap `x` into `[-trackWidth, 0)` using the same call the Marquee
 * tween issues inside its `modifiers.x` callback.
 *
 * @param {number} trackWidth positive width of one copy of the track
 * @param {number} x arbitrary real-valued translation
 * @returns {number} wrapped translation in `[-trackWidth, 0)`
 */
const wrap = (trackWidth, x) => gsap.utils.wrap(-trackWidth, 0, x);

describe("Marquee — Property 11: seamless-loop wrap invariant", () => {
  /**
   * Property 11 — Wrap range and period.
   *
   * Feature: e1-editorial-ui-overhaul, Property 11
   *
   * For every `(trackWidth, x)` drawn from
   * `fc.tuple(fc.integer({min:100,max:5000}),
   *          fc.double({min:-100000,max:100000,noNaN:true,noDefaultInfinity:true}))`:
   *   - `wrap(trackWidth, x)` lies in `[-trackWidth, 0)` — i.e. it is
   *     at least `-trackWidth` and strictly less than `0`.
   *   - `wrap(trackWidth, x) === wrap(trackWidth, x + trackWidth)`
   *     within a float epsilon of `1e-9`.
   *
   * Validates: Requirement 10.3
   */
  it("wraps any x into [-trackWidth, 0) and is periodic with period trackWidth", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 100, max: 5000 }),
          fc.double({
            min: -100000,
            max: 100000,
            noNaN: true,
            noDefaultInfinity: true,
          })
        ),
        ([trackWidth, x]) => {
          const wrapped = wrap(trackWidth, x);

          // Range: wrap output lies in the half-open interval
          // [-trackWidth, 0).
          expect(wrapped).toBeGreaterThanOrEqual(-trackWidth);
          expect(wrapped).toBeLessThan(0);

          // Periodicity: shifting the input by a full track width
          // produces the same wrapped output (within float epsilon).
          const wrappedShifted = wrap(trackWidth, x + trackWidth);
          expect(Math.abs(wrapped - wrappedShifted)).toBeLessThanOrEqual(1e-9);
        }
      ),
      { numRuns: 100 }
    );
  });
});
