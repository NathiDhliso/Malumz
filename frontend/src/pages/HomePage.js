import { Link } from 'react-router-dom';
import { Shield, Users, BookOpen, TrendingUp, Compass, Heart, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const sixTrainers = [
    {
      name: 'Family Trainer',
      tagline: 'Provide, Protect, Love',
      icon: Shield,
      description: 'Love. Protection. Provision. Not money—stability.',
      color: 'text-malumz-orange',
    },
    {
      name: 'Masculine Trainer',
      tagline: 'Strength as service',
      icon: Heart,
      description: 'Strength = Service, not Dominance. Provide. Protect. Love.',
      color: 'text-malumz-gold',
    },
    {
      name: 'Community Trainer',
      tagline: 'The Pack',
      icon: Users,
      description: 'Find your pack. Build accountability. Stop bleeding alone.',
      color: 'text-malumz-orange',
    },
    {
      name: 'Economic Trainer',
      tagline: 'Legacy vs survival',
      icon: TrendingUp,
      description: 'From survival mode to legacy mode.',
      color: 'text-malumz-gold',
    },
    {
      name: 'Academic Trainer',
      tagline: 'Mental diet',
      icon: BookOpen,
      description: "You're not stupid. You were just never trained right.",
      color: 'text-malumz-orange',
    },
    {
      name: 'Spiritual Trainer',
      tagline: 'The Anchor',
      icon: Compass,
      description: 'Your moral anchor when everything else collapses.',
      color: 'text-malumz-gold',
    },
  ];

  const pilotStats = [
    { number: '10', label: 'Brotherhood Circles in Phase 1' },
    { number: '200', label: 'Men in the 2026–2030 pilot' },
    { number: '70%+', label: 'Completion rate target' },
    { number: '6', label: 'Months per Circle' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center bg-malumz-brown">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-32 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            We are building men.<br />20 at a time.
          </h1>
          <p className="font-sans text-lg sm:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            The Dog Trainer is a memoir and framework. Brotherhood Circles are how we put it into practice — 20 men, 6 months, rebuilding across all six dimensions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/join"
              className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start a Circle
            </Link>
            <Link
              to="/book"
              className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Get the Book
            </Link>
            <Link
              to="/crisis"
              className="bg-transparent border-2 border-red-400 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-full px-8 py-4 font-medium text-lg transition-all"
            >
              I Need Help Now
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-malumz-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {pilotStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-malumz-gold mb-2">{stat.number}</div>
                <p className="text-malumz-text-secondary text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-4">
            The Six Trainers
          </h2>
          <p className="text-center text-malumz-text-secondary text-lg mb-16 max-w-2xl mx-auto">
            Six dimensions that every man needs to rebuild. Apartheid systematically destroyed them. Brotherhood Circles restore them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sixTrainers.map((trainer, index) => {
              const Icon = trainer.icon;
              return (
                <div
                  key={index}
                  className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`${trainer.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={48} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-1">
                    {trainer.name}
                  </h3>
                  <p className="text-malumz-gold font-semibold mb-3 text-sm">{trainer.tagline}</p>
                  <p className="text-malumz-text-secondary leading-relaxed">
                    {trainer.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-malumz-cream">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-12">
            From Wild Dog to Self-Trained Leader
          </h2>
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-400 mb-2">21/60</div>
              <p className="text-malumz-text-secondary">Before</p>
            </div>
            <ArrowRight size={48} className="text-malumz-orange" />
            <div className="text-center">
              <div className="text-6xl font-bold text-malumz-gold mb-2">37/60</div>
              <p className="text-malumz-text-secondary">After 18 months</p>
            </div>
          </div>
          <div className="bg-white border-l-4 border-malumz-orange p-8 rounded-lg">
            <p className="font-accent italic text-lg text-malumz-text-secondary leading-relaxed mb-4">
              "In 2024, I scored 21/60. My father had just died. My marriage was shaky. I had no community. I was a Wild Dog — surviving, not living.
            </p>
            <p className="font-accent italic text-lg text-malumz-text-secondary leading-relaxed mb-4">
              18 months later: 37/60. Married. Building. Training others.
            </p>
            <p className="font-accent italic text-lg text-malumz-text-secondary leading-relaxed">
              This is what systematic training looks like."
            </p>
            <p className="text-right text-malumz-text-primary font-semibold mt-6">
              — Nathi Dhliso, Author
            </p>
          </div>
          <div className="text-center mt-8">
            <Link
              to="/about"
              className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-full px-8 py-3 font-medium transition-all inline-block"
            >
              Read the Full Story
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-malumz-brown">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-white text-center mb-12">
            How Brotherhood Circles Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-malumz-gold mb-4">20</div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Men Gather</h3>
              <p className="text-white/70 text-sm">A facilitator recruits 20 men. Ground rules are set. The cost is shared — R10/week stokvel model.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-malumz-gold mb-4">6</div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Months of Work</h3>
              <p className="text-white/70 text-sm">Weekly 2-hour sessions. One Trainer per month. Mind the Gap scoring. Real accountability.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-malumz-gold mb-4">3</div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Choices at the End</h3>
              <p className="text-white/70 text-sm">Graduate and choose: Done (walk away rebuilt), Lead (facilitate a new Circle), or Build (join the infrastructure).</p>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/join"
              className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all inline-block"
            >
              Start a Circle in Your Area
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-12">
            We'll Prove It or Admit We Failed
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-4">
                The Pilot (2026–2030)
              </h3>
              <p className="text-malumz-text-secondary leading-relaxed mb-4">
                10 Brotherhood Circles. 200 men. We track completion rates, relationship improvement, and whether graduates want to lead.
              </p>
              <p className="text-malumz-text-secondary leading-relaxed">
                If the model meets its targets, we scale. If it fails, we publish why and revise. No spin.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-4">
                The Targets
              </h3>
              <ul className="space-y-3 text-malumz-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1 font-bold">70%+</span>
                  <span>Completion rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1 font-bold">50%+</span>
                  <span>Self-reported relationship improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1 font-bold">30%+</span>
                  <span>Graduates who choose to lead new Circles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1 font-bold">Zero</span>
                  <span>Weaponisation incidents</span>
                </li>
              </ul>
              <Link
                to="/results"
                className="inline-block mt-6 text-malumz-orange font-medium hover:underline"
              >
                View live results dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
