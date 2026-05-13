/**
 * Structural Preservation Diff Snapshots
 *
 * These tests assert that the E1 Editorial UI Overhaul is strictly
 * presentational: routing, page filenames, backend, analytics, and i18n
 * remain untouched.
 *
 * Feature: e1-editorial-ui-overhaul
 * Requirements: 30.1, 30.2, 30.4, 30.5, 30.6
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "..");
const PAGES_DIR = path.resolve(SRC_DIR, "pages");
const APP_FILE = path.resolve(SRC_DIR, "App.js");
const BACKEND_DIR = path.resolve(SRC_DIR, "..", "..", "backend");

/**
 * Frozen snapshot of all route paths declared in App.js.
 * Validates: Requirement 30.1
 *
 * Updated after page-consolidation-and-animations spec:
 * - /crisis, /systems, /vision, /contact are now redirect routes (Navigate)
 * - /systems (exact) removed as standalone page route
 */
const FROZEN_ROUTE_PATHS = [
  "/",
  "/book",
  "/join",
  "/safety",
  "/resources",
  "/systems/:slug",
  "/about",
  "/results",
  "/vision",
  "/contact",
  "/crisis",
  "/systems",
];

/**
 * Frozen snapshot of page component filenames under src/pages/.
 * Validates: Requirement 30.2
 *
 * Updated after page-consolidation-and-animations spec:
 * - ContactPage.js, CrisisPage.js, SystemsPage.js, VisionPage.js removed
 *   (merged into AboutPage, SafetyPage, ResourcesPage respectively)
 */
const FROZEN_PAGE_FILES = [
  "AboutPage.js",
  "BookPage.js",
  "HomePage.js",
  "JoinPage.js",
  "ResourcesPage.js",
  "ResultsPage.js",
  "SafetyPage.js",
  "SystemDetailPage.js",
];

/**
 * Frozen snapshot of backend source files (excluding __pycache__).
 * Validates: Requirement 30.4
 */
const FROZEN_BACKEND_FILES = [
  ".env",
  ".env.example",
  "requirements.txt",
  "server.py",
];

describe("Structural Preservation (Requirement 30)", () => {
  describe("30.1 — Route paths in App.js match frozen snapshot", () => {
    it("should contain exactly the pre-overhaul route paths", () => {
      const appSource = fs.readFileSync(APP_FILE, "utf-8");

      // Extract all <Route path="..." /> declarations via regex
      const routePathRegex = /<Route\s+path=["']([^"']+)["']/g;
      const extractedPaths = [];
      let match;
      while ((match = routePathRegex.exec(appSource)) !== null) {
        extractedPaths.push(match[1]);
      }

      expect(extractedPaths.sort()).toEqual([...FROZEN_ROUTE_PATHS].sort());
    });
  });

  describe("30.2 — Page filenames under src/pages/ match frozen snapshot", () => {
    it("should contain exactly the pre-overhaul page files", () => {
      const entries = fs.readdirSync(PAGES_DIR);

      // Filter to only .js files (exclude directories like __tests__)
      const pageFiles = entries
        .filter((entry) => {
          const fullPath = path.join(PAGES_DIR, entry);
          return (
            fs.statSync(fullPath).isFile() && entry.endsWith(".js")
          );
        })
        .sort();

      expect(pageFiles).toEqual([...FROZEN_PAGE_FILES].sort());
    });
  });

  describe("30.4 — Backend directory is not modified by this feature", () => {
    it("should contain exactly the pre-overhaul backend files", () => {
      const entries = fs.readdirSync(BACKEND_DIR);

      // Filter out __pycache__ and hidden cache directories
      const backendFiles = entries
        .filter((entry) => {
          if (entry === "__pycache__") return false;
          const fullPath = path.join(BACKEND_DIR, entry);
          return fs.statSync(fullPath).isFile();
        })
        .sort();

      expect(backendFiles).toEqual([...FROZEN_BACKEND_FILES].sort());
    });
  });

  describe("30.5 — No analytics instrumentation added", () => {
    it("should not contain analytics patterns in frontend/src/", () => {
      const analyticsPatterns = [
        /\bgtag\b/,
        /\bgoogle[-_]?analytics\b/i,
        /\bGA_TRACKING_ID\b/,
        /\bGA_MEASUREMENT_ID\b/,
        /\bsegment\b.*\banalytics\b/i,
        /\bmixpanel\b/i,
        /\bhotjar\b/i,
        /\bplausible\b/i,
        /\bfathom\b/i,
        /\bposthog\b/i,
        /\bheap\b.*\banalytics\b/i,
        /\bamplitude\b/i,
        /\bfullstory\b/i,
        /\bdataLayer\b/,
        /\bTagManager\b/,
      ];

      const violations = [];
      scanDirectory(SRC_DIR, (filePath, content) => {
        // Skip test files and node_modules
        if (filePath.includes("__tests__")) return;
        if (filePath.includes("node_modules")) return;

        for (const pattern of analyticsPatterns) {
          if (pattern.test(content)) {
            violations.push(
              `${path.relative(SRC_DIR, filePath)} matches ${pattern}`
            );
          }
        }
      });

      expect(violations).toEqual([]);
    });
  });

  describe("30.6 — No i18n machinery added", () => {
    it("should not contain i18n patterns in frontend/src/", () => {
      const i18nPatterns = [
        /\bi18next\b/i,
        /\breact-intl\b/i,
        /\breact-i18next\b/i,
        /\bformatMessage\b/,
        /\buseTranslation\b/,
        /\buseIntl\b/,
        /\bIntlProvider\b/,
        /\bFormattedMessage\b/,
        /\bi18n\.t\b/,
        /\bt\(['"][^'"]+['"]\)/,
        /\bdefineMessages\b/,
        /\blinguiJs\b/i,
        /\b@lingui\b/,
      ];

      const violations = [];
      scanDirectory(SRC_DIR, (filePath, content) => {
        // Skip test files and node_modules
        if (filePath.includes("__tests__")) return;
        if (filePath.includes("node_modules")) return;

        for (const pattern of i18nPatterns) {
          if (pattern.test(content)) {
            violations.push(
              `${path.relative(SRC_DIR, filePath)} matches ${pattern}`
            );
          }
        }
      });

      expect(violations).toEqual([]);
    });
  });
});

/**
 * Recursively scan a directory and invoke callback with (filePath, content)
 * for every .js/.jsx file found.
 */
function scanDirectory(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and build artifacts
      if (entry.name === "node_modules" || entry.name === "build") continue;
      scanDirectory(fullPath, callback);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".js") || entry.name.endsWith(".jsx"))
    ) {
      const content = fs.readFileSync(fullPath, "utf-8");
      callback(fullPath, content);
    }
  }
}
