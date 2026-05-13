/**
 * Motion policy helpers for the E1 editorial UI overhaul.
 *
 * This module centralises the capability / preference probes that gate every
 * animation in the feature (reduced motion, pointer fineness + hover
 * availability, the desktop pin breakpoint, and the Save-Data signal) and the
 * shared ScrollTrigger configuration constants consumed by scroll-driven
 * sections.
 *
 * All exports are pure, synchronous, and side-effect-free. Every helper
 * guards `typeof window` / `typeof navigator` so the module is safe to import
 * from a server-rendered or test environment where those globals are absent.
 *
 * @see Requirements 4.1, 6.7, 11.4, 11.5, 22.1, 22.2
 */

// ---------------------------------------------------------------------------
// Media query strings
// ---------------------------------------------------------------------------

/**
 * Media query matching users who have requested reduced motion at the OS
 * level. Used as the inverse gate for every transform-based entrance.
 *
 * @see Requirement 4.1
 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Media query matching environments that expose a fine pointer AND hover
 * capability (mouse / trackpad). Used to gate the custom cursor and the
 * magnetic button pointer-tracking branch.
 *
 * @see Requirements 6.7, 11.4
 */
export const POINTER_FINE_QUERY = "(pointer: fine) and (hover: hover)";

/**
 * Media query matching viewports at or above the shared 1024px pin
 * breakpoint. Every `ScrollTrigger.pin` in the feature is gated by this
 * query so small viewports never trap scroll inside a pinned sequence.
 *
 * @see Requirements 22.1, 22.2
 */
export const DESKTOP_PIN_QUERY = "(min-width: 1024px)";

// ---------------------------------------------------------------------------
// Capability / preference probes
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the user agent reports `prefers-reduced-motion: reduce`.
 *
 * SSR-safe: returns `false` when `window` is undefined so server renders
 * default to the full-motion branch and the client re-probes on hydration.
 *
 * @returns {boolean}
 * @see Requirement 4.1
 */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/**
 * Returns `true` when the current environment exposes a fine pointer AND a
 * real hover capability. Touch-only devices, coarse pointers, and
 * hover-less pens all return `false`.
 *
 * SSR-safe: returns `false` when `window` is undefined.
 *
 * @returns {boolean}
 * @see Requirements 6.7, 11.4
 */
export function isPointerFineHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(POINTER_FINE_QUERY).matches
  );
}

/**
 * Returns `true` when the viewport is at or above the shared 1024px pin
 * breakpoint.
 *
 * SSR-safe: returns `false` when `window` is undefined so server renders
 * default to the non-pinned branch.
 *
 * @returns {boolean}
 * @see Requirements 22.1, 22.2
 */
export function isDesktopPin() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(DESKTOP_PIN_QUERY).matches
  );
}

/**
 * Returns `true` when the Network Information API reports that the user has
 * opted into data-saver mode (`navigator.connection.saveData === true`).
 * Consumers swap heavy media (e.g., the hero ambient video) for the poster
 * image when this is true.
 *
 * SSR-safe: returns `false` when `navigator` is undefined or the
 * `connection` descriptor is missing. The strict `=== true` comparison
 * intentionally rejects truthy-but-non-boolean values.
 *
 * @returns {boolean}
 * @see Requirement 15.6
 */
export function isSaveData() {
  if (typeof navigator === "undefined") return false;
  const c = navigator.connection;
  return !!(c && c.saveData === true);
}

// ---------------------------------------------------------------------------
// ScrollTrigger configuration constants
// ---------------------------------------------------------------------------

/**
 * Shared ScrollTrigger configuration constants used across the feature.
 *
 * Grouping these in a single object keeps trigger positions consistent from
 * section to section (reveals at `top 88%`, editorial accents at
 * `top 70%`, connector diagrams at `top 60%`) and gives the pin breakpoint
 * plus resize-refresh debounce a single source of truth shared by the
 * app-shell listener and every feature-authored pin.
 *
 * @see Requirements 22.1, 22.2
 */
export const ST = Object.freeze({
  /** `.gs-reveal` batch entry trigger position. */
  revealStart: "top 88%",
  /** Pull-quote rule draw entry trigger position. */
  pullQuoteStart: "top 70%",
  /** AboutPage counter tween entry trigger position. */
  counterStart: "top 70%",
  /** TrainerConnector DrawSVG timeline entry trigger position. */
  trainerConnectorStart: "top 60%",
  /** Shared desktop pin breakpoint in CSS pixels. */
  pinBreakpointPx: 1024,
  /** Window-resize debounce window before calling `ScrollTrigger.refresh()`. */
  resizeRefreshDebounceMs: 250,
});
