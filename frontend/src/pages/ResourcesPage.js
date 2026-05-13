import { Link } from 'react-router-dom';
import { Download, Mic, FileText, Users, BookOpen } from 'lucide-react';
import NotchedSection from '@/components/NotchedSection';

/**
 * ResourcesPage — E1 editorial inheritance.
 *
 * Task 7.8 rebases resources onto the E1 token palette, Fraunces
 * display / DM Sans typography, and wraps the hero in
 * `<NotchedSection tone="charcoal">`. Section headings and each
 * tile / guide card carry `.gs-reveal` so they participate in the
 * global Reveal Batch driven by `<RevealRoot>`.
 *
 * All copy strings and the `voiceNotePrompts` / `printablePDFs` /
 * `specialGuides` page-level data constants are preserved byte-for-byte.
 * No page-specific GSAP timelines are added; scroll reveal, cursor,
 * and page-transition systems are inherited from the app shell.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 1.*, 2.*, 7.*, 12.*, 25.*, 30.3
 */

const voiceNotePrompts = [
  { title: 'Week 1: Did you provide, protect, love?', duration: '60 sec' },
  { title: 'Month 3 Reset: Score your five closest friends', duration: '60 sec' },
  { title: 'Month 6: The Inversion Test', duration: '60 sec' },
];

const printablePDFs = [
  { title: 'Mind the Gap Worksheet', description: 'The self-diagnosis tool from Appendix A' },
  { title: '6-Month Curriculum Overview', description: 'One page per Trainer' },
  { title: 'Ground Rules Template', description: 'Non-negotiable rules for every Circle' },
  { title: 'Partner Orientation Script', description: 'For explaining the Circle to wives/partners' },
  { title: 'Micro-Circle Quick Start', description: '1-page guide for the 4-man WhatsApp model' },
];

const specialGuides = [
  {
    title: 'The Braai Circle Guide',
    description: 'How to run the monthly Big Circle with the Malumz meat sponsorship model.',
    icon: Users,
  },
  {
    title: 'Shadow Training Guide',
    description: 'How to incorporate boys from Month 3 onward.',
    icon: Users,
  },
];

const systems = [
  {
    slug: 'predator-protocol',
    name: 'Predator Protocol',
    trainer: 'Family Trainer',
    description: 'Full 3-check walkthrough with examples of passing and failing each check.',
  },
  {
    slug: '3-chair-tribunal',
    name: '3-Chair Tribunal',
    trainer: 'Family Trainer',
    description: 'Detailed physical setup instructions, voice note recording method, debrief guide.',
  },
  {
    slug: 'provision-audit',
    name: 'Provision Audit',
    trainer: 'Economic Trainer',
    description: 'BREAD/SHIELD/FIRE diagnostic with the ATM metaphor, unemployment adaptation, weekly voice note template.',
  },
  {
    slug: 'circuit-breaker',
    name: 'Circuit Breaker',
    trainer: 'Academic Trainer',
    description: 'Common derailment types, notes for women reading, notes for men, detailed practice scenarios.',
  },
  {
    slug: 'blacksmith',
    name: 'Blacksmith',
    trainer: 'Masculine Trainer',
    description: 'Full forge process example (job loss scenario), isolation warning, Circle debrief format.',
  },
  {
    slug: 'war-room',
    name: 'War Room',
    trainer: 'Community Trainer',
    description: 'Round-by-round facilitation guide, safety protocol for suicidal disclosure, WhatsApp adaptation.',
  },
  {
    slug: 'cool-head-drill',
    name: 'Cool Head Drill',
    trainer: 'Masculine Trainer',
    description: '4-7-8 breathing science, role-play trigger drill instructions, pairing guide.',
  },
  {
    slug: 'anchor-drop',
    name: 'Anchor Drop',
    trainer: 'Spiritual Trainer',
    description: '2-minute compressed version for 4 AM shift workers.',
  },
  {
    slug: 'dark-room-protocol',
    name: 'Dark Room Protocol',
    trainer: 'Spiritual Trainer',
    description: 'Envelope method for men without accountability partners.',
  },
];

const trainerColors = {
  'Family Trainer': 'bg-e1-primary/15 text-e1-primary',
  'Masculine Trainer': 'bg-red-500/15 text-red-400',
  'Community Trainer': 'bg-e1-highlight/15 text-e1-highlight',
  'Economic Trainer': 'bg-green-500/15 text-green-400',
  'Academic Trainer': 'bg-blue-500/15 text-blue-300',
  'Spiritual Trainer': 'bg-purple-500/15 text-purple-300',
};

export const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-e1-bg">
      <NotchedSection tone="charcoal" className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Download size={64} className="text-e1-highlight mx-auto mb-6" />
          <h1 className="gs-reveal font-display text-4xl lg:text-5xl font-bold text-e1-text mb-4">
            Resources
          </h1>
          <p className="text-lg text-e1-text-muted max-w-2xl mx-auto">
            Downloadable tools that respect the Oral Rule and Tier 1 reality. Everything here works for a shift worker in Lawley with R20 airtime.
          </p>
        </div>
      </NotchedSection>

      <section className="py-20 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <Mic size={28} className="text-e1-primary" />
            <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text">
              Voice Note Prompts
            </h2>
          </div>
          <p className="text-e1-text-muted mb-8">
            Voice prompts for men who prefer listening over reading.
          </p>
          <div className="space-y-4">
            {voiceNotePrompts.map((prompt, index) => (
              <div
                key={index}
                className="gs-reveal flex items-center justify-between bg-e1-bg border border-e1-text/10 rounded-lg px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-e1-primary/10 rounded-full flex items-center justify-center">
                    <Mic size={18} className="text-e1-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-e1-text">{prompt.title}</p>
                    <p className="text-e1-text-muted text-sm">{prompt.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={28} className="text-e1-highlight" />
            <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text">
              Printable PDFs
            </h2>
          </div>
          <p className="text-e1-text-muted mb-8">
            All under 1MB. Print at your local spaza shop or library.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {printablePDFs.map((pdf, index) => (
              <div
                key={index}
                className="gs-reveal bg-e1-surface border border-e1-text/10 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <h3 className="font-display text-lg font-bold text-e1-text mb-2">
                  {pdf.title}
                </h3>
                <p className="text-e1-text-muted text-sm mb-4">
                  {pdf.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-8">
            Special Guides
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {specialGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <div
                  key={index}
                  className="gs-reveal bg-e1-bg border border-e1-text/10 rounded-xl p-8"
                >
                  <Icon size={32} className="text-e1-highlight mb-4" />
                  <h3 className="font-display text-xl font-bold text-e1-text mb-3">
                    {guide.title}
                  </h3>
                  <p className="text-e1-text-muted text-sm mb-4">
                    {guide.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen size={28} className="text-e1-highlight" />
            <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text">
              System Guides
            </h2>
          </div>
          <div className="space-y-4">
            {systems.map((system) => (
              <Link
                key={system.slug}
                to={`/systems/${system.slug}`}
                className="gs-reveal block bg-e1-surface border border-e1-text/10 rounded-lg p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-xl font-bold text-e1-text group-hover:text-e1-primary transition-colors">
                        {system.name}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${trainerColors[system.trainer] || 'bg-e1-text/10 text-e1-text-muted'}`}>
                        {system.trainer}
                      </span>
                    </div>
                    <p className="text-e1-text-muted text-sm">
                      {system.description}
                    </p>
                  </div>
                  <span className="text-e1-primary font-medium text-sm flex-shrink-0 group-hover:translate-x-1 transition-transform">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
