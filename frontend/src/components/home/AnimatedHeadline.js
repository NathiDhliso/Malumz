import { useMemo, useRef } from "react";
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
 * Uses `immediateRender: false` so if GSAP never runs the words stay at
 * their natural visible state — the headline is never invisible.
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

      const animate = () =>
        gsap.from(wordEls, {
          opacity: 0,
          yPercent: 110,
          rotate: 4,
          duration,
          stagger,
          delay,
          ease: "power3.out",
          immediateRender: false,
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
