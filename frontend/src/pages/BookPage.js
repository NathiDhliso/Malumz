import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import NotchedSection from '@/components/NotchedSection';
import { BookPurchasePanel } from '@/components/BookPurchasePanel';

/**
 * BookPage — purchase-first, minimal layout.
 *
 * Structure:
 *   1. Text hero (title + one-line subtitle)
 *   2. BookPurchasePanel (the conversion)
 *   3. Compact "What's inside" stat block (15 / 3 / 6 — no full TOC)
 *   4. One free chapter excerpt (Chapter 0 only — the hook)
 *   5. Closing "Buy the Book" CTA so the user doesn't scroll back up
 *
 * Everything else (full 15-chapter TOC, appendix list, Chapter 13
 * excerpt) has been removed to reduce cognitive load and keep the
 * buy button close to the content.
 */

export const BookPage = () => {
  const pageRef = useRef(null);

  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;

      const sections = root.querySelectorAll('[data-animate]');
      sections.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.from(el, {
              opacity: 0,
              y: 30,
              duration: 0.7,
              ease: 'power3.out',
              immediateRender: false,
            });
          },
        });
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-e1-bg text-e1-text">
      {/* Text hero */}
      <NotchedSection tone="charcoal" className="relative overflow-hidden pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-e1-text mb-4 leading-tight">
            The Dog Trainer
          </h1>
          <p className="font-sans text-lg text-e1-text-muted max-w-xl mx-auto">
            A memoir and framework by Nkosinathi Dhliso.
          </p>
        </div>
      </NotchedSection>

      {/* Purchase panel — the conversion */}
      <section className="py-16 bg-e1-bg">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12" data-animate>
          <BookPurchasePanel />
        </div>
      </section>

      {/* Compact "What's inside" stat block */}
      <section className="py-16 bg-e1-surface">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12" data-animate>
          <h2 className="font-display text-2xl text-e1-text mb-8 text-center">
            What's Inside
          </h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-display text-e1-primary text-4xl md:text-5xl">15</p>
              <p className="font-sans text-xs text-e1-text-muted uppercase tracking-wider mt-1">
                Narrative chapters
              </p>
            </div>
            <div>
              <p className="font-display text-e1-primary text-4xl md:text-5xl">3</p>
              <p className="font-sans text-xs text-e1-text-muted uppercase tracking-wider mt-1">
                Practical toolkits
              </p>
            </div>
            <div>
              <p className="font-display text-e1-primary text-4xl md:text-5xl">6</p>
              <p className="font-sans text-xs text-e1-text-muted uppercase tracking-wider mt-1">
                Trainers mapped
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free chapter excerpt — Chapter 0 only */}
      <section className="py-20 bg-e1-bg">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12" data-animate>
          <div className="flex items-center gap-3 mb-6">
            <FileText size={20} className="text-e1-primary" />
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-e1-text-muted">
              Free preview
            </p>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-e1-text mb-6">
            Chapter 0: The Birthday Card
          </h2>
          <div className="font-sans text-e1-text-muted space-y-4 leading-relaxed text-base md:text-lg">
            <p>
              In 2024, I sat in my office and scored myself against a
              framework I'd developed: The Six Trainers. The result was
              21 out of 60.
            </p>
            <p>
              I wasn't depressed. I wasn't surprised. I was finally, for
              the first time in my life, <em>clear</em>.
            </p>
            <p>
              This book is about those six trainers — the invisible systems
              that shape a man. Apartheid didn't just take our land and our
              dignity. It systematically destroyed six training structures
              that every civilization needs to produce functional men.
            </p>
            <p className="font-display italic text-e1-text">
              The Family Trainer. The Masculine Trainer. The Community
              Trainer. The Economic Trainer. The Academic Trainer. The
              Spiritual Trainer.
            </p>
            <p>
              Without them, we're not men. We're wild dogs — surviving,
              not living.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 bg-e1-surface">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 text-center" data-animate>
          <p className="font-sans text-e1-text-muted text-sm mb-6">
            Ready to start your rebuild?
          </p>
          <Link
            to="/book"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2 font-sans uppercase text-sm tracking-wider px-8 py-4 bg-e1-primary text-white rounded-full hover:bg-[#9f2f0b] transition-colors"
          >
            Buy the Book
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BookPage;
