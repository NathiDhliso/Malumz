/**
 * Unit tests — `HomePage` structural shape.
 *
 * Feature: conversion-focused-simplification
 *
 * After the conversion-focused-simplification spec, the HomePage was
 * radically simplified to: Hero (pitch + dual CTAs + crisis button) +
 * optional single testimonial/stat. The following components were
 * intentionally removed:
 *   - TrainerConnector (SVG radial diagram)
 *   - Marquee (infinite loop ribbon)
 *   - ScrollIndicator (chevron affordance)
 *   - HorizontalTrainers (scroll-pin section)
 *   - PullQuote (full-bleed blockquote)
 *   - StoryBridge (two-column filler)
 *
 * These tests validate the simplified structure:
 *   1. Hero renders with dual CTAs ("Buy the Book" + "Join a Circle")
 *   2. Crisis button is visible in the hero
 *   3. Removed components are NOT rendered
 *
 * @see Requirements 4.1–4.11, 9.1, 9.2, 11.1, 12.1
 */

/* eslint-disable global-require, import/first, import/newline-after-import */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo stubs
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
  Real.defaults = () => {};
  Real.config = () => {};
  return { __esModule: true, ScrollTrigger: Real };
});

jest.mock("gsap/SplitText", () => {
  class MockSplitText {
    constructor(el) {
      this._el = el;
      this.chars = [];
    }
    revert() {}
  }
  return { __esModule: true, SplitText: MockSplitText };
});

jest.mock("gsap/DrawSVGPlugin", () => ({
  __esModule: true,
  DrawSVGPlugin: {},
}));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({
  __esModule: true,
  MorphSVGPlugin: {},
}));

// ---------------------------------------------------------------------------
// Deferred requires
// ---------------------------------------------------------------------------

const React = require("react");
const { cleanup, render } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");
const { gsap } = require("../lib/gsap");
const HomePage = require("../pages/HomePage").default;

// ---------------------------------------------------------------------------
// Shared harness
// ---------------------------------------------------------------------------

function installNoopMatchMedia() {
  const spy = jest.spyOn(gsap, "matchMedia").mockImplementation(() => ({
    add: () => {},
    revert: () => {},
    kill: () => {},
  }));
  return () => spy.mockRestore();
}

function renderHomePage() {
  const restoreMatchMedia = installNoopMatchMedia();
  const utils = render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  return { ...utils, restoreMatchMedia };
}

describe("HomePage — structural shape (conversion-focused-simplification)", () => {
  afterEach(() => {
    cleanup();
  });

  // -------------------------------------------------------------------------
  // 1. Hero renders with dual CTAs
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirements 4.1, 4.2, 11.1
   *
   * The hero section must contain "Buy the Book" and "Join a Circle"
   * CTAs linking to /book and /join respectively.
   */
  it("HomePage: renders dual CTAs in the hero section", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const links = Array.from(container.querySelectorAll("a"));
      const buyLink = links.find(
        (a) => a.textContent.includes("Buy the Book") && a.getAttribute("href") === "/book"
      );
      const joinLink = links.find(
        (a) => a.textContent.includes("Join a Circle") && a.getAttribute("href") === "/join"
      );
      expect(buyLink).toBeDefined();
      expect(joinLink).toBeDefined();
    } finally {
      restoreMatchMedia();
    }
  });

  // -------------------------------------------------------------------------
  // 2. Crisis button visible in hero
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirement 4.3
   *
   * The hero section must contain a visible crisis button linking to /safety.
   */
  it("HomePage: renders a crisis button linking to /safety", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const links = Array.from(container.querySelectorAll("a"));
      const crisisLink = links.find(
        (a) => a.getAttribute("href") === "/safety"
      );
      expect(crisisLink).toBeDefined();
    } finally {
      restoreMatchMedia();
    }
  });

  // -------------------------------------------------------------------------
  // 3. Removed components are NOT rendered
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirements 4.5, 4.6, 4.7, 4.8, 4.9
   *
   * TrainerConnector, Marquee, ScrollIndicator, HorizontalTrainers,
   * PullQuote, and StoryBridge are all removed from the HomePage.
   */
  it("HomePage: does NOT render TrainerConnector SVG", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const svg = container.querySelector(
        'svg[aria-label="The student connected to six trainers"]'
      );
      expect(svg).toBeNull();
    } finally {
      restoreMatchMedia();
    }
  });

  it("HomePage: does NOT render Marquee ribbon", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const marquees = container.querySelectorAll(
        ".overflow-hidden.whitespace-nowrap"
      );
      expect(marquees.length).toBe(0);
    } finally {
      restoreMatchMedia();
    }
  });

  it("HomePage: does NOT render ScrollIndicator chevron", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const chevron = container.querySelector(
        'polyline[points="6 9 12 15 18 9"]'
      );
      expect(chevron).toBeNull();
    } finally {
      restoreMatchMedia();
    }
  });
});
