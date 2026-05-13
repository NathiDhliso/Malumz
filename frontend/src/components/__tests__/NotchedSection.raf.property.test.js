/**
 * Property-based test for the `<NotchedSection>` SVG fallback's
 * `requestAnimationFrame`-throttled write discipline.
 *
 * Feature: e1-editorial-ui-overhaul, Property 8: NotchedSection rAF-throttled
 * write discipline.
 *
 * For any positive integer `N ≤ 50` and any burst of `N` simulated
 * `ResizeObserver` callbacks fired within a single animation frame, the
 * count of DOM writes to the fallback clipPath `<path>` element's `d`
 * attribute SHALL be at most `1` after that frame flushes. The component
 * achieves this by coalescing every observer callback into a single
 * pending `d` value, scheduling one `requestAnimationFrame` with a
 * "already pending" guard, and dropping the write entirely when the
 * coalesced `d` equals the last one committed.
 *
 * The test substitutes manual mocks for `window.ResizeObserver` and
 * `window.requestAnimationFrame` so the burst can be fired synchronously
 * within a deterministic "frame" window and the single drain step is
 * under the test's control.
 *
 * Validates: Requirement 7.9
 */
import React from "react";
import { render, cleanup } from "@testing-library/react";
import fc from "fast-check";
import NotchedSection from "../NotchedSection";

describe("NotchedSection — Property 8: rAF-throttled write discipline", () => {
  /** @type {Array<{ cb: Function, fire: (entries?: any[]) => void }>} */
  let observers;
  /** @type {Array<((t: number) => void) | null>} */
  let rafQueue;
  let originalRO;
  let originalRAF;
  let originalCAF;

  beforeEach(() => {
    observers = [];
    rafQueue = [];

    originalRO = window.ResizeObserver;
    originalRAF = window.requestAnimationFrame;
    originalCAF = window.cancelAnimationFrame;

    // Manual ResizeObserver mock. Each instance exposes a `fire()` method
    // so the test can drive the observer callback synchronously.
    class MockResizeObserver {
      constructor(cb) {
        this.cb = cb;
        observers.push(this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      fire(entries = []) {
        this.cb(entries, this);
      }
    }
    window.ResizeObserver = MockResizeObserver;
    global.ResizeObserver = MockResizeObserver;

    // Manual rAF queue. `requestAnimationFrame` returns a 1-based positive
    // integer id; `cancelAnimationFrame` clears the slot so `drainRAF`
    // ignores it. This lets the component's cleanup path cancel its
    // pending frame without exploding, and lets the test count the number
    // of scheduled frames during a burst.
    window.requestAnimationFrame = (cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    };
    window.cancelAnimationFrame = (id) => {
      if (typeof id === "number" && id > 0 && id <= rafQueue.length) {
        rafQueue[id - 1] = null;
      }
    };
  });

  afterEach(() => {
    cleanup();
    window.ResizeObserver = originalRO;
    global.ResizeObserver = originalRO;
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
  });

  /** Drain every callback currently in the rAF queue exactly once. */
  const drainRAF = () => {
    const pending = rafQueue.splice(0);
    for (const cb of pending) {
      if (typeof cb === "function") cb(performance.now());
    }
  };

  /**
   * Property 8 — at most one DOM write to the fallback clipPath `d`
   * attribute per animation frame, regardless of how many
   * `ResizeObserver` callbacks fire within that frame.
   *
   * Feature: e1-editorial-ui-overhaul, Property 8
   *
   * Generator:
   *   fc.integer({ min: 1, max: 50 })
   *
   * For each `N`:
   *   1. Render `<NotchedSection force="svg">` so the SVG fallback
   *      installs its `ResizeObserver` + rAF pipeline.
   *   2. Stub `hostRef.getBoundingClientRect` to return a monotonically
   *      increasing width so every recomputed `d` string is distinct
   *      (the component short-circuits writes when `d` is unchanged).
   *   3. Wrap `<path>.setAttribute` with a counter scoped to the burst,
   *      so the initial synchronous useLayoutEffect write is excluded.
   *   4. Fire `N` `ResizeObserver` callbacks synchronously (single frame).
   *   5. Assert at most one pending `requestAnimationFrame` callback was
   *      scheduled across the burst.
   *   6. Drain the frame once and assert at most one `d` write landed in
   *      the DOM.
   *
   * Uses `numRuns: 50` per the design's guidance for properties that
   * integrate with jsdom mount / unmount (see design.md "Iteration count").
   *
   * Validates: Requirement 7.9
   */
  it("writes the fallback clipPath `d` attribute at most once per animation frame, for any burst size 1–50", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (N) => {
        observers.length = 0;
        rafQueue.length = 0;

        const { container, unmount } = render(
          <NotchedSection force="svg" data-testid="host">
            content
          </NotchedSection>
        );

        const host = container.firstChild;
        const pathEl = container.querySelector("path");
        expect(pathEl).not.toBeNull();
        expect(observers.length).toBe(1);

        // Stub getBoundingClientRect to yield a unique width on every call
        // after mount. The component calls this inside every `onResize`
        // via `computeD`, so each burst entry produces a distinct `d`
        // string — otherwise the component's "unchanged d" dedup would
        // make the property trivially true.
        let callIndex = 0;
        host.getBoundingClientRect = () => {
          const width = 400 + callIndex++;
          return {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: width,
            bottom: 400,
            width,
            height: 400,
            toJSON: () => ({}),
          };
        };

        // Count writes to `d` only during the burst + drain phase. The
        // initial synchronous useLayoutEffect write already landed before
        // this spy was installed (and before our ResizeObserver mock
        // could be triggered), so it is intentionally excluded.
        let dWriteCount = 0;
        const originalSetAttribute = pathEl.setAttribute.bind(pathEl);
        pathEl.setAttribute = (name, value) => {
          if (name === "d") dWriteCount++;
          return originalSetAttribute(name, value);
        };

        // Reset any rAF frames left over from the initial mount so we
        // only count frames scheduled by the burst below.
        rafQueue.length = 0;

        // Fire N synchronous ResizeObserver callbacks within a single
        // animation frame (i.e., before the rAF queue is drained).
        const ro = observers[observers.length - 1];
        for (let i = 0; i < N; i++) {
          ro.fire([{ contentRect: { width: 401 + i, height: 400 } }]);
        }

        // Invariant 1: at most one rAF is pending across the whole burst,
        // regardless of N. The component's single-pending guard coalesces
        // every observer callback into one scheduled frame.
        const pendingFrames = rafQueue.filter((cb) => typeof cb === "function");
        expect(pendingFrames.length).toBeLessThanOrEqual(1);

        // Drain the frame exactly once.
        drainRAF();

        // Invariant 2 (the property under test): the frame drain performs
        // at most one DOM write to the fallback clipPath `d` attribute.
        expect(dWriteCount).toBeLessThanOrEqual(1);

        unmount();
        cleanup();
      }),
      { numRuns: 50 }
    );
  });
});
