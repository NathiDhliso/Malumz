# Implementation Plan: E1 Editorial UI Overhaul

## Overview

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

The plan is phased to match the delivery groups in the requirements:

1. **Foundation** — Tailwind tokens, Google Fonts loading, GSAP runtime, motion helpers, assets module, cursor-preference hook, ESLint guards, and route/reveal hooks.
2. **Reusable components** — `<NotchedSection>`, `<Cursor>`, `<CursorSettingsToggle>`, `<PageTransition>`, `<Marquee>`, `<MagneticButton>`, `<RevealRoot>`.
3. **HomePage editorial treatments** — hero (SplitText + Flip card + ambient video), scroll indicator, Trainer Connector, Trainer Spotlight, Pull Quote, HomePage composition.
4. **Scroll systems** — route-change `ScrollTrigger.refresh()`, shared 1024 px pin breakpoint, debounced resize refresh.
5. **Per-page treatments** — AboutPage, VisionPage, BookPage, ContactPage, ResultsPage, plus inheritance pages (Join / Crisis / Resources / Systems / SystemDetail / Safety).
6. **Navigation & Footer restyle** — token and typography swap only, structure preserved.
7. **Media discipline & graceful fallbacks** — dimensions, lazy/fetchpriority, `<img>`/`<video>` error fallbacks.
8. **QA / Performance / Accessibility** — Axe, Lighthouse CI, structural-preservation diffs, final checkpoint.

Implementation stack (from the design): **JavaScript (CRA + craco + React 18 + React Router v6)**, GSAP consumed through `@gsap/react`'s `useGSAP` hook, Tailwind tokens, Jest + React Testing Library, and **`fast-check`** for property-based tests (≥ 100 iterations per property; every property carries the JSDoc tag `Feature: e1-editorial-ui-overhaul, Property N` per the design's Testing Strategy).

## Tasks

