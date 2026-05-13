/**
 * Unit tests for the simplified Navigation component.
 *
 * Validates:
 * - Exactly 4 flat text links rendered: Home, Book, Join, About (Requirement 2.1)
 * - "I Need Help" button links to `/safety` (Requirement 2.2)
 * - No dropdown menus or ChevronDown icons rendered (Requirement 2.3, 2.6)
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.6**
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navigation } from "../Navigation";

// Mock lucide-react to track which icons are rendered
jest.mock("lucide-react", () => ({
  Menu: (props) => <svg data-testid="icon-Menu" {...props} />,
  X: (props) => <svg data-testid="icon-X" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-ChevronDown" {...props} />,
}));

function renderNavigation(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navigation />
    </MemoryRouter>
  );
}

describe("Navigation — Conversion-Focused Simplification", () => {
  describe("Requirement 2.1: Exactly 4 flat text links", () => {
    it("renders exactly 4 navigation text links: Home, Book, Join, About", () => {
      const { container } = renderNavigation();

      // Get the desktop nav links (inside the hidden lg:flex container)
      // These are the internal links excluding the logo and the crisis button
      const allInternalLinks = Array.from(
        container.querySelectorAll('a[href^="/"]')
      );

      // Filter out the logo link (malumz.co.za) and the "I Need Help" button
      // and the Quick Exit link, and mobile menu duplicates
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      expect(desktopNav).not.toBeNull();

      const desktopNavLinks = Array.from(
        desktopNav.querySelectorAll('a[href^="/"]')
      );

      // Exclude the "I Need Help" crisis button from the count
      const textLinks = desktopNavLinks.filter(
        (a) => !a.textContent.includes("Rules First")
      );

      expect(textLinks).toHaveLength(4);

      const linkNames = textLinks.map((a) => a.textContent.trim());
      expect(linkNames).toEqual(["Home", "Book", "Join", "About"]);
    });

    it("links Home to /", () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      const homeLink = Array.from(
        desktopNav.querySelectorAll('a[href="/"]')
      ).find((a) => a.textContent.trim() === "Home");
      expect(homeLink).not.toBeNull();
    });

    it("links Book to /book", () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      const bookLink = desktopNav.querySelector('a[href="/book"]');
      expect(bookLink).not.toBeNull();
      expect(bookLink.textContent.trim()).toBe("Book");
    });

    it("links Join to /join", () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      const joinLink = desktopNav.querySelector('a[href="/join"]');
      expect(joinLink).not.toBeNull();
      expect(joinLink.textContent.trim()).toBe("Join");
    });

    it("links About to /about", () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      const aboutLink = desktopNav.querySelector('a[href="/about"]');
      expect(aboutLink).not.toBeNull();
      expect(aboutLink.textContent.trim()).toBe("About");
    });
  });

  describe('Requirement 2.2: safety button', () => {
    it('renders a "Rules First" button linking to /safety', () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      const crisisLink = desktopNav.querySelector('a[href="/safety"]');
      expect(crisisLink).not.toBeNull();
      expect(crisisLink.textContent.trim()).toBe("Rules First");
    });

    it("crisis button is visually distinct (has bg-red styling)", () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      const crisisLink = desktopNav.querySelector('a[href="/safety"]');
      expect(crisisLink.className).toMatch(/bg-red/);
    });
  });

  describe("Requirement 2.3 & 2.6: No dropdown menus or ChevronDown icons", () => {
    it("does not render any ChevronDown icons", () => {
      const { container } = renderNavigation();
      const chevrons = container.querySelectorAll(
        '[data-testid="icon-ChevronDown"]'
      );
      expect(chevrons).toHaveLength(0);
    });

    it("does not render any dropdown menu containers", () => {
      const { container } = renderNavigation();
      // No elements with role="menu" or dropdown-like containers
      const menus = container.querySelectorAll('[role="menu"]');
      expect(menus).toHaveLength(0);
    });

    it('does not render a "Learn" dropdown button', () => {
      const { container } = renderNavigation();
      const buttons = Array.from(container.querySelectorAll("button"));
      const learnButton = buttons.find((b) =>
        b.textContent.trim().startsWith("Learn")
      );
      expect(learnButton).toBeUndefined();
    });

    it("all navigation items are flat links (no nested children)", () => {
      const { container } = renderNavigation();
      const desktopNav = container.querySelector(".hidden.lg\\:flex");
      // All children should be direct <a> links, no <button> elements for dropdowns
      const dropdownButtons = desktopNav.querySelectorAll("button");
      expect(dropdownButtons).toHaveLength(0);
    });
  });
});
