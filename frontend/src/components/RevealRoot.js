import { useRef } from "react";

import { useRevealBatch } from "@/lib/useRevealBatch";

/**
 * Mount-once shell that drives the application-wide `.gs-reveal` batch.
 *
 * `<RevealRoot>` sits inside `<App>` (within the `<BrowserRouter>`) and wraps
 * the route tree in a single `<div>`. That wrapper is handed to
 * {@link useRevealBatch}, which:
 *
 *   1. selects every `.gs-reveal` descendant of the wrapper,
 *   2. wires a single `ScrollTrigger.batch(...)` keyed on
 *      `useLocation().pathname`, and
 *   3. releases the batch tween to identity
 *      (`opacity: 1, y: 0, scale: 1`) once each element crosses
 *      `ST.revealStart` (`"top 88%"`).
 *
 * Because the hook is re-keyed by `pathname`, `useGSAP`'s context revert
 * kills every previously owned ScrollTrigger before the new route mounts,
 * so each route starts from a clean batch. Reduced-motion policy is
 * expressed inside the hook via `gsap.matchMedia()`, which collapses the
 * entrance to an opacity-only 150ms fade with `y` and `scale` held at
 * identity.
 *
 * The base `.gs-reveal` utility class
 * (`opacity: 0; translate: 0 50px; scale: 0.96;`) is authored in
 * `src/index.css`, guaranteeing the pre-reveal state is painted on first
 * render and there is no flash of unstyled content before the batch
 * `onEnter` callback tweens to identity.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 *
 * @param {{ children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function RevealRoot({ children }) {
  const rootRef = useRef(null);
  useRevealBatch(rootRef);

  return <div ref={rootRef}>{children}</div>;
}
