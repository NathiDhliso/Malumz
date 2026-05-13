/**
 * Unit tests for the Footer component restyle.
 *
 * Validates:
 * - No `malumz-*` class names appear in rendered output (Requirement 29.2)
 * - No legacy font references (Playfair Display, Inter, Merriweather) (Requirement 29.2)
 * - The link set is preserved (frozen snapshot comparison) (Requirement 29.4)
 * - Every existing `lucide-react` icon import is retained (Requirement 29.5)
 * - CursorSettingsToggle is mounted in the Settings section (Requirement 6.3)
 *
 * **Validates: Requirements 29.2, 29.4, 29.5**
 */
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "../Footer";

// Mock lucide-react to track which icons are rendered
jest.mock("lucide-react", () => ({
  Mail: (props) => <svg data-testid="icon-Mail" {...props} />,
  Linkedin: (props) => <svg data-testid="icon-Linkedin" {...props} />,
  Instagram: (props) => <svg data-testid="icon-Instagram" {...props} />,
  Phone: (props) => <svg data-testid="icon-Phone" {...props} />,
}));

// Mock the CursorSettingsToggle to verify it's mounted
jest.mock("@/components/CursorSettingsToggle", () => ({
  CursorSettingsToggle: (props) => (
    <div data-testid="cursor-settings-toggle" {...props}>
      CursorSettingsToggle
    </div>
  ),
}));

function renderFooter() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer — E1 restyle unit tests", () => {
  describe("No legacy class names", () => {
    it("does not contain any malumz-* class names in the rendered output", () => {
      const { container } = renderFooter();
      const html = container.innerHTML;
      expect(html).not.toMatch(/malumz-/);
    });

    it("does not reference Playfair Display font", () => {
      const { container } = renderFooter();
      const html = container.innerHTML;
      expect(html).not.toMatch(/Playfair Display/i);
    });

    it("does not reference Inter font", () => {
      const { container } = renderFooter();
      const html = container.innerHTML;
      expect(html).not.toMatch(/\bInter\b/);
    });

    it("does not reference Merriweather font", () => {
      const { container } = renderFooter();
      const html = container.innerHTML;
      expect(html).not.toMatch(/Merriweather/i);
    });
  });

  describe("Link set preservation (frozen snapshot)", () => {
    /**
     * The expected link set from the pre-overhaul Footer component.
     * This is a frozen snapshot — any addition or removal will fail the test.
     */
    const EXPECTED_FOOTER_INTERNAL_LINKS = [
      { name: "Home", path: "/" },
      { name: "The Book", path: "/book" },
      { name: "Start a Circle", path: "/join" },
      { name: "About", path: "/about" },
      { name: "Contact", path: "/about" },
      { name: "Resources", path: "/resources" },
      { name: "System Guides", path: "/resources" },
      { name: "Results", path: "/results" },
      { name: "The Vision", path: "/about" },
      { name: "Safety", path: "/safety" },
      { name: "I Need Help Now", path: "/safety" },
    ];

    const EXPECTED_FOOTER_EXTERNAL_LINKS = [
      { href: "tel:0861322322" },
      { href: "tel:0800567567" },
      { href: "tel:0800428428" },
      { href: "mailto:nkosinathi.dhliso@gmail.com" },
      { href: "https://www.instagram.com/rubix_sa" },
      { href: "https://www.linkedin.com/in/immanueldhliso" },
    ];

    it("renders the exact set of internal footer links (frozen snapshot)", () => {
      const { container } = renderFooter();

      // Collect all <a> elements with href starting with /
      const allLinks = Array.from(container.querySelectorAll("a[href]"));
      const internalLinks = allLinks
        .filter((a) => a.getAttribute("href").startsWith("/"))
        .map((a) => ({
          name: a.textContent.trim(),
          path: a.getAttribute("href"),
        }));

      expect(internalLinks).toEqual(EXPECTED_FOOTER_INTERNAL_LINKS);
    });

    it("renders the exact set of external footer links (frozen snapshot)", () => {
      const { container } = renderFooter();

      const allLinks = Array.from(container.querySelectorAll("a[href]"));
      const externalLinks = allLinks
        .filter((a) => !a.getAttribute("href").startsWith("/"))
        .map((a) => ({ href: a.getAttribute("href") }));

      expect(externalLinks).toEqual(EXPECTED_FOOTER_EXTERNAL_LINKS);
    });
  });

  describe("lucide-react icon retention", () => {
    it("renders the Mail icon", () => {
      const { container } = renderFooter();
      const icon = container.querySelector('[data-testid="icon-Mail"]');
      expect(icon).not.toBeNull();
    });

    it("renders the Linkedin icon", () => {
      const { container } = renderFooter();
      const icon = container.querySelector('[data-testid="icon-Linkedin"]');
      expect(icon).not.toBeNull();
    });

    it("renders the Instagram icon", () => {
      const { container } = renderFooter();
      const icon = container.querySelector('[data-testid="icon-Instagram"]');
      expect(icon).not.toBeNull();
    });

    it("renders Phone icons (crisis help numbers)", () => {
      const { container } = renderFooter();
      const icons = container.querySelectorAll('[data-testid="icon-Phone"]');
      expect(icons.length).toBe(3);
    });

    it("retains all four lucide-react icon imports (Mail, Linkedin, Instagram, Phone)", () => {
      const { container } = renderFooter();
      expect(
        container.querySelector('[data-testid="icon-Mail"]')
      ).not.toBeNull();
      expect(
        container.querySelector('[data-testid="icon-Linkedin"]')
      ).not.toBeNull();
      expect(
        container.querySelector('[data-testid="icon-Instagram"]')
      ).not.toBeNull();
      expect(
        container.querySelector('[data-testid="icon-Phone"]')
      ).not.toBeNull();
    });
  });

  describe("CursorSettingsToggle integration", () => {
    it("mounts the CursorSettingsToggle in the Settings section", () => {
      const { container } = renderFooter();
      const toggle = container.querySelector(
        '[data-testid="cursor-settings-toggle"]'
      );
      expect(toggle).not.toBeNull();
    });
  });
});
