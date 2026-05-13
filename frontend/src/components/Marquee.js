/**
 * `<Marquee>` — horizontal infinite-loop phrase ribbon.
 *
 * Renders two concatenated copies of `phrases` joined by a separator glyph
 * (default `✦`) in Fraunces bold uppercase at `e1-primary`. A GSAP tween
 * translates the track by one copy's width with a `modifiers.x` wrap callback,
 * producing a seamless loop. Pointer enter/leave on the root tween the tween's
 * own `timeScale` down to `hoverSpeedPxPerSec / speedPxPerSec` and back to `1`
 * over 0.4 s, giving the "hover slows, resumes on leave" effect without
 * interfering with the underlying translation.
 *
 * Under `prefers-reduced-motion: reduce`, no tween is created; the two copies
 * render statically (no motion is preferable to a paused mid-frame).
 *
 * Cleanup: the tween is owned by the `useGSAP` context scoped to `rootRef`,
 * so the hook reverts it on unmount. Pointer listeners are attached in a
 * companion `useEffect` so they are removed on unmount as well.
 *
 * Feature: e1-editorial-ui-overhaul
 * Requirements: 4.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */
import { Fragment, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export const Marquee = ({
  phrases,
  speedPxPerSec = 40,
  hoverSpeedPxPerSec = 8,
  separator = "\u2726", // ✦ U+2726 Black Four Pointed Star
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  // Build the tween inside a useGSAP context so cleanup is inherited.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const track = trackRef.current;
      if (!track) return;

      // One copy's width. We render two identical copies, so scrollWidth / 2
      // yields the translation distance that produces a seamless wrap.
      const trackWidth = track.scrollWidth / 2;
      if (!trackWidth || !Number.isFinite(trackWidth)) return;

      const tween = gsap.to(track, {
        x: `-=${trackWidth}`,
        duration: trackWidth / speedPxPerSec,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((v) =>
            gsap.utils.wrap(-trackWidth, 0, parseFloat(v))
          ),
        },
      });
      tweenRef.current = tween;

      return () => {
        tweenRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [phrases, separator, speedPxPerSec] }
  );

  // Pointer enter/leave handlers live in a separate effect so the listeners
  // are registered/removed on mount/unmount independent of the useGSAP
  // invalidation cycle. They tween the `timeScale` of the cached tween.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const hoverScale = hoverSpeedPxPerSec / speedPxPerSec;

    const handleEnter = () => {
      const tween = tweenRef.current;
      if (!tween) return;
      gsap.to(tween, { timeScale: hoverScale, duration: 0.4, overwrite: true });
    };
    const handleLeave = () => {
      const tween = tweenRef.current;
      if (!tween) return;
      gsap.to(tween, { timeScale: 1, duration: 0.4, overwrite: true });
    };

    root.addEventListener("pointerenter", handleEnter);
    root.addEventListener("pointerleave", handleLeave);
    return () => {
      root.removeEventListener("pointerenter", handleEnter);
      root.removeEventListener("pointerleave", handleLeave);
    };
  }, [hoverSpeedPxPerSec, speedPxPerSec]);

  const renderCopy = (copyKey, ariaHidden) => (
    <div
      key={copyKey}
      className="flex items-center"
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {phrases.map((phrase, i) => (
        <Fragment key={`${copyKey}-${i}`}>
          <span className="px-8">{phrase}</span>
          <span className="px-2" aria-hidden="true">
            {separator}
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} className="overflow-hidden whitespace-nowrap">
      <div
        ref={trackRef}
        className="flex whitespace-nowrap font-display font-bold uppercase text-e1-primary"
      >
        {renderCopy("a", false)}
        {renderCopy("b", true)}
      </div>
    </div>
  );
};

export default Marquee;
