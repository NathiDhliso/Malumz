/**
 * GSAP runtime singleton.
 *
 * Registers only the free ScrollTrigger plugin. All premium plugin
 * dependencies (SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin) have been
 * removed — animations now use only gsap core + ScrollTrigger.
 *
 * Feature: page-consolidation-and-animations
 * Requirements: 5.1, 5.2, 5.5
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({ markers: false });
ScrollTrigger.config({ limitCallbacks: true });

console.log("[gsap.js] GSAP registered. ScrollTrigger version:", ScrollTrigger.version);

export { gsap, ScrollTrigger };
