import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import {
  POINTER_FINE_QUERY,
  REDUCED_MOTION_QUERY,
  isPointerFineHover,
  prefersReducedMotion,
} from "@/lib/motion";
import { useCursorPreference } from "@/lib/useCursorPreference";

/**
 * Custom cursor component — a dot + ring pointer that replaces the native
 * cursor while every gate in the motion / pointer / preference policy is
 * satisfied.
 *
 * Gating (Requirements 6.4, 6.5, 6.6, 6.7, 4.7):
 * - `useCursorPreference()` must return `"on"` (user opted in via the
 *   settings toggle; default is `"off"`).
 * - `(pointer: fine) and (hover: hover)` must match (real mouse / trackpad).
 * - `(prefers-reduced-motion: reduce)` must NOT match.
 * The component re-probes the matchMedia queries via `change` listeners so
 * the cursor mounts / unmounts within one frame of any environment change.
 *
 * Rendering (Requirements 8.1, 8.2):
 * - Two fixed-position sibling `<div>`s at `z-index: 480`, `pointer-events:
 *   none`, both pre-translated by `-50%` on each axis so subsequent (x, y)
 *   tweens target the geometric center of the pointer.
 * - Dot: 12 × 12 px filled `e1-primary` (#C2491A).
 * - Ring: 40 × 40 px stroked `e1-primary` (#C2491A) at 1 px.
 *
 * Movement (Requirements 8.3, 8.4):
 * - `pointermove` is attached to `window` with `{ passive: true }`. The dot
 *   updates with `gsap.set(dotEl, { x, y })` on every event (no easing),
 *   while the ring updates with
 *   `gsap.to(ringEl, { x, y, duration: 0.5, ease: "power3.out", overwrite: "auto" })`.
 *
 * Hover amplification (Requirements 8.5, 8.6):
 * - Delegated `pointerover` / `pointerout` on `document` check
 *   `e.target.closest("a, button, [data-cursor-hover]")`. Transitions are
 *   skipped when pointer moves between descendants of the same hover
 *   ancestor (via the `relatedTarget` sibling check) to avoid flicker.
 * - On enter: `gsap.to(dotEl, { scale: 2.5, backgroundColor: "#F0E2CB", duration: 0.2 })`.
 * - On leave: `gsap.to(dotEl, { scale: 1, backgroundColor: "#C2491A", duration: 0.2 })`.
 *
 * Root cursor (Requirement 6.5):
 * - While mounted, `document.documentElement.style.cursor` is set to
 *   `"none"`. The previous value is captured on mount and restored on
 *   unmount so the native cursor returns exactly as the host page had it.
 *
 * Cleanup (Requirements 3.7, 3.8, 34):
 * - Every tween is created inside `useGSAP`, so the gsap context auto-
 *   reverts on unmount.
 * - Raw `window` / `document` listeners are attached via an
 *   `AbortController` and removed in one call from the returned cleanup.
 *
 * Focus styles (Requirement 33.4):
 * - This component never mutates `outline` or `box-shadow` on any element.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 6.4, 6.5, 6.6, 6.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 33.4
 */

const HOVER_SELECTOR = "a, button, [data-cursor-hover]";
const DOT_COLOR = "#C2491A"; // e1-primary
const HOVER_COLOR = "#F0E2CB"; // e1-text

