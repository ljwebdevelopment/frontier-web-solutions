import { ArrowRight, Hammer, LifeBuoy, MessageSquare, Rocket, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PackageCard from '../components/PackageCard.jsx';
import { BUILD_FEE, packages } from '../data/pricing.js';

const perks = [
  { icon: Smartphone, title: 'Looks great on every phone', desc: 'Most of your customers find you on mobile. Every site we build is designed for small screens first.' },
  { icon: ShieldCheck, title: 'Hosting & security handled', desc: 'Hosting, SSL, updates, and backups are all included in your monthly plan. Nothing else to manage.' },
  { icon: LifeBuoy, title: 'Real support, every month', desc: 'Need to change your hours or add a photo? Send us a message and we take care of it.' },
  { icon: Zap, title: 'Fast and simple pricing', desc: `One $${BUILD_FEE} build fee, then one flat monthly price. No surprise invoices.` },
];

const steps = [
  { icon: MessageSquare, title: 'Tell us about your business', desc: 'Fill out the quote form and we\'ll reach out to talk through what you need.' },
  { icon: Hammer, title: 'We build your site', desc: 'We design and build your site, then go over it with you until it\'s right.' },
  { icon: Rocket, title: 'Launch & we keep it running', desc: 'Your site goes live, and your monthly plan keeps it updated, secure, and supported.' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">Websites for small businesses</p>
          <h1>A professional website, <span className="accent">built and cared for.</span></h1>
          <p className="hero__lead">
            We design, launch, and maintain your website so you can focus on running your business.
            ${BUILD_FEE} to build, then plans from ${packages[0].monthly}/mo.
          </p>
          <div className="hero__actions">
            <Link to="/contact" className="button button--primary button--lg">
              Get a Free Quote <ArrowRight size={18} />
            </Link>
            <Link to="/packages" className="button button--outline button--lg">See Packages</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Why Frontier</p>
            <h2>Everything your website needs, in one plan</h2>
          </div>
          <div className="grid grid--4">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div className="perk" key={title}>
                <div className="perk__icon"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Packages</p>
            <h2>Pick the plan that fits</h2>
            <p>Every package starts with a ${BUILD_FEE} one-time build fee. Your monthly plan covers hosting, security, and support.</p>
          </div>
          <div className="grid grid--3">
            {packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
          <p className="section__foot">
            <Link to="/packages" className="link">Compare packages & see add-ons <ArrowRight size={15} /></Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">How it works</p>
            <h2>From first message to launch</h2>
          </div>
          <ol className="steps">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <li className="step" key={title}>
                <div className="step__num">{i + 1}</div>
                <Icon size={22} className="step__icon" />
                <h3>{title}</h3>
                <p>{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

export function CtaBand() {
  return (
    <section className="cta">
      <div className="container cta__inner">
        <h2>Ready to get your business online?</h2>
        <p>Tell us a little about what you need and we'll get back to you with a quote.</p>
        <Link to="/contact" className="button button--light button--lg">
          Get a Free Quote <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
