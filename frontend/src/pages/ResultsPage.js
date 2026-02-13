import { Link } from 'react-router-dom';
import { BarChart3, Target, Calendar } from 'lucide-react';

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

export const ResultsPage = () => {
  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <BarChart3 size={64} className="text-malumz-gold mx-auto mb-6" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
            Results
          </h1>
          <p className="text-lg text-malumz-text-secondary max-w-2xl mx-auto">
            Transparent reporting for the 2026–2030 pilot. Updated quarterly. If the model works, you'll see the proof. If it fails, we'll tell you why.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <Target size={28} className="text-malumz-orange" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              Live Dashboard
            </h2>
          </div>
          <p className="text-malumz-text-muted text-sm mb-8 italic">
            Updated quarterly. Pilot data collection begins with the first Brotherhood Circle.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {dashboardMetrics.map((metric, index) => (
              <div
                key={index}
                className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6"
              >
                <h3 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                  {metric.label}
                </h3>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-malumz-gold">{metric.current}</span>
                  <span className="text-malumz-text-muted text-sm">target: {metric.target}</span>
                </div>
                <p className="text-malumz-text-muted text-sm">{metric.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <Calendar size={28} className="text-malumz-gold" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              Phase Tracker
            </h2>
          </div>
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`bg-white border rounded-xl p-8 ${
                  phase.status === 'Current'
                    ? 'border-malumz-orange shadow-lg'
                    : 'border-malumz-brown/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl font-bold text-malumz-text-primary">
                        {phase.name}
                      </h3>
                      {phase.status === 'Current' && (
                        <span className="bg-malumz-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-malumz-text-muted">{phase.period}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-malumz-gold">{phase.circles}</div>
                      <p className="text-malumz-text-muted text-xs">Circles</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-malumz-gold">{phase.men}</div>
                      <p className="text-malumz-text-muted text-xs">Men</p>
                    </div>
                  </div>
                </div>
                <p className="text-malumz-text-secondary">{phase.description}</p>
                {phase.status !== 'Current' && (
                  <p className="text-malumz-text-muted text-sm mt-2 italic">
                    {phase.status}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-6">
            Open Invitation
          </h2>
          <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-8">
            <p className="text-malumz-text-secondary leading-relaxed mb-4">
              Universities and researchers are welcome to audit these results. We have nothing to hide because hiding failure would make us no different from the systems we're trying to fix.
            </p>
            <p className="text-malumz-text-secondary leading-relaxed mb-6">
              Budget transparency: what each Circle costs and where the money comes from will be published here as data becomes available.
            </p>
            <Link
              to="/contact"
              className="text-malumz-orange font-medium hover:underline"
            >
              Contact us for research partnerships →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
