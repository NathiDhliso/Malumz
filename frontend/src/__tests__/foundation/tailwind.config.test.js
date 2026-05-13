/**
 * Unit tests for the E1 Tailwind token foundation.
 *
 * Feature: e1-editorial-ui-overhaul
 * Validates: Requirements 1.1–1.8, 2.1, 2.2
 */
const path = require("path");

const configPath = path.resolve(__dirname, "..", "..", "..", "tailwind.config.js");
// eslint-disable-next-line import/no-dynamic-require, global-require
const tailwindConfig = require(configPath);

const EXPECTED_E1_COLORS = {
  "e1-bg": "#FFFFFF",
  "e1-primary": "#C2491A",
  "e1-secondary": "#C8891E",
  "e1-highlight": "#E4BE6A",
  "e1-text": "#1A1A1A",
  "e1-text-muted": "#6B5B4F",
  "e1-surface": "#FFF8F0",
};

describe("tailwind.config.js — E1 palette tokens (Requirement 1)", () => {
  const colors = tailwindConfig.theme.extend.colors;

  Object.entries(EXPECTED_E1_COLORS).forEach(([token, hex]) => {
    it(`defines ${token} as ${hex}`, () => {
      expect(colors).toHaveProperty(token);
      expect(colors[token]).toBe(hex);
    });
  });

  it("does not define any legacy malumz-* color tokens (Requirement 1.8)", () => {
    const malumzKeys = Object.keys(colors).filter((k) => /malumz/i.test(k));
    expect(malumzKeys).toEqual([]);
  });
});

describe("tailwind.config.js — E1 typography families (Requirement 2)", () => {
  const fontFamily = tailwindConfig.theme.extend.fontFamily;

  it("registers Fraunces as the font-display family with a serif fallback", () => {
    expect(fontFamily).toHaveProperty("display");
    expect(Array.isArray(fontFamily.display)).toBe(true);
    // The config may quote the family name for CSS-embedded spaces; normalize
    // surrounding single/double quotes before comparing.
    const head = String(fontFamily.display[0]).replace(/^["']|["']$/g, "");
    expect(head).toBe("Fraunces");
    expect(fontFamily.display).toContain("serif");
  });

  it('registers "DM Sans" as the font-sans family with a sans-serif fallback', () => {
    expect(fontFamily).toHaveProperty("sans");
    expect(Array.isArray(fontFamily.sans)).toBe(true);
    // The config quotes "DM Sans" because the name contains a space. Strip
    // outer quotes before comparing to the canonical family name.
    const head = String(fontFamily.sans[0]).replace(/^["']|["']$/g, "");
    expect(head).toBe("DM Sans");
    expect(fontFamily.sans).toContain("sans-serif");
  });

  it("does not register Inter, Playfair Display, or Merriweather (Requirement 2.3)", () => {
    const flat = JSON.stringify(fontFamily);
    expect(flat).not.toMatch(/Inter/);
    expect(flat).not.toMatch(/Playfair Display/);
    expect(flat).not.toMatch(/Merriweather/);
  });
});
