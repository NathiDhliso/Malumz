# Requirements Document

## Introduction

This specification defines a complete frontend UI/UX overhaul for the E1 React application, replacing the current `malumz-*` generic styling with a distinctive animation-driven editorial design system. The new system fuses modern editorial minimalism with African heritage warmth, inspired by the Flecto.io aesthetic. Scope includes a new design token set, a Fraunces + DM Sans typography system, a reusable `NotchedSection` layout primitive, eight coordinated GSAP animation systems, a gated custom cursor, a page transition curtain, integration of twelve static assets (nine JPEGs and three MP4s) under `frontend/public/Assets/`, and per-page visual treatments. Routing, page filenames, page-level content, navigation/footer structure, and backend endpoints remain unchanged. Requirements are grouped to enable phased delivery: Foundation → Reusable components → HomePage → Scroll systems → Other pages → QA/Performance/Accessibility.

## Glossary

- **E1_App**: The React Create-React-App + craco application rooted at `frontend/src/`, entry point `src/index.js`, shell `src/App.js`.
- **Design_System**: The set of color tokens, typography tokens, spacing rules, and reusable components introduced by this feature.
- **GSAP_Runtime**: The application-wide GSAP instance and plugin registration performed once at application boot and consumed via `@gsap/react`'s `useGSAP()` hook.
- **NotchedSection**: A reusable React component rendering a full-width rectangle with 40px rounded corners and concave notches at the horizontal midpoint of the top and bottom edges (notch width approximately 220px, depth approximately 55px).
- **Cursor_Component**: The root-mounted `<Cursor>` React component providing a custom dot + ring cursor.
- **Page_Transition**: The `<PageTransition>` component wrapping `<Routes>` that plays a terracotta curtain sweep on route change.
- **Marquee_Component**: The horizontal infinite-loop marquee component.
- **Magnetic_Button**: The button wrapper that applies pointer-tracking translation on hover.
- **Reveal_Batch**: The ScrollTrigger.batch pipeline that animates elements with class `.gs-reveal` into view.
- **Trainer_Connector**: The HomePage SVG network connecting the "THE STUDENT" central node to six labelled radiating branches with animated DrawSVG paths.
- **Trainer_Spotlight**: The HomePage scroll-pinned six-trainer spotlight sequence.
- **Assets_Module**: The `frontend/src/lib/assets.js` constants module that exports semantic names for every file under `frontend/public/Assets/`.
- **Reduced_Motion**: The state in which the user agent reports `prefers-reduced-motion: reduce` via `window.matchMedia`.
- **Save_Data**: The state in which `navigator.connection.saveData === true`.
- **Custom_Cursor_Enabled**: The composite state in which `(pointer: fine)` matches, `(hover: hover)` matches, and the localStorage key `e1.cursor.custom` equals `"on"`.
- **Legacy_Tokens**: The existing `malumz-orange`, `malumz-orange-dark`, `malumz-brown`, `malumz-gold`, `malumz-cream`, `malumz-paper`, `malumz-text-primary`, `malumz-text-secondary`, `malumz-text-muted` entries in `tailwind.config.js`.

## Requirements

---

## Group A — Foundation

### Requirement 1: Design Token Palette

**User Story:** As a frontend developer, I want a single set of E1 brand color tokens exposed through Tailwind, so that every component can reference them by semantic name without hardcoded hex values.

#### Acceptance Criteria

1. THE E1_App SHALL define a Tailwind color token `e1-bg` with the value `#09060A`.
2. THE E1_App SHALL define a Tailwind color token `e1-primary` with the value `#C2491A`.
3. THE E1_App SHALL define a Tailwind color token `e1-secondary` with the value `#C8891E`.
4. THE E1_App SHALL define a Tailwind color token `e1-highlight` with the value `#E4BE6A`.
5. THE E1_App SHALL define a Tailwind color token `e1-text` with the value `#F0E2CB`.
6. THE E1_App SHALL define a Tailwind color token `e1-text-muted` with the value `#907A61`.
7. THE E1_App SHALL define a Tailwind color token `e1-surface` with the value `#1E0D05`.
8. THE E1_App SHALL remove all Legacy_Tokens entries from `tailwind.config.js`.
9. WHEN the build runs, THE E1_App SHALL fail the build IF any source file under `frontend/src/` references a Legacy_Tokens class.

### Requirement 2: Typography System

**User Story:** As a designer, I want Fraunces for display type and DM Sans for body type, so that the editorial voice of the E1 brand is consistent across every page.

#### Acceptance Criteria

