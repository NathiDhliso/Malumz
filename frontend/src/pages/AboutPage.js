import { Link } from 'react-router-dom';
import { Calendar, Heart, TrendingUp } from 'lucide-react';

export const AboutPage = () => {
  const timeline = [
    { year: '1991', event: 'Born into post-apartheid chaos', icon: Calendar },
    { year: '1997', event: 'Ma\'am Simula\'s classroom. The imvubu. "You\'re nothing."', icon: Calendar },
    { year: '2000', event: "The birthday card I couldn't sign. The shame of not knowing English.", icon: Calendar },
    { year: '2006', event: "Eviction from 8 Vermooten Street. Big P's quiet defeat.", icon: Calendar },
    { year: '2020', event: 'The pool table pub. Stabbed. Friends watched. Alone.', icon: Calendar },
    { year: '2020', event: 'Big P dies. The anchor is gone.', icon: Heart },
    { year: '2024', event: "Scored 21/60. Finally understood: I'm not broken. I'm untrained.", icon: TrendingUp },
    { year: '2025', event: '37/60. Married Lebo. Started training others.', icon: Heart },
    { year: '2026', event: 'Published "The Dog Trainer." Launched Malumz Movement.', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 36, 30, 0.7), rgba(92, 64, 51, 0.8)), url('https://images.unsplash.com/photo-1597524624057-0a3cba4d77b1?w=1920&h=1080&fit=crop&crop=entropy&cs=srgb&fm=webp&q=75')`,
        }}
        data-testid="about-hero"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white mb-6">
            The Dog Who Trained Himself
          </h1>
          <p className="font-sans text-xl text-white/90">
            From 21/60 to 37/60. From Wild Dog to Malumz.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-malumz-cream" data-testid="timeline-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-16">
            The Story
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-malumz-gold hidden md:block"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex gap-8 items-start"
                    data-testid={`timeline-item-${index}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-16 h-16 bg-malumz-gold rounded-full flex items-center justify-center text-white relative z-10">
                      <Icon size={24} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 bg-white border border-malumz-brown/10 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="text-malumz-orange font-bold text-lg mb-2">
                        {item.year}
                      </div>
                      <p className="text-malumz-text-secondary leading-relaxed">
                        {item.event}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white" data-testid="mission-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-12">
            Why This Exists
          </h2>
          <div className="bg-malumz-paper border-l-4 border-malumz-orange p-12 rounded-lg">
            <p className="font-accent italic text-xl text-malumz-text-secondary leading-relaxed mb-6">
              "This book is the manual I wish Big P could have written for me.
            </p>
            <p className="font-accent italic text-xl text-malumz-text-secondary leading-relaxed mb-6">
              This movement is the Baba network that apartheid destroyed.
            </p>
            <p className="font-accent italic text-xl text-malumz-text-secondary leading-relaxed mb-6">
              I'm not a guru. I'm a graduate of my own curriculum.
            </p>
            <p className="font-accent italic text-xl text-malumz-text-secondary leading-relaxed">
              And if one man can go from 21/60 to 37/60, then 100,000 can too."
            </p>
            <p className="text-right text-malumz-text-primary font-bold mt-8 text-lg">
              — Immanuel N. Dhliso (Nathi)
            </p>
          </div>
          <div className="text-center mt-12">
            <Link
              to="/gap-test"
              data-testid="about-gap-test-cta"
              className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-block"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section
        className="py-24 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 36, 30, 0.5), rgba(92, 64, 51, 0.5)), url('https://images.unsplash.com/photo-1730440593401-6a83a93dacab?w=1920&h=1080&fit=crop&crop=entropy&cs=srgb&fm=webp&q=75')`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-serif text-3xl font-bold text-white mb-4">
            The Movement Starts With You
          </h3>
          <p className="text-white/90 text-lg">
            One man. One score. One choice to rebuild.
          </p>
        </div>
      </section>
    </div>
  );
};
