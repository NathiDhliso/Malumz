import { Link } from 'react-router-dom';
import { Calendar, Heart, TrendingUp, Mail } from 'lucide-react';

export const AboutPage = () => {
  const timeline = [
    { year: 'Late Dec 1991', event: 'Born. Post-apartheid South Africa. The first generation that was supposed to be free.', icon: Calendar },
    { year: 'Seven Schools', event: 'Moved across seven schools. Each one a different lesson in what apartheid left behind.', icon: Calendar },
    { year: '2020', event: 'Big P dies. The anchor is gone. The man who had been running a six-part training programme my entire life — without ever naming it.', icon: Heart },
    { year: '2024', event: 'Scored 21/60. Finally understood: I\'m not broken. I\'m untrained. The Six Trainers framework crystallises.', icon: TrendingUp },
    { year: '2025', event: '37/60. Married. Building. Started training others. The Brotherhood Circles concept takes shape.', icon: Heart },
    { year: '2026', event: 'Published "The Dog Trainer." Launched the first Brotherhood Circles pilot.', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-brown">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
            About
          </h1>
          <p className="font-sans text-xl text-white/90 max-w-2xl mx-auto">
            Nkosinathi Dhliso. Born late December 1991. Seven schools. The full journey.
          </p>
        </div>
      </section>

      <section className="py-24 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-16">
            The Story
          </h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-malumz-gold hidden md:block"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex gap-8 items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-malumz-gold rounded-full flex items-center justify-center text-white relative z-10">
                      <Icon size={24} />
                    </div>
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

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-12">
            The Mission
          </h2>
          <div className="bg-malumz-paper border-l-4 border-malumz-orange p-8 md:p-12 rounded-lg mb-12">
            <p className="font-accent italic text-xl text-malumz-text-secondary leading-relaxed">
              "We cannot fix the cycle by only treating the symptoms. We must address the root: untrained men mass-producing broken families."
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-malumz-cream rounded-xl p-8">
              <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-4">
                The Book
              </h3>
              <p className="text-malumz-text-secondary leading-relaxed">
                The Dog Trainer is a memoir and framework. It tells the story of growing up across seven schools in post-apartheid South Africa and formalises the Six Trainers framework — the six dimensions every man needs to rebuild.
              </p>
              <Link
                to="/book"
                className="inline-block mt-4 text-malumz-orange font-medium hover:underline"
              >
                Get the book →
              </Link>
            </div>
            <div className="bg-malumz-cream rounded-xl p-8">
              <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-4">
                Brotherhood Circles
              </h3>
              <p className="text-malumz-text-secondary leading-relaxed">
                The community-based model where 20 men meet weekly for 6 months to rebuild themselves across all six dimensions. The book is the constitution. The Circles are the practice.
              </p>
              <Link
                to="/join"
                className="inline-block mt-4 text-malumz-orange font-medium hover:underline"
              >
                Start a Circle →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-8 text-center">
            Contact
          </h2>
          <div className="flex flex-col items-center gap-4">
            <a
              href="mailto:nkosinathi.dhliso@gmail.com"
              className="inline-flex items-center gap-3 text-malumz-orange font-medium hover:underline text-lg"
            >
              <Mail size={20} />
              nkosinathi.dhliso@gmail.com
            </a>
            <Link
              to="/contact"
              className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-3 font-semibold transition-all inline-block"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