1. THE E1_App SHALL register `Fraunces` as the Tailwind `font-display` family with a serif fallback.
2. THE E1_App SHALL register `DM Sans` as the Tailwind `font-sans` family with a sans-serif fallback.
3. THE E1_App SHALL remove the `Inter`, `Playfair Display`, and `Merriweather` font entries from `tailwind.config.js`.
4. THE E1_App SHALL load Fraunces and DM Sans via a single Google Fonts `<link>` element in `public/index.html` using `rel="preconnect"` for `fonts.gstatic.com`.
5. THE Fraunces declaration SHALL request the variable font axis range and include weights 400, 500, 600, and 700.
6. THE DM Sans declaration SHALL include weights 400, 500, and 700.
7. WHEN `document.fonts.ready` resolves, THE GSAP_Runtime SHALL call `ScrollTrigger.refresh()` exactly once per page load.

### Requirement 3: GSAP Runtime Registration

**User Story:** As a frontend developer, I want GSAP and its plugins registered once at application boot, so that every component can import GSAP without duplicating registration logic.

#### Acceptance Criteria

1. THE E1_App SHALL declare `gsap` and `@gsap/react` as production dependencies in `frontend/package.json`.
2. THE E1_App SHALL expose a module `frontend/src/lib/gsap.js` that imports `gsap`, `ScrollTrigger`, `SplitText`, `DrawSVGPlugin`, `Flip`, and `MorphSVGPlugin` from the `gsap` package.
3. THE `frontend/src/lib/gsap.js` module SHALL call `gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin)` exactly once on first import.
4. THE `frontend/src/lib/gsap.js` module SHALL call `ScrollTrigger.defaults({ markers: false })` on first import.
5. THE `frontend/src/lib/gsap.js` module SHALL call `ScrollTrigger.config({ limitCallbacks: true })` on first import.
6. THE `frontend/src/index.js` entry file SHALL import `frontend/src/lib/gsap.js` before rendering the React tree.
7. WHERE components need GSAP scoping, THE components SHALL use the `useGSAP` hook from `@gsap/react` rather than a hand-rolled wrapper.
8. WHEN a component using `useGSAP` unmounts, THE GSAP_Runtime SHALL revert the associated `gsap.context()` and kill all owned timelines and ScrollTriggers.

### Requirement 4: Reduced-Motion Honor

**User Story:** As a user with vestibular sensitivity, I want the site to respect my `prefers-reduced-motion` setting, so that I can browse without transform-based animations triggering discomfort.

#### Acceptance Criteria

1. THE E1_App SHALL wrap every motion timeline in `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", …)`.
2. WHILE Reduced_Motion is active, THE E1_App SHALL replace transform-based entrances with opacity transitions of duration 150ms.
3. WHILE Reduced_Motion is active, THE Marquee_Component SHALL pause its animation and render its content statically.
4. WHILE Reduced_Motion is active, THE Trainer_Spotlight SHALL disable its ScrollTrigger pin and render all trainer cards in document order.
5. WHILE Reduced_Motion is active, THE HomePage ambient background video SHALL be replaced with the poster JPEG defined in the Assets_Module.
6. WHILE Reduced_Motion is active, THE ResultsPage testimonial reel SHALL remain paused on first render.
7. WHILE Reduced_Motion is active, THE Cursor_Component SHALL NOT mount and native cursor rendering SHALL remain visible.

### Requirement 5: Assets Module

**User Story:** As a frontend developer, I want every asset under `frontend/public/Assets/` referenced through semantic constants, so that pages import by meaning rather than by raw filename.

#### Acceptance Criteria

1. THE E1_App SHALL expose a module `frontend/src/lib/assets.js` that exports a named constant for every file under `frontend/public/Assets/`.
2. THE Assets_Module SHALL export the constant `HERO_CARD_IMAGE` pointing to `/Assets/WhatsApp Image 2026-05-12 at 17.07.49.jpeg`.
3. THE Assets_Module SHALL export the constant `HERO_POSTER_IMAGE` pointing to `/Assets/WhatsApp Image 2026-05-12 at 17.07.49 (1).jpeg`.
4. THE Assets_Module SHALL export the constant `HERO_AMBIENT_VIDEO` pointing to `/Assets/WhatsApp Video 2026-05-12 at 17.06.20.mp4`.
5. THE Assets_Module SHALL export the constants `ABOUT_COLLAGE_A` and `ABOUT_COLLAGE_B` pointing to the two `WhatsApp Image 2026-05-12 at 16.54.55*.jpeg` files, and `ABOUT_COLLAGE_C` pointing to `WhatsApp Image 2026-05-12 at 16.54.56.jpeg`.
6. THE Assets_Module SHALL export three constants `VISION_NODE_1`, `VISION_NODE_2`, `VISION_NODE_3` pointing to the three remaining `WhatsApp Image 2026-05-12 at 16.54.56 (*).jpeg` and `WhatsApp Image 2026-05-12 at 17.07.49 (2).jpeg` files.
7. THE Assets_Module SHALL export the constants `BOOK_ACCENT_VIDEO` pointing to `/Assets/WhatsApp Video 2026-05-12 at 17.07.50.mp4` and `RESULTS_TESTIMONIAL_VIDEO` pointing to `/Assets/WhatsApp Video 2026-05-12 at 17.07.52.mp4`.
8. THE Assets_Module SHALL export a default export with each asset keyed by its semantic name alongside `width`, `height`, `type`, and a human-readable `altPlaceholder` field.
9. WHERE a component renders an image, THE component SHALL import the path from the Assets_Module rather than hardcoding the `/Assets/` URL.

