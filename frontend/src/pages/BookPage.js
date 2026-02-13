import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Download, FileText } from 'lucide-react';

export const BookPage = () => {
  const narrativeChapters = [
    { num: 0, title: 'The Birthday Card' },
    { num: 1, title: 'The Bantu Kennel' },
    { num: 2, title: 'The Fire Before Me' },
    { num: 3, title: 'Seek First the Kingdom' },
    { num: 4, title: 'The Floor Beneath the Ladder' },
    { num: 5, title: 'Saints, Gatekeepers and the Overwhelmed' },
    { num: 6, title: 'Five Friends and a Knife' },
    { num: 7, title: 'The Velvet Muzzle' },
    { num: 8, title: 'The Rainbow Trap' },
    { num: 9, title: 'The Second Eviction' },
    { num: 10, title: 'The Blue-Haired Girl' },
    { num: 11, title: 'Reaping What They Planted' },
    { num: 12, title: 'The Soft Cage' },
    { num: 13, title: 'The Dog Who Trained Himself', note: 'Six Trainers reveal' },
    { num: 14, title: 'The First Circle', note: 'Brotherhood Circles model' },
  ];

  const appendices = [
    { letter: 'A', title: 'Mind the Gap Worksheet', note: 'Self-diagnosis' },
    { letter: 'B', title: 'The Rebuild Toolkit', note: 'All named systems per Trainer' },
    { letter: 'C', title: 'Scaling Beyond Yourself', note: 'Phase 2+ infrastructure' },
  ];

  const purchaseLinks = [
    { name: 'Amazon KDP', url: '#', description: 'Print & Kindle' },
    { name: 'Takealot', url: '#', description: 'South African delivery' },
    { name: 'Gumroad', url: '#', description: 'Direct PDF download' },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="w-80 h-[480px] bg-gradient-to-br from-malumz-orange to-malumz-brown rounded-lg shadow-2xl flex items-center justify-center p-12">
                <div className="text-center">
                  <BookOpen size={80} className="text-white mx-auto mb-6" />
                  <h3 className="font-serif text-3xl font-bold text-white mb-4">
                    The Dog Trainer
                  </h3>
                  <p className="text-white/90 text-sm mb-6">
                    Nkosinathi Dhliso
                  </p>
                  <div className="text-white/60 text-xs space-y-1">
                    <p>Print: 978-1-0492-6434-9</p>
                    <p>eBook: 978-1-0492-6435-6</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
                The Dog Trainer
              </h1>
              <p className="text-malumz-text-secondary text-lg mb-8 leading-relaxed">
                A memoir and framework by Nkosinathi Dhliso. The story of growing up across seven schools in post-apartheid South Africa and discovering that his father had been running a six-part training programme his entire life.
              </p>

              <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-4">
                Get Your Copy
              </h3>
              <div className="space-y-3 mb-8">
                {purchaseLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white border border-malumz-brown/10 rounded-lg px-6 py-4 hover:shadow-md transition-all group"
                  >
                    <div>
                      <span className="font-semibold text-malumz-text-primary">{link.name}</span>
                      <span className="text-malumz-text-muted text-sm ml-2">{link.description}</span>
                    </div>
                    <ExternalLink size={18} className="text-malumz-orange group-hover:translate-x-1 transition-transform" />
                  </a>
                ))}
              </div>

              <div className="bg-white border border-malumz-brown/10 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Download size={20} className="text-malumz-gold" />
                  <span className="font-semibold text-malumz-text-primary">Free Download</span>
                </div>
                <p className="text-malumz-text-secondary text-sm mb-3">
                  Mind the Gap Worksheet (Appendix A) — the self-diagnosis tool from the book.
                </p>
                <a
                  href="#"
                  className="text-malumz-orange font-medium text-sm hover:underline"
                >
                  Download PDF →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-4">
            What's Inside
          </h2>
          <p className="text-center text-malumz-text-secondary mb-12">
            15 narrative chapters + 3 appendices of practical tools
          </p>

          <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-6">
            The Story
          </h3>
          <div className="space-y-3 mb-12">
            {narrativeChapters.map((chapter) => (
              <div
                key={chapter.num}
                className="flex items-center gap-4 bg-malumz-cream border border-malumz-brown/10 rounded-lg px-6 py-4 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-malumz-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {chapter.num}
                </div>
                <div className="flex-1">
                  <span className="font-serif font-bold text-malumz-text-primary">
                    {chapter.title}
                  </span>
                  {chapter.note && (
                    <span className="text-malumz-text-muted text-sm ml-2">— {chapter.note}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-6">
            The Tools
          </h3>
          <div className="space-y-3">
            {appendices.map((appendix) => (
              <div
                key={appendix.letter}
                className="flex items-center gap-4 bg-malumz-cream border border-malumz-brown/10 rounded-lg px-6 py-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-malumz-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {appendix.letter}
                </div>
                <div className="flex-1">
                  <span className="font-serif font-bold text-malumz-text-primary">
                    {appendix.title}
                  </span>
                  <span className="text-malumz-text-muted text-sm ml-2">— {appendix.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-4">
            Free Preview
          </h2>
          <p className="text-center text-malumz-text-secondary mb-12">
            Read Chapter 0 and Chapter 13 before you buy.
          </p>

          <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 md:p-12 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-malumz-orange" />
              <h3 className="font-serif text-2xl font-bold text-malumz-orange">
                Chapter 0: The Birthday Card
              </h3>
            </div>
            <div className="text-malumz-text-secondary space-y-4 leading-relaxed">
              <p>
                In 2024, I sat in my office and scored myself against a framework I'd developed: The Six Trainers. The result was 21 out of 60.
              </p>
              <p>
                I wasn't depressed. I wasn't surprised. I was finally, for the first time in my life, <em>clear</em>.
              </p>
              <p>
                This book is about those six trainers — the invisible systems that shape a man. Apartheid didn't just take our land and our dignity. It systematically destroyed six training structures that every civilization needs to produce functional men.
              </p>
              <p className="font-semibold">
                The Family Trainer. The Masculine Trainer. The Community Trainer. The Economic Trainer. The Academic Trainer. The Spiritual Trainer.
              </p>
              <p>
                Without them, we're not men. We're wild dogs — surviving, not living.
              </p>
            </div>
          </div>

          <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-malumz-orange" />
              <h3 className="font-serif text-2xl font-bold text-malumz-orange">
                Chapter 13: The Dog Who Trained Himself
              </h3>
            </div>
            <div className="text-malumz-text-secondary space-y-4 leading-relaxed">
              <p>
                This is the chapter where the Six Trainers framework is formally revealed. Everything before this was the story. This is the system.
              </p>
              <p>
                The full chapter is available in the book. It contains the Mind the Gap scoring methodology, the Trainer-by-Trainer breakdown, and the self-diagnosis tool that starts your rebuild.
              </p>
            </div>
            <div className="mt-6">
              <p className="text-malumz-text-muted text-sm italic">
                Full chapter available in the book.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-malumz-brown">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-serif text-3xl font-bold text-white mb-4">
            Not Ready to Buy?
          </h3>
          <p className="text-white/90 text-lg mb-8">
            Take the free Mind the Gap Test to see where you score out of 60.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/gap-test"
              className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all inline-block"
            >
              Take the Gap Test (Free)
            </Link>
            <Link
              to="/join"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-malumz-text-primary rounded-full px-8 py-4 font-medium text-lg transition-all inline-block"
            >
              Start a Brotherhood Circle
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
