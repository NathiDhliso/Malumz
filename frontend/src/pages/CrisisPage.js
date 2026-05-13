import { Phone, AlertTriangle, MapPin } from 'lucide-react';
import NotchedSection from '@/components/NotchedSection';

/**
 * CrisisPage — E1 editorial inheritance.
 *
 * Task 7.8 rebases the crisis page onto the E1 token palette, Fraunces
 * display / DM Sans typography, and wraps the hero alarm section in
 * `<NotchedSection tone="sienna">`. The red emergency colour is kept
 * on the action-critical "Call Lifeline" CTA and on the GBV /
 * emergency-signal iconography — lifesaving affordances should remain
 * visually unambiguous. Body sections adopt the editorial charcoal +
 * sienna surfaces that the rest of the site uses.
 *
 * All page copy and the `emergencyNumbers` / `provinces` data
 * constants are preserved byte-for-byte. Section headings and
 * emergency tiles carry `.gs-reveal` so they participate in the
 * global Reveal Batch. No page-specific GSAP timelines are added.
 *
 * Feature: e1-editorial-ui-overhaul
 * @see Requirements 1.*, 2.*, 7.*, 12.*, 25.*, 30.3
 */

const emergencyNumbers = [
  { name: 'GBV Command Centre', number: '0800 428 428', available: '24/7' },
  { name: 'POWA', number: '011 642 4345', available: 'Office hours' },
  { name: 'Lifeline', number: '0861 322 322', available: '24/7' },
  { name: 'SADAG', number: '0800 567 567', available: '24/7' },
];

const provinces = [
  {
    name: 'Gauteng',
    resources: [
      'Lifeline Johannesburg: 011 728 1347',
      'Tshwaranang Legal Advocacy Centre: 011 403 4267',
      'SANCA Johannesburg: 011 892 3829',
    ],
  },
  {
    name: 'Western Cape',
    resources: [
      'Lifeline Cape Town: 021 461 1111',
      'Rape Crisis Cape Town: 021 447 9762',
      'SANCA Western Cape: 021 945 4080',
    ],
  },
  {
    name: 'KwaZulu-Natal',
    resources: [
      'Lifeline Durban: 031 312 2323',
      'Childline KZN: 031 312 0904',
      'SANCA KZN: 031 202 2682',
    ],
  },
  {
    name: 'Eastern Cape',
    resources: [
      'Lifeline PE: 041 507 3777',
      'Masimanyane: 043 743 9169',
    ],
  },
  {
    name: 'Free State',
    resources: [
      'Lifeline Bloemfontein: 051 444 5000',
      'FAMSA Free State: 051 447 7396',
    ],
  },
  {
    name: 'Limpopo',
    resources: [
      'Lifeline Limpopo: 015 291 3"; call local SADAG line',
      'SANCA Limpopo: 015 297 7712',
    ],
  },
  {
    name: 'Mpumalanga',
    resources: [
      'FAMSA Mpumalanga: 013 752 2"; call SADAG 0800 567 567',
    ],
  },
  {
    name: 'North West',
    resources: [
      'FAMSA North West: 018 462 1"; call SADAG 0800 567 567',
    ],
  },
  {
    name: 'Northern Cape',
    resources: [
      'FAMSA Northern Cape: 053 832 2"; call SADAG 0800 567 567',
    ],
  },
];

export const CrisisPage = () => {
  return (
    <div className="min-h-screen bg-e1-bg">
      <NotchedSection tone="sienna" className="pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <AlertTriangle size={64} className="text-red-400 mx-auto mb-6" />
          <h1 className="gs-reveal font-display text-4xl lg:text-5xl font-bold text-e1-text mb-4">
            You Are Not Alone
          </h1>
          <p className="text-lg text-e1-text-muted mb-4 max-w-2xl mx-auto">
            If you are about to hurt someone or yourself, call Lifeline now. The Circle can wait. Your life cannot.
          </p>
          <a
            href="tel:0861322322"
            className="inline-flex items-center gap-3 bg-red-600 text-white rounded-full px-10 py-5 text-xl font-bold shadow-lg hover:bg-red-700 transition-all"
          >
            <Phone size={28} />
            Call Lifeline: 0861 322 322
          </a>
        </div>
      </NotchedSection>

      <section className="py-16 bg-e1-bg">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text mb-8 text-center">
            Emergency Numbers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyNumbers.map((item) => (
              <a
                key={item.name}
                href={`tel:${item.number.replace(/\s/g, '')}`}
                className="gs-reveal flex items-center gap-4 bg-e1-surface border border-e1-text/10 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Phone size={24} className="text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-e1-text">{item.name}</p>
                  <p className="text-e1-primary font-semibold text-lg">{item.number}</p>
                  <p className="text-e1-text-muted text-sm">{item.available}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-e1-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <MapPin size={28} className="text-e1-primary" />
            <h2 className="gs-reveal font-display text-3xl font-bold text-e1-text">
              Find Help in Your Province
            </h2>
          </div>
          <div className="space-y-4">
            {provinces.map((province) => (
              <details
                key={province.name}
                className="gs-reveal bg-e1-bg border border-e1-text/10 rounded-lg overflow-hidden group"
              >
                <summary className="px-6 py-4 cursor-pointer font-display font-bold text-e1-text hover:bg-e1-surface transition-all">
                  {province.name}
                </summary>
                <div className="px-6 pb-4 space-y-2">
                  {province.resources.map((resource, i) => (
                    <p key={i} className="text-e1-text-muted text-sm">
                      {resource}
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-e1-bg">
        <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h3 className="gs-reveal font-display text-2xl font-bold text-e1-text mb-4">
            For Men in Crisis
          </h3>
          <p className="text-e1-text-muted text-lg leading-relaxed">
            "If you are about to hurt someone or yourself, call Lifeline now. The Circle can wait. Your life cannot."
          </p>
        </div>
      </section>
    </div>
  );
};