### Requirement 6: Cursor Preference Toggle

**User Story:** As a user with motor, cognitive, or low-vision needs, I want a setting to turn off the custom cursor, so that the native operating system cursor remains the primary pointer.

#### Acceptance Criteria

1. THE E1_App SHALL persist the cursor preference in the localStorage key `e1.cursor.custom` with values `"on"` or `"off"`.
2. THE E1_App SHALL default the cursor preference to `"off"` on first visit.
3. THE E1_App SHALL render a visible toggle control within the site settings affordance that updates the localStorage value.
4. WHILE the localStorage value is `"off"`, THE Cursor_Component SHALL NOT mount.
5. WHILE Custom_Cursor_Enabled is true, THE E1_App SHALL apply `cursor: none` to the document root.
6. WHILE Custom_Cursor_Enabled is false, THE E1_App SHALL leave the native cursor visible.
7. IF `window.matchMedia('(pointer: fine) and (hover: hover)')` does not match, THEN THE Cursor_Component SHALL NOT mount regardless of the localStorage value.

---

## Group B — Reusable Components

### Requirement 7: NotchedSection Layout Primitive

**User Story:** As a page author, I want a single `<NotchedSection>` component, so that every major section on the site renders the distinctive notched silhouette without per-page geometry code.

#### Acceptance Criteria

1. THE NotchedSection SHALL render a full-width rectangle.
2. THE NotchedSection SHALL render 40px rounded outer corners.
3. THE NotchedSection SHALL render a concave inward curve at the horizontal midpoint of the top edge, approximately 220px wide and 55px deep.
4. THE NotchedSection SHALL render a concave inward curve at the horizontal midpoint of the bottom edge, approximately 220px wide and 55px deep.
5. THE NotchedSection SHALL implement the notch silhouette via CSS `mask-image` backed by an inline SVG data URL.
6. THE NotchedSection SHALL accept a `tone` prop with allowed values `"charcoal"` and `"sienna"` and apply the corresponding background token (`e1-bg` or `e1-surface`).
7. THE NotchedSection SHALL accept a `className` prop and forward it to the outer element.
8. WHERE the CSS mask-image approach cannot reproduce the required silhouette fidelity, THE NotchedSection SHALL fall back to an SVG `clipPath` with a ResizeObserver-driven path recalculation.
9. WHILE the SVG fallback is active, THE NotchedSection resize handler SHALL throttle path recalculation through `requestAnimationFrame` and SHALL NOT write to the DOM more than once per animation frame.

### Requirement 8: Cursor Component

**User Story:** As a user on a pointer-fine device who has opted into the custom cursor, I want a dot-and-ring cursor that subtly tracks my movement, so that the site feels polished without obscuring interactive affordances.

#### Acceptance Criteria

1. THE Cursor_Component SHALL render a 12px circular dot filled with `e1-primary`.
2. THE Cursor_Component SHALL render a 40px ring stroked with `e1-primary` at 1px thickness.
3. WHEN the pointer moves, THE Cursor_Component SHALL update the dot position with `gsap.set` using `clientX` and `clientY` on the same frame.
4. WHEN the pointer moves, THE Cursor_Component SHALL update the ring position via `gsap.to` with duration 0.5 and ease `power3.out`.
5. WHEN the pointer enters an `<a>`, `<button>`, or element with the attribute `data-cursor-hover`, THE Cursor_Component SHALL tween the dot to scale 2.5 and `backgroundColor` `e1-text` (cream) with duration 0.2.
6. WHEN the pointer leaves the hover target, THE Cursor_Component SHALL tween the dot back to scale 1 and `e1-primary` with duration 0.2.
7. THE Cursor_Component SHALL only mount when Custom_Cursor_Enabled is true.

### Requirement 9: PageTransition Curtain

**User Story:** As a visitor navigating between pages, I want a brief terracotta curtain sweep, so that route changes feel intentional rather than abrupt.

#### Acceptance Criteria

1. THE Page_Transition SHALL render a full-viewport element with `position: fixed` and `z-index: 500` colored `e1-primary`.
2. WHEN the `useLocation` pathname changes, THE Page_Transition SHALL sweep the curtain from `yPercent: 100` to `yPercent: 0` over 0.5 seconds.
3. WHEN the curtain reaches `yPercent: 0`, THE Page_Transition SHALL crossfade the outgoing route content to the incoming route content.
4. WHEN the incoming route content is mounted, THE Page_Transition SHALL sweep the curtain from `yPercent: 0` to `yPercent: -100` over 0.5 seconds.
5. THE Page_Transition full sweep cycle SHALL complete within 1.0 seconds of the pathname change.
6. WHEN the curtain sweep completes, THE GSAP_Runtime SHALL call `ScrollTrigger.refresh()` exactly once.
7. WHILE Reduced_Motion is active, THE Page_Transition SHALL replace the curtain sweep with a 150ms opacity crossfade between route contents.

