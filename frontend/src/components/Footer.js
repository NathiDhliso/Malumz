import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram, Phone } from 'lucide-react';
import { CursorSettingsToggle } from '@/components/CursorSettingsToggle';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-e1-surface text-e1-text">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-highlight">Navigate</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Home</Link></li>
              <li><Link to="/book" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">The Book</Link></li>
              <li><Link to="/join" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Start a Circle</Link></li>
              <li><Link to="/about" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">About</Link></li>
              <li><Link to="/contact" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-highlight">Learn</h3>
            <ul className="space-y-2">
              <li><Link to="/resources" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Resources</Link></li>
              <li><Link to="/systems" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">System Guides</Link></li>
              <li><Link to="/results" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Results</Link></li>
              <li><Link to="/vision" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">The Vision</Link></li>
              <li><Link to="/safety" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-highlight">Crisis Help</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/crisis" className="text-red-300 hover:text-red-200 transition-colors text-sm font-sans font-semibold">
                  I Need Help Now
                </Link>
              </li>
              <li className="text-e1-text/80 text-sm font-sans">
                <Phone size={12} className="inline mr-1" />
                Lifeline: <a href="tel:0861322322" className="hover:text-e1-highlight">0861 322 322</a>
              </li>
              <li className="text-e1-text/80 text-sm font-sans">
                <Phone size={12} className="inline mr-1" />
                SADAG: <a href="tel:0800567567" className="hover:text-e1-highlight">0800 567 567</a>
              </li>
              <li className="text-e1-text/80 text-sm font-sans">
                <Phone size={12} className="inline mr-1" />
                GBV: <a href="tel:0800428428" className="hover:text-e1-highlight">0800 428 428</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-highlight">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:nkosinathi.dhliso@gmail.com" className="text-e1-text/80 hover:text-e1-highlight transition-colors flex items-center gap-2 text-sm font-sans">
                  <Mail size={14} />
                  nkosinathi.dhliso@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/rubix_sa" target="_blank" rel="noopener noreferrer" className="text-e1-text/80 hover:text-e1-highlight transition-colors flex items-center gap-2 text-sm font-sans">
                  <Instagram size={14} />
                  @rubix_sa
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/immanueldhliso" target="_blank" rel="noopener noreferrer" className="text-e1-text/80 hover:text-e1-highlight transition-colors flex items-center gap-2 text-sm font-sans">
                  <Linkedin size={14} />
                  immanueldhliso
                </a>
              </li>
              <li className="text-e1-text-muted text-xs mt-4 font-sans">
                Johannesburg, South Africa
              </li>
            </ul>
          </div>
        </div>

        {/* Settings section */}
        <div className="border-t border-e1-text/10 pt-8 pb-6 mb-6">
          <h4 className="font-display text-sm font-semibold text-e1-text-muted uppercase tracking-wider mb-3">Settings</h4>
          <CursorSettingsToggle />
        </div>

        <div className="border-t border-e1-text/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-e1-text-muted text-sm font-sans">
            &copy; {currentYear} Malumz. All rights reserved.
          </p>
          <p className="text-e1-text/80 text-sm font-display italic">
            "Built with ubuntu. Measured with honesty."
          </p>
        </div>
      </div>
    </footer>
  );
};
