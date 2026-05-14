import { BookPurchasePanel } from '@/components/BookPurchasePanel';

/**
 * BookPage — instant checkout.
 *
 * The user clicked "Buy the Book". They want to pay and leave.
 * No hero, no stats, no chapter excerpt above the fold.
 *
 * Structure:
 *   1. Purchase panel (product cards + buy button — visible immediately)
 *   2. Below the fold: one-line "What's inside" + short excerpt for
 *      the rare user who scrolls before buying.
 *
 * The email field is optional so the buy button works on first tap.
 */

export const BookPage = () => {
  return (
    <div className="min-h-screen bg-e1-bg text-e1-text pt-24 pb-16">
      {/* Purchase panel — above the fold, no scroll needed */}
      <section className="max-w-lg mx-auto px-4 md:px-6">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2">
          The Dog Trainer
        </h1>
        <p className="font-sans text-sm text-e1-text-muted text-center mb-8">
          A memoir and framework by Nkosinathi Dhliso
        </p>
        <BookPurchasePanel />
      </section>

      {/* Below the fold — for browsers, not buyers */}
      <section className="max-w-lg mx-auto px-4 md:px-6 mt-20 border-t border-e1-text-muted/10 pt-12">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-e1-text-muted mb-4">
          What's inside
        </p>
        <p className="font-sans text-sm text-e1-text-muted leading-relaxed mb-8">
          15 narrative chapters tracing the journey from "wild dog" to
          trained man, plus 3 practical toolkits — the Mind the Gap
          Worksheet, the Rebuild Toolkit, and the Scaling guide.
        </p>
        <p className="font-display italic text-e1-text text-lg leading-relaxed">
          "Apartheid didn't just take our land. It systematically destroyed
          six training structures every civilisation needs to produce
          functional men."
        </p>
        <p className="font-sans text-xs text-e1-text-muted mt-2">
          — Chapter 0: The Birthday Card
        </p>
      </section>
    </div>
  );
};

export default BookPage;