### Requirement 10: Marquee Component

**User Story:** As a visitor, I want a continuously looping marquee of E1 phrases in uppercase Fraunces, so that the brand voice animates across the screen without attention-grabbing jumps.

#### Acceptance Criteria

1. THE Marquee_Component SHALL render its phrases in Fraunces bold uppercase at `e1-primary`.
2. THE Marquee_Component SHALL separate phrases with the `✦` glyph.
3. WHEN rendered, THE Marquee_Component SHALL translate its content horizontally at 40 pixels per second via `gsap.to` with a custom `modifiers` callback that wraps the position to produce a seamless infinite loop.
4. WHEN the pointer enters the Marquee_Component, THE Marquee_Component SHALL tween its `timeScale` to a value equivalent to 8 pixels per second over 0.4 seconds.
5. WHEN the pointer leaves the Marquee_Component, THE Marquee_Component SHALL tween its `timeScale` back to the value equivalent to 40 pixels per second over 0.4 seconds.
6. WHILE Reduced_Motion is active, THE Marquee_Component SHALL render statically with no tween active.
7. WHEN the Marquee_Component unmounts, THE GSAP_Runtime SHALL kill the associated tween.

### Requirement 11: MagneticButton

**User Story:** As a visitor on a pointer-fine device, I want primary call-to-action buttons to lean toward my cursor, so that interactive targets feel responsive.

#### Acceptance Criteria

1. THE Magnetic_Button SHALL define a rectangular 60px magnetic bounding box around the button.
2. WHEN the pointer moves within the magnetic bounding box, THE Magnetic_Button SHALL tween its translate to `x: dx * 0.35, y: dy * 0.35` with duration 0.4 and ease `power2.out`, where `dx` and `dy` are the pointer offsets from the button center.
3. WHEN the pointer leaves the magnetic bounding box, THE Magnetic_Button SHALL spring back to `x: 0, y: 0` with ease `elastic.out(1, 0.4)` and duration 0.7.
4. WHERE the current environment matches `(hover: hover) and (pointer: fine)`, THE Magnetic_Button SHALL enable pointer tracking.
5. IF the current environment does not match `(hover: hover) and (pointer: fine)`, THEN THE Magnetic_Button SHALL behave as a standard button with no pointer tracking.
6. WHILE Reduced_Motion is active, THE Magnetic_Button SHALL disable pointer tracking.

### Requirement 12: Reveal Batch

**User Story:** As a page author, I want a single mechanism to reveal elements as they scroll into view, so that I do not wire per-element ScrollTriggers by hand.

#### Acceptance Criteria

1. THE Reveal_Batch SHALL select all elements with the class `.gs-reveal`.
2. WHEN `.gs-reveal` elements reach `start: "top 88%"` within the viewport, THE Reveal_Batch SHALL animate them from `{ opacity: 0, y: 50, scale: 0.96 }` to `{ opacity: 1, y: 0, scale: 1 }` with duration 0.8, stagger 0.1, and ease `power3.out`.
3. THE Reveal_Batch SHALL run exactly once per element per page lifetime.
4. WHEN the `useLocation` pathname changes, THE Reveal_Batch SHALL clear previous ScrollTriggers and re-select `.gs-reveal` elements in the new route.
5. WHILE Reduced_Motion is active, THE Reveal_Batch SHALL animate with opacity only, `y` and `scale` held at identity, and duration 150ms.

---

## Group C — HomePage

### Requirement 13: Hero SplitText Entrance

**User Story:** As a first-time visitor, I want the hero headline to animate in letter by letter, so that the first impression reinforces the editorial tone of the site.

#### Acceptance Criteria

1. THE HomePage hero headline SHALL be wrapped in a `SplitText` instance split by characters.
2. WHEN the hero headline mounts, THE HomePage hero headline SHALL animate its character spans from `{ opacity: 0, yPercent: 110, rotationX: -60 }` to `{ opacity: 1, yPercent: 0, rotationX: 0 }`.
3. THE HomePage hero headline entrance SHALL use stagger amount 0.6, ease `expo.out`, and duration 1.
4. THE HomePage hero headline parent element SHALL set `transformPerspective: 600`.
5. THE HomePage hero subtitle SHALL join the master timeline at position `"-=0.3"` relative to the headline.
6. THE HomePage hero call-to-action SHALL join the master timeline at position `"-=0.3"` relative to the subtitle.
7. THE HomePage hero headline parent element SHALL carry an `aria-label` attribute equal to the original headline string.
8. THE HomePage hero headline split character spans SHALL each carry `aria-hidden="true"`.

