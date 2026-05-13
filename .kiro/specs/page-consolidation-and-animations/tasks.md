# Implementation Plan: Page Consolidation and Animations

## Overview

This plan consolidates 12 pages down to 7 (plus 1 sub-route) and replaces all premium GSAP plugin animations with prominent, visible scroll animations using only the free GSAP core + ScrollTrigger. Implementation proceeds in layers: animation engine first, then page merges, then route/navigation cleanup, then new animation features, and finally verification.

## Tasks

- [x] 1. Simplify animation engine and update reveal parameters
  - [x] 1.1 Rewrite `src/lib/gsap.js` to remove all premium plugin imports
    - Remove all `require` calls and try/catch blocks for SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin
    - Export only `gsap` and `ScrollTrigger`
    - Keep `ScrollTrigger.defaults({ markers: false })` and `ScrollTrigger.config({ limitCallbacks: true })`
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 1.2 Update `src/lib/useRevealBatch.js` with dramatic animation parameters
    - Change initial `y` from `50` to `120`
    - Change initial `scale` from `0.96` to `0.85`
    - Change `duration` from `0.8` to `1.0`
    - Change `stagger` from `0.1` to `0.15`
    - Change `start` from `ST.revealStart` (`"top 88%"`) to `"top 85%"`
    - Keep reduced-motion branch unchanged (immediate show at final state)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 1.3 Write property test: Reduced Motion Shows Reveals Immediately (Property 4)
    - **Property 4: Reduced Motion Shows Reveals Immediately**
    - Generate random `.gs-reveal` element sets, apply reduced-motion logic, verify opacity:1, y:0, scale:1
    - **Validates: Requirements 7.4**

- [x] 2. Merge About + Vision + Contact → AboutPage
  - [x] 2.1 Refactor `src/pages/AboutPage.js` to remove SplitText usage and use whole-element text reveals
    - Remove `SplitText` import from `@/lib/gsap`
    - Replace per-word animation with whole-element `{ opacity: 0, y: 40 }` → `{ opacity: 1, y: 0 }` with `duration: 0.8`, `stagger: 0.2`, `ease: "power3.out"`
    - Keep counter animation unchanged (gsap core, no premium plugins)
    - Keep reduced-motion branch (immediate show)
    - _Requirements: 5.3, 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4_

  - [x] 2.2 Add Vision roadmap timeline section to AboutPage with CSS-based SVG path draw
    - Move `timelineEvents`, `infrastructureItems`, `malumzRequirements`, `antiPredatorProtocols` data constants from VisionPage
    - Add vertical timeline section with SVG `<path>` element
    - Implement CSS `stroke-dasharray`/`stroke-dashoffset` animation via ScrollTrigger scrub
    - Use `path.getTotalLength()` to set initial dasharray/dashoffset
    - ScrollTrigger config: `trigger: timelineSection`, `start: "top center"`, `end: "bottom center"`, `scrub: true`
    - Reduced-motion: set `strokeDashoffset: 0` immediately (fully drawn)
    - Remove Phase 2/Phase 3 summary cards (content trimming per Requirement 13.1)
    - Remove "The Mission" section (content trimming per Requirement 13.2)
    - _Requirements: 1.4, 1.5, 1.6, 9.1, 9.2, 9.3, 9.4, 13.1, 13.2_

  - [x] 2.3 Add Malumz Network and Policy Recommendations sections to AboutPage
    - Move network section (requirements list, anti-predator protocols) from VisionPage
    - Move policy recommendations (government, corporate) from VisionPage
    - Preserve all copy strings byte-for-byte
    - _Requirements: 1.1, 1.4_

  - [x] 2.4 Add Contact form section to AboutPage
    - Move contact form from ContactPage to the bottom of AboutPage
    - Preserve form state shape `{ name, email, subject, message }`
    - Preserve `submitContact` API call and error handling
    - _Requirements: 1.1, 1.4_

  - [ ]* 2.5 Write property test: No Duplicate Content on Merged Pages (Property 6)
    - **Property 6: No Duplicate Content on Merged Pages**
    - Render AboutPage, extract all paragraph text ≥ 20 characters, verify no duplicates
    - **Validates: Requirements 13.5**

