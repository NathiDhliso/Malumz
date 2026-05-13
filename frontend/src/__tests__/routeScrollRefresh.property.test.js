/**
 * Property-based test — Route-change ScrollTrigger discipline.
 *
 * Feature: e1-editorial-ui-overhaul, Property 17
 *
 * For a generated sequence of pathnames drawn from the eleven-route
 * union of the app, starting at `paths[0]` and navigating in order to
 * each subsequent element, this property asserts:
 *
 *   1. `ScrollTrigger.refresh()` fires exactly `k` times after `k`
 *      effective transitions (Requirement 21.1). Consecutive-duplicate
 *      pathnames produce a stable `useLocation` reference and therefore
 *      do NOT re-run `useRouteScrollRefresh`'s `useEffect`; only
 *      non-duplicate navigations count as effective transitions and
 *      only those fire the safety-net refresh.
 *   2. After every navigation, no live ScrollTrigger's `trigger`
 *      element is detached from the document (Requirement 21.3).
 *      Each test route registers a real ScrollTrigger via `useGSAP`
 *      scoped to the route's element, so the scoped context revert
 *      on unmount is the mechanism under test — any failure to kill
 *      an owned trigger on route change would leave a dangling
 *      `st.trigger` node outside `document.body` and trip the
 *      orphan-detection assertion.
 *
 * ### Relationship to Property 10 (curtain refresh)
 *
 * Property 10 already witnesses Requirement 21.2 — the
 * `<PageTransition>` curtain fires exactly one refresh per completed
 * exit sweep. Property 17 focuses instead on the
 * `useRouteScrollRefresh()` safety-net that Task 6.1 installs at the
 * app-shell level, which is the refresh path Requirement 21.1
 * singles out ("exactly once after the new route has mounted and
 * painted"). Isolating the safety-net in this test prevents
 * double-counting the curtain's refresh and keeps the assertion
 * `refreshSpy.calls === effectiveTransitions` crisp. Requirement
 * 21.2 is listed in the task's Validates clause because 21.2 and
 * 21.1 are the two refresh paths the shell composes together; 21.2
 * is covered end-to-end by Property 10 and 21.1 by this property,
 * and Requirement 21.3 is exercised by both.
 *
 * ### Harness notes
 *
 * - `useRouteScrollRefresh()` defers its `ScrollTrigger.refresh()`
 *   call to `requestAnimationFrame`. To drive that refresh
 *   deterministically inside a synchronous fast-check predicate the
 *   harness installs a same-tick `requestAnimationFrame` stub on
 *   `window` BEFORE any module import, so the hook's
 *   `const raf = window.requestAnimationFrame` capture reads the
 *   stub on every effect run. Same-tick delivery is safe here: the
 *   hook's cleanup path only cancels a PENDING rAF id, which is a
 *   no-op once the callback has already fired (the common case
 *   under synchronous delivery). React 18's scheduler uses
 *   `MessageChannel` / `queueMicrotask`, not `rAF`, so replacing
 *   `window.requestAnimationFrame` does not interfere with React's
 *   own scheduling.
 * - Each route component registers one real `ScrollTrigger` via
 *   `useGSAP` scoped to the route's DOM ref. On unmount, `useGSAP`'s
 *   scoped context reverts and kills the owned trigger — that is the
 *   exact contract Requirement 21.3 asserts. The orphan-detection
 *   pass after every navigation is how the property witnesses it.
 * - `ScrollTrigger.refresh` is stubbed with a no-op spy so the test
 *   counts calls without performing real re-measurement (which is
 *   effectively a no-op in jsdom anyway), and leftover `ScrollTrigger`
 *   instances are killed between iterations so the global registry
 *   cannot contaminate neighbouring samples.
 * - `numRuns` is dialled to 30 rather than the default 100 because
 *   each iteration performs a full React render plus up to seven
 *   mount/unmount pairs (one per transition). 30 runs remain
 *   sufficient for fast-check's property-shrinking coverage of the
 *   generated eleven-route × eight-length input space.
 *
 * Validates: Requirements 21.1, 21.2, 21.3
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// Global DOM stubs — installed BEFORE any module import so the
// `@/lib/gsap` runtime singleton, `useRouteScrollRefresh`, and the
// rendered `<MemoryRouter>` all see populated globals at
// module-evaluation time. jsdom does not provide `matchMedia`,
// `scrollTo`, or a controllable `requestAnimationFrame` by default.
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

// Queued rAF stub. `useRouteScrollRefresh` reads
// `window.requestAnimationFrame` each time its effect runs and GSAP's
// own ticker reads it every frame to keep itself alive — if we flush
// callbacks synchronously the ticker re-schedules into infinity. The
// stub therefore PUSHES every callback into a module-scoped queue
// and leaves it to the test harness to drain exactly once per
// effective transition. That drain is how the hook's deferred
// `ScrollTrigger.refresh()` reaches the spy, and draining only once
// breaks GSAP's reentrant self-scheduling loop (any callback the
// ticker queues back in re-enters the queue but is simply not drained
// again this turn).
const __rafQueue = [];
if (typeof window !== "undefined") {
  window.requestAnimationFrame = (cb) => {
    __rafQueue.push(cb);
    return __rafQueue.length;
  };
  window.cancelAnimationFrame = () => {};
}
const flushRaf = () => {
  // Splice so any callbacks scheduled during the drain stay in the
  // queue until the next explicit flush (the GSAP ticker is the
  // primary offender here).
  const batch = __rafQueue.splice(0, __rafQueue.length);
  batch.forEach((cb) => {
    try {
      cb(0);
    } catch (_) {
      // Swallow — GSAP's ticker tolerates exceptions and the hook's
      // callback is a plain `ScrollTrigger.refresh()` spy in this
      // test.
    }
  });
};

// ---------------------------------------------------------------------------
// GSAP plugin subpath mocks — identical pattern to
// `PageTransition.property.test.js`. `ScrollTrigger` is proxied
// through its `gsap/dist/ScrollTrigger` UMD twin so `refresh`,
// `create`, `getAll`, and `kill` exist as real methods for
// `jest.spyOn` / `useGSAP` to interact with. The other four plugins
// are only touched by `gsap.registerPlugin(...)` inside the runtime
// singleton — empty sentinels suffice. `defaults` / `config` are
// patched to no-ops so the one-time import side effects do not
// accumulate across iterations.
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

const fc = require("fast-check");
const React = require("react");
const { useRef, forwardRef, useImperativeHandle } = React;
const { act, cleanup, render } = require("@testing-library/react");
const {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} = require("react-router-dom");
const { useGSAP } = require("@gsap/react");
const { ScrollTrigger } = require("../lib/gsap");
const { useRouteScrollRefresh } = require("../lib/useRouteScrollRefresh");

// ---------------------------------------------------------------------------
// Route universe — mirrors the generator specified in task 6.3.
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
// Imperative navigation handle — same pattern as Property 10. Exposes
// react-router-dom's `navigate` to the test via a ref so the property
// can drive route changes without re-rendering the host
// `<MemoryRouter>`.
// ---------------------------------------------------------------------------

const Navigator = forwardRef(function Navigator(_, ref) {
  const navigate = useNavigate();
  useImperativeHandle(ref, () => ({ go: (p) => navigate(p) }), [navigate]);
  return null;
});

// ---------------------------------------------------------------------------
// Test route component — each route owns one real ScrollTrigger
// scoped via `useGSAP`. On unmount, `useGSAP`'s scoped context
// reverts and kills the owned trigger (Requirement 21.3). Two
// consecutive renders of the same route produce the same outer div,
// but React Router mounts a fresh component instance per route
// change, which is exactly the lifecycle the orphan check exercises.
// ---------------------------------------------------------------------------

const RouteWithTrigger = ({ path }) => {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "+=100",
      });
    },
    { scope: ref }
  );
  return (
    <div ref={ref} data-testid={`page${path}`}>
      {path}
    </div>
  );
};

// Shell mounts `useRouteScrollRefresh` at the app-shell level — the
// exact installation Task 6.1 performs in `AppShell`. Every pathname
// change re-runs the effect, which schedules exactly one rAF-deferred
// `ScrollTrigger.refresh()`.
const Shell = () => {
  useRouteScrollRefresh();
  return (
    <Routes>
      {ROUTE_PATHS.map((p) => (
        <Route key={p} path={p} element={<RouteWithTrigger path={p} />} />
      ))}
    </Routes>
  );
};

describe("Route-change ScrollTrigger discipline — Property 17", () => {
  afterEach(() => {
    cleanup();
    // Defence-in-depth: kill any ScrollTrigger that survived React
    // unmount so the global registry is clean for the next test.
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  /**
   * Property 17 — `useRouteScrollRefresh` fires exactly one refresh
   * per effective transition and no orphan ScrollTriggers leak
   * across route boundaries.
   *
   * Feature: e1-editorial-ui-overhaul, Property 17
   *
   * For any `paths` drawn from
   *   `fc.array(fc.constantFrom("/", "/book", ..., "/safety"),
   *            { minLength: 1, maxLength: 8 })`:
   *
   *   - Render the shell starting at `paths[0]`. The initial mount
   *     fires one refresh via `useRouteScrollRefresh`'s effect; the
   *     spy is cleared immediately afterwards so the per-iteration
   *     count reflects transitions only.
   *   - For `i = 1..paths.length - 1`, navigate to `paths[i]`. If
   *     `paths[i] === currentPath`, the navigation is a no-op
   *     (React Router does not emit a new `useLocation` reference
   *     and the hook's `useEffect` does not re-run); otherwise the
   *     navigation counts as an effective transition.
   *   - After every effective transition, assert
   *     `ScrollTrigger.getAll()` contains no trigger whose element
   *     has been detached from the document. The `useGSAP` scoped
   *     context revert that fires on the outgoing route's unmount
   *     is the mechanism that upholds this invariant.
   *   - After the full sequence, assert `ScrollTrigger.refresh()`
   *     was called exactly `k` times where `k` is the number of
   *     effective transitions.
   *
   * Validates: Requirements 21.1, 21.2, 21.3
   */
  it("fires ScrollTrigger.refresh exactly once per effective transition and leaves no orphan triggers", () => {
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
            // Pre-iteration hygiene — clear any triggers or spy
            // calls left behind by a neighbouring sample.
            ScrollTrigger.getAll().forEach((st) => st.kill());
            refreshSpy.mockClear();

            const navRef = React.createRef();
            const { unmount } = render(
              <MemoryRouter initialEntries={[paths[0]]}>
                <Shell />
                <Navigator ref={navRef} />
              </MemoryRouter>
            );

            // Drain the rAF queue that the initial mount populated
            // (both `useRouteScrollRefresh` and GSAP's ticker push
            // on mount). Then reset the spy so the count from here
            // on reflects pathname transitions only — Requirement
            // 21.1 speaks to route changes, not to app-shell first
            // mount.
            act(() => {
              flushRaf();
            });
            refreshSpy.mockClear();

            let current = paths[0];
            let effective = 0;

            for (let i = 1; i < paths.length; i += 1) {
              const next = paths[i];
              if (next === current) continue;

              act(() => {
                navRef.current.go(next);
              });

              // Drain the rAF queue so the hook's deferred
              // `ScrollTrigger.refresh()` reaches the spy before
              // the next assertion.
              act(() => {
                flushRaf();
              });

              current = next;
              effective += 1;

              // Requirement 21.3 — after the new route has mounted,
              // no live ScrollTrigger's `trigger` element may be
              // detached from the document. `useGSAP`'s scoped
              // context revert kills the outgoing route's trigger
              // as part of React's unmount commit, which precedes
              // the incoming route's mount commit.
              const orphans = ScrollTrigger.getAll().filter(
                (st) =>
                  st.trigger &&
                  !(document.body && document.body.contains(st.trigger))
              );
              expect(orphans).toEqual([]);
            }

            // Requirement 21.1 — exactly one
            // `ScrollTrigger.refresh()` per effective transition,
            // deferred by one `requestAnimationFrame` so the new
            // route has committed to the DOM before ScrollTrigger
            // re-measures.
            expect(refreshSpy).toHaveBeenCalledTimes(effective);

            unmount();
            // Explicit per-iteration teardown — fast-check's
            // predicate is synchronous and `afterEach` only runs
            // between `it()` blocks, so without this the prior
            // iteration's DOM would remain mounted in parallel with
            // the next render's router and contaminate
            // `ScrollTrigger.getAll()`.
            cleanup();
            ScrollTrigger.getAll().forEach((st) => st.kill());
          }
        ),
        { numRuns: 30 }
      );
    } finally {
      refreshSpy.mockRestore();
    }
  });
});
