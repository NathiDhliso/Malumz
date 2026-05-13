import HeroSection from '@/components/home/HeroSection';
import NotchedSection from '@/components/NotchedSection';

/**
 * HomePage — conversion-focused landing page.
 *
 * Renders the hero section with dual CTAs ("Buy the Book" + "Join a Circle")
 * and a visible "I Need Help" crisis button, followed by a single social
 * proof testimonial. All filler content (Marquee, StoryBridge,
 * TrainerConnector, HorizontalTrainers, PullQuote, ScrollIndicator) has been
 * removed per the conversion-focused simplification spec.
 *
 * The parallax hero effect and scroll reveal animations are retained on
 * remaining content.
 *
 * Feature: conversion-focused-simplification
 * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 9.1, 9.2, 11.1, 12.1
 */
export const HomePage = () => {
  return (
    <div className="min-h-screen bg-e1-bg">
      <HeroSection />

      {/* Single testimonial / social proof — Requirement 4.4 */}
      <NotchedSection tone="charcoal" className="py-20">
        <div className="gs-reveal max-w-2xl mx-auto text-center px-6">
          <blockquote className="font-display text-e1-text text-2xl md:text-3xl italic leading-relaxed">
            "18 months later: 37/60. Married. Building. Training others."
          </blockquote>
          <cite className="mt-4 block font-sans text-e1-text-muted text-sm uppercase tracking-wider not-italic">
            — Nathi Dhliso
          </cite>
        </div>
      </NotchedSection>
    </div>
  );
};

export default HomePage;
