/**
 * Property-based test — Cursor position and hover state-machine correctness.
 *
 * Feature: e1-editorial-ui-overhaul, Property 9
 *
 * For any finite sequence of pointer events `e_1, e_2, …, e_n` — each being
 * either a `pointermove(x, y)` or a `pointerover` / `pointerout` over an
 * element whose `closest('a, button, [data-cursor-hover]')` is either a
 * matching target or `null` — after dispatching the sequence to a mounted
 * `<Cursor>`:
 *
 *   - The dot's final translation SHALL equal the `(x, y)` of the last
 *     `pointermove` event (or `(0, 0)` if no `pointermove` occurred, which
 *     is the initial translation written by the mount-phase
 *     `gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50, x: 0, y: 0 })`).
 *   - The dot's scale SHALL equal `2.5` if and only if the last
 *     hover-affecting event was a `pointerover` over a matching target;
 *     otherwise it SHALL equal `1` (either the initial scale, or the
 *     scale left by the most recent `pointerout` over a matching target).
 *
 * Strategy
 * --------
 * jsdom does not run the GSAP ticker, so we cannot read the dot's final
 * transform from its computed style. Instead we spy on `gsap.set` and
 * `gsap.to` from the shared runtime singleton (`src/lib/gsap.js`, which
 * `<Cursor>` imports from `@/lib/gsap`). Every translation / scale write
 * the component issues flows through one of those two calls, so the
 * sequence of spy invocations is a faithful transcript of the component's
 * intent.
 *
 *   - `gsap.set(dotEl, { x, y })`                     — issued on every
 *     `pointermove` (no easing; applies immediately).
 *   - `gsap.set([dotEl, ringEl], { xPercent: -50,     — issued once at mount.
 *                                   yPercent: -50,
 *                                   x: 0, y: 0 })`
 *   - `gsap.to(dotEl, { scale: 2.5, backgroundColor, — issued when the
 *                       duration: 0.2, ... })`          pointer enters a
 *                                                      hoverable target.
 *   - `gsap.to(dotEl, { scale: 1, backgroundColor,   — issued when the
 *                       duration: 0.2, ... })`          pointer leaves a
 *                                                      hoverable target.
 *
 * We derive the expected final `(x, y)` from the last `move` event in the
 * sequence (or `(0, 0)` if there were none) and the expected final scale
 * from the last hover-affecting event that targeted a matching element
 * (defaulting to `1`). We then assert that the last recorded
 * translation-affecting `gsap.set` call on `dotEl` carries those `(x, y)`
 * values, and that the last scale-affecting `gsap.to` call on `dotEl`
 * carries that scale — or, when the expected scale is `1` and no hover
 * tween fired, that the initial `gsap.set`-written scale of `1` still
 * stands (no scale-affecting `gsap.to` call was recorded).
 *
 * The test mocks `window.matchMedia` so every mount gate passes
 * (`(pointer: fine) and (hover: hover)` matches, reduced motion does not)
 * and sets the `e1.cursor.custom` localStorage key to `"on"` so the
 * preference gate also passes. Under this environment `<Cursor>` always
 * mounts and its pointer / hover listeners are attached.
 *
 * Validates: Requirements 8.3, 8.4, 8.5, 8.6
 */
import React from "react";
import fc from "fast-check";
import { cleanup, render } from "@testing-library/react";

// Silence the ESM-only GSAP plugin sub-paths so `require('../../lib/gsap')`
// can evaluate the runtime-singleton side effects without Jest tripping
// over the plugin files shipped as ES modules in gsap@3.x. The runtime
// singleton (`src/lib/gsap.js`) only calls `ScrollTrigger.defaults(...)`
// and `ScrollTrigger.config(...)` during first-import side effects, so a
// stub with those two no-op methods is sufficient; every other plugin is
// replaced with an empty object because `registerPlugin` only uses them
// for identity lookup.
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

// eslint-disable-next-line import/first
import { gsap } from "../../lib/gsap";
// eslint-disable-next-line import/first
import { CURSOR_KEY } from "../../lib/useCursorPreference";
// eslint-disable-next-line import/first
import Cursor from "../Cursor";

// ---------------------------------------------------------------------------
// matchMedia harness — satisfies every mount gate Cursor consults.
// ---------------------------------------------------------------------------

