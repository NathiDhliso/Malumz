import React from "react";
import { useCursorPreference } from "@/lib/useCursorPreference";

/**
 * Visible settings affordance for the custom cursor preference.
 *
 * Renders a `<button type="button">` styled as a checkbox-style toggle. The
 * button's `aria-pressed` attribute reflects the stored preference
 * (`true` when the persisted value is `"on"`, `false` otherwise), and
 * activating it writes the flipped value through `useCursorPreference()`
 * so `<Cursor>` mounts or unmounts within a single animation frame.
 *
 * Behaviour:
 * - Reads the current preference via `useCursorPreference()`; the hook
 *   already normalizes any non-`"on"` persisted value to `"off"`.
 * - On click, calls `setPreference(value === "on" ? "off" : "on")`. The
 *   hook's state update re-renders every subscriber (including `<Cursor>`)
 *   synchronously, so the cursor component's mount gate re-evaluates on
 *   the next frame.
 *
 * Styling:
 * - Uses Tailwind tokens: the label sits on the `e1-text` palette and the
 *   indicator flips to the `e1-primary` accent while the toggle is on.
 * - Accepts an optional `className` prop, appended to the outer button so
 *   callers can slot the toggle into layouts like the Footer settings
 *   section without wrapping elements.
 *
 * Accessibility:
 * - `role="switch"` reinforces the toggle semantics on user agents that
 *   still interpret `aria-pressed` on `<button>` as "pressed" vs. "on".
 * - The visible "On" / "Off" label doubles as the indicator state so the
 *   toggle is comprehensible without reading the `aria-pressed` attribute.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirement 6.3
 * @param {{ className?: string }} props
 * @returns {JSX.Element}
 */
export function CursorSettingsToggle({ className = "" } = {}) {
  const [value, setPreference] = useCursorPreference();
  const isOn = value === "on";

  const handleClick = () => {
    setPreference(isOn ? "off" : "on");
  };

  const base =
    "inline-flex items-center gap-3 font-sans text-sm e1-text " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-e1-primary " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-e1-bg";
  const merged = className ? `${base} ${className}` : base;

  const indicatorBase =
    "inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 " +
    "border text-xs uppercase tracking-wider";
  const indicatorState = isOn
    ? "border-e1-primary bg-e1-primary text-e1-text"
    : "border-e1-text-muted text-e1-text-muted";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={handleClick}
      className={merged}
      data-testid="e1-cursor-settings-toggle"
    >
      <span className="text-e1-text">Custom cursor</span>
      <span
        aria-hidden="true"
        data-testid="e1-cursor-settings-toggle-indicator"
        className={`${indicatorBase} ${indicatorState}`}
      >
        {isOn ? "On" : "Off"}
      </span>
    </button>
  );
}

export default CursorSettingsToggle;
