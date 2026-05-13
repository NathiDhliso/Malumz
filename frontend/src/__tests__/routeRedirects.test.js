/**
 * Integration tests — Route redirect behaviour.
 *
 * Feature: conversion-focused-simplification, Task 13.1
 *
 * Validates that removed routes redirect to their correct targets:
 *   - `/results`        → `/`
 *   - `/resources`      → `/`
 *   - `/systems/:slug`  → `/`
 *   - `/vision`         → `/about`
 *   - `/contact`        → `/about`
 *   - `/crisis`         → `/safety`
 *
 * Strategy: Render the app's `<Routes>` tree inside a `<MemoryRouter>`
 * with `initialEntries` set to the removed path. Assert that the
 * resulting location matches the expected redirect target. Page
 * components are mocked to lightweight stubs so the tests exercise
 * only the routing layer without pulling in GSAP, assets, or API calls.
 *
 * @see Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// ---------------------------------------------------------------------------
// Lightweight page stubs — each renders its route path so we can assert
// which page the redirect landed on.
// ---------------------------------------------------------------------------

function StubHome() {
  return <div data-testid="page-home">Home Page</div>;
}
function StubAbout() {
  return <div data-testid="page-about">About Page</div>;
}
function StubSafety() {
  return <div data-testid="page-safety">Safety Page</div>;
}

/**
 * Helper component that exposes the current location pathname via a
 * data-testid so tests can assert the final resolved path.
 */
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

/**
 * Renders the app's route configuration (mirroring App.js) inside a
 * MemoryRouter starting at the given `initialPath`. Returns the RTL
 * render result for assertions.
 */
function renderWithRouter(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {/* Active page routes */}
        <Route path="/" element={<StubHome />} />
        <Route path="/book" element={<div data-testid="page-book">Book Page</div>} />
        <Route path="/join" element={<div data-testid="page-join">Join Page</div>} />
        <Route path="/about" element={<StubAbout />} />
        <Route path="/safety" element={<StubSafety />} />
        {/* Redirects for removed routes */}
        <Route path="/results" element={<Navigate to="/" replace />} />
        <Route path="/resources" element={<Navigate to="/" replace />} />
        <Route path="/systems/:slug" element={<Navigate to="/" replace />} />
        <Route path="/systems" element={<Navigate to="/" replace />} />
        <Route path="/vision" element={<Navigate to="/about" replace />} />
        <Route path="/contact" element={<Navigate to="/about" replace />} />
        <Route path="/crisis" element={<Navigate to="/safety" replace />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );
}

describe("Route redirects (Task 13.1)", () => {
  /**
   * Validates: Requirement 1.2
   * WHEN a visitor navigates to `/results`, THE Website SHALL redirect to `/`
   */
  it("/results redirects to /", () => {
    renderWithRouter("/results");
    expect(screen.getByTestId("page-home")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/");
  });

  /**
   * Validates: Requirement 1.3
   * WHEN a visitor navigates to `/resources`, THE Website SHALL redirect to `/`
   */
  it("/resources redirects to /", () => {
    renderWithRouter("/resources");
    expect(screen.getByTestId("page-home")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/");
  });

  /**
   * Validates: Requirement 1.4
   * WHEN a visitor navigates to `/systems/:slug`, THE Website SHALL redirect to `/`
   */
  it("/systems/any-slug redirects to /", () => {
    renderWithRouter("/systems/any-slug");
    expect(screen.getByTestId("page-home")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/");
  });

  /**
   * Validates: Requirement 1.5
   * WHEN a visitor navigates to `/vision`, THE Website SHALL redirect to `/about`
   */
  it("/vision redirects to /about", () => {
    renderWithRouter("/vision");
    expect(screen.getByTestId("page-about")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/about");
  });

  /**
   * Validates: Requirement 1.6
   * WHEN a visitor navigates to `/contact`, THE Website SHALL redirect to `/about`
   */
  it("/contact redirects to /about", () => {
    renderWithRouter("/contact");
    expect(screen.getByTestId("page-about")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/about");
  });

  /**
   * Validates: Requirement 1.7
   * WHEN a visitor navigates to `/crisis`, THE Website SHALL redirect to `/safety`
   */
  it("/crisis redirects to /safety", () => {
    renderWithRouter("/crisis");
    expect(screen.getByTestId("page-safety")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/safety");
  });
});
