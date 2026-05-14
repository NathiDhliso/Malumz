import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * `<AnimatedNumber>` — counts from 0 (or `from`) up to `to` when the
 * element scrolls into view. Uses `gsap.to` on a tween proxy with
 * `snap: { value: 1 }` so the rendered value is always an integer.
 *
 * Keeps the destination value rendered statically so if GSAP never
 * runs the user still sees the final number — there is no
 * `gsap.set(textContent, "0")` guard.
 */
export default function AnimatedNumber({
  to,
  from = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className = "",
  ariaLabel,
  ...rest
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return undefined;

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          const state = { v: from };
          // Render `from` immediately so the count starts low when in view.
          el.textContent = `${prefix}${from}${suffix}`;
          gsap.to(state, {
            v: to,
            duration,
            ease: "power2.out",
            snap: { value: 1 },
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(state.v)}${suffix}`;
            },
            onComplete: () => {
              el.textContent = `${prefix}${to}${suffix}`;
            },
          });
        },
      });

      return () => trigger.kill();
    },
    { dependencies: [to, from] }
  );

  return (
    <span
      ref={ref}
      className={className}
      aria-label={ariaLabel || `${prefix}${to}${suffix}`}
      {...rest}
    >
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
