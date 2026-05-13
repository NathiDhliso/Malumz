import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { useGSAP } from '@gsap/react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import NotchedSection from '@/components/NotchedSection';
import { BookPurchasePanel } from '@/components/BookPurchasePanel';

/**
 * BookPage — purchase-first layout.
 *
 * Simplified to focus on conversion: a text hero introduces the book,
 * the BookPurchasePanel renders immediately below as the primary action,
 * and a brief chapter preview section follows with scroll-reveal animations.
 *
 * Removed: video hero strip, "Request a Signed Copy" form, separate
 * "Audiobook Access" section, FloatingField component.
 *
 * Feature: conversion-focused-simplification
 *
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 11.2, 12.2
 */

export const BookPage = () => {
  const pageRef = useRef(null);

  // Storytelling animations — sections fade/slide in, with content visible
  // by default so mobile Safari ScrollTrigger stalls never leave the page
  // blank. `gsap.from` animates FROM the offset state back to the element's
  // natural state, so if GSAP never runs, content stays at its natural
  // (visible) position.
  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;

      const headings = page.querySelectorAll("[data-animate='heading']");
      headings.forEach((heading) => {
        ScrollTrigger.create({
          trigger: heading,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.from(heading, {
              opacity: 0,
              x: -40,
              duration: 0.7,
              ease: "power3.out",
              immediateRender: false,
            });
          },
        });
      });

      const previewCards = page.querySelectorAll("[data-animate='preview']");
      previewCards.forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.from(card, {
              opacity: 0,
              y: 30,
              duration: 0.8,
              ease: "power3.out",
              immediateRender: false,
            });
          },
        });
      });

      const purchasePanel = page.querySelector("[data-animate='purchase']");
      if (purchasePanel) {
        ScrollTrigger.create({
          trigger: purchasePanel,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.from(purchasePanel, {
              opacity: 0,
              y: 40,
              duration: 0.9,
              ease: "power3.out",
              immediateRender: false,
            });
          },
        });
      }
    },
    { scope: pageRef }
  );

  const narrativeChapters = [
    { num: 0, title: 'The Birthday Card' },
    { num: 1, title: 'The Bantu Kennel' },
    { num: 2, title: 'The Fire Before Me' },
    { num: 3, title: 'Seek First the Kingdom' },
    { num: 4, title: 'The Floor Beneath the Ladder' },
    { num: 5, title: 'Saints, Gatekeepers and the Overwhelmed' },
    { num: 6, title: 'Five Friends and a Knife' },
    { num: 7, title: 'The Velvet Muzzle' },
    { num: 8, title: 'The Rainbow Trap' },
    { num: 9, title: 'The Second Eviction' },
    { num: 10, title: 'The Blue-Haired Girl' },
    { num: 11, title: 'Reaping What They Planted' },
    { num: 12, title: 'The Soft Cage' },
    { num: 13, title: 'The Dog Who Trained Himself', note: 'Six Trainers reveal' },
    { num: 14, title: 'The First Circle', note: 'Brotherhood Circles model' },
  ];

  const appendices = [
    { letter: 'A', title: 'Mind the Gap Worksheet', note: 'Self-diagnosis' },
    { letter: 'B', title: 'The Rebuild Toolkit', note: 'All named systems per Trainer' },
    { letter: 'C', title: 'Scaling Beyond Yourself', note: 'Phase 2+ infrastructure' },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-e1-bg text-e1-text">
      {/* Simple text hero — title + subtitle (replaces video hero strip) */}
      <NotchedSection
        tone="charcoal"
        className="relative overflow-hidden pt-32 pb-20"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-e1-text mb-6 leading-tight">
            The Dog Trainer
          </h1>
          <p className="font-sans text-lg md:text-xl text-e1-text-muted max-w-2xl mx-auto leading-relaxed">
            A memoir and framework by Nkosinathi Dhliso. The story of growing up across seven schools in post-apartheid South Africa and discovering that his father had been running a six-part training programme his entire life.
          </p>
        </div>
      </NotchedSection>

      {/* Purchase panel — first content section below hero (R99 eBook / R199 audiobook). */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12" data-animate="purchase">
          <BookPurchasePanel />
        </div>
      </section>

      {/* Brief chapter preview section with scroll-reveal animations */}
      <section className="py-24 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl md:text-4xl text-e1-text text-center mb-4" data-animate="heading">
            What's Inside
          </h2>
          <p className="font-sans text-center text-e1-text-muted mb-12">
            15 narrative chapters + 3 appendices of practical tools
          </p>

          <h3 className="font-display text-2xl text-e1-text mb-6">The Story</h3>
          <div className="space-y-3 mb-12">
            {narrativeChapters.map((chapter) => (
              <div
                key={chapter.num}
                className="gs-reveal flex items-center gap-4 bg-e1-bg border border-e1-text-muted/20 rounded-lg px-6 py-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-e1-secondary rounded-full flex items-center justify-center text-e1-bg font-bold text-sm">
                  {chapter.num}
                </div>
                <div className="flex-1">
                  <span className="font-display text-e1-text">{chapter.title}</span>
                  {chapter.note && (
                    <span className="font-sans text-e1-text-muted text-sm ml-2">— {chapter.note}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-display text-2xl text-e1-text mb-6">The Tools</h3>
          <div className="space-y-3">
            {appendices.map((appendix) => (
              <div
                key={appendix.letter}
                className="gs-reveal flex items-center gap-4 bg-e1-bg border border-e1-text-muted/20 rounded-lg px-6 py-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-e1-primary rounded-full flex items-center justify-center text-e1-text font-bold text-sm">
                  {appendix.letter}
                </div>
                <div className="flex-1">
                  <span className="font-display text-e1-text">{appendix.title}</span>
                  <span className="font-sans text-e1-text-muted text-sm ml-2">— {appendix.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free preview section with scroll-reveal animations */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl md:text-4xl text-e1-text text-center mb-4" data-animate="heading">
            Free Preview
          </h2>
          <p className="font-sans text-center text-e1-text-muted mb-12">
            Read Chapter 0 and Chapter 13 before you buy.
          </p>

          <div className="bg-e1-surface border border-e1-text-muted/20 rounded-xl p-8 md:p-12 mb-8" data-animate="preview">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-e1-primary" />
              <h3 className="font-display text-2xl text-e1-primary">
                Chapter 0: The Birthday Card
              </h3>
            </div>
            <div className="font-sans text-e1-text-muted space-y-4 leading-relaxed">
              <p>
                In 2024, I sat in my office and scored myself against a framework I'd developed: The Six Trainers. The result was 21 out of 60.
              </p>
              <p>
                I wasn't depressed. I wasn't surprised. I was finally, for the first time in my life, <em>clear</em>.
              </p>
              <p>
                This book is about those six trainers — the invisible systems that shape a man. Apartheid didn't just take our land and our dignity. It systematically destroyed six training structures that every civilization needs to produce functional men.
              </p>
              <p className="font-semibold text-e1-text">
                The Family Trainer. The Masculine Trainer. The Community Trainer. The Economic Trainer. The Academic Trainer. The Spiritual Trainer.
              </p>
              <p>
                Without them, we're not men. We're wild dogs — surviving, not living.
              </p>
            </div>
          </div>

          <div className="bg-e1-surface border border-e1-text-muted/20 rounded-xl p-8 md:p-12" data-animate="preview">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-e1-primary" />
              <h3 className="font-display text-2xl text-e1-primary">
                Chapter 13: The Dog Who Trained Himself
              </h3>
            </div>
            <div className="font-sans text-e1-text-muted space-y-4 leading-relaxed">
              <p>
                This is the chapter where the Six Trainers framework is formally revealed. Everything before this was the story. This is the system.
              </p>
              <p>
                The full chapter is available in the book. It contains the Mind the Gap scoring methodology, the Trainer-by-Trainer breakdown, and the self-diagnosis tool that starts your rebuild.
              </p>
            </div>
            <div className="mt-6">
              <p className="font-sans text-e1-text-muted text-sm italic">
                Full chapter available in the book.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