function installMatchMedia() {
  window.matchMedia = (query) => {
    // Cursor mounts iff pointerFine && !reducedMotion && preference === "on".
    let matches = false;
    if (query === "(pointer: fine) and (hover: hover)") matches = true;
    else if (query === "(prefers-reduced-motion: reduce)") matches = false;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    };
  };
}

// ---------------------------------------------------------------------------
// Event dispatch helpers — use plain `Event` + expando properties so the
// test does not depend on jsdom's `PointerEvent` polyfill (which is not
// uniformly implemented across jsdom versions).
// ---------------------------------------------------------------------------

function dispatchPointerMove(clientX, clientY) {
  const ev = new Event("pointermove", { bubbles: true, cancelable: true });
  Object.assign(ev, { clientX, clientY });
  window.dispatchEvent(ev);
}

function dispatchPointerOver(el) {
  const ev = new Event("pointerover", { bubbles: true, cancelable: true });
  // relatedTarget is left `null` so Cursor's `from === target` sibling
  // check always decides "fire the tween" on every enter event.
  Object.assign(ev, { relatedTarget: null });
  el.dispatchEvent(ev);
}

function dispatchPointerOut(el) {
  const ev = new Event("pointerout", { bubbles: true, cancelable: true });
  Object.assign(ev, { relatedTarget: null });
  el.dispatchEvent(ev);
}

// ---------------------------------------------------------------------------
// Arbitraries (from the task spec).
// ---------------------------------------------------------------------------

const moveEventArb = fc.record({
  type: fc.constant("move"),
  x: fc.integer({ min: 0, max: 1920 }),
  y: fc.integer({ min: 0, max: 1080 }),
});

const hoverEventArb = fc.record({
  type: fc.constantFrom("over", "out"),
  onTarget: fc.boolean(),
});

// ---------------------------------------------------------------------------
// Spy-history inspection helpers.
// ---------------------------------------------------------------------------

/**
 * A `gsap.set` call targets `dotEl` when the call's first argument is
 * either the dot element itself, or an array that contains it (the mount
 * routine writes translation defaults with `gsap.set([dotEl, ringEl], …)`).
 */
function setCallTargetsDot(call, dotEl) {
  const target = call[0];
  if (target === dotEl) return true;
  if (Array.isArray(target) && target.includes(dotEl)) return true;
  return false;
}

/**
 * A `gsap.set` or `gsap.to` call carries translation information when its
 * vars object defines numeric `x` and `y` properties.
 */
function callCarriesXY(call) {
  const vars = call[1];
  return (
    vars &&
    typeof vars.x === "number" &&
    typeof vars.y === "number"
  );
}

/**
 * A `gsap.to` call carries scale information when its vars object defines
 * a numeric `scale` property.
 */
function callCarriesScale(call) {
  const vars = call[1];
  return vars && typeof vars.scale === "number";
}

// ---------------------------------------------------------------------------
// Property 9
// ---------------------------------------------------------------------------

