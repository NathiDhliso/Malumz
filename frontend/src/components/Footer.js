import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-e1-surface text-e1-text">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-primary">Navigate</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-e1-text-muted hover:text-e1-primary transition-colors text-sm font-sans">Home</Link></li>
              <li><Link to="/book" className="text-e1-text-muted hover:text-e1-primary transition-colors text-sm font-sans">Book</Link></li>
              <li><Link to="/join" className="text-e1-text-muted hover:text-e1-primary transition-colors text-sm font-sans">Join</Link></li>
              <li><Link to="/about" className="text-e1-text-muted hover:text-e1-primary transition-colors text-sm font-sans">About</Link></li>
              <li><Link to="/safety" className="text-e1-text-muted hover:text-e1-primary transition-colors text-sm font-sans">Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-e1-primary">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:nkosinathi.dhliso@gmail.com" className="text-e1-text-muted hover:text-e1-primary transition-colors flex items-center gap-2 text-sm font-sans">
                  <Mail size={14} />
                  nkosinathi.dhliso@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/rubix_sa" target="_blank" rel="noopener noreferrer" className="text-e1-text-muted hover:text-e1-primary transition-colors flex items-center gap-2 text-sm font-sans">
                  <Instagram size={14} />
                  @rubix_sa
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/immanueldhliso" target="_blank" rel="noopener noreferrer" className="text-e1-text-muted hover:text-e1-primary transition-colors flex items-center gap-2 text-sm font-sans">
                  <Linkedin size={14} />
                  immanueldhliso
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@dogtrainersa" target="_blank" rel="noopener noreferrer" className="text-e1-text-muted hover:text-e1-primary transition-colors flex items-center gap-2 text-sm font-sans">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.1v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.4a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.83z"/>
                  </svg>
                  @dogtrainersa
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-e1-text/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-e1-text-muted text-sm font-sans">
            &copy; {currentYear} Malumz. All rights reserved.
          </p>
          <p className="text-e1-text-muted text-sm font-display italic">
            "Built with ubuntu. Measured with honesty."
          </p>
        </div>
      </div>
    </footer>
  );
};
