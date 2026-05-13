/**
 * Property-based test — `<HeroSection>` ambient video vs poster gating.
 *
 * Feature: e1-editorial-ui-overhaul, Property 15
 *
 * For any boolean pair `(reducedMotion, saveData)` applied via
 * `window.matchMedia` and `navigator.connection.saveData` mocks at
 * `<HeroSection>` mount time, this property asserts that the hero
 * background media layer renders:
 *
 *   - `<video src={HERO_AMBIENT_VIDEO}>` if and only if
 *     `reducedMotion === false && saveData === false`, and when that
 *     `<video>` renders it carries `muted`, `autoplay`, `loop`,
 *     `playsInline`, `preload="metadata"`, and
 *     `poster={HERO_POSTER_IMAGE}` (Requirements 15.1, 15.3, 15.4);
 *   - otherwise `<img src={HERO_POSTER_IMAGE}>` in place of the video
 *     (Requirements 15.5, 15.6).
 *
 * Strategy notes
 * --------------
 * `useStaticPoster` is sampled once during `useState` initialization
 * inside `<HeroSection>` via `prefersReducedMotion() || isSaveData()`,
 * so both mocks must be installed **before** `render(...)` runs. They
 * are torn down between fast-check iterations so the environment is
 * deterministic per sample.
 *
 * `gsap.matchMedia` is stubbed to a no-op `add`/`revert`/`kill` shim so
 * neither the motion nor the reduced-motion branch of the hero's
 * `useGSAP` effect fires — this test is concerned only with the static
 * background-media gating, not the entrance timeline authored inside
 * those branches. The plugin sub-paths are mocked with stub objects so
 * Jest's default transform does not choke on their ESM bundles (the
 * same pattern used by the other property tests in this folder).
 *
 * Validates: Requirements 15.1, 15.3, 15.4, 15.5, 15.6
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// matchMedia bootstrap — jsdom lacks `window.matchMedia`, and the
// `@/lib/gsap` runtime singleton touches it during `ScrollTrigger` setup.
// Install a permissive default stub before any require so module
// evaluation succeeds; each fast-check sample overwrites this stub with
// a per-sample implementation that reflects the generated preferences.
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

// ---------------------------------------------------------------------------
// GSAP plugin sub-path mocks — plugin bundles ship ESM that Jest's
// default transform cannot parse. `gsap/dist/ScrollTrigger` is the
// CJS-compatible UMD twin; the remaining plugins only need a
// registration-time surface so bare objects suffice.
// ---------------------------------------------------------------------------

jest.mock("gsap/ScrollTrigger", () => {
  const dist = require("gsap/dist/ScrollTrigger");
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = () => {};
  Real.config = () => {};
  return { __esModule: true, ScrollTrigger: Real };
});
jest.mock("gsap/SplitText", () => ({ __esModule: true, SplitText: {} }));
jest.mock("gsap/DrawSVGPlugin", () => ({
  __esModule: true,
  DrawSVGPlugin: {},
}));
jest.mock("gsap/Flip", () => ({ __esModule: true, Flip: {} }));
jest.mock("gsap/MorphSVGPlugin", () => ({
  __esModule: true,
  MorphSVGPlugin: {},
}));

// Deferred requires — ES imports are hoisted above the matchMedia stub,
// so routing them through `require(...)` keeps the initialization order
// correct.
// eslint-disable-next-line import/first, import/newline-after-import
const fc = require("fast-check");
const React = require("react");
const { cleanup, render } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");
const { gsap } = require("../../lib/gsap");
const {
  HERO_AMBIENT_VIDEO,
  HERO_POSTER_IMAGE,
} = require("../../lib/assets");
const { HeroSection } = require("../home/HeroSection");

// ---------------------------------------------------------------------------
// Per-sample environment installers.
// ---------------------------------------------------------------------------

/**
 * Replace `window.matchMedia` with a stub whose `matches` value for
 * `(prefers-reduced-motion: reduce)` equals the sampled `reducedMotion`
 * boolean and is `false` for every other query. Returns a restore
 * callback that reinstates the previous implementation.
 *
 * @param {boolean} reducedMotion
 * @returns {() => void}
 */
function installMatchMedia(reducedMotion) {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches:
      /prefers-reduced-motion:\s*reduce/.test(query) && reducedMotion === true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
  return () => {
    window.matchMedia = original;
  };
}

/**
 * Install `navigator.connection` with a `saveData` getter equal to the
 * sampled boolean. The default jsdom `navigator` object does not expose
 * the `connection` descriptor, so `Object.defineProperty` is used to
 * shim it in a way that survives the read path inside `isSaveData()`.
 * Returns a restore callback that removes the shim.
 *
 * @param {boolean} saveData
 * @returns {() => void}
 */
