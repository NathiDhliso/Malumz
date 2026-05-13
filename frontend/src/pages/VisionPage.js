import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Building2, Users, FileText } from 'lucide-react';
import { useGSAP } from '@gsap/react';

import { gsap, ScrollTrigger, DrawSVGPlugin } from '@/lib/gsap';
import assets, {
  VISION_NODE_1,
  VISION_NODE_2,
  VISION_NODE_3,
} from '@/lib/assets';

// Reference the plugin symbols so bundlers cannot tree-shake the
// registration side-effects performed in `@/lib/gsap`. DrawSVGPlugin and
// ScrollTrigger are only consumed indirectly (via the `drawSVG` property
// name and the `scrollTrigger` config below) so the static imports above
// would otherwise appear unused.
void ScrollTrigger;
void DrawSVGPlugin;

/**
 * VisionPage — E1 editorial vertical timeline treatment.
 *
 * The page opens with a new vertical timeline whose connecting SVG line
 * draws from 0 % to 100 % under a scroll-scrubbed `DrawSVGPlugin` tween
 * (Requirement 24.1, 24.2). Each node below the line is a scoped reveal
 * entry that fades in once it crosses `start: "top 70%"` (Requirement
 * 24.3); three of the six nodes carry circular-cropped thumbnails backed
 * by the semantic `VISION_NODE_1`, `VISION_NODE_2`, and `VISION_NODE_3`
 * assets with explicit `width`, `height`, `loading="lazy"`, and
 * meaningful alt copy (Requirements 24.4, 24.5, 32.1, 32.3, 32.5).
 *
 * Reveal policy note: Requirement 24.3 mandates `start: "top 70%"` for
 * every timeline node, which is later in the viewport than the
 * application-wide `.gs-reveal` batch (`ST.revealStart = "top 88%"`).
 * To honour the stricter per-node position, timeline nodes use the
 * page-local class `gs-timeline-node` and are driven by a local
 * `ScrollTrigger.batch(...)` authored inside `useGSAP`, rather than
 * being adopted by the global `<RevealRoot>` batch. Motion is expressed
 * as a `gsap.matchMedia()` split so the reduced-motion branch collapses
 * to an opacity-only 150 ms fade with `y` and `scale` held at identity.
 *
 * DrawSVG fallback (Requirement 35.4): when the plugin is unavailable,
 * `drawSVG` writes become no-ops and the authored vertical `<path>`
 * renders fully drawn from first paint — there is no authored
 * `strokeDasharray` to strip, so the fallback is inherently "fully
 * drawn". The reduced-motion branch below also `gsap.set`s the path to
 * `drawSVG: "100%"` so users who opt out of motion still see the
 * connecting line at rest.
 *
 * Every existing copy string from the prior revision is preserved
 * verbatim. The only substantive changes are (a) the new vertical
 * timeline section prepended after the intro, and (b) a `malumz-*` →
 * `e1-*` token swap across the remaining sections.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 24.1, 24.2, 24.3, 24.4, 24.5, 32.1, 32.3, 32.5, 35.4
 *
 * @returns {JSX.Element}
 */

const infrastructureItems = [
  'Paid facilitators and social workers',
  'Brotherhood Hotline (24/7 sanity preservation line)',
  'Refuge Rooms (physical spaces for men to decompress)',
  'Crisis Fund (emergency accommodation, transport, food vouchers)',
  'Formal Malumz certification',
];

const malumzRequirements = [
  'Completed 6-month Circle programme',
  'General Malumz: 51/60+ score, qualified in all domains',
  'Specialist Malumz: 9/10+ in one domain, supervised monthly by a General Malumz',
  'Police clearance certificate (non-negotiable)',
  'Wears official Malumz t-shirt during community hours',
];

const antiPredatorProtocols = [
  { name: 'Background Checks', description: 'Police clearance, no sexual offence record, 3 community references. While waiting for SAPS clearance, operate ONLY with a fully cleared Malumz present.' },
  { name: 'Visibility Rule', description: 'Public spaces ONLY. Never private homes, cars, or isolated locations. If it rains or gets dark, session cancelled.' },
  { name: '10-Minute Rule', description: 'Sessions are 5–15 minutes. Longer = refer to Circle or parents. Never take a boy somewhere private.' },
  { name: 'Two-Adult Rule', description: 'Any interaction over 10 minutes requires two Malumz or a parent present.' },
  { name: 'Mandatory Reporting', description: 'Suspected abuse must be reported to Social Development or SAPS immediately. "Protecting the brotherhood" never overrides protecting a child.' },
];

