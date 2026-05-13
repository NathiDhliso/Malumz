import { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { submitContact } from '@/lib/malumzApi';
import NotchedSection from '@/components/NotchedSection';
import MagneticButton from '@/components/MagneticButton';

/**
 * JoinPage — Simplified 3-field interest form.
 *
 * Radically simplified from the original multi-section page to a single
 * interest form with Name, Email, and City/Area fields. Removes model
 * selection, 7-step process, and starter pack download. Retains the E1
 * editorial token palette, `.gs-reveal` scroll participation, and the
 * `submitContact` API integration.
 *
 * Feature: conversion-focused-simplification
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 11.3, 12.3
 */

export const JoinPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        subject: 'Brotherhood Circle Interest',
        message: `Location: ${formData.location}`,
      });
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-e1-bg">
      <NotchedSection tone="charcoal" className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Users size={64} className="text-e1-highlight mx-auto mb-6" />
          <h1 className="gs-reveal font-display text-4xl lg:text-5xl font-bold text-e1-text mb-4">
            Join a Brotherhood Circle
          </h1>
          <p className="text-lg text-e1-text-muted max-w-2xl mx-auto">
            A Brotherhood Circle is a group of men who meet weekly to rebuild themselves — together, through honest conversation and mutual accountability.
          </p>
        </div>
      </NotchedSection>

      <section className="py-20 bg-e1-bg">
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:px-12">
          {submitSuccess ? (
            <div className="bg-e1-surface border border-e1-text/10 rounded-xl p-8 text-center">
              <CheckCircle2 size={48} className="text-e1-highlight mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-e1-text mb-2">
                Interest Received
              </h3>
              <p className="text-e1-text-muted mb-6">
                We'll be in touch within 48 hours to help you get started.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-e1-primary font-medium hover:underline"
              >
                Submit another interest
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-e1-surface border border-e1-text/10 rounded-xl p-8 space-y-6">
              <div>
                <label htmlFor="join-name" className="block text-sm font-medium text-e1-text-muted mb-2">
                  Name
                </label>
                <input
                  id="join-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="join-email" className="block text-sm font-medium text-e1-text-muted mb-2">
                  Email
                </label>
                <input
                  id="join-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="join-location" className="block text-sm font-medium text-e1-text-muted mb-2">
                  City/Area
                </label>
                <input
                  id="join-location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Soweto, Lawley Ext 3"
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                />
              </div>
              <MagneticButton
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-e1-primary text-e1-text hover:bg-e1-primary/90 rounded-full px-8 py-4 font-semibold text-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </MagneticButton>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
