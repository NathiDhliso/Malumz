import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * `<NotchedSection>` — the E1 editorial layout primitive.
 *
 * Renders a full-width rectangle with 40 px rounded outer corners and a
 * concave inward notch at the horizontal midpoint of the top and bottom
 * edges (~ 220 × 55 px). The silhouette has two implementations gated by a
 * capability probe and an explicit `force` prop:
 *
 *  - **Primary (mask-image).** A single inline SVG data URL is built once at
 *    module load from a fixed `viewBox="0 0 1000 1000"` with
 *    `preserveAspectRatio="none"`. The element is stretched over the SVG
 *    via `mask-size: 100% 100%` so the silhouette is paint-only with zero
 *    per-frame JavaScript. Background fill comes from the tone token
 *    (`bg-e1-bg` for charcoal, `bg-e1-surface` for sienna).
 *
 *  - **Fallback (SVG clipPath).** When `force === "svg"` or the
 *    `CSS.supports('mask-image', …)` probe fails (e.g., older Safari
 *    versions with inconsistent mask-image interpolation), the component
 *    renders a hidden `<svg><defs><clipPath id>…</clipPath></defs></svg>`
 *    sibling and applies `clip-path: url(#id)` to the outer element. The
 *    clipPath `d` attribute is computed in real pixel coordinates from the
 *    host element's size so the notch always measures exactly 220 × 55 px.
 *    A `ResizeObserver` recomputes the path on size change and schedules
 *    the DOM write through `requestAnimationFrame` with a single-pending
 *    guard plus a last-written dedup, so the `d` attribute is written at
 *    most once per animation frame.
 *
 * The silhouette is decorative: no role or aria-label is added and the
 * children remain structurally present in the accessibility tree.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @see Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 *
 * @param {object} props
 * @param {"charcoal"|"sienna"} [props.tone="charcoal"]
 *   Background token. `"charcoal"` → `bg-e1-bg`; `"sienna"` → `bg-e1-surface`.
 * @param {string} [props.className]
 *   Additional class names forwarded to the outer element.
 * @param {React.ElementType} [props.as="section"]
 *   Polymorphic element tag.
 * @param {React.ReactNode} [props.children]
 *   Body content.
 * @param {"mask"|"svg"} [props.force]
 *   Force a specific silhouette implementation. When omitted, a mount-time
 *   capability probe chooses mask-image when supported and falls back to
 *   the SVG clipPath otherwise.
 */

// ---------------------------------------------------------------------------
// Silhouette geometry
// ---------------------------------------------------------------------------

/** Outer corner radius in pixels (Requirement 7.2). */
const OUTER_RADIUS = 40;
/** Notch width in pixels (Requirement 7.3, 7.4). */
const NOTCH_WIDTH = 220;
/** Notch depth in pixels (Requirement 7.3, 7.4). */
const NOTCH_DEPTH = 55;

/**
 * Fixed viewBox dimension used for the primary `mask-image` data URL. The
 * SVG is stretched over the element with `preserveAspectRatio="none"`.
 */
const MASK_VIEWBOX_SIZE = 1000;

/**
 * Build the silhouette path string for a `W × H` bounding box.
 *
 * The path traces the outer rectangle clockwise:
 *   1. Top-left corner arc → top edge → top notch (concave down) → top-right.
 *   2. Right edge.
 *   3. Bottom-right corner arc → bottom edge → bottom notch (concave up) →
 *      bottom-left.
 *   4. Left edge.
 *
 * Elliptical arcs (`A` commands) are used for both the outer corners and
 * the notches so the notch width / depth measure exactly `NOTCH_WIDTH` /
 * `NOTCH_DEPTH` regardless of the element's aspect ratio (primary
 * mask-image is stretched so this exactness only strictly applies to the
 * fallback, which computes against real pixels).
 *
 * @param {number} W - width in user units
 * @param {number} H - height in user units
 * @returns {string} SVG path `d` attribute value
 */
function buildSilhouettePath(W, H) {
  const r = OUTER_RADIUS;
  const nRx = NOTCH_WIDTH / 2; // 110
  const nRy = NOTCH_DEPTH;     // 55
  const midX = W / 2;
  const leftNotch = midX - nRx;
  const rightNotch = midX + nRx;

  // sweep-flag=1 on the top notch draws the arc clockwise on screen, which
  // dips DOWN into the shape (concave). sweep-flag=0 on the bottom notch
  // dips UP into the shape. All four outer-corner arcs use sweep-flag=1
  // (clockwise) since the whole path is traced clockwise.
  return [
    `M${r},0`,
    `L${leftNotch},0`,
    `A${nRx},${nRy} 0 0,1 ${rightNotch},0`,
    `L${W - r},0`,
    `A${r},${r} 0 0,1 ${W},${r}`,
    `L${W},${H - r}`,
    `A${r},${r} 0 0,1 ${W - r},${H}`,
    `L${rightNotch},${H}`,
    `A${nRx},${nRy} 0 0,0 ${leftNotch},${H}`,
    `L${r},${H}`,
    `A${r},${r} 0 0,1 0,${H - r}`,
    `L0,${r}`,
    `A${r},${r} 0 0,1 ${r},0`,
    "Z",
  ].join(" ");
}

// Generate the primary mask-image data URL once at module load. The SVG
// path is encoded via `encodeURIComponent` so characters like `#`, `<`,
// `>`, and quotes survive CSS parsing inside a `url("…")` reference.
const MASK_PATH_D = buildSilhouettePath(MASK_VIEWBOX_SIZE, MASK_VIEWBOX_SIZE);
const MASK_SVG_MARKUP =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MASK_VIEWBOX_SIZE} ${MASK_VIEWBOX_SIZE}" preserveAspectRatio="none">` +
  `<path d="${MASK_PATH_D}" fill="#fff"/>` +
  "</svg>";
