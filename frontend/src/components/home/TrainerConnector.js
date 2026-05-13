/**
 * `<TrainerConnector>` — HomePage radial connector diagram.
 *
 * Renders a single SVG with the central "THE STUDENT" node at the origin
 * and exactly six labelled trainer branches radiating outward at 60°
 * intervals. Each branch is a `<path>` line from the center to the node
 * position plus a `<circle>` node and a `<text>` label. The label text is
 * always written into the SVG so assistive technology can read every
 * branch even when `DrawSVGPlugin` is unavailable (Requirement 16.6,
 * 35.4).
 *
 * Motion is authored inside `useGSAP` scoped to `sectionRef` so the
 * context revert kills every owned tween and ScrollTrigger on unmount.
 * `gsap.matchMedia()` splits the timeline into a full-motion branch and
 * a reduced-motion branch:
 *
 *   - `(prefers-reduced-motion: no-preference)`:
 *       1. `gsap.set` the six paths to `drawSVG: "0%"` and the six nodes
 *          to `scale: 0, transformOrigin: "center"`.
 *       2. A ScrollTrigger-bound timeline on `sectionRef` with
 *          `start: ST.trainerConnectorStart` (`"top 60%"`) and
 *          `toggleActions: "play none none reverse"` draws every path
 *          from 0 % to 100 % with `duration: 1`, `stagger: 0.12`, and
 *          `ease: "power2.inOut"`, then scales the nodes in with
 *          `duration: 0.6`, `stagger: 0.1`, and `ease: "back.out(2)"`.
 *   - `(prefers-reduced-motion: reduce)`:
 *       Paths are set to `drawSVG: "100%"` and nodes to `scale: 1`
 *       immediately; no scroll-triggered timeline is built.
 *
 * Fallback: when the runtime has no DrawSVG support, `drawSVG` writes
 * become no-ops and the authored paths render fully drawn from first
 * paint. The static structure — central node, six branches, six labels
 * — remains intact and readable.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 35.4
 *
 * @param {{ trainers?: readonly string[] }} props
 * @returns {JSX.Element}
 */
import { createRef, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ST } from "@/lib/motion";

// Reference ScrollTrigger so bundlers cannot tree-shake the registration
// side-effects performed in `@/lib/gsap`.
void ScrollTrigger;

/**
 * CSS-based path draw replaces DrawSVGPlugin (Requirement 5.4).
 * Uses stroke-dasharray/stroke-dashoffset animated via ScrollTrigger.
 */

/**
 * Six default trainer labels matching the Six Trainers narrative on the
 * HomePage. Frozen so consumers cannot mutate the shared default.
 */
const DEFAULT_TRAINERS = Object.freeze([
  "Family",
  "Masculine",
  "Community",
  "Economic",
  "Academic",
  "Spiritual",
]);

const VIEWBOX = 800;
const CENTER = VIEWBOX / 2; // 400
const RADIUS = 280; // distance from center to each trainer node

export const TrainerConnector = ({ trainers = DEFAULT_TRAINERS }) => {
  const sectionRef = useRef(null);

  // Stable ref arrays. `createRef()` objects expose `.current` in the
  // shape `useGSAP` expects, so we can gather them via `refs.map(r => r.current)`
  // inside the effect without worrying about callback-ref timing.
  const pathRefs = useMemo(
    () => Array.from({ length: trainers.length }, () => createRef()),
    [trainers.length]
  );
  const nodeRefs = useMemo(
    () => Array.from({ length: trainers.length }, () => createRef()),
    [trainers.length]
  );

  // Precompute each trainer's (cx, cy). Start at the top of the circle
  // (angle = -π/2) and advance 60° per step so the first branch points
  // straight up and the rest radiate evenly.
  const positions = useMemo(
    () =>
      trainers.map((_, i) => {
        const angle = (Math.PI * 2 * i) / trainers.length - Math.PI / 2;
        const cx = CENTER + RADIUS * Math.cos(angle);
        const cy = CENTER + RADIUS * Math.sin(angle);
        return { cx, cy };
      }),
    [trainers]
  );

  useGSAP(
    () => {
      const paths = pathRefs.map((r) => r.current).filter(Boolean);
      const nodes = nodeRefs.map((r) => r.current).filter(Boolean);
      if (paths.length === 0 || nodes.length === 0) return;

      // CSS-based path draw: set stroke-dasharray/dashoffset per path.
      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      gsap.set(nodes, { scale: 0, transformOrigin: "center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: ST.trainerConnectorStart,
          toggleActions: "play none none reverse",
        },
      });

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power2.inOut",
      }).to(
        nodes,
        {
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(2)",
        },
        ">"
      );
    },
    { scope: sectionRef, dependencies: [trainers] }
  );

  return (
    <section ref={sectionRef} className="w-full py-16">
      <h2 className="sr-only">Trainer connection diagram</h2>
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full h-auto max-w-3xl mx-auto"
        role="img"
        aria-label="The student connected to six trainers"
      >
        {/* Radiating branches — one path per trainer. */}
        {positions.map(({ cx, cy }, i) => (
          <path
            key={`path-${i}`}
            ref={pathRefs[i]}
            d={`M ${CENTER} ${CENTER} L ${cx} ${cy}`}
            stroke="#C2491A"
            strokeWidth="1.5"
            fill="none"
          />
        ))}

        {/* Trainer nodes — scale in after the paths finish drawing. */}
        {positions.map(({ cx, cy }, i) => (
          <circle
            key={`node-${i}`}
            ref={nodeRefs[i]}
            cx={cx}
            cy={cy}
            r="8"
            fill="#C2491A"
          />
        ))}

        {/* Trainer labels — always rendered so every branch stays in the
            accessibility tree even when DrawSVG is unavailable
            (Requirements 16.6, 35.4). */}
        {positions.map(({ cx, cy }, i) => (
          <text
            key={`label-${i}`}
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            className="fill-e1-text-muted font-sans uppercase"
            style={{ fontSize: 14 }}
          >
            {trainers[i]}
          </text>
        ))}

        {/* Central student node — rendered last so the label sits on top. */}
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-e1-text font-display uppercase"
          style={{ fontSize: 28 }}
        >
          THE STUDENT
        </text>
      </svg>
    </section>
  );
};

export default TrainerConnector;
