# Requirements Document

## Introduction

This feature consolidates the application from 12 pages down to 7 pages (plus 1 sub-route) and replaces broken premium GSAP plugin animations with prominent, visible scroll animations using only the free GSAP core + ScrollTrigger. The animation vocabulary consists of parallax layers, dramatic staggered reveals, and horizontal scroll sections. All premium plugin dependencies (SplitText, DrawSVGPlugin, Flip, MorphSVGPlugin) are removed entirely. During page merges, redundant content is aggressively trimmed — only the essential narrative survives.

## Glossary

- **Animation_Engine**: The GSAP core library combined with the free ScrollTrigger plugin, registered in `src/lib/gsap.js`
- **ScrollTrigger**: The free GSAP plugin that links animations to scroll position, supporting scrub, pin, and batch modes
- **Parallax_Layer**: A visual element whose vertical translation is scrubbed to scroll progress at a rate different from the page scroll, creating depth
- **Staggered_Reveal**: An animation where multiple sibling elements animate sequentially into view with a time offset between each
- **Horizontal_Scroll_Section**: A pinned viewport-height section where vertical scroll input drives horizontal translation of an inner track
- **Scrub**: A ScrollTrigger mode where animation progress is directly tied to scroll position rather than playing on a timeline
- **Pin**: A ScrollTrigger mode where an element is fixed in the viewport while scroll progress drives animations within it
- **Consolidated_Page**: A page formed by merging two or more existing pages, with redundant content removed
- **SystemDetailPage**: The dynamic sub-route (`/systems/:slug`) that renders individual system guide content
- **Reduced_Motion**: The `prefers-reduced-motion: reduce` media query state where transform-based animations are suppressed
- **App_Shell**: The `AppShell` component in `App.js` that hosts the router, navigation, footer, cursor, and page transition wrapper

## Requirements

### Requirement 1: Page Consolidation — About + Vision + Contact Merge

**User Story:** As a visitor, I want a single comprehensive "About" page that tells the founder's story, the project vision, and provides a contact form, so that I do not need to navigate between three separate thin pages.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/about`, THE App_Shell SHALL render a single AboutPage containing the founder story, timeline, mission statement, vision roadmap, and contact form
2. THE App_Shell SHALL remove the `/vision` route and the `/contact` route from the route configuration
3. WHEN a visitor navigates to `/vision` or `/contact`, THE App_Shell SHALL redirect to `/about`
4. THE AboutPage SHALL preserve the following sections in order: hero, counter band, editorial collage, timeline, vision roadmap, and contact form
5. THE AboutPage SHALL remove duplicate content that appears in both the prior About and Vision pages, keeping only the more detailed version of each overlapping topic
6. THE AboutPage SHALL remove the "The Mission" section whose content is already expressed in the pull-quote paragraphs of the counter band

### Requirement 2: Page Consolidation — Crisis + Safety Merge

**User Story:** As a visitor in distress or concerned about programme safety, I want a single page that provides both emergency resources and anti-weaponisation protocols, so that all protective information is accessible in one place.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/safety`, THE App_Shell SHALL render a single SafetyPage containing emergency numbers, provincial resources, the Non-Negotiable rule, Trained Tyrant profile, Silent Exclusion guide, facilitator vetting checklist, and anonymous report form
2. THE App_Shell SHALL remove the `/crisis` route from the route configuration
3. WHEN a visitor navigates to `/crisis`, THE App_Shell SHALL redirect to `/safety`
4. THE SafetyPage SHALL place emergency contact numbers and the crisis CTA at the top of the page, above all other content
5. THE SafetyPage SHALL remove the duplicated "For Men in Crisis" footer section that repeats the hero message

### Requirement 3: Page Consolidation — Resources + Systems Merge

**User Story:** As a Brotherhood Circle participant, I want a single page listing all downloadable tools, voice note prompts, and system guides, so that I can find every practical resource in one place.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/resources`, THE App_Shell SHALL render a single ResourcesPage containing voice note prompts, printable PDFs, special guides, and the full system guide index
2. THE App_Shell SHALL remove the `/systems` route from the route configuration
3. WHEN a visitor navigates to `/systems`, THE App_Shell SHALL redirect to `/resources`
4. THE App_Shell SHALL preserve the `/systems/:slug` route pointing to SystemDetailPage
5. THE ResourcesPage SHALL remove the "Need the Expanded System Guides?" CTA section since the system guides now appear on the same page
6. THE ResourcesPage SHALL present system guides with their trainer colour pills and descriptions as they appear in the current SystemsPage

