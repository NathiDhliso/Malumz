import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Headphones } from 'lucide-react';
import { useGSAP } from '@gsap/react';

import { gsap } from '@/lib/gsap';
import assets, { BOOK_ACCENT_VIDEO } from '@/lib/assets';
import NotchedSection from '@/components/NotchedSection';
import MagneticButton from '@/components/MagneticButton';
import { BookPurchasePanel } from '@/components/BookPurchasePanel';

/**
 * BookPage editorial treatment.
 *
 * Introduces the book-detail page version of the E1 form vocabulary alongside
 * the silent looping accent video hero strip:
 *
 *   - A `<NotchedSection tone="charcoal">` hero strip hosts a muted, looping,
 *     `playsInline`, `preload="metadata"` `<video>` sourced from
 *     `BOOK_ACCENT_VIDEO` with explicit intrinsic `width` / `height` drawn
 *     from the Assets module (Requirements 25.6, 25.7, 32.1, 32.3, 32.4).
 *   - Every request-form input renders with a single 1 px bottom border and
 *     no other borders (Requirement 25.1).
 *   - On focus the associated label tweens to `{ y: -20, scale: 0.8,
 *     color: "#C2491A" }` via `gsap.to`; on blur, if the value is still
 *     empty, the label springs back to its resting state (Requirements
 *     25.2, 25.3).
 *   - The submit control is wrapped in `<MagneticButton>` so pointer-fine
 *     hover environments lean it toward the cursor through the shared 60 px
 *     magnetic inflation (Requirement 25.4).
 *   - Hovering the submit slides the inline right-arrow glyph `x: 0 → 12`
 *     via `gsap.to` and back on pointer leave (Requirement 25.5).
 *
 * All existing page copy — the title, author intro, R99 eBook / R199
 * audiobook tiers inside `<BookPurchasePanel>`, the 15 narrative chapters,
 * the three appendices, and both chapter previews — is preserved byte-for-
 * byte. Only legacy `malumz-*` tokens and the rounded-pill submit have
 * been swapped for their `e1-*` equivalents.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @see Requirements 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 30.3
 */

/**
 * Terracotta `e1-primary` hex used by the label-lift colour vars. Mirrors the
 * token value in `tailwind.config.js` (Requirement 1.2) and the Requirement
 * 25.2 spec text. Declared as a string literal because `gsap.to` accepts CSS
 * colour values verbatim and does not consume Tailwind class names.
 */
const E1_PRIMARY_HEX = '#C2491A';

/**
 * Sand `e1-text-muted` hex used as the label's resting colour. Mirrors the
 * token value in `tailwind.config.js` (Requirement 1.6).
 */
const E1_TEXT_MUTED_HEX = '#907A61';

/**
 * Shared tween vars for the focus → lifted label transition. Extracted into
 * a module-level constant so both the test harness (Property 20) and the
 * focus handler consume the exact same object shape.
 *
 * @see Requirement 25.2
 */
const LABEL_LIFT_VARS = {
  y: -20,
  scale: 0.8,
  color: E1_PRIMARY_HEX,
  duration: 0.2,
  ease: 'power2.out',
};

/**
 * Shared tween vars for the blur → resting label transition.
 *
 * @see Requirement 25.3
 */
const LABEL_REST_VARS = {
  y: 0,
  scale: 1,
  color: E1_TEXT_MUTED_HEX,
  duration: 0.2,
  ease: 'power2.out',
};

/**
 * Shared tween vars for the submit arrow slide on hover / leave. The 12 px
 * slide distance is the Requirement 25.5 magic number.
 */
const ARROW_HOVER_VARS = { x: 12, duration: 0.3, ease: 'power2.out' };
const ARROW_REST_VARS = { x: 0, duration: 0.3, ease: 'power2.out' };

