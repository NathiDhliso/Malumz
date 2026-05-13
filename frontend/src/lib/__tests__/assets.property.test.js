/**
 * Feature: e1-editorial-ui-overhaul, Property 3: Assets module metadata
 * completeness and physical alignment.
 *
 * For any semantic key K in the default export of src/lib/assets.js, the
 * record assets[K] SHALL contain non-empty fields {src, width, height, type,
 * altPlaceholder}, src SHALL start with "/Assets/", src SHALL point to a
 * file that exists under frontend/public/Assets/, the value of type SHALL
 * match the physical file's MIME type, and for image types the physical
 * file's intrinsic width and height SHALL equal the recorded width and
 * height.
 *
 * Validates: Requirements 5.1-5.8
 */

const fs = require("fs");
const path = require("path");
const fc = require("fast-check");
const probe = require("probe-image-size");

const assetsDefault = require("../assets").default;

const ASSETS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "Assets"
);

/**
 * Resolve a record's `src` to an absolute path under frontend/public/.
 * `src` values are served at request-time from `/Assets/...`, so the
 * file on disk is at `public/Assets/<basename>`.
 */
function resolvePhysicalPath(src) {
  // decodeURIComponent is a no-op for these literal paths, but keep it
  // so the test matches what CRA ultimately requests.
  const decoded = decodeURIComponent(src);
  const basename = decoded.replace(/^\/Assets\//, "");
  return path.join(ASSETS_DIR, basename);
}

async function probeImage(absPath) {
  // probe-image-size expects a stream it can consume. createReadStream is
  // cheap and streaming-friendly for the large JPEGs in this project.
  return probe(fs.createReadStream(absPath));
}

describe("Property 3: Assets module metadata completeness and physical alignment", () => {
  // Cache successful probes across fc.asyncProperty runs so 100 iterations
  // do not re-read the same JPEG from disk 100 times.
  const probeCache = new Map();

  test("every record is well-formed, references a real file, and agrees with probe-image-size", async () => {
    const keys = Object.keys(assetsDefault);
    // Sanity floor: Requirement 5 expects twelve semantic constants.
    expect(keys.length).toBeGreaterThan(0);

    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...keys), async (key) => {
        const record = assetsDefault[key];

        // --- Metadata shape (Requirement 5.8) -----------------------------
        expect(record).toBeDefined();
        expect(typeof record).toBe("object");

        expect(typeof record.src).toBe("string");
        expect(record.src.length).toBeGreaterThan(0);

        expect(typeof record.type).toBe("string");
        expect(record.type.length).toBeGreaterThan(0);

        expect(typeof record.altPlaceholder).toBe("string");
        expect(record.altPlaceholder.length).toBeGreaterThan(0);

        expect(typeof record.width).toBe("number");
        expect(Number.isFinite(record.width)).toBe(true);
        expect(record.width).toBeGreaterThan(0);

        expect(typeof record.height).toBe("number");
        expect(Number.isFinite(record.height)).toBe(true);
        expect(record.height).toBeGreaterThan(0);

        // --- src shape (Requirement 5.1-5.7) ------------------------------
        expect(record.src.startsWith("/Assets/")).toBe(true);

        // --- Physical file existence (Requirement 5.1) --------------------
        const absPath = resolvePhysicalPath(record.src);
        expect(fs.existsSync(absPath)).toBe(true);

        // --- Intrinsic-dimension agreement for image types ----------------
        // probe-image-size understands JPEG / PNG / GIF / WebP / SVG but
        // not MP4, so videos are covered by the existence + metadata shape
        // checks above only.
        if (record.type.startsWith("image/")) {
          let probed = probeCache.get(absPath);
          if (!probed) {
            probed = await probeImage(absPath);
            probeCache.set(absPath, probed);
          }

          expect(probed.width).toBe(record.width);
          expect(probed.height).toBe(record.height);
          expect(probed.mime).toBe(record.type);
        }
      }),
      { numRuns: 100 }
    );
  }, 30000);
});
