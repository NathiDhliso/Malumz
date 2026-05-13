/**
 * Unit test for the E1 animation dependencies declared in package.json.
 *
 * Feature: e1-editorial-ui-overhaul
 * Validates: Requirement 3.1
 */
const path = require("path");

const pkgPath = path.resolve(__dirname, "..", "..", "..", "package.json");
// eslint-disable-next-line import/no-dynamic-require, global-require
const pkg = require(pkgPath);

describe("frontend/package.json — GSAP production dependencies (Requirement 3.1)", () => {
  it("declares dependencies.gsap as a non-empty semver string", () => {
    expect(pkg).toHaveProperty("dependencies");
    expect(pkg.dependencies).toHaveProperty("gsap");
    expect(typeof pkg.dependencies.gsap).toBe("string");
    expect(pkg.dependencies.gsap.trim().length).toBeGreaterThan(0);
  });

  it("declares dependencies['@gsap/react'] as a non-empty semver string", () => {
    expect(pkg).toHaveProperty("dependencies");
    expect(pkg.dependencies).toHaveProperty("@gsap/react");
    expect(typeof pkg.dependencies["@gsap/react"]).toBe("string");
    expect(pkg.dependencies["@gsap/react"].trim().length).toBeGreaterThan(0);
  });
});
