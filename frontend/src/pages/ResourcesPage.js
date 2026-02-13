import { Link } from 'react-router-dom';
import { Download, Mic, FileText, Users } from 'lucide-react';

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

export const ResourcesPage = () => {
  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Download size={64} className="text-malumz-gold mx-auto mb-6" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
            Resources
          </h1>
          <p className="text-lg text-malumz-text-secondary max-w-2xl mx-auto">
            Downloadable tools that respect the Oral Rule and Tier 1 reality. Everything here works for a shift worker in Lawley with R20 airtime.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <Mic size={28} className="text-malumz-orange" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              Voice Note Prompts
            </h2>
          </div>
          <p className="text-malumz-text-secondary mb-8">
            MP3 downloads, under 2MB each. For men who prefer listening over reading.
          </p>
          <div className="space-y-4">
            {voiceNotePrompts.map((prompt, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-malumz-cream border border-malumz-brown/10 rounded-lg px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-malumz-orange/10 rounded-full flex items-center justify-center">
                    <Mic size={18} className="text-malumz-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-malumz-text-primary">{prompt.title}</p>
                    <p className="text-malumz-text-muted text-sm">{prompt.duration}</p>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-malumz-orange font-medium text-sm hover:underline flex-shrink-0"
                >
                  Download MP3
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={28} className="text-malumz-gold" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              Printable PDFs
            </h2>
          </div>
          <p className="text-malumz-text-secondary mb-8">
            All under 1MB. Print at your local spaza shop or library.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {printablePDFs.map((pdf, index) => (
              <div
                key={index}
                className="bg-white border border-malumz-brown/10 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <h3 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                  {pdf.title}
                </h3>
                <p className="text-malumz-text-secondary text-sm mb-4">
                  {pdf.description}
                </p>
                <a
                  href="#"
                  className="text-malumz-orange font-medium text-sm hover:underline"
                >
                  Download PDF →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-8">
            Special Guides
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {specialGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <div
                  key={index}
                  className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-8"
                >
                  <Icon size={32} className="text-malumz-gold mb-4" />
                  <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-3">
                    {guide.title}
                  </h3>
                  <p className="text-malumz-text-secondary text-sm mb-4">
                    {guide.description}
                  </p>
                  <a
                    href="#"
                    className="text-malumz-orange font-medium text-sm hover:underline"
                  >
                    Download PDF →
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-malumz-brown">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-serif text-3xl font-bold text-white mb-4">
            Need the Expanded System Guides?
          </h3>
          <p className="text-white/90 mb-8">
            Every exercise from the book has a detailed online guide with breakdowns, Tier 1 adaptations, and practice scenarios.
          </p>
          <Link
            to="/systems"
            className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all inline-block"
          >
            View System Guides
          </Link>
        </div>
      </section>
    </div>
  );
};
