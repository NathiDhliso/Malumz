import { useRef, useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ST } from "@/lib/motion";
import MagneticButton from "@/components/MagneticButton";
import { submitContact } from "@/lib/malumzApi";
import { reportError, reportEvent } from "@/lib/telemetry";

/**
 * AboutPage — Conversion-focused simplification.
 *
 * Renders:
 *   Hero title →
 *   Two-column band with a large numeric counter on the left and
 *   pull-quote paragraphs (founder story, max 3) on the right →
 *   Contact form at bottom.
 *
 * ## Animations
 *
 * **Counter.** The left column hosts a single large numeric readout.
 * A `ScrollTrigger` with `start: ST.counterStart` fires once; its
 * `onEnter` callback runs a GSAP tween from 0 → COUNTER_TARGET.
 *
 * **Pull-quote paragraphs.** Each paragraph animates from
 * `{ opacity: 0, y: 40 }` to `{ opacity: 1, y: 0 }` via
 * `ScrollTrigger.batch`.
 *
 * Feature: conversion-focused-simplification
 */

/** Counter target sourced from the preserved "200 Men in the 2026–2030 pilot" stat. */
const COUNTER_TARGET = 200;
const COUNTER_LABEL = "Men in the 2026–2030 pilot";

/**
 * Narrative paragraphs rendered in the right column (founder story).
 * Animated as whole elements via ScrollTrigger.batch.
 */
const PULL_QUOTE_PARAGRAPHS = [
  "Every man carries the imprint of those who raised him — and those who didn't. The Six Trainers framework names what was missing and maps the path forward.",
  "The Dog Trainer is a memoir and framework. It tells the story of growing up across seven schools in post-apartheid South Africa and formalises the Six Trainers — the six dimensions every man needs to rebuild.",
  "Brotherhood Circles are the practice: 20 men meet weekly for 6 months to rebuild themselves across all six dimensions. The book is the constitution. The Circle is the forge.",
];

/**
 * Terracotta `e1-primary` hex used by the label-lift colour vars.
 */
const E1_PRIMARY_HEX = '#C2491A';

/**
 * Sand `e1-text-muted` hex used as the label's resting colour.
 */
const E1_TEXT_MUTED_HEX = '#6B5B4F';

const LABEL_LIFT_VARS = {
  y: -20,
  scale: 0.8,
  color: E1_PRIMARY_HEX,
  duration: 0.2,
  ease: 'power2.out',
};

const LABEL_REST_VARS = {
  y: 0,
  scale: 1,
  color: E1_TEXT_MUTED_HEX,
  duration: 0.2,
  ease: 'power2.out',
};

const ARROW_HOVER_VARS = { x: 12, duration: 0.3, ease: 'power2.out' };
const ARROW_REST_VARS = { x: 0, duration: 0.3, ease: 'power2.out' };

const subjectOptions = [
  'General Inquiry',
  'Book Question',
  'Brotherhood Circle Question',
  'Research Partnership',
  'Corporate / Government Partnership',
  'Media Request',
  'Safety Report',
];

/**
 * `<FloatingField>` — editorial label-lift input.
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

  useGSAP(() => {}, []);

  const handleFocus = () => {
    if (labelRef.current) {
      gsap.to(labelRef.current, LABEL_LIFT_VARS);
    }
  };

  const handleBlur = (event) => {
    if (!labelRef.current) return;
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

export const AboutPage = () => {
  const pageRef = useRef(null);
  const counterRef = useRef(null);
  const paragraphsContainerRef = useRef(null);

  // Contact form state — preserves shape { name, email, subject, message }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Arrow-slide ref for the submit CTA
  const arrowRef = useRef(null);

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
    setSubmitError('');
    try {
      await submitContact(formData);
      reportEvent('contact_submit_success', { subject: formData.subject });
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      reportError(error, { source: 'AboutPage.submit' });
      setSubmitError(
        "We couldn't send that. Please try again, or email nkosinathi.dhliso@gmail.com directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(
    () => {
      const counterEl = counterRef.current;
      const paragraphEls = paragraphsContainerRef.current
        ? Array.from(paragraphsContainerRef.current.querySelectorAll("[data-pull-quote]"))
        : [];

      if (!counterEl || paragraphEls.length === 0) {
        return undefined;
      }

      // --- Counter animation (always plays) --------------------------------
      ScrollTrigger.create({
        trigger: counterEl,
        start: ST.counterStart,
        once: true,
        onEnter: () => {
          const counterState = { v: 0 };
          gsap.to(counterState, {
            v: COUNTER_TARGET,
            snap: { value: 1 },
            duration: 2,
            ease: "power1.out",
            onUpdate: () => {
              counterEl.textContent = String(Math.round(counterState.v));
            },
            onComplete: () => {
              counterEl.textContent = String(COUNTER_TARGET);
            },
          });
        },
      });

      // --- Pull-quote paragraphs (whole-element reveal) --------------------
      gsap.set(paragraphEls, { opacity: 0, y: 40 });
      ScrollTrigger.batch(paragraphEls, {
        start: "top 70%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
          }),
      });
    },
    { scope: pageRef },
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-e1-bg text-e1-text">
      {/* ------------------------------------------------------------------
          Hero title band
          ------------------------------------------------------------------ */}
      <section className="pt-32 pb-16 bg-e1-surface gs-reveal">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-display text-e1-text text-5xl md:text-6xl lg:text-7xl leading-none mb-6">
            About
          </h1>
          <p className="font-sans text-e1-text-muted text-lg md:text-xl uppercase tracking-wider">
            Nkosinathi Dhliso. Born late December 1991. Seven schools. The full journey.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Two-column band: counter (left) + pull-quote paragraphs (right)
          — Founder story (max 3 paragraphs) with counter animation.
          ------------------------------------------------------------------ */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div className="flex flex-col items-start md:sticky md:top-32">
              <div
                ref={counterRef}
                className="font-display text-e1-primary text-8xl md:text-9xl leading-none tabular-nums"
                aria-label={`${COUNTER_TARGET} ${COUNTER_LABEL}`}
              >
                0
              </div>
              <div
                className="mt-4 font-sans text-e1-text-muted text-sm uppercase tracking-wider"
                aria-hidden="true"
              >
                {COUNTER_LABEL}
              </div>
            </div>

            <div ref={paragraphsContainerRef} className="flex flex-col gap-10">
              {PULL_QUOTE_PARAGRAPHS.map((paragraph, i) => (
                <p
                  key={i}
                  data-pull-quote
                  className="font-display italic text-e1-text text-2xl md:text-3xl leading-snug gs-reveal"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Contact form — primary action for the About page.
          ------------------------------------------------------------------ */}
      <section className="py-24 bg-e1-bg" id="contact" data-testid="contact-form-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="gs-reveal">
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

                  {/* Subject select */}
                  <div className="block pt-2">
                    <label htmlFor="contact-subject" className="block font-sans text-sm text-e1-text-muted mb-2">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
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
                  {submitError && (
                    <p
                      role="alert"
                      className="mt-4 text-sm text-e1-primary bg-e1-primary/10 border border-e1-primary/30 rounded-lg px-4 py-3"
                    >
                      {submitError}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="gs-reveal">
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