### Requirement 14: Hero Flip-In Card

**User Story:** As a first-time visitor, I want the hero focal card to flip into view and then idle gently, so that the hero feels alive without demanding continuous attention.

#### Acceptance Criteria

1. THE HomePage hero card SHALL initialize at `{ rotationY: 180, scale: 0.5, opacity: 0 }` via `gsap.set`.
2. WHEN the hero master timeline runs, THE HomePage hero card SHALL animate to `{ rotationY: 0, scale: 1, opacity: 1 }` with duration 1.2 and ease `back.out(1.4)`.
3. WHEN the flip-in animation completes, THE HomePage hero card SHALL start an idle float timeline tweening `y` to `-12` with ease `sine.inOut`, `yoyo: true`, and `repeat: -1`.
4. THE HomePage hero card artwork SHALL render the image referenced by `HERO_CARD_IMAGE` from the Assets_Module.
5. THE HomePage hero card artwork SHALL declare explicit `width`, `height`, and `fetchpriority="high"` attributes.

### Requirement 15: Hero Ambient Background Video

**User Story:** As a first-time visitor, I want a subtle ambient video behind the hero, so that the page conveys motion before I scroll.

#### Acceptance Criteria

1. THE HomePage SHALL render a `<video>` element behind the hero NotchedSection using the path referenced by `HERO_AMBIENT_VIDEO` from the Assets_Module.
2. THE HomePage ambient video SHALL render at approximately 25% opacity with a charcoal `e1-bg` overlay layered on top.
3. THE HomePage ambient video SHALL set the attributes `muted`, `autoplay`, `loop`, `playsInline`, and `preload="metadata"`.
4. THE HomePage ambient video SHALL declare a `poster` attribute pointing to `HERO_POSTER_IMAGE` from the Assets_Module.
5. WHILE Reduced_Motion is active, THE HomePage SHALL replace the ambient video with a static `<img>` using `HERO_POSTER_IMAGE`.
6. WHILE Save_Data is active, THE HomePage SHALL replace the ambient video with a static `<img>` using `HERO_POSTER_IMAGE`.

### Requirement 16: Trainer Connector (DrawSVG)

**User Story:** As a visitor exploring the HomePage, I want to see the six trainers connect to a central node through animated lines, so that the relationship between the student and trainers is immediately legible.

#### Acceptance Criteria

1. THE HomePage Trainer_Connector SHALL render a central node labelled "THE STUDENT" and exactly six radiating labelled branches.
2. THE HomePage Trainer_Connector paths SHALL animate from 0% drawn to 100% drawn using DrawSVGPlugin inside a ScrollTrigger-bound timeline.
3. THE HomePage Trainer_Connector ScrollTrigger SHALL use `trigger: sectionRef`, `start: "top 60%"`, and `toggleActions: "play none none reverse"`.
4. THE HomePage Trainer_Connector paths SHALL draw with stagger 0.12 and ease `power2.inOut`.
5. WHEN the path draws complete, THE HomePage Trainer_Connector trainer nodes SHALL scale in using ease `back.out(2)`.
6. THE HomePage Trainer_Connector SHALL render every labelled branch with text visible to assistive technology even when DrawSVG is unsupported.

### Requirement 17: Trainer Spotlight (Scroll-Pinned)

**User Story:** As a desktop visitor, I want each trainer to take focus in turn as I scroll, so that I can absorb each trainer's identity without being overwhelmed by a static grid.

#### Acceptance Criteria

1. WHILE the viewport width is greater than or equal to 1024px AND Reduced_Motion is not active, THE HomePage Trainer_Spotlight SHALL pin its root section using `ScrollTrigger.pin` for a scroll duration of 300vh.
2. WHILE the Trainer_Spotlight is pinned, THE HomePage Trainer_Spotlight SHALL progress its timeline using `scrub: 1`.
3. THE HomePage Trainer_Spotlight SHALL render inactive trainer cards at `opacity: 0.3` and `scale: 0.95`.
4. THE HomePage Trainer_Spotlight SHALL render the active trainer card at `opacity: 1` and `scale: 1`.
5. THE HomePage Trainer_Spotlight active trainer card SHALL display a terracotta left border whose `scaleY` animates from 0 to 1 as the card becomes active.
6. IF the viewport width is less than 1024px, THEN THE HomePage Trainer_Spotlight SHALL NOT pin and SHALL render each trainer as a sequential reveal entry in document order.

### Requirement 18: Pull-Quote Rule Draw

**User Story:** As a visitor finishing the HomePage, I want the closing pull quote underscored by a terracotta rule that draws in, so that the statement feels typographically weighted.

#### Acceptance Criteria

