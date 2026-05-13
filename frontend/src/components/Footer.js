import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram } from 'lucide-react';
import { CursorSettingsToggle } from '@/components/CursorSettingsToggle';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-e1-surface text-e1-text">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-highlight">Navigate</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Home</Link></li>
              <li><Link to="/book" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Book</Link></li>
              <li><Link to="/join" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Join</Link></li>
              <li><Link to="/about" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">About</Link></li>
              <li><Link to="/safety" className="text-e1-text/80 hover:text-e1-highlight transition-colors text-sm font-sans">Safety</Link></li>
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
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-highlight">Settings</h3>
            <CursorSettingsToggle />
          </div>
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
