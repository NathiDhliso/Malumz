/**
 * Property-based test — ResultsPage play/pause state machine.
 *
 * Feature: e1-editorial-ui-overhaul, Property 21
 *
 * For a generated integer `k` in [0, 20] representing the number of
 * toggle activations starting from the initial paused state, this
 * property asserts that:
 *
 *   1. `video.paused === (k % 2 === 0)` — even activations leave the
 *      video paused (including zero activations, i.e. the initial
 *      state); odd activations leave it playing.
 *   2. `button.getAttribute("aria-pressed") === String(k % 2 === 1)` —
 *      the accessible pressed state mirrors the playing state.
 *
 * The video element's `play()` and `pause()` methods are mocked to
 * synchronously toggle the `paused` property and dispatch the
 * corresponding native event, which the component subscribes to for
 * state synchronization.
 *
 * Validates: Requirements 27.2, 27.3, 27.4
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
// Mock lucide-react icons to avoid SVG rendering issues in jsdom.
// ---------------------------------------------------------------------------

jest.mock("lucide-react", () => ({
  BarChart3: (props) => <span data-testid="icon-barchart3" {...props} />,
  Target: (props) => <span data-testid="icon-target" {...props} />,
  Calendar: (props) => <span data-testid="icon-calendar" {...props} />,
  Play: (props) => <span data-testid="icon-play" {...props} />,
  Pause: (props) => <span data-testid="icon-pause" {...props} />,
}));

// ---------------------------------------------------------------------------
// Mock NotchedSection to a simple pass-through wrapper — the property test
// is concerned with the play/pause state machine, not the layout primitive.
// ---------------------------------------------------------------------------

jest.mock("@/components/NotchedSection", () => {
  return function MockNotchedSection({ children, ...props }) {
    return <div data-testid="notched-section" {...props}>{children}</div>;
  };
});

const fc = require("fast-check");
const React = require("react");
const { act, cleanup, render, fireEvent } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");

// ---------------------------------------------------------------------------
// HTMLMediaElement mock — jsdom does not implement play()/pause() or the
// `paused` property on <video>. We patch the prototype so every <video>
// rendered in the test has a working state machine that dispatches native
// events, which the ResultsPage subscribes to for state synchronization.
// ---------------------------------------------------------------------------

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    get() {
      // Default to true (paused) unless explicitly set
      if (this._paused === undefined) this._paused = true;
      return this._paused;
    },
    configurable: true,
  });

  HTMLMediaElement.prototype.play = function () {
    this._paused = false;
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  };

  HTMLMediaElement.prototype.pause = function () {
    this._paused = true;
    this.dispatchEvent(new Event("pause"));
  };

  HTMLMediaElement.prototype.load = function () {};
});

const { ResultsPage } = require("../ResultsPage");

describe("ResultsPage — Property 21: play/pause state machine", () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 21 — After k toggle activations from the initial paused
   * state, the video's paused property and the button's aria-pressed
   * attribute reflect the expected state.
   *
   * Feature: e1-editorial-ui-overhaul, Property 21
   *
   * Generator: fc.integer({min: 0, max: 20})
   *
   * Invariants:
   *   - video.paused === (k % 2 === 0)
   *   - button.getAttribute("aria-pressed") === String(k % 2 === 1)
   *
   * Validates: Requirements 27.2, 27.3, 27.4
   */
  it("after k toggle activations, video.paused === (k % 2 === 0) and aria-pressed === String(k % 2 === 1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        (k) => {
          const { getByTestId, unmount } = render(
            <MemoryRouter initialEntries={["/results"]}>
              <ResultsPage />
            </MemoryRouter>
          );

          const video = getByTestId("results-testimonial-video");
          const button = getByTestId("results-testimonial-toggle");

          // Initial state: video is paused, button is not pressed
          // (Requirement 27.2)
          expect(video.paused).toBe(true);
          expect(button.getAttribute("aria-pressed")).toBe("false");

          // Perform k toggle activations
          for (let i = 0; i < k; i += 1) {
            act(() => {
              fireEvent.click(button);
            });
          }

          // After k activations:
          // - Even k (including 0): video should be paused
          // - Odd k: video should be playing
          const expectedPaused = k % 2 === 0;
          const expectedPressed = String(k % 2 === 1);

          expect(video.paused).toBe(expectedPaused);
          expect(button.getAttribute("aria-pressed")).toBe(expectedPressed);

          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
