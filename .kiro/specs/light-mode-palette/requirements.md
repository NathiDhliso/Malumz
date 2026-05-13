# Requirements Document

## Introduction

This feature converts the Malumz frontend from its current dark-mode palette to a light-mode palette. The design token values defined in `tailwind.config.js` are updated so that backgrounds become white/off-white, text becomes near-black, and accent colors (primary terracotta, secondary gold-brown, highlight gold) remain unchanged. All CSS and component references that relied on the dark palette are updated to produce correct contrast and visual hierarchy on the new light background. GSAP plugins and animation logic remain untouched.

## Glossary

- **Palette_System**: The set of Tailwind CSS custom color tokens (`e1-bg`, `e1-surface`, `e1-text`, `e1-text-muted`, `e1-primary`, `e1-secondary`, `e1-highlight`) defined in `tailwind.config.js` and consumed across the frontend.
- **Navigation_Component**: The fixed top navigation bar rendered by `Navigation.js`.
- **PageTransition_Component**: The full-screen curtain overlay rendered by `PageTransition.js` that animates between route changes.
- **Global_Stylesheet**: The `index.css` and `App.css` files that define body background, scrollbar styles, and focus ring colors.
- **Component_Layer**: All React component files under `frontend/src/components/` and `frontend/src/components/home/` that reference palette tokens or hardcoded hex values.
- **GSAP_Animation_Layer**: All GSAP timeline, tween, ScrollTrigger, and plugin configurations used across the application.

## Requirements

### Requirement 1: Update Tailwind Color Tokens

**User Story:** As a developer, I want the Tailwind design tokens updated to light-mode values, so that all utility classes automatically reflect the new palette without per-component changes.

#### Acceptance Criteria

1. THE Palette_System SHALL define `e1-bg` as `#FFFFFF`.
2. THE Palette_System SHALL define `e1-surface` as `#FFF8F0`.
3. THE Palette_System SHALL define `e1-text` as `#1A1A1A`.
4. THE Palette_System SHALL define `e1-text-muted` as `#6B5B4F`.
5. THE Palette_System SHALL define `e1-primary` as `#C2491A`.
6. THE Palette_System SHALL define `e1-secondary` as `#C8891E`.
7. THE Palette_System SHALL define `e1-highlight` as `#E4BE6A`.

### Requirement 2: Update Global Stylesheet Body Background

**User Story:** As a user, I want the page background to be white, so that the site presents a clean light-mode appearance on initial load.

#### Acceptance Criteria

1. THE Global_Stylesheet SHALL set the `body` background-color to `#FFFFFF`.

### Requirement 3: Update Scrollbar Styling

**User Story:** As a user, I want the custom scrollbar to complement the light background, so that the scrollbar track does not clash with the new palette.

#### Acceptance Criteria

1. THE Global_Stylesheet SHALL set the scrollbar track background to `#FFFFFF`.
2. THE Global_Stylesheet SHALL set the scrollbar thumb background to `#C2491A`.
3. THE Global_Stylesheet SHALL set the scrollbar thumb hover background to a darker shade of the primary color.

### Requirement 4: Update Focus Ring Color

**User Story:** As a user navigating with a keyboard, I want focus rings to remain visible against the light background, so that interactive elements are clearly identifiable.

#### Acceptance Criteria

1. THE Global_Stylesheet SHALL set the focus-visible outline color to `#C2491A`.

### Requirement 5: Navigation Scrolled State

**User Story:** As a user, I want the navigation bar to use a light frosted-glass effect when scrolled, so that it remains legible against the light page content beneath it.

#### Acceptance Criteria

1. WHILE the page is scrolled past the threshold, THE Navigation_Component SHALL apply a background of `e1-bg` at 80% opacity with backdrop blur.
2. WHILE the page is scrolled past the threshold, THE Navigation_Component SHALL display a bottom border using `e1-text-muted` at 10% opacity.
3. WHILE the page is not scrolled past the threshold, THE Navigation_Component SHALL display a transparent background.