1. THE HomePage pull-quote SHALL render in italic Fraunces at full viewport bleed.
2. THE HomePage pull-quote SHALL render a terracotta rule sibling element of 100% container width.
3. WHEN the pull-quote ScrollTrigger fires at `start: "top 70%"`, THE HomePage pull-quote rule SHALL animate `scaleX` from 0 to 1 with `transformOrigin: "left center"`, duration 1.0, and ease `power3.out`.

### Requirement 19: HomePage Marquee Integration

**User Story:** As a HomePage visitor, I want the horizontal marquee to appear between major sections, so that rhythm carries through the scroll.

#### Acceptance Criteria

1. THE HomePage SHALL render exactly one Marquee_Component instance between the hero section and the Trainer_Connector section.
2. THE HomePage Marquee_Component SHALL populate its phrases from a local constant array defined in the HomePage component file.

### Requirement 20: HomePage Scroll Indicator

**User Story:** As a first-time visitor, I want a scroll indicator to bob gently under the hero, so that I understand the page continues below the fold.

#### Acceptance Criteria

1. THE HomePage SHALL render a scroll indicator affordance below the hero NotchedSection.
2. WHEN the HomePage mounts, THE HomePage scroll indicator SHALL animate `y` between 0 and 10 pixels with ease `sine.inOut`, `yoyo: true`, and `repeat: -1`.
3. WHILE Reduced_Motion is active, THE HomePage scroll indicator SHALL render statically.

---

## Group D — Scroll Systems

### Requirement 21: Route-Change ScrollTrigger Refresh

**User Story:** As a visitor clicking between routes, I want scroll-driven animations to re-measure correctly, so that nothing appears stuck or triggered at the wrong scroll position.

#### Acceptance Criteria

1. WHEN the `useLocation` pathname changes, THE E1_App SHALL call `ScrollTrigger.refresh()` exactly once after the new route has mounted and painted.
2. WHEN the Page_Transition completes its exit sweep, THE E1_App SHALL call `ScrollTrigger.refresh()`.
3. IF a component owning ScrollTriggers unmounts on route change, THEN THE GSAP_Runtime SHALL kill every owned ScrollTrigger instance before the new route mounts.

### Requirement 22: Pin Breakpoint Policy

**User Story:** As a mobile and tablet visitor, I want pinned scroll sequences to stand down, so that small viewports do not trap my scroll inside a 300vh pin.

#### Acceptance Criteria

1. THE E1_App SHALL define a single shared breakpoint of 1024px for enabling desktop-only pins.
2. WHILE the viewport width is less than 1024px, THE E1_App SHALL disable every `ScrollTrigger.pin` configured in this feature.
3. WHEN the viewport crosses 1024px via resize, THE E1_App SHALL call `ScrollTrigger.refresh()` within 250ms of the resize settling.

---

## Group E — Other Pages

### Requirement 23: AboutPage Editorial Treatment

**User Story:** As a visitor on the AboutPage, I want a counter and an editorial collage, so that the page reinforces both scale and craft.

#### Acceptance Criteria

1. THE AboutPage SHALL render a left column containing a large numeric counter.
2. WHEN the counter ScrollTrigger fires at `start: "top 70%"`, THE AboutPage counter SHALL tween its displayed value from 0 to the target value using `gsap.to` with `snap: { value: 1 }`.
3. THE AboutPage SHALL render a right column containing pull-quote paragraphs where each word is wrapped by SplitText.
4. WHEN each right-column pull-quote paragraph enters the viewport, THE AboutPage SHALL fade each word up with a per-word stagger.
5. THE AboutPage SHALL render an editorial collage using `ABOUT_COLLAGE_A`, `ABOUT_COLLAGE_B`, and `ABOUT_COLLAGE_C` from the Assets_Module in a staggered two-column layout.
6. THE AboutPage collage images SHALL declare explicit `width`, `height`, and `loading="lazy"` attributes.

### Requirement 24: VisionPage Vertical Timeline

**User Story:** As a visitor on the VisionPage, I want a vertical timeline whose connecting line draws as I scroll, so that my progress through the narrative is visible.

#### Acceptance Criteria

1. THE VisionPage SHALL render a vertical SVG `<line>` connecting every timeline node.
2. WHEN the VisionPage scrolls, THE VisionPage SHALL animate the SVG line with DrawSVGPlugin from 0% to 100% using `scrub: true`.
3. THE VisionPage SHALL render each timeline node as a ScrollTrigger reveal entry with `start: "top 70%"`.
4. THE VisionPage SHALL attach the images referenced by `VISION_NODE_1`, `VISION_NODE_2`, and `VISION_NODE_3` to three selected timeline entries as circular-cropped thumbnails.
5. THE VisionPage timeline thumbnails SHALL declare explicit `width`, `height`, and `loading="lazy"` attributes.

### Requirement 25: BookPage Form And Accent Video

**User Story:** As a visitor booking on the BookPage, I want minimal bottom-border inputs and a focus interaction that lifts the label, so that the form feels editorial rather than utilitarian.

#### Acceptance Criteria

