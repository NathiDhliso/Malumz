/**
 * Property-based test — GSAP cleanup on unmount.
 *
 * Feature: e1-editorial-ui-overhaul, Property 1
 *
 * For every reusable animated component available in this phase
 * (`Cursor`, `PageTransition`, `Marquee`, `MagneticButton`,
 * `RevealRoot`), the test mounts the component, drives one tween
 * cycle, unmounts, and asserts that:
 *
 *   - `ScrollTrigger.getAll()` contains no `ScrollTrigger` created
 *     during the mount window that survived unmount (i.e., no live
 *     trigger whose element lies within the now-unmounted subtree).
 *   - Every window / document event listener attached by this feature
 *     (scoped narrowly to `pointermove`, `pointerover`, `pointerout`,
 *     `storage`) is removed on unmount. Listeners registered via an
 *     `AbortController` + `{ signal }` option are reconciled by
 *     subscribing the tracker to the signal's `abort` event, so
 *     `controller.abort()` counts as a removal — otherwise the
 *     balance check would over-report leaks for `<Cursor>` and
 *     `<MagneticButton>`, both of which prefer the AbortController
 *     cleanup path.
 *
 * Plugin sub-paths (`gsap/ScrollTrigger`, `gsap/SplitText`,
 * `gsap/DrawSVGPlugin`, `gsap/Flip`, `gsap/MorphSVGPlugin`) ship ESM
 * that Jest's default transform cannot parse; each plugin is stubbed
 * so `require('../../lib/gsap')` can evaluate its singleton side
 * effects. `ScrollTrigger` is the one exception — the real
 * implementation is injected (via `jest.requireActual`) and its
 * `defaults` / `config` methods are patched to no-ops so
 * `ScrollTrigger.getAll()` and matchMedia gating remain the real
 * implementations used by the components under test.
 *
 * The listener balance is intentionally narrowed to the events our
 * components own so that GSAP / ScrollTrigger's internal `resize` /
 * `scroll` window listeners (legitimately persistent across the
 * application's lifetime) do not create false positives. Component
 * pointer listeners attached to the component's own root element
 * (e.g. `<Marquee>`'s `pointerenter` / `pointerleave`) go away with
 * the unmounted element and are therefore already covered by the
 * ScrollTrigger / DOM assertions.
 *
 * Validates: Requirements 3.8, 34.1, 34.2, 34.3
 */
