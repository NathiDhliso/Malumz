/**
 * Page Content Unit Tests — Conversion-Focused Simplification
 *
 * Verifies that each page renders its required conversion elements and
 * does NOT render removed filler content.
 *
 * Feature: conversion-focused-simplification
 * Task: 13.3
 * @see Requirements 4.1–4.9, 5.1–5.5, 6.1–6.8, 7.1–7.7, 8.1–8.8, 11.1–11.5
 */

/* eslint-disable global-require, import/first */

// Import jest-dom matchers (toBeInTheDocument, etc.)
require("@testing-library/jest-dom");

// ---------------------------------------------------------------------------
// Environment stubs — must be installed before any module import
// ---------------------------------------------------------------------------

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
if (typeof window !== "undefined") {
  window.scrollTo = window.scrollTo || (() => {});
}

// ---------------------------------------------------------------------------
// GSAP plugin sub-path mocks
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = Real.defaults || (() => {});
  Real.config = Real.config || (() => {});
  return { __esModule: true, ScrollTrigger: Real };
});

jest.mock("gsap/SplitText", () => ({
  __esModule: true,
  SplitText: class { constructor() { this.chars = []; } revert() {} },
}));
jest.mock("gsap/DrawSVGPlugin", () => ({ __esModule: true, DrawSVGPlugin: {} }));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({ __esModule: true, MorphSVGPlugin: {} }));

// Mock the malumzApi module to prevent real API calls
jest.mock("@/lib/malumzApi", () => ({
  submitContact: jest.fn(() => Promise.resolve({ success: true })),
  checkoutProduct: jest.fn(() => Promise.resolve({})),
  activatePurchase: jest.fn(() => Promise.resolve({})),
}));

// Mock BookPurchasePanel.module.css
jest.mock("@/components/BookPurchasePanel.module.css", () => ({}));

// ---------------------------------------------------------------------------
// Deferred requires
// ---------------------------------------------------------------------------

const React = require("react");
const { cleanup, render, screen } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");
const { gsap } = require("../lib/gsap");

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function installNoopMatchMedia() {
  const spy = jest.spyOn(gsap, "matchMedia").mockImplementation(() => ({
    add: () => {},
    revert: () => {},
    kill: () => {},
  }));
  return () => spy.mockRestore();
}