- [x] 1. Foundation: tokens, fonts, GSAP runtime, shared libraries
  - [x] 1.1 Install animation and test dependencies
    - Add `gsap` and `@gsap/react` to `frontend/package.json` dependencies
    - Add `fast-check`, `jest-axe`, `@axe-core/react`, and `probe-image-size` (or `sharp`) to devDependencies
    - Run install and commit the lockfile update
    - _Requirements: 3.1_

  - [x] 1.2 Replace Tailwind tokens with the E1 palette and typography
    - Edit `frontend/tailwind.config.js`: remove every `malumz-*` color and the `Inter` / `Playfair Display` / `Merriweather` font families
    - Add the seven `e1-*` color tokens with the exact hex values from Requirement 1
    - Register `Fraunces` as `font-display` and `DM Sans` as `font-sans` with serif / sans-serif fallbacks
    - _Requirements: 1.1–1.8, 2.1, 2.2, 2.3_

  - [x] 1.3 Replace the Google Fonts link in `public/index.html`
    - Remove the existing three-family `<link>` references
    - Add a single Google Fonts `<link>` requesting Fraunces (variable axis, weights 400/500/600/700) and DM Sans (weights 400/500/700)
    - Preserve `rel="preconnect"` to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin)
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 1.4 Create the GSAP runtime singleton at `frontend/src/lib/gsap.js`
    - Import `gsap`, `ScrollTrigger`, `SplitText`, `DrawSVGPlugin`, `Flip`, `MorphSVGPlugin`
    - Call `gsap.registerPlugin(...)` exactly once
    - Call `ScrollTrigger.defaults({ markers: false })` and `ScrollTrigger.config({ limitCallbacks: true })` on first import
    - Re-export `gsap` and every plugin
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [x] 1.5 Wire the runtime import into `frontend/src/index.js` before React renders
    - Add `import "@/lib/gsap";` at the top of `src/index.js`, before `createRoot(...).render(...)`
    - Do not render the tree until the module has executed
    - _Requirements: 3.6_

  - [x] 1.6 Create `frontend/src/lib/motion.js` policy helpers
    - Export `REDUCED_MOTION_QUERY`, `POINTER_FINE_QUERY`, `DESKTOP_PIN_QUERY` constants
    - Export pure functions `prefersReducedMotion()`, `isPointerFineHover()`, `isDesktopPin()`, `isSaveData()`, each guarding `typeof window` / `typeof navigator` so the module is SSR-safe
    - Also export the `ST` config constants (`revealStart`, `pullQuoteStart`, `counterStart`, `trainerConnectorStart`, `trainerSpotlightScrollDuration`, `trainerSpotlightScrub`, `pinBreakpointPx: 1024`, `resizeRefreshDebounceMs: 250`) per the design's ScrollTrigger Configuration Constants
    - _Requirements: 4.1, 6.7, 11.4, 11.5, 22.1, 22.2_

  - [x] 1.7 Create `frontend/src/lib/assets.js` semantic constants and metadata default export
    - Export named constants for all twelve assets: `HERO_CARD_IMAGE`, `HERO_POSTER_IMAGE`, `HERO_AMBIENT_VIDEO`, `ABOUT_COLLAGE_A`, `ABOUT_COLLAGE_B`, `ABOUT_COLLAGE_C`, `VISION_NODE_1`, `VISION_NODE_2`, `VISION_NODE_3`, `BOOK_ACCENT_VIDEO`, `RESULTS_TESTIMONIAL_VIDEO`
    - Export a default object keyed by semantic name with `{ src, width, height, type, altPlaceholder }`
    - Capture intrinsic dimensions from the physical files in `frontend/public/Assets/`
    - _Requirements: 5.1–5.8_

  - [x] 1.8 Create `frontend/src/lib/useCursorPreference.js`
    - Read/write the `e1.cursor.custom` localStorage key, normalizing any non-`"on"` value (including missing key, empty string, or arbitrary text) to `"off"`
    - Return `[value, setPreference]`
    - Listen for `storage` events on `window` for cross-tab sync and remove the listener on unmount
    - Wrap every `localStorage` read/write in `try/catch` so Safari private-mode failures degrade to `"off"`
    - _Requirements: 6.1, 6.2_

  - [x] 1.9 Create `frontend/src/lib/useRouteScrollRefresh.js`
    - Hook that observes `useLocation().pathname` and calls `ScrollTrigger.refresh()` exactly once after the new route mounts and paints (a `useEffect` keyed on `pathname`)
    - Acts as a safety-net companion to the curtain refresh from `<PageTransition>`
    - _Requirements: 21.1, 21.2_

  - [x] 1.10 Create `frontend/src/lib/useRevealBatch.js`
    - Hook running inside `useGSAP` scoped to a ref and re-keyed by the current pathname
    - Selects `.gs-reveal` inside the ref and calls `ScrollTrigger.batch(els, { start: "top 88%", once: true, onEnter: ... })`
    - Uses a `gsap.matchMedia()` split so the reduced-motion branch runs an opacity-only 150 ms tween with `y` and `scale` held at identity
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 1.11 Drive one `ScrollTrigger.refresh()` from `document.fonts.ready` in `App.js`
    - In the root `App` component, attach a mount-only effect that awaits `document.fonts?.ready` (falling back to `setTimeout(..., 0)` when `document.fonts` is missing) and then calls `ScrollTrigger.refresh()` exactly once
    - _Requirements: 2.7_

  - [x] 1.12 Add ESLint guards against legacy tokens and raw `/Assets/` URLs
    - Add `no-restricted-syntax` entries (under `frontend/.eslintrc*` or the `eslintConfig` in `package.json`) that reject class-name literals matching `malumz-`, `Playfair Display`, `Inter`, or `Merriweather`, and any string literal that begins with `/Assets/` inside `frontend/src/**/*.{js,jsx}`
    - Confirm `craco build` surfaces the rule as a build failure
    - _Requirements: 1.9, 5.9_

  - [x] 1.13 Write unit tests for foundation configuration
    - `tailwind.config.js`: assert every `e1-*` token value, absence of every `malumz-*` token, and the `font-display`/`font-sans` families
    - `package.json`: assert `gsap` and `@gsap/react` are present in dependencies
    - `public/index.html`: regex-assert a single Google Fonts `<link>` for Fraunces + DM Sans and the preconnect pair
    - `src/index.js`: assert `@/lib/gsap` is imported before `createRoot` (static source assertion)
    - `src/lib/gsap.js`: spy on `gsap.registerPlugin` for a single call with the five plugins, and assert `ScrollTrigger.defaults`/`config` calls
    - _Requirements: 1.1–1.8, 2.1–2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 1.14 Write property test for assets module metadata completeness
    - **Property 3: Assets module metadata completeness and physical alignment**
    - Generator: `fc.constantFrom(...Object.keys(assetsDefault))`
    - Assert each record has non-empty `{ src, width, height, type, altPlaceholder }`, `src` begins with `/Assets/`, the physical file exists under `frontend/public/Assets/`, and `probe-image-size` / `sharp` agrees on intrinsic width and height for image types
    - **Validates: Requirements 5.1–5.8**

  - [x] 1.15 Write property test for cursor-preference round-trip
    - **Property 4: Cursor preference round-trip**
    - Generator: `fc.oneof(fc.constantFrom("on","off"), fc.string(), fc.constant(null))`
    - Assert round-trip on valid values and normalization to `"off"` on any other value, including absent key
    - **Validates: Requirements 6.1, 6.2**