- [x] 3. Merge Crisis + Safety → SafetyPage
  - [x] 3.1 Refactor `src/pages/SafetyPage.js` to add Crisis content at the top
    - Move `emergencyNumbers` and `provinces` data constants from CrisisPage
    - Add crisis hero section (AlertTriangle icon, "You Are Not Alone" heading, Lifeline CTA) as the first section
    - Add emergency numbers grid below crisis hero
    - Add provincial resources section with `<details>` accordions
    - Remove the "For Men in Crisis" footer section (content trimming per Requirement 13.3)
    - Keep existing safety sections in order: Non-Negotiable, Trained Tyrant, Silent Exclusion, Vetting, Report Form
    - _Requirements: 2.1, 2.4, 2.5, 13.3_

  - [ ]* 3.2 Write property test: No Duplicate Content on SafetyPage (Property 6)
    - **Property 6: No Duplicate Content on Merged Pages**
    - Render SafetyPage, extract all paragraph text ≥ 20 characters, verify no duplicates
    - **Validates: Requirements 13.5**

- [x] 4. Merge Resources + Systems → ResourcesPage
  - [x] 4.1 Refactor `src/pages/ResourcesPage.js` to add Systems index content
    - Move `systems` and `trainerColors` data constants from SystemsPage
    - Add system guides section at the bottom with trainer colour pills and descriptions
    - Each system card links to `/systems/${system.slug}`
    - Remove the "Need the Expanded System Guides?" CTA section (content trimming per Requirement 13.4)
    - _Requirements: 3.1, 3.5, 3.6, 13.4_

  - [ ]* 4.2 Write property test: No Duplicate Content on ResourcesPage (Property 6)
    - **Property 6: No Duplicate Content on Merged Pages**
    - Render ResourcesPage, extract all paragraph text ≥ 20 characters, verify no duplicates
    - **Validates: Requirements 13.5**

- [x] 5. Checkpoint - Ensure page merges are complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update routes, navigation, and footer
  - [x] 6.1 Update `src/App.js` routes — remove old routes, add redirects
    - Remove imports for `VisionPage`, `ContactPage`, `CrisisPage`, `SystemsPage`
    - Remove `<Route path="/vision">`, `<Route path="/contact">`, `<Route path="/crisis">`, `<Route path="/systems">` (exact) routes
    - Add `import { Navigate } from 'react-router-dom'`
    - Add redirect routes: `/vision` → `/about`, `/contact` → `/about`, `/crisis` → `/safety`, `/systems` → `/resources` (all with `replace`)
    - Preserve `/systems/:slug` route pointing to SystemDetailPage
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.2, 3.3, 3.4_

  - [x] 6.2 Update `src/components/Navigation.js` with consolidated link set
    - Replace `navLinks` array with consolidated structure: Home, The Book, Start a Circle, Learn (Resources, Results), About, Safety
    - Remove Vision, Contact, Crisis, Systems as standalone destinations
    - Change "I Need Help Now" button `to` from `/crisis` to `/safety`
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 6.3 Update `src/components/Footer.js` with consolidated links
    - Change `/contact` link to `/about`
    - Change `/systems` link to `/resources`
    - Change `/vision` link to `/about`
    - Change `/crisis` link to `/safety` in "Crisis Help" section
    - _Requirements: 4.3, 4.4_

  - [ ]* 6.4 Write property test: No Dead Links to Removed Routes (Property 1)
    - **Property 1: No Dead Links to Removed Routes**
    - Render Navigation and Footer, collect all `<a>` and `<Link>` hrefs, assert none match `/vision`, `/contact`, `/crisis`, or `/systems` (exact)
    - **Validates: Requirements 4.4**

- [x] 7. Add parallax layer animations
  - [x] 7.1 Add parallax layer to HomePage hero section (`src/components/home/HeroSection.js`)
    - Add a background decorative element (blurred shape or existing image)
    - Apply `gsap.to` with `y: -100`, `ease: "none"`, `scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: true }`
    - Wrap in `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", ...)`
    - Reduced-motion: no parallax, element stays at CSS position
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 7.2 Add parallax to AboutPage collage section
    - Left-column images: `y: -60` scrubbed to scroll
    - Right-column images: `y: -30` scrubbed to scroll
    - ScrollTrigger config: `trigger: collageSection`, `start: "top bottom"`, `end: "bottom top"`, `scrub: true`
    - Wrap in `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", ...)`
    - Reduced-motion: no parallax
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ]* 7.3 Write property test: Parallax Y-Translation Range (Property 2)
    - **Property 2: Parallax Y-Translation Range**
    - Generate random parallax configurations (start/end y values), verify absolute difference ≥ 50px
    - **Validates: Requirements 6.3**

  - [ ]* 7.4 Write property test: Reduced Motion Disables Parallax (Property 3)
    - **Property 3: Reduced Motion Disables Parallax**
    - Generate random parallax element states, apply reduced-motion logic, verify y=0
    - **Validates: Requirements 6.4**

