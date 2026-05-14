import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape and on click outside the open menu. Return focus to the
  // hamburger toggle on close so keyboard users aren't dumped on <body>.
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

  // When the menu opens, move focus into the first interactive element so
  // screen-reader and keyboard users land inside the menu rather than having
  // to tab through the page.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const first = menu.querySelector('a, button');
    if (first && typeof first.focus === 'function') first.focus();
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/', match: '/' },
    { name: 'Book', path: '/#book', match: '/book' },
    { name: 'Join', path: '/#join', match: '/join' },
    { name: 'About', path: '/#about', match: '/about' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-e1-bg/80 backdrop-blur-md border-b border-e1-text-muted/10 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="font-display text-2xl font-bold text-e1-text tracking-tight"
            >
              malumz<span className="text-e1-highlight">.co.za</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-sans text-sm font-medium transition-all hover:text-e1-secondary ${
                    location.pathname === link.match ? 'text-e1-primary' : 'text-e1-text'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/safety"
                className="bg-red-600 text-white hover:bg-red-700 rounded-full px-5 py-2 text-sm font-medium transition-all"
              >
                Rules First
              </Link>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-e1-text"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="false"
              aria-label="Main menu"
              className="lg:hidden absolute top-20 left-0 right-0 bg-e1-surface border-b border-e1-text-muted/10 shadow-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-2 font-sans text-base font-medium ${
                      location.pathname === link.match ? 'text-e1-primary' : 'text-e1-text'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-3">
                  <Link
                    to="/safety"
                    className="block bg-red-600 text-white text-center rounded-full px-6 py-3 font-medium"
                  >
                    Rules First
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
