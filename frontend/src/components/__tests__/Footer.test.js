/**
 * Unit tests for the simplified Footer component.
 *
 * Validates:
 * - Navigate section has links to all 5 pages
 * - Connect section has email + social links
 * - No CursorSettingsToggle or Settings section
 */
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("lucide-react", () => ({
  Mail: (props) => <svg data-testid="icon-Mail" {...props} />,
  Linkedin: (props) => <svg data-testid="icon-Linkedin" {...props} />,
  Instagram: (props) => <svg data-testid="icon-Instagram" {...props} />,
}));

const { Footer } = require("../Footer");

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer — minimal layout", () => {
  it("renders navigation links to all 5 pages", () => {
    const { container } = renderFooter();
    const navLinks = container.querySelectorAll('a[href^="/"]');
    const hrefs = Array.from(navLinks).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/book");
    expect(hrefs).toContain("/join");
    expect(hrefs).toContain("/about");
    expect(hrefs).toContain("/safety");
  });

  it("renders email link", () => {
    const { container } = renderFooter();
    const emailLink = container.querySelector('a[href^="mailto:"]');
    expect(emailLink).not.toBeNull();
    expect(emailLink.textContent).toContain("nkosinathi.dhliso@gmail.com");
  });

  it("renders social media links (Instagram, LinkedIn, TikTok)", () => {
    const { container } = renderFooter();
    const externalLinks = Array.from(
      container.querySelectorAll('a[target="_blank"]')
    );
    const hrefs = externalLinks.map((a) => a.getAttribute("href"));
    expect(hrefs.some((h) => h.includes("instagram.com"))).toBe(true);
    expect(hrefs.some((h) => h.includes("linkedin.com"))).toBe(true);
    expect(hrefs.some((h) => h.includes("tiktok.com"))).toBe(true);
  });

  it("does NOT render CursorSettingsToggle or Settings section", () => {
    const { container } = renderFooter();
    expect(container.textContent).not.toContain("Settings");
    expect(container.textContent).not.toContain("Custom cursor");
  });
});
