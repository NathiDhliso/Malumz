# Implementation Plan: Conversion-Focused Simplification

## Overview

Radically simplify the Malumz website from 7+ pages to exactly 5 pages by removing unused components, simplifying navigation and footer, restructuring page layouts for conversion focus, and updating routing with redirects — all while preserving GSAP animations and the purchase flow.

## Tasks

- [x] 1. Update routing and remove page imports
  - [x] 1.1 Update App.js route configuration and redirects
    - Remove imports for `ResultsPage`, `ResourcesPage`, and `SystemDetailPage`
    - Replace `<Route path="/results" ...>`, `<Route path="/resources" ...>`, and `<Route path="/systems/:slug" ...>` with `<Navigate to="/" replace />` redirects
    - Update `<Route path="/systems" ...>` redirect target from `/resources` to `/`
    - Ensure existing redirects for `/vision`, `/contact`, `/crisis` remain unchanged
    - Verify only 5 page routes remain: `/`, `/book`, `/join`, `/about`, `/safety`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Simplify Navigation component
  - [x] 2.1 Refactor Navigation to flat links
    - Replace `navLinks` array with exactly 4 flat items: Home (`/`), Book (`/book`), Join (`/join`), About (`/about`)
    - Remove the "Learn" dropdown category and its children
    - Remove `ChevronDown` icon import
    - Remove `openDropdown` state and all dropdown rendering logic
    - Remove dropdown-related mouse event handlers (onMouseEnter, onMouseLeave, onClick for dropdown toggle)
    - Retain the "I Need Help" CTA button linking to `/safety`
    - Ensure mobile menu renders the same 4 links plus the Crisis button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Simplify Footer component
  - [x] 3.1 Reduce Footer to minimal layout
    - Update footer links to include all 5 pages: Home, Book, Join, About, Safety
    - Display site email address (nkosinathi.dhliso@gmail.com)
    - Retain social media links (Instagram, LinkedIn)
    - Remove content categories column, resource links, and vision roadmap links
    - Retain `CursorSettingsToggle`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [~] 4. Checkpoint - Verify navigation and routing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Simplify HomePage
  - [x] 5.1 Strip HomePage to hero + single testimonial
    - Remove imports: `TrainerConnector`, `HorizontalTrainers`, `PullQuote`, `StoryBridge`, `Marquee`, `ScrollIndicator`
    - Remove constants: `sixTrainers`, `pilotStats`, `HOME_MARQUEE_PHRASES`, `CONNECTOR_LABELS`
    - Remove JSX rendering of all removed components
    - Modify `HeroSection` to include dual CTAs: "Buy the Book" linking to `/book` and "Join a Circle" linking to `/join`
    - Add a visible "I Need Help" crisis button within the hero section
    - Add maximum one testimonial or social proof statistic below the hero
    - Retain `.gs-reveal` classes and scroll reveal participation on remaining content
    - Retain the parallax hero effect on the hero section
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 9.1, 9.2, 11.1, 12.1_

- [x] 6. Restructure BookPage for purchase-first layout
  - [x] 6.1 Move BookPurchasePanel to top and remove filler
    - Remove the video hero strip (`<NotchedSection>` with `<video>`)
    - Remove the "Request a Signed Copy" form section (the `FloatingField` form)
    - Remove the separate "Audiobook Access" section
    - Remove `FloatingField` component usage, `LABEL_LIFT_VARS`, `LABEL_REST_VARS`, `ARROW_HOVER_VARS`, `ARROW_REST_VARS` constants
    - Replace video hero with a simple text hero (title + subtitle)
    - Render `BookPurchasePanel` as the first content section immediately below the hero
    - Keep a brief chapter preview section below the purchase panel with `.gs-reveal` animations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 11.2, 12.2_

- [x] 7. Simplify JoinPage form
  - [x] 7.1 Reduce JoinPage to 3-field interest form
    - Remove "Choose Your Model" section (model A/B selection buttons)
    - Remove "How to Start Your Circle" 7-step process section
    - Remove "Download the Starter Pack" section
    - Remove `selectedModel` state and `steps` constant
    - Remove Circle Model dropdown
    - Add one-sentence explanation of what a Brotherhood Circle is
    - Simplify form to exactly 3 fields: Name, Email, City/Area
    - Change field label from "Facilitator Name" to "Name"
    - Render a single Submit button
    - Update API submission subject from model-specific to `"Brotherhood Circle Interest"`
    - Remove `model` field from form data
    - Keep `submitContact` API integration
    - Keep success confirmation message display
    - Keep `.gs-reveal` on heading
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 11.3, 12.3_

