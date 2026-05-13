/**
 * Property-based test for the `<NotchedSection>` component.
 *
 * Feature: e1-editorial-ui-overhaul, Property 6: NotchedSection className
 * forwarding.
 *
 * For any non-empty string drawn from the alphanumeric + space + "_" + "-"
 * alphabet, rendering `<NotchedSection className={input} …>` SHALL produce
 * an outer element whose `className` attribute contains every
 * whitespace-separated token of `input` as a standalone token. The
 * component layers its own utility classes (`w-full`, `bg-e1-bg` /
 * `bg-e1-surface`) alongside the forwarded value, so the assertion only
 * requires presence — not equality — of the input tokens.
 *
 * Validates: Requirement 7.7
 */
import React from "react";
import { render, cleanup } from "@testing-library/react";
import fc from "fast-check";
import NotchedSection from "../NotchedSection";

describe("NotchedSection — Property 6: className forwarding", () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 6 — every space-separated token of the forwarded `className`
   * input appears as a standalone token in the outer element's `className`
   * attribute.
   *
   * Feature: e1-editorial-ui-overhaul, Property 6
   *
   * Generator:
   *   fc.string().filter(
   *     s => /^[a-zA-Z0-9 _-]+$/.test(s) && s.trim().length > 0
   *   )
   *
   * Validates: Requirement 7.7
   */
  it("forwards every whitespace-separated token of `className` to the outer element", () => {
    fc.assert(
      fc.property(
        fc
          .string()
          .filter(
            (s) => /^[a-zA-Z0-9 _-]+$/.test(s) && s.trim().length > 0
          ),
        (input) => {
          const { getByTestId } = render(
            <NotchedSection className={input} data-testid="host">
              content
            </NotchedSection>
          );

          const host = getByTestId("host");
          const actualTokens = host.className.split(/\s+/).filter(Boolean);

          const expectedTokens = input.split(/\s+/).filter(Boolean);
          for (const token of expectedTokens) {
            expect(actualTokens).toContain(token);
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
