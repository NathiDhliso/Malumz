import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * `<AnimatedHeadline>` — word-by-word entrance reveal.
 *
 * Splits the supplied `text` on whitespace and renders each word in an
 * inline-block span, then runs a staggered `gsap.from` so each word
 * lifts and fades in. This is the gsap-core replacement for SplitText
 * (which is a premium plugin that was stripped from the runtime).
 *
 * The start state is locked synchronously via `gsap.set()` inside the
 * useLayoutEffect-based useGSAP hook — so the words never paint at their
 * natural state before the reveal animation runs.
 *
 * Props:
 *  - `text`       — the headline string. Newlines are preserved by the
 *                   wrapping element's `white-space`.
 *  - `as`         — element tag (`"h1"` | `"h2"` | …). Defaults to `"h1"`.
 *  - `className`  — forwarded to the wrapping element.
 *  - `delay`      — start delay in seconds, default 0.
 *  - `stagger`    — per-word stagger, default 0.06.
 *  - `duration`   — per-word duration, default 0.7.
 *  - `triggerOnScroll` — when true, runs once when the element enters
 *                       viewport (uses ScrollTrigger). When false (default),
 *                       runs on mount.
 */
export default function AnimatedHeadline({
  text,
  as: Tag = "h1",
  className = "",
  delay = 0,
  stagger = 0.06,
  duration = 0.7,
  triggerOnScroll = false,
  ...rest
}) {
  const ref = useRef(null);

  // Memoise the word split so the rendered DOM is stable across re-renders.
  const words = useMemo(() => text.split(/(\s+)/), [text]);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return undefined;
      const wordEls = root.querySelectorAll("[data-headline-word]");
      if (!wordEls.length) return undefined;

      // Lock the start state synchronously so the words never paint at
      // their natural position before the reveal runs.
      gsap.set(wordEls, { opacity: 0, yPercent: 110, rotate: 4 });

      const animate = () =>
        gsap.to(wordEls, {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          duration,
          stagger,
          delay,
          ease: "power3.out",
        });

      if (triggerOnScroll) {
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          once: true,
          onEnter: animate,
        });
        return () => trigger.kill();
      }

      animate();
      return undefined;
    },
    { dependencies: [text, triggerOnScroll] }
  );

  // Mobile-Safari safety net. ScrollTrigger is rAF-driven and can stall during
  // scroll gestures or tab visibility changes, leaving the words stuck at
  // opacity 0. After 2 seconds, force every word visible so the headline
  // cannot be permanently invisible.
  useEffect(() => {
    if (!triggerOnScroll) return undefined;
    const timer = setTimeout(() => {
      const root = ref.current;
      if (!root) return;
      const wordEls = root.querySelectorAll("[data-headline-word]");
      if (!wordEls.length) return;
      gsap.to(wordEls, {
        opacity: 1,
        yPercent: 0,
        rotate: 0,
        duration: 0.3,
        overwrite: "auto",
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [triggerOnScroll, text]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {words.map((chunk, i) => {
        if (/^\s+$/.test(chunk)) {
          // Preserve whitespace as a normal text node so wrapping works.
          return chunk;
        }
        return (
          <span
            key={i}
            data-headline-word
            className="inline-block overflow-hidden"
          >
            <span className="inline-block">{chunk}</span>
          </span>
        );
      })}
    </Tag>
  );
}
