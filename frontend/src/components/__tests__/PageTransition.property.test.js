/**
 * Property-based test — `<PageTransition>` cycle and refresh discipline.
 *
 * Feature: e1-editorial-ui-overhaul, Property 10
 *
 * For a generated sequence of pathnames drawn from the eleven-route
 * union of the app, starting at `paths[0]` and navigating in order to
 * each subsequent element, this property asserts that:
 *
 *   1. `ScrollTrigger.refresh()` is called exactly `N` times across
 *      `N` completed (effective) transitions. A consecutive-duplicate
 *      pathname is not an effective transition because React Router's
 *      `useLocation` returns a stable reference when the pathname is
 *      unchanged, so `<PageTransition>`'s `useGSAP` dependency array
 *      does not re-run and no curtain sweep is produced.
 *   2. Each completed transition's full sweep finishes within 1.0 s of
 *      the pathname change. The property drives GSAP's ticker by hand
 *      with 16 ms steps up to a 1000-ms-plus-headroom ceiling per
 *      transition — any authored sweep longer than that would be
 *      caught by the cumulative-count assertion (an un-completed
 *      sweep leaves `ScrollTrigger.refresh()` un-called for that
 *      transition).
 *
 * ### Why GSAP is driven by hand instead of `jest.useFakeTimers`
 *
 * GSAP's ticker wakes at module-load time (see `_windowExists() &&
 * _wake()` in `gsap/dist/gsap.js`) and captures `requestAnimationFrame`
 * on first wake. Even switching to `jest.useFakeTimers("modern")`
 * after the require cannot retroactively replace GSAP's captured RAF
 * reference, so `jest.advanceTimersByTime` never moves the timeline
 * forward. The reliable way to drive GSAP deterministically inside a
 * unit test is `gsap.ticker.tick()`, which the library documents as a
 * manual-drive entry point. The only wrinkle is that `tick()` reads
 * `Date.now()` to compute `delta`; the harness below wraps `Date.now`
 * in a controllable clock so each `tick()` step advances the library
 * by exactly 16 ms (~1 frame at 60 Hz). Each tick is wrapped in its
 * own `act(...)` so React flushes the `setDisplayLocation` commit
 * queued by the curtain's DOM-swap hand-off between frames — batching
 * the ticks inside a single `act(...)` swallows those intermediate
 * commits and the `onComplete` that fires `refresh()` never runs.
 *
 * `ScrollTrigger.refresh()` is spied with a no-op implementation so
 * the test counts calls without performing real re-measurement (which
 * is a no-op in jsdom anyway), and the spy is reset between property
 * iterations via `mockClear()` so leftover calls never leak across
 * samples.
 *
 * `numRuns` is dialled to 50 rather than the default 100 because each
 * iteration performs a full React render + up-to-seven navigations +
 * a manual tick loop per navigation. 50 runs remain sufficient for
 * fast-check's property-shrinking coverage of the generated
 * eleven-route × eight-length input space.
 *
 * Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 21.2
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo stubs — installed before any module import so the
// `@/lib/gsap` runtime singleton and `<PageTransition>` see a populated
// `window.matchMedia` / `window.scrollTo` at module-evaluation time. jsdom
// does not provide either by default.
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
// GSAP plugin subpath mocks — `gsap/ScrollTrigger` et al. ship ESM that
// Jest 27's default transform cannot parse. The `dist/` twin is a UMD
// CJS bundle, so the `ScrollTrigger` mock proxies that real object (we
// need `ScrollTrigger.refresh` to actually exist so `jest.spyOn` has a
// method to replace). The other four plugins are only referenced by the
// runtime-singleton's `gsap.registerPlugin(...)` call — empty sentinels
// are sufficient there. `defaults` / `config` are patched to no-ops so
// the one-time import side effects do not accumulate across runs.
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
// Controllable `Date.now()` — installed before the `@/lib/gsap` require so
// GSAP's `_wake()` (which runs at module load) reads our clock from its
// very first sample. Every subsequent `gsap.ticker.tick()` reads the same
// clock, so advancing `currentMs` by 16 ms before each tick steps the
// library by exactly 16 ms of animated time.
// ---------------------------------------------------------------------------

const realDateNow = Date.now.bind(Date);
let currentMs = realDateNow();
Date.now = () => currentMs;

const fc = require("fast-check");
const React = require("react");
const { forwardRef, useImperativeHandle } = React;
const { act, cleanup, render } = require("@testing-library/react");
const {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} = require("react-router-dom");
const { gsap, ScrollTrigger } = require("../../lib/gsap");
const { PageTransition } = require("../PageTransition");

// ---------------------------------------------------------------------------
// Route universe — mirrors the generator specified in task 2.10.
// ---------------------------------------------------------------------------

const ROUTE_PATHS = [
  "/",
  "/book",
  "/about",
  "/vision",
  "/contact",
  "/results",
  "/join",
  "/crisis",
  "/resources",
  "/systems",
  "/safety",
];

// ---------------------------------------------------------------------------
// Imperative navigation handle — exposes `react-router-dom`'s `navigate`
// to the test via a ref so the property can drive route changes without
// re-rendering the host `<MemoryRouter>`. Re-creating the router between
// transitions would double-count initial mounts and lose the curtain's
// cross-pathname state machine.
// ---------------------------------------------------------------------------

const Navigator = forwardRef(function Navigator(_, ref) {
  const navigate = useNavigate();
  useImperativeHandle(ref, () => ({ go: (p) => navigate(p) }), [navigate]);
  return null;
});

describe("<PageTransition> — Property 10: cycle and refresh discipline", () => {
  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    Date.now = realDateNow;
  });

  /**
   * Property 10 — Every completed transition fires exactly one
   * `ScrollTrigger.refresh()` within 1.0 s of the pathname change.
   *
   * Feature: e1-editorial-ui-overhaul, Property 10
   *
   * For any `paths` drawn from
   *   `fc.array(fc.constantFrom(..."/", "/book", ..., "/safety"),
   *            { minLength: 1, maxLength: 8 })`:
   *
   *   - Render `<PageTransition>` starting at `paths[0]`.
   *   - For `i = 1..paths.length - 1`, navigate to `paths[i]`. If
   *     `paths[i] === currentPath`, the navigation is a no-op (React
   *     Router does not emit a new location and `useGSAP` does not
   *     re-run); otherwise it counts as an effective transition.
   *   - After each navigation, advance GSAP's ticker by 70 × 16 ms =
   *     1120 ms of animated time (1.0 s of authored
   *     `enter + call + exit` timeline + ~120 ms of
   *     scheduling-granularity headroom). Each of the 70 ticks is
   *     wrapped in its own `act(...)` so React commits the
   *     `setDisplayLocation` state update (and its follow-on
   *     `useGSAP` re-run) between frames. If the authored sweep
   *     ever exceeds 1.0 s the `onComplete` refresh call will be
   *     missing, and the cumulative-count assertion below will
   *     fail.
   *   - After the full sequence, assert that `ScrollTrigger.refresh()`
   *     was called exactly `N` times where `N` is the number of
   *     effective transitions.
   *
   * Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 21.2
   */
  it("fires ScrollTrigger.refresh exactly N times across N completed transitions and each sweep resolves within 1.0s", () => {
    const refreshSpy = jest
      .spyOn(ScrollTrigger, "refresh")
      .mockImplementation(() => {});

    try {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...ROUTE_PATHS), {
            minLength: 1,
            maxLength: 8,
          }),
          (paths) => {
            refreshSpy.mockClear();

            const navRef = React.createRef();
            const { unmount } = render(
              <MemoryRouter initialEntries={[paths[0]]}>
                <PageTransition>
                  <Routes>
                    {ROUTE_PATHS.map((p) => (
                      <Route
                        key={p}
                        path={p}
                        element={<div data-testid={`page${p}`}>{p}</div>}
                      />
                    ))}
                  </Routes>
                </PageTransition>
                <Navigator ref={navRef} />
              </MemoryRouter>
            );

            let current = paths[0];
            let effective = 0;

            for (let i = 1; i < paths.length; i += 1) {
              const next = paths[i];
              if (next === current) continue;

              act(() => navRef.current.go(next));

              // 70 × 16 ms ≈ 1.12 s — 1.0 s authored budget plus a
              // handful of frames of scheduling-granularity
              // headroom. Each tick is wrapped in its own
              // `act(...)` so React commits the curtain's
              // `setDisplayLocation` state update (and its
              // follow-on `useGSAP` re-run that kicks the exit
              // sweep) between frames.
              for (let step = 0; step < 70; step += 1) {
                currentMs += 16;
                act(() => gsap.ticker.tick());
              }

              current = next;
              effective += 1;
            }

            // Exactly one `ScrollTrigger.refresh()` per effective
            // transition (Requirements 9.6, 21.2). Combined with the
            // per-transition ~1.12 s tick loop, this also witnesses
            // the ≤ 1.0 s sweep bound from Requirement 9.5.
            expect(refreshSpy).toHaveBeenCalledTimes(effective);

            unmount();
            // Explicit per-iteration cleanup — fast-check's
            // predicate is synchronous and `afterEach` only runs
            // between `it()` blocks, so without this the prior
            // iteration's DOM remains mounted in parallel with the
            // next render's router and contaminates the
            // ScrollTrigger state that Property 10 measures.
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    } finally {
      refreshSpy.mockRestore();
    }
  });
});