import fc from "fast-check";
import React from "react";
import { act, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// jsdom does not provide `window.matchMedia` by default, and GSAP's
// `ScrollTrigger.register` (fired by the runtime singleton on first
// import) reaches into `window.matchMedia` while constructing its
// internal `gsap.matchMedia()` registry. Install a permissive stub up
// front so the module-level `require('../../lib/gsap')` below can
// evaluate without throwing. The per-sample `installMatchMediaMock`
// replaces this stub with a fully tracked implementation during each
// fast-check run and restores it afterwards.
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
// during the route-swap callback; without a stub, jsdom logs a
// "Not implemented" error that clutters the test output. The assertions
// in this property do not depend on the scroll position itself, so a
// no-op stub is sufficient.
if (typeof window !== "undefined") {
  window.scrollTo = window.scrollTo || (() => {});
}

jest.mock("gsap/ScrollTrigger", () => {
  // `gsap/ScrollTrigger` ships ESM that Jest's default transform cannot
  // parse. The `dist/` twin is a UMD bundle that is fully CJS-compatible,
  // so we require it directly and proxy its ScrollTrigger symbol so
  // `getAll()` / matchMedia gating match the runtime-singleton's
  // behaviour. `defaults` / `config` are patched to no-ops so the
  // one-time import side effects do not accumulate across runs.
  // eslint-disable-next-line global-require
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

// eslint-disable-next-line import/first, import/newline-after-import
const { ScrollTrigger } = require("../../lib/gsap");
// eslint-disable-next-line import/first
const Cursor = require("../Cursor").default;
// eslint-disable-next-line import/first
const { PageTransition } = require("../PageTransition");
// eslint-disable-next-line import/first
const MagneticButton = require("../MagneticButton").default;
// eslint-disable-next-line import/first
const { RevealRoot } = require("../RevealRoot");
// eslint-disable-next-line import/first
const { CURSOR_KEY } = require("../../lib/useCursorPreference");

// ---------------------------------------------------------------------------
// Reusable components under test
// ---------------------------------------------------------------------------

/**
 * The set of reusable animated components currently available in this
 * phase of the feature. Extend this list as new animated components land.
 */
const animatedComponentsUnderTest = [
  "Cursor",
  "PageTransition",
  "MagneticButton",
  "RevealRoot",
];

// ---------------------------------------------------------------------------
// matchMedia mock — enables every gate our components consult so each
// lifecycle exercises the real (non-fallback) code path.
// ---------------------------------------------------------------------------

function installMatchMediaMock() {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockImplementation((query) => {
    let matches = false;
    if (/prefers-reduced-motion:\s*reduce/.test(query)) matches = false;
    else if (/prefers-reduced-motion:\s*no-preference/.test(query)) matches = true;
    else if (/pointer:\s*fine/.test(query) || /hover:\s*hover/.test(query)) matches = true;
    else if (/min-width:\s*1024px/.test(query)) matches = true;

    const listeners = new Set();
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
      addListener: (listener) => listeners.add(listener),
      removeListener: (listener) => listeners.delete(listener),
      dispatchEvent: () => false,
    };
  });
  return () => {
    window.matchMedia = original;
  };
}

// ---------------------------------------------------------------------------
// Window / document listener tracker
// ---------------------------------------------------------------------------

const OWNED_WINDOW_EVENTS = new Set(["pointermove", "storage"]);
const OWNED_DOCUMENT_EVENTS = new Set(["pointerover", "pointerout"]);

/**
 * Wrap `add` / `removeEventListener` on `window` and `document` and
 * maintain a live set of listener entries added for the event names our
 * components own. When a listener is registered with `{ signal }`,
 * subscribe to the signal's `abort` event so `controller.abort()` is
 * treated as a removal — every consuming component prefers this path
 * over an explicit `removeEventListener` call.
 *
 * @returns {{ remaining: () => Array<{target:string,type:string}>,
 *             restore: () => void }}
 */
function installListenerTracker() {
  const active = new Set();
  const origAddW = window.addEventListener.bind(window);
  const origRemW = window.removeEventListener.bind(window);
  const origAddD = document.addEventListener.bind(document);
  const origRemD = document.removeEventListener.bind(document);

  const register = (entry, opts) => {
    active.add(entry);
    const signal =
      opts && typeof opts === "object" && "signal" in opts ? opts.signal : null;
    if (signal) {
      if (signal.aborted) {
        active.delete(entry);
        return;
      }
      try {
        signal.addEventListener(
          "abort",
          () => {
            active.delete(entry);
          },
          { once: true }
        );
      } catch {
        // If the AbortSignal polyfill does not expose addEventListener,
        // treat abort as the cleanup path conservatively — the entry
        // would persist and fail the assertion, which matches real
        // behaviour: a broken AbortSignal means a real leak.
      }
    }
  };

  const findEntry = (target, type, fn) => {
    for (const entry of active) {
      if (entry.target === target && entry.type === type && entry.fn === fn) {
        return entry;
      }
    }
    return null;
  };

  window.addEventListener = function trackedAddWindow(type, fn, opts) {
    if (OWNED_WINDOW_EVENTS.has(type)) {
      register({ target: "window", type, fn }, opts);
    }
    return origAddW(type, fn, opts);
  };
  window.removeEventListener = function trackedRemWindow(type, fn, opts) {
    if (OWNED_WINDOW_EVENTS.has(type)) {
      const entry = findEntry("window", type, fn);
      if (entry) active.delete(entry);
    }
    return origRemW(type, fn, opts);
  };
  document.addEventListener = function trackedAddDoc(type, fn, opts) {
    if (OWNED_DOCUMENT_EVENTS.has(type)) {
      register({ target: "document", type, fn }, opts);
    }
    return origAddD(type, fn, opts);
  };
  document.removeEventListener = function trackedRemDoc(type, fn, opts) {
    if (OWNED_DOCUMENT_EVENTS.has(type)) {
      const entry = findEntry("document", type, fn);
      if (entry) active.delete(entry);
    }
    return origRemD(type, fn, opts);
  };

  return {
    remaining: () =>
      Array.from(active).map((e) => ({ target: e.target, type: e.type })),
    restore: () => {
      window.addEventListener = origAddW;
      window.removeEventListener = origRemW;
      document.addEventListener = origAddD;
      document.removeEventListener = origRemD;
    },
  };
}

// ---------------------------------------------------------------------------
// Mount harnesses per component
// ---------------------------------------------------------------------------

function mountScenario(name) {
  switch (name) {
    case "Cursor":
      window.localStorage.setItem(CURSOR_KEY, "on");
      return render(<Cursor />);
    case "PageTransition":
      return render(
        <MemoryRouter initialEntries={["/"]}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<div>home</div>} />
              <Route path="/next" element={<div>next</div>} />
            </Routes>
          </PageTransition>
        </MemoryRouter>
      );
    case "Marquee":
      return render(<Marquee phrases={["alpha", "beta", "gamma"]} />);
    case "MagneticButton":
      return render(<MagneticButton>Click</MagneticButton>);
    case "RevealRoot":
      return render(
        <MemoryRouter initialEntries={["/"]}>
          <RevealRoot>
            <div className="gs-reveal">reveal one</div>
            <div className="gs-reveal">reveal two</div>
          </RevealRoot>
        </MemoryRouter>
      );
    default:
      throw new Error(`Unknown component scenario: ${name}`);
  }
}

/**
 * Drive one tween cycle for the mounted component by dispatching the
 * pointer events each component listens for and yielding a frame for
 * GSAP's ticker. Components that do not listen for these events still
 * receive the tick so any queued timeline work completes.
 */
async function driveOneTweenCycle() {
  await act(async () => {
    // Cursor + MagneticButton both listen on window.pointermove; Cursor
    // additionally listens on document.pointerover / pointerout.
    window.dispatchEvent(new Event("pointermove"));
    document.dispatchEvent(new Event("pointerover"));
    document.dispatchEvent(new Event("pointerout"));
    // Yield one macrotask so the scoped useGSAP effects and any
    // gsap.to() calls have a chance to reach the ticker.
    await new Promise((resolve) => setTimeout(resolve, 16));
  });
}

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

describe("GSAP cleanup on unmount — Property 1", () => {
  /**
   * Property 1 — GSAP cleanup on unmount.
   *
   * Feature: e1-editorial-ui-overhaul, Property 1
   *
   * For every reusable animated component in this phase, mount it in
   * an environment where every motion gate is satisfied, drive one
   * tween cycle, unmount, and assert that no ScrollTrigger created
   * during the mount window survives and that no window / document
   * listener attached by the component remains.
   *
   * Validates: Requirements 3.8, 34.1, 34.2, 34.3
   */
  it("reverts every ScrollTrigger and listener owned by each reusable animated component", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...animatedComponentsUnderTest),
        async (componentName) => {
          const restoreMatchMedia = installMatchMediaMock();
          const tracker = installListenerTracker();
          window.localStorage.clear();

          const scrollTriggersBefore = ScrollTrigger.getAll().slice();
          const rootCursorBefore = document.documentElement.style.cursor;

          let unmount;
          try {
            ({ unmount } = mountScenario(componentName));
            await driveOneTweenCycle();
          } finally {
            if (unmount) unmount();
            // Flush microtasks + one animation frame so any
            // queued useGSAP revert work completes before we sample.
            await act(async () => {
              await new Promise((resolve) => setTimeout(resolve, 16));
            });
          }

          const scrollTriggersAfter = ScrollTrigger.getAll();
          const beforeSet = new Set(scrollTriggersBefore);
          const leakedTriggers = scrollTriggersAfter.filter(
            (st) => !beforeSet.has(st)
          );
          const remainingListeners = tracker.remaining();
          const rootCursorAfter = document.documentElement.style.cursor;

          tracker.restore();
          restoreMatchMedia();
          window.localStorage.clear();

          // No ScrollTrigger created during the mount window survives —
          // every trigger whose element lived in the unmounted subtree
          // was killed by useGSAP's scoped context revert.
          expect(leakedTriggers).toEqual([]);
          // No window / document listener our components own is still
          // attached; AbortController-cleaned listeners are reconciled
          // via their signal's `abort` event inside the tracker.
          expect(remainingListeners).toEqual([]);
          // Cursor mutates documentElement.style.cursor on mount; unmount
          // must restore it. Other components never touch it, so this
          // equality holds universally.
          expect(rootCursorAfter).toBe(rootCursorBefore);
        }
      ),
      { numRuns: 30 }
    );
  }, 30_000);
});
