import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";
import { isPointerFineHover, prefersReducedMotion } from "@/lib/motion";

/**
 * Rectangular inflation applied to the button's bounding rect to produce the
 * magnetic bounding box (Requirement 11.1). The pointer is considered "inside"
 * the magnet when it sits within this inflated rect.
 */
const MAGNETIC_INFLATION_PX = 60;

/**
 * Offset strength multiplier applied to the pointer's displacement from the
 * button's centre (Requirement 11.2: `x: dx * 0.35, y: dy * 0.35`).
 */
const MAGNETIC_FACTOR = 0.35;

/**
 * `<MagneticButton>` - primary CTA wrapper that leans toward the pointer when
 * the pointer is within a 60 px rectangular inflation around the button.
 *
 * Behaviour:
 * - Gated ON only when `(hover: hover) and (pointer: fine)` matches AND
 *   `prefers-reduced-motion` reports `no-preference`. Gating is sampled once
 *   on mount via the shared `motion.js` helpers; the render branch is stable
 *   for the component's lifetime so hook order is preserved.
 * - When enabled, a window-level `pointermove` listener samples the pointer
 *   against the button's inflated bounding rect on every frame. Inside the
 *   box, the button tweens to `{ x: dx * 0.35, y: dy * 0.35, duration: 0.4,
 *   ease: "power2.out", overwrite: "auto" }` where `dx`/`dy` are offsets
 *   from the button's centre. When the pointer exits the inflated rect, or
 *   when the button itself fires `pointerleave`, the button springs back to
 *   `{ x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }`.
 * - When disabled (coarse pointer, no hover, reduced motion, or SSR), the
 *   component renders a plain `<button>` with no pointer tracking.
 *
 * Pass-through contract: `children`, `onClick`, `type`, `className`, and
 * every remaining prop (every `aria-*` attribute plus any other valid
 * `<button>` prop) are forwarded verbatim to the underlying `<button>`.
 * `type` defaults to `"button"` so the component never accidentally submits
 * an enclosing form.
 *
 * Cleanup:
 * - GSAP tweens live inside `useGSAP({ scope: ref })`, so the library
 *   auto-reverts every tween owned by this instance on unmount (Requirement
 *   3.8 / 34).
 * - The window `pointermove` and button `pointerleave` listeners are
 *   registered with an `AbortController`; the effect's teardown calls
 *   `controller.abort()` so listeners are removed on unmount or gate flip.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children] - Button content.
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick] -
 *   Click handler forwarded to the underlying `<button>`.
 * @param {"button"|"submit"|"reset"} [props.type="button"] - Native button
 *   type. Defaults to `"button"`.
 * @param {string} [props.className] - Forwarded to the underlying `<button>`.
 * @returns {JSX.Element}
 * @see Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */
export default function MagneticButton({
  children,
  onClick,
  type,
  className,
  ...rest
}) {
  const ref = useRef(null);

  // Sample the gate once on mount. A nice-to-have improvement would be to
  // subscribe to `matchMedia` change events so the gate flips mid-session
  // (e.g., OS-level reduced-motion toggle); the basic mount-time probe is
  // sufficient for this task per the design notes.
  const [enabled] = useState(
    () => isPointerFineHover() && !prefersReducedMotion()
  );

  // `useGSAP` with `{ scope: ref }` tethers every tween created below to
  // the button's mount lifetime. `dependencies: []` means the setup runs
  // once; the window listener lives in the companion `useEffect` because
  // window-level DOM listeners are outside the GSAP context's reach.
  useGSAP(
    () => {
      // Intentionally empty: tweens are fired imperatively from the
      // pointer-event listeners below. Declaring the `useGSAP` scope here
      // still causes the library to revert any tweens that target `ref`
      // on unmount.
    },
    { scope: ref, dependencies: [] }
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const controller = new AbortController();
    const { signal } = controller;

    // Tracks whether the pointer was inside the inflated rect on the
    // previous `pointermove` sample so we only fire the spring-back tween
    // on the transition from inside to outside (not on every sample that
    // happens to be outside).
    let insideBox = false;

    const springBack = () => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
      });
    };

    const onPointerMove = (event) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const expandedLeft = rect.left - MAGNETIC_INFLATION_PX;
      const expandedRight = rect.right + MAGNETIC_INFLATION_PX;
      const expandedTop = rect.top - MAGNETIC_INFLATION_PX;
      const expandedBottom = rect.bottom + MAGNETIC_INFLATION_PX;

      const { clientX, clientY } = event;
      const within =
        clientX >= expandedLeft &&
        clientX <= expandedRight &&
        clientY >= expandedTop &&
        clientY <= expandedBottom;

      if (within) {
        insideBox = true;
        const centreX = rect.left + rect.width / 2;
        const centreY = rect.top + rect.height / 2;
        const dx = clientX - centreX;
        const dy = clientY - centreY;
        gsap.to(node, {
          x: dx * MAGNETIC_FACTOR,
          y: dy * MAGNETIC_FACTOR,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else if (insideBox) {
        // Transitioned from inside the magnetic box to outside on this
        // sample; play the elastic spring-back exactly once until the
        // pointer re-enters the box.
        insideBox = false;
        springBack();
      }
    };

    const onPointerLeave = () => {
      // Safety net for cases where the pointer leaves the document
      // without a final `pointermove` sample outside the box (e.g.,
      // moving into a cross-origin iframe or the browser chrome).
      if (insideBox) {
        insideBox = false;
        springBack();
      }
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
      signal,
    });
    el.addEventListener("pointerleave", onPointerLeave, { signal });

    return () => controller.abort();
  }, [enabled]);

  const resolvedType = type || "button";

  if (!enabled) {
    // Fallback branch: plain <button> with no pointer tracking. Matches
    // the pass-through contract so swapping between the two branches is
    // transparent to the call site.
    return (
      <button
        type={resolvedType}
        className={className}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type={resolvedType}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