export default function Cursor() {
  const [preference] = useCursorPreference();

  // Reactive matchMedia probes. Initial state is computed from the SSR-safe
  // helpers so the server render and the first client render agree; a
  // mount-only effect then subscribes to `change` events so the component
  // reacts if the user flips OS preferences or docks / undocks a pointer.
  const [pointerFine, setPointerFine] = useState(() => isPointerFineHover());
  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const pointerMql = window.matchMedia(POINTER_FINE_QUERY);
    const reducedMql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onPointer = () => setPointerFine(pointerMql.matches);
    const onReduced = () => setReducedMotion(reducedMql.matches);

    // Some user agents (Safari < 14) expose `addListener` rather than
    // `addEventListener` on MediaQueryList. Prefer the modern API and fall
    // back to the legacy one so the gate remains reactive everywhere.
    if (pointerMql.addEventListener) {
      pointerMql.addEventListener("change", onPointer);
      reducedMql.addEventListener("change", onReduced);
    } else if (pointerMql.addListener) {
      pointerMql.addListener(onPointer);
      reducedMql.addListener(onReduced);
    }

    return () => {
      if (pointerMql.removeEventListener) {
        pointerMql.removeEventListener("change", onPointer);
        reducedMql.removeEventListener("change", onReduced);
      } else if (pointerMql.removeListener) {
        pointerMql.removeListener(onPointer);
        reducedMql.removeListener(onReduced);
      }
    };
  }, []);

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mounted =
    preference === "on" && pointerFine === true && reducedMotion === false;

  // Drive every tween inside `useGSAP` so cleanup is inherited from the
  // scoped gsap.context(). Dependency on `mounted` reruns the setup whenever
  // the gate flips; returned cleanup restores the root cursor and aborts the
  // attached listeners.
  useGSAP(
    () => {
      if (!mounted) return undefined;
      const dotEl = dotRef.current;
      const ringEl = ringRef.current;
      if (!dotEl || !ringEl) return undefined;

      // Pre-translate each element by half its own size so the (x, y) tween
      // targets the pointer's geometric center rather than its top-left.
      gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      gsap.set(dotEl, { scale: 1, backgroundColor: DOT_COLOR });

      // Hide the native cursor while the custom cursor is live. Capture the
      // previous value so unmount restores the host page exactly as it was.
      const root = document.documentElement;
      const previousCursor = root.style.cursor;
      root.style.cursor = "none";

      const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;

      const onMove = (event) => {
        const { clientX, clientY } = event;
        gsap.set(dotEl, { x: clientX, y: clientY });
        gsap.to(ringEl, {
          x: clientX,
          y: clientY,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const onPointerOver = (event) => {
        const target =
          event.target && event.target.closest
            ? event.target.closest(HOVER_SELECTOR)
            : null;
        if (!target) return;
        // Ignore moves between descendants of the same hover ancestor.
        const from =
          event.relatedTarget && event.relatedTarget.closest
            ? event.relatedTarget.closest(HOVER_SELECTOR)
            : null;
        if (from === target) return;
        gsap.to(dotEl, {
          scale: 2.5,
          backgroundColor: HOVER_COLOR,
          duration: 0.2,
          overwrite: "auto",
        });
      };

      const onPointerOut = (event) => {
        const target =
          event.target && event.target.closest
            ? event.target.closest(HOVER_SELECTOR)
            : null;
        if (!target) return;
        const to =
          event.relatedTarget && event.relatedTarget.closest
            ? event.relatedTarget.closest(HOVER_SELECTOR)
            : null;
        if (to === target) return;
        gsap.to(dotEl, {
          scale: 1,
          backgroundColor: DOT_COLOR,
          duration: 0.2,
          overwrite: "auto",
        });
      };

      // Some browsers ignore the `signal` option on addEventListener; retain
      // explicit references so the fallback cleanup can remove them.
      if (signal) {
        window.addEventListener("pointermove", onMove, {
          passive: true,
          signal,
        });
        document.addEventListener("pointerover", onPointerOver, { signal });
        document.addEventListener("pointerout", onPointerOut, { signal });
      } else {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("pointerout", onPointerOut);
      }

      return () => {
        if (controller) {
          controller.abort();
        } else {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerover", onPointerOver);
          document.removeEventListener("pointerout", onPointerOut);
        }
        root.style.cursor = previousCursor;
      };
    },
    { dependencies: [mounted] }
  );

  if (!mounted) return null;

  const baseStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 480,
    willChange: "transform",
  };

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        data-testid="e1-cursor-dot"
        style={{
          ...baseStyle,
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: DOT_COLOR,
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        data-testid="e1-cursor-ring"
        style={{
          ...baseStyle,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${DOT_COLOR}`,
          backgroundColor: "transparent",
        }}
      />
    </>
  );
}
