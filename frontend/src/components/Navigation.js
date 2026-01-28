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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'The Book', path: '/book' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-malumz-brown/5 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl font-bold text-malumz-text-primary tracking-tight"
            data-testid="logo-link"
          >
            malumz<span className="text-malumz-gold">.co.za</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.name.toLowerCase().replace(' ', '-')}`}
                className={`font-sans text-sm font-medium transition-all hover:text-malumz-orange ${
                  location.pathname === link.path
                    ? 'text-malumz-orange'
                    : 'text-malumz-text-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/gap-test"
              data-testid="gap-test-cta-nav"
              className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-6 py-2.5 font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Take the Gap Test
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-malumz-text-primary"
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-malumz-brown/10 shadow-lg"
            data-testid="mobile-menu"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block font-sans text-base font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-malumz-orange'
                      : 'text-malumz-text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/gap-test"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-malumz-orange text-white text-center rounded-full px-6 py-3 font-medium"
              >
                Take the Gap Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
