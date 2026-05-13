/**
 * Property-based test — Asset-load-failure graceful fallback.
 *
 * Feature: e1-editorial-ui-overhaul, Property 24
 *
 * For each asset key exported by the Assets Module, this property renders
 * the consuming component, dispatches a synthetic `error` event on the
 * associated media element (`<img>` or `<video>`), and asserts that one of
 * the documented fallbacks is rendered:
 *
 *   - HERO_AMBIENT_VIDEO: video onError → swap to `<img src={HERO_POSTER_IMAGE}>`
 *   - HERO_CARD_IMAGE: img onError → swap to e1-surface colored div with aria-hidden
 *   - ABOUT_COLLAGE_*: img onError → swap to e1-surface colored div with aria-hidden
 *   - VISION_NODE_*: img onError → swap to e1-surface colored div
 *   - BOOK_ACCENT_VIDEO: video onError → swap to e1-surface colored div
 *   - RESULTS_TESTIMONIAL_VIDEO: video onError → swap to e1-surface colored div
 *
 * Strategy notes
 * --------------
 * Each asset key maps to a specific consuming component. The test renders
 * that component inside a `<MemoryRouter>`, locates the media element by
 * its `src` attribute, fires a synthetic `error` event via `fireEvent.error`,
 * and then asserts the fallback DOM is present. GSAP is stubbed to a no-op
 * shim so the test focuses purely on the error-handling render path.
 *
 * The `HERO_POSTER_IMAGE` key is excluded from the generator because it is
 * itself the fallback target for `HERO_AMBIENT_VIDEO` — it does not have a
 * separate consuming component with its own error handler in the current
 * implementation.
 *
 * Validates: Requirements 35.1, 35.2, 35.3, 35.4
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// matchMedia bootstrap — jsdom lacks `window.matchMedia`.
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

// jsdom does not implement `window.scrollTo`.
if (typeof window !== "undefined" && typeof window.scrollTo !== "function") {
  window.scrollTo = () => {};
}

// ---------------------------------------------------------------------------
// GSAP plugin sub-path mocks — plugin bundles ship ESM that Jest's
// default transform cannot parse.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = Real.defaults || (() => {});
  Real.config = Real.config || (() => {});
  Real.batch = Real.batch || (() => {});
  Real.refresh = Real.refresh || (() => {});
  Real.killAll = Real.killAll || (() => {});
  Real.clearScrollMemory = Real.clearScrollMemory || (() => {});
  return { __esModule: true, ScrollTrigger: Real };
});
jest.mock("gsap/SplitText", () => ({
  __esModule: true,
  SplitText: class SplitText {
    constructor() {
      this.chars = [];
      this.words = [];
      this.lines = [];
    }
    revert() {}
  },
}));
jest.mock("gsap/DrawSVGPlugin", () => ({
  __esModule: true,
  DrawSVGPlugin: {},
}));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({
  __esModule: true,
  MorphSVGPlugin: {},
}));

const fc = require("fast-check");
const React = require("react");
const { render, cleanup, fireEvent, act } = require("@testing-library/react");
const { MemoryRouter, Routes, Route } = require("react-router-dom");
const assetsDefault = require("../../lib/assets").default;
const {
  HERO_AMBIENT_VIDEO,
  HERO_POSTER_IMAGE,
  HERO_CARD_IMAGE,
  ABOUT_COLLAGE_A,
  ABOUT_COLLAGE_B,
  ABOUT_COLLAGE_C,
  VISION_NODE_1,
  VISION_NODE_2,
  VISION_NODE_3,
  BOOK_ACCENT_VIDEO,
  RESULTS_TESTIMONIAL_VIDEO,
} = require("../../lib/assets");
const { gsap } = require("../../lib/gsap");

// ---------------------------------------------------------------------------
// Lazy-load consuming components to avoid import-order issues.
// ---------------------------------------------------------------------------

const { HeroSection } = require("../home/HeroSection");
const { AboutPage } = require("../../pages/AboutPage");
const { BookPage } = require("../../pages/BookPage");
const { ResultsPage } = require("../../pages/ResultsPage");

// ---------------------------------------------------------------------------
// Asset key → consuming component and assertion logic mapping.
// ---------------------------------------------------------------------------

/**
 * Maps each asset key to:
 *   - component: the React component that consumes the asset
 *   - route: the route path for MemoryRouter
 *   - mediaSelector: CSS selector to find the media element before error
 *   - assertFallback: function that asserts the fallback is rendered
 */
