import { Link } from 'react-router-dom';
import { Eye, Building2, Users, FileText } from 'lucide-react';

const infrastructureItems = [
  'Paid facilitators and social workers',
  'Brotherhood Hotline (24/7 sanity preservation line)',
  'Refuge Rooms (physical spaces for men to decompress)',
  'Crisis Fund (emergency accommodation, transport, food vouchers)',
  'Formal Malumz certification',
];

const malumzRequirements = [
  'Completed 6-month Circle programme',
  'General Malumz: 51/60+ score, qualified in all domains',
  'Specialist Malumz: 9/10+ in one domain, supervised monthly by a General Malumz',
  'Police clearance certificate (non-negotiable)',
  'Wears official Malumz t-shirt during community hours',
];

const antiPredatorProtocols = [
  { name: 'Background Checks', description: 'Police clearance, no sexual offence record, 3 community references. While waiting for SAPS clearance, operate ONLY with a fully cleared Malumz present.' },
  { name: 'Visibility Rule', description: 'Public spaces ONLY. Never private homes, cars, or isolated locations. If it rains or gets dark, session cancelled.' },
  { name: '10-Minute Rule', description: 'Sessions are 5–15 minutes. Longer = refer to Circle or parents. Never take a boy somewhere private.' },
  { name: 'Two-Adult Rule', description: 'Any interaction over 10 minutes requires two Malumz or a parent present.' },
  { name: 'Mandatory Reporting', description: 'Suspected abuse must be reported to Social Development or SAPS immediately. "Protecting the brotherhood" never overrides protecting a child.' },
];

