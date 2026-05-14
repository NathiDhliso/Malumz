import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert } from 'lucide-react';

/**
 * <Navigation>
 *
 * CTA-first nav. Two primary actions appear at every breakpoint:
 *   1. "Buy the Book" (filled, terracotta) → /book
 *   2. "Join a Circle" (outline) → /join
 *
 * Everything else is demoted: section anchors live inside the mobile
 * hamburger as a small "Jump to" subnav for users who want to scroll
 * directly to a home-page section. "Rules First" is a small red text
 * link rather than a competing third button.
 *
 * Cognitive-load rule: a visitor never sees more than two primary
 * actions in the chrome at once.
 */

const PRIMARY_BUY_LABEL = 'Buy the Book';
const PRIMARY_JOIN_LABEL = 'Join a Circle';
const SAFETY_LABEL = 'Rules First';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu on every route change.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Close on Escape and on click outside the open menu.
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        if (menuButtonRef.current) menuButtonRef.current.focus();
      }
    };

    const handlePointerDown = (e) => {
      const menu = mobileMenuRef.current;
      const btn = menuButtonRef.current;
      if (!menu) return;
      if (menu.contains(e.target)) return;
      if (btn && btn.contains(e.target)) return;
      setIsMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const first = menu.querySelector('a, button');
    if (first && typeof first.focus === 'function') first.focus();
  }, [isMobileMenuOpen]);

  // Section anchors — secondary, only surfaced inside the mobile menu
  // as a "Jump to" subnav. They never appear in the top chrome on
  // desktop because they would compete with the two primary CTAs.
  const sectionAnchors = [
    { name: 'About', path: '/#about' },
    { name: 'The book', path: '/#book' },
    { name: 'Brotherhood circles', path: '/#join' },
  ];

  const buyClasses =
    'inline-flex items-center justify-center bg-e1-primary text-white hover:bg-[#9f2f0b] rounded-full px-5 py-2 text-sm font-semibold transition-colors whitespace-nowrap';
  const joinClasses =
    'inline-flex items-center justify-center border border-e1-text text-e1-text hover:bg-e1-text hover:text-e1-bg rounded-full px-5 py-2 text-sm font-semibold transition-colors whitespace-nowrap';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-e1-bg/90 backdrop-blur-md border-b border-e1-text-muted/10 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link
            to="/"
            className="font-display text-2xl font-bold text-e1-text tracking-tight"
            aria-label="Malumz home"
          >
            malumz<span className="text-e1-highlight">.co.za</span>
          </Link>

          {/* Desktop CTAs (>= lg) — only the two primary actions plus the
              small Rules First link. */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/safety" className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-medium uppercase tracking-wider mr-2">
              <ShieldAlert size={14} aria-hidden="true" />
              {SAFETY_LABEL}
            </Link>
            <Link to="/join" className={joinClasses}>
              {PRIMARY_JOIN_LABEL}
            </Link>
            <Link to="/book" className={buyClasses}>
              {PRIMARY_BUY_LABEL}
            </Link>
          </div>

          {/* Mobile: Buy CTA inline + hamburger. Buy stays one tap away
              even when the menu is closed. */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/book"
              className="inline-flex items-center justify-center bg-e1-primary text-white rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap"
            >
              {PRIMARY_BUY_LABEL}
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-e1-text"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="false"
            aria-label="Main menu"
            className="lg:hidden absolute top-20 left-0 right-0 bg-e1-bg border-b border-e1-text-muted/15 shadow-lg max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Primary CTAs — full width, dominant. */}
              <div className="space-y-3">
                <Link
                  to="/book"
                  className="block w-full text-center bg-e1-primary text-white rounded-full px-6 py-3 font-semibold"
                >
                  {PRIMARY_BUY_LABEL}
                </Link>
                <Link
                  to="/join"
                  className="block w-full text-center border border-e1-text text-e1-text rounded-full px-6 py-3 font-semibold"
                >
                  {PRIMARY_JOIN_LABEL}
                </Link>
              </div>

              {/* Tertiary Rules First link. */}
              <Link
                to="/safety"
                className="flex items-center justify-center gap-1.5 text-red-600 text-sm font-medium uppercase tracking-wider"
              >
                <ShieldAlert size={14} aria-hidden="true" />
                {SAFETY_LABEL}
              </Link>

              {/* Section anchors — quiet "Jump to" subnav. */}
              <div className="border-t border-e1-text-muted/15 pt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-e1-text-muted mb-2">
                  Jump to
                </p>
                <ul className="space-y-1">
                  {sectionAnchors.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="block py-1.5 font-sans text-sm text-e1-text-muted hover:text-e1-text"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