/**
 * `<FloatingField>` — editorial label-lift input.
 *
 * Wraps a single `<input>` or `<textarea>` inside a relatively-positioned
 * `<label>` with the visible label rendered as an absolutely-positioned
 * `<span>`. The span sits at the input's baseline when the value is empty
 * and the input is not focused; on focus it tweens up to
 * `{ y: -20, scale: 0.8, color: "#C2491A" }`; on blur it springs back iff
 * the value is still empty so filled fields keep their labels lifted.
 *
 * The control itself renders as a transparent row with only a 1 px
 * `e1-text-muted` bottom border that switches to `e1-primary` on focus —
 * no side, top, or inner borders per Requirement 25.1.
 *
 * @param {object} props
 * @param {"input"|"textarea"} [props.as="input"] - Which native control to
 *   render. Selecting `"textarea"` also renders a `resize-none` handle and
 *   honours the `rows` prop.
 * @param {string} [props.type="text"] - Forwarded to `<input type>` when
 *   `as === "input"`; ignored for textareas.
 * @param {string} props.name - The form-field name.
 * @param {string} props.label - Human-readable label text rendered in the
 *   floating span.
 * @param {string} props.value - Controlled value; drives the blur-spring-back
 *   decision.
 * @param {(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => void} props.onChange
 *   Change handler forwarded to the native control.
 * @param {boolean} [props.required] - Forwarded `required` attribute.
 * @param {string} [props.testId] - `data-testid` on the native control.
 * @param {number} [props.rows] - Row count for the `"textarea"` variant.
 * @returns {JSX.Element}
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

  // `useGSAP` tethers every tween fired from the handlers below to this
  // field's mount lifetime, so unmounting (e.g., when the success state
  // replaces the form) auto-reverts any in-flight label tweens.
  useGSAP(() => {
    // Intentionally empty: tweens are fired imperatively from the focus /
    // blur handlers. Declaring the scope here still causes the library
    // to revert any tweens that target the label span on unmount.
  }, []);

  const handleFocus = () => {
    if (labelRef.current) {
      gsap.to(labelRef.current, LABEL_LIFT_VARS);
    }
  };

  const handleBlur = (event) => {
    if (!labelRef.current) return;
    // Only spring back when the field is genuinely empty — a filled input
    // must keep its label lifted so it does not collide with the user's
    // text (Requirement 25.3 blur clause).
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

export const BookPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Arrow-slide ref for the submit CTA. `useGSAP` scopes any tweens fired
  // against this element to the page's mount lifetime so they are reverted
  // on route change.
  const arrowRef = useRef(null);
  useGSAP(() => {
    // Tweens are fired imperatively from the pointer handlers below.
  }, []);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // The book-interest form is intentionally lightweight: it records local
    // success state so the BookPage can confirm receipt without introducing
    // a new API dependency in this task. Full inquiries already route to
    // ContactPage.
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

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
    <div className="min-h-screen bg-e1-bg text-e1-text">
      {/*
        Hero strip — `<NotchedSection tone="charcoal">` hosting the silent
        looping accent video (Requirements 25.6, 25.7). The video sits in
        an absolutely-positioned background layer behind the title and
        intro copy so the editorial silhouette reads through the ambient
        motion without competing for attention.
      */}
      <NotchedSection
        tone="charcoal"
        className="relative overflow-hidden pt-32 pb-20"
      >
        <div className="absolute inset-0 w-full h-full" aria-hidden="true">
          <video
            src={BOOK_ACCENT_VIDEO}
            width={assets.BOOK_ACCENT_VIDEO.width}
            height={assets.BOOK_ACCENT_VIDEO.height}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Charcoal wash so the hero copy reads at full contrast. */}
          <div className="absolute inset-0 w-full h-full bg-e1-bg/70" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-e1-text mb-6 leading-tight">
            The Dog Trainer
          </h1>
          <p className="font-sans text-lg md:text-xl text-e1-text-muted max-w-2xl mx-auto leading-relaxed">
            A memoir and framework by Nkosinathi Dhliso. The story of growing up across seven schools in post-apartheid South Africa and discovering that his father had been running a six-part training programme his entire life.
          </p>
        </div>
      </NotchedSection>

      {/* Purchase panel — preserved verbatim (R99 eBook / R199 audiobook tiers). */}
      <section className="py-24 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <BookPurchasePanel />
        </div>
      </section>

      <section className="py-24 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Headphones size={48} className="text-e1-secondary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl text-e1-text mb-4">
            Audiobook Access
          </h2>
          <p className="font-sans text-e1-text-muted mb-8 leading-relaxed">
            The complete audiobook is now unlocked after payment. Buy it above and return here to stream every chapter.
          </p>
          <div className="border border-e1-primary/30 rounded-xl p-6 text-center">
            <h3 className="font-display text-xl text-e1-text mb-2">R199 Audiobook</h3>
            <p className="font-sans text-e1-text-muted text-sm max-w-2xl mx-auto">
              Payment unlocks all 17 MP3 chapters from the repository through secure access links.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl md:text-4xl text-e1-text text-center mb-4">
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
                className="gs-reveal flex items-center gap-4 bg-e1-surface border border-e1-text-muted/20 rounded-lg px-6 py-4"
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
                className="gs-reveal flex items-center gap-4 bg-e1-surface border border-e1-text-muted/20 rounded-lg px-6 py-4"
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

      <section className="py-24 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl md:text-4xl text-e1-text text-center mb-4">
            Free Preview
          </h2>
          <p className="font-sans text-center text-e1-text-muted mb-12">
            Read Chapter 0 and Chapter 13 before you buy.
          </p>

          <div className="bg-e1-bg border border-e1-text-muted/20 rounded-xl p-8 md:p-12 mb-8">
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

          <div className="bg-e1-bg border border-e1-text-muted/20 rounded-xl p-8 md:p-12">
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

      {/*
        Editorial request form (Requirements 25.1–25.5). Inputs render with
        only a 1 px bottom border; labels float on focus and spring back on
        blur when empty; the submit is wrapped in `<MagneticButton>` with
        its inline `ArrowRight` glyph sliding 12 px right on hover.
      */}
      <section className="py-24 bg-e1-bg" data-testid="book-form-section">
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl md:text-4xl text-e1-text mb-4">
            Request a Signed Copy
          </h2>
          <p className="font-sans text-e1-text-muted mb-10 leading-relaxed">
            Want a signed copy or to book the author for a talk? Share a few details and we'll reach out.
          </p>

          {submitted ? (
            <div
              role="status"
              data-testid="book-success-message"
              className="border border-e1-primary/40 bg-e1-surface rounded-xl p-6 font-sans text-e1-text"
            >
              Thank you. Your request has been received — we'll follow up within 48 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <FloatingField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                testId="book-name-input"
              />

              <FloatingField
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                testId="book-email-input"
              />

              <FloatingField
                as="textarea"
                name="message"
                label="Message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                testId="book-message-input"
              />

              <div className="pt-4">
                <MagneticButton
                  type="submit"
                  data-testid="book-submit-button"
                  onMouseEnter={handleArrowEnter}
                  onMouseLeave={handleArrowLeave}
                  className="inline-flex items-center gap-4 font-display text-xl uppercase tracking-wide text-e1-text border-b-2 border-e1-primary pb-2"
                  aria-label="Send request"
                >
                  <span>Send Request</span>
                  {/*
                    Inline arrow glyph — the tween target for Requirement
                    25.5. Wrapping the icon in a `<span>` gives GSAP a
                    stable transform target without clobbering lucide's
                    internal `<svg>` transforms.
                  */}
                  <span
                    ref={arrowRef}
                    className="inline-flex text-e1-primary"
                    aria-hidden="true"
                  >
                    <ArrowRight size={22} />
                  </span>
                </MagneticButton>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="py-16 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-display text-2xl md:text-3xl text-e1-text mb-4">
            Start Making an Impact
          </h3>
          <p className="font-sans text-e1-text-muted text-lg mb-8">
            Join the movement and help transform boys and men in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/join"
              className="bg-transparent border border-e1-primary text-e1-primary hover:bg-e1-primary hover:text-e1-text rounded-full px-8 py-4 font-sans uppercase tracking-wider text-sm transition-all inline-block"
            >
              Start a Brotherhood Circle
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