1. THE BookPage form inputs SHALL render with a 1px bottom border and no other borders.
2. WHEN a BookPage input receives focus, THE BookPage SHALL tween its label to `y: -20`, `scale: 0.8`, and color `e1-primary` via `gsap.to`.
3. WHEN a BookPage input loses focus with an empty value, THE BookPage SHALL tween its label back to the resting state.
4. THE BookPage submit button SHALL be wrapped in a Magnetic_Button.
5. WHEN the pointer hovers the BookPage submit button, THE BookPage SHALL slide the inline right-arrow glyph 12 pixels to the right via `gsap.to`.
6. THE BookPage SHALL render a NotchedSection hero strip containing a silent looping `<video>` that references `BOOK_ACCENT_VIDEO` from the Assets_Module.
7. THE BookPage accent video SHALL set the attributes `muted`, `autoplay`, `loop`, `playsInline`, and `preload="metadata"`.

### Requirement 26: ContactPage Form Treatment

**User Story:** As a visitor contacting the team, I want the ContactPage form to match the BookPage typography and interaction, so that both forms feel like one system.

#### Acceptance Criteria

1. THE ContactPage form inputs SHALL render with a 1px bottom border and no other borders.
2. WHEN a ContactPage input receives focus, THE ContactPage SHALL tween its label to `y: -20`, `scale: 0.8`, and color `e1-primary` via `gsap.to`.
3. THE ContactPage submit button SHALL be wrapped in a Magnetic_Button.
4. WHEN the pointer hovers the ContactPage submit button, THE ContactPage SHALL slide the inline right-arrow glyph 12 pixels to the right via `gsap.to`.

### Requirement 27: ResultsPage Testimonial Reel

**User Story:** As a visitor on the ResultsPage, I want a full-width testimonial video that I can play or pause, so that I control whether the reel plays.

#### Acceptance Criteria

1. THE ResultsPage SHALL render a full-width `<video>` referencing `RESULTS_TESTIMONIAL_VIDEO` from the Assets_Module.
2. THE ResultsPage testimonial video SHALL default to the paused state on first render.
3. THE ResultsPage SHALL render an accessible play/pause control with `aria-pressed` reflecting the current state.
4. WHEN the play/pause control is activated, THE ResultsPage SHALL toggle the video play state.
5. WHILE Reduced_Motion is active, THE ResultsPage testimonial video SHALL remain paused on first render regardless of autoplay attributes.

### Requirement 28: Inheritance Pages

**User Story:** As a visitor on JoinPage, CrisisPage, ResourcesPage, SystemsPage, SystemDetailPage, or SafetyPage, I want the new design system to apply consistently, so that no page looks out of place.

#### Acceptance Criteria

1. THE JoinPage SHALL render its sections inside NotchedSection wrappers with alternating `tone` prop values.
2. THE CrisisPage SHALL render its sections inside NotchedSection wrappers with alternating `tone` prop values.
3. THE ResourcesPage SHALL render its sections inside NotchedSection wrappers with alternating `tone` prop values.
4. THE SystemsPage SHALL render its sections inside NotchedSection wrappers with alternating `tone` prop values.
5. THE SystemDetailPage SHALL render its sections inside NotchedSection wrappers with alternating `tone` prop values.
6. THE SafetyPage SHALL render its sections inside NotchedSection wrappers with alternating `tone` prop values.
7. THE JoinPage, CrisisPage, ResourcesPage, SystemsPage, SystemDetailPage, and SafetyPage SHALL tag their primary content blocks with the class `.gs-reveal` for Reveal_Batch animation.
8. THE JoinPage, CrisisPage, ResourcesPage, SystemsPage, SystemDetailPage, and SafetyPage primary calls-to-action SHALL be wrapped in Magnetic_Button.
9. THE JoinPage, CrisisPage, ResourcesPage, SystemsPage, SystemDetailPage, and SafetyPage SHALL NOT introduce bespoke hero animations beyond the Reveal_Batch.

---

## Group F — Navigation, Footer, and Structural Constraints

### Requirement 29: Navigation And Footer Restyling

**User Story:** As a visitor, I want the existing navigation and footer to adopt the new tokens and typography, so that the shell visually matches the page body.

#### Acceptance Criteria

1. THE Navigation component SHALL apply the E1 color and typography tokens introduced by this feature.
2. THE Footer component SHALL apply the E1 color and typography tokens introduced by this feature.
3. THE Navigation component structure, link set, and link targets SHALL remain unchanged by this feature.
4. THE Footer component structure, link set, and link targets SHALL remain unchanged by this feature.
5. THE E1_App SHALL retain every `lucide-react` icon currently in use and SHALL only restyle their containers.

### Requirement 30: Structural Preservation

**User Story:** As a maintainer reviewing the diff, I want routing, page filenames, content, and backend endpoints to be untouched, so that the overhaul is strictly presentational.

#### Acceptance Criteria

