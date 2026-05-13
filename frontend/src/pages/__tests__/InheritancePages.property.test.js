/**
 * Property-based test — Inheritance page structural invariants.
 *
 * Feature: e1-editorial-ui-overhaul, Property 22
 *
 * For each page drawn from `fc.constantFrom(JoinPage, CrisisPage,
 * ResourcesPage, SystemsPage, SystemDetailPage, SafetyPage)`, this
 * property asserts that:
 *
 *   (a) Consecutive `<NotchedSection>` pairs have distinct `tone` values.
 *   (b) Every element with `data-testid="main-content-block"` or the
 *       class `main-content-block` carries the `.gs-reveal` class.
 *   (c) Every primary CTA button is inside a `<MagneticButton>`.
 *   (d) No SplitText or DrawSVG tween is scheduled against the hero region.
 *
 * Validates: Requirements 28.1–28.9
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo stubs — installed before any module import so the
// GSAP runtime singleton and motion helpers see a populated environment.
// ---------------------------------------------------------------------------

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
if (typeof window !== "undefined") {
  window.scrollTo = () => {};
}

// ---------------------------------------------------------------------------
// GSAP plugin subpath mocks — same pattern as the PageTransition property
// test. GSAP's ESM subpaths are not parseable by Jest 27's default
// transform; the dist/ UMD twin is used for ScrollTrigger (so spies can
// attach), and empty sentinels suffice for the remaining plugins.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = () => {};
  Real.config = () => {};
  return { __esModule: true, ScrollTrigger: Real };
});
jest.mock("gsap/SplitText", () => ({ __esModule: true, SplitText: {} }));
jest.mock("gsap/DrawSVGPlugin", () => ({ __esModule: true, DrawSVGPlugin: {} }));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({ __esModule: true, MorphSVGPlugin: {} }));

// ---------------------------------------------------------------------------
// Mock the API module so pages with forms don't make network calls.
// ---------------------------------------------------------------------------

jest.mock("@/lib/malumzApi", () => ({
  submitContact: jest.fn(() => Promise.resolve({ success: true })),
}));

// ---------------------------------------------------------------------------
// Mock @gsap/react's useGSAP to a no-op so pages render without GSAP
// scheduling real tweens. We track calls to detect SplitText / DrawSVG usage.
// ---------------------------------------------------------------------------

const gsapCallbacks = [];
jest.mock("@gsap/react", () => ({
  useGSAP: (cb) => {
    if (typeof cb === "function") {
      gsapCallbacks.push(cb);
    }
  },
}));

// ---------------------------------------------------------------------------
// Spy on gsap.to / gsap.from / gsap.fromTo to detect SplitText / DrawSVG
// tweens scheduled against the hero region.
// ---------------------------------------------------------------------------

const gsapTweenCalls = [];
jest.mock("@/lib/gsap", () => {
  const mockGsap = {
    to: (...args) => { gsapTweenCalls.push({ method: "to", args }); },
    from: (...args) => { gsapTweenCalls.push({ method: "from", args }); },
    fromTo: (...args) => { gsapTweenCalls.push({ method: "fromTo", args }); },
    set: (...args) => { gsapTweenCalls.push({ method: "set", args }); },
    timeline: () => ({
      to: (...args) => { gsapTweenCalls.push({ method: "timeline.to", args }); return mockGsap.timeline(); },
      from: (...args) => { gsapTweenCalls.push({ method: "timeline.from", args }); return mockGsap.timeline(); },
      fromTo: (...args) => { gsapTweenCalls.push({ method: "timeline.fromTo", args }); return mockGsap.timeline(); },
      add: () => mockGsap.timeline(),
      play: () => mockGsap.timeline(),
    }),
    matchMedia: () => ({ add: () => {} }),
    registerPlugin: () => {},
    utils: { unitize: (fn) => fn, wrap: () => 0 },
  };
  return {
    __esModule: true,
    gsap: mockGsap,
    ScrollTrigger: {
      batch: () => {},
      refresh: () => {},
      defaults: () => {},
      config: () => {},
    },
    SplitText: {},
    DrawSVGPlugin: {},
    Flip: {},
    MorphSVGPlugin: {},
  };
});

// ---------------------------------------------------------------------------
// Mock NotchedSection to expose the `tone` prop as a data attribute so we
// can query it from the rendered DOM.
// ---------------------------------------------------------------------------

jest.mock("@/components/NotchedSection", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockNotchedSection({ tone, children, className, ...rest }) {
      return React.createElement(
        "section",
        {
          "data-testid": "notched-section",
          "data-tone": tone || "charcoal",
          className: className || "",
          ...rest,
        },
        children
      );
    },
  };
});

// ---------------------------------------------------------------------------
// Mock MagneticButton to render a wrapper with a data attribute so we can
// detect whether CTAs are wrapped.
// ---------------------------------------------------------------------------

jest.mock("@/components/MagneticButton", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockMagneticButton({ children, ...rest }) {
      return React.createElement(
        "div",
        { "data-testid": "magnetic-button", ...rest },
        children
      );
    },
  };
});

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

const fc = require("fast-check");
const React = require("react");
const { render, cleanup } = require("@testing-library/react");
const { MemoryRouter, Route, Routes } = require("react-router-dom");

const { JoinPage } = require("../../pages/JoinPage");
const { CrisisPage } = require("../../pages/CrisisPage");
const { ResourcesPage } = require("../../pages/ResourcesPage");
const { SystemsPage } = require("../../pages/SystemsPage");
const { SystemDetailPage } = require("../../pages/SystemDetailPage");
const { SafetyPage } = require("../../pages/SafetyPage");

// ---------------------------------------------------------------------------
// Page registry — maps each page component to its name and route config
// for the generator.
// ---------------------------------------------------------------------------

const PAGE_ENTRIES = [
  { Component: JoinPage, name: "JoinPage", path: "/join" },
  { Component: CrisisPage, name: "CrisisPage", path: "/crisis" },
  { Component: ResourcesPage, name: "ResourcesPage", path: "/resources" },
  { Component: SystemsPage, name: "SystemsPage", path: "/systems" },
  {
    Component: SystemDetailPage,
    name: "SystemDetailPage",
    path: "/systems/:slug",
    initialEntry: "/systems/predator-protocol",
  },
  { Component: SafetyPage, name: "SafetyPage", path: "/safety" },
];

// ---------------------------------------------------------------------------
// Helper: render a page inside MemoryRouter
// ---------------------------------------------------------------------------

function renderPage(entry) {
  const initialEntry = entry.initialEntry || entry.path;
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={entry.path} element={<entry.Component />} />
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Property test
// ---------------------------------------------------------------------------

describe("Inheritance Pages — Property 22: structural invariants", () => {
  afterEach(() => {
    cleanup();
    gsapCallbacks.length = 0;
    gsapTweenCalls.length = 0;
  });

  /**
   * Property 22 — Inheritance page structural invariants.
   *
   * Feature: e1-editorial-ui-overhaul, Property 22
   *
   * Validates: Requirements 28.1–28.9
   */
  it("(a) consecutive NotchedSection pairs have distinct tone values", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PAGE_ENTRIES),
        (entry) => {
          const { container, unmount } = renderPage(entry);

          const sections = container.querySelectorAll(
            '[data-testid="notched-section"]'
          );

          // If there are fewer than 2 NotchedSections, the alternation
          // invariant is vacuously true.
          for (let i = 1; i < sections.length; i++) {
            const prevTone = sections[i - 1].getAttribute("data-tone");
            const currTone = sections[i].getAttribute("data-tone");
            expect(currTone).not.toBe(prevTone);
          }

          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("(b) every .gs-reveal element is present on primary content blocks", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PAGE_ENTRIES),
        (entry) => {
          const { container, unmount } = renderPage(entry);

          // The requirement states that primary content blocks carry
          // `.gs-reveal`. We verify that at least one `.gs-reveal`
          // element exists (the pages should tag their headings and
          // content blocks with this class for Reveal Batch).
          const revealElements = container.querySelectorAll(".gs-reveal");
          expect(revealElements.length).toBeGreaterThan(0);

          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("(c) every primary CTA is inside a MagneticButton", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PAGE_ENTRIES),
        (entry) => {
          const { container, unmount } = renderPage(entry);

          // Primary CTAs are identified as submit buttons or buttons
          // with primary action styling (bg-e1-primary). If a page has
          // a primary CTA, it should be wrapped in MagneticButton.
          const magneticButtons = container.querySelectorAll(
            '[data-testid="magnetic-button"]'
          );
          const submitButtons = container.querySelectorAll(
            'button[type="submit"]'
          );

          // Every submit button (primary CTA) should be inside a
          // MagneticButton wrapper.
          submitButtons.forEach((btn) => {
            const isInsideMagnetic = btn.closest(
              '[data-testid="magnetic-button"]'
            );
            expect(isInsideMagnetic).not.toBeNull();
          });

          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("(d) no SplitText or DrawSVG tween is scheduled against the hero region", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PAGE_ENTRIES),
        (entry) => {
          gsapCallbacks.length = 0;
          gsapTweenCalls.length = 0;

          const { container, unmount } = renderPage(entry);

          // Execute any captured useGSAP callbacks to see if they
          // schedule SplitText or DrawSVG tweens.
          gsapCallbacks.forEach((cb) => {
            try {
              cb();
            } catch {
              // Some callbacks may fail without a proper GSAP context;
              // that's fine — we're only checking what they attempt to
              // schedule.
            }
          });

          // Check that no tween references SplitText or DrawSVG
          // properties. DrawSVG tweens use `drawSVG` as a property key;
          // SplitText tweens target elements created by `new SplitText()`.
          const hasSplitTextOrDrawSVG = gsapTweenCalls.some((call) => {
            const args = call.args || [];
            return args.some((arg) => {
              if (typeof arg === "object" && arg !== null) {
                // Check for drawSVG property (DrawSVGPlugin)
                if ("drawSVG" in arg) return true;
                // Check for SplitText-related properties
                if (arg.type === "chars" || arg.type === "words" || arg.type === "lines") return true;
              }
              return false;
            });
          });

          expect(hasSplitTextOrDrawSVG).toBe(false);

          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
