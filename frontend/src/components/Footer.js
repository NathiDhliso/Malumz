import { Link } from 'react-router-dom';
import { Mail, Linkedin, Instagram, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-malumz-brown text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-malumz-gold">Navigate</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Home</Link></li>
              <li><Link to="/book" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">The Book</Link></li>
              <li><Link to="/join" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Start a Circle</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">About</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-malumz-gold">Learn</h3>
            <ul className="space-y-2">
              <li><Link to="/gap-test" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Mind the Gap Test</Link></li>
              <li><Link to="/resources" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Resources</Link></li>
              <li><Link to="/systems" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">System Guides</Link></li>
              <li><Link to="/results" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Results</Link></li>
              <li><Link to="/vision" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">The Vision</Link></li>
              <li><Link to="/safety" className="text-white/80 hover:text-malumz-gold transition-colors text-sm">Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-malumz-gold">Crisis Help</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/crisis" className="text-red-300 hover:text-red-200 transition-colors text-sm font-semibold">
                  I Need Help Now
                </Link>
              </li>
              <li className="text-white/80 text-sm">
                <Phone size={12} className="inline mr-1" />
                Lifeline: <a href="tel:0861322322" className="hover:text-malumz-gold">0861 322 322</a>
              </li>
              <li className="text-white/80 text-sm">
                <Phone size={12} className="inline mr-1" />
                SADAG: <a href="tel:0800567567" className="hover:text-malumz-gold">0800 567 567</a>
              </li>
              <li className="text-white/80 text-sm">
                <Phone size={12} className="inline mr-1" />
                GBV: <a href="tel:0800428428" className="hover:text-malumz-gold">0800 428 428</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-malumz-gold">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:nkosinathi.dhliso@gmail.com" className="text-white/80 hover:text-malumz-gold transition-colors flex items-center gap-2 text-sm">
                  <Mail size={14} />
                  nkosinathi.dhliso@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/rubix_sa" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-malumz-gold transition-colors flex items-center gap-2 text-sm">
                  <Instagram size={14} />
                  @rubix_sa
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/immanueldhliso" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-malumz-gold transition-colors flex items-center gap-2 text-sm">
                  <Linkedin size={14} />
                  immanueldhliso
                </a>
              </li>
              <li className="text-white/60 text-xs mt-4">
                Johannesburg, South Africa
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            &copy; {currentYear} Malumz. All rights reserved.
          </p>
          <p className="text-white/80 text-sm font-accent italic">
            "Built with ubuntu. Measured with honesty."
          </p>
        </div>
      </div>
    </footer>
  );
};
