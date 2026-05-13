import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Target, Calendar, Play, Pause } from 'lucide-react';

import NotchedSection from '@/components/NotchedSection';
import assets, { RESULTS_TESTIMONIAL_VIDEO } from '@/lib/assets';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * ResultsPage — E1 editorial treatment.
 *
 * Preserves the existing page-level copy (`dashboardMetrics`, `phases`, and
 * the prose around them) while replacing every legacy `malumz-*` class and
 * ad-hoc cream/white surface with the seven-token `e1-*` palette and the
 * Fraunces display / DM Sans body families. The hero of the page is a
 * full-width testimonial `<video>` that references
 * `RESULTS_TESTIMONIAL_VIDEO` from the Assets Module and is framed by the
 * `<NotchedSection>` layout primitive.
 *
 * Testimonial reel policy (Requirements 4.6, 27.1–27.5):
 *   - The video references `RESULTS_TESTIMONIAL_VIDEO` and carries explicit
 *     `width` / `height` attributes sourced from the Assets Module metadata
 *     so the browser can reserve layout space before the first frame loads.
 *   - The video does NOT carry the `autoplay` attribute, so it defaults to
 *     the paused state on first render (Requirement 27.2).
 *   - A paired `<button>` acts as the accessible play/pause control. It
 *     tracks `isPlaying` in component state, reflects that state via
 *     `aria-pressed`, and toggles the underlying `HTMLMediaElement` via
 *     `play()` / `pause()` on activation (Requirements 27.3, 27.4).
 *   - The native `play` / `pause` / `ended` events on the video element are
 *     subscribed so the control stays in sync if the user uses the native
 *     controls overlay.
 *   - When `prefers-reduced-motion: reduce` is active, the video remains
 *     paused on first render regardless of any external trigger
 *     (Requirements 4.6, 27.5). Because the component never auto-starts
 *     playback, honouring this requirement is simply "never call `play()`
 *     on mount", which mirrors the non-reduced-motion path.
 *
 * Feature: e1-editorial-ui-overhaul
 *
 * @see Requirements 1.1–1.8, 2.1, 4.6, 5.7, 5.8, 27.1, 27.2, 27.3, 27.4,
 *      27.5, 30.3, 32.1
 */

// Preserved page-level data — copy is byte-for-byte identical to the prior
// revision of this page (Requirement 30.3).
const dashboardMetrics = [
  { label: 'Completion Rate', target: '70%+', current: '—', status: 'Pilot not yet started' },
  { label: 'Relationship Improvement', target: '50%+', current: '—', status: 'Self-reported metric' },
  { label: 'Capacity to Scale', target: '30%+', current: '—', status: 'Graduates who choose to lead' },
  { label: 'Safety Check', target: 'Zero', current: '0', status: 'Weaponisation incidents' },
];

const phases = [
  {
    name: 'Phase 1',
    period: '2026–2030',
    circles: 10,
    men: 200,
    status: 'Current',
    description: 'Pilot. Prove the model works or publish why it failed.',
  },
  {
    name: 'Phase 2',
    period: '2030–2032',
    circles: 42,
    men: 840,
    status: 'Conditional on Phase 1 success',
    description: 'Scale to multiple provinces. Paid facilitators and social workers.',
  },
  {
    name: 'Phase 3',
    period: '2032+',
    circles: 176,
    men: 3520,
    status: 'Conditional on Phase 2 success',
    description: 'Provincial rollout. Formal Malumz certification. Brotherhood Centres.',
  },
];

const testimonialMeta = assets.RESULTS_TESTIMONIAL_VIDEO;