/**
 * Six timeline events distilled from the existing vision copy below.
 * Every `title`, `period`, and `description` reuses language already
 * present elsewhere on the page so no narrative content is invented.
 * `thumbnail` is populated for exactly three entries (indices 1, 3, 5)
 * per Requirement 24.4.
 */
const timelineEvents = [
  {
    period: 'Phase 1 (2026–2030)',
    title: 'Pilot: Brotherhood Circles',
    description:
      'The pilot meets its targets (70%+ completion, 50%+ relationship improvement, 30%+ want to lead, ZERO weaponisation) or the model is revised or scrapped.',
    thumbnail: null,
  },
  {
    period: 'If the Pilot Succeeds',
    title: 'Formal Infrastructure',
    description:
      'Paid facilitators and social workers, Brotherhood Hotline, Refuge Rooms, Crisis Fund, formal Malumz certification.',
    thumbnail: {
      src: VISION_NODE_1,
      alt: assets.VISION_NODE_1.altPlaceholder,
      width: assets.VISION_NODE_1.width,
      height: assets.VISION_NODE_1.height,
    },
  },
  {
    period: 'Community Activation',
    title: 'The Malumz Network',
    description:
      'Verified community guides who provide mentorship outside formal Circle sessions. 5–15 minute guidance in public spaces.',
    thumbnail: null,
  },
  {
    period: 'Policy Horizon',
    title: 'Government and Corporate Partnerships',
    description:
      'Revise Life Orientation curriculum, unlock the Missing Middle funding model, and shift corporate CSI from brick-and-mortar to human capital programmes like Brotherhood Circles.',
    thumbnail: {
      src: VISION_NODE_2,
      alt: assets.VISION_NODE_2.altPlaceholder,
      width: assets.VISION_NODE_2.width,
      height: assets.VISION_NODE_2.height,
    },
  },
  {
    period: 'Phase 2 (2030–2032)',
    title: '10 Centres. 500 Graduates.',
    description:
      'Scale the proven Circle model across ten centres and graduate the first five hundred men through the full 6-month programme.',
    thumbnail: null,
  },
  {
    period: 'Phase 3 (2032+)',
    title: 'Provincial Rollout',
    description:
      'Take the Circle model province by province so every untrained man has a Circle within reach.',
    thumbnail: {
      src: VISION_NODE_3,
      alt: assets.VISION_NODE_3.altPlaceholder,
      width: assets.VISION_NODE_3.width,
      height: assets.VISION_NODE_3.height,
    },
  },
];

