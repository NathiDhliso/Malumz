import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { ArrowRight, BookOpen, Users, Compass } from 'lucide-react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import HeroSection from '@/components/home/HeroSection';
import NotchedSection from '@/components/NotchedSection';
import AnimatedHeadline from '@/components/home/AnimatedHeadline';
import AnimatedNumber from '@/components/home/AnimatedNumber';

/**
 * HomePage — single-page narrative.
 *
 * Hero + three preview sections (About, Book, Join) + closing testimonial.
 * Each preview has an anchor id and a deep-dive CTA. Animations are
 * built on gsap core + ScrollTrigger only (no premium plugins) and
 * default to visible content if a tween fails to fire.
 *
 * Engagement layer:
 *  - Word-by-word entrance on each section heading via <AnimatedHeadline>
 *  - Number counters on the 200 / 15 / 3 / 6 / R99 stats
 *  - Subtle parallax on the Book "What's inside" sidebar
 *  - Hover lift on the Join step cards (pointer-fine only)
 *  - Top scroll progress bar (mounted in App)
 */
export const HomePage = () => {
  const pageRef = useRef(null);

  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;

      // Body / aside / cta entrance per section. Headings handle their
      // own word stagger via <AnimatedHeadline triggerOnScroll />.
      //
      // Lock initial states synchronously at mount so the elements never
      // paint at their natural state before the scroll-triggered reveal —
      // otherwise the user sees a flash when the section enters viewport.
      const sections = root.querySelectorAll('[data-narrative-section]');
      sections.forEach((section) => {
        const body = section.querySelector('[data-narrative-body]');
        const aside = section.querySelector('[data-narrative-aside]');
        const cta = section.querySelector('[data-narrative-cta]');

        if (aside) gsap.set(aside, { opacity: 0, x: 24 });
        if (body) gsap.set(body.children, { opacity: 0, y: 20 });
        if (cta) gsap.set(cta, { opacity: 0, y: 16 });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            if (aside) {
              tl.to(aside, {
                opacity: 1,
                x: 0,
                duration: 0.7,
                ease: 'power3.out',
              });
            }
            if (body) {
              tl.to(
                body.children,
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.5,
                  stagger: 0.08,
                  ease: 'power2.out',
                },
                aside ? '-=0.4' : 0
              );
            }
            if (cta) {
              tl.to(
                cta,
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.4,
                  ease: 'power2.out',
                },
                '-=0.2'
              );
            }
          },
        });
      });

      // Subtle parallax on the Book sidebar (desktop only — gated by the
      // matchMedia inside ScrollTrigger).
      const bookAside = root.querySelector('[data-parallax="book-aside"]');
      if (bookAside) {
        gsap.to(bookAside, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: bookAside,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Hover lift on Join step cards. Skip on coarse pointers.
      const fineHover =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (fineHover) {
        const cards = root.querySelectorAll('[data-hover-lift]');
        cards.forEach((card) => {
          const onEnter = () =>
            gsap.to(card, {
              y: -6,
              boxShadow: '0 20px 40px -20px rgba(194, 73, 26, 0.25)',
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          const onLeave = () =>
            gsap.to(card, {
              y: 0,
              boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
              duration: 0.4,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          card.addEventListener('pointerenter', onEnter);
          card.addEventListener('pointerleave', onLeave);
        });
      }
    },
    { scope: pageRef }
  );

  // Mobile-Safari safety net. ScrollTrigger is rAF-driven and can stall during
  // scroll gestures or tab visibility changes, leaving narrative sections
  // stuck at opacity 0. After 2 seconds, force every locked element back to
  // its natural state so the page cannot be permanently invisible.
  useEffect(() => {
    const timer = setTimeout(() => {
      const root = pageRef.current;
      if (!root) return;
      const sections = root.querySelectorAll('[data-narrative-section]');
      sections.forEach((section) => {
        const aside = section.querySelector('[data-narrative-aside]');
        const body = section.querySelector('[data-narrative-body]');
        const cta = section.querySelector('[data-narrative-cta]');
        const targets = [];
        if (aside) targets.push(aside);
        if (body) targets.push(...body.children);
        if (cta) targets.push(cta);
        if (!targets.length) return;
        gsap.to(targets, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.3,
          overwrite: 'auto',
        });
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
              <AnimatedNumber
                to={200}
                duration={2}
                className="font-display text-e1-primary text-7xl md:text-8xl leading-none tabular-nums block"
                ariaLabel="200 men in the 2026–2030 pilot"
              />
              <p className="mt-3 font-sans text-e1-text-muted text-sm uppercase tracking-wider">
                Men in the 2026–2030 pilot
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <AnimatedHeadline
                as="h2"
                text="Seven schools. One framework."
                triggerOnScroll
                stagger={0.05}
                duration={0.6}
                className="font-display text-3xl md:text-4xl text-e1-text leading-tight"
              />
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
              <div data-narrative-cta className="flex items-center gap-4">
                <Link
                  to="/book"
                  className="group inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-5 py-2.5 bg-e1-primary text-white rounded-full hover:bg-[#9f2f0b] transition-colors"
                >
                  Buy the Book
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/about"
                  className="font-sans text-xs text-e1-text-muted hover:text-e1-primary transition-colors"
                >
                  Full story →
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
              <AnimatedHeadline
                as="h2"
                text="The Dog Trainer"
                triggerOnScroll
                stagger={0.08}
                duration={0.7}
                className="font-display text-3xl md:text-4xl text-e1-text leading-tight"
              />
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
              <div data-narrative-cta className="flex items-center gap-4 mt-2">
                <Link
                  to="/book"
                  className="group inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-6 py-3 bg-e1-primary text-white rounded-full hover:bg-[#9f2f0b] transition-colors"
                >
                  Buy the book
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/book"
                  className="font-sans text-xs text-e1-text-muted hover:text-e1-primary transition-colors"
                >
                  Free chapter →
                </Link>
              </div>
            </div>

            <aside
              data-narrative-aside
              data-parallax="book-aside"
              className="md:col-span-2 bg-e1-bg border border-e1-text-muted/20 rounded-2xl p-6 md:p-8 will-change-transform"
            >
              <p className="font-sans text-xs uppercase tracking-[0.18em] text-e1-text-muted mb-4">
                What's inside
              </p>
              <ul className="space-y-3 font-sans text-sm text-e1-text">
                <li className="flex items-baseline gap-3">
                  <AnimatedNumber
                    to={15}
                    duration={1.2}
                    className="text-e1-primary font-display text-lg tabular-nums"
                  />
                  <span>Narrative chapters</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <AnimatedNumber
                    to={3}
                    duration={0.8}
                    className="text-e1-primary font-display text-lg tabular-nums"
                  />
                  <span>Practical toolkits</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <AnimatedNumber
                    to={6}
                    duration={0.9}
                    className="text-e1-primary font-display text-lg tabular-nums"
                  />
                  <span>Trainers, mapped end-to-end</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <AnimatedNumber
                    to={99}
                    prefix="R"
                    duration={1.4}
                    className="text-e1-primary font-display text-lg tabular-nums"
                  />
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
            <AnimatedHeadline
              as="h2"
              text="Twenty men. Six months. One forge."
              triggerOnScroll
              stagger={0.05}
              duration={0.6}
              className="font-display text-3xl md:text-4xl text-e1-text leading-tight max-w-2xl mx-auto"
            />
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
                data-hover-lift
                className="bg-e1-surface border border-e1-text-muted/15 rounded-xl p-6 flex flex-col will-change-transform"
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
              className="group inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-6 py-3 bg-e1-primary text-white rounded-full hover:bg-[#9f2f0b] transition-colors"
            >
              Join a Circle
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
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
