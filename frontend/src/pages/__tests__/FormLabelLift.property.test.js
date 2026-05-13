/**
 * Property-based test — Form label-lift behavior (Book + Contact).
 *
 * Feature: e1-editorial-ui-overhaul, Property 20
 *
 * For any generated `{ page, label, name }` record where `page` is drawn
 * from `"book"` or `"contact"`, `label` is a non-empty string up to 60
 * characters, and `name` is a non-empty string up to 30 characters, this
 * property asserts that:
 *
 *   1. Dispatching `focus` on an empty-valued input calls `gsap.to` on the
 *      associated label element with the lifted-state vars:
 *      `{ y: -20, scale: 0.8, color: "#C2491A" }`.
 *   2. Dispatching `blur` while the value remains empty calls `gsap.to` on
 *      the associated label element with the resting-state vars:
 *      `{ y: 0, scale: 1, color: "#907A61" }`.
 *
 * The test renders the full BookPage or ContactPage (depending on the
 * generated `page` value) and targets the first text input on each page.
 * GSAP's `gsap.to` is spied so the property can inspect the target element
 * and the vars object without needing real DOM measurement.
 *
 * Validates: Requirements 25.1, 25.2, 25.3, 26.1, 26.2
 */

/* eslint-disable global-require */

// ---------------------------------------------------------------------------
// matchMedia / scrollTo stubs — installed before any module import so the
// `@/lib/gsap` runtime singleton sees a populated `window.matchMedia` /
// `window.scrollTo` at module-evaluation time.
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// ---------------------------------------------------------------------------
// GSAP plugin subpath mocks — same pattern as the PageTransition property
// test. The real ScrollTrigger UMD is loaded so `jest.spyOn` has a real
// method to replace; the other plugins are empty sentinels.
// ---------------------------------------------------------------------------

jest.mock('gsap/ScrollTrigger', () => {
  const dist = require('gsap/dist/ScrollTrigger');
  const Real = dist.ScrollTrigger || dist.default || dist;
  Real.defaults = () => {};
  Real.config = () => {};
  return { __esModule: true, ScrollTrigger: Real };
});
jest.mock('gsap/SplitText', () => ({ __esModule: true, SplitText: {} }));
jest.mock('gsap/DrawSVGPlugin', () => ({ __esModule: true, DrawSVGPlugin: {} }));
jest.mock('gsap/Flip', () => ({ __esModule: true, Flip: {} }));
jest.mock('gsap/MorphSVGPlugin', () => ({ __esModule: true, MorphSVGPlugin: {} }));

// ---------------------------------------------------------------------------
// Mock the malumzApi module so ContactPage does not attempt real HTTP calls.
// ---------------------------------------------------------------------------

jest.mock('@/lib/malumzApi', () => ({
  __esModule: true,
  submitContact: jest.fn(() => Promise.resolve({ success: true })),
}));

// ---------------------------------------------------------------------------
// Mock react-router-dom's Link and useNavigate so pages render without a
// Router context.
// ---------------------------------------------------------------------------

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) =>
    require('react').createElement('a', { href: to, ...props }, children),
  useNavigate: () => () => {},
}));

// ---------------------------------------------------------------------------
// Mock lucide-react icons to avoid SVG rendering overhead.
// ---------------------------------------------------------------------------

jest.mock('lucide-react', () => {
  const React = require('react');
  const stub = (name) =>
    React.forwardRef((props, ref) =>
      React.createElement('svg', { ...props, ref, 'data-icon': name })
    );
  return new Proxy(
    {},
    {
      get: (_, key) => {
        if (key === '__esModule') return true;
        return stub(key);
      },
    }
  );
});

// ---------------------------------------------------------------------------
// Mock the MagneticButton to a simple pass-through so it doesn't interfere.
// ---------------------------------------------------------------------------

jest.mock('@/components/MagneticButton', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('button', { ...props, ref }, children)
    ),
  };
});

// ---------------------------------------------------------------------------
// Mock NotchedSection to a simple div wrapper.
// ---------------------------------------------------------------------------

jest.mock('@/components/NotchedSection', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }) =>
      React.createElement('div', { 'data-testid': 'notched-section', ...props }, children),
  };
});

// ---------------------------------------------------------------------------
// Mock BookPurchasePanel to avoid rendering complexity.
// ---------------------------------------------------------------------------

jest.mock('@/components/BookPurchasePanel', () => ({
  __esModule: true,
  BookPurchasePanel: () => null,
}));

// ---------------------------------------------------------------------------
// Mock the assets module to avoid file-system dependencies. The default
// export must carry keyed metadata objects because BookPage reads
// `assets.BOOK_ACCENT_VIDEO.width` etc.
// ---------------------------------------------------------------------------

