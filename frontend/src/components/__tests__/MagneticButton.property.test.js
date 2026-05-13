/**
 * Property-based tests for `<MagneticButton>` translation and environment
 * gating.
 *
 * The MagneticButton samples its capability gate exactly once on mount via a
 * `useState(() => isPointerFineHover() && !prefersReducedMotion())`
 * initializer (see `frontend/src/components/MagneticButton.js`). When both
 * gates pass, a window-level `pointermove` listener tweens the button to
 * `{ x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: "power2.out",
 * overwrite: "auto" }` (Requirement 11.2) for every sample inside the 60 px
 * inflated rect, and a button-level `pointerleave` listener springs the
 * button back to `{ x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }`
 * (Requirement 11.3). When either gate fails (coarse pointer, no hover,
 * reduced motion) the fallback branch attaches no listeners and fires no
 * tweens (Requirements 11.4, 11.5, 11.6).
 *
 * Strategy:
 *   - Stub the five `gsap/<Plugin>` sub-paths so the CRA/Jest runtime does
 *     not try to parse their ESM source (same pattern used by
 *     `Cursor.gating.property.test.js` and `gsapCleanup.property.test.js`).
 *   - Mock `window.matchMedia` per sample so the motion.js gate probes
 *     return the sample's `pointerFine` / `reducedMotion` values during
 *     the component's `useState` initializer.
 *   - Stub `getBoundingClientRect` on the rendered button so the pointer
 *     at `(120 + dx, 120 + dy)` is guaranteed to sit inside the 60 px
 *     inflated rect (`[40, 200] × [40, 200]`) for every sample.
 *   - `jest.spyOn(gsap, "to")` to capture translation and spring-back
 *     calls without actually running the tweens.
 *
 * Feature: e1-editorial-ui-overhaul, Property 12
 *
 * Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6
 */
import React from "react";
import fc from "fast-check";
import { render, cleanup } from "@testing-library/react";

// The `gsap/<Plugin>` sub-paths ship as ESM that Jest's default transform
// (inherited from react-scripts) refuses to parse because the default
// `transformIgnorePatterns` skips `node_modules`. Stub the registration
// surface with minimal shapes so the runtime singleton at `src/lib/gsap.js`
// loads cleanly under Jest without affecting the real `gsap` export we
// spy on below.
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
import { gsap } from "../../lib/gsap";
import {
  POINTER_FINE_QUERY,
  REDUCED_MOTION_QUERY,
} from "../../lib/motion";
import MagneticButton from "../MagneticButton";

// ---------------------------------------------------------------------------
// Fixed bounding-rect constants
// ---------------------------------------------------------------------------

/**
 * Button bounding rect for every sample. Centre = (120, 120). The 60 px
 * inflation around this rect covers `[40, 200] × [40, 200]`, so any
 * `(clientX, clientY) = (120 + dx, 120 + dy)` with `dx, dy ∈ [-30, 30]`
 * is strictly inside the inflated rect and the "inside" branch of
 * `onPointerMove` fires.
 */
const BUTTON_RECT = Object.freeze({
  left: 100,
  top: 100,
  right: 140,
  bottom: 140,
  width: 40,
  height: 40,
  x: 100,
  y: 100,
});

const CENTRE_X = BUTTON_RECT.left + BUTTON_RECT.width / 2; // 120
const CENTRE_Y = BUTTON_RECT.top + BUTTON_RECT.height / 2; // 120

// ---------------------------------------------------------------------------
// matchMedia factory
// ---------------------------------------------------------------------------

/**
 * Build a deterministic `window.matchMedia` whose `matches` value for the
 * two queries the MagneticButton gate probes reflects the generated
 * environment. Any other query string is treated as `matches: false` so
 * no stray probe slips past the gate.
 */
function makeMatchMedia({ pointerFine, reducedMotion }) {
  return (query) => {
    let matches = false;
    if (query === POINTER_FINE_QUERY) matches = pointerFine;
    else if (query === REDUCED_MOTION_QUERY) matches = reducedMotion;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  };
}

// ---------------------------------------------------------------------------
// Event dispatch helpers
// ---------------------------------------------------------------------------

/**
 * Dispatch a `pointermove` at `(clientX, clientY)` on `window`. The
 * MagneticButton handler only reads `event.clientX` / `event.clientY`,
 * so a bare `Event` with those expando properties is sufficient and
 * avoids relying on jsdom's PointerEvent polyfill.
 */
function dispatchPointerMove(clientX, clientY) {
  const event = new Event("pointermove", { bubbles: true, cancelable: true });
  Object.assign(event, { clientX, clientY });
  window.dispatchEvent(event);
}

/**
 * Dispatch a `pointerleave` on the given element. MagneticButton's
 * leave handler does not inspect the event payload.
 */
function dispatchPointerLeave(el) {
  const event = new Event("pointerleave", { bubbles: false, cancelable: true });
  el.dispatchEvent(event);
}

