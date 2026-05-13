/**
 * Property-based tests for the `useCursorPreference` hook.
 *
 * Feature: e1-editorial-ui-overhaul, Property 4
 *
 * Validates: Requirements 6.1, 6.2
 */
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";
import { useCursorPreference, CURSOR_KEY } from "../useCursorPreference";

describe("useCursorPreference — Property 4: cursor preference round-trip", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  /**
   * Property 4 — Write-path round-trip and normalization.
   *
   * Feature: e1-editorial-ui-overhaul, Property 4
   *
   * For any input drawn from `fc.oneof(fc.constantFrom("on","off"),
   * fc.string(), fc.constant(null))`:
   *   - Calling `setPreference(input)` updates the hook's exposed
   *     value to `"on"` iff `input === "on"`, otherwise to `"off"`.
   *   - The same normalized value is persisted at
   *     `localStorage[CURSOR_KEY]`.
   *   - A fresh `renderHook` instance (reading from the persisted
   *     localStorage value) returns the same normalized value as its
   *     initial state.
   *
   * Validates: Requirements 6.1, 6.2
   */
  it("normalizes any non-'on' write to 'off' and round-trips through localStorage", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom("on", "off"),
          fc.string(),
          fc.constant(null)
        ),
        (input) => {
          window.localStorage.clear();
          const expected = input === "on" ? "on" : "off";

          const first = renderHook(() => useCursorPreference());
          act(() => {
            const [, setPreference] = first.result.current;
            setPreference(input);
          });

          const [valueAfterWrite] = first.result.current;
          expect(valueAfterWrite).toBe(expected);
          expect(window.localStorage.getItem(CURSOR_KEY)).toBe(expected);

          // A fresh hook instance must read the persisted value and
          // produce the same normalized initial state.
          const second = renderHook(() => useCursorPreference());
          const [valueOnFreshRead] = second.result.current;
          expect(valueOnFreshRead).toBe(expected);

          first.unmount();
          second.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 — Read-path normalization (including absent key).
   *
   * Feature: e1-editorial-ui-overhaul, Property 4
   *
   * For any seed drawn from `fc.oneof(fc.constantFrom("on","off"),
   * fc.string(), fc.constant(null))`:
   *   - With localStorage pre-populated to the raw seed (or the key
   *     removed when `seed === null`), the hook's initial state equals
   *     `"on"` iff the raw value is exactly `"on"`, otherwise `"off"`.
   *
   * Validates: Requirements 6.1, 6.2
   */
  it("normalizes any non-'on' stored value (or absent key) to 'off' on read", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom("on", "off"),
          fc.string(),
          fc.constant(null)
        ),
        (seed) => {
          window.localStorage.clear();
          if (seed !== null) {
            window.localStorage.setItem(CURSOR_KEY, seed);
          }
          const expected = seed === "on" ? "on" : "off";

          const { result, unmount } = renderHook(() => useCursorPreference());
          const [value] = result.current;
          expect(value).toBe(expected);
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