- [ ] 2. Reusable components
  - [x] 2.1 Implement `<NotchedSection>` at `frontend/src/components/NotchedSection.js`
    - Render a full-width element with 40 px rounded outer corners and top/bottom concave notches (~ 220 × 55 px)
    - Primary path: CSS `mask-image` with an inline SVG data URL; tone prop drives the `e1-bg` / `e1-surface` background token
    - Fallback path: when `force === "svg"` or the capability probe fails, render an `<svg>` `<clipPath>` overlay and apply `clip-path: url(#…)`; recompute the path in a `ResizeObserver` throttled through `requestAnimationFrame` so the clipPath `d` attribute is written at most once per frame
    - Forward `className` and the `as` polymorphic tag prop
    - _Requirements: 7.1–7.9_

  - [x] 2.2 Write property test for NotchedSection className forwarding
    - **Property 6: NotchedSection className forwarding**
    - Generator: `fc.string().filter(s => /^[a-zA-Z0-9 _-]+$/.test(s) && s.trim().length > 0)`
    - Assert every space-separated token of the input appears in the outer element's `className`
    - **Validates: Requirement 7.7**

  - [x] 2.3 Write property test for NotchedSection fallback geometry
    - **Property 7: NotchedSection fallback geometry invariants**
    - Generator: `fc.tuple(fc.integer({min:320,max:2560}), fc.integer({min:200,max:4000}))`
    - Parse the generated SVG `d` string and assert four rounded corners of radius 40, two inward concave notches centered at `x = W/2`, and notch width/depth within ±2 px of 220/55
    - **Validates: Requirement 7.8 (with 7.1–7.4 geometry)**

  - [x] 2.4 Write property test for NotchedSection rAF write throttle
    - **Property 8: NotchedSection rAF-throttled write discipline**
    - Generator: `fc.integer({min:1,max:50})`
    - Simulate `N` `ResizeObserver` callbacks within a single `requestAnimationFrame` tick and assert at most one DOM write to the fallback clipPath `d` attribute per frame
    - **Validates: Requirement 7.9**

  - [x] 2.5 Implement `<Cursor>` at `frontend/src/components/Cursor.js`
    - Render `null` unless `useCursorPreference() === "on"`, `isPointerFineHover()`, and `!prefersReducedMotion()`
    - While mounted, set `document.documentElement.style.cursor = "none"`; restore on unmount
    - Dot: 12 × 12 filled `e1-primary`, updated with `gsap.set(el, { x, y })` on every `pointermove`
    - Ring: 40 × 40 stroked `e1-primary` at 1 px, updated via `gsap.to(el, { x, y, duration: 0.5, ease: "power3.out", overwrite: "auto" })`
    - Delegated `pointerover` / `pointerout` listeners on `document` check `closest("a, button, [data-cursor-hover]")`; tween the dot to `{ scale: 2.5, backgroundColor: "#F0E2CB" }` on enter and back to `{ scale: 1, backgroundColor: "#C2491A" }` on leave (0.2 s)
    - Drive every tween inside `useGSAP` so cleanup is inherited; never mutate focus `outline` or `box-shadow`
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 8.1–8.7, 33.4_

  - [x] 2.6 Implement `<CursorSettingsToggle>` at `frontend/src/components/CursorSettingsToggle.js`
    - Visible checkbox-style toggle with `aria-pressed` reflecting the stored preference
    - On activation, writes through `useCursorPreference()` so `<Cursor>` mounts/unmounts within one frame
    - _Requirements: 6.3_

  - [x] 2.7 Write property test for Cursor mount gating truth table
    - **Property 5: Cursor mount gating truth table**
    - Generator: `fc.record({ pref: fc.constantFrom("on","off"), pointerFine: fc.boolean(), hoverHover: fc.boolean(), reducedMotion: fc.boolean() })`
    - Mock `matchMedia` and localStorage, render `<Cursor>`, and assert dot + ring render iff `pref === "on" && pointerFine && hoverHover && !reducedMotion`; assert `document.documentElement.style.cursor === "none"` when mounted and equals its pre-mount value otherwise
    - **Validates: Requirements 4.7, 6.4, 6.5, 6.6, 6.7**

  - [x] 2.8 Write property test for Cursor position and hover state machine
    - **Property 9: Cursor position and hover state-machine correctness**
    - Generator: `fc.array(fc.oneof(moveEventArb, hoverEventArb))`
    - After dispatching the sequence, assert the dot's final translation equals the last `pointermove` coordinates and its scale equals `2.5` iff the last hover-affecting event was a `pointerover` over a matching target (otherwise `1`)
    - **Validates: Requirements 8.3, 8.4, 8.5, 8.6**

  - [x] 2.9 Implement `<PageTransition>` at `frontend/src/components/PageTransition.js`
    - Full-viewport fixed element at `z-index: 500`, `e1-primary`, `aria-hidden="true"`, `inert`, `tabindex="-1"`
    - On pathname change, play enter tween `yPercent: 100 → 0` over 0.5 s (`power3.inOut`), swap `displayLocation`, then exit tween `yPercent: 0 → -100` over 0.5 s; call `ScrollTrigger.refresh()` exactly once on exit complete
    - Reduced-motion branch: replace with a 150 ms opacity crossfade between old/new DOM and skip the curtain
    - Reset scroll to `(0, 0)` on swap; never trap focus
    - Kill in-flight tweens on mid-cycle pathname change and restart from `yPercent: 100`
    - _Requirements: 9.1–9.7, 21.2, 33.5_

  - [x] 2.10 Write property test for PageTransition cycle and refresh discipline
    - **Property 10: PageTransition cycle and refresh discipline**
    - Generator: `fc.array(fc.constantFrom("/","/book","/about","/vision","/contact","/results","/join","/crisis","/resources","/systems","/safety"), {minLength:1,maxLength:8})`
    - Use fake timers; for each completed transition assert the full sweep finishes ≤ 1.0 s from pathname change and `ScrollTrigger.refresh()` is called exactly `N` times across `N` completed transitions
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 21.2**

  - [x] 2.11 Implement `<Marquee>` at `frontend/src/components/Marquee.js`
    - Render two concatenated copies of `phrases` in Fraunces bold uppercase `e1-primary`, joined by `✦`
    - Drive with `gsap.to(track, { x: "-=…", duration: trackWidth / speedPxPerSec, ease: "none", repeat: -1, modifiers: { x: wrap(-trackWidth, 0) } })`
    - `pointerenter` tweens `timeScale` down to `hoverSpeedPxPerSec / speedPxPerSec` over 0.4 s; `pointerleave` tweens it back to `1`
    - Reduced-motion branch: render statically with no tween created
    - Kill the tween via `useGSAP` cleanup
    - _Requirements: 4.3, 10.1–10.7_

  - [x] 2.12 Write property test for Marquee seamless-loop wrap
    - **Property 11: Marquee seamless-loop wrap invariant**
    - Generator: `fc.tuple(fc.integer({min:100,max:5000}), fc.double({min:-100000,max:100000}))`
    - Assert `wrap(x) ∈ [-trackWidth, 0)` and `wrap(x) === wrap(x + trackWidth)` for every sample
    - **Validates: Requirement 10.3**

  - [x] 2.13 Implement `<MagneticButton>` at `frontend/src/components/MagneticButton.js`
    - Enabled only when `(hover: hover) and (pointer: fine)` matches and reduced-motion is no-preference
    - 60 px inflated bounding box around the button; on `pointermove` within the box, `gsap.to(ref, { x: dx*0.35, y: dy*0.35, duration: 0.4, ease: "power2.out", overwrite: "auto" })`
    - On `pointerleave`, `gsap.to(ref, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" })`
    - Fallback: renders a standard `<button>` with no pointer tracking
    - Pass through `children`, `onClick`, `type`, `className`, and every `aria-*` prop
    - _Requirements: 11.1–11.6_

  - [x] 2.14 Write property test for MagneticButton translation and environment gating
    - **Property 12: MagneticButton translation and environment gating**
    - Generator: `fc.record({ dx: fc.integer({min:-30,max:30}), dy: fc.integer({min:-30,max:30}), pointerFine: fc.boolean(), reducedMotion: fc.boolean() })`
    - Assert the expected `gsap.to` vars fire only when both gates pass, no `gsap.to` calls occur otherwise, and `pointerleave` produces the documented spring-back vars
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6**

  - [x] 2.15 Implement `<RevealRoot>` at `frontend/src/components/RevealRoot.js`
    - Mount-once inside `<App>` and drive `useRevealBatch` keyed on `useLocation().pathname`
    - Author the base `.gs-reveal` utility class (`opacity:0; translate:0 50px; scale:0.96;`) in `src/index.css` so there is no FOUC before batch onEnter removes it
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 2.16 Write property test for Reveal Batch convergence to identity
    - **Property 13: Reveal Batch convergence to identity**
    - Generator: `fc.integer({min:0,max:20})`
    - Render `K` `.gs-reveal` nodes, simulate `ScrollTrigger.update`, assert every element reaches `opacity:1, translateY(0), scale(1)` and that a second simulated scroll within the same route lifetime does not re-trigger the reveal
    - **Validates: Requirements 12.1, 12.2, 12.3**

  - [x] 2.17 Write property test for GSAP cleanup on unmount
    - **Property 1: GSAP cleanup on unmount**
    - Generator: `fc.constantFrom(...animatedComponentsUnderTest)` — seed with every reusable component available in this phase (`Cursor`, `PageTransition`, `Marquee`, `MagneticButton`, `RevealRoot`) and extend as new components land
    - Mount, drive one tween cycle, unmount; assert `ScrollTrigger.getAll()` contains no trigger whose element lies within the unmounted subtree, no live tweens target those nodes, and every tracked `window` / `document` listener is removed
    - **Validates: Requirements 3.8, 34.1, 34.2, 34.3**

  - [x] 2.18 Write property test for reduced-motion opacity-only invariant
    - **Property 2: Reduced-motion opacity-only invariant**
    - Generator: `fc.constantFrom(...entranceAnimatedComponents)` — seed with the reusable components in this phase; extend in phase 4 to include Hero / Connector / Spotlight / PullQuote
    - Mock `matchMedia("(prefers-reduced-motion: reduce)")` true, spy on `gsap.to` / `from` / `fromTo`, and assert every call's vars are restricted to `opacity` and carry `duration: 0.15`
    - **Validates: Requirements 4.1, 4.2, 9.7, 12.5, 13.1–13.3 reduced branch**