- [~] 8. Checkpoint - Verify page simplifications
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Reduce AboutPage content
  - [-] 9.1 Strip AboutPage to founder story + contact form
    - Remove "The Story" timeline section
    - Remove "The Roadmap" vision timeline section
    - Remove "Formal Infrastructure Vision" section
    - Remove "Malumz Network" requirements section
    - Remove anti-predator protocols section
    - Remove policy recommendations content
    - Remove editorial collage section
    - Remove unused imports: `Calendar`, `Heart`, `TrendingUp`, `Building2`, `Users`, `FileText`, `MapPin`
    - Remove unused constants: `timelineEvents`, `TIMELINE`, `infrastructureItems`, `malumzRequirements`, `antiPredatorProtocols`, `COLLAGE_ITEMS`
    - Remove unused asset imports: `ABOUT_COLLAGE_A/B/C`, `VISION_NODE_1/2/3`
    - Keep counter animation (COUNTER_TARGET = 200) with the statistic
    - Keep founder story (max 3 paragraphs)
    - Keep contact form at bottom
    - Keep `.gs-reveal` and scroll reveal animations on remaining content
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 9.1, 9.3, 11.4, 12.5_

- [ ] 10. Streamline SafetyPage
  - [-] 10.1 Reduce SafetyPage to crisis essentials
    - Remove provincial resources accordion (`provinces` data + `<details>` section)
    - Remove "Trained Tyrant Profile" section (`tyrantSigns` data)
    - Remove "Silent Exclusion Guide" section
    - Remove "Facilitator Vetting Checklist" section (`vettingChecklist` data)
    - Remove "Safety" secondary hero and "The Non-Negotiable" section
    - Keep crisis hero with "You Are Not Alone" messaging and Lifeline CTA
    - Keep emergency numbers grid with tappable `tel:` links (Lifeline, SADAG, GBV Command Centre)
    - Add single SADAG website link for provincial resources
    - Keep anonymous report form below crisis numbers
    - Keep `.gs-reveal` animations on remaining content
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.1, 11.5, 12.4_

- [ ] 11. Delete unused component files
  - [~] 11.1 Remove component and page files from codebase
    - Delete `src/components/home/HorizontalTrainers.js`
    - Delete `src/components/home/TrainerConnector.js`
    - Delete `src/components/home/StoryBridge.js`
    - Delete `src/components/home/PullQuote.js`
    - Delete `src/components/home/ScrollIndicator.js`
    - Delete `src/components/Marquee.js`
    - Delete `src/pages/ResultsPage.js`
    - Delete `src/pages/ResourcesPage.js`
    - Delete `src/pages/SystemDetailPage.js`
    - Verify no remaining imports reference these deleted files
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 9.4, 9.5, 9.6_

- [~] 12. Checkpoint - Verify full simplification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Write unit and integration tests
  - [~] 13.1 Write route redirect integration tests
    - Test `/results` redirects to `/`
    - Test `/resources` redirects to `/`
    - Test `/systems/any-slug` redirects to `/`
    - Test `/vision` redirects to `/about`
    - Test `/contact` redirects to `/about`
    - Test `/crisis` redirects to `/safety`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [~] 13.2 Write Navigation unit tests
    - Verify exactly 4 flat text links rendered: Home, Book, Join, About
    - Verify "I Need Help" button links to `/safety`
    - Verify no dropdown menus or ChevronDown icons rendered
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [~] 13.3 Write page content unit tests
    - Verify HomePage renders dual CTAs and crisis button, does NOT render Marquee/StoryBridge/TrainerConnector/HorizontalTrainers/PullQuote
    - Verify BookPage renders BookPurchasePanel as first content section, does NOT render video hero or signed copy form
    - Verify JoinPage renders exactly 3 form fields (Name, Email, City/Area) and submit button, does NOT render model selection or 7-step process
    - Verify AboutPage renders max 3 paragraphs + contact form, does NOT render timeline/vision/infrastructure sections
    - Verify SafetyPage renders crisis numbers as tappable `tel:` links and report form, does NOT render accordion/tyrant/vetting sections
    - _Requirements: 4.1–4.9, 5.1–5.5, 6.1–6.8, 7.1–7.7, 8.1–8.8, 11.1–11.5_

- [~] 14. Final checkpoint - Verify build and bundle
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after major changes
- No property-based tests are included — this feature is a UI restructuring task where all assertions are "SHALL render X" / "SHALL NOT render X" checks best verified with example-based component tests
- The design explicitly uses JavaScript (React), so all implementation uses the existing React/JSX codebase
- Animations (scroll reveals, counter, parallax) are preserved by retaining `.gs-reveal` classes and GSAP hooks — no animation code needs to be written, only preserved

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["5.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["9.1", "10.1"] },
    { "id": 3, "tasks": ["11.1"] },
    { "id": 4, "tasks": ["13.1", "13.2", "13.3"] }
  ]
}
```
