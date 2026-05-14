import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { ArrowRight, BookOpen, Users, Compass } from 'lucide-react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import HeroSection from '@/components/home/HeroSection';
import NotchedSection from '@/components/NotchedSection';

/**
 * HomePage — single-page narrative.
 *
 * The site is now structured as one storytelling page with three preview
 * sections (About → Book → Join) plus the hero. Each preview section
 * gets an `id` so the Navigation's anchor links scroll to it, and a
 * "deep dive" CTA at the bottom that routes to the full standalone page
 * for users who want every detail.
 *
 * Why one page: most visitors will not click around a four-page IA.
 * They will scroll. The previews carry the conversion CTAs (Buy the
 * book / Join a circle) and the deep-dive routes stay available for
 * direct links, share-targets, and SEO.
 *
 * Animations use `gsap.from` with `immediateRender: false` so content
 * is visible by default if a ScrollTrigger ever stalls.
 */
export const HomePage = () => {
  const pageRef = useRef(null);

  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;

      const sections = root.querySelectorAll('[data-narrative-section]');
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            const heading = section.querySelector('[data-narrative-heading]');
            const body = section.querySelector('[data-narrative-body]');
            const aside = section.querySelector('[data-narrative-aside]');
            const cta = section.querySelector('[data-narrative-cta]');

            const tl = gsap.timeline();
            if (heading) {
              tl.from(heading, {
                opacity: 0,
                y: 24,
                duration: 0.6,
                ease: 'power3.out',
                immediateRender: false,
              });
            }
            if (aside) {
              tl.from(
                aside,
                {
                  opacity: 0,
                  x: 24,
                  duration: 0.7,
                  ease: 'power3.out',
                  immediateRender: false,
                },
                '-=0.4'
              );
            }
            if (body) {
              tl.from(
                body,
                {
                  opacity: 0,
                  y: 20,
                  duration: 0.5,
                  ease: 'power2.out',
                  immediateRender: false,
                },
                '-=0.4'
              );
            }
            if (cta) {
              tl.from(
                cta,
                {
                  opacity: 0,
                  y: 16,
                  duration: 0.4,
                  ease: 'power2.out',
                  immediateRender: false,
                },
                '-=0.3'
              );
            }
          },
        });
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-e1-bg">
      <HeroSection />

      {/* About preview ------------------------------------------------- */}
      <section
        id="about"
        data-narrative-section
        className="py-24 bg-e1-surface scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div data-narrative-aside className="md:sticky md:top-32">
              <div className="flex items-center gap-3 mb-4 text-e1-primary">
                <Compass size={20} aria-hidden="true" />
                <span className="font-sans text-xs uppercase tracking-[0.18em]">
                  About
                </span>
              </div>
              <div className="font-display text-e1-primary text-7xl md:text-8xl leading-none tabular-nums">
                200
              </div>
              <p className="mt-3 font-sans text-e1-text-muted text-sm uppercase tracking-wider">
                Men in the 2026–2030 pilot
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <h2
                data-narrative-heading
                className="font-display text-3xl md:text-4xl text-e1-text leading-tight"
              >
                Seven schools. One framework.
              </h2>
              <div
                data-narrative-body
                className="space-y-4 font-sans text-e1-text-muted text-base md:text-lg leading-relaxed"
              >
                <p>
                  Malumz is the work of Nkosinathi Dhliso. Born in late 1991,
                  raised across seven schools in post-apartheid South Africa,
                  he spent thirty years asking the same question: what
                  exactly was missing in how we were trained to be men?
                </p>
                <p>
                  The Six Trainers — Family, Masculine, Community, Economic,
                  Academic, Spiritual — name what was missing and map the
                  path forward. The book tells the story. Brotherhood
                  Circles run the practice.
                </p>
              </div>
              <div data-narrative-cta>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider text-e1-primary border-b border-e1-primary pb-1 hover:gap-3 transition-all"
                >
                  Read the full story
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book preview -------------------------------------------------- */}
      <NotchedSection
        as="section"
        tone="charcoal"
        className="py-24 scroll-mt-24"
        id="book"
        data-narrative-section
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-3 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-e1-primary">
                <BookOpen size={20} aria-hidden="true" />
                <span className="font-sans text-xs uppercase tracking-[0.18em]">
                  The book
                </span>
              </div>
              <h2
                data-narrative-heading
                className="font-display text-3xl md:text-4xl text-e1-text leading-tight"
              >
                The Dog Trainer
              </h2>
              <div
                data-narrative-body
                className="space-y-4 font-sans text-e1-text-muted text-base md:text-lg leading-relaxed"
              >
                <p>
                  A memoir and a framework. Fifteen narrative chapters trace
                  the journey from "wild dog" to trained man. Three
                  appendices ship the practical tools — the Mind the Gap
                  Worksheet, the Rebuild Toolkit, and the Scaling guide.
                </p>
                <p className="font-display italic text-e1-text">
                  "Apartheid didn't just take our land. It systematically
                  destroyed six training structures every civilisation
                  needs to produce functional men."
                </p>
              </div>
              <div data-narrative-cta className="flex flex-wrap gap-4 mt-2">
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-6 py-3 bg-e1-primary text-white rounded-full hover:bg-[#9f2f0b] transition-colors"
                >
                  Buy the book
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-6 py-3 border border-e1-text-muted text-e1-text-muted rounded-full hover:bg-e1-text-muted/10 transition-colors"
                >
                  Read a free chapter
                </Link>
              </div>
            </div>

            <aside
              data-narrative-aside
              className="md:col-span-2 bg-e1-bg border border-e1-text-muted/20 rounded-2xl p-6 md:p-8"
            >
              <p className="font-sans text-xs uppercase tracking-[0.18em] text-e1-text-muted mb-4">
                What's inside
              </p>
              <ul className="space-y-3 font-sans text-sm text-e1-text">
                <li className="flex items-baseline gap-3">
                  <span className="text-e1-primary font-display text-lg">15</span>
                  <span>Narrative chapters</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="text-e1-primary font-display text-lg">3</span>
                  <span>Practical toolkits</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="text-e1-primary font-display text-lg">6</span>
                  <span>Trainers, mapped end-to-end</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="text-e1-primary font-display text-lg">R99</span>
                  <span>eBook · Audiobook free with donation</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </NotchedSection>

      {/* Join preview -------------------------------------------------- */}
      <section
        id="join"
        data-narrative-section
        className="py-24 bg-e1-bg scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-e1-primary mb-4">
              <Users size={20} aria-hidden="true" />
              <span className="font-sans text-xs uppercase tracking-[0.18em]">
                Brotherhood Circles
              </span>
            </div>
            <h2
              data-narrative-heading
              className="font-display text-3xl md:text-4xl text-e1-text leading-tight max-w-2xl mx-auto"
            >
              Twenty men. Six months. One forge.
            </h2>
          </div>

          <div
            data-narrative-body
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            {[
              {
                k: '01',
                title: 'Weekly meetings',
                body: 'Twenty men gather every week. Honest conversation, no spectators.',
              },
              {
                k: '02',
                title: 'Six dimensions',
                body: 'You work through every Trainer in turn. The book is the syllabus.',
              },
              {
                k: '03',
                title: 'Mutual accountability',
                body: 'No facilitator above the rules. Standards before personalities.',
              },
            ].map((step) => (
              <div
                key={step.k}
                className="bg-e1-surface border border-e1-text-muted/15 rounded-xl p-6 flex flex-col"
              >
                <p className="font-display text-e1-primary text-2xl mb-3">{step.k}</p>
                <h3 className="font-display text-lg text-e1-text mb-2">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-e1-text-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div data-narrative-cta className="text-center">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-6 py-3 bg-e1-primary text-white rounded-full hover:bg-[#9f2f0b] transition-colors"
            >
              Join a Circle
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <p className="mt-4 font-sans text-xs text-e1-text-muted">
              Three fields. We respond within 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Single testimonial — closing social proof ---------------------- */}
      <NotchedSection tone="sienna" className="py-20">
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
