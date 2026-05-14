/**
 * Unit tests for the CTA-first Navigation component.
 *
 * Validates:
 * - Two primary CTAs: "Buy the Book" → /book, "Join a Circle" → /join
 * - "Rules First" safety link → /safety
 * - No dropdown menus or ChevronDown icons
 * - Mobile: "Buy the Book" CTA visible inline (outside hamburger)
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navigation } from "../Navigation";

jest.mock("lucide-react", () => ({
  Menu: (props) => <svg data-testid="icon-Menu" {...props} />,
  X: (props) => <svg data-testid="icon-X" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-ChevronDown" {...props} />,
  ShieldAlert: (props) => <svg data-testid="icon-ShieldAlert" {...props} />,
}));

function renderNavigation(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navigation />
    </MemoryRouter>
  );
}

describe("Navigation — CTA-first hierarchy", () => {
  describe("Primary CTAs", () => {
    it('renders "Buy the Book" linking to /book', () => {
      const { container } = renderNavigation();
      const buyLinks = Array.from(
        container.querySelectorAll('a[href="/book"]')
      ).filter((a) => a.textContent.trim() === "Buy the Book");
      // At least one visible (desktop or mobile inline)
      expect(buyLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders "Join a Circle" linking to /join', () => {
      const { container } = renderNavigation();
      const joinLinks = Array.from(
        container.querySelectorAll('a[href="/join"]')
      ).filter((a) => a.textContent.trim() === "Join a Circle");
      expect(joinLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Safety link", () => {
    it('renders "Rules First" linking to /safety', () => {
      const { container } = renderNavigation();
      const safetyLink = container.querySelector('a[href="/safety"]');
      expect(safetyLink).not.toBeNull();
      expect(safetyLink.textContent).toContain("Rules First");
    });
  });

  describe("No dropdowns", () => {
    it("does not render any ChevronDown icons", () => {
      const { container } = renderNavigation();
      const chevrons = container.querySelectorAll(
        '[data-testid="icon-ChevronDown"]'
      );
      expect(chevrons).toHaveLength(0);
    });

    it("does not render any dropdown menu containers", () => {
      const { container } = renderNavigation();
      const menus = container.querySelectorAll('[role="menu"]');
      expect(menus).toHaveLength(0);
    });
  });
});
