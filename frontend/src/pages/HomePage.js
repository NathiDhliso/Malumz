import { Link } from 'react-router-dom';
import { Shield, Users, BookOpen, TrendingUp, Compass, Heart, ArrowRight, Target } from 'lucide-react';

export const HomePage = () => {
  const sixTrainers = [
    {
      name: 'Family Trainer',
      icon: Shield,
      score: '8/10',
      description: 'Love. Protection. Provision. Not money—stability.',
      color: 'text-malumz-orange',
    },
    {
      name: 'Community Trainer',
      icon: Users,
      score: 'Ubuntu lives',
      description: 'Find your pack. Build accountability. Stop bleeding alone.',
      color: 'text-malumz-gold',
    },
    {
      name: 'Academic Trainer',
      icon: BookOpen,
      score: 'Structure heals',
      description: "You're not stupid. You were just never trained right.",
      color: 'text-malumz-orange',
    },
    {
      name: 'Economic Trainer',
      icon: TrendingUp,
      score: 'Legacy mode',
      description: 'From survival mode to legacy mode.',
      color: 'text-malumz-gold',
    },
    {
      name: 'Identity Trainer',
      icon: Heart,
      score: 'Core Rule',
      description: 'Strength = Service, not Dominance. Provide. Protect. Love.',
      color: 'text-malumz-orange',
    },
    {
      name: 'Spiritual Trainer',
      icon: Compass,
      score: 'Kingdom first',
      description: 'Your moral anchor when everything else collapses.',
      color: 'text-malumz-gold',
    },
  ];

  const products = [
    {
      name: 'The Dog Trainer',
      subtitle: 'Digital Book',
      price: 'R299',
      features: [
        'Full book (PDF)',
        'Free Mind the Gap Worksheet',
        'Access to private reader community',
      ],
      cta: 'Buy the Book',
      link: '/book',
      badge: null,
    },
    {
      name: '30-Day Rebuild Program',
      subtitle: 'The Training',
      price: 'R3,500',
      features: [
        'Guided daily exercises',
        'Weekly Malumz check-ins',
        'Private WhatsApp accountability group',
        'Progress tracking dashboard',
      ],
      cta: 'Start Training',
      link: '/book',
      badge: 'MOST POPULAR',
    },
    {
      name: 'Malumz Certification',
      subtitle: 'The Path',
      price: 'R15,000',
      features: [
        '6-month training program',
        'Background check & verification',
        'Official Malumz shirt + ID',
        'Join Alumni Network',
      ],
      cta: 'Apply Now',
      link: '/contact',
      badge: null,
    },
  ];

  const stats = [
    { number: '100,000', label: 'Men we\'ll train by 2030' },
    { number: '1,000', label: 'ME Centers across South Africa' },
    { number: '30%', label: 'GBV reduction target in pilot areas' },
    { number: 'R1 billion', label: 'Movement economy we\'re building' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 36, 30, 0.7), rgba(92, 64, 51, 0.8)), url('https://images.unsplash.com/photo-1633108091790-4cfd06e8d5da?crop=entropy&cs=srgb&fm=jpg&q=85')`,
        }}
        data-testid="hero-section"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-32 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            You're Not Broken.<br />You Were Never Trained.
          </h1>
          <p className="font-sans text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            From 21/60 to 37/60 in 18 months. The Six Trainers Framework that rebuilt one man—and can rebuild 100,000 more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/gap-test"
              data-testid="hero-gap-test-cta"
              className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Take The Gap Test (Free)
            </Link>
            <Link
              to="/about"
              data-testid="hero-read-story-cta"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-malumz-text-primary rounded-full px-8 py-4 font-medium text-lg transition-all"
            >
              Read The Story
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-malumz-brown" data-testid="problem-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-white text-center mb-16">
            You've Felt This Before
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
              <div className="text-malumz-gold mb-4">
                <Target size={40} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white mb-4">
                Your Father Tried. The System Broke Him.
              </h3>
              <p className="text-white/80 leading-relaxed">
                Migrant labor. Unemployment. No Baba to teach you how to be a man. You're not angry at him—you're lost without him.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
              <div className="text-malumz-gold mb-4">
                <Users size={40} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white mb-4">
                Your Boys Left You Bleeding
              </h3>
              <p className="text-white/80 leading-relaxed">
                The pool table pub. The eviction. The moment you needed help and no one came. The Community Trainer is dead.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
              <div className="text-malumz-gold mb-4">
                <Compass size={40} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white mb-4">
                You're Performing, Not Living
              </h3>
              <p className="text-white/80 leading-relaxed">
                Corporate code-switching. The velvet leash. You're successful on paper but feel like a fraud. Heritage Day in a costume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Six Trainers Section */}
      <section className="py-24 bg-malumz-cream" data-testid="six-trainers-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-4">
            The Six Trainers That Apartheid Broke
          </h2>
          <p className="text-center text-malumz-text-secondary text-lg mb-16">
            —And How to Rebuild Them
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sixTrainers.map((trainer, index) => {
              const Icon = trainer.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-malumz-brown/10 rounded-xl p-8 hover:shadow-lg transition-all duration-300 group hover:scale-105"
                  data-testid={`trainer-card-${index}`}
                >
                  <div className={`${trainer.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={48} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-2">
                    {trainer.name}
                  </h3>
                  <p className="text-malumz-gold font-semibold mb-3">{trainer.score}</p>
                  <p className="text-malumz-text-secondary leading-relaxed">
                    {trainer.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-24 bg-white" data-testid="transformation-section">
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
          <div className="bg-malumz-paper border-l-4 border-malumz-orange p-8 rounded-lg">
            <p className="font-accent italic text-lg text-malumz-text-secondary leading-relaxed mb-4">
              "In 2024, I scored 21/60. My father had just died. My marriage was shaky. I had no community. I was a Wild Dog—surviving, not living.
            </p>
            <p className="font-accent italic text-lg text-malumz-text-secondary leading-relaxed mb-4">
              18 months later: 37/60. Married. Building. Training others.
            </p>
            <p className="font-accent italic text-lg text-malumz-text-secondary leading-relaxed">
              This is what systematic training looks like."
            </p>
            <p className="text-right text-malumz-text-primary font-semibold mt-6">
              — Nathi Dhliso, Founder
            </p>
          </div>
          <div className="text-center mt-8">
            <Link
              to="/about"
              data-testid="read-full-story-cta"
              className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-full px-8 py-3 font-medium transition-all inline-block"
            >
              Read the Full Story
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-malumz-cream" data-testid="products-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-16">
            Start Your Rebuild Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={index}
                className={`bg-white border rounded-xl p-8 flex flex-col relative ${
                  product.badge
                    ? 'border-malumz-orange shadow-xl scale-105'
                    : 'border-malumz-brown/10 hover:shadow-lg'
                } transition-all duration-300`}
                data-testid={`product-card-${index}`}
              >
                {product.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-malumz-orange text-white text-xs font-bold px-4 py-2 rounded-full">
                    {product.badge}
                  </div>
                )}
                <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-2">
                  {product.name}
                </h3>
                <p className="text-malumz-text-secondary mb-4">{product.subtitle}</p>
                <div className="text-4xl font-bold text-malumz-gold mb-6">{product.price}</div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-malumz-text-secondary">
                      <span className="text-malumz-gold mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={product.link}
                  data-testid={`product-cta-${index}`}
                  className={`text-center rounded-full px-6 py-3 font-medium transition-all ${
                    product.badge
                      ? 'bg-malumz-orange text-white hover:bg-malumz-orange-dark'
                      : 'bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white'
                  }`}
                >
                  {product.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section
        className="py-24 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 36, 30, 0.9), rgba(92, 64, 51, 0.9)), url('https://images.unsplash.com/photo-1761666520005-3ffcf13e74c8?crop=entropy&cs=srgb&fm=jpg&q=85')`,
        }}
        data-testid="vision-section"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-white text-center mb-16">
            This Isn't a Course. It's a Movement.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-5xl font-bold text-malumz-gold mb-2">{stat.number}</div>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white text-lg leading-relaxed mb-6">
              "BEE failed us. R100 million tenders built one mansion while the township starved.
            </p>
            <p className="text-white text-lg leading-relaxed mb-6">
              What if we took that same R100 million and trained 10,000 men instead?
            </p>
            <p className="text-white text-lg leading-relaxed mb-6">
              That's 10,000 stable families. 20,000 children with fathers. 50,000 boys with Malumz.
            </p>
            <p className="text-white text-lg leading-relaxed mb-8 font-semibold">
              This is how we rebuild what apartheid destroyed."
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white" data-testid="trust-section">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-12">
            Version 1.0: We'll Prove It or Admit We Failed
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-4">
                The Promise
              </h3>
              <p className="text-malumz-text-secondary leading-relaxed mb-4">
                This isn't theory. This is a pilot program.
              </p>
              <p className="text-malumz-text-secondary leading-relaxed mb-4">
                Between 2026-2028, we'll run the first ME Centers in Thokoza, Soweto, and Tembisa. We'll track completion rates, family stability metrics, and GBV reduction in pilot areas.
              </p>
              <p className="text-malumz-text-secondary leading-relaxed">
                In 2028, we'll publish Version 2.0 of this book with honest results. If it works, you'll see the proof. If it fails, we'll tell you why.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-4">
                The Accountability
              </h3>
              <ul className="space-y-3 text-malumz-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1">•</span>
                  Progress reports published quarterly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1">•</span>
                  Financials available on request
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1">•</span>
                  Community oversight board (not government-controlled)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-malumz-gold mt-1">•</span>
                  Contact: <a href="mailto:nkosinathi.dhliso@gmail.com" className="text-malumz-orange hover:underline">nkosinathi.dhliso@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
