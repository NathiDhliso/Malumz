/**
 * GSAP runtime singleton for the E1 Editorial UI Overhaul.
 *
 * Imported once by `src/index.js` before `ReactDOM.createRoot().render(...)` so
 * that plugin registration and ScrollTrigger defaults take effect exactly once
 * per page load. Every downstream module imports `gsap` and its plugins from
 * this module rather than from `gsap/*` directly.
 *
 * Feature: e1-editorial-ui-overhaul
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin);
ScrollTrigger.defaults({ markers: false });
ScrollTrigger.config({ limitCallbacks: true });

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin };
