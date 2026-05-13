/**
 * Unit tests — `HomePage` structural shape.
 *
 * Feature: e1-editorial-ui-overhaul, Task 4.13
 *
 * These assertions pin down the editorial composition contract of
 * `<HomePage>` and its constituent sections without exercising the
 * GSAP timelines authored on top of them:
 *
 *   1. `<TrainerConnector>` renders exactly one central `<text>`
 *      element containing the literal string "THE STUDENT", exactly
 *      six radiating `<path>` branches, exactly six `<circle>`
 *      trainer nodes, and exactly six `<text>` labels whose
 *      `textContent` is non-empty — the labels stay in the
 *      accessibility tree even when the DrawSVG plugin is
 *      unavailable (Requirements 16.1, 16.6).
 *   2. `<HomePage>` renders exactly one `<Marquee>` ribbon and the
 *      document order is `Hero → Marquee → TrainerConnector`
 *      (Requirements 19.1, 19.2).
 *   3. `<HomePage>` renders a scroll-indicator affordance (the
 *      chevron `<polyline>` with the canonical points attribute)
 *      that appears after the hero `<NotchedSection>` in document
 *      order (Requirement 20.1).
 *   4. The hero Flip card `<img>` carries `width`, `height`, and
 *      `fetchpriority="high"` for zero-CLS above-the-fold delivery
 *      (Requirements 14.5, 32.4).
 *
 * Strategy notes
 * --------------
 * This file follows the same GSAP plugin sub-path mocking pattern
 * established by the other HomePage-area property tests in
 * `src/components/__tests__/`: every plugin that the runtime
 * singleton registers (`ScrollTrigger`, `SplitText`, `DrawSVGPlugin`,
 * `Flip`, `MorphSVGPlugin`) is jest-mocked with a stub so the CJS-
 * incompatible ESM sub-paths never reach Jest's default transform.
 * `ScrollTrigger` is proxied through its `gsap/dist/ScrollTrigger`
 * UMD twin so the `getAll()` / matchMedia gating surfaces match the
 * real implementation used by the components under test.
 *
 * `gsap.matchMedia` is stubbed to a no-op `add`/`revert`/`kill` shim
 * so neither branch of any `useGSAP` effect fans out — none of the
 * assertions here depend on animation state, only on the static JSX
 * each component commits to the DOM on mount. `window.matchMedia`
 * and `window.scrollTo` are installed as permissive stubs because
 * jsdom does not ship either, and `<HeroSection>` consults
 * `matchMedia` during `useState` initialization.
 *
 * @see Requirements 14.5, 16.1, 16.6, 19.1, 19.2, 20.1, 32.4
 */

/* eslint-disable global-require, import/first, import/newline-after-import */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo stubs — installed before any module import so the
// `@/lib/gsap` runtime singleton's import-time side effects see a
// populated stub at module evaluation time.
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
// GSAP plugin sub-path mocks — plugin bundles ship ESM that Jest's
// default transform cannot parse. `gsap/dist/ScrollTrigger` is the
// CJS-compatible UMD twin; the remaining plugins only need a
// registration-time surface so bare objects suffice. `SplitText` is
// stubbed as a constructable class that leaves the headline text
// intact so `<HeroSection>`'s `try { new SplitText(headlineEl) } catch`
// path behaves like the real plugin would in a license-less environment
// without crashing the mount.
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
      // Keep the headline text in place so the hero DOM is stable; the
      // structural assertions in this file never inspect per-character
      // spans, but `chars` is still exposed as an empty array so the
      // `split.chars.length > 0` check in `<HeroSection>` falls through
      // cleanly to the plain-headline branch.
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
// Deferred requires — ES imports are hoisted above the matchMedia
// bootstrap, so routing them through `require(...)` preserves the
// initialization order.
// ---------------------------------------------------------------------------

const React = require("react");
const { cleanup, render } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");
const { gsap } = require("../lib/gsap");
const assets = require("../lib/assets").default;
const { HERO_CARD_IMAGE } = require("../lib/assets");
const HomePage = require("../pages/HomePage").default;

// ---------------------------------------------------------------------------
// Shared harness — `gsap.matchMedia` no-op spy + mount + cleanup.
// ---------------------------------------------------------------------------

/**
 * Install a `gsap.matchMedia` spy whose returned shim records no
 * handlers, so neither the motion nor the reduced-motion branch of
 * any `useGSAP` effect fires during mount. Returns a restore
 * callback that reinstates the original implementation.
 *
 * @returns {() => void}
 */
