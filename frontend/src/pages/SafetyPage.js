import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const tyrantSigns = [
  'Uses "I paid lobola" to justify controlling behaviour',
  'Quotes the Core Rule to demand obedience instead of service',
  'Isolates members from outside support systems',
  'Punishes vulnerability or emotional expression',
  'Uses Circle attendance as leverage in personal relationships',
  'Refuses to submit to accountability from other facilitators',
  'Dismisses women\'s input as "not understanding the programme"',
  'Creates financial dependency within the Circle',
];

const vettingChecklist = [
  'Completed full 6-month Brotherhood Circle programme',
  'No history of domestic violence or sexual offences',
  'Three community references checked and verified',
  'Police clearance certificate obtained',
  'Understands and accepts the Non-Negotiable rule',
  'Willing to be supervised monthly by a senior facilitator',
  'Completed Dark Room Protocol (self-accountability)',
];

export const SafetyPage = () => {
  const [reportData, setReportData] = useState({ message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/contact`, {
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
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <ShieldAlert size={64} className="text-red-600 mx-auto mb-6" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
            Safety
          </h1>
          <p className="text-lg text-malumz-text-secondary max-w-2xl mx-auto">
            Protecting against weaponisation of the framework. This page exists because power corrupts, and any system built to help men can be twisted to control them.
          </p>
        </div>
      </section>

      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="bg-white border-l-4 border-red-600 rounded-r-xl p-8">
            <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-4">
              The Non-Negotiable
            </h2>
            <p className="text-lg text-malumz-text-secondary leading-relaxed font-semibold">
              "If ANY man uses 'I paid lobola' or the Core Rule to justify abuse, the programme has failed for that man. Remove him."
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle size={28} className="text-red-600" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              The Trained Tyrant Profile
            </h2>
          </div>
          <p className="text-malumz-text-secondary mb-8">
            Warning signs that a facilitator or member is using the teaching to control others. If you recognise these patterns, report immediately.
          </p>
          <div className="space-y-3">
            {tyrantSigns.map((sign, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-red-50 border border-red-100 rounded-lg px-6 py-4"
              >
                <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-malumz-text-secondary">{sign}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-4">
            The Silent Exclusion Guide
          </h2>
          <p className="text-malumz-text-secondary mb-8">
            How to safely remove a dangerous member without confrontation (Rule 38 compliance).
          </p>
          <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-malumz-gold font-bold">1.</span>
              <p className="text-malumz-text-secondary">Document the behaviour privately. Dates, witnesses, specific actions.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-malumz-gold font-bold">2.</span>
              <p className="text-malumz-text-secondary">Consult with at least one other facilitator before acting.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-malumz-gold font-bold">3.</span>
              <p className="text-malumz-text-secondary">Private conversation with the individual. State the concern without accusation.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-malumz-gold font-bold">4.</span>
              <p className="text-malumz-text-secondary">If behaviour continues, remove without group discussion. The group is told: "He has chosen to leave the Circle."</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-malumz-gold font-bold">5.</span>
              <p className="text-malumz-text-secondary">If the person poses a danger to others, report to SAPS immediately. The Circle does not replace the law.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-8">
            Facilitator Vetting Checklist
          </h2>
          <p className="text-malumz-text-secondary mb-8">
            Based on the Dark Room Protocol. No one facilitates a Circle without meeting every requirement.
          </p>
          <div className="space-y-3">
            {vettingChecklist.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-malumz-cream border border-malumz-brown/10 rounded-lg px-6 py-4"
              >
                <CheckCircle2 size={20} className="text-malumz-gold mt-0.5 flex-shrink-0" />
                <p className="text-malumz-text-secondary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-malumz-cream">
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-4 text-center">
            Report a Circle
          </h2>
          <p className="text-center text-malumz-text-secondary mb-8">
            Anonymous form for reporting abusive facilitators or members. Your identity will not be shared.
          </p>
          {submitSuccess ? (
            <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 text-center">
              <CheckCircle2 size={48} className="text-malumz-gold mx-auto mb-4" />
              <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-2">
                Report Received
              </h3>
              <p className="text-malumz-text-secondary">
                Thank you for helping keep the programme safe. We will investigate.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-malumz-brown/10 rounded-xl p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                  Describe the situation (anonymous)
                </label>
                <textarea
                  value={reportData.message}
                  onChange={(e) => setReportData({ message: e.target.value })}
                  required
                  rows="6"
                  placeholder="What happened? Where? When? Include as much detail as you feel comfortable sharing."
                  className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white hover:bg-red-700 rounded-full px-8 py-4 font-semibold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Anonymous Report'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
