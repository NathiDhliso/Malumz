import { Shield, Users, BookOpen, TrendingUp, Compass, Heart } from 'lucide-react';

import HeroSection from '@/components/home/HeroSection';
import ScrollIndicator from '@/components/home/ScrollIndicator';
import TrainerConnector from '@/components/home/TrainerConnector';
import TrainerSpotlight from '@/components/home/TrainerSpotlight';
import PullQuote from '@/components/home/PullQuote';
import Marquee from '@/components/Marquee';

/**
 * HomePage — E1 editorial composition.
 *
 * Renders the new editorial stack in the order mandated by Requirements
 * 19.1, 19.2, 20.1, and the design document:
 *
 *   HeroSection → ScrollIndicator → Marquee → TrainerConnector →
 *   TrainerSpotlight → PullQuote
 *
 * `<Marquee>` sits between the hero and `<TrainerConnector>` (Requirement
 * 19.1) and is fed by `HOME_MARQUEE_PHRASES`, a local constant so the copy
 * can be tuned without touching the component (Requirement 19.2). The
 * `<ScrollIndicator>` is rendered directly below the hero NotchedSection
 * per Requirement 20.1.
 *
 * The page-level data constants below (`sixTrainers`, `pilotStats`) are
 * preserved from the previous revision so existing copy is not lost
 * (Requirement 30.3). The `color: 'text-malumz-*'` fields have been
 * dropped because they reference banned legacy tokens that the ESLint
 * guard installed in task 1.12 will fail the build on; every other
 * field and every copy string is byte-for-byte identical to the prior
 * revision. `sixTrainers` is consumed by both `<TrainerConnector>` (as
 * the radiating branch labels) and `<TrainerSpotlight>` (as the pinned
 * spotlight cards) so the data continues to drive the rendered page.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 19.1, 19.2, 20.1, 30.3
 */

// Preserved page-level data — see docblock above for provenance.
const sixTrainers = [
  {
    name: 'Family Trainer',
    tagline: 'Provide, Protect, Love',
    icon: Shield,
    description: 'Love. Protection. Provision. Not money—stability.',
  },
  {
    name: 'Masculine Trainer',
    tagline: 'Strength as service',
    icon: Heart,
    description: 'Strength = Service, not Dominance. Provide. Protect. Love.',
  },
  {
    name: 'Community Trainer',
    tagline: 'The Pack',
    icon: Users,
    description: 'Find your pack. Build accountability. Stop bleeding alone.',
  },
  {
    name: 'Economic Trainer',
    tagline: 'Legacy vs survival',
    icon: TrendingUp,
    description: 'From survival mode to legacy mode.',
  },
  {
    name: 'Academic Trainer',
    tagline: 'Mental diet',
    icon: BookOpen,
    description: "You're not stupid. You were just never trained right.",
  },
  {
    name: 'Spiritual Trainer',
    tagline: 'The Anchor',
    icon: Compass,
    description: 'Your moral anchor when everything else collapses.',
  },
];

// eslint-disable-next-line no-unused-vars
const pilotStats = [
  { number: '10', label: 'Brotherhood Circles in Phase 1' },
  { number: '200', label: 'Men in the 2026–2030 pilot' },
  { number: '70%+', label: 'Completion rate target' },
  { number: '6', label: 'Months per Circle' },
];

/**
 * Marquee phrases rendered between the hero and the Trainer Connector
 * (Requirement 19.2). Phrases echo the existing HomePage narrative
 * (the "20 at a time" + "6 months" + "Six Trainers" framing) so the
 * editorial ribbon reinforces copy already on the page.
 */
const HOME_MARQUEE_PHRASES = [
  'Rebuilding men',
  'Twenty at a time',
  'Six months',
  'Six trainers',
  'Brotherhood Circles',
];

/**
 * Trim the trailing " Trainer" from each preserved `sixTrainers[i].name`
 * so the radial Connector labels read cleanly (`Family`, `Masculine`, …)
 * while the Spotlight cards keep the full "X Trainer" headline.
 */
const CONNECTOR_LABELS = sixTrainers.map((t) =>
  t.name.replace(/\s*Trainer$/, '')
);

/** Spotlight cards consume `{ name, description }` from the preserved data. */
const SPOTLIGHT_TRAINERS = sixTrainers.map(({ name, description }) => ({
  name,
  description,
}));

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-e1-bg">
      <HeroSection />
      <ScrollIndicator />
      <Marquee phrases={HOME_MARQUEE_PHRASES} />
      <TrainerConnector trainers={CONNECTOR_LABELS} />
      <TrainerSpotlight trainers={SPOTLIGHT_TRAINERS} />
      <PullQuote
        quote="18 months later: 37/60. Married. Building. Training others."
        attribution="Nathi Dhliso"
      />
    </div>
  );
};

export default HomePage;