// ---------------------------------------------------------------------------
// Property 12
// ---------------------------------------------------------------------------

describe("<MagneticButton> — Property 12: translation and environment gating", () => {
  /**
   * Property 12 — Translation, gating, and spring-back.
   *
   * Feature: e1-editorial-ui-overhaul, Property 12
   *
   * For every `(dx, dy, pointerFine, reducedMotion)` drawn from
   * `fc.record({ dx: fc.integer({min:-30,max:30}),
   *              dy: fc.integer({min:-30,max:30}),
   *              pointerFine: fc.boolean(),
   *              reducedMotion: fc.boolean() })`:
   *
   *   - Render `<MagneticButton>` under a matchMedia stub configured to
   *     the sample's gate values, then stub `getBoundingClientRect` so
   *     the button occupies a fixed 40 × 40 rect centred at (120, 120).
   *
   *   - Dispatch one `pointermove` on `window` at
   *     `(120 + dx, 120 + dy)` — always inside the 60 px inflated rect.
   *
   *     * If `pointerFine && !reducedMotion`, exactly one `gsap.to`
   *       call fires against the button with the documented
   *       translation vars `{ x: dx * 0.35, y: dy * 0.35, duration: 0.4,
   *       ease: "power2.out", overwrite: "auto" }` (Requirement 11.2).
   *
   *     * Otherwise, no `gsap.to` call fires — the fallback branch
   *       attaches no listeners (Requirements 11.4, 11.5, 11.6).
   *
   *   - Dispatch `pointerleave` on the button.
   *
   *     * If `pointerFine && !reducedMotion`, the previous pointermove
   *       set `insideBox = true`, so the handler emits exactly one
   *       additional `gsap.to` with the spring-back vars
   *       `{ x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }`
   *       (Requirement 11.3).
   *
   *     * Otherwise, no additional `gsap.to` call fires — the
   *       `pointerleave` listener was never attached under the fallback
   *       branch (Requirements 11.5, 11.6).
   *
   * Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6
   */
  it("tweens x/y only when both gates pass and otherwise emits no gsap.to; pointerleave produces the documented spring-back vars", () => {
    const originalMatchMedia = window.matchMedia;
    // Spy on gsap.to for the whole property run. `mockImplementation`
    // returns a minimal tween-like object because the component never
    // inspects the return value of its `gsap.to` calls.
    const gsapToSpy = jest
      .spyOn(gsap, "to")
      .mockImplementation(() => ({ kill() {} }));

    try {
      fc.assert(
        fc.property(
          fc.record({
            dx: fc.integer({ min: -30, max: 30 }),
            dy: fc.integer({ min: -30, max: 30 }),
            pointerFine: fc.boolean(),
            reducedMotion: fc.boolean(),
          }),
          ({ dx, dy, pointerFine, reducedMotion }) => {
            // Reset observable state per sample.
            cleanup();
            gsapToSpy.mockClear();

            Object.defineProperty(window, "matchMedia", {
              writable: true,
              configurable: true,
              value: makeMatchMedia({ pointerFine, reducedMotion }),
            });

            // Fresh mount per sample — MagneticButton samples the gate
            // only during its `useState` initializer, so gate changes
            // require a remount to take effect.
            const { getByTestId } = render(
              <MagneticButton data-testid="magbtn">Click</MagneticButton>
            );
            const btn = getByTestId("magbtn");
            btn.getBoundingClientRect = () => BUTTON_RECT;

            const enabled = pointerFine && !reducedMotion;

            // ---- pointermove inside the inflated rect -----------------
            dispatchPointerMove(CENTRE_X + dx, CENTRE_Y + dy);

            if (enabled) {
              expect(gsapToSpy).toHaveBeenCalledTimes(1);
              const [target, vars] = gsapToSpy.mock.calls[0];
              expect(target).toBe(btn);
              expect(vars).toEqual(
                expect.objectContaining({
                  x: dx * 0.35,
                  y: dy * 0.35,
                  duration: 0.4,
                  ease: "power2.out",
                  overwrite: "auto",
                })
              );
            } else {
              expect(gsapToSpy).not.toHaveBeenCalled();
            }

            // ---- pointerleave on the button ---------------------------
            const callsBeforeLeave = gsapToSpy.mock.calls.length;
            dispatchPointerLeave(btn);

            if (enabled) {
              expect(gsapToSpy).toHaveBeenCalledTimes(callsBeforeLeave + 1);
              const [target, vars] =
                gsapToSpy.mock.calls[gsapToSpy.mock.calls.length - 1];
              expect(target).toBe(btn);
              expect(vars).toEqual(
                expect.objectContaining({
                  x: 0,
                  y: 0,
                  duration: 0.7,
                  ease: "elastic.out(1, 0.4)",
                })
              );
            } else {
              expect(gsapToSpy).toHaveBeenCalledTimes(callsBeforeLeave);
            }
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      cleanup();
      gsapToSpy.mockRestore();
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });
});
