/**
 * Property-based test — Reduced-motion opacity-only invariant.
 *
 * Feature: e1-editorial-ui-overhaul, Property 2
 *
 * For every entrance-animated component available in this phase
 * (`PageTransition`, `RevealRoot`, `Marquee`, `MagneticButton`,
 * `Cursor`) — extended in phase 4 to include Hero / Connector /
 * Spotlight / PullQuote — the test mounts the component with
 * `matchMedia("(prefers-reduced-motion: reduce)")` stubbed to `true`,
 * drives one entrance cycle, and asserts that every captured
 * `gsap.to` / `gsap.from` / `gsap.fromTo` invocation originating from
 * that component carries:
 *
 *   - a `vars` payload whose keys are a subset of
 *     `{ "opacity", "duration", "ease" }` (no `x`, `y`, `xPercent`,
 *     `yPercent`, `scale`, `scaleX`, `scaleY`, `rotation`, `rotationX`,
 *     `rotationY`, `skewX`, `skewY`, `translateX`, `translateY`, or
 *     `transform`);
 *
 *   - a `duration` of exactly `0.15` whenever `duration` is present.
 *
 * Strategy notes
 * --------------
 * The property is defined over *static* `gsap.to/from/fromTo` calls
 * (per the design document's wording). Timeline-scoped tweens
 * (`gsap.timeline(...).to(...)`) are not intercepted by these spies
 * and are therefore out of scope — which is the correct reading of
 * the property for `<PageTransition>` whose reduced-motion branch
 * runs an opacity crossfade through a timeline.
 *
 * `useRevealBatch` schedules its entrance via `ScrollTrigger.batch(...)`.
 * jsdom has no layout engine, so no real scroll update will ever fire
 * the batch's `onEnter` callback. The test therefore spies on
 * `ScrollTrigger.batch`, captures the `onEnter` option, and invokes
 * it manually once the component has mounted — exactly the same
 * pattern the Property 13 test uses for `useRevealBatch`. This also
 * lets us drive `gsap.matchMedia` deterministically: the stub routes
 * handlers through the reduced-motion query so only the reduce branch
 * of the hook fires.
 *
 * Components whose reduced-motion branch legitimately creates zero
 * tweens (Marquee, MagneticButton, Cursor) still participate — the
 * property holds vacuously for them, which is exactly the intent of
 * Requirements 4.1/4.2/13.1–13.3 (reduced motion ⇒ no transform
 * tweens).
 *
 * Validates: Requirements 4.1, 4.2, 9.7, 12.5, 13.1–13.3 reduced branch
 */
