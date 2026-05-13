import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollTrigger } from "@/lib/gsap";
import { useRouteScrollRefresh } from "@/lib/useRouteScrollRefresh";
import { useResizeRefreshDebounce } from "@/lib/useResizeRefreshDebounce";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Cursor from "@/components/Cursor";
import { PageTransition } from "@/components/PageTransition";
import { RevealRoot } from "@/components/RevealRoot";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { BookPage } from "@/pages/BookPage";
import { ContactPage } from "@/pages/ContactPage";
import { JoinPage } from "@/pages/JoinPage";
import { CrisisPage } from "@/pages/CrisisPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { SystemsPage } from "@/pages/SystemsPage";
import { SystemDetailPage } from "@/pages/SystemDetailPage";
import { SafetyPage } from "@/pages/SafetyPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { VisionPage } from "@/pages/VisionPage";

/**
 * AppShell hosts everything that depends on the router context. Mounting it
 * inside `<BrowserRouter>` lets `useRouteScrollRefresh()` read `useLocation`
 * and lets the resize listener sit at the same scope as the route tree so
 * that ScrollTriggers owned by any page are refreshed together.
 *
 * Feature: e1-editorial-ui-overhaul
 * Requirements: 21.1, 21.2, 21.3, 22.1, 22.2, 22.3
 */
function AppShell() {
  // Secondary safety net to Requirement 21.1: `<PageTransition>` already
  // emits `ScrollTrigger.refresh()` once per completed curtain exit sweep
  // (Requirement 21.2), but the curtain is skipped under reduced motion.
  // `useRouteScrollRefresh()` is keyed on `useLocation().pathname`, so every
  // route change — curtain or not — still produces exactly one refresh
  // deferred until after the new route has mounted and painted.
  useRouteScrollRefresh();

  // Requirement 22.3: when the viewport crosses the 1024px pin breakpoint
  // via resize, call `ScrollTrigger.refresh()` within 250ms of the resize
  // settling. We install a single debounced `window.resize` listener at the
  // app-shell level so every feature-authored pin picks up the re-measure
  // in one pass, and the refresh fires at most once per burst of events
  // rather than once per frame. Feature-authored pins themselves stay
  // gated by `DESKTOP_PIN_QUERY` / `matchMedia` so they remain inert below
  // 1024px or under reduced motion (Requirements 22.1, 22.2).
  useResizeRefreshDebounce();

  return (
    <RevealRoot>
      <div className="App min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/crisis" element={<CrisisPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/systems" element={<SystemsPage />} />
              <Route path="/systems/:slug" element={<SystemDetailPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/vision" element={<VisionPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
        <Cursor />
      </div>
    </RevealRoot>
  );
}

function App() {
  // Drive one ScrollTrigger.refresh() once web fonts are ready so that any
  // scroll-linked layouts measured before Fraunces / DM Sans finished loading
  // pick up their final metrics. Falls back to a microtask-scheduled refresh
  // on engines that do not expose `document.fonts` (e.g. older test JSDOMs).
  // Feature: e1-editorial-ui-overhaul
  // Requirement: 2.7
  useEffect(() => {
    let cancelled = false;

    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();
      });
      return () => {
        cancelled = true;
      };
    }

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