### Requirement 4: Route Cleanup and Navigation Update

**User Story:** As a visitor, I want the site navigation to reflect the consolidated page structure, so that I can find content without encountering dead links.

#### Acceptance Criteria

1. THE Navigation component SHALL display links only to the consolidated set of pages: Home, Book, Join, Safety, Resources, About, Results
2. THE Navigation component SHALL remove links to Vision, Contact, Crisis, and Systems as standalone destinations
3. THE Footer component SHALL update all internal links to point to the consolidated routes
4. WHEN any internal link previously pointed to `/vision`, `/contact`, `/crisis`, or `/systems`, THE link SHALL point to the corresponding consolidated page instead

### Requirement 5: Remove Premium GSAP Plugin Dependencies

**User Story:** As a developer, I want all premium GSAP plugin references removed from the codebase, so that the application does not attempt to load unavailable plugins and animations work reliably with only free tools.

#### Acceptance Criteria

1. THE Animation_Engine module (`src/lib/gsap.js`) SHALL remove all `require` calls and exports for SplitText, DrawSVGPlugin, Flip, and MorphSVGPlugin
2. THE Animation_Engine module SHALL export only `gsap` and `ScrollTrigger`
3. WHEN any component previously used SplitText for per-word or per-character animation, THE component SHALL replace that animation with a whole-element opacity + y transform animation using gsap core
4. WHEN any component previously used DrawSVGPlugin for path drawing, THE component SHALL replace that animation with a CSS stroke-dasharray and stroke-dashoffset animation triggered by ScrollTrigger
5. THE codebase SHALL contain zero import statements referencing `gsap/SplitText`, `gsap/DrawSVGPlugin`, `gsap/Flip`, or `gsap/MorphSVGPlugin`

### Requirement 6: Parallax Layer Animations

**User Story:** As a visitor, I want background elements and images to move at different speeds during scroll, creating a sense of depth and visual richness as I navigate the site.

#### Acceptance Criteria

1. THE HomePage hero section SHALL contain at least one parallax layer where a background element translates vertically at a rate slower than the page scroll, scrubbed to scroll progress
2. THE AboutPage collage section SHALL apply parallax offsets to the staggered images so that left-column and right-column images move at different rates during scroll
3. WHEN ScrollTrigger scrub is applied to a parallax element, THE Animation_Engine SHALL set `scrub: true` and define a y-translation range of at least 50px difference between start and end positions
4. WHILE `prefers-reduced-motion: reduce` is active, THE Animation_Engine SHALL disable all parallax translations and render elements at their static resting positions

### Requirement 7: Dramatic Staggered Reveal Animations

**User Story:** As a visitor, I want page elements to animate prominently into view as I scroll, with large movement and sequential timing that makes the page feel alive and intentional.

#### Acceptance Criteria

1. THE Animation_Engine SHALL replace the current `.gs-reveal` batch configuration with a more dramatic version using `y: 120` initial offset, `scale: 0.85` initial scale, and `opacity: 0` initial state
2. WHEN a batch of `.gs-reveal` elements enters the viewport, THE Animation_Engine SHALL animate them to `{ opacity: 1, y: 0, scale: 1 }` with `duration: 1.0`, `stagger: 0.15`, and `ease: "power3.out"`
3. THE staggered reveal SHALL trigger when elements cross `start: "top 85%"` of the viewport
4. WHILE `prefers-reduced-motion: reduce` is active, THE Animation_Engine SHALL show all elements immediately at their final position without any transform or opacity animation
5. THE HomePage trainer cards, BookPage chapter list, ResourcesPage system guide cards, and SafetyPage warning signs SHALL all use the `.gs-reveal` class to participate in staggered reveals

### Requirement 8: Horizontal Scroll Section

**User Story:** As a visitor, I want at least one section on the site where vertical scrolling drives horizontal movement of content, creating a distinctive and memorable browsing experience.

#### Acceptance Criteria

1. THE HomePage SHALL contain a horizontal scroll section where the Six Trainers are presented as horizontally-scrolling cards driven by vertical scroll input
2. THE horizontal scroll section SHALL pin its container to the viewport using ScrollTrigger pin while the inner track translates horizontally
3. THE horizontal scroll section SHALL span a scroll distance equal to the total width of the inner track minus one viewport width, so that all cards are reachable
4. THE horizontal scroll section SHALL use `scrub: 1` for smooth scroll-linked movement
5. WHILE the viewport width is below 768px, THE horizontal scroll section SHALL fall back to a standard vertical stack layout without pinning
6. WHILE `prefers-reduced-motion: reduce` is active, THE horizontal scroll section SHALL render as a standard vertical stack without pinning or horizontal translation

