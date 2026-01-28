import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-malumz-brown text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4 text-malumz-gold">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white/80 hover:text-malumz-gold transition-colors"
                  data-testid="footer-link-home"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/80 hover:text-malumz-gold transition-colors"
                  data-testid="footer-link-about"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-white/80 hover:text-malumz-gold transition-colors"
                  data-testid="footer-link-book"
                >
                  The Book
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-malumz-gold transition-colors"
                  data-testid="footer-link-contact"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4 text-malumz-gold">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/gap-test"
                  className="text-white/80 hover:text-malumz-gold transition-colors"
                  data-testid="footer-link-gap-test"
                >
                  Mind the Gap Test (Free)
                </Link>
              </li>
              <li className="text-white/60 text-sm">Crisis Resources:</li>
              <li className="text-white/80 text-sm">
                SADAG: <a href="tel:0800567567" className="hover:text-malumz-gold">0800 567 567</a> (24/7)
              </li>
              <li className="text-white/80 text-sm">
                Suicide Crisis: SMS 31393
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4 text-malumz-gold">
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:nkosinathi.dhliso@gmail.com"
                  className="text-white/80 hover:text-malumz-gold transition-colors flex items-center gap-2"
                  data-testid="footer-email"
                >
                  <Mail size={16} />
                  nkosinathi.dhliso@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/rubix_sa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-malumz-gold transition-colors flex items-center gap-2"
                  data-testid="footer-instagram"
                >
                  <Instagram size={16} />
                  @rubix_sa
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/immanueldhliso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-malumz-gold transition-colors flex items-center gap-2"
                  data-testid="footer-linkedin"
                >
                  <Linkedin size={16} />
                  immanueldhliso
                </a>
              </li>
              <li className="text-white/80 text-sm mt-4">
                Location: Johannesburg, South Africa
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} Malumz Movement. All rights reserved.
          </p>
          <p className="text-white/80 text-sm font-accent italic">
            "Built with ubuntu. Measured with honesty."
          </p>
        </div>
      </div>
    </footer>
  );
};
