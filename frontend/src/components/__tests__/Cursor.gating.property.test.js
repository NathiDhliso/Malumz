/**
 * Property-based tests for the `<Cursor>` mount-gating truth table.
 *
 * The Cursor component is a four-input AND gate over:
 *   - the persisted cursor preference (`e1.cursor.custom === "on"`),
 *   - `matchMedia("(pointer: fine) and (hover: hover)")` matches,
 *   - `matchMedia("(prefers-reduced-motion: reduce)")` does NOT match.
 *
 * When every gate passes the component mounts the dot + ring sibling
 * `<div>`s and sets `document.documentElement.style.cursor = "none"`;
 * otherwise it renders `null` and leaves the root cursor style at
 * whatever value the host page had before render.
 *
 * These tests enumerate the full 2 × 2 × 2 × 2 truth table (16 rows,
 * driven via fast-check with `numRuns: 100` for shrinking coverage)
 * and assert render state + root-cursor state match the AND-gate.
 *
 * Feature: e1-editorial-ui-overhaul, Property 5
 *
 * Validates: Requirements 4.7, 6.4, 6.5, 6.6, 6.7
 */
import React from "react";
import fc from "fast-check";
import { render, cleanup } from "@testing-library/react";

// Silence plugin-module ESM imports triggered transitively by the
// Cursor component's `@/lib/gsap` import. The plugin sub-paths ship as
// ESM and are not parseable by the CRA/Jest runtime out of the box, so
// we satisfy the registration surface with stub objects. The stubs
// expose the narrow `ScrollTrigger.defaults` / `ScrollTrigger.config`
// surface the runtime singleton invokes on first import.
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
import Cursor from "../Cursor";
import {
  POINTER_FINE_QUERY,
  REDUCED_MOTION_QUERY,
} from "../../lib/motion";
import { CURSOR_KEY } from "../../lib/useCursorPreference";

/**
 * Build a `matchMedia` mock whose `matches` value is derived from the
 * four generated environment booleans. The mock also exposes the
 * modern (`addEventListener` / `removeEventListener`) and legacy
 * (`addListener` / `removeListener`) subscription APIs as no-ops so
 * the Cursor component's SSR-fallback matchMedia subscription effect
 * is satisfied without actually dispatching change events.
 *
 * @param {{ pointerFine: boolean, hoverHover: boolean, reducedMotion: boolean }} env
 * @returns {(query: string) => MediaQueryList}
 */
function makeMatchMedia({ pointerFine, hoverHover, reducedMotion }) {
  return (query) => {
    let matches;
    if (query === POINTER_FINE_QUERY) {
      matches = pointerFine && hoverHover;
    } else if (query === REDUCED_MOTION_QUERY) {
      matches = reducedMotion;
    } else {
      matches = false;
    }
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

describe("<Cursor> — Property 5: mount gating truth table", () => {
  /**
   * Property 5 — AND-gate over preference, pointer fineness, hover
   * capability, and reduced motion.
   *
   * Feature: e1-editorial-ui-overhaul, Property 5
   *
   * For every `{ pref, pointerFine, hoverHover, reducedMotion }`
   * drawn from
   *   `fc.record({
   *     pref: fc.constantFrom("on","off"),
   *     pointerFine: fc.boolean(),
   *     hoverHover: fc.boolean(),
   *     reducedMotion: fc.boolean(),
   *   })`
   * with `matchMedia` + localStorage mocked before render:
   *   - The dot (`[data-testid="e1-cursor-dot"]`) and ring
   *     (`[data-testid="e1-cursor-ring"]`) are in the DOM iff
   *     `pref === "on" && pointerFine && hoverHover && !reducedMotion`.
   *   - `document.documentElement.style.cursor === "none"` while the
   *     Cursor is mounted; otherwise the root cursor style equals its
   *     pre-mount value (exactly as captured immediately before render).
   *   - On unmount (via @testing-library's `cleanup`), the root cursor
   *     style is restored to its pre-mount value.
   *
   * Validates: Requirements 4.7, 6.4, 6.5, 6.6, 6.7
   */
  it("renders dot + ring iff every gate passes and manages the root cursor style", () => {
    const originalMatchMedia = window.matchMedia;

    try {
      fc.assert(
        fc.property(
          fc.record({
            pref: fc.constantFrom("on", "off"),
            pointerFine: fc.boolean(),
            hoverHover: fc.boolean(),
            reducedMotion: fc.boolean(),
          }),
          ({ pref, pointerFine, hoverHover, reducedMotion }) => {
            // Reset environment to a known baseline for this sample.
            cleanup();
            window.localStorage.clear();
            const root = document.documentElement;
            // Seed a deterministic but arbitrary pre-mount cursor
            // value so we can assert "restored to previous" below.
            const previousCursor = "auto";
            root.style.cursor = previousCursor;

            // Mock matchMedia per-sample so isPointerFineHover() /
            // prefersReducedMotion() and the Cursor component's own
            // subscription effect see the generated environment.
            Object.defineProperty(window, "matchMedia", {
              writable: true,
              configurable: true,
              value: makeMatchMedia({
                pointerFine,
                hoverHover,
                reducedMotion,
              }),
            });

            // Populate localStorage before render so
            // useCursorPreference's state initializer reads the
            // generated preference on first render.
            window.localStorage.setItem(CURSOR_KEY, pref);

            const shouldMount =
              pref === "on" &&
              pointerFine === true &&
              hoverHover === true &&
              reducedMotion === false;

            const { container } = render(<Cursor />);

            const dot = container.querySelector(
              '[data-testid="e1-cursor-dot"]'
            );
            const ring = container.querySelector(
              '[data-testid="e1-cursor-ring"]'
            );

            if (shouldMount) {
              expect(dot).not.toBeNull();
              expect(ring).not.toBeNull();
              expect(root.style.cursor).toBe("none");
            } else {
              expect(dot).toBeNull();
              expect(ring).toBeNull();
              // Root cursor is untouched when the Cursor is inert.
              expect(root.style.cursor).toBe(previousCursor);
            }

            // Unmount via @testing-library cleanup and assert the
            // root cursor style is restored to its pre-mount value
            // (irrespective of the mount branch taken).
            cleanup();
            expect(root.style.cursor).toBe(previousCursor);

            // Reset environment so the next sample starts clean.
            window.localStorage.clear();
            root.style.cursor = "";
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Restore the global environment regardless of pass / shrink.
      cleanup();
      window.localStorage.clear();
      document.documentElement.style.cursor = "";
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });
});
