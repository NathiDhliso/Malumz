/**
 * Lighthouse CI — Mobile (default) preset configuration.
 * Enforces performance ≥ 75 (Requirement 31.2), LCP ≤ 2.8s (31.3), CLS ≤ 0.05 (31.4), INP ≤ 200ms (31.5).
 *
 * Lighthouse's default emulation is mobile (Moto G Power on Fast 3G).
 * The desktop preset is in lighthouserc.desktop.js.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx serve -s build -l 5000',
      startServerReadyPattern: 'Accepting connections',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:5000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'experimental-interaction-to-next-paint': [
          'error',
          { maxNumericValue: 200 },
        ],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