### Requirement 6: Navigation Text Contrast

**User Story:** As a user, I want navigation text to be legible on the light background, so that I can read menu items clearly.

#### Acceptance Criteria

1. THE Navigation_Component SHALL render default link text using the `e1-text` token color.
2. THE Navigation_Component SHALL render active link text using the `e1-primary` token color.
3. THE Navigation_Component SHALL render the dropdown menu background using the `e1-surface` token color.
4. WHEN a user hovers over a dropdown item, THE Navigation_Component SHALL apply a background of `e1-bg` to the hovered item.

### Requirement 7: Navigation Mobile Menu

**User Story:** As a mobile user, I want the mobile menu to use the light surface color, so that it is consistent with the overall light-mode design.

#### Acceptance Criteria

1. THE Navigation_Component SHALL render the mobile menu panel background using the `e1-surface` token color.
2. THE Navigation_Component SHALL render mobile menu text using the `e1-text` token color.

### Requirement 8: PageTransition Curtain Color Preservation

**User Story:** As a user, I want the page transition curtain to remain terracotta, so that the brand accent is preserved during route changes.

#### Acceptance Criteria

1. THE PageTransition_Component SHALL render the curtain element with a background of `e1-primary`.

### Requirement 9: Remove Hardcoded Dark Hex Values

**User Story:** As a developer, I want all hardcoded dark-mode hex values in components replaced with token references or updated light-mode equivalents, so that the palette is maintained from a single source of truth.

#### Acceptance Criteria

1. WHEN a component file contains a hardcoded hex value matching the old dark palette (`#09060A`, `#1E0D05`, `#F0E2CB`, `#907A61`), THE Component_Layer SHALL replace the hardcoded value with the corresponding Tailwind token class or the new equivalent hex value.
2. THE Component_Layer SHALL preserve any hardcoded hex values that match the accent colors (`#C2491A`, `#C8891E`, `#E4BE6A`) without modification.

### Requirement 10: Hero Section Overlay Adjustment

**User Story:** As a user, I want the hero section video overlay to remain effective for text legibility, so that the headline and subtitle are readable over the ambient video on a light-mode site.

#### Acceptance Criteria

1. THE Component_Layer SHALL render the hero overlay using the `e1-bg` token so that the overlay color adapts to the current palette value.
2. THE Component_Layer SHALL maintain sufficient opacity on the hero overlay to ensure foreground text meets WCAG AA contrast requirements against the video background.

### Requirement 11: GSAP Animation Preservation

**User Story:** As a developer, I want all GSAP animations, timelines, ScrollTrigger configurations, and plugin usage to remain unchanged, so that the motion design is unaffected by the palette swap.

#### Acceptance Criteria

1. THE GSAP_Animation_Layer SHALL retain all existing timeline durations, easing functions, and tween properties without modification.
2. THE GSAP_Animation_Layer SHALL retain all existing ScrollTrigger configurations without modification.
3. THE GSAP_Animation_Layer SHALL retain all existing plugin registrations (SplitText, Flip, ScrollTrigger, useGSAP) without modification.

### Requirement 12: Border and Divider Contrast

**User Story:** As a user, I want borders and dividers to remain subtly visible on the light background, so that content sections are visually separated.

#### Acceptance Criteria

1. WHEN a component uses a border defined as `e1-text/10` or `e1-text-muted/10`, THE Component_Layer SHALL retain the same token-based opacity border class so that the border adapts naturally to the new dark text color on light background.

### Requirement 13: Ring and Shadow Adjustments

**User Story:** As a user, I want decorative rings and shadows to complement the light background, so that elevated elements appear correctly.

#### Acceptance Criteria

1. WHEN a component uses `ring-white/10` for a subtle light ring on dark background, THE Component_Layer SHALL update the ring to use a dark-on-light equivalent such as `ring-e1-text/10` or `ring-black/10`.
