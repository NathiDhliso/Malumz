import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Book', path: '/book' },
    { name: 'Join', path: '/join' },
    { name: 'About', path: '/about' },
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
                    location.pathname === link.path ? 'text-e1-primary' : 'text-e1-text'
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-e1-text"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 right-0 bg-e1-surface border-b border-e1-text-muted/10 shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-2 font-sans text-base font-medium ${
                      location.pathname === link.path ? 'text-e1-primary' : 'text-e1-text'
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

      <a
        href="https://www.google.com"
        className="fixed bottom-4 right-4 z-[100] bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg hover:bg-red-700 transition-all opacity-70 hover:opacity-100"
        aria-label="Quick exit"
      >
        Quick Exit
      </a>
    </>
  );
};
