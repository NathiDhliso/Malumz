# Design Document: Light Mode Palette

## Overview

This feature swaps the Malumz frontend from a dark palette to a light palette by updating four Tailwind color token values and a handful of hardcoded hex references. Because the site already uses token-based utility classes throughout, the change cascades automatically to Navigation, PageTransition, borders, and most component surfaces. Only files that contain literal hex strings (GSAP tween colors, scrollbar CSS, body background) require manual edits.

## Architecture

The palette is a single-source-of-truth system:

```
tailwind.config.js (token definitions)
        │
        ├── Utility classes (bg-e1-bg, text-e1-text, etc.)
        │       └── All components via className props
        │
        ├── index.css (body background — hardcoded hex)
        ├── App.css (scrollbar + focus ring — hardcoded hex)
        │
        └── GSAP tween targets (Cursor.js, BookPage.js, ContactPage.js — hardcoded hex constants)
```

No new components, hooks, or modules are introduced. No architectural changes.

## Components Affected

### 1. `tailwind.config.js`

Update four token values:

```javascript
colors: {
  'e1-bg': '#FFFFFF',        // was #09060A
  'e1-surface': '#FFF8F0',   // was #1E0D05
  'e1-text': '#1A1A1A',      // was #F0E2CB
  'e1-text-muted': '#6B5B4F', // was #907A61
  'e1-primary': '#C2491A',   // unchanged
  'e1-secondary': '#C8891E', // unchanged
  'e1-highlight': '#E4BE6A', // unchanged
}
```

### 2. `src/index.css`

```css
body {
  background-color: #FFFFFF; /* was #F9F7F2 */
}
```

### 3. `src/App.css`

```css
::-webkit-scrollbar-track {
  background: #FFFFFF; /* was #F9F7F2 */
}

::-webkit-scrollbar-thumb {
  background: #C2491A; /* was #CC5500 */
}

::-webkit-scrollbar-thumb:hover {
  background: #9A3814; /* darker shade of primary, was #A04000 */
}

*:focus-visible {
  outline: 2px solid #C2491A; /* was #CC5500 */
}
```

### 4. `src/components/Cursor.js`

Update the hover color constant:

```javascript
const HOVER_COLOR = "#1A1A1A"; // e1-text (was #F0E2CB)
```

The dot color (`#C2491A`) is an accent and remains unchanged.

### 5. `src/pages/BookPage.js` and `src/pages/ContactPage.js`

Update the GSAP label color constant:

```javascript
const E1_TEXT_MUTED_HEX = '#6B5B4F'; // was #907A61
```

### 6. `src/components/home/HeroSection.js`

The hero overlay currently uses `bg-e1-bg opacity-75`. With `e1-bg` now `#FFFFFF`, a white overlay at 75% opacity over a dark video produces a washed-out light surface. The text color `e1-text` (`#1A1A1A`) against this composite easily exceeds WCAG AA 4.5:1 contrast. The overlay class and opacity value remain unchanged — the token swap handles it.

If the resulting visual is too washed-out aesthetically, the opacity can be tuned down (e.g., `opacity-60`), but contrast will still pass since dark text on a light-washed background has inherently high contrast.

### 7. `src/pages/BookPage.js` — Hero Overlay

Same pattern as HeroSection: `bg-e1-bg/70` adapts automatically via the token change.

### 8. `src/components/home/StoryBridge.js`

Replace `ring-white/10` with `ring-black/10` for the card ring on light background:

```javascript
className="w-full max-w-sm rounded-xl shadow-2xl ring-1 ring-black/10 object-cover"
```

### 9. `src/__tests__/foundation/tailwind.config.test.js`

Update the expected color map to match new token values.

## Data Model

No data model changes. This feature only affects visual presentation tokens.

## Interfaces

No new interfaces or APIs. All changes are internal to the frontend styling layer.

## Error Handling

No new error states. If a token is misconfigured, Tailwind will fail to compile — caught at build time.

## GSAP Animation Preservation

All GSAP timelines, ScrollTrigger configurations, easing functions, durations, and plugin registrations remain untouched. Only the hex color string constants passed to `gsap.to()` for label animations and cursor hover are updated to reflect the new palette values.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing all 13 requirements and their acceptance criteria, no criteria are suitable for property-based testing. The entire feature consists of:

1. **Static configuration values** (token hex codes, CSS values) — these are deterministic constants with no input variation.
2. **Class presence checks** (Navigation, PageTransition use token classes) — verified by example-based unit tests.
3. **Don't-touch constraints** (GSAP preservation) — verified by code review and smoke tests.

Property-based testing requires behavior that varies meaningfully with input and where 100+ iterations would find more bugs than 2-3 examples. A palette swap has zero input variation — the values are fixed constants. Example-based unit tests and static analysis (grep for stale hex values) are the appropriate verification strategy.

## Testing Strategy

### Example-Based Unit Tests

1. **Token value test**: Assert all 7 color tokens in `tailwind.config.js` match expected values.
2. **Stale hex grep test**: Assert no component file contains old dark-mode hex values (`#09060A`, `#1E0D05`) outside of test fixtures.
3. **GSAP constant test**: Assert `E1_TEXT_MUTED_HEX` in BookPage/ContactPage equals `#6B5B4F`.
4. **Cursor hover color test**: Assert `HOVER_COLOR` in Cursor.js equals `#1A1A1A`.
5. **Ring class test**: Assert StoryBridge uses `ring-black/10` (not `ring-white/10`).

### Smoke Tests

1. **Build succeeds**: `npm run build` completes without errors (validates Tailwind compiles with new tokens).
2. **Visual spot-check**: Manual verification that Navigation, hero, and scrollbar render correctly on light background.