/* eslint-disable global-require */
import fc from "fast-check";
import React from "react";
import { act, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

// jsdom lacks `window.matchMedia`, and the runtime singleton's import-time
// side effects (ScrollTrigger.config / defaults, which in turn call
// `gsap.matchMedia()`) reach into `window.matchMedia` as they construct
// the shared registry. Install a permissive stub before the first
// require of `@/lib/gsap` so module evaluation succeeds. Each fast-check
// sample overwrites this stub with the reduced-motion implementation and
// restores it after the run.
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

// jsdom does not implement `window.scrollTo`. `PageTransition` calls it
// during its route-swap callback; without a stub, jsdom logs a
// "Not implemented" error that clutters the output. The assertions here
// do not depend on the scroll position, so a no-op suffices.
if (typeof window !== "undefined") {
  window.scrollTo = window.scrollTo || (() => {});
}

// GSAP plugin sub-paths ship ESM that Jest's default transform cannot
// parse. `gsap/dist/ScrollTrigger` is the CJS-compatible UMD twin; the
// remaining plugins only need a registration-time surface so bare
// objects satisfy `gsap.registerPlugin(...)`. `defaults` / `config` are
// patched to no-ops so the one-time import side effects do not
// accumulate across test runs.
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

// Deferred requires — ES module imports are hoisted above the matchMedia
// stub above. Routing the gsap runtime + component imports through
// `require(...)` preserves the initialization order so the stub is in
// place when `gsap.registerPlugin(...)` runs.
// eslint-disable-next-line import/first, import/newline-after-import
const { gsap, ScrollTrigger } = require("../../lib/gsap");
const Cursor = require("../Cursor").default;
const { PageTransition } = require("../PageTransition");
const { Marquee } = require("../Marquee");
const MagneticButton = require("../MagneticButton").default;
const { RevealRoot } = require("../RevealRoot");
const { CURSOR_KEY } = require("../../lib/useCursorPreference");

// ---------------------------------------------------------------------------
// Entrance-animated component set for this phase.
// ---------------------------------------------------------------------------

/**
 * Reusable entrance-animated components currently available in phase 2.
 * Phase 4 will extend this list to include `Hero`, `TrainerConnector`,
 * and `PullQuote`.
 */
const entranceAnimatedComponents = [
  "PageTransition",
  "RevealRoot",
  "Marquee",
  "MagneticButton",
  "Cursor",
];

// ---------------------------------------------------------------------------
// Permitted vars keys under reduced motion.
// ---------------------------------------------------------------------------

/**
 * Keys permitted inside the vars argument of every reduced-motion
 * `gsap.to/from/fromTo` call. `opacity` is the only animatable property;
 * `duration` carries the fixed 150 ms budget; `ease` is optional timing.
 */
const ALLOWED_KEYS = new Set(["opacity", "duration", "ease"]);

/**
 * Fixed duration (in seconds) required on every reduced-motion tween.
 * Per Property 2 / Requirements 12.5 and 13.1–13.3 (reduced branch).
 */
const REDUCED_DURATION = 0.15;

// ---------------------------------------------------------------------------
// matchMedia mock — forces `(prefers-reduced-motion: reduce)` true and
// every other capability / preference query false.
// ---------------------------------------------------------------------------

/**
 * Install a `window.matchMedia` stub whose `matches` is `true` only for
 * `(prefers-reduced-motion: reduce)` and `false` for every other query
 * (including `(prefers-reduced-motion: no-preference)`, `(pointer: fine)
 * and (hover: hover)`, and `(min-width: 1024px)`). Returns a restore
 * callback that reinstates the original implementation.
 *
 * @returns {() => void}
 */
function installReducedMotionMatchMedia() {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockImplementation((query) => {
    const matches = /prefers-reduced-motion:\s*reduce/.test(query);
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  });
  return () => {
    window.matchMedia = original;
  };
}

// ---------------------------------------------------------------------------
// gsap.matchMedia stub + ScrollTrigger.batch capture.
// ---------------------------------------------------------------------------

/**
 * Route `gsap.matchMedia().add(query, fn)` through `window.matchMedia`
 * so only the handler whose query matches the active (reduced-motion)
 * environment fires. Capture every `ScrollTrigger.batch` invocation made
 * from inside those handlers so the test can manually invoke the
 * `onEnter` callback (jsdom has no real scroll engine).
 *
 * @returns {{
 *   batchedOnEnters: Array<{ els: ArrayLike<Element>, onEnter: Function }>,
 *   restore: () => void,
 * }}
 */
function installGsapMatchMediaStub() {
  const batchedOnEnters = [];

  const matchMediaSpy = jest
    .spyOn(gsap, "matchMedia")
    .mockImplementation(() => ({
      add: (query, fn) => {
        if (
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia(query).matches
        ) {
          fn();
        }
      },
      revert: () => {},
      kill: () => {},
    }));

  const batchSpy = jest
    .spyOn(ScrollTrigger, "batch")
    .mockImplementation((els, opts) => {
      if (opts && typeof opts.onEnter === "function") {
        batchedOnEnters.push({ els, onEnter: opts.onEnter });
      }
      return [];
    });

  return {
    batchedOnEnters,
    restore: () => {
      matchMediaSpy.mockRestore();
      batchSpy.mockRestore();
    },
  };
}

// ---------------------------------------------------------------------------
// Mount harnesses per entrance-animated component.
// ---------------------------------------------------------------------------

/**
 * Triggers a single imperative navigation to `to` as soon as the
 * component mounts. Used by the `PageTransition` scenario to drive
 * exactly one pathname change, which is the entrance trigger for the
 * reduced-motion crossfade branch.
 */
function Navigator({ to }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to);
    // navigate is stable; the effect should only fire on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function mountScenario(name) {
  switch (name) {
    case "PageTransition": {
      return render(
        <MemoryRouter initialEntries={["/"]}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<div>home</div>} />
              <Route path="/next" element={<div>next</div>} />
            </Routes>
          </PageTransition>
          <Navigator to="/next" />
        </MemoryRouter>
      );
    }
    case "RevealRoot": {
      return render(
        <MemoryRouter initialEntries={["/"]}>
          <RevealRoot>
            <div className="gs-reveal">reveal one</div>
            <div className="gs-reveal">reveal two</div>
          </RevealRoot>
        </MemoryRouter>
      );
    }
    case "Marquee":
      // Marquee bails out of its useGSAP setup under reduced motion; the
      // static render still mounts so we can observe the zero-tween
      // invariant.
      return render(<Marquee phrases={["alpha", "beta", "gamma"]} />);
    case "MagneticButton":
      // Under reduced motion the gate fails and the component renders a
      // plain <button> with no pointer tracking.
      return render(<MagneticButton>Click</MagneticButton>);
    case "Cursor":
      // Reduced motion is one of the three AND-gate inputs; under
      // reduced motion the component renders null regardless of the
      // stored preference.
      window.localStorage.setItem(CURSOR_KEY, "on");
      return render(<Cursor />);
    default:
      throw new Error(`Unknown entrance-animated component: ${name}`);
  }
}

