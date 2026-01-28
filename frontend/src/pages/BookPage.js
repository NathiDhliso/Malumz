import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const BookPage = () => {
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    product: 'The Dog Trainer - Digital Book',
    price: 'R299',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const chapters = [
    { title: 'The Six Trainers', subtitle: 'The framework that explains your life' },
    { title: 'The Bantu Kennel', subtitle: 'Why Ma\'am Simula used the imvubu' },
    { title: 'The Soweto Snap', subtitle: 'Steve Biko: The Good Teacher' },
    { title: 'The Hidden Curriculum', subtitle: 'My mother\'s wooden spoon theology' },
    { title: 'The Middle Rungs', subtitle: 'The night they took our house' },
    { title: 'The Township Teachers', subtitle: 'The Grade 2 angel who saved me' },
    { title: 'The 1980s Inferno', subtitle: 'How the Community Trainer burned' },
    { title: 'Negotiation Classrooms', subtitle: 'The closet at Glenview Primary' },
    { title: 'Rainbow Leashes', subtitle: 'Heritage Day in ibheshu. Alone.' },
    { title: 'The Great Betrayal', subtitle: 'BEE\'s cruel math' },
    { title: 'Modern Muzzles', subtitle: 'The velvet leash of success' },
    { title: 'The Dog Who Trained Himself', subtitle: 'Burying Big P. Becoming him.' },
    { title: 'The Grassroots Blueprint', subtitle: 'The ME Center model' },
  ];

  const handleInputChange = (e) => {
    setPurchaseData({ ...purchaseData, [e.target.name]: e.target.value });
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/mock-purchase`, purchaseData);
      setPurchaseSuccess(true);
      setPurchaseData({ name: '', email: '', product: 'The Dog Trainer - Digital Book', price: 'R299' });
    } catch (error) {
      console.error('Purchase submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-malumz-cream" data-testid="book-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Book Cover */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-[480px] bg-gradient-to-br from-malumz-orange to-malumz-brown rounded-lg shadow-2xl flex items-center justify-center p-12">
                  <div className="text-center">
                    <BookOpen size={80} className="text-white mx-auto mb-6" />
                    <h3 className="font-serif text-3xl font-bold text-white mb-4">
                      The Dog Trainer
                    </h3>
                    <p className="text-white/90 text-lg mb-2">
                      From the Bantu Kennel to the Broken Leash
                    </p>
                    <p className="text-white/80 text-sm mt-8">
                      Immanuel N. Dhliso
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Form */}
            <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 shadow-lg">
              {!purchaseSuccess ? (
                <>
                  <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-4">
                    The Dog Trainer
                  </h2>
                  <p className="text-malumz-text-secondary mb-6">Digital Book (PDF)</p>
                  <div className="text-5xl font-bold text-malumz-gold mb-6">R299</div>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-malumz-text-secondary">
                      <CheckCircle2 size={20} className="text-malumz-gold" />
                      <span>Full book (PDF)</span>
                    </div>
                    <div className="flex items-center gap-2 text-malumz-text-secondary">
                      <CheckCircle2 size={20} className="text-malumz-gold" />
                      <span>Free Mind the Gap Worksheet</span>
                    </div>
                    <div className="flex items-center gap-2 text-malumz-text-secondary">
                      <CheckCircle2 size={20} className="text-malumz-gold" />
                      <span>Access to private reader community</span>
                    </div>
                  </div>

                  <form onSubmit={handlePurchase} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={purchaseData.name}
                        onChange={handleInputChange}
                        required
                        data-testid="purchase-name-input"
                        className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={purchaseData.email}
                        onChange={handleInputChange}
                        required
                        data-testid="purchase-email-input"
                        className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      data-testid="purchase-submit-button"
                      className="w-full bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Buy the Book'}
                    </button>
                  </form>
                  
                  <p className="text-center text-sm text-malumz-text-muted mt-4">
                    30-Day Money-Back Guarantee
                  </p>
                </>
              ) : (
                <div className="text-center py-8" data-testid="purchase-success-message">
                  <CheckCircle2 size={64} className="text-malumz-gold mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-4">
                    Purchase Received!
                  </h3>
                  <p className="text-malumz-text-secondary mb-6">
                    Thank you for your order. In a real implementation, you would receive a download link via email.
                  </p>
                  <button
                    onClick={() => setPurchaseSuccess(false)}
                    className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-full px-6 py-2 transition-all"
                  >
                    Make Another Purchase
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside Section */}
      <section className="py-24 bg-white" data-testid="chapters-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-4">
            What's Inside
          </h2>
          <p className="text-center text-malumz-text-secondary mb-12">13 Chapters</p>
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="bg-malumz-cream border border-malumz-brown/10 rounded-lg p-6 hover:shadow-md transition-all"
                data-testid={`chapter-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-malumz-gold rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-malumz-text-secondary">{chapter.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Chapter Section */}
      <section className="py-24 bg-malumz-cream" data-testid="sample-chapter-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="font-serif text-4xl font-bold text-malumz-text-primary text-center mb-12">
            Read This Before You Buy
          </h2>
          <div className="bg-white border border-malumz-brown/10 rounded-xl p-12">
            <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-6">
              Chapter 0: The Six Trainers
            </h3>
            <div className="prose prose-lg max-w-none text-malumz-text-secondary space-y-4 leading-relaxed">
              <p>
                In 2024, I sat in my office and scored myself against a framework I'd developed: The Six Trainers. The result was 21 out of 60.
              </p>
              <p>
                I wasn't depressed. I wasn't surprised. I was finally, for the first time in my life, <em>clear</em>.
              </p>
              <p>
                This book is about those six trainers—the invisible systems that shape a man. Apartheid didn't just take our land and our dignity. It systematically destroyed six training structures that every civilization needs to produce functional men.
              </p>
              <p className="font-semibold">
                The Family Trainer. The Community Trainer. The Academic Trainer. The Economic Trainer. The Identity Trainer. The Spiritual Trainer.
              </p>
              <p>
                Without them, we're not men. We're wild dogs—surviving, not living.
              </p>
              <p>
                This is the story of how I went from 21/60 to 37/60 in 18 months. And how 100,000 more men can do the same.
              </p>
            </div>
            <div className="mt-12 text-center">
              <p className="text-malumz-text-secondary mb-6">Want to read the rest?</p>
              <Link
                to="#purchase"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                data-testid="sample-purchase-cta"
                className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-block"
              >
                Buy the Book - R299
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional CTA */}
      <section className="py-16 bg-malumz-brown">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="font-serif text-3xl font-bold text-white mb-4">
            Not Ready to Buy?
          </h3>
          <p className="text-white/90 text-lg mb-8">
            Take the free Gap Test to see where you score out of 60.
          </p>
          <Link
            to="/gap-test"
            data-testid="book-gap-test-cta"
            className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-block"
          >
            Take the Gap Test (Free)
          </Link>
        </div>
      </section>
    </div>
  );
};
