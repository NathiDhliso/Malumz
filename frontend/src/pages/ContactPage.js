import { useState } from 'react';
import { Mail, MapPin, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const subjectOptions = [
    'General Inquiry',
    'Book Question',
    'Brotherhood Circle Question',
    'Research Partnership',
    'Corporate / Government Partnership',
    'Media Request',
    'Safety Report',
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/contact`, formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Contact form submission error:', error);
      alert('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-malumz-cream" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-malumz-text-primary mb-6">
            Get In Touch
          </h1>
          <p className="font-sans text-xl text-malumz-text-secondary max-w-2xl mx-auto">
            Have questions about the book, Brotherhood Circles, or partnerships? We respond within 48 hours.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-white" data-testid="contact-form-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-8">
                Send Us a Message
              </h2>
              
              {submitSuccess ? (
                <div className="bg-malumz-cream border-l-4 border-malumz-gold p-8 rounded-lg" data-testid="contact-success-message">
                  <CheckCircle2 size={48} className="text-malumz-gold mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-2">
                    Message Received!
                  </h3>
                  <p className="text-malumz-text-secondary">
                    Thank you for reaching out. We'll respond to your message within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      data-testid="contact-name-input"
                      className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      data-testid="contact-email-input"
                      className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      data-testid="contact-subject-select"
                      className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      data-testid="contact-message-input"
                      className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all resize-none"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="contact-submit-button"
                    className="w-full bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-8">
                Contact Information
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-malumz-gold/10 rounded-full flex items-center justify-center">
                    <Mail className="text-malumz-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-2">
                      Email
                    </h3>
                    <a
                      href="mailto:nkosinathi.dhliso@gmail.com"
                      className="text-malumz-orange hover:underline"
                    >
                      nkosinathi.dhliso@gmail.com
                    </a>
                    <p className="text-malumz-text-muted text-sm mt-1">
                      We respond within 48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-malumz-gold/10 rounded-full flex items-center justify-center">
                    <MapPin className="text-malumz-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-2">
                      Location
                    </h3>
                    <p className="text-malumz-text-secondary">
                      Johannesburg, Gauteng<br />
                      South Africa
                    </p>
                  </div>
                </div>

                {/* Crisis Resources */}
                <div className="bg-malumz-cream border-l-4 border-malumz-orange p-6 rounded-lg mt-12">
                  <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-4">
                    In Crisis? Get Help Now
                  </h3>
                  <div className="space-y-3 text-malumz-text-secondary">
                    <p>
                      <strong>SADAG (24/7):</strong>{' '}
                      <a href="tel:0800567567" className="text-malumz-orange hover:underline">
                        0800 567 567
                      </a>
                    </p>
                    <p>
                      <strong>Suicide Crisis:</strong> SMS 31393
                    </p>
                    <p className="text-sm italic mt-4">
                      This movement can wait. Your life can't.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-malumz-brown">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-serif text-3xl font-bold text-white mb-4">
            Building From Johannesburg, For All of South Africa
          </h3>
          <p className="text-white/90 text-lg">
            The pilot Brotherhood Circles launch in 2026.
          </p>
        </div>
      </section>
    </div>
  );
};