### Requirement 9: SVG Path Draw Animation (CSS-Based)

**User Story:** As a visitor viewing the vision roadmap timeline, I want the connecting line to draw progressively as I scroll, providing a visual sense of progress through the timeline.

#### Acceptance Criteria

1. THE AboutPage vision roadmap timeline SHALL render its connecting vertical line as an SVG path with `stroke-dasharray` and `stroke-dashoffset` CSS properties
2. WHEN the timeline section enters the viewport, THE Animation_Engine SHALL animate `stroke-dashoffset` from the full path length to 0 using ScrollTrigger with `scrub: true`
3. THE path draw animation SHALL use the timeline section as its trigger, with `start: "top center"` and `end: "bottom center"`
4. WHILE `prefers-reduced-motion: reduce` is active, THE SVG path SHALL render fully drawn from first paint with no animation

### Requirement 10: Counter Animation Preservation

**User Story:** As a visitor viewing the About page, I want the numeric counter to animate upward as it scrolls into view, providing a dynamic data visualization moment.

#### Acceptance Criteria

1. THE AboutPage counter band SHALL preserve the existing counter animation that tweens from 0 to 200 using `gsap.to` with `snap: { value: 1 }`
2. THE counter animation SHALL trigger once when the counter element crosses `start: "top 70%"` of the viewport
3. WHILE `prefers-reduced-motion: reduce` is active, THE counter SHALL display its final value immediately without animation

### Requirement 11: Text Reveal Without SplitText

**User Story:** As a visitor, I want pull-quote paragraphs to animate into view with a visible reveal effect that does not depend on the premium SplitText plugin.

#### Acceptance Criteria

1. WHEN a pull-quote paragraph enters the viewport, THE Animation_Engine SHALL animate the entire paragraph element from `{ opacity: 0, y: 40 }` to `{ opacity: 1, y: 0 }` with `duration: 0.8` and `ease: "power3.out"`
2. THE AboutPage pull-quote paragraphs SHALL animate sequentially with a `stagger: 0.2` delay between each paragraph
3. THE Animation_Engine SHALL NOT use SplitText or any per-word/per-character DOM manipulation for text animations
4. WHILE `prefers-reduced-motion: reduce` is active, THE paragraphs SHALL appear immediately at full opacity without animation

### Requirement 12: Animation Performance and Cleanup

**User Story:** As a developer, I want all scroll animations to be properly scoped, cleaned up on route change, and performant, so that the application does not leak memory or degrade over time.

#### Acceptance Criteria

1. THE Animation_Engine SHALL create all ScrollTrigger instances inside `useGSAP` hooks scoped to the page component's root ref
2. WHEN a route change occurs, THE Animation_Engine SHALL automatically revert all ScrollTrigger instances, pins, and tweens owned by the unmounting page
3. THE Animation_Engine SHALL call `ScrollTrigger.refresh()` after each route transition completes to recalculate trigger positions for the new page
4. THE Animation_Engine SHALL use `will-change: transform` on parallax and pinned elements and remove it after animation completes where possible
5. IF a ScrollTrigger pin is active on desktop and the viewport resizes below 768px, THEN THE Animation_Engine SHALL call `ScrollTrigger.refresh()` within 250ms of the resize settling

### Requirement 13: Aggressive Content Trimming During Merges

**User Story:** As a visitor, I want each consolidated page to be concise and non-repetitive, so that I am not reading the same information twice on a single page.

#### Acceptance Criteria

1. WHEN the About and Vision pages are merged, THE AboutPage SHALL remove the "Phase 2 / Phase 3" summary cards from the infrastructure section since the roadmap timeline already covers this information
2. WHEN the About and Vision pages are merged, THE AboutPage SHALL remove the "The Mission" section since its content duplicates the pull-quote paragraphs in the counter band
3. WHEN the Crisis and Safety pages are merged, THE SafetyPage SHALL remove the "For Men in Crisis" repeated footer section
4. WHEN the Resources and Systems pages are merged, THE ResourcesPage SHALL remove the "Need the Expanded System Guides?" CTA section
5. THE merged pages SHALL not contain any paragraph or data point that appears more than once on the same page