- [x] 8. Create HorizontalTrainers component and integrate
  - [x] 8.1 Create `src/components/home/HorizontalTrainers.js`
    - Accept `trainers` prop: `Array<{ name, description, icon }>`
    - Render viewport-height container with inner horizontal track containing 6 trainer cards
    - Desktop (≥768px, no reduced motion): pin container, scrub horizontal translation, `scrub: 1`, `end: () => "+=" + (trackWidth - viewportWidth)`
    - Mobile (<768px) or reduced motion: render as vertical card stack with `.gs-reveal` classes
    - Use `gsap.matchMedia()` with conditions for desktop vs mobile
    - All animations inside `useGSAP` scoped to container ref
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 8.2 Update `src/pages/HomePage.js` to use HorizontalTrainers instead of TrainerSpotlight
    - Replace `TrainerSpotlight` import with `HorizontalTrainers`
    - Pass `sixTrainers` data (with icons) to `HorizontalTrainers`
    - Remove `TrainerSpotlight` from the render tree
    - _Requirements: 8.1_

  - [ ]* 8.3 Write property test: Horizontal Scroll Distance Invariant (Property 5)
    - **Property 5: Horizontal Scroll Distance Invariant**
    - Generate random track widths and viewport widths (viewport ≥ 768px), verify scroll distance = trackWidth - viewportWidth
    - **Validates: Requirements 8.3**

- [x] 9. Checkpoint - Ensure all animations work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Delete removed page files and final cleanup
  - [x] 10.1 Delete removed page files
    - Delete `src/pages/VisionPage.js`
    - Delete `src/pages/ContactPage.js`
    - Delete `src/pages/CrisisPage.js`
    - Delete `src/pages/SystemsPage.js`
    - _Requirements: 1.2, 2.2, 3.2_

  - [x] 10.2 Remove or update TrainerSpotlight component
    - If TrainerSpotlight is no longer used anywhere, delete `src/components/home/TrainerSpotlight.js`
    - Verify no other imports reference it
    - _Requirements: 8.1_

  - [x] 10.3 Verify no premium plugin imports remain in codebase
    - Search for any remaining imports of `gsap/SplitText`, `gsap/DrawSVGPlugin`, `gsap/Flip`, `gsap/MorphSVGPlugin`
    - Remove any stale references found
    - Verify `src/lib/gsap.js` exports only `gsap` and `ScrollTrigger`
    - _Requirements: 5.5_

- [x] 11. Build verification and final property tests
  - [x] 11.1 Run production build and verify success
    - Run `craco build` and confirm zero errors
    - Verify no premium plugin import warnings in build output
    - _Requirements: 5.5, 12.1_

  - [ ]* 11.2 Write unit tests for animation parameters and route configuration
    - Test that useRevealBatch uses `y:120`, `scale:0.85`, `duration:1.0`, `stagger:0.15`
    - Test that gsap.js exports only `gsap` and `ScrollTrigger`
    - Test that route configuration includes all redirects
    - _Requirements: 5.2, 7.1, 7.2_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses `fast-check` (v3.23.2) for property-based testing
- All animations use `useGSAP` hooks scoped to page refs for automatic cleanup on route change
- The `prefers-reduced-motion: reduce` branch is tested in every animation task

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "4.2"] },
    { "id": 3, "tasks": ["2.4", "2.5"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["6.4", "7.1", "7.2", "8.1"] },
    { "id": 6, "tasks": ["7.3", "7.4", "8.2"] },
    { "id": 7, "tasks": ["8.3", "10.1", "10.2"] },
    { "id": 8, "tasks": ["10.3"] },
    { "id": 9, "tasks": ["11.1", "11.2"] }
  ]
}
```
