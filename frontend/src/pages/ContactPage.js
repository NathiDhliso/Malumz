import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Mail, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

import { gsap } from '@/lib/gsap';
import MagneticButton from '@/components/MagneticButton';
import { submitContact } from '@/lib/malumzApi';

/**
 * ContactPage editorial form treatment.
 *
 * Renders the same minimal form vocabulary as `<BookPage>`:
 *
 *   - Every primary input renders with a single 1 px bottom border and no
 *     other borders (Requirement 26.1).
 *   - On focus, the associated label tweens to `{ y: -20, scale: 0.8,
 *     color: "#C2491A" }` over 200 ms via `gsap.to`; on blur, if the value
 *     remains empty, the label springs back to its resting position
 *     (Requirements 26.1, 26.2).
 *   - The submit control is wrapped in `<MagneticButton>` so pointer-fine
 *     hover capability leans the button toward the cursor within the shared
 *     60 px magnetic inflation (Requirement 26.3).
 *   - Hovering the submit slides the inline right-arrow glyph `x: 0 → 12`
 *     via `gsap.to` and back on pointer leave (Requirement 26.4 + the 12 px
 *     arrow slide pattern cross-referenced from Requirement 25.5).
 *
 * All existing page copy — hero, form labels, subject options, crisis
 * resources, Johannesburg footer — is preserved byte-for-byte. Only the
 * legacy `malumz-*` tokens and the rounded pill submit have been replaced.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @see Requirements 26.1, 26.2, 26.3, 26.4, 30.3
 */

/**
 * Terracotta `e1-primary` hex used by the label-lift colour vars. Mirrors the
 * token value in `tailwind.config.js` (Requirement 1.2) and the Requirement
 * 26.2 spec text. Declared as a string literal because `gsap.to` accepts CSS
 * colour values verbatim and does not consume Tailwind class names.
 */
const E1_PRIMARY_HEX = '#C2491A';

/**
 * Sand `e1-text-muted` hex used as the label's resting colour. Mirrors the
 * token value in `tailwind.config.js` (Requirement 1.6).
 */
const E1_TEXT_MUTED_HEX = '#907A61';

/**
 * Shared tween vars for the focus → lifted label transition. Extracted into
 * a module-level constant so both the test harness (Property 20) and the
 * focus handler consume the exact same object shape.
 *
 * @see Requirement 26.2
 */
const LABEL_LIFT_VARS = {
  y: -20,
  scale: 0.8,
  color: E1_PRIMARY_HEX,
  duration: 0.2,
  ease: 'power2.out',
};

/**
 * Shared tween vars for the blur → resting label transition.
 */
const LABEL_REST_VARS = {
  y: 0,
  scale: 1,
  color: E1_TEXT_MUTED_HEX,
  duration: 0.2,
  ease: 'power2.out',
};

/**
 * Shared tween vars for the submit arrow slide on hover / leave. The 12 px
 * slide distance is the Requirement 25.5 magic number carried over to the
 * ContactPage submit per Requirement 26.4.
 */
const ARROW_HOVER_VARS = { x: 12, duration: 0.3, ease: 'power2.out' };
const ARROW_REST_VARS = { x: 0, duration: 0.3, ease: 'power2.out' };

/**
 * `<FloatingField>` — editorial label-lift input.
 *
 * Wraps a single `<input>` or `<textarea>` inside a relatively-positioned
 * `<label>` with the visible label rendered as an absolutely-positioned
 * `<span>`. The span sits at the input's baseline when the value is empty
 * and the input is not focused; on focus it tweens up to
 * `{ y: -20, scale: 0.8, color: "#C2491A" }`; on blur it springs back iff
 * the value is still empty so filled fields keep their labels lifted.
 *
 * The control itself renders as a transparent row with only a 1 px
 * `e1-text-muted` bottom border that switches to `e1-primary` on focus —
 * no side, top, or inner borders per Requirement 26.1.
 *
 * @param {object} props
 * @param {"input"|"textarea"} [props.as="input"] - Which native control to
 *   render. Selecting `"textarea"` also renders a `resize-none` handle and
 *   honours the `rows` prop.
 * @param {string} [props.type="text"] - Forwarded to `<input type>` when
 *   `as === "input"`; ignored for textareas.
 * @param {string} props.name - The form-field name.
 * @param {string} props.label - Human-readable label text rendered in the
 *   floating span.
 * @param {string} props.value - Controlled value; drives the blur-spring-back
 *   decision.
 * @param {(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => void} props.onChange
 *   Change handler forwarded to the native control.
 * @param {boolean} [props.required] - Forwarded `required` attribute.
 * @param {string} [props.testId] - `data-testid` on the native control.
 * @param {number} [props.rows] - Row count for the `"textarea"` variant.
 * @returns {JSX.Element}
 */