- [x] 3. Checkpoint — Foundation and reusable components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. HomePage editorial treatments
  - [x] 4.1 Mount the app shell in `frontend/src/App.js`
    - Wrap `<Routes>` in `<PageTransition>` inside `<BrowserRouter>`
    - Mount `<Cursor>` (self-gated) and `<RevealRoot>` at the app-shell level
    - Attach the `document.fonts.ready → ScrollTrigger.refresh()` effect from task 1.11
    - Preserve every existing route path and page filename byte-for-byte
    - _Requirements: 9.1, 21.1, 30.1, 30.2_

  - [x] 4.2 Implement the hero ambient video + overlay in `frontend/src/components/home/HeroSection.js`
    - Inside a `<NotchedSection tone="charcoal">`, render a `<video>` referencing `HERO_AMBIENT_VIDEO` with `muted`, `autoplay`, `loop`, `playsInline`, `preload="metadata"`, and `poster={HERO_POSTER_IMAGE}`
    - Overlay an `e1-bg` wash so the net video opacity reads ≈ 25 %
    - Swap to `<img src={HERO_POSTER_IMAGE} width height loading="eager" alt={assets.HERO_POSTER_IMAGE.altPlaceholder}>` when `prefersReducedMotion()` or `isSaveData()` returns true
    - _Requirements: 15.1–15.6_

  - [x] 4.3 Implement the hero SplitText headline, subtitle, and CTA on the HeroSection master timeline
    - Wrap the full headline in `new SplitText(el, { type: "chars" })`
    - Master timeline animates characters `{ opacity: 0, yPercent: 110, rotationX: -60 } → { opacity: 1, yPercent: 0, rotationX: 0 }` with `stagger: 0.6`, `ease: "expo.out"`, `duration: 1`
    - Parent sets `transformPerspective: 600`, `aria-label` equals the headline string, every character span carries `aria-hidden="true"`
    - Subtitle joins at `"-=0.3"`; CTA (wrapped in `<MagneticButton>`) joins at `"-=0.3"`
    - _Requirements: 13.1–13.8_

  - [x] 4.4 Implement the hero Flip card inside HeroSection
    - `<img src={HERO_CARD_IMAGE}>` with explicit `width`, `height`, `fetchpriority="high"`, and meaningful alt from `altPlaceholder`
    - `gsap.set` to `{ rotationY: 180, scale: 0.5, opacity: 0 }`
    - Master timeline animates to `{ rotationY: 0, scale: 1, opacity: 1, duration: 1.2, ease: "back.out(1.4)" }`
    - On complete, start an idle float tween `{ y: -12, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 }`
    - Disable idle float under reduced motion
    - _Requirements: 14.1–14.5, 32.4_

  - [x] 4.5 Write property test for hero headline SplitText accessibility
    - **Property 14: Hero headline SplitText accessibility**
    - Generator: `fc.string({minLength:1,maxLength:200}).filter(s => s.trim().length > 0)`
    - Assert the parent headline element's `aria-label` equals the raw headline string and every character span carries `aria-hidden="true"`
    - **Validates: Requirements 13.1, 13.7, 13.8**

  - [x] 4.6 Write property test for hero ambient video vs poster gating
    - **Property 15: Hero ambient video vs poster gating**
    - Generator: `fc.record({ reducedMotion: fc.boolean(), saveData: fc.boolean() })`
    - Assert `<video src={HERO_AMBIENT_VIDEO}>` renders iff both booleans are false; otherwise `<img src={HERO_POSTER_IMAGE}>` renders; when the video renders assert it carries `muted`, `autoplay`, `loop`, `playsInline`, `preload="metadata"`, and `poster={HERO_POSTER_IMAGE}`
    - **Validates: Requirements 15.1, 15.3, 15.4, 15.5, 15.6**

  - [x] 4.7 Implement `<ScrollIndicator>` at `frontend/src/components/home/ScrollIndicator.js`
    - Chevron glyph below the hero NotchedSection
    - `gsap.to({ y: 0 → 10, ease: "sine.inOut", yoyo: true, repeat: -1 })` on mount; static under reduced motion
    - _Requirements: 20.1, 20.2, 20.3_

  - [x] 4.8 Implement `<TrainerConnector>` at `frontend/src/components/home/TrainerConnector.js`
    - SVG `viewBox="0 0 800 800"` with a central `<text>` "THE STUDENT" and exactly six radiating `<path>` + trainer nodes with `<text>` labels
    - Timeline triggered by `ScrollTrigger({ trigger: sectionRef, start: "top 60%", toggleActions: "play none none reverse" })` draws each path 0 → 100 % via `DrawSVGPlugin` with `stagger: 0.12` and `ease: "power2.inOut"`
    - After paths draw, trainer nodes scale in with `ease: "back.out(2)"`
    - Branch text stays in the accessibility tree when DrawSVG is unavailable
    - _Requirements: 16.1–16.6, 35.4_

  - [x] 4.9 Implement `<TrainerSpotlight>` at `frontend/src/components/home/TrainerSpotlight.js`
    - Six stacked trainer cards
    - Wrap the pin in `ScrollTrigger.matchMedia({ "(min-width: 1024px) and (prefers-reduced-motion: no-preference)": ... })` with `pin: true`, `scroll duration: "+=300%"`, `scrub: 1`
    - Inactive cards render `{ opacity: 0.3, scale: 0.95 }`; the active card renders `{ opacity: 1, scale: 1 }` with a terracotta left border whose `scaleY` animates 0 → 1
    - Outside the matchMedia branch, each trainer renders as a sequential `.gs-reveal` entry in document order
    - _Requirements: 4.4, 17.1–17.6, 22.1, 22.2_

  - [x] 4.10 Write property test for Trainer Spotlight active-card state
    - **Property 16: Trainer Spotlight active-card state**
    - Generator: `fc.integer({min:0,max:5})`
    - Drive the timeline to each active index, assert the chosen card renders `{ opacity: 1, scale: 1 }` and each other card renders `{ opacity: 0.3, scale: 0.95 }`, and assert the active card's left-border `scaleY` animates 0 → 1
    - **Validates: Requirements 17.3, 17.4, 17.5**

  - [x] 4.11 Implement `<PullQuote>` at `frontend/src/components/home/PullQuote.js`
    - Italic Fraunces at full viewport bleed, terracotta rule sibling at 100 % container width
    - On `ScrollTrigger({ start: "top 70%" })`, tween the rule `scaleX: 0 → 1` with `transformOrigin: "left center"`, `duration: 1.0`, `ease: "power3.out"`
    - Reduced-motion branch: opacity-only 150 ms fade, no `scaleX`
    - _Requirements: 18.1, 18.2, 18.3_

  - [x] 4.12 Compose `frontend/src/pages/HomePage.js`
    - Render hero → `<Marquee>` (between hero and TrainerConnector) → TrainerConnector → TrainerSpotlight → PullQuote → ScrollIndicator below the hero
    - Define `HOME_MARQUEE_PHRASES` as a local constant (phrases unchanged from current copy)
    - Preserve every existing page-level data constant and copy string
    - _Requirements: 19.1, 19.2, 20.1, 30.3_

  - [x] 4.13 Write unit tests for HomePage structural shape
    - TrainerConnector renders one central "THE STUDENT" node, exactly six labelled branches, and fallback-visible branch text
    - HomePage renders exactly one `<Marquee>` in document order between the hero and the TrainerConnector
    - HomePage renders a scroll indicator affordance below the hero NotchedSection
    - Hero card `<img>` carries `width`, `height`, and `fetchpriority="high"`
    - _Requirements: 14.5, 16.1, 16.6, 19.1, 19.2, 20.1, 32.4_