function installConnection(saveData) {
  const previous = Object.getOwnPropertyDescriptor(navigator, "connection");
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    get: () => ({ saveData }),
  });
  return () => {
    if (previous) {
      Object.defineProperty(navigator, "connection", previous);
    } else {
      delete navigator.connection;
    }
  };
}

// ---------------------------------------------------------------------------
// Property 15
// ---------------------------------------------------------------------------

describe("<HeroSection> — Property 15: ambient video vs poster gating", () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 15 — background renders `<video src={HERO_AMBIENT_VIDEO}>`
   * iff `reducedMotion === false && saveData === false`, else renders
   * `<img src={HERO_POSTER_IMAGE}>`; the video carries the full
   * attribute set.
   *
   * Feature: e1-editorial-ui-overhaul, Property 15
   *
   * Generator:
   *   `fc.record({ reducedMotion: fc.boolean(), saveData: fc.boolean() })`
   *
   * For each sampled pair:
   *   1. Install a `window.matchMedia` stub whose
   *      `(prefers-reduced-motion: reduce)` query reflects
   *      `reducedMotion`.
   *   2. Install a `navigator.connection` shim whose `saveData` getter
   *      returns the sampled value.
   *   3. Stub `gsap.matchMedia` to a no-op shim so the hero's
   *      `useGSAP` effect does not fan out into its motion /
   *      reduced-motion branches during this DOM-only assertion.
   *   4. Render `<HeroSection />` inside a `<MemoryRouter>` (the CTA
   *      calls `useNavigate`).
   *   5. Assert gating: if both booleans are false, a `<video>` with
   *      `src === HERO_AMBIENT_VIDEO` is present, no
   *      `<img src={HERO_POSTER_IMAGE}>` is rendered, and the video
   *      carries `muted`, `autoplay`, `loop`, `playsInline`,
   *      `preload === "metadata"`, and `poster === HERO_POSTER_IMAGE`.
   *      Otherwise, no `<video>` is rendered and
   *      `<img src={HERO_POSTER_IMAGE}>` is present.
   *   6. Unmount and restore the environment so the next sample starts
   *      from a clean baseline.
   *
   * Validates: Requirements 15.1, 15.3, 15.4, 15.5, 15.6
   */
  it("renders <video> iff reducedMotion && saveData are both false, else <img>, and video carries the required attributes", () => {
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
          fc.record({
            reducedMotion: fc.boolean(),
            saveData: fc.boolean(),
          }),
          ({ reducedMotion, saveData }) => {
            const restoreMatchMedia = installMatchMedia(reducedMotion);
            const restoreConnection = installConnection(saveData);

            try {
              const { container, unmount } = render(
                <MemoryRouter>
                  <HeroSection />
                </MemoryRouter>
              );

              const shouldRenderVideo =
                reducedMotion === false && saveData === false;

              const video = container.querySelector(
                `video[src="${HERO_AMBIENT_VIDEO}"]`
              );
              const posterImg = container.querySelector(
                `img[src="${HERO_POSTER_IMAGE}"]`
              );

              if (shouldRenderVideo) {
                // The ambient video is present and the static poster
                // image is not (Requirement 15.1).
                expect(video).not.toBeNull();
                expect(posterImg).toBeNull();

                // Required boolean attributes — check both the DOM
                // attribute surface and the IDL property so the
                // assertion is robust to how React 18 serialises
                // boolean props on <video>.
                expect(
                  video.hasAttribute("muted") || video.muted === true
                ).toBe(true);
                expect(
                  video.hasAttribute("autoplay") || video.autoplay === true
                ).toBe(true);
                expect(
                  video.hasAttribute("loop") || video.loop === true
                ).toBe(true);
                expect(
                  video.hasAttribute("playsinline") ||
                    video.playsInline === true
                ).toBe(true);

                // String attributes — the literal attribute values
                // must match the Assets Module constants exactly.
                expect(video.getAttribute("preload")).toBe("metadata");
                expect(video.getAttribute("poster")).toBe(HERO_POSTER_IMAGE);
              } else {
                // Reduced motion or save-data forces the static
                // poster image branch (Requirements 15.5, 15.6) and
                // there is no `<video>` in the rendered tree at all.
                expect(
                  container.querySelector("video")
                ).toBeNull();
                expect(posterImg).not.toBeNull();
              }

              unmount();
              // Explicit per-iteration cleanup — fast-check's
              // predicate is synchronous and `afterEach` only fires
              // between `it()` blocks, so without this the prior
              // iteration's DOM would remain mounted alongside the
              // next sample's render.
              cleanup();
            } finally {
              restoreConnection();
              restoreMatchMedia();
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    } finally {
      matchMediaSpy.mockRestore();
    }
  });
});