function installNoopMatchMedia() {
  const spy = jest.spyOn(gsap, "matchMedia").mockImplementation(() => ({
    add: () => {},
    revert: () => {},
    kill: () => {},
  }));
  return () => spy.mockRestore();
}

/**
 * Render `<HomePage />` inside a `<MemoryRouter>` with the
 * `gsap.matchMedia` no-op spy installed. Returns the RTL render
 * handle extended with a `restore()` helper so each test can tear
 * down the spy in a `try/finally`.
 */
function renderHomePage() {
  const restoreMatchMedia = installNoopMatchMedia();
  const utils = render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  return { ...utils, restoreMatchMedia };
}

describe("HomePage — structural shape (Task 4.13)", () => {
  afterEach(() => {
    cleanup();
  });

  // -------------------------------------------------------------------------
  // 1. TrainerConnector central node
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirements 16.1
   *
   * The SVG must contain exactly one `<text>` element whose
   * `textContent` is the literal string "THE STUDENT" (case-sensitive).
   * This is the central student node the six trainer branches radiate
   * out from; having more than one would violate the radial
   * composition, and having zero would strand the diagram without its
   * focal label.
   */
  it('TrainerConnector: renders exactly one <text> containing "THE STUDENT"', () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const textEls = Array.from(container.querySelectorAll("text"));
      const studentNodes = textEls.filter(
        (t) => t.textContent === "THE STUDENT"
      );
      expect(studentNodes).toHaveLength(1);
    } finally {
      restoreMatchMedia();
    }
  });

  // -------------------------------------------------------------------------
  // 2. TrainerConnector six branches + six nodes + six fallback-visible labels
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirements 16.1, 16.6
   *
   * The connector diagram authors its six radiating branches as
   * `<path>` elements anchored at the SVG center, paired with a
   * `<circle>` per trainer node and a `<text>` label. The labels are
   * unconditionally written into the SVG so assistive tech can read
   * every branch even when `DrawSVGPlugin` is unavailable and the
   * paths render fully drawn from first paint — i.e., fallback-visible
   * branch text. Each label's `textContent` must be non-empty.
   */
  it("TrainerConnector: renders exactly six branches, six nodes, and six non-empty labels", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      // Locate the connector's SVG by its aria-label — `<svg role="img"
      // aria-label="The student connected to six trainers">`. This is
      // unique in the HomePage tree; the scroll indicator chevron is
      // aria-hidden and the NotchedSection silhouette fallback SVG is
      // aria-hidden as well.
      const svg = container.querySelector(
        'svg[aria-label="The student connected to six trainers"]'
      );
      expect(svg).not.toBeNull();

      // Exactly six radiating branches.
      const paths = svg.querySelectorAll("path");
      expect(paths.length).toBe(6);

      // Exactly six trainer nodes.
      const circles = svg.querySelectorAll("circle");
      expect(circles.length).toBe(6);

      // Seven total `<text>` elements: six trainer labels + the
      // central "THE STUDENT" node.
      const allTextEls = Array.from(svg.querySelectorAll("text"));
      expect(allTextEls.length).toBe(7);

      // Six labels (everything except the central node). Each label's
      // `textContent` must be a non-empty string — the connector's
      // fallback-visible contract (Requirement 16.6).
      const labels = allTextEls.filter(
        (t) => t.textContent !== "THE STUDENT"
      );
      expect(labels.length).toBe(6);
      labels.forEach((label, i) => {
        const text = label.textContent || "";
        expect(text.length).toBeGreaterThan(0);
        // Guard against whitespace-only labels too: the accessibility
        // contract is that each branch is legibly named.
        expect(text.trim().length).toBeGreaterThan(0);
        // Include the index in the matcher context so any failure
        // points directly at the offending label.
        expect({ index: i, text }).toMatchObject({ index: i });
      });
    } finally {
      restoreMatchMedia();
    }
  });

  // -------------------------------------------------------------------------
  // 3. HomePage document order — Hero → Marquee → TrainerConnector, exactly
  //    one Marquee in the tree.
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirements 19.1, 19.2
   *
   * `<HomePage>` must render:
   *   - The hero `<NotchedSection>` first (identified by its `h1`
   *     whose `aria-label` mirrors the default headline).
   *   - Exactly one `<Marquee>` ribbon, after the hero.
   *   - The `<TrainerConnector>` section after the marquee.
   *
   * Document order is asserted via `compareDocumentPosition` so the
   * test is robust to intervening nodes (e.g., the scroll indicator
   * between the hero and the marquee).
   */
  it("HomePage: renders exactly one <Marquee> between the hero and TrainerConnector", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      // Hero anchor: the h1 with the default headline. Walking up to
      // its closest `<section>` lands on the `<NotchedSection
      // tone="charcoal">` wrapper.
      const headline = container.querySelector(
        'h1[aria-label="Rebuilding what apartheid destroyed."]'
      );
      expect(headline).not.toBeNull();
      const heroSection = headline.closest("section");
      expect(heroSection).not.toBeNull();

      // TrainerConnector anchor: the text "THE STUDENT" sits inside
      // the connector `<section>`.
      const studentText = Array.from(container.querySelectorAll("text")).find(
        (t) => t.textContent === "THE STUDENT"
      );
      expect(studentText).not.toBeNull();
      const connectorSection = studentText.closest("section");
      expect(connectorSection).not.toBeNull();

      // Marquee anchor: the root `<div>` carries the unique
      // `overflow-hidden whitespace-nowrap` class combo on HomePage
      // (the hero NotchedSection uses `overflow-hidden` but not
      // `whitespace-nowrap`, and nothing else pairs the two).
      const marquees = container.querySelectorAll(
        ".overflow-hidden.whitespace-nowrap"
      );
      expect(marquees.length).toBe(1);
      const marquee = marquees[0];

      // Marquee comes after the hero and before the trainer connector
      // in document order.
      expect(
        heroSection.compareDocumentPosition(marquee) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        marquee.compareDocumentPosition(connectorSection) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    } finally {
      restoreMatchMedia();
    }
  });

  // -------------------------------------------------------------------------
  // 4. Scroll indicator below the hero NotchedSection
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirement 20.1
   *
   * `<ScrollIndicator>` renders a chevron SVG containing a
   * `<polyline points="6 9 12 15 18 9" />`. The affordance must
   * appear after the hero `<NotchedSection>` in document order so
   * users see it directly below the fold-height hero.
   */
  it("HomePage: renders a scroll indicator chevron after the hero NotchedSection", () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const chevron = container.querySelector(
        'polyline[points="6 9 12 15 18 9"]'
      );
      expect(chevron).not.toBeNull();

      const headline = container.querySelector(
        'h1[aria-label="Rebuilding what apartheid destroyed."]'
      );
      const heroSection = headline.closest("section");
      expect(heroSection).not.toBeNull();

      // The chevron element is strictly after the hero NotchedSection.
      expect(
        heroSection.compareDocumentPosition(chevron) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      // And it is not a descendant of the hero section — the
      // indicator is a sibling "below" the notched hero, not nested
      // inside it.
      expect(heroSection.contains(chevron)).toBe(false);
    } finally {
      restoreMatchMedia();
    }
  });

  // -------------------------------------------------------------------------
  // 5. Hero card <img> carries width, height, and fetchpriority="high"
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirements 14.5, 32.4
   *
   * The hero Flip card `<img>` references `HERO_CARD_IMAGE` and must
   * serialize `width`, `height`, and `fetchpriority="high"` to the
   * DOM so the browser reserves layout space (zero CLS) and elevates
   * priority of the above-the-fold portrait.
   *
   * HTML attribute names are case-insensitive; `getAttribute` is
   * likewise case-insensitive, so the assertion is robust to how
   * React chooses to serialise the lowercase `fetchpriority` JSX
   * prop.
   */
  it('Hero card <img>: carries width, height, and fetchpriority="high"', () => {
    const { container, restoreMatchMedia } = renderHomePage();
    try {
      const heroCard = container.querySelector(
        `img[src="${HERO_CARD_IMAGE}"]`
      );
      expect(heroCard).not.toBeNull();

      // Intrinsic dimensions sourced from the Assets Module metadata
      // default export so the check stays honest to the canonical
      // `{ width, height }` values captured at asset intake.
      const expectedWidth = String(assets.HERO_CARD_IMAGE.width);
      const expectedHeight = String(assets.HERO_CARD_IMAGE.height);
      expect(heroCard.getAttribute("width")).toBe(expectedWidth);
      expect(heroCard.getAttribute("height")).toBe(expectedHeight);

      // `fetchpriority` may be serialised by React with either
      // case; `getAttribute` on HTMLElement is case-insensitive, but
      // in a couple of React versions it surfaces under the camelCase
      // form on the property side. Inspect both spellings and then
      // normalize the resolved value to lowercase before comparing.
      const fetchPriorityAttr =
        heroCard.getAttribute("fetchpriority") ||
        heroCard.getAttribute("fetchPriority");
      expect(fetchPriorityAttr).not.toBeNull();
      expect(fetchPriorityAttr.toLowerCase()).toBe("high");
    } finally {
      restoreMatchMedia();
    }
  });
});