function renderWithRouter(Component) {
  const restoreMatchMedia = installNoopMatchMedia();
  const utils = render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  );
  return { ...utils, restoreMatchMedia };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Page Content — Conversion-Focused Simplification (Task 13.3)", () => {
  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // HomePage
  // =========================================================================

  describe("HomePage", () => {
    const HomePage = require("../pages/HomePage").default;

    it("renders the two primary CTAs in the hero", () => {
      const { container, restoreMatchMedia } = renderWithRouter(HomePage);
      try {
        expect(screen.getAllByText("Buy the Book").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Join a Circle").length).toBeGreaterThan(0);
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render Marquee content", () => {
      const { container, restoreMatchMedia } = renderWithRouter(HomePage);
      try {
        // Marquee used overflow-hidden + whitespace-nowrap combo
        const marquees = container.querySelectorAll(
          ".overflow-hidden.whitespace-nowrap"
        );
        expect(marquees.length).toBe(0);
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render StoryBridge component", () => {
      const { container, restoreMatchMedia } = renderWithRouter(HomePage);
      try {
        // StoryBridge rendered a two-column section with specific content
        expect(screen.queryByText("The Story Bridge")).toBeNull();
        expect(screen.queryByText("Story Bridge")).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render TrainerConnector SVG", () => {
      const { container, restoreMatchMedia } = renderWithRouter(HomePage);
      try {
        // TrainerConnector had an SVG with "THE STUDENT" text
        const svg = container.querySelector(
          'svg[aria-label="The student connected to six trainers"]'
        );
        expect(svg).toBeNull();
        // Also check for the central text node
        const textEls = Array.from(container.querySelectorAll("text"));
        const studentNodes = textEls.filter(
          (t) => t.textContent === "THE STUDENT"
        );
        expect(studentNodes).toHaveLength(0);
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render HorizontalTrainers section", () => {
      const { container, restoreMatchMedia } = renderWithRouter(HomePage);
      try {
        expect(screen.queryByText("Horizontal Trainers")).toBeNull();
        // HorizontalTrainers used ScrollTrigger pin with specific data attributes
        const pinned = container.querySelector("[data-horizontal-trainers]");
        expect(pinned).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render PullQuote component", () => {
      const { container, restoreMatchMedia } = renderWithRouter(HomePage);
      try {
        // PullQuote was a full-bleed blockquote section separate from the testimonial
        // The HomePage now has at most one testimonial blockquote
        const blockquotes = container.querySelectorAll("blockquote");
        expect(blockquotes.length).toBeLessThanOrEqual(1);
      } finally {
        restoreMatchMedia();
      }
    });
  });

  // =========================================================================
  // BookPage
  // =========================================================================

  describe("BookPage", () => {
    const { BookPage } = require("../pages/BookPage");

    it("renders BookPurchasePanel as content section", () => {
      const { container, restoreMatchMedia } = renderWithRouter(BookPage);
      try {
        // BookPurchasePanel renders product options with eBook and Audiobook
        expect(screen.getByText("eBook")).toBeInTheDocument();
        expect(screen.getByText("Audiobook")).toBeInTheDocument();
      } finally {
        restoreMatchMedia();
      }
    });

    it("renders BookPurchasePanel before the chapter preview section", () => {
      const { container, restoreMatchMedia } = renderWithRouter(BookPage);
      try {
        // The purchase panel section comes before "What's Inside" in DOM order
        const whatsInside = screen.getByText("What's Inside");
        expect(whatsInside).toBeInTheDocument();

        // eBook text (from BookPurchasePanel) should appear before "What's Inside"
        const eBookEl = screen.getByText("eBook");
        expect(
          eBookEl.compareDocumentPosition(whatsInside) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render video hero strip", () => {
      const { container, restoreMatchMedia } = renderWithRouter(BookPage);
      try {
        // No <video> element should be present
        const videos = container.querySelectorAll("video");
        expect(videos.length).toBe(0);
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render 'Request a Signed Copy' form", () => {
      const { restoreMatchMedia } = renderWithRouter(BookPage);
      try {
        expect(screen.queryByText(/signed copy/i)).toBeNull();
        expect(screen.queryByText(/Request a Signed Copy/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });
  });

  // =========================================================================
  // JoinPage
  // =========================================================================

  describe("JoinPage", () => {
    const { JoinPage } = require("../pages/JoinPage");

    it("renders exactly 3 form fields: Name, Email, City/Area", () => {
      const { container, restoreMatchMedia } = renderWithRouter(JoinPage);
      try {
        // Check for the three labels
        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("City/Area")).toBeInTheDocument();

        // Verify exactly 3 input fields in the form
        const form = container.querySelector("form");
        expect(form).not.toBeNull();
        const inputs = form.querySelectorAll("input");
        expect(inputs.length).toBe(3);
      } finally {
        restoreMatchMedia();
      }
    });

    it("renders a Submit button", () => {
      const { restoreMatchMedia } = renderWithRouter(JoinPage);
      try {
        expect(screen.getByText("Submit")).toBeInTheDocument();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render model selection (Choose Your Model)", () => {
      const { restoreMatchMedia } = renderWithRouter(JoinPage);
      try {
        expect(screen.queryByText(/Choose Your Model/i)).toBeNull();
        expect(screen.queryByText(/Standard/i)).toBeNull();
        expect(screen.queryByText(/Micro-Circle/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render 7-step process", () => {
      const { restoreMatchMedia } = renderWithRouter(JoinPage);
      try {
        expect(screen.queryByText(/How to Start Your Circle/i)).toBeNull();
        expect(screen.queryByText(/Step 1/i)).toBeNull();
        expect(screen.queryByText(/Step 7/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });
  });

  // =========================================================================
  // AboutPage
  // =========================================================================

  describe("AboutPage", () => {
    const { AboutPage } = require("../pages/AboutPage");

    it("renders max 3 paragraphs of founder story", () => {
      const { container, restoreMatchMedia } = renderWithRouter(AboutPage);
      try {
        // The founder story paragraphs have data-pull-quote attribute
        const pullQuotes = container.querySelectorAll("[data-pull-quote]");
        expect(pullQuotes.length).toBeLessThanOrEqual(3);
        expect(pullQuotes.length).toBeGreaterThan(0);
      } finally {
        restoreMatchMedia();
      }
    });

    it("renders a contact form", () => {
      const { container, restoreMatchMedia } = renderWithRouter(AboutPage);
      try {
        expect(screen.getByText("Send Us a Message")).toBeInTheDocument();
        const form = container.querySelector("form");
        expect(form).not.toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render timeline/vision sections", () => {
      const { restoreMatchMedia } = renderWithRouter(AboutPage);
      try {
        expect(screen.queryByText(/The Roadmap/i)).toBeNull();
        expect(screen.queryByText(/vision roadmap/i)).toBeNull();
        expect(screen.queryByText(/Formal Infrastructure Vision/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render infrastructure/network sections", () => {
      const { restoreMatchMedia } = renderWithRouter(AboutPage);
      try {
        expect(screen.queryByText(/Malumz Network/i)).toBeNull();
        expect(screen.queryByText(/anti-predator protocols/i)).toBeNull();
        expect(screen.queryByText(/policy recommendations/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });
  });

  // =========================================================================
  // SafetyPage
  // =========================================================================

  describe("SafetyPage", () => {
    const { SafetyPage } = require("../pages/SafetyPage");

    it("renders safety principles instead of crisis numbers", () => {
      const { container, restoreMatchMedia } = renderWithRouter(SafetyPage);
      try {
        const telLinks = container.querySelectorAll('a[href^="tel:"]');
        expect(telLinks.length).toBe(0);
        expect(screen.getByText("Safety Principles")).toBeInTheDocument();
        expect(screen.getByText("Rules Before Rulers")).toBeInTheDocument();
      } finally {
        restoreMatchMedia();
      }
    });

    it("renders the anonymous report form", () => {
      const { container, restoreMatchMedia } = renderWithRouter(SafetyPage);
      try {
        expect(screen.getByText("Report a Circle")).toBeInTheDocument();
        const form = container.querySelector("form");
        expect(form).not.toBeNull();
        expect(screen.getByText("Submit Anonymous Report")).toBeInTheDocument();
      } finally {
        restoreMatchMedia();
      }
    });

    it("renders rules-not-rulers hero messaging", () => {
      const { restoreMatchMedia } = renderWithRouter(SafetyPage);
      try {
        expect(screen.getByText("Anchored on Rules, Not Rulers")).toBeInTheDocument();
        expect(screen.queryByText("You Are Not Alone")).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render provincial resources accordion", () => {
      const { container, restoreMatchMedia } = renderWithRouter(SafetyPage);
      try {
        // No <details> elements (accordion pattern)
        const details = container.querySelectorAll("details");
        expect(details.length).toBe(0);
        expect(screen.queryByText(/Provincial Resources/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });

    it("does NOT render tyrant/vetting sections", () => {
      const { restoreMatchMedia } = renderWithRouter(SafetyPage);
      try {
        expect(screen.queryByText(/Trained Tyrant Profile/i)).toBeNull();
        expect(screen.queryByText(/Facilitator Vetting Checklist/i)).toBeNull();
        expect(screen.queryByText(/Silent Exclusion Guide/i)).toBeNull();
      } finally {
        restoreMatchMedia();
      }
    });
  });
});
