# Requirements Document

## Introduction

Radical simplification of the Malumz website from its current 7+ pages down to exactly 5 pages, with every page focused on a single clear call-to-action. The guiding philosophy: visitors are busy, they want to know what this is, take action, and move on. Content that does not directly lead to one of three conversions (buy book, join circle, get crisis help) is removed from the public site. Every page must be scannable in under 30 seconds.

## Glossary

- **Website**: The Malumz frontend React application served at malumz.co.za
- **Navigation**: The fixed top navigation bar and mobile menu rendered by the Navigation component
- **Footer**: The minimal site-wide footer rendered below all page content
- **Home_Page**: The landing page at route `/` focused on immediate pitch and dual CTAs
- **Book_Page**: The purchase-focused page at route `/book` with the purchase panel at the top
- **Join_Page**: The simplified interest form page at route `/join` for Brotherhood Circle signups
- **About_Page**: The founder story page at route `/about` with contact form
- **Safety_Page**: The crisis resources page at route `/safety` with emergency numbers and anonymous reporting
- **Purchase_Panel**: The BookPurchasePanel component containing eBook and audiobook purchase options
- **Interest_Form**: The simplified Name/Email/City form on the Join page
- **Crisis_Button**: The persistent "I Need Help" navigation button linking to the Safety page
- **Scroll_Reveal**: The `.gs-reveal` CSS class and associated GSAP ScrollTrigger batch animation
- **Parallax_Hero**: The subtle parallax scroll effect applied to the Home page hero section
- **Counter_Animation**: The GSAP-driven numeric counter tween on the About page

## Requirements

### Requirement 1: Site Architecture Reduction

**User Story:** As a visitor, I want the site to have only 5 clearly-defined pages, so that I can find what I need without navigating through unnecessary content.

#### Acceptance Criteria

1. THE Website SHALL serve exactly five routes: `/`, `/book`, `/join`, `/about`, and `/safety`
2. WHEN a visitor navigates to `/results`, THE Website SHALL redirect to `/`
3. WHEN a visitor navigates to `/resources`, THE Website SHALL redirect to `/`
4. WHEN a visitor navigates to `/systems/:slug`, THE Website SHALL redirect to `/`
5. WHEN a visitor navigates to `/vision`, THE Website SHALL redirect to `/about`
6. WHEN a visitor navigates to `/contact`, THE Website SHALL redirect to `/about`
7. WHEN a visitor navigates to `/crisis`, THE Website SHALL redirect to `/safety`
8. THE Website SHALL remove the ResultsPage component and its route registration
9. THE Website SHALL remove the ResourcesPage component and its route registration
10. THE Website SHALL remove the SystemDetailPage component and its route registration

### Requirement 2: Navigation Simplification

**User Story:** As a visitor, I want a flat, simple navigation without dropdowns, so that I can reach any page in one click.

#### Acceptance Criteria

1. THE Navigation SHALL display exactly four text links: Home, Book, Join, About
2. THE Navigation SHALL display the Crisis_Button labeled "I Need Help" linking to `/safety`
3. THE Navigation SHALL render all links as flat items without dropdown menus
4. THE Navigation SHALL remove the "Learn" dropdown category and its children
5. WHEN the viewport is below the mobile breakpoint, THE Navigation SHALL display the same four links plus the Crisis_Button in the mobile menu
6. THE Navigation SHALL not render a ChevronDown icon on any navigation item

### Requirement 3: Footer Simplification

**User Story:** As a visitor, I want a minimal footer with just page links and contact info, so that I can quickly access any section from the bottom of the page.

#### Acceptance Criteria

1. THE Footer SHALL display links to all five pages: Home, Book, Join, About, Safety
2. THE Footer SHALL display the site email address
3. THE Footer SHALL display social media links
4. THE Footer SHALL not display content categories, resource links, or vision roadmap links

### Requirement 4: Home Page Conversion Focus

**User Story:** As a visitor, I want to immediately understand what Malumz is and take action, so that I do not waste time scrolling through filler content.

#### Acceptance Criteria

1. THE Home_Page SHALL display a hero section with a concise pitch answering "What is this?" in under 10 seconds of reading
2. THE Home_Page SHALL display two primary CTAs in the hero: "Buy the Book" linking to `/book` and "Join a Circle" linking to `/join`
3. THE Home_Page SHALL display the Crisis_Button visibly within the hero section
4. THE Home_Page SHALL display a maximum of one testimonial or social proof statistic
5. THE Home_Page SHALL not render the Marquee component
6. THE Home_Page SHALL not render the StoryBridge component
7. THE Home_Page SHALL not render the TrainerConnector component
8. THE Home_Page SHALL not render the HorizontalTrainers component
9. THE Home_Page SHALL not render the PullQuote component
10. THE Home_Page SHALL retain the Parallax_Hero effect on the hero section
11. THE Home_Page SHALL retain Scroll_Reveal animations on visible content sections

### Requirement 5: Book Page Purchase-First Layout

**User Story:** As a visitor, I want to see the purchase options immediately when I land on the Book page, so that I can buy without scrolling past filler content.

#### Acceptance Criteria

1. THE Book_Page SHALL render the Purchase_Panel as the first content section below the hero
2. THE Book_Page SHALL display a brief chapter preview section below the Purchase_Panel
3. THE Book_Page SHALL not render the "Request a Signed Copy" form section
4. THE Book_Page SHALL not render a separate "Audiobook Access" section (audiobook is part of the Purchase_Panel)
5. THE Book_Page SHALL not render the video hero strip
6. THE Book_Page SHALL retain Scroll_Reveal animations on the chapter list items