- [x] 5. Checkpoint — HomePage editorial treatments
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Scroll systems: route refresh, pin breakpoint, resize debounce
  - [x] 6.1 Wire route-change ScrollTrigger discipline across the shell
    - Confirm `<PageTransition>` calls `ScrollTrigger.refresh()` exactly once per completed exit sweep
    - Install `useRouteScrollRefresh()` in `App.js` as a secondary safety net so the refresh still runs on reduced-motion route transitions
    - On component unmount that owns ScrollTriggers, `useGSAP`'s context revert kills every owned ScrollTrigger before the new route mounts
    - _Requirements: 21.1, 21.2, 21.3_

  - [x] 6.2 Implement the shared 1024 px pin breakpoint + resize debounce
    - Use the `ST` constants (`pinBreakpointPx: 1024`, `resizeRefreshDebounceMs: 250`) from `src/lib/motion.js`
    - Install a debounced `window.resize` listener at the app-shell level that calls `ScrollTrigger.refresh()` ≤ 250 ms after the last resize event and at most once per burst
    - Every feature-authored `ScrollTrigger.pin` lives inside the shared `matchMedia` gate so pins are inert below 1024 px or under reduced motion
    - _Requirements: 22.1, 22.2, 22.3_

  - [-] 6.3 Write property test for route-change ScrollTrigger discipline
    - **Property 17: Route-change ScrollTrigger discipline**
    - Generator: `fc.array(fc.constantFrom("/","/book","/about","/vision","/contact","/results","/join","/crisis","/resources","/systems","/safety"), {minLength:1,maxLength:8})`
    - After each of `N` transitions, assert `ScrollTrigger.refresh()` has fired exactly `k` times and no live ScrollTrigger's trigger element belongs to an unmounted route
    - **Validates: Requirements 21.1, 21.2, 21.3**

  - [-] 6.4 Write property test for pin breakpoint threshold enforcement
    - **Property 18: Pin breakpoint threshold enforcement**
    - Generator: `fc.tuple(fc.integer({min:320,max:1920}), fc.boolean())`
    - Assert the set of live pinned ScrollTriggers is non-empty iff `W ≥ 1024 && !reducedMotion`; otherwise every feature-owned ScrollTrigger has `pin !== true`
    - **Validates: Requirements 22.1, 22.2**

  - [-] 6.5 Write property test for pin resize debounce
    - **Property 19: Pin resize debounce**
    - Generator: `fc.array(fc.integer({min:0,max:240}), {minLength:2,maxLength:20})` (inter-event gaps in ms)
    - Drive the burst with fake timers, assert `ScrollTrigger.refresh()` fires at most once and no later than 250 ms after the last resize
    - **Validates: Requirement 22.3**

