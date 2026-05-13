/**
 * Property-based tests for the `useRevealBatch` hook.
 *
 * Feature: e1-editorial-ui-overhaul, Property 13
 *
 * Strategy note: jsdom does not implement layout or real scroll semantics,
 * so a genuine `ScrollTrigger.update()` cannot drive the batch `onEnter`
 * callback here. We therefore test the *wiring* the hook declares - i.e.
 * the exact contract the design document assigns to Property 13:
 *
 *   - For `K` `.gs-reveal` descendants of the scope, `ScrollTrigger.batch`
 *     is called with all `K` elements, `start: "top 85%"`, and
 *     `once: true` (the single-shot flag that guarantees a second scroll
 *     does not re-run the reveal tween, per Requirement 7.3).
 *   - Invoking the captured `onEnter` callback with the batch tweens every
 *     element to the identity target
 *     `{ opacity: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.15,
 *        ease: "power3.out" }` (Requirement 7.2).
 *   - When `K === 0`, the hook short-circuits and no `ScrollTrigger.batch`
 *     or `gsap.to` call is made (Requirement 12.1 vacuous case).
 *
 * The `once: true` option is the framework-level guarantee of
 * single-shot semantics; a second ScrollTrigger update within the same
 * route lifetime cannot re-invoke `onEnter`. Asserting `once: true` is
 * present on the batch options therefore validates the second-scroll
 * clause of Property 13 without requiring a live ScrollTrigger.
 *
 * Validates: Requirements 12.1, 12.2, 12.3
 */

/* eslint-disable global-require */

jest.mock("../gsap", () => ({
  __esModule: true,
  gsap: {
    set: jest.fn(),
    to: jest.fn(),
    matchMedia: jest.fn(),
  },
  ScrollTrigger: {
    batch: jest.fn(),
  },
}));

jest.mock("@gsap/react", () => ({
  __esModule: true,
  useGSAP: (fn, opts) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require("react");
    const deps =
      opts && Array.isArray(opts.dependencies) ? opts.dependencies : [];
    React.useEffect(() => {
      fn();
      // No context-revert is needed for these spy-based wiring assertions.
    }, deps);
  },
}));

import React, { useRef } from "react";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import fc from "fast-check";

import { gsap, ScrollTrigger } from "../gsap";
import { useRevealBatch } from "../useRevealBatch";

/**
 * Test harness that renders `K` `.gs-reveal` nodes under a single scope
 * ref and wires the hook under test.
 */
function Harness({ count }) {
  const ref = useRef(null);
  useRevealBatch(ref);
  return (
    <div ref={ref} data-testid="scope">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="gs-reveal" data-testid="reveal-item" />
      ))}
    </div>
  );
}

describe("useRevealBatch — Property 13: Reveal Batch convergence to identity", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    gsap.set.mockReset();
    gsap.to.mockReset();
    gsap.matchMedia.mockReset();
    ScrollTrigger.batch.mockReset();

    // Drive `gsap.matchMedia()` to invoke only the handler whose query
    // matches the mocked `window.matchMedia`.
    gsap.matchMedia.mockImplementation(() => ({
      add: (query, fn) => {
        if (window.matchMedia(query).matches) {
          fn();
        }
      },
    }));

    // Full-motion profile: only `(prefers-reduced-motion: no-preference)`
    // matches. Requirement 12.2 (identity-target tween) belongs to this
    // branch; the reduced-motion branch is out of scope for Property 13.
    window.matchMedia = jest.fn((query) => ({
      matches: query === "(prefers-reduced-motion: no-preference)",
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
  });

  /**
   * Property 13 — Reveal Batch convergence to identity.
   *
   * Feature: e1-editorial-ui-overhaul, Property 13
   *
   * For every `K ∈ [0, 20]`, rendering `K` `.gs-reveal` nodes under a
   * scoped ref SHALL:
   *
   *   1. When `K === 0`, make no `ScrollTrigger.batch` / `gsap.to` calls
   *      (hook short-circuits on an empty selection).
   *   2. When `K > 0`, register exactly one `ScrollTrigger.batch` for the
   *      no-preference branch, with all `K` elements, `start: "top 85%"`,
   *      and `once: true`.
   *   3. When the captured `onEnter` is invoked with the batch, fire one
   *      `gsap.to` call targeting the batch with identity vars
   *      `{ opacity: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.15,
   *         ease: "power3.out" }`.
   *   4. The `once: true` flag on the registered batch guarantees a
   *      second simulated ScrollTrigger update cannot re-run the reveal
   *      tween within the same route lifetime.
   *
   * Validates: Requirements 12.1, 12.2, 12.3
   */
  it("wires batch(start:'top 85%', once:true) for K elements and onEnter tweens to identity; K=0 short-circuits", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (K) => {
        gsap.to.mockClear();
        ScrollTrigger.batch.mockClear();

        const { container, unmount } = render(
          <MemoryRouter>
            <Harness count={K} />
          </MemoryRouter>
        );

        // Sanity: the harness rendered the requested number of nodes.
        const revealNodes = container.querySelectorAll(".gs-reveal");
        expect(revealNodes.length).toBe(K);

        if (K === 0) {
          // Requirement 12.1 vacuous case: no selection → no wiring.
          expect(ScrollTrigger.batch).not.toHaveBeenCalled();
          expect(gsap.to).not.toHaveBeenCalled();
          unmount();
          return;
        }

        // --- Wiring assertions (Requirements 12.1, 12.3) ----------------
        // Exactly one batch registration for the active (no-preference)
        // branch. The reduced-motion branch never runs because
        // `window.matchMedia("(prefers-reduced-motion: reduce)").matches`
        // is `false` in this profile.
        expect(ScrollTrigger.batch).toHaveBeenCalledTimes(1);

        const [elsArg, optsArg] = ScrollTrigger.batch.mock.calls[0];

        // All `K` `.gs-reveal` nodes are passed to the batch.
        const elsArray = Array.from(elsArg);
        expect(elsArray).toHaveLength(K);
        elsArray.forEach((el) => {
          expect(el.classList.contains("gs-reveal")).toBe(true);
        });

        // Trigger start and single-shot flag are exactly as specified.
        expect(optsArg.start).toBe("top 85%");
        expect(optsArg.once).toBe(true);
        expect(typeof optsArg.onEnter).toBe("function");

        // --- Identity-tween assertion (Requirement 12.2) ----------------
        // No tween has fired yet - `onEnter` has not been invoked.
        expect(gsap.to).not.toHaveBeenCalled();

        // Simulate the ScrollTrigger boundary crossing by invoking
        // `onEnter` with the full batch.
        optsArg.onEnter(elsArray);

        expect(gsap.to).toHaveBeenCalledTimes(1);
        const [tweenTargets, tweenVars] = gsap.to.mock.calls[0];
        expect(Array.from(tweenTargets)).toEqual(elsArray);
        expect(tweenVars).toEqual({
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: "power3.out",
        });

        // --- Second-scroll single-shot assertion (Requirement 12.3) -----
        // The `once: true` flag is the framework-level contract that the
        // batch fires `onEnter` at most once per element per lifetime.
        // Re-issuing a ScrollTrigger update within the same route cannot
        // register a second batch or call `onEnter` again. We assert the
        // registration is still exactly one - no additional
        // `ScrollTrigger.batch` call has been made during this render.
        expect(ScrollTrigger.batch).toHaveBeenCalledTimes(1);

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
