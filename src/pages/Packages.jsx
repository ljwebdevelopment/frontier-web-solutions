import { Plus } from 'lucide-react';
import PackageCard from '../components/PackageCard.jsx';
import { addOns, BUILD_FEE, packages } from '../data/pricing.js';
import { CtaBand } from './Home.jsx';

const faqs = [
  {
    q: `What does the $${BUILD_FEE} build fee cover?`,
    a: 'Designing and building your site, setting up your pages and contact form, connecting your domain, and launching it. It\'s the same for every package.',
  },
  {
    q: 'What does the monthly plan include?',
    a: 'Hosting, SSL, security updates, backups, support, and a set amount of edit time each month. The difference between packages is the size of the site, the features, and how much edit time you get.',
  },
  {
    q: 'Can I switch packages later?',
    a: 'Yes. As your business grows you can move up to a bigger package. We\'ll add the new pages and features and your monthly price changes from then on.',
  },
  {
    q: 'Is there a long-term contract?',
    a: 'No. Monthly plans are month-to-month and you can cancel any time.',
  },
  {
    q: 'How long does it take to build?',
    a: 'Most sites launch in 2–4 weeks. Need it sooner? Add rush delivery and launch in about a week.',
  },
];

export default function Packages() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Packages & Pricing</p>
          <h1>Simple, honest pricing</h1>
          <p>
            <strong>${BUILD_FEE} one-time build fee</strong> on every package, then one flat monthly price.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="grid grid--3">
            {packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </div>
      </section>

      <section className="section section--soft" id="add-ons">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Add-ons</p>
            <h2>Add extras to any package</h2>
            <p>Add these when you sign up or any time after.</p>
          </div>
          <div className="addons">
            {addOns.map((a) => (
              <div className="addon" key={a.name}>
                <div className="addon__icon"><Plus size={18} /></div>
                <div className="addon__body">
                  <h3>{a.name}</h3>
                  <p>{a.desc}</p>
                </div>
                <div className="addon__price">
                  {a.price}
                  <span>{a.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          <div className="section__head">
            <p className="eyebrow">FAQ</p>
            <h2>Common questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details className="faq__item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