/**
 * Drive one entrance cycle for the mounted component. Advances the
 * macrotask queue so `useLayoutEffect` / `useEffect` based hooks (and
 * any queued `useGSAP` setups) have run, then manually invokes any
 * `ScrollTrigger.batch` `onEnter` callbacks captured during mount
 * (RevealRoot's reduced-motion reveal).
 */
async function driveEntrance(batchedOnEnters) {
  await act(async () => {
    // One macrotask tick — lets React commit effects and useGSAP scope
    // setup run to completion.
    await new Promise((resolve) => setTimeout(resolve, 16));
  });

  if (batchedOnEnters.length > 0) {
    await act(async () => {
      for (const { els, onEnter } of batchedOnEnters) {
        onEnter(Array.from(els || []));
      }
      await new Promise((resolve) => setTimeout(resolve, 16));
    });
  }
}

// ---------------------------------------------------------------------------
// Vars extraction — uniform view of vars arguments across
// `gsap.to(target, vars)`, `gsap.from(target, vars)`, and
// `gsap.fromTo(target, fromVars, toVars)`.
// ---------------------------------------------------------------------------

/**
 * Return the list of `vars` objects passed to a single captured call.
 * `gsap.fromTo` has two vars payloads (fromVars and toVars); both must
 * satisfy the reduced-motion invariant.
 *
 * @param {"to"|"from"|"fromTo"} method
 * @param {any[]} args
 * @returns {object[]}
 */
function extractVars(method, args) {
  if (method === "fromTo") {
    return [args[1], args[2]].filter((v) => v && typeof v === "object");
  }
  return [args[1]].filter((v) => v && typeof v === "object");
}

/**
 * Throw a descriptive error when any captured call violates the
 * reduced-motion invariant. Returning `true` from the property when
 * every call passes lets fast-check record success; throwing causes
 * fast-check to shrink to the minimal counterexample.
 */
