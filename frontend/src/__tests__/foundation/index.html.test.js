/**
 * Unit tests for the E1 Google Fonts integration in public/index.html.
 *
 * Feature: e1-editorial-ui-overhaul
 * Validates: Requirements 2.4, 2.5, 2.6
 */
const fs = require("fs");
const path = require("path");

const indexHtmlPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "index.html"
);
const html = fs.readFileSync(indexHtmlPath, "utf8");

describe("public/index.html — Google Fonts foundation (Requirement 2.4–2.6)", () => {
  it("loads exactly one Google Fonts stylesheet <link> that requests both Fraunces and DM Sans", () => {
    const stylesheetLinks = html.match(
      /<link[^>]+rel=["']stylesheet["'][^>]*>/gi
    ) || [];
    const googleFontsLinks = stylesheetLinks.filter((link) =>
      /https:\/\/fonts\.googleapis\.com\/css/i.test(link)
    );

    expect(googleFontsLinks).toHaveLength(1);

    const gfLink = googleFontsLinks[0];
    expect(gfLink).toMatch(/family=Fraunces/);
    expect(gfLink).toMatch(/family=DM\+Sans/);
  });

  it("requests the Fraunces variable axis with weights 400, 500, 600, 700 (Requirement 2.5)", () => {
    const match = html.match(/family=Fraunces[^&"']*/i);
    expect(match).not.toBeNull();
    const frauncesDecl = match[0];
    // Weights must appear in the declaration.
    expect(frauncesDecl).toMatch(/400/);
    expect(frauncesDecl).toMatch(/500/);
    expect(frauncesDecl).toMatch(/600/);
    expect(frauncesDecl).toMatch(/700/);
  });

  it("requests DM Sans with weights 400, 500, 700 (Requirement 2.6)", () => {
    const match = html.match(/family=DM\+Sans[^&"']*/i);
    expect(match).not.toBeNull();
    const dmSansDecl = match[0];
    expect(dmSansDecl).toMatch(/400/);
    expect(dmSansDecl).toMatch(/500/);
    expect(dmSansDecl).toMatch(/700/);
  });

  it("preconnects to https://fonts.googleapis.com", () => {
    expect(html).toMatch(
      /<link[^>]+rel=["']preconnect["'][^>]+href=["']https:\/\/fonts\.googleapis\.com["'][^>]*>/i
    );
  });

  it("preconnects to https://fonts.gstatic.com with crossorigin (Requirement 2.4)", () => {
    // Accept either crossorigin alone or crossorigin="anonymous".
    expect(html).toMatch(
      /<link[^>]+rel=["']preconnect["'][^>]+href=["']https:\/\/fonts\.gstatic\.com["'][^>]*crossorigin[^>]*>/i
    );
  });
});
