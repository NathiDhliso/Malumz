# Implementation Plan: Light Mode Palette

## Overview

Swap the Malumz frontend from dark to light by updating Tailwind token values, global CSS, and a handful of hardcoded hex constants in components. The token system cascades changes automatically — only files with literal hex strings need manual edits.

## Tasks

- [ ] 1. Update Tailwind config token values
  - [ ] 1.1 Update color tokens in `tailwind.config.js`
    - Change `e1-bg` to `#FFFFFF`
    - Change `e1-surface` to `#FFF8F0`
    - Change `e1-text` to `#1A1A1A`
    - Change `e1-text-muted` to `#6B5B4F`
    - Leave `e1-primary`, `e1-secondary`, `e1-highlight` unchanged
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Update global stylesheets
  - [ ] 2.1 Update `src/index.css` body background to `#FFFFFF`
    - _Requirements: 2.1_
  - [ ] 2.2 Update `src/App.css` scrollbar and focus ring colors
    - Set scrollbar track to `#FFFFFF`
    - Set scrollbar thumb to `#C2491A`
    - Set scrollbar thumb hover to `#9A3814`
    - Set focus-visible outline to `#C2491A`
    - _Requirements: 3.1, 3.2, 3.3, 4.1_

- [ ] 3. Update hardcoded hex values in components
  - [ ] 3.1 Update `HOVER_COLOR` in `src/components/Cursor.js` to `#1A1A1A`
    - _Requirements: 9.1_
  - [ ] 3.2 Update `E1_TEXT_MUTED_HEX` in `src/pages/BookPage.js` to `#6B5B4F`
    - _Requirements: 9.1_
  - [ ] 3.3 Update `E1_TEXT_MUTED_HEX` in `src/pages/ContactPage.js` to `#6B5B4F`
    - _Requirements: 9.1_
  - [ ] 3.4 Replace `ring-white/10` with `ring-black/10` in `src/components/home/StoryBridge.js`
    - _Requirements: 13.1_

- [ ] 4. Update test expectations
  - [ ]* 4.1 Update token value assertions in `src/__tests__/foundation/tailwind.config.test.js`
    - Update expected values for `e1-bg`, `e1-surface`, `e1-text`, `e1-text-muted`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Final checkpoint
  - Run `npm run build` to verify Tailwind compiles with new tokens and no errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Accent colors (`e1-primary`, `e1-secondary`, `e1-highlight`) are intentionally unchanged
- GSAP animations are not touched — only the hex color constants passed to tweens are updated
- Navigation, PageTransition, borders, and overlays adapt automatically via token classes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["4.1"] }
  ]
}
```