function assertReducedMotionInvariant(name, capturedCalls) {
  for (const { method, args } of capturedCalls) {
    for (const vars of extractVars(method, args)) {
      for (const key of Object.keys(vars)) {
        if (!ALLOWED_KEYS.has(key)) {
          throw new Error(
            `[${name}] gsap.${method} vars contained disallowed key "${key}" ` +
              `under reduced motion. Permitted keys: ${Array.from(
                ALLOWED_KEYS
              ).join(", ")}. Full vars: ${JSON.stringify(vars)}.`
          );
        }
      }
      if (Object.prototype.hasOwnProperty.call(vars, "duration")) {
        if (vars.duration !== REDUCED_DURATION) {
          throw new Error(
            `[${name}] gsap.${method} duration was ${vars.duration} under ` +
              `reduced motion; expected ${REDUCED_DURATION}. Full vars: ${JSON.stringify(
                vars
              )}.`
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Property 2
// ---------------------------------------------------------------------------

describe("Reduced-motion opacity-only invariant — Property 2", () => {
  /**
   * Property 2 — every reduced-motion `gsap.to/from/fromTo` call is
   * opacity-only and carries `duration: 0.15`.
   *
   * Feature: e1-editorial-ui-overhaul, Property 2
   *
   * Generator: `fc.constantFrom(...entranceAnimatedComponents)`
   *
   * For each sampled component:
   *   1. Stub `window.matchMedia` so `(prefers-reduced-motion: reduce)`
   *      matches and every other query (`(pointer: fine) and
   *      (hover: hover)`, `(prefers-reduced-motion: no-preference)`,
   *      `(min-width: 1024px)`) does not.
   *   2. Stub `gsap.matchMedia` to route handlers through
   *      `window.matchMedia`, so only reduced-motion branches of
   *      `useRevealBatch` (and any future entrance-animated component)
   *      fire. Capture every `ScrollTrigger.batch` `onEnter` callback.
   *   3. Spy on `gsap.to`, `gsap.from`, and `gsap.fromTo`.
   *   4. Mount the component, advance one macrotask, then invoke every
   *      captured `onEnter` to release any scroll-gated reveals.
   *   5. Assert that every captured `vars` payload has keys in
   *      `{opacity, duration, ease}` only and, when `duration` is
   *      present, equals `0.15`.
   *   6. Unmount and restore the environment.
   *
   * Validates: Requirements 4.1, 4.2, 9.7, 12.5, 13.1–13.3 reduced branch
   */
  it("every gsap.to/from/fromTo call under reduced motion is opacity-only and carries duration 0.15", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...entranceAnimatedComponents),
        async (componentName) => {
          const restoreMatchMedia = installReducedMotionMatchMedia();
          const mmStub = installGsapMatchMediaStub();
          window.localStorage.clear();

          // Spy on every static tween entry point we want to police.
          // Return a minimal tween-like object so downstream callers
          // that inspect `.kill` / chaining still behave safely.
          const stubTween = () => ({ kill() {}, revert() {} });
          const toSpy = jest.spyOn(gsap, "to").mockImplementation(stubTween);
          const fromSpy = jest
            .spyOn(gsap, "from")
            .mockImplementation(stubTween);
          const fromToSpy = jest
            .spyOn(gsap, "fromTo")
            .mockImplementation(stubTween);

          let unmount;
          try {
            ({ unmount } = mountScenario(componentName));
            await driveEntrance(mmStub.batchedOnEnters);
          } finally {
            if (unmount) unmount();
            await act(async () => {
              await new Promise((resolve) => setTimeout(resolve, 16));
            });
          }

          const capturedCalls = [
            ...toSpy.mock.calls.map((args) => ({ method: "to", args })),
            ...fromSpy.mock.calls.map((args) => ({ method: "from", args })),
            ...fromToSpy.mock.calls.map((args) => ({
              method: "fromTo",
              args,
            })),
          ];

          try {
            assertReducedMotionInvariant(componentName, capturedCalls);
          } finally {
            toSpy.mockRestore();
            fromSpy.mockRestore();
            fromToSpy.mockRestore();
            mmStub.restore();
            restoreMatchMedia();
            window.localStorage.clear();
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