describe("Cursor — Property 9: position and hover state-machine correctness", () => {
  let originalMatchMedia;
  let setSpy;
  let toSpy;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    installMatchMedia();
    window.localStorage.setItem(CURSOR_KEY, "on");

    // `gsap.set` writes to the DOM synchronously; leaving the original
    // implementation in place lets useGSAP's scoped context behave normally
    // while the spy records every call.
    setSpy = jest.spyOn(gsap, "set");
    // `gsap.to` creates real tweens that would run on the (non-existent)
    // jsdom ticker. Replace with a minimal tween-like stub so the
    // component never inspects a real animation instance.
    toSpy = jest.spyOn(gsap, "to").mockImplementation(() => ({ kill() {} }));
  });

  afterEach(() => {
    cleanup();
    setSpy.mockRestore();
    toSpy.mockRestore();
    window.matchMedia = originalMatchMedia;
    window.localStorage.clear();
  });

  /**
   * Property 9 — Cursor position and hover state-machine correctness.
   *
   * Feature: e1-editorial-ui-overhaul, Property 9
   *
   * For every sequence drawn from
   * `fc.array(fc.oneof(moveEventArb, hoverEventArb))`:
   *
   *   - Mount `<Cursor>` under a fully-passing gate environment and render
   *     a hoverable `<a data-testid="hoverable">` and a non-hoverable
   *     `<div data-testid="plain">` alongside it.
   *   - Dispatch each event in order, routing `move` events to `window` and
   *     hover events to the anchor (when `onTarget` is true) or the plain
   *     div (when `onTarget` is false).
   *   - Derive the expected final `(x, y)` as the last `move` event's
   *     coordinates (or `(0, 0)` when no `move` occurred) and the expected
   *     final scale as `2.5` iff the last hover-affecting event was a
   *     `pointerover` over a matching target (otherwise `1`).
   *   - Assert that the last translation-affecting `gsap.set` call on the
   *     dot element carries `{ x: expectedX, y: expectedY }`.
   *   - Assert that the last scale-affecting `gsap.to` call on the dot
   *     element carries `{ scale: expectedScale }`, or — when the expected
   *     scale is `1` and no scale-affecting `gsap.to` call was issued —
   *     that the initial `gsap.set`-written scale of `1` still stands.
   *
   * Validates: Requirements 8.3, 8.4, 8.5, 8.6
   */
  it("dot translation equals the last pointermove coords; dot scale is 2.5 iff the last hover-affecting event targeted a matching element", () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(moveEventArb, hoverEventArb), {
          minLength: 0,
          maxLength: 20,
        }),
        (events) => {
          setSpy.mockClear();
          toSpy.mockClear();

          const { getByTestId, unmount } = render(
            <div>
              <Cursor />
              <a data-testid="hoverable" href="#e1-cursor-test">
                hoverable
              </a>
              <div data-testid="plain">plain</div>
            </div>
          );

          const dotEl = getByTestId("e1-cursor-dot");
          const hoverable = getByTestId("hoverable");
          const plain = getByTestId("plain");

          // Derive the expected end-state in lockstep with dispatch so we
          // only update expectations for events that the component would
          // actually act on (hover events with `onTarget === false`
          // trigger no tween because `closest(HOVER_SELECTOR)` returns
          // null inside the component's handlers).
          let expectedX = 0;
          let expectedY = 0;
          let expectedScale = 1;

          for (const e of events) {
            if (e.type === "move") {
              expectedX = e.x;
              expectedY = e.y;
              dispatchPointerMove(e.x, e.y);
            } else if (e.type === "over") {
              if (e.onTarget) {
                expectedScale = 2.5;
                dispatchPointerOver(hoverable);
              } else {
                dispatchPointerOver(plain);
              }
            } else if (e.type === "out") {
              if (e.onTarget) {
                expectedScale = 1;
                dispatchPointerOut(hoverable);
              } else {
                dispatchPointerOut(plain);
              }
            }
          }

          // ---- Translation assertion --------------------------------
          // The last `gsap.set` call whose target includes dotEl and
          // whose vars carry `(x, y)` encodes the final translation.
          // Under every valid sequence there is always at least one such
          // call, because the mount routine issues
          // `gsap.set([dotEl, ringEl], { …, x: 0, y: 0 })` even before
          // any pointermove event fires.
          const translationCalls = setSpy.mock.calls.filter(
            (call) => setCallTargetsDot(call, dotEl) && callCarriesXY(call)
          );
          expect(translationCalls.length).toBeGreaterThanOrEqual(1);
          const lastTranslationVars =
            translationCalls[translationCalls.length - 1][1];
          expect(lastTranslationVars.x).toBe(expectedX);
          expect(lastTranslationVars.y).toBe(expectedY);

          // ---- Scale assertion --------------------------------------
          // Every scale transition the component performs goes through
          // `gsap.to(dotEl, { scale: 2.5 | 1, … })`. If no such call was
          // recorded, the dot's scale is whatever the mount-phase
          // `gsap.set(dotEl, { scale: 1, backgroundColor })` wrote — i.e.
          // `1`.
          const scaleCalls = toSpy.mock.calls.filter(
            (call) => call[0] === dotEl && callCarriesScale(call)
          );
          if (scaleCalls.length === 0) {
            expect(expectedScale).toBe(1);
          } else {
            const lastScaleVars = scaleCalls[scaleCalls.length - 1][1];
            expect(lastScaleVars.scale).toBe(expectedScale);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