- [ ] 7. Per-page editorial treatments
  - [-] 7.1 Implement AboutPage treatment in `frontend/src/pages/AboutPage.js`
    - Two-column layout: left column counter, right column pull-quote paragraphs
    - Counter: `gsap.to({ v: 0 }, { v: target, snap: { value: 1 }, duration: 2, onUpdate })` on `ScrollTrigger({ start: "top 70%" })`; reduced-motion branch renders the target value directly
    - Right column: `new SplitText(el, { type: "words" })`, fade each word up with per-word stagger on scroll enter; reduced-motion branch fades the paragraph as a whole
    - Collage: `ABOUT_COLLAGE_A/B/C` in a staggered two-column layout with explicit `width`, `height`, `loading="lazy"`, and `alt` populated from `altPlaceholder`
    - Preserve existing page copy
    - _Requirements: 23.1–23.6, 30.3, 32.1, 32.3, 32.5_

  - [-] 7.2 Implement VisionPage vertical timeline in `frontend/src/pages/VisionPage.js`
    - Vertical SVG `<line>` connecting every node, animated 0 → 100 % via `DrawSVGPlugin` with `scrub: true`
    - Each timeline node is a `.gs-reveal` entry with `start: "top 70%"`
    - Three selected nodes show circular-cropped thumbnails backed by `VISION_NODE_1..3` with explicit `width`, `height`, `loading="lazy"`, and meaningful alt
    - DrawSVG fallback: paths render fully drawn when the plugin is unavailable
    - _Requirements: 24.1–24.5, 32.1, 32.3, 32.5, 35.4_

  - [-] 7.3 Implement BookPage form + accent video in `frontend/src/pages/BookPage.js`
    - NotchedSection hero strip containing a silent `<video>` referencing `BOOK_ACCENT_VIDEO` with `muted`, `autoplay`, `loop`, `playsInline`, `preload="metadata"`, and explicit `width` / `height`
    - Inputs render with only a 1 px bottom border; label tweens to `{ y: -20, scale: 0.8, color: "#C2491A" }` on focus and back to resting state on blur when the value remains empty
    - Submit wrapped in `<MagneticButton>`; inline right-arrow glyph tweens `x: 0 → 12` on hover and back on leave
    - _Requirements: 25.1–25.7_

  - [-] 7.4 Implement ContactPage form treatment in `frontend/src/pages/ContactPage.js`
    - Same 1 px bottom-border inputs, label lift, MagneticButton-wrapped submit, and 12 px arrow slide on hover as BookPage
    - No accent video
    - _Requirements: 26.1–26.4_

  - [x] 7.5 Write property test for form label-lift behavior (Book + Contact)
    - **Property 20: Form label-lift behavior**
    - Generator: `fc.record({ page: fc.constantFrom("book","contact"), label: fc.string({minLength:1,maxLength:60}), name: fc.string({minLength:1,maxLength:30}) })`
    - Dispatch `focus` to an empty-valued input; assert `gsap.to` on the associated label with `{ y: -20, scale: 0.8, color: "#C2491A" }`; dispatch `blur` with value still empty and assert the resting-state vars
    - **Validates: Requirements 25.1, 25.2, 25.3, 26.1, 26.2**

  - [-] 7.6 Implement ResultsPage testimonial reel in `frontend/src/pages/ResultsPage.js`
    - Full-width `<video>` referencing `RESULTS_TESTIMONIAL_VIDEO` with explicit `width` / `height`; **no** `autoplay` attribute so it starts paused on first render
    - Accessible play/pause `<button>` with `aria-pressed` reflecting state, toggling playback on activation
    - Reduced-motion branch: video remains paused on first render regardless
    - _Requirements: 27.1–27.5_

  - [x] 7.7 Write property test for ResultsPage play/pause state machine
    - **Property 21: ResultsPage play/pause state machine**
    - Generator: `fc.integer({min:0,max:20})` (number of toggle activations)
    - After `k` activations from the initial paused state, assert `video.paused === (k % 2 === 0)` and `button.getAttribute("aria-pressed") === String(k % 2 === 1)`
    - **Validates: Requirements 27.2, 27.3, 27.4**

  - [-] 7.8 Inherit the design system across Join / Crisis / Resources / Systems / SystemDetail / Safety pages
    - Wrap sections in `<NotchedSection>` with alternating `tone` values across the page
    - Tag primary content blocks with `.gs-reveal` for Reveal Batch
    - Wrap primary CTAs in `<MagneticButton>`
    - No bespoke hero animations (no SplitText, no DrawSVG in the hero region)
    - Preserve existing page copy and filenames
    - _Requirements: 28.1–28.9, 30.2, 30.3_

  - [x] 7.9 Write property test for inheritance page structural invariants
    - **Property 22: Inheritance page structural invariants**
    - Generator: `fc.constantFrom(JoinPage, CrisisPage, ResourcesPage, SystemsPage, SystemDetailPage, SafetyPage)`
    - Render each page; assert (a) consecutive `<NotchedSection>` pairs have distinct `tone`, (b) every `main-content-block` element carries `.gs-reveal`, (c) every primary CTA is inside a `<MagneticButton>`, (d) no SplitText or DrawSVG tween is scheduled against the hero region
    - **Validates: Requirements 28.1–28.9**