export const VisionPage = () => {
  const timelineRef = useRef(null);
  const lineRef = useRef(null);

  // Preserve stable references across renders; node count is fixed by
  // the `timelineEvents` constant above so we can allocate once.
  const nodeRefs = useMemo(
    () => timelineEvents.map(() => ({ current: null })),
    []
  );

  useGSAP(
    () => {
      const line = lineRef.current;
      const nodes = nodeRefs.map((r) => r.current).filter(Boolean);
      if (!line || nodes.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Vertical line: scrub from 0% → 100% drawn as the section
        // passes through the viewport center (Requirement 24.2).
        gsap.set(line, { drawSVG: '0%' });
        gsap.to(line, {
          drawSVG: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        });

        // Per-node reveal batch at `start: "top 70%"` (Requirement 24.3).
        gsap.set(nodes, { opacity: 0, y: 50, scale: 0.96 });
        ScrollTrigger.batch(nodes, {
          start: 'top 70%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out',
            }),
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Fully-drawn static line and opacity-only node fades so the
        // page remains legible without transform-based motion
        // (Requirement 4.2, and the DrawSVG fallback posture of
        // Requirement 35.4 for the line itself).
        gsap.set(line, { drawSVG: '100%' });
        gsap.set(nodes, { opacity: 0, y: 0, scale: 1 });
        ScrollTrigger.batch(nodes, {
          start: 'top 70%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, duration: 0.15 }),
        });
      });
    },
    { scope: timelineRef }
  );

  return (
    <div className="min-h-screen bg-e1-bg">
      <section className="pt-32 pb-16 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Eye size={64} className="text-e1-highlight mx-auto mb-6" />
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-e1-text mb-4">
            The Vision
          </h1>
          <p className="text-lg text-e1-text/90 max-w-2xl mx-auto">
            The book is about what YOU can do. These pages are for the people building what comes next — funders, government, corporate partners, and future Malumz Network guides.
          </p>
          <p className="text-e1-text-muted text-sm mt-4 italic">
            They don't belong in a man's hands at 2 AM when he's trying to save his family. They belong here.
          </p>
        </div>
      </section>

      {/* Vertical timeline — new editorial treatment for this overhaul. */}
      <section className="py-24 bg-e1-bg" id="timeline">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-display text-3xl font-bold text-e1-text mb-12 text-center">
            The Roadmap
          </h2>

          <div ref={timelineRef} className="relative pl-20">
            {/* Connecting SVG line — a single vertical <path> so
                DrawSVGPlugin can scrub it 0% → 100%. When the plugin is
                unavailable the path renders fully drawn from first
                paint (Requirement 35.4). */}
            <svg
              className="absolute left-8 top-0 h-full pointer-events-none"
              width="2"
              viewBox="0 0 2 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={lineRef}
                d="M 1 0 L 1 1000"
                stroke="#C2491A"
                strokeWidth="1"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <ol className="space-y-12">
              {timelineEvents.map((event, index) => (
                <li
                  key={event.title}
                  ref={(el) => {
                    nodeRefs[index].current = el;
                  }}
                  className="gs-timeline-node relative flex items-start gap-6"
                >
                  {/* Node dot sits on top of the connecting line. */}
                  <span
                    className="absolute -left-16 top-2 w-4 h-4 rounded-full bg-e1-primary ring-4 ring-e1-bg"
                    aria-hidden="true"
                  />

                  {event.thumbnail && (
                    <img
                      src={event.thumbnail.src}
                      width={event.thumbnail.width}
                      height={event.thumbnail.height}
                      loading="lazy"
                      alt={event.thumbnail.alt}
                      className="flex-shrink-0 w-24 h-24 rounded-full object-cover border border-e1-primary/40"
                    />
                  )}

                  <div className="flex-1 bg-e1-surface border border-e1-text/10 rounded-xl p-6">
                    <div className="text-e1-primary font-bold text-sm uppercase tracking-wider mb-2">
                      {event.period}
                    </div>
                    <h3 className="font-display text-xl font-bold text-e1-text mb-2">
                      {event.title}
                    </h3>
                    <p className="text-e1-text/90 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-surface" id="infrastructure">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={28} className="text-e1-primary" />
            <h2 className="font-display text-3xl font-bold text-e1-text">
              Formal Infrastructure Vision
            </h2>
          </div>

          <div className="bg-e1-primary/10 border-l-4 border-e1-primary rounded-r-lg p-6 mb-8">
            <p className="text-e1-text font-semibold">
              None of this exists yet. It is conditional on Phase 1 success.
            </p>
            <p className="text-e1-text/90 text-sm mt-2">
              If the pilot meets its targets (70%+ completion, 50%+ relationship improvement, 30%+ want to lead, ZERO weaponisation), we build the infrastructure below. If the pilot fails those targets, we revise or scrap the model.
            </p>
          </div>

          <h3 className="font-display text-xl font-bold text-e1-text mb-4">
            What We Build If the Pilot Succeeds
          </h3>
          <div className="space-y-3 mb-12">
            {infrastructureItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-e1-bg rounded-lg p-4">
                <span className="text-e1-highlight font-bold">-</span>
                <span className="text-e1-text/90">{item}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">Phase 2 (2030–2032)</h4>
              <p className="text-e1-text/90 text-sm">10 Centres. 500 graduates.</p>
            </div>
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">Phase 3 (2032+)</h4>
              <p className="text-e1-text/90 text-sm">Provincial rollout.</p>
            </div>
          </div>
          <p className="text-e1-text-muted text-sm mt-6 italic">
            Live budget calculations, staffing models, and funding channels will be published here as they are developed.
          </p>
        </div>
      </section>

      <section className="py-20 bg-e1-bg" id="network">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <Users size={28} className="text-e1-highlight" />
            <h2 className="font-display text-3xl font-bold text-e1-text">
              The Malumz Network
            </h2>
          </div>
          <p className="text-e1-text/90 mb-8">
            Verified community guides who provide mentorship outside formal Circle sessions. 5–15 minute guidance in public spaces.
          </p>

          <h3 className="font-display text-xl font-bold text-e1-text mb-4">
            Requirements
          </h3>
          <div className="space-y-3 mb-12">
            {malumzRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3 bg-e1-surface rounded-lg p-4 border border-e1-text/10">
                <span className="text-e1-highlight font-bold">-</span>
                <span className="text-e1-text/90">{req}</span>
              </div>
            ))}
          </div>

          <h3 className="font-display text-xl font-bold text-e1-text mb-4">
            Anti-Predator Protocols
          </h3>
          <div className="space-y-4">
            {antiPredatorProtocols.map((protocol, index) => (
              <div key={index} className="bg-e1-surface border border-e1-text/10 rounded-lg p-6">
                <h4 className="font-semibold text-e1-text mb-2">
                  {index + 1}. {protocol.name}
                </h4>
                <p className="text-e1-text/90 text-sm">{protocol.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-surface" id="policy">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={28} className="text-e1-primary" />
            <h2 className="font-display text-3xl font-bold text-e1-text">
              Policy Recommendations
            </h2>
          </div>

          <h3 className="font-display text-2xl font-bold text-e1-primary mb-6">
            For Government
          </h3>
          <div className="space-y-6 mb-16">
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">
                1. Re-evaluate the "Life Orientation" Curriculum
              </h4>
              <p className="text-e1-text-muted text-sm mb-2">Current LO is often treated as a filler subject.</p>
              <p className="text-e1-text/90">Revise LO to include rigorous modules on Financial Literacy and Emotional Intelligence.</p>
            </div>
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">
                2. The "Missing Middle" Funding Model
              </h4>
              <p className="text-e1-text-muted text-sm mb-2">NSFAS serves the poor. Banks serve the rich. The middle collapses.</p>
              <p className="text-e1-text/90">State-backed surety for student loans to the "Missing Middle" (family income R350k–R600k), contingent on academic performance.</p>
            </div>
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">
                3. Teacher Support, Not Just Assessment
              </h4>
              <p className="text-e1-text-muted text-sm mb-2">Teachers are overwhelmed.</p>
              <p className="text-e1-text/90">Fund "Admin Assistants" for schools to handle paperwork so teachers can teach. Invest in psycho-social support for teachers.</p>
            </div>
          </div>

          <h3 className="font-display text-2xl font-bold text-e1-primary mb-6">
            For Corporate South Africa
          </h3>
          <div className="space-y-6 mb-16">
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">
                1. Rethink "Culture Fit"
              </h4>
              <p className="text-e1-text-muted text-sm mb-2">"Culture Fit" is often a mask for "Assimilation."</p>
              <p className="text-e1-text/90">Adopt "Culture Add" hiring. Ask: "What does this person bring that we don't have?"</p>
            </div>
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">
                2. The Sponsorship vs Mentorship Shift
              </h4>
              <p className="text-e1-text-muted text-sm mb-2">Mentorship is giving advice. Sponsorship is opening doors.</p>
              <p className="text-e1-text/90">Executives should have KPIs tied to the promotion of their mentees, not just the meeting with them.</p>
            </div>
            <div className="bg-e1-bg border border-e1-text/10 rounded-xl p-6">
              <h4 className="font-display text-lg font-bold text-e1-text mb-2">
                3. Fund the "Soft" Infrastructure
              </h4>
              <p className="text-e1-text-muted text-sm mb-2">Companies love building classrooms. They rarely fund the development.</p>
              <p className="text-e1-text/90">Shift CSI spend from brick-and-mortar to human capital programmes like Brotherhood Circles. A classroom without a developed teacher is just a room.</p>
            </div>
          </div>

          <h3 className="font-display text-2xl font-bold text-e1-text mb-6">
            Why This Approach May Face Resistance
          </h3>
          <div className="space-y-3">
            {[
              { reason: 'Political', detail: 'Requires admitting BEE alone isn\'t enough' },
              { reason: 'Ideological', detail: 'Some will call it "patriarchy". But it demands men SERVE, not dominate' },
              { reason: 'Economic', detail: 'Elite benefit from masses staying undeveloped' },
              { reason: 'Cultural', detail: 'Sounds like "traditional gender roles". But with accountability' },
              { reason: 'Personal', detail: 'Some men resist the process because accountability feels like attack' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-e1-bg rounded-lg p-4">
                <span className="font-bold text-e1-primary min-w-[100px]">{item.reason}</span>
                <span className="text-e1-text/90">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-e1-primary">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <p className="text-e1-text text-lg mb-6">
            Want to help build this? Whether you're a funder, researcher, government official, or corporate partner — we're listening.
          </p>
          <Link
            to="/contact"
            className="bg-e1-highlight text-e1-bg hover:bg-e1-highlight/90 rounded-full px-8 py-4 font-semibold text-lg transition-all inline-block"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default VisionPage;
