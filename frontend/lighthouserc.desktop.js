/**
 * Lighthouse CI — Desktop preset configuration.
 * Enforces performance ≥ 85 (Requirement 31.1), LCP ≤ 2.8s, CLS ≤ 0.05, INP ≤ 200ms.
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
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
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
