import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { submitContact } from '@/lib/malumzApi';
import NotchedSection from '@/components/NotchedSection';
import MagneticButton from '@/components/MagneticButton';

/**
 * SafetyPage — Crisis essentials page.
 *
 * Streamlined to focus on immediate crisis help: emergency numbers,
 * SADAG provincial link, and anonymous reporting. All facilitator
 * training content (tyrant profile, vetting checklist, exclusion guide)
 * has been removed per conversion-focused simplification.
 *
 * E1 editorial inheritance is preserved: Fraunces display / DM Sans
 * typography, `<NotchedSection>` with alternating `tone` values,
 * `.gs-reveal` classes for global Reveal Batch participation.
 *
 * Feature: conversion-focused-simplification
 * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.1, 11.5, 12.4
 */

const emergencyNumbers = [
  { name: 'Lifeline', number: '0861 322 322', available: '24/7' },
  { name: 'SADAG', number: '0800 567 567', available: '24/7' },
  { name: 'GBV Command Centre', number: '0800 428 428', available: '24/7' },
];

export const SafetyPage = () => {
  const [reportData, setReportData] = useState({ message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContact({
        name: 'Anonymous Report',
        email: 'anonymous@malumz.co.za',
        subject: 'Safety Report - Anonymous',
        message: reportData.message,
      });
      setSubmitSuccess(true);
      setReportData({ message: '' });
    } catch (error) {
      console.error('Report error:', error);
      alert('Something went wrong. Please email nkosinathi.dhliso@gmail.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-e1-bg">
      {/* Crisis Hero — emergency CTA + Lifeline number */}
      <NotchedSection tone="sienna" className="pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <AlertTriangle size={64} className="text-red-400 mx-auto mb-6" />
          <h1 className="gs-reveal font-display text-4xl lg:text-5xl font-bold text-e1-text mb-4">
            You Are Not Alone
          </h1>
          <p className="text-lg text-e1-text-muted mb-4 max-w-2xl mx-auto">
            If you are about to hurt someone or yourself, call Lifeline now. The Circle can wait. Your life cannot.
          </p>
          <a
            href="tel:0861322322"
            className="inline-flex items-center gap-3 bg-red-600 text-white rounded-full px-10 py-5 text-xl font-bold shadow-lg hover:bg-red-700 transition-all"
          >
            <Phone size={28} />
            Call Lifeline: 0861 322 322
          </a>
        </div>
      </NotchedSection>

      {/* Emergency Numbers Grid */}
      <section className="py-16 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-8 text-center">
            Emergency Numbers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyNumbers.map((item) => (
              <a
                key={item.name}
                href={`tel:${item.number.replace(/\s/g, '')}`}
                className="gs-reveal flex items-center gap-4 bg-e1-surface border border-e1-text/10 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Phone size={24} className="text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-e1-text">{item.name}</p>
                  <p className="text-e1-primary font-semibold text-lg">{item.number}</p>
                  <p className="text-e1-text-muted text-sm">{item.available}</p>
                </div>
              </a>
            ))}
          </div>

          {/* SADAG provincial resources link */}
          <p className="gs-reveal text-center text-e1-text-muted mt-8">
            For provincial-specific resources, visit{' '}
            <a
              href="https://www.sadag.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-e1-primary underline hover:text-e1-highlight transition-colors"
            >
              www.sadag.org
            </a>
          </p>
        </div>
      </section>

      {/* Anonymous Report Form */}
      <NotchedSection tone="sienna" className="py-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-4 text-center">
            Report a Circle
          </h2>
          <p className="text-center text-e1-text-muted mb-8">
            Anonymous form for reporting abusive facilitators or members. Your identity will not be shared.
          </p>
          {submitSuccess ? (
            <div className="bg-e1-surface border border-e1-text/10 rounded-xl p-8 text-center">
              <CheckCircle2 size={48} className="text-e1-highlight mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-e1-text mb-2">
                Report Received
              </h3>
              <p className="text-e1-text-muted">
                Thank you for helping keep the programme safe. We will investigate.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-e1-surface border border-e1-text/10 rounded-xl p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-e1-text-muted mb-2">
                  Describe the situation (anonymous)
                </label>
                <textarea
                  value={reportData.message}
                  onChange={(e) => setReportData({ message: e.target.value })}
                  required
                  rows="6"
                  placeholder="What happened? Where? When? Include as much detail as you feel comfortable sharing."
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all resize-none"
                />
              </div>
              <MagneticButton
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-e1-text hover:bg-red-700 rounded-full px-8 py-4 font-semibold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Anonymous Report'}
              </MagneticButton>
            </form>
          )}
        </div>
      </NotchedSection>
    </div>
  );
};
