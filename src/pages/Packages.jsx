import { Check, Minus, Plus } from 'lucide-react';
import PackageCard from '../components/PackageCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { addOns, BUILD_FEE, comparison, packages } from '../data/pricing.js';
import { CtaBand } from './Home.jsx';

const faqs = [
  {
    q: `What does the $${BUILD_FEE} build fee cover?`,
    a: 'Designing and building your site, setting up your pages and contact form, connecting your domain, and launching it. It\'s the same for every package.',
  },
  {
    q: 'What does the monthly plan include?',
    a: 'Hosting, SSL, security updates, backups, support, and a set amount of edit time each month. Packages differ in site size, features, and how much edit time you get.',
  },
  {
    q: 'Can I switch packages later?',
    a: 'Yes. As your business grows you can move up. We\'ll add the new pages and features and your monthly price changes from then on.',
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

function Cell({ value }) {
  if (value === true) return <Check size={18} strokeWidth={3} className="compare__yes" aria-label="Included" />;
  if (value === false) return <Minus size={18} className="compare__no" aria-label="Not included" />;
  return value;
}

export default function Packages() {
  return (
    <>
      <section className="page-head">
        <div className="hero__glow" aria-hidden="true" />
        <div className="container page-head__inner">
          <p className="eyebrow">Packages & Pricing</p>
          <h1>Professional websites, <span className="gradient-text">priced for small business.</span></h1>
          <p>
            <strong>${BUILD_FEE} one-time build</strong> on every package, then one flat monthly price with
            hosting, security, and support built in.
          </p>
        </div>
      </section>

      <section className="section section--overlap">
        <div className="container">
          <div className="grid grid--3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 100}><PackageCard pkg={pkg} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <Reveal className="section__head">
            <p className="eyebrow">Compare</p>
            <h2>Every feature, side by side</h2>
          </Reveal>
          <Reveal className="compare">
            <table>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  {packages.map((p) => (
                    <th scope="col" key={p.id} className={p.featured ? 'is-featured' : ''}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((v, i) => (
                      <td key={i} className={packages[i].featured ? 'is-featured' : ''}><Cell value={v} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      <section className="section" id="add-ons">
        <div className="container">
          <Reveal className="section__head">
            <p className="eyebrow">Add-ons</p>
            <h2>Power up any package</h2>
            <p>Add these when you sign up or any time after.</p>
          </Reveal>
          <div className="addons">
            {addOns.map((a, i) => (
              <Reveal className="addon" key={a.name} delay={(i % 2) * 80}>
                <div className="addon__icon"><Plus size={18} /></div>
                <div className="addon__body">
                  <h3>{a.name}</h3>
                  <p>{a.desc}</p>
                </div>
                <div className="addon__price">
                  {a.price}
                  <span>{a.unit}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container container--narrow">
          <Reveal className="section__head">
            <p className="eyebrow">FAQ</p>
            <h2>Questions, answered</h2>
          </Reveal>
          <Reveal className="faq">
            {faqs.map((f) => (
              <details className="faq__item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