export const ResultsPage = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Captured once on mount so the initial-render branch matches
  // Requirement 4.6 (video paused on first render under reduced motion).
  // Captured lazily via `useState(() => ...)` so the probe runs exactly
  // once and so SSR-rendered markup stays deterministic.
  // eslint-disable-next-line no-unused-vars
  const [reduceMotion] = useState(() => prefersReducedMotion());

  // Keep component state in sync with native media events so the
  // `aria-pressed` value is accurate if the user invokes browser-provided
  // playback controls (e.g., the native context menu).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  const handleToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const result = video.play();
      // `play()` returns a Promise in modern browsers; swallow rejections
      // (e.g., autoplay policy blocks) so we never surface an unhandled
      // rejection to the console on user-initiated activations that the
      // browser still declines.
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      video.pause();
    }
  }, []);

  return (
    <div className="min-h-screen bg-e1-bg font-sans text-e1-text">
      {/* Page header + testimonial reel ------------------------------ */}
      <section className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <BarChart3 size={56} className="text-e1-highlight mx-auto mb-6" />
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-e1-text mb-6 tracking-tight">
              Results
            </h1>
            <p className="font-sans text-lg text-e1-text-muted max-w-2xl mx-auto leading-relaxed">
              Transparent reporting for the 2026–2030 pilot. Updated quarterly. If the model works, you'll see the proof. If it fails, we'll tell you why.
            </p>
          </div>

          <NotchedSection tone="sienna" className="p-4 md:p-6">
            <figure className="relative">
              <video
                ref={videoRef}
                src={RESULTS_TESTIMONIAL_VIDEO}
                width={testimonialMeta.width}
                height={testimonialMeta.height}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={testimonialMeta.altPlaceholder}
                data-testid="results-testimonial-video"
                className="block w-full h-auto"
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <figcaption className="font-sans text-sm text-e1-text-muted italic">
                  {testimonialMeta.altPlaceholder}
                </figcaption>
                <button
                  type="button"
                  onClick={handleToggle}
                  aria-pressed={isPlaying}
                  aria-label={isPlaying ? 'Pause testimonial' : 'Play testimonial'}
                  data-testid="results-testimonial-toggle"
                  className="inline-flex items-center gap-2 rounded-full border border-e1-primary bg-e1-bg px-5 py-2 font-sans text-sm font-medium text-e1-text hover:bg-e1-primary hover:text-e1-text transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            </figure>
          </NotchedSection>
        </div>
      </section>

      {/* Live dashboard ---------------------------------------------- */}
      <section className="py-20 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <Target size={28} className="text-e1-primary" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-e1-text">
              Live Dashboard
            </h2>
          </div>
          <p className="font-sans text-sm text-e1-text-muted italic mb-10">
            Updated quarterly. Pilot data collection begins with the first Brotherhood Circle.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {dashboardMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-e1-bg border border-e1-primary/20 rounded-xl p-6 gs-reveal"
              >
                <h3 className="font-display text-lg font-bold text-e1-text mb-3">
                  {metric.label}
                </h3>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display text-3xl font-bold text-e1-highlight">
                    {metric.current}
                  </span>
                  <span className="font-sans text-sm text-e1-text-muted">
                    target: {metric.target}
                  </span>
                </div>
                <p className="font-sans text-sm text-e1-text-muted">{metric.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase tracker ----------------------------------------------- */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-10">
            <Calendar size={28} className="text-e1-highlight" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-e1-text">
              Phase Tracker
            </h2>
          </div>
          <div className="space-y-6">
            {phases.map((phase) => {
              const isCurrent = phase.status === 'Current';
              return (
                <div
                  key={phase.name}
                  className={`bg-e1-surface rounded-xl p-8 gs-reveal border ${
                    isCurrent
                      ? 'border-e1-primary shadow-[0_20px_60px_-30px_rgba(194,73,26,0.6)]'
                      : 'border-e1-primary/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-display text-2xl font-bold text-e1-text">
                          {phase.name}
                        </h3>
                        {isCurrent && (
                          <span className="bg-e1-primary text-e1-text text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-e1-text-muted mt-1">{phase.period}</p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="font-display text-2xl font-bold text-e1-highlight">
                          {phase.circles}
                        </div>
                        <p className="font-sans text-xs uppercase tracking-wider text-e1-text-muted">
                          Circles
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-2xl font-bold text-e1-highlight">
                          {phase.men}
                        </div>
                        <p className="font-sans text-xs uppercase tracking-wider text-e1-text-muted">
                          Men
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="font-sans text-e1-text leading-relaxed">{phase.description}</p>
                  {!isCurrent && (
                    <p className="font-sans text-sm text-e1-text-muted italic mt-2">
                      {phase.status}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open invitation --------------------------------------------- */}
      <section className="py-20 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-e1-text mb-8">
            Open Invitation
          </h2>
          <div className="bg-e1-bg border border-e1-primary/20 rounded-xl p-8">
            <p className="font-sans text-e1-text leading-relaxed mb-4">
              Universities and researchers are welcome to audit these results. We have nothing to hide because hiding failure would make us no different from the systems we're trying to fix.
            </p>
            <p className="font-sans text-e1-text leading-relaxed mb-6">
              Budget transparency: what each Circle costs and where the money comes from will be published here as data becomes available.
            </p>
            <Link
              to="/contact"
              className="font-sans font-medium text-e1-primary hover:text-e1-highlight hover:underline transition-colors"
            >
              Contact us for research partnerships →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultsPage;