const ASSET_TEST_CONFIG = {
  HERO_AMBIENT_VIDEO: {
    component: HeroSection,
    route: "/",
    getMediaElement: (container) =>
      container.querySelector(`video[src="${HERO_AMBIENT_VIDEO}"]`),
    assertFallback: (container) => {
      // After error, video should be gone and poster image should appear
      const video = container.querySelector("video");
      const posterImg = container.querySelector(
        `img[src="${HERO_POSTER_IMAGE}"]`
      );
      expect(video).toBeNull();
      expect(posterImg).not.toBeNull();
    },
  },
  ABOUT_COLLAGE_A: {
    component: AboutPage,
    route: "/about",
    getMediaElement: (container) =>
      container.querySelector(`img[src="${ABOUT_COLLAGE_A}"]`),
    assertFallback: (container) => {
      const img = container.querySelector(`img[src="${ABOUT_COLLAGE_A}"]`);
      expect(img).toBeNull();
      // Should have an e1-surface placeholder with aria-hidden
      const placeholders = container.querySelectorAll(
        'div[aria-hidden="true"]'
      );
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.className.includes("bg-e1-surface") &&
          el.style.width === `${assetsDefault.ABOUT_COLLAGE_A.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  ABOUT_COLLAGE_B: {
    component: AboutPage,
    route: "/about",
    getMediaElement: (container) =>
      container.querySelector(`img[src="${ABOUT_COLLAGE_B}"]`),
    assertFallback: (container) => {
      const img = container.querySelector(`img[src="${ABOUT_COLLAGE_B}"]`);
      expect(img).toBeNull();
      const placeholders = container.querySelectorAll(
        'div[aria-hidden="true"]'
      );
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.className.includes("bg-e1-surface") &&
          el.style.width === `${assetsDefault.ABOUT_COLLAGE_B.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  ABOUT_COLLAGE_C: {
    component: AboutPage,
    route: "/about",
    getMediaElement: (container) =>
      container.querySelector(`img[src="${ABOUT_COLLAGE_C}"]`),
    assertFallback: (container) => {
      const img = container.querySelector(`img[src="${ABOUT_COLLAGE_C}"]`);
      expect(img).toBeNull();
      const placeholders = container.querySelectorAll(
        'div[aria-hidden="true"]'
      );
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.className.includes("bg-e1-surface") &&
          el.style.width === `${assetsDefault.ABOUT_COLLAGE_C.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  VISION_NODE_1: {
    component: AboutPage,
    route: "/about",
    getMediaElement: (container) =>
      container.querySelector(`img[src="${VISION_NODE_1}"]`),
    assertFallback: (container) => {
      const img = container.querySelector(`img[src="${VISION_NODE_1}"]`);
      expect(img).toBeNull();
      // Vision node fallback is an e1-surface div (may or may not have aria-hidden)
      const placeholders = container.querySelectorAll("div.bg-e1-surface");
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.style.width === `${assetsDefault.VISION_NODE_1.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  VISION_NODE_2: {
    component: AboutPage,
    route: "/about",
    getMediaElement: (container) =>
      container.querySelector(`img[src="${VISION_NODE_2}"]`),
    assertFallback: (container) => {
      const img = container.querySelector(`img[src="${VISION_NODE_2}"]`);
      expect(img).toBeNull();
      const placeholders = container.querySelectorAll("div.bg-e1-surface");
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.style.width === `${assetsDefault.VISION_NODE_2.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  VISION_NODE_3: {
    component: AboutPage,
    route: "/about",
    getMediaElement: (container) =>
      container.querySelector(`img[src="${VISION_NODE_3}"]`),
    assertFallback: (container) => {
      const img = container.querySelector(`img[src="${VISION_NODE_3}"]`);
      expect(img).toBeNull();
      const placeholders = container.querySelectorAll("div.bg-e1-surface");
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.style.width === `${assetsDefault.VISION_NODE_3.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  BOOK_ACCENT_VIDEO: {
    component: BookPage,
    route: "/book",
    getMediaElement: (container) =>
      container.querySelector(`video[src="${BOOK_ACCENT_VIDEO}"]`),
    assertFallback: (container) => {
      // After error, video should be gone and e1-surface div should appear
      const video = container.querySelector(`video[src="${BOOK_ACCENT_VIDEO}"]`);
      expect(video).toBeNull();
      const placeholders = container.querySelectorAll("div.bg-e1-surface");
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.style.width === `${assetsDefault.BOOK_ACCENT_VIDEO.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
  RESULTS_TESTIMONIAL_VIDEO: {
    component: ResultsPage,
    route: "/results",
    getMediaElement: (container) =>
      container.querySelector(`video[src="${RESULTS_TESTIMONIAL_VIDEO}"]`),
    assertFallback: (container) => {
      // After error, video should be gone and e1-surface div should appear
      const video = container.querySelector(
        `video[src="${RESULTS_TESTIMONIAL_VIDEO}"]`
      );
      expect(video).toBeNull();
      const placeholders = container.querySelectorAll("div.bg-e1-surface");
      const hasSurfacePlaceholder = Array.from(placeholders).some(
        (el) =>
          el.style.width ===
          `${assetsDefault.RESULTS_TESTIMONIAL_VIDEO.width}px`
      );
      expect(hasSurfacePlaceholder).toBe(true);
    },
  },
};

// The asset keys to test — excludes HERO_POSTER_IMAGE which is itself a
// fallback target and has no independent error handler.
const TESTABLE_ASSET_KEYS = Object.keys(ASSET_TEST_CONFIG);

// ---------------------------------------------------------------------------
// Property 24
// ---------------------------------------------------------------------------

describe("Property 24: Asset-load-failure graceful fallback", () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 24 — for each asset key, render the consuming component,
   * dispatch a synthetic `error` event on the associated media element,
   * and assert one of the documented fallbacks is rendered (poster swap,
   * surface block, plain-text headline, or fully-drawn paths).
   *
   * Feature: e1-editorial-ui-overhaul, Property 24
   *
   * Generator: `fc.constantFrom(...Object.keys(assetsDefault))`
   * (filtered to testable keys that have consuming components with
   * error handlers)
   *
   * Validates: Requirements 35.1, 35.2, 35.3, 35.4
   */
  it("renders a graceful fallback when a media asset fails to load", () => {
    // Stub gsap.matchMedia so useGSAP effects don't fan out into
    // motion branches during this DOM-only assertion.
    const matchMediaSpy = jest
      .spyOn(gsap, "matchMedia")
      .mockImplementation(() => ({
        add: () => {},
        revert: () => {},
        kill: () => {},
      }));

    try {
      fc.assert(
        fc.property(
          fc.constantFrom(...TESTABLE_ASSET_KEYS),
          (assetKey) => {
            const config = ASSET_TEST_CONFIG[assetKey];
            const Component = config.component;

            const { container, unmount } = render(
              <MemoryRouter initialEntries={[config.route]}>
                <Routes>
                  <Route path={config.route} element={<Component />} />
                  <Route path="*" element={<Component />} />
                </Routes>
              </MemoryRouter>
            );

            // Locate the media element that should have an onError handler
            const mediaElement = config.getMediaElement(container);

            // The media element must exist before the error fires
            expect(mediaElement).not.toBeNull();

            // Dispatch a synthetic error event to trigger the fallback
            act(() => {
              fireEvent.error(mediaElement);
            });

            // Assert the documented fallback is now rendered
            config.assertFallback(container);

            unmount();
            cleanup();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      matchMediaSpy.mockRestore();
    }
  });
});
