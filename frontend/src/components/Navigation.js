import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
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
    setOpenDropdown(null);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'The Book', path: '/book' },
    { name: 'Start a Circle', path: '/join' },
    {
      name: 'Learn',
      children: [
        { name: 'Resources', path: '/resources' },
        { name: 'Systems', path: '/systems' },
        { name: 'Results', path: '/results' },
      ],
    },
    {
      name: 'About',
      children: [
        { name: 'About', path: '/about' },
        { name: 'The Vision', path: '/vision' },
        { name: 'Safety', path: '/safety' },
        { name: 'Contact', path: '/contact' },
      ],
    },
  ];

  const isActive = (link) => {
    if (link.path) return location.pathname === link.path;
    if (link.children) return link.children.some((c) => location.pathname === c.path);
    return false;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-malumz-brown/5 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="font-serif text-2xl font-bold text-malumz-text-primary tracking-tight"
            >
              malumz<span className="text-malumz-gold">.co.za</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`font-sans text-sm font-medium transition-all hover:text-malumz-orange flex items-center gap-1 ${
                        isActive(link) ? 'text-malumz-orange' : 'text-malumz-text-secondary'
                      }`}
                    >
                      {link.name}
                      <ChevronDown size={14} />
                    </button>
                    {openDropdown === link.name && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-malumz-brown/10 rounded-lg shadow-lg py-2 min-w-[160px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-4 py-2 text-sm transition-all hover:bg-malumz-cream hover:text-malumz-orange ${
                              location.pathname === child.path
                                ? 'text-malumz-orange bg-malumz-cream'
                                : 'text-malumz-text-secondary'
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-sans text-sm font-medium transition-all hover:text-malumz-orange ${
                      isActive(link) ? 'text-malumz-orange' : 'text-malumz-text-secondary'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}
              <Link
                to="/crisis"
                className="bg-red-600 text-white hover:bg-red-700 rounded-full px-5 py-2 text-sm font-medium transition-all"
              >
                I Need Help Now
              </Link>
              <Link
                to="/gap-test"
                className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-5 py-2 text-sm font-medium transition-all"
              >
                Gap Test
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-malumz-text-primary"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-malumz-brown/10 shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.name}>
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === link.name ? null : link.name)
                        }
                        className={`w-full flex items-center justify-between py-2 font-sans text-base font-medium ${
                          isActive(link) ? 'text-malumz-orange' : 'text-malumz-text-secondary'
                        }`}
                      >
                        {link.name}
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            openDropdown === link.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openDropdown === link.name && (
                        <div className="pl-4 space-y-1 mb-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`block py-2 text-sm ${
                                location.pathname === child.path
                                  ? 'text-malumz-orange'
                                  : 'text-malumz-text-secondary'
                              }`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block py-2 font-sans text-base font-medium ${
                        isActive(link) ? 'text-malumz-orange' : 'text-malumz-text-secondary'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                )}
                <div className="pt-4 space-y-3">
                  <Link
                    to="/crisis"
                    className="block bg-red-600 text-white text-center rounded-full px-6 py-3 font-medium"
                  >
                    I Need Help Now
                  </Link>
                  <Link
                    to="/gap-test"
                    className="block bg-malumz-orange text-white text-center rounded-full px-6 py-3 font-medium"
                  >
                    Take the Gap Test
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
