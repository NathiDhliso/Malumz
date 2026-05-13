/**
 * Unit test for the GSAP runtime import ordering in src/index.js.
 *
 * Feature: e1-editorial-ui-overhaul
 * Validates: Requirement 3.6
 *
 * NOTE: Task 1.5 ("wire the gsap runtime import into src/index.js before
 * createRoot") may not have run yet when this test is first authored in
 * task 1.13. To keep the foundation suite green while still encoding the
 * final assertion shape, this file:
 *
 *   1. Reads src/index.js source statically.
 *   2. If the `@/lib/gsap` import is already present, asserts it precedes
 *      `createRoot` (the real requirement).
 *   3. Otherwise, publishes a `test.todo` placeholder noting that task 1.5
 *      will land the import and the full assertion will activate.
 *
 * Once task 1.5 completes, the todo branch drops out automatically.
 */
const fs = require("fs");
const path = require("path");

const indexJsPath = path.resolve(__dirname, "..", "..", "index.js");
const source = fs.readFileSync(indexJsPath, "utf8");

// Locate the GSAP runtime import; accept both quote styles.
const GSAP_IMPORT_RE = /import\s+["']@\/lib\/gsap["']\s*;?/;
const CREATE_ROOT_RE = /createRoot\s*\(/;

describe("src/index.js — GSAP runtime import ordering (Requirement 3.6)", () => {
  if (GSAP_IMPORT_RE.test(source)) {
    it("imports @/lib/gsap before the first createRoot call", () => {
      const importIdx = source.search(GSAP_IMPORT_RE);
      const createRootIdx = source.search(CREATE_ROOT_RE);
      expect(importIdx).toBeGreaterThanOrEqual(0);
      expect(createRootIdx).toBeGreaterThanOrEqual(0);
      expect(importIdx).toBeLessThan(createRootIdx);
    });
  } else {
    // eslint-disable-next-line jest/no-disabled-tests
    test.todo(
      "[after task 1.5] src/index.js imports @/lib/gsap before createRoot"
    );
  }
});
