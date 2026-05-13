import { useState } from 'react';
import { Users, Download, CheckCircle2 } from 'lucide-react';
import { submitContact } from '@/lib/malumzApi';
import NotchedSection from '@/components/NotchedSection';
import MagneticButton from '@/components/MagneticButton';

/**
 * JoinPage — E1 editorial inheritance.
 *
 * Task 7.8 rebases this page onto the E1 token palette
 * (`e1-bg`, `e1-surface`, `e1-primary`, `e1-secondary`, `e1-highlight`,
 * `e1-text`, `e1-text-muted`), the Fraunces display / DM Sans sans
 * typography (`font-display` / `font-sans`), and wraps the hero in
 * `<NotchedSection tone="charcoal">` so the editorial silhouette is
 * inherited. The hero headline and section headings are marked
 * `.gs-reveal` so they participate in the application-wide Reveal
 * Batch driven by `<RevealRoot>`.
 *
 * All copy strings and the `steps` page-level data constant are
 * preserved byte-for-byte. No page-specific GSAP timelines are added;
 * the scroll reveal, cursor, and page-transition systems are inherited
 * from the app shell.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 1.*, 2.*, 7.*, 12.*, 25.*, 30.3
 */

const steps = [
  { num: 1, title: 'Gather 20 Men', description: 'Recruit from your community. Mosque, church, work, WhatsApp groups. You need 20 committed men.' },
  { num: 2, title: 'Establish Ground Rules', description: 'No phones during sessions. Confidentiality is non-negotiable. Respect the process.' },
  { num: 3, title: 'Count the Cost', description: 'R10/week stokvel model. Pool funds for meeting space, printing, and emergencies.' },
  { num: 4, title: 'Download the Starter Pack', description: 'Printable worksheets, ground rules template, crisis numbers, and the 6-month curriculum overview.' },
  { num: 5, title: 'Launch Week 1', description: 'Every man completes the Mind the Gap scoring. This is your baseline. No judgement.' },
  { num: 6, title: 'Run the 6-Month Curriculum', description: 'One Trainer per month. Weekly 2-hour sessions. Follow the book chapter by chapter.' },
  { num: 7, title: 'Graduate and Choose', description: 'Done (walk away rebuilt), Lead (facilitate a new Circle), or Build (join the infrastructure).' },
];

export const JoinPage = () => {
  const [selectedModel, setSelectedModel] = useState('standard');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    model: 'standard',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        subject: `Circle Registration - ${formData.model === 'standard' ? 'Model A' : 'Model B'}`,
        message: `Location: ${formData.location}\nModel: ${formData.model === 'standard' ? 'Model A (Standard, 20 men)' : 'Model B (Micro-Circle, 4 men)'}`,
      });
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-e1-bg">
      <NotchedSection tone="charcoal" className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Users size={64} className="text-e1-highlight mx-auto mb-6" />
          <h1 className="gs-reveal font-display text-4xl lg:text-5xl font-bold text-e1-text mb-4">
            Start a Brotherhood Circle
          </h1>
          <p className="text-lg text-e1-text-muted max-w-2xl mx-auto">
            20 men. 6 months. One Trainer per month. This is how we rebuild — together.
          </p>
        </div>
      </NotchedSection>

      <section className="py-20 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-4 text-center">
            Choose Your Model
          </h2>
          <p className="text-center text-e1-text-muted mb-10">
            Pick the format that fits your community.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => setSelectedModel('standard')}
              className={`gs-reveal text-left border rounded-xl p-8 transition-all ${
                selectedModel === 'standard'
                  ? 'border-e1-primary bg-e1-primary/10 shadow-lg'
                  : 'border-e1-text/10 hover:shadow-md'
              }`}
            >
              <h3 className="font-display text-2xl font-bold text-e1-text mb-2">
                Model A: Standard Circle
              </h3>
              <ul className="space-y-2 text-e1-text-muted text-sm">
                <li>20 men per Circle</li>
                <li>2 hours per week, in person</li>
                <li>6-month programme</li>
                <li>R10/week stokvel model</li>
              </ul>
            </button>
            <button
              onClick={() => setSelectedModel('micro')}
              className={`gs-reveal text-left border rounded-xl p-8 transition-all ${
                selectedModel === 'micro'
                  ? 'border-e1-primary bg-e1-primary/10 shadow-lg'
                  : 'border-e1-text/10 hover:shadow-md'
              }`}
            >
              <h3 className="font-display text-2xl font-bold text-e1-text mb-2">
                Model B: Micro-Circle
              </h3>
              <ul className="space-y-2 text-e1-text-muted text-sm">
                <li>4 men per Circle</li>
                <li>30 minutes per week or WhatsApp voice notes</li>
                <li>6-month programme</li>
                <li>No cost — just commitment</li>
              </ul>
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-12 text-center">
            How to Start Your Circle
          </h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.num} className="gs-reveal flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-e1-secondary rounded-full flex items-center justify-center text-e1-text font-bold text-lg">
                  {step.num}
                </div>
                <div className="flex-1 bg-e1-surface border border-e1-text/10 rounded-lg p-6">
                  <h3 className="font-display text-xl font-bold text-e1-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-e1-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-e1-surface">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="gs-reveal bg-e1-bg border border-e1-text/10 rounded-xl p-8 text-center">
            <Download size={40} className="text-e1-highlight mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-e1-text mb-4">
              Download the Starter Pack
            </h3>
            <p className="text-e1-text-muted mb-6">
              Printable worksheets, ground rules template, crisis numbers, and 6-month curriculum overview.
            </p>
            <MagneticButton
              className="bg-e1-primary text-e1-text hover:bg-e1-primary/90 rounded-full px-8 py-3 font-semibold transition-all inline-block"
            >
              Download Starter Pack (PDF)
            </MagneticButton>
          </div>
        </div>
      </section>

      <section className="py-20 bg-e1-bg">
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-8 text-center">
            Register Your Circle
          </h2>
          {submitSuccess ? (
            <div className="bg-e1-surface border border-e1-text/10 rounded-xl p-8 text-center">
              <CheckCircle2 size={48} className="text-e1-highlight mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-e1-text mb-2">
                Registration Received
              </h3>
              <p className="text-e1-text-muted mb-6">
                We'll be in touch within 48 hours to help you set up your Circle.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-e1-primary font-medium hover:underline"
              >
                Register another Circle
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-e1-surface border border-e1-text/10 rounded-xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-e1-text-muted mb-2">
                  Facilitator Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-e1-text-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-e1-text-muted mb-2">
                  Location (area/township)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Soweto Zone 6, Lawley Ext 3"
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-e1-text-muted mb-2">
                  Circle Model
                </label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full bg-e1-bg border border-e1-text/20 rounded-lg px-4 py-3 text-e1-text focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
                >
                  <option value="standard">Model A: Standard (20 men, 2hrs/week)</option>
                  <option value="micro">Model B: Micro-Circle (4 men, 30min/week or WhatsApp)</option>
                </select>
              </div>
              <MagneticButton
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-e1-primary text-e1-text hover:bg-e1-primary/90 rounded-full px-8 py-4 font-semibold text-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Register My Circle'}
              </MagneticButton>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
