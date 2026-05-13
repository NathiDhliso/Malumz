/**
 * Property-based test — pin-resize debounce of `useResizeRefreshDebounce`.
 *
 * Feature: e1-editorial-ui-overhaul, Property 19
 *
 * `<AppShell>` installs a single debounced `window.resize` listener via the
 * `useResizeRefreshDebounce` hook (see `src/lib/useResizeRefreshDebounce.js`)
 * that calls `ScrollTrigger.refresh()` exactly `ST.resizeRefreshDebounceMs`
 * (250 ms) after the last resize event, and at most once per burst.
 *
 * This property drives a burst of resize events with fake timers. The
 * generator emits an array of inter-event gaps, each in `[0, 240]` ms —
 * every gap is strictly below the 250 ms debounce window, so the next
 * resize always arrives before the in-flight timeout would fire. The
 * property asserts three facts in a single shot:
 *
 *   1. Throughout the burst, `ScrollTrigger.refresh()` is never called
 *      (every pending timeout is cancelled by the next event).
 *   2. `ST.resizeRefreshDebounceMs − 1` ms after the last resize,
 *      `refresh()` has still not been called.
 *   3. Exactly `ST.resizeRefreshDebounceMs` ms after the last resize,
 *      `refresh()` has been called exactly once.
 *
 * Together, (1) + (3) give the "at most once" bound, and (2) + (3) give
 * the "no later than 250 ms after the last resize" bound stipulated by
 * Requirement 22.3.
 *
 * ### Why `jest.useFakeTimers()` is safe here (unlike for GSAP tweens)
 *
 * The debounce uses vanilla `setTimeout` / `clearTimeout` captured at the
 * time `onResize` runs, so `jest.useFakeTimers()` can retroactively
 * replace the globals and `jest.advanceTimersByTime(ms)` drives the
 * debounce deterministically. This is in contrast to GSAP's ticker,
 * which captures `requestAnimationFrame` at module-load time and
 * therefore cannot be driven by fake timers (see the hand-driven ticker
 * harness in `PageTransition.property.test.js`).
 *
 * ### Why `gsap/ScrollTrigger` is mocked
 *
 * `gsap/ScrollTrigger` ships ESM that CRA's default Jest transform
 * cannot parse. The mock stub mirrors the surface consumed by the
 * runtime singleton at import time (`defaults`, `config`) and exposes
 * `refresh` as a `jest.fn()` so the property can assert call counts
 * directly. The other four plugins are never invoked by this test —
 * they are mocked as empty sentinels purely so `gsap.registerPlugin(...)`
 * in `src/lib/gsap.js` accepts them without importing ESM.
 *
 * Validates: Requirement 22.3
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// GSAP plugin mocks — hoisted by Jest ahead of the runtime-singleton require
// below. `refresh` is a `jest.fn()` so the property can clear and inspect
// call counts between iterations.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => ({
  __esModule: true,
  ScrollTrigger: {
    defaults: () => {},
    config: () => {},
    refresh: jest.fn(),
  },
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

const fc = require("fast-check");
const React = require("react");
const { cleanup, render } = require("@testing-library/react");

// Runtime singleton re-exports the mocked `ScrollTrigger`, so accessing
// `refresh` via `../lib/gsap` is identity-equal to accessing it via
// `gsap/ScrollTrigger`. Using the `@/lib/gsap` route keeps the test
// aligned with how `useResizeRefreshDebounce` itself imports the
// singleton (`./gsap`).
const { ScrollTrigger } = require("../lib/gsap");
const { ST } = require("../lib/motion");
const {
  useResizeRefreshDebounce,
} = require("../lib/useResizeRefreshDebounce");

/**
 * Minimal harness component — mounting it installs the debounced resize
 * listener and nothing else, so the property measures the hook in
 * isolation from the rest of the app shell.
 */
function Harness() {
  useResizeRefreshDebounce();
  return null;
}

describe("useResizeRefreshDebounce — Property 19: pin resize debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    ScrollTrigger.refresh.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  /**
   * Property 19 — Pin resize debounce.
   *
   * Feature: e1-editorial-ui-overhaul, Property 19
   *
   * For every `gaps` drawn from
   *   `fc.array(fc.integer({min:0,max:240}), {minLength:2,maxLength:20})`:
   *
   *   - Mount the `<Harness>` so the hook's effect attaches a single
   *     debounced `window.resize` listener.
   *   - For each `g` in `gaps`, advance the fake clock by `g` ms and
   *     dispatch a `resize` event on `window`. Each event schedules a
   *     fresh `setTimeout(refresh, 250 ms)` after cancelling the
   *     previous pending timeout (if any).
   *   - Because every `g ≤ 240 < 250`, the next event always arrives
   *     before the in-flight timeout would expire. Across the whole
   *     burst, `refresh()` is therefore never called — the "at most
   *     once" bound of Requirement 22.3 cannot be violated during
   *     the burst itself.
   *   - `ST.resizeRefreshDebounceMs − 1` ms after the last event,
   *     `refresh()` has still not been called — the debounce window
   *     has not elapsed.
   *   - At exactly `ST.resizeRefreshDebounceMs` ms after the last
   *     event, `refresh()` has been called exactly once — no later
   *     than 250 ms after the last resize.
   *
   * Validates: Requirement 22.3
   */
  it("fires ScrollTrigger.refresh at most once and no later than ST.resizeRefreshDebounceMs after the last resize", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 240 }), {
          minLength: 2,
          maxLength: 20,
        }),
        (gaps) => {
          ScrollTrigger.refresh.mockClear();

          const { unmount } = render(<Harness />);

          // Drive the burst — advance by the inter-event gap, then
          // dispatch a resize. The hook's listener runs synchronously
          // on dispatch, so by the next iteration the pending
          // `setTimeout` reflects the most-recent event only.
          for (let i = 0; i < gaps.length; i += 1) {
            jest.advanceTimersByTime(gaps[i]);
            window.dispatchEvent(new Event("resize"));
          }

          // (1) + (2): during the burst, every gap ≤ 240 < 250, so
          // the in-flight timeout is cancelled before it can fire.
          expect(ScrollTrigger.refresh).not.toHaveBeenCalled();

          // One millisecond shy of the debounce window after the
          // last event — refresh still not invoked.
          jest.advanceTimersByTime(ST.resizeRefreshDebounceMs - 1);
          expect(ScrollTrigger.refresh).not.toHaveBeenCalled();

          // Exactly 250 ms after the last event — refresh fires
          // exactly once, satisfying both the "at most once" and
          // the "no later than 250 ms after the last resize"
          // clauses of Requirement 22.3 simultaneously.
          jest.advanceTimersByTime(1);
          expect(ScrollTrigger.refresh).toHaveBeenCalledTimes(1);

          unmount();
          // Explicit per-iteration cleanup — `afterEach` only runs
          // between `it()` blocks, so without this the prior
          // iteration's listener would still be attached when the
          // next iteration's `Harness` mounts, and every dispatched
          // resize would reach both listeners.
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