const MASK_IMAGE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(MASK_SVG_MARKUP)}")`;

// ---------------------------------------------------------------------------
// Tone → Tailwind background token mapping (Requirement 7.6)
// ---------------------------------------------------------------------------

const TONE_CLASSES = {
  charcoal: "bg-e1-bg",
  sienna: "bg-e1-surface",
};

// ---------------------------------------------------------------------------
// Capability probe — memoised across instances
// ---------------------------------------------------------------------------

let maskSupportCache = null;

/**
 * Probe whether the user agent supports `mask-image` / `-webkit-mask-image`
 * with a URL value. The result is cached across instances; components only
 * pay the probe cost once per page load.
 *
 * @returns {boolean}
 */
function supportsMaskImage() {
  if (maskSupportCache !== null) return maskSupportCache;
  if (
    typeof window === "undefined" ||
    typeof window.CSS === "undefined" ||
    typeof window.CSS.supports !== "function"
  ) {
    maskSupportCache = false;
    return maskSupportCache;
  }
  maskSupportCache =
    window.CSS.supports("mask-image", 'url("#")') ||
    window.CSS.supports("-webkit-mask-image", 'url("#")');
  return maskSupportCache;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const NotchedSection = ({
  tone = "charcoal",
  className = "",
  as: Tag = "section",
  children,
  force,
  ...rest
}) => {
  const hostRef = useRef(null);
  const pathElRef = useRef(null);
  /** Currently scheduled `requestAnimationFrame` id (0 when none pending). */
  const rafIdRef = useRef(0);
  /** Most recent `d` string waiting to be written on the next frame. */
  const pendingDRef = useRef("");
  /** Most recent `d` string already committed to the DOM. */
  const lastWrittenDRef = useRef("");

  // Build a stable, CSS-selector-safe id for the clipPath. `useId()` returns
  // strings like `:r0:` which are not valid in a `url(#…)` fragment
  // reference without escaping, so we strip non-identifier characters.
  const reactId = useId();
  const clipPathId = `e1-notched-clip-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // `force` wins. When omitted, default to the primary (mask) path on first
  // render; the mount-time probe below flips to the SVG fallback when the
  // user agent does not support mask-image. Using `force === "svg"` as the
  // initial state keeps first render deterministic when the caller asks for
  // the fallback explicitly.
  const [useSvgFallback, setUseSvgFallback] = useState(() => force === "svg");

  useEffect(() => {
    if (force === "svg") {
      setUseSvgFallback(true);
      return;
    }
    if (force === "mask") {
      setUseSvgFallback(false);
      return;
    }
    setUseSvgFallback(!supportsMaskImage());
  }, [force]);

  // When the SVG fallback is active, observe the host's size and write the
  // clipPath `d` attribute at most once per animation frame (Requirement
  // 7.9). The initial compute is performed synchronously in the layout
  // effect so the first paint carries a valid clipPath; every subsequent
  // resize event schedules a rAF which drains the latest pending `d`.
  useLayoutEffect(() => {
    if (!useSvgFallback) return undefined;

    const host = hostRef.current;
    const pathEl = pathElRef.current;
    if (
      !host ||
      !pathEl ||
      typeof window === "undefined" ||
      typeof window.ResizeObserver === "undefined"
    ) {
      return undefined;
    }

    const computeD = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      return buildSilhouettePath(w, h);
    };

    // Initial synchronous write so there is no flash of invisible content
    // before the first animation frame.
    const initialD = computeD();
    pathEl.setAttribute("d", initialD);
    lastWrittenDRef.current = initialD;
    pendingDRef.current = initialD;

    const writePending = () => {
      rafIdRef.current = 0;
      const nextD = pendingDRef.current;
      if (!nextD || nextD === lastWrittenDRef.current) return;
      const target = pathElRef.current;
      if (!target) return;
      target.setAttribute("d", nextD);
      lastWrittenDRef.current = nextD;
    };

    const scheduleWrite = (nextD) => {
      pendingDRef.current = nextD;
      if (rafIdRef.current !== 0) return;
      rafIdRef.current = window.requestAnimationFrame(writePending);
    };

    const onResize = () => {
      scheduleWrite(computeD());
    };

    const ro = new window.ResizeObserver(onResize);
    ro.observe(host);

    return () => {
      ro.disconnect();
      if (rafIdRef.current !== 0) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, [useSvgFallback]);

  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.charcoal;
  const resolvedClassName = ["w-full", toneClass, className]
    .filter((c) => typeof c === "string" && c.length > 0)
    .join(" ");

  const style = useSvgFallback
    ? {
        clipPath: `url(#${clipPathId})`,
        WebkitClipPath: `url(#${clipPathId})`,
      }
    : {
        maskImage: MASK_IMAGE_URL,
        WebkitMaskImage: MASK_IMAGE_URL,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      };

  return (
    <Tag ref={hostRef} className={resolvedClassName} style={style} {...rest}>
      {useSvgFallback && (
        <svg
          aria-hidden="true"
          focusable="false"
          width="0"
          height="0"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <defs>
            <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
              <path ref={pathElRef} d="" />
            </clipPath>
          </defs>
        </svg>
      )}
      {children}
    </Tag>
  );
};

export default NotchedSection;

// Named exports for property-based geometry testing (Property 7). These
// expose the pure path generator and silhouette constants without
// altering runtime component behaviour.
export { buildSilhouettePath, OUTER_RADIUS, NOTCH_WIDTH, NOTCH_DEPTH };