### Requirement 6: Join Page Simplification

**User Story:** As a visitor, I want a simple form to express interest in joining a Brotherhood Circle, so that I can sign up without being overwhelmed by process details.

#### Acceptance Criteria

1. THE Join_Page SHALL display one sentence explaining what a Brotherhood Circle is
2. THE Join_Page SHALL render the Interest_Form with exactly three fields: Name, Email, and City/Area
3. THE Join_Page SHALL render a single Submit button on the Interest_Form
4. THE Join_Page SHALL not render the "Choose Your Model" section with Standard and Micro-Circle options
5. THE Join_Page SHALL not render the "How to Start Your Circle" seven-step process
6. THE Join_Page SHALL not render the "Download the Starter Pack" section
7. THE Join_Page SHALL not render a Circle Model dropdown or selection
8. THE Join_Page SHALL not render a Facilitator Name field label (the field label is "Name")
9. WHEN the Interest_Form is submitted successfully, THE Join_Page SHALL display a confirmation message

### Requirement 7: About Page Content Reduction

**User Story:** As a visitor, I want to read a short founder story and contact the team, so that I can learn about the person behind the project without reading internal documentation.

#### Acceptance Criteria

1. THE About_Page SHALL display the founder story in a maximum of three paragraphs
2. THE About_Page SHALL display a contact form at the bottom of the page
3. THE About_Page SHALL not render the vision roadmap timeline section
4. THE About_Page SHALL not render the infrastructure vision section
5. THE About_Page SHALL not render the Malumz Network requirements section
6. THE About_Page SHALL not render the anti-predator protocols section
7. THE About_Page SHALL not render the policy recommendations content
8. THE About_Page SHALL retain the Counter_Animation if a statistic is displayed
9. THE About_Page SHALL retain Scroll_Reveal animations on visible content sections

### Requirement 8: Safety Page Streamlining

**User Story:** As a visitor in crisis, I want to immediately see emergency numbers and report abuse anonymously, so that I can get help without reading facilitator training material.

#### Acceptance Criteria

1. THE Safety_Page SHALL display crisis phone numbers at the top: Lifeline, SADAG, and GBV Command Centre
2. THE Safety_Page SHALL render each crisis number as a tappable telephone link
3. THE Safety_Page SHALL display the anonymous report form below the crisis numbers
4. THE Safety_Page SHALL not render the provincial resources accordion section
5. THE Safety_Page SHALL display a single link to the SADAG website for provincial resources
6. THE Safety_Page SHALL not render the "Trained Tyrant Profile" section
7. THE Safety_Page SHALL not render the "Silent Exclusion Guide" section
8. THE Safety_Page SHALL not render the "Facilitator Vetting Checklist" section
9. THE Safety_Page SHALL retain the "You Are Not Alone" hero messaging and Lifeline CTA

### Requirement 9: Animation Retention

**User Story:** As a visitor, I want the site to feel premium and intentional through subtle animations, so that the experience is polished without being slow.

#### Acceptance Criteria

1. THE Website SHALL retain all Scroll_Reveal animations (`.gs-reveal` class with ScrollTrigger batch)
2. THE Website SHALL retain the Parallax_Hero effect on the Home page hero section
3. THE Website SHALL retain the Counter_Animation on the About page
4. THE Website SHALL remove the HorizontalTrainers horizontal scroll section
5. THE Website SHALL remove the TrainerConnector SVG animation
6. THE Website SHALL remove the Marquee animation component

### Requirement 10: Removed Component Cleanup

**User Story:** As a developer, I want unused components and pages removed from the codebase, so that the project stays maintainable and the bundle size decreases.

#### Acceptance Criteria

1. WHEN the simplification is complete, THE Website SHALL not import the ResultsPage component in the route configuration
2. WHEN the simplification is complete, THE Website SHALL not import the ResourcesPage component in the route configuration
3. WHEN the simplification is complete, THE Website SHALL not import the SystemDetailPage component in the route configuration
4. WHEN the simplification is complete, THE Website SHALL not import the HorizontalTrainers component in any page
5. WHEN the simplification is complete, THE Website SHALL not import the TrainerConnector component in any page
6. WHEN the simplification is complete, THE Website SHALL not import the StoryBridge component in any page
7. WHEN the simplification is complete, THE Website SHALL not import the Marquee component in any page
8. WHEN the simplification is complete, THE Website SHALL not import the PullQuote component in any page

### Requirement 11: Conversion Clarity

**User Story:** As a visitor, I want every page to have one obvious action I should take, so that I never feel lost or unsure what to do next.

#### Acceptance Criteria

1. THE Home_Page SHALL present "Buy the Book" and "Join a Circle" as the two primary actions above the fold
2. THE Book_Page SHALL present the purchase action (eBook or Audiobook selection and checkout) as the primary action above the fold
3. THE Join_Page SHALL present the Interest_Form submission as the single primary action
4. THE About_Page SHALL present the contact form submission as the primary action
5. THE Safety_Page SHALL present calling a crisis number as the primary action above the fold

### Requirement 12: Page Scannability

**User Story:** As a visitor, I want each page to be readable in under 30 seconds, so that I can quickly decide whether to take action.

#### Acceptance Criteria

1. THE Home_Page SHALL contain no more than one screen of content above the fold before the CTAs
2. THE Book_Page SHALL render the Purchase_Panel within the first viewport height
3. THE Join_Page SHALL render the complete Interest_Form within the first viewport height
4. THE Safety_Page SHALL render all crisis numbers within the first viewport height
5. THE About_Page SHALL render the founder story within two viewport heights