- [x] 8. Checkpoint — Per-page treatments
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Navigation and Footer restyle
  - [x] 9.1 Restyle `frontend/src/components/Navigation.js` with E1 tokens and typography
    - Swap `font-serif` / `font-sans` usages to Fraunces / DM Sans; replace every `malumz-*` class with its `e1-*` equivalent; replace the `bg-white/80` scrolled surface with `bg-e1-bg/80` and text colors with `text-e1-text` plus `text-e1-secondary` hover
    - Preserve component structure, link set, link targets, mobile menu, Quick Exit, and every `lucide-react` icon
    - _Requirements: 29.1, 29.3, 29.5_

  - [x] 9.2 Restyle `frontend/src/components/Footer.js` and mount the cursor settings toggle
    - Apply the E1 token and typography swap
    - Mount `<CursorSettingsToggle>` inside the Settings section
    - Preserve footer structure, links, and icons
    - _Requirements: 6.3, 29.2, 29.4, 29.5_

  - [x] 9.3 Write unit tests for Navigation + Footer restyle
    - Snapshot-assert class-name swaps (no `malumz-*`, no `Playfair Display` / `Inter` / `Merriweather` references)
    - Assert the link list equals a frozen snapshot of the pre-overhaul link list
    - Assert every existing `lucide-react` icon import is retained
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5_