export const VisionPage = () => {
  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <Eye size={64} className="text-malumz-gold mx-auto mb-6" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
            The Vision
          </h1>
          <p className="text-lg text-malumz-text-secondary max-w-2xl mx-auto">
            The book is about what YOU can do. These pages are for the people building what comes next — funders, government, corporate partners, and future Malumz Network guides.
          </p>
          <p className="text-malumz-text-muted text-sm mt-4 italic">
            They don't belong in a man's hands at 2 AM when he's trying to save his family. They belong here.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white" id="infrastructure">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={28} className="text-malumz-orange" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              Formal Infrastructure Vision
            </h2>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-6 mb-8">
            <p className="text-malumz-text-secondary font-semibold">
              None of this exists yet. It is conditional on Phase 1 success.
            </p>
            <p className="text-malumz-text-secondary text-sm mt-2">
              If the pilot meets its targets (70%+ completion, 50%+ relationship improvement, 30%+ want to lead, ZERO weaponisation), we build the infrastructure below. If the pilot fails those targets, we revise or scrap the model.
            </p>
          </div>

          <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-4">
            What We Build If the Pilot Succeeds
          </h3>
          <div className="space-y-3 mb-12">
            {infrastructureItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-malumz-cream rounded-lg p-4">
                <span className="text-malumz-gold font-bold">-</span>
                <span className="text-malumz-text-secondary">{item}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">Phase 2 (2030–2032)</h4>
              <p className="text-malumz-text-secondary text-sm">10 Centres. 500 graduates.</p>
            </div>
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">Phase 3 (2032+)</h4>
              <p className="text-malumz-text-secondary text-sm">Provincial rollout.</p>
            </div>
          </div>
          <p className="text-malumz-text-muted text-sm mt-6 italic">
            Live budget calculations, staffing models, and funding channels will be published here as they are developed.
          </p>
        </div>
      </section>

      <section className="py-20 bg-malumz-cream" id="malumz-network">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <Users size={28} className="text-malumz-gold" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              The Malumz Network
            </h2>
          </div>
          <p className="text-malumz-text-secondary mb-8">
            Verified community guides who provide mentorship outside formal Circle sessions. 5–15 minute guidance in public spaces.
          </p>

          <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-4">
            Requirements
          </h3>
          <div className="space-y-3 mb-12">
            {malumzRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-malumz-brown/10">
                <span className="text-malumz-gold font-bold">-</span>
                <span className="text-malumz-text-secondary">{req}</span>
              </div>
            ))}
          </div>

          <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-4">
            Anti-Predator Protocols
          </h3>
          <div className="space-y-4">
            {antiPredatorProtocols.map((protocol, index) => (
              <div key={index} className="bg-white border border-malumz-brown/10 rounded-lg p-6">
                <h4 className="font-semibold text-malumz-text-primary mb-2">
                  {index + 1}. {protocol.name}
                </h4>
                <p className="text-malumz-text-secondary text-sm">{protocol.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="policy">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={28} className="text-malumz-orange" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              Policy Recommendations
            </h2>
          </div>

          <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-6">
            For Government
          </h3>
          <div className="space-y-6 mb-16">
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                1. Re-evaluate the "Life Orientation" Curriculum
              </h4>
              <p className="text-malumz-text-muted text-sm mb-2">Current LO is often treated as a filler subject.</p>
              <p className="text-malumz-text-secondary">Revise LO to include rigorous modules on Financial Literacy and Emotional Intelligence.</p>
            </div>
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                2. The "Missing Middle" Funding Model
              </h4>
              <p className="text-malumz-text-muted text-sm mb-2">NSFAS serves the poor. Banks serve the rich. The middle collapses.</p>
              <p className="text-malumz-text-secondary">State-backed surety for student loans to the "Missing Middle" (family income R350k–R600k), contingent on academic performance.</p>
            </div>
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                3. Teacher Support, Not Just Assessment
              </h4>
              <p className="text-malumz-text-muted text-sm mb-2">Teachers are overwhelmed.</p>
              <p className="text-malumz-text-secondary">Fund "Admin Assistants" for schools to handle paperwork so teachers can teach. Invest in psycho-social support for teachers.</p>
            </div>
          </div>

          <h3 className="font-serif text-2xl font-bold text-malumz-orange mb-6">
            For Corporate South Africa
          </h3>
          <div className="space-y-6 mb-16">
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                1. Rethink "Culture Fit"
              </h4>
              <p className="text-malumz-text-muted text-sm mb-2">"Culture Fit" is often a mask for "Assimilation."</p>
              <p className="text-malumz-text-secondary">Adopt "Culture Add" hiring. Ask: "What does this person bring that we don't have?"</p>
            </div>
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                2. The Sponsorship vs Mentorship Shift
              </h4>
              <p className="text-malumz-text-muted text-sm mb-2">Mentorship is giving advice. Sponsorship is opening doors.</p>
              <p className="text-malumz-text-secondary">Executives should have KPIs tied to the promotion of their mentees, not just the meeting with them.</p>
            </div>
            <div className="bg-malumz-cream border border-malumz-brown/10 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-malumz-text-primary mb-2">
                3. Fund the "Soft" Infrastructure
              </h4>
              <p className="text-malumz-text-muted text-sm mb-2">Companies love building classrooms. They rarely fund the development.</p>
              <p className="text-malumz-text-secondary">Shift CSI spend from brick-and-mortar to human capital programmes like Brotherhood Circles. A classroom without a developed teacher is just a room.</p>
            </div>
          </div>

          <h3 className="font-serif text-2xl font-bold text-malumz-text-primary mb-6">
            Why This Approach May Face Resistance
          </h3>
          <div className="space-y-3">
            {[
              { reason: 'Political', detail: 'Requires admitting BEE alone isn\'t enough' },
              { reason: 'Ideological', detail: 'Some will call it "patriarchy". But it demands men SERVE, not dominate' },
              { reason: 'Economic', detail: 'Elite benefit from masses staying undeveloped' },
              { reason: 'Cultural', detail: 'Sounds like "traditional gender roles". But with accountability' },
              { reason: 'Personal', detail: 'Some men resist the process because accountability feels like attack' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-malumz-cream rounded-lg p-4">
                <span className="font-bold text-malumz-orange min-w-[100px]">{item.reason}</span>
                <span className="text-malumz-text-secondary">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-malumz-brown">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <p className="text-white/90 text-lg mb-6">
            Want to help build this? Whether you're a funder, researcher, government official, or corporate partner — we're listening.
          </p>
          <Link
            to="/contact"
            className="bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-4 font-semibold text-lg transition-all inline-block"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};
