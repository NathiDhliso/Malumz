import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

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
  'Family Trainer': 'bg-malumz-orange/10 text-malumz-orange',
  'Masculine Trainer': 'bg-red-50 text-red-600',
  'Community Trainer': 'bg-malumz-gold/10 text-malumz-gold',
  'Economic Trainer': 'bg-green-50 text-green-700',
  'Academic Trainer': 'bg-blue-50 text-blue-700',
  'Spiritual Trainer': 'bg-purple-50 text-purple-700',
};

export const SystemsPage = () => {
  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <BookOpen size={64} className="text-malumz-gold mx-auto mb-6" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
            System Guides
          </h1>
          <p className="text-lg text-malumz-text-secondary max-w-2xl mx-auto">
            The book gives each system's core action steps. These expanded guides provide detailed breakdowns, adaptations, practice scenarios, and examples.
          </p>
          <p className="text-malumz-text-muted text-sm mt-4">
            Every exercise can be done via voice note. URL pattern: malumz.co.za/systems/[system-name]
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-4">
            What Every Guide Includes
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            {[
              'The Breakdown — full explanation of the problem the system addresses',
              'Tier 1 Adaptation — zero budget, no literacy, no data, no transport',
              'Tier 2 Extension — advanced version for men with more resources',
              'Oral Option — voice note instructions for men who prefer not to write',
              'Practice Scenario — step-by-step worked example',
              'Circle Integration — how to use during Brotherhood Circle meetings',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-malumz-cream rounded-lg p-4">
                <span className="text-malumz-gold font-bold mt-0.5">-</span>
                <span className="text-malumz-text-secondary text-sm">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-8">
            All Systems
          </h2>
          <div className="space-y-4">
            {systems.map((system) => (
              <Link
                key={system.slug}
                to={`/systems/${system.slug}`}
                className="block bg-malumz-cream border border-malumz-brown/10 rounded-lg p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl font-bold text-malumz-text-primary group-hover:text-malumz-orange transition-colors">
                        {system.name}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${trainerColors[system.trainer] || 'bg-gray-100 text-gray-600'}`}>
                        {system.trainer}
                      </span>
                    </div>
                    <p className="text-malumz-text-secondary text-sm">
                      {system.description}
                    </p>
                  </div>
                  <span className="text-malumz-orange font-medium text-sm flex-shrink-0 group-hover:translate-x-1 transition-transform">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-malumz-brown">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <p className="text-white/80 text-sm italic">
            Content source: All expanded content was removed from the print/ebook appendices during the February 2026 trim. The original detailed versions are preserved and being migrated to these pages.
          </p>
        </div>
      </section>
    </div>
  );
};
