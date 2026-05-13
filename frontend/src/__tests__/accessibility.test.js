/**
 * Axe accessibility gate — per-route automated audit.
 *
 * Feature: e1-editorial-ui-overhaul, Task 11.1
 *
 * Renders every route (`/`, `/book`, `/join`, `/crisis`, `/resources`,
 * `/systems`, `/systems/:slug`, `/safety`, `/results`, `/about`,
 * `/vision`, `/contact`) under both motion-on and reduced-motion
 * environments and asserts zero serious or critical violations from
 * an Axe-core automated scan.
 *
 * Validates: Requirements 33.1, 33.2, 33.3, 33.4, 33.5
 */
/* eslint-disable global-require */

// Increase timeout for axe scans — each run can take several seconds.
jest.setTimeout(30000);

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
// default transform cannot parse.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = Real.defaults || (() => {});
  Real.config = Real.config || (() => {});
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
// Deferred requires — ES imports are hoisted above the matchMedia
// bootstrap, so routing them through `require(...)` preserves the
// initialization order.
// ---------------------------------------------------------------------------

const React = require("react");
const { render, cleanup } = require("@testing-library/react");
const { MemoryRouter, Routes, Route } = require("react-router-dom");
const { axe, toHaveNoViolations } = require("jest-axe");
const { gsap } = require("../lib/gsap");

expect.extend(toHaveNoViolations);

// Page component imports
const { HomePage } = require("../pages/HomePage");
const { BookPage } = require("../pages/BookPage");
const { JoinPage } = require("../pages/JoinPage");
const { ResourcesPage } = require("../pages/ResourcesPage");
const { SystemDetailPage } = require("../pages/SystemDetailPage");
const { SafetyPage } = require("../pages/SafetyPage");
const { ResultsPage } = require("../pages/ResultsPage");
const { AboutPage } = require("../pages/AboutPage");

// ---------------------------------------------------------------------------
// Route definitions — each entry maps a route path to its page component.
// CrisisPage, SystemsPage, VisionPage, ContactPage removed after
// page-consolidation-and-animations spec.
// ---------------------------------------------------------------------------

const ROUTES = [
  { path: "/", component: HomePage, label: "HomePage (/)" },
  { path: "/book", component: BookPage, label: "BookPage (/book)" },
  { path: "/join", component: JoinPage, label: "JoinPage (/join)" },
  { path: "/resources", component: ResourcesPage, label: "ResourcesPage (/resources)" },
  { path: "/systems/example-slug", component: SystemDetailPage, label: "SystemDetailPage (/systems/:slug)", routePath: "/systems/:slug" },
  { path: "/safety", component: SafetyPage, label: "SafetyPage (/safety)" },
  { path: "/results", component: ResultsPage, label: "ResultsPage (/results)" },
  { path: "/about", component: AboutPage, label: "AboutPage (/about)" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Install a `gsap.matchMedia` spy whose returned shim records no
 * handlers, so neither the motion nor the reduced-motion branch of
 * any `useGSAP` effect fires during mount.
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
 * Set `window.matchMedia` to report reduced-motion as matching or not.
 * Returns a restore function.
 */
function setReducedMotion(enabled) {
  const original = window.matchMedia;
  window.matchMedia = (query) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? enabled : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
  return () => {
    window.matchMedia = original;
  };
}

/**
 * Render a page component inside a MemoryRouter at the given path.
 */
function renderRoute(routeConfig) {
  const Component = routeConfig.component;
  const routePath = routeConfig.routePath || routeConfig.path;
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries: [routeConfig.path] },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, {
          path: routePath,
          element: React.createElement(Component),
        })
      )
    )
  );
}

/**
 * Filter axe results to only serious and critical violations.
 */
function filterSeriousOrCritical(results) {
  return {
    ...results,
    violations: results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    ),
  };
}

// ---------------------------------------------------------------------------
// Test suites — run tests sequentially to avoid "Axe is already running"
// ---------------------------------------------------------------------------

describe("Accessibility gate — motion ON (no reduced-motion)", () => {
  let restoreMatchMedia;
  let restoreMotion;

  beforeEach(() => {
    restoreMotion = setReducedMotion(false);
    restoreMatchMedia = installNoopMatchMedia();
  });

  afterEach(() => {
    restoreMatchMedia();
    restoreMotion();
    cleanup();
  });

  it.each(ROUTES.map((r) => [r.label, r]))(
    "%s — zero serious/critical axe violations",
    async (_label, route) => {
      const { container } = renderRoute(route);
      const rawResults = await axe(container);
      const results = filterSeriousOrCritical(rawResults);
      expect(results).toHaveNoViolations();
    }
  );
});

describe("Accessibility gate — reduced-motion ON", () => {
  let restoreMatchMedia;
  let restoreMotion;

  beforeEach(() => {
    restoreMotion = setReducedMotion(true);
    restoreMatchMedia = installNoopMatchMedia();
  });

  afterEach(() => {
    restoreMatchMedia();
    restoreMotion();
    cleanup();
  });

  it.each(ROUTES.map((r) => [r.label, r]))(
    "%s — zero serious/critical axe violations (reduced-motion)",
    async (_label, route) => {
      const { container } = renderRoute(route);
      const rawResults = await axe(container);
      const results = filterSeriousOrCritical(rawResults);
      expect(results).toHaveNoViolations();
    }
  );
});