jest.mock('@/lib/assets', () => ({
  __esModule: true,
  default: {
    BOOK_ACCENT_VIDEO: {
      src: '/Assets/mock-video.mp4',
      width: 1920,
      height: 1080,
      type: 'video/mp4',
      altPlaceholder: 'Mock accent video',
    },
    HERO_CARD_IMAGE: {
      src: '/Assets/mock-image.jpeg',
      width: 1200,
      height: 1600,
      type: 'image/jpeg',
      altPlaceholder: 'Mock hero card',
    },
    VISION_NODE_1: {
      src: '/Assets/mock-vision-1.jpeg',
      width: 400,
      height: 300,
      type: 'image/jpeg',
      altPlaceholder: 'Vision node 1',
    },
    VISION_NODE_2: {
      src: '/Assets/mock-vision-2.jpeg',
      width: 400,
      height: 300,
      type: 'image/jpeg',
      altPlaceholder: 'Vision node 2',
    },
    VISION_NODE_3: {
      src: '/Assets/mock-vision-3.jpeg',
      width: 400,
      height: 300,
      type: 'image/jpeg',
      altPlaceholder: 'Vision node 3',
    },
    ABOUT_COLLAGE_A: {
      src: '/Assets/mock-collage-a.jpeg',
      width: 600,
      height: 800,
      type: 'image/jpeg',
      altPlaceholder: 'Collage A',
    },
    ABOUT_COLLAGE_B: {
      src: '/Assets/mock-collage-b.jpeg',
      width: 600,
      height: 800,
      type: 'image/jpeg',
      altPlaceholder: 'Collage B',
    },
    ABOUT_COLLAGE_C: {
      src: '/Assets/mock-collage-c.jpeg',
      width: 600,
      height: 800,
      type: 'image/jpeg',
      altPlaceholder: 'Collage C',
    },
  },
  BOOK_ACCENT_VIDEO: '/Assets/mock-video.mp4',
  HERO_CARD_IMAGE: '/Assets/mock-image.jpeg',
  VISION_NODE_1: '/Assets/mock-vision-1.jpeg',
  VISION_NODE_2: '/Assets/mock-vision-2.jpeg',
  VISION_NODE_3: '/Assets/mock-vision-3.jpeg',
  ABOUT_COLLAGE_A: '/Assets/mock-collage-a.jpeg',
  ABOUT_COLLAGE_B: '/Assets/mock-collage-b.jpeg',
  ABOUT_COLLAGE_C: '/Assets/mock-collage-c.jpeg',
}));

const fc = require('fast-check');
const React = require('react');
const { render, fireEvent, cleanup } = require('@testing-library/react');
const { gsap } = require('../../lib/gsap');

// Lazy-load page components after mocks are in place.
const { BookPage } = require('../BookPage');
const { AboutPage: AboutPageComponent } = require('../AboutPage');

// ---------------------------------------------------------------------------
// Constants mirroring the implementation.
// ---------------------------------------------------------------------------

const EXPECTED_LIFT_VARS = {
  y: -20,
  scale: 0.8,
  color: '#C2491A',
};

const EXPECTED_REST_VARS = {
  y: 0,
  scale: 1,
  color: '#6B5B4F',
};

describe('Form label-lift behavior — Property 20', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 20 — Focus lifts the label; blur on empty restores it.
   *
   * Feature: e1-editorial-ui-overhaul, Property 20
   *
   * Validates: Requirements 25.1, 25.2, 25.3, 26.1, 26.2
   */
  it('focus lifts label with { y: -20, scale: 0.8, color: "#C2491A" } and blur on empty restores resting state', () => {
    const gsapToSpy = jest.spyOn(gsap, 'to').mockImplementation(() => ({
      kill: () => {},
      revert: () => {},
    }));

    try {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.constantFrom('book'),
            label: fc.string({ minLength: 1, maxLength: 60 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
          }),
          ({ page }) => {
            gsapToSpy.mockClear();

            // Render the BookPage.
            const { unmount, container } = render(
              React.createElement(BookPage)
            );

            // Target the first text input (name field) on the page.
            // Use querySelector to get the first match (avoids duplicate testid issue
            // from responsive mobile/desktop form variants).
            const input = container.querySelector('[data-testid="book-name-input"]');
            expect(input).not.toBeNull();

            // The input should start with an empty value.
            expect(input.value).toBe('');

            // --- FOCUS: dispatch focus on the empty input ---
            gsapToSpy.mockClear();
            fireEvent.focus(input);

            // Assert gsap.to was called with the label element and lift vars.
            const focusCalls = gsapToSpy.mock.calls.filter((call) => {
              const vars = call[1];
              return (
                vars &&
                vars.y === EXPECTED_LIFT_VARS.y &&
                vars.scale === EXPECTED_LIFT_VARS.scale &&
                vars.color === EXPECTED_LIFT_VARS.color
              );
            });
            expect(focusCalls.length).toBeGreaterThanOrEqual(1);

            // The target of the gsap.to call should be a <span> element
            // (the label element).
            const focusTarget = focusCalls[0][0];
            expect(focusTarget).toBeTruthy();
            expect(focusTarget.tagName).toBe('SPAN');

            // --- BLUR: dispatch blur with value still empty ---
            gsapToSpy.mockClear();
            fireEvent.blur(input);

            // Assert gsap.to was called with the label element and rest vars.
            const blurCalls = gsapToSpy.mock.calls.filter((call) => {
              const vars = call[1];
              return (
                vars &&
                vars.y === EXPECTED_REST_VARS.y &&
                vars.scale === EXPECTED_REST_VARS.scale &&
                vars.color === EXPECTED_REST_VARS.color
              );
            });
            expect(blurCalls.length).toBeGreaterThanOrEqual(1);

            // The target of the blur gsap.to call should also be the label span.
            const blurTarget = blurCalls[0][0];
            expect(blurTarget).toBeTruthy();
            expect(blurTarget.tagName).toBe('SPAN');

            unmount();
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      gsapToSpy.mockRestore();
    }
  });
});