- [ ] 10. Media discipline and graceful fallbacks
  - [x] 10.1 Apply media dimension and attribute discipline across all consumers
    - Every `<img>` declares explicit `width` / `height` (or `aspect-ratio`), non-empty `alt` from `altPlaceholder`, and `loading="lazy"` except the above-the-fold hero image (which carries `fetchpriority="high"`)
    - Every `<video>` declares explicit `width` / `height` (or `aspect-ratio`)
    - _Requirements: 32.1–32.5_

  - [x] 10.2 Implement graceful asset-load-failure fallbacks
    - Hero ambient video `onError`: swap to `<img src={HERO_POSTER_IMAGE}>` at the same dimensions (idempotent on repeat events)
    - Any asset `<img>` `onError`: swap to an `e1-surface`-colored `<div>` at the declared `width × height`, `aria-hidden="true"`
    - `SplitText` `new SplitText(...)` wrapped in `try/catch`; on throw, render the headline as plain text at full opacity
    - `DrawSVGPlugin` availability check in `<TrainerConnector>` and `<VisionTimeline>`; on unavailable, render paths fully drawn (strip `strokeDasharray` / `strokeDashoffset` authoring)
    - _Requirements: 35.1, 35.2, 35.3, 35.4_

  - [x] 10.3 Write property test for media dimension discipline in rendered DOM
    - **Property 23: Media dimension discipline in rendered DOM**
    - Generator: `fc.constantFrom(...allFeaturePages)`
    - Render each page, traverse the DOM, assert every `<img>` declares `width` / `height` (or `aspect-ratio`), non-empty `alt`, and `loading="lazy"` unless it is the above-the-fold hero (which declares `fetchpriority="high"`); every `<video>` declares `width` / `height` (or `aspect-ratio`)
    - **Validates: Requirements 32.1, 32.2, 32.3, 32.4, 32.5**

  - [x] 10.4 Write property test for asset-load-failure graceful fallback
    - **Property 24: Asset-load-failure graceful fallback**
    - Generator: `fc.constantFrom(...Object.keys(assetsDefault))`
    - For each asset key, render the consuming component, dispatch a synthetic `error` event on the associated media element, and assert one of the documented fallbacks is rendered (poster swap, surface block, plain-text headline, or fully-drawn paths)
    - **Validates: Requirements 35.1, 35.2, 35.3, 35.4**

- [ ] 11. QA, performance, and accessibility
  - [x] 11.1 Configure the Axe accessibility gate
    - Add `jest-axe` setup and a per-route Jest test that renders every route (`/`, `/book`, `/join`, `/crisis`, `/resources`, `/systems`, `/systems/:slug`, `/safety`, `/results`, `/about`, `/vision`, `/contact`) under both motion-on and reduced-motion environments and asserts zero serious or critical violations
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5_

  - [x] 11.2 Configure Lighthouse CI
    - Add `lighthouserc.js` with desktop and mobile presets targeting the `craco build` output served by `npx serve`
    - Enforce performance ≥ 85 desktop / 75 mobile, LCP ≤ 2.8 s, CLS ≤ 0.05, INP ≤ 200 ms
    - Wire `lhci autorun` into the CI workflow (nightly + main)
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5_

  - [x] 11.3 Structural preservation diff snapshots
    - Jest test reads `src/App.js`, extracts the `<Route>` path list, and asserts it equals a frozen snapshot taken from the pre-overhaul commit
    - Jest test asserts the filename list under `src/pages/` equals a frozen snapshot
    - Jest test asserts `backend/**` is not modified by this feature (e.g., `git diff --stat backend/` snapshot)
    - Jest test asserts no analytics instrumentation and no i18n machinery was added
    - _Requirements: 30.1, 30.2, 30.4, 30.5, 30.6_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; every core implementation task must be completed.
- Every `*` sub-task that writes a property-based test uses **fast-check** with a minimum of 100 iterations per property and carries the JSDoc tag `Feature: e1-editorial-ui-overhaul, Property N` required by the design's Testing Strategy.
- The 24 correctness properties in the design map to tasks as follows: P1 → 2.17, P2 → 2.18, P3 → 1.14, P4 → 1.15, P5 → 2.7, P6 → 2.2, P7 → 2.3, P8 → 2.4, P9 → 2.8, P10 → 2.10, P11 → 2.12, P12 → 2.14, P13 → 2.16, P14 → 4.5, P15 → 4.6, P16 → 4.10, P17 → 6.3, P18 → 6.4, P19 → 6.5, P20 → 7.5, P21 → 7.7, P22 → 7.9, P23 → 10.3, P24 → 10.4.
- Each implementation task references its granular acceptance-criteria sub-requirements (e.g., 13.1–13.8) for traceability; checkpoints (tasks 3, 5, 8, 12) provide incremental validation gates.
- Routing, page filenames, page copy, and the backend stay untouched per Requirement 30 — the restyle is strictly presentational.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.6", "1.7", "1.8", "1.12"] },
    { "id": 1, "tasks": ["1.4", "1.13", "1.14", "1.15"] },
    { "id": 2, "tasks": ["1.5", "1.9", "1.10", "1.11"] },
    { "id": 3, "tasks": ["2.1", "2.5", "2.9", "2.11", "2.13", "2.15"] },
    { "id": 4, "tasks": ["2.2", "2.3", "2.4", "2.6", "2.8", "2.10", "2.12", "2.14", "2.16", "2.17", "2.18"] },
    { "id": 5, "tasks": ["2.7", "4.1"] },
    { "id": 6, "tasks": ["4.2", "4.7", "4.8", "4.9", "4.11"] },
    { "id": 7, "tasks": ["4.3", "4.4"] },
    { "id": 8, "tasks": ["4.5", "4.6", "4.10", "4.12"] },
    { "id": 9, "tasks": ["4.13", "6.1", "6.2"] },
    { "id": 10, "tasks": ["6.3", "6.4", "6.5", "7.1", "7.2", "7.3", "7.4", "7.6", "7.8"] },
    { "id": 11, "tasks": ["7.5", "7.7", "7.9", "9.1", "9.2"] },
    { "id": 12, "tasks": ["9.3", "10.1", "10.2"] },
    { "id": 13, "tasks": ["10.3", "10.4", "11.1", "11.2", "11.3"] }
  ]
}
```