function FloatingField({
  as = 'input',
  type = 'text',
  name,
  label,
  value,
  onChange,
  required,
  testId,
  rows,
}) {
  const labelRef = useRef(null);

  // `useGSAP` tethers every tween fired from the handlers below to this
  // field's mount lifetime, so unmounting (e.g., when the success state
  // replaces the form) auto-reverts any in-flight label tweens.
  useGSAP(() => {
    // Intentionally empty: tweens are fired imperatively from the focus /
    // blur handlers. Declaring the scope here still causes the library
    // to revert any tweens that target the label span on unmount.
  }, []);

  const handleFocus = () => {
    if (labelRef.current) {
      gsap.to(labelRef.current, LABEL_LIFT_VARS);
    }
  };

  const handleBlur = (event) => {
    if (!labelRef.current) return;
    // Only spring back when the field is genuinely empty — a filled input
    // must keep its label lifted so it does not collide with the user's
    // text (Requirement 26.2 blur clause).
    if (event.target.value === '') {
      gsap.to(labelRef.current, LABEL_REST_VARS);
    }
  };

  const commonClass =
    'w-full bg-transparent border-0 border-b border-e1-text-muted/40 focus:border-e1-primary focus:outline-none focus:ring-0 px-0 py-2 font-sans text-e1-text placeholder-transparent transition-colors';

  return (
    <label className="relative block pt-6">
      <span
        ref={labelRef}
        className="absolute left-0 top-6 pointer-events-none font-sans text-base text-e1-text-muted origin-left"
      >
        {label}
      </span>
      {as === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          data-testid={testId}
          rows={rows}
          className={`${commonClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          data-testid={testId}
          className={commonClass}
        />
      )}
    </label>
  );
}

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

  // Arrow-slide ref for the submit CTA. `useGSAP` scopes any tweens fired
  // against this element to the page's mount lifetime so they are reverted
  // on route change.
  const arrowRef = useRef(null);
  useGSAP(() => {
    // Tweens are fired imperatively from the pointer handlers below.
  }, []);

  const handleArrowEnter = () => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, ARROW_HOVER_VARS);
    }
  };

  const handleArrowLeave = () => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, ARROW_REST_VARS);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContact(formData);
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
    <div className="min-h-screen bg-e1-bg text-e1-text">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-e1-bg" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-e1-text mb-6">
            Get In Touch
          </h1>
          <p className="font-sans text-xl text-e1-text-muted max-w-2xl mx-auto">
            Have questions about the book, Brotherhood Circles, or partnerships? We respond within 48 hours.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-e1-bg" data-testid="contact-form-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-display text-3xl font-bold text-e1-text mb-8">
                Send Us a Message
              </h2>

              {submitSuccess ? (
                <div
                  className="bg-e1-surface border-l-4 border-e1-highlight p-8 rounded-lg"
                  data-testid="contact-success-message"
                >
                  <CheckCircle2 size={48} className="text-e1-highlight mb-4" />
                  <h3 className="font-display text-2xl font-bold text-e1-text mb-2">
                    Message Received!
                  </h3>
                  <p className="text-e1-text-muted">
                    Thank you for reaching out. We'll respond to your message within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <FloatingField
                    name="name"
                    label="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    testId="contact-name-input"
                  />

                  <FloatingField
                    type="email"
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    testId="contact-email-input"
                  />

                  {/* Subject select — label renders statically above the
                      control because `<select>` always carries a value and
                      the label-lift pattern only applies to empty-valued
                      inputs (Requirements 26.1, 26.2). */}
                  <div className="block pt-2">
                    <span className="block font-sans text-sm text-e1-text-muted mb-2">
                      Subject
                    </span>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      data-testid="contact-subject-select"
                      className="w-full bg-transparent border-0 border-b border-e1-text-muted/40 focus:border-e1-primary focus:outline-none focus:ring-0 px-0 py-2 font-sans text-e1-text"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option} value={option} className="bg-e1-bg text-e1-text">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <FloatingField
                    as="textarea"
                    name="message"
                    label="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    testId="contact-message-input"
                  />

                  <div className="pt-4">
                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      data-testid="contact-submit-button"
                      onMouseEnter={handleArrowEnter}
                      onMouseLeave={handleArrowLeave}
                      className="inline-flex items-center gap-4 font-display text-xl uppercase tracking-wide text-e1-text border-b-2 border-e1-primary pb-2 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Sending' : 'Send Message'}</span>
                      <span
                        ref={arrowRef}
                        className="inline-flex text-e1-primary"
                        aria-hidden="true"
                      >
                        <ArrowRight size={22} />
                      </span>
                    </MagneticButton>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-display text-3xl font-bold text-e1-text mb-8">
                Contact Information
              </h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-e1-highlight/10 rounded-full flex items-center justify-center">
                    <Mail className="text-e1-highlight" size={24} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-e1-text mb-2">
                      Email
                    </h3>
                    <a
                      href="mailto:nkosinathi.dhliso@gmail.com"
                      className="text-e1-primary hover:underline"
                    >
                      nkosinathi.dhliso@gmail.com
                    </a>
                    <p className="text-e1-text-muted text-sm mt-1">
                      We respond within 48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-e1-highlight/10 rounded-full flex items-center justify-center">
                    <MapPin className="text-e1-highlight" size={24} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-e1-text mb-2">
                      Location
                    </h3>
                    <p className="text-e1-text-muted">
                      Johannesburg, Gauteng<br />
                      South Africa
                    </p>
                  </div>
                </div>

                {/* Crisis Resources */}
                <div className="bg-e1-surface border-l-4 border-e1-primary p-6 rounded-lg mt-12">
                  <h3 className="font-display text-xl font-bold text-e1-text mb-4">
                    In Crisis? Get Help Now
                  </h3>
                  <div className="space-y-3 text-e1-text-muted">
                    <p>
                      <strong className="text-e1-text">SADAG (24/7):</strong>{' '}
                      <a href="tel:0800567567" className="text-e1-primary hover:underline">
                        0800 567 567
                      </a>
                    </p>
                    <p>
                      <strong className="text-e1-text">Suicide Crisis:</strong> SMS 31393
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

      <section className="py-16 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-display text-3xl font-bold text-e1-text mb-4">
            Building From Johannesburg, For All of South Africa
          </h3>
          <p className="text-e1-text-muted text-lg">
            The pilot Brotherhood Circles launch in 2026.
          </p>
        </div>
      </section>
    </div>
  );
};