1. THE E1_App SHALL preserve every route path currently declared in `src/App.js`.
2. THE E1_App SHALL preserve every page component filename under `src/pages/`.
3. THE E1_App SHALL preserve every page-level data constant and copy string as currently authored.
4. THE E1_App SHALL NOT modify any backend endpoint under `backend/`.
5. THE E1_App SHALL NOT introduce analytics instrumentation as part of this feature.
6. THE E1_App SHALL NOT introduce internationalization changes as part of this feature.

---

## Group G — QA, Performance, and Accessibility

### Requirement 31: Lighthouse Performance Targets

**User Story:** As a maintainer, I want measurable performance targets, so that the animation-heavy redesign does not regress core vitals.

#### Acceptance Criteria

1. THE E1_App SHALL achieve a Lighthouse performance score greater than or equal to 85 on a desktop Lighthouse run against the production build.
2. THE E1_App SHALL achieve a Lighthouse performance score greater than or equal to 75 on a mobile Lighthouse run against the production build.
3. THE E1_App SHALL achieve a Largest Contentful Paint less than or equal to 2.8 seconds on a simulated Fast 3G Lighthouse run against the production build.
4. THE E1_App SHALL achieve a Cumulative Layout Shift less than or equal to 0.05 on a desktop Lighthouse run against the production build.
5. THE E1_App SHALL achieve an Interaction to Next Paint less than or equal to 200ms measured during scroll on a mid-tier laptop trace.

### Requirement 32: Media Dimension Discipline

**User Story:** As a performance reviewer, I want every media element to reserve space before load, so that cumulative layout shift stays under budget.

#### Acceptance Criteria

1. THE E1_App SHALL render every `<img>` element with either explicit `width` and `height` attributes or an `aspect-ratio` CSS declaration.
2. THE E1_App SHALL render every `<video>` element with either explicit `width` and `height` attributes or an `aspect-ratio` CSS declaration.
3. THE E1_App SHALL declare `loading="lazy"` on every `<img>` element except the above-the-fold hero image.
4. THE E1_App SHALL declare `fetchpriority="high"` on the above-the-fold hero image.
5. THE E1_App SHALL declare meaningful `alt` text on every `<img>` element, populated from the Assets_Module `altPlaceholder` field until content is finalized.

### Requirement 33: Accessibility Baseline

**User Story:** As a user relying on assistive technology, I want the site to pass an Axe-core automated audit, so that obvious accessibility defects are caught before release.

#### Acceptance Criteria

1. THE E1_App production build SHALL report zero serious or critical violations from an Axe-core automated scan on every route.
2. THE E1_App SHALL maintain a minimum 4.5:1 text contrast ratio between `e1-text` and `e1-bg`.
3. THE E1_App SHALL maintain a minimum 4.5:1 text contrast ratio between `e1-text` and `e1-surface`.
4. THE Cursor_Component SHALL NOT remove any native focus ring.
5. THE Page_Transition SHALL NOT trap keyboard focus while the curtain is active.

### Requirement 34: GSAP Cleanup Discipline

**User Story:** As a maintainer, I want every animation to clean up on unmount, so that route changes do not leak timelines, ScrollTriggers, or event listeners.

#### Acceptance Criteria

1. THE E1_App SHALL wrap every GSAP timeline and ScrollTrigger authored by this feature inside a `useGSAP` hook invocation scoped to a component ref.
2. WHEN a component using `useGSAP` unmounts, THE GSAP_Runtime SHALL revert its `gsap.context()` and kill every owned tween, timeline, and ScrollTrigger.
3. THE E1_App SHALL NOT leave event listeners attached to `window`, `document`, or `document.body` after a route change for animations authored by this feature.

### Requirement 35: Error Handling For Missing Assets

**User Story:** As a visitor when an asset fails to load, I want graceful fallbacks, so that the page does not break visually.

#### Acceptance Criteria

1. IF the HomePage ambient video fails to load, THEN THE HomePage SHALL render the poster JPEG in its place.
2. IF an image referenced by the Assets_Module fails to load, THEN THE consuming component SHALL render the `e1-surface` colored placeholder block at the same declared dimensions.
3. IF the GSAP SplitText instance fails to initialize, THEN THE HomePage hero headline SHALL render as plain text at full opacity.
4. IF the DrawSVGPlugin is unavailable at runtime, THEN THE HomePage Trainer_Connector SHALL render its SVG paths fully drawn.

---

## Out Of Scope

The following items are explicitly out of scope for this feature:

- Changes to route paths, page component filenames, or page-level content.
- Changes to backend endpoints, backend logic, or API contracts.
- Structural changes to the Navigation or Footer components beyond token and typography restyling.
- Replacement or removal of existing `lucide-react` icons.
- Introduction of analytics, telemetry, or user tracking.
- Introduction of internationalization or locale-aware rendering.
- Authoring of final `alt` text content for assets; placeholders are acceptable pending content team input.
