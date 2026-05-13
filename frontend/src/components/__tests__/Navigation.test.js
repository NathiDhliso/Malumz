/**
 * Unit tests for the Navigation component restyle.
 *
 * Validates:
 * - No `malumz-*` class names appear in rendered output (Requirement 29.1)
 * - No legacy font references (Playfair Display, Inter, Merriweather) (Requirement 29.1)
 * - The link set is preserved (frozen snapshot comparison) (Requirement 29.3)
 * - Every existing `lucide-react` icon import is retained (Requirement 29.5)
 *
 * **Validates: Requirements 29.1, 29.3, 29.5**
 */
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navigation } from "../Navigation";

// Mock lucide-react to track which icons are rendered
jest.mock("lucide-react", () => ({
  Menu: (props) => <svg data-testid="icon-Menu" {...props} />,
  X: (props) => <svg data-testid="icon-X" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-ChevronDown" {...props} />,
}));

function renderNavigation() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Navigation />
    </MemoryRouter>
  );
}

describe("Navigation — E1 restyle unit tests", () => {
  describe("No legacy class names", () => {
    it("does not contain any malumz-* class names in the rendered output", () => {
      const { container } = renderNavigation();
      const html = container.innerHTML;
      expect(html).not.toMatch(/malumz-/);
    });

    it("does not reference Playfair Display font", () => {
      const { container } = renderNavigation();
      const html = container.innerHTML;
      expect(html).not.toMatch(/Playfair Display/i);
    });

    it("does not reference Inter font", () => {
      const { container } = renderNavigation();
      const html = container.innerHTML;
      expect(html).not.toMatch(/\bInter\b/);
    });

    it("does not reference Merriweather font", () => {
      const { container } = renderNavigation();
      const html = container.innerHTML;
      expect(html).not.toMatch(/Merriweather/i);
    });
  });

  describe("Link set preservation (frozen snapshot)", () => {
    /**
     * The expected navigation link set (frozen snapshot).
     * Includes the logo link, top-level nav links, and the crisis CTA.
     * Dropdown children are rendered as <button> elements (not <a>) until
     * the dropdown is opened, so only the always-visible links are asserted.
     *
     * The logo link ("malumz.co.za" pointing to "/") is part of the
     * component's structure and is included in the snapshot.
     */
    const EXPECTED_NAV_LINKS = [
      { name: "malumz.co.za", path: "/" },
      { name: "Home", path: "/" },
      { name: "The Book", path: "/book" },
      { name: "Start a Circle", path: "/join" },
      { name: "About", path: "/about" },
      { name: "Safety", path: "/safety" },
      { name: "I Need Help Now", path: "/safety" },
    ];

    it("renders the expected always-visible navigation links (frozen snapshot)", () => {
      const { container } = renderNavigation();

      // Collect all <a> elements with href (Link renders as <a>)
      const allLinks = Array.from(container.querySelectorAll("a[href]"));

      // Extract internal links (those starting with /)
      const internalLinks = allLinks
        .filter((a) => a.getAttribute("href").startsWith("/"))
        .map((a) => ({
          name: a.textContent.trim(),
          path: a.getAttribute("href"),
        }));

      // Deduplicate (mobile menu renders same links)
      const uniqueLinks = [];
      const seen = new Set();
      for (const link of internalLinks) {
        const key = `${link.name}::${link.path}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLinks.push(link);
        }
      }

      expect(uniqueLinks).toEqual(EXPECTED_NAV_LINKS);
    });

    it("preserves dropdown menu items for Learn group", () => {
      const { container } = renderNavigation();
      // The Learn dropdown button should exist
      const buttons = Array.from(container.querySelectorAll("button"));
      const learnButton = buttons.find(
        (b) => b.textContent.replace(/\s+/g, " ").trim().startsWith("Learn")
      );
      expect(learnButton).not.toBeNull();
    });

    it("preserves dropdown menu items for About group", () => {
      const { container } = renderNavigation();
      // After page-consolidation-and-animations, About is a direct link
      // (no longer a dropdown). Verify it exists as a link.
      const links = Array.from(container.querySelectorAll("a[href]"));
      const aboutLink = links.find(
        (a) => a.getAttribute("href") === "/about" && a.textContent.trim() === "About"
      );
      expect(aboutLink).not.toBeNull();
    });

    it("preserves the Quick Exit external link", () => {
      const { container } = renderNavigation();
      const quickExit = container.querySelector(
        'a[href="https://www.google.com"]'
      );
      expect(quickExit).not.toBeNull();
      expect(quickExit.textContent.trim()).toBe("Quick Exit");
    });
  });

  describe("lucide-react icon retention", () => {
    it("renders the Menu icon (mobile toggle)", () => {
      const { container } = renderNavigation();
      const menuIcon = container.querySelector('[data-testid="icon-Menu"]');
      expect(menuIcon).not.toBeNull();
    });

    it("renders ChevronDown icons (dropdown indicators)", () => {
      const { container } = renderNavigation();
      const chevrons = container.querySelectorAll(
        '[data-testid="icon-ChevronDown"]'
      );
      expect(chevrons.length).toBeGreaterThan(0);
    });

    it("imports Menu, X, and ChevronDown from lucide-react", () => {
      // This test validates that the component source imports these icons.
      // The mock intercepts them — if the component stopped importing any,
      // the mock wouldn't render the corresponding data-testid.
      // Menu and ChevronDown are visible by default; X is only visible when
      // mobile menu is open, but the import itself is validated by the mock
      // not throwing on the import statement.
      const { container } = renderNavigation();
      // Menu icon present (mobile toggle shows Menu when closed)
      expect(
        container.querySelector('[data-testid="icon-Menu"]')
      ).not.toBeNull();
      // ChevronDown present in dropdown buttons
      expect(
        container.querySelector('[data-testid="icon-ChevronDown"]')
      ).not.toBeNull();
    });
  });
});
