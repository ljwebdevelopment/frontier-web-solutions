import {
  ArrowRight,
  Check,
  Code2,
  Gauge,
  Hammer,
  LifeBuoy,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrowserMock from '../components/BrowserMock.jsx';
import PackageCard from '../components/PackageCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { BUILD_FEE, packages } from '../data/pricing.js';

const industries = [
  'Restaurants', 'Contractors', 'Salons & Barbers', 'Fitness Studios', 'Real Estate', 'Auto Shops',
  'Landscapers', 'Retail Shops', 'Churches', 'Nonprofits', 'Photographers', 'Cleaning Services',
];

const proof = [
  { icon: Code2, title: 'Hand-built, not a template', desc: 'Every site is designed and coded from scratch for your business. No cookie-cutter themes.' },
  { icon: Gauge, title: 'Fast by default', desc: 'Lean, modern code that loads quickly, because slow sites lose customers before they ever see you.' },
  { icon: Smartphone, title: 'Designed for phones first', desc: 'Most people find you on their phone. Your site will look and work great on every screen.' },
  { icon: ShieldCheck, title: 'Secure and looked after', desc: 'SSL, updates, and backups are handled every month, so your site never goes stale or breaks.' },
];

const included = [
  'Custom design',
  'Hosting',
  'SSL security',
  'Backups',
  'Monthly edits',
  'Real support',
];

const versus = [
  { diy: 'Hours of your nights and weekends', fws: 'We build it. You run your business.' },
  { diy: 'A template that looks like everyone else', fws: 'A custom design made for your brand' },
  { diy: 'You fix it when something breaks', fws: 'We update, monitor, and fix it for you' },
  { diy: 'Figuring out hosting, SSL, and domains', fws: 'All of it set up and included' },
  { diy: 'No one to call when you need a change', fws: 'Send a message and it gets done' },
];

const steps = [
  { icon: MessageSquare, title: 'Tell us about your business', desc: 'Fill out the quick quote form. We\'ll reach out to learn what you do and what you need.' },
  { icon: Hammer, title: 'We design & build it', desc: 'We create your site and refine it with you until you\'re proud to share it.' },
  { icon: Rocket, title: 'Launch, then we keep it sharp', desc: 'Your site goes live, and your monthly plan keeps it updated, secure, and supported.' },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__copy">
            <div className="pill"><Sparkles size={14} /> Custom websites for small businesses</div>
            <h1>
              Your business deserves a website that <span className="gradient-text">sells.</span>
            </h1>
            <p className="hero__lead">
              We design, build, and maintain fast, beautiful websites that make customers trust you
              the moment they land, and give them every reason to call.
            </p>
            <div className="hero__actions">
              <Link to="/contact" className="button button--primary button--lg">
                Get a Free Quote <ArrowRight size={18} />
              </Link>
              <Link to="/packages" className="button button--ghost button--lg">See Packages</Link>
            </div>
            <ul className="hero__points">
              <li><Check size={16} strokeWidth={3} /> ${BUILD_FEE} to build</li>
              <li><Check size={16} strokeWidth={3} /> From ${packages[0].monthly}/mo</li>
              <li><Check size={16} strokeWidth={3} /> Hosting & support included</li>
            </ul>
          </div>
          <BrowserMock />
        </div>
      </section>

      {/* ── Industries marquee ── */}
      <div className="marquee" aria-label="Built for businesses like yours">
        <div className="marquee__track">
          {[...industries, ...industries].map((name, i) => (
            <span key={i} aria-hidden={i >= industries.length}>{name}</span>
          ))}
        </div>
      </div>

      {/* ── Proof: this site ── */}
      <section className="section">
        <div className="container split">
          <Reveal className="split__copy">
            <p className="eyebrow">See for yourself</p>
            <h2>You're looking at our work right now.</h2>
            <p className="lead">
              This website was designed and hand-coded by Frontier Web Systems. The speed, the polish,
              the way it feels on your phone: that's exactly what we build for our clients.
            </p>
            <Link to="/contact" className="link">I want a site like this <ArrowRight size={16} /></Link>
          </Reveal>
          <div className="proof-grid">
            {proof.map(({ icon: Icon, title, desc }, i) => (
              <Reveal className="proof" key={title} delay={i * 80}>
                <div className="icon-tile"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it matters (dark) ── */}
      <section className="section section--dark">
        <div className="container">
          <Reveal className="section__head">
            <p className="eyebrow">Why it matters</p>
            <h2>Your website is your first impression. Make it count.</h2>
            <p>
              Before customers call, visit, or buy, they look you up. An outdated or broken site sends them
              straight to your competitor. A great one makes the decision easy.
            </p>
          </Reveal>
          <Reveal className="versus">
            <div className="versus__col versus__col--diy">
              <h3>Doing it yourself</h3>
              <ul>
                {versus.map((v) => <li key={v.diy}><X size={16} strokeWidth={3} /> {v.diy}</li>)}
              </ul>
            </div>
            <div className="versus__col versus__col--fws">
              <h3>With Frontier</h3>
              <ul>
                {versus.map((v) => <li key={v.fws}><Check size={16} strokeWidth={3} /> {v.fws}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="section section--soft">
        <div className="container">
          <Reveal className="section__head">
            <p className="eyebrow">Packages</p>
            <h2>Launch for ${BUILD_FEE}. Then one simple monthly price.</h2>
            <p>No thousands of dollars upfront. Every plan includes:</p>
            <ul className="chips">
              {included.map((c) => <li key={c}><Check size={14} strokeWidth={3} /> {c}</li>)}
            </ul>
          </Reveal>
          <div className="grid grid--3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 100}><PackageCard pkg={pkg} /></Reveal>
            ))}
          </div>
          <p className="section__foot">
            <Link to="/packages" className="link">Compare every feature & see add-ons <ArrowRight size={16} /></Link>
          </p>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <p className="eyebrow">How it works</p>
            <h2>From first message to launch in 2–4 weeks</h2>
          </Reveal>
          <ol className="steps">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <Reveal as="li" className="step" key={title} delay={i * 100}>
                <div className="step__num">0{i + 1}</div>
                <div className="icon-tile"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="support-band">
            <LifeBuoy size={28} />
            <div>
              <h3>We don't disappear after launch.</h3>
              <p>Need new photos, updated hours, or a holiday special? Send us a message and we'll handle it.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

export function CtaBand() {
  return (
    <section className="cta">
      <div className="cta__glow" aria-hidden="true" />
      <Reveal className="container cta__inner">
        <h2>Ready to look like the best in town?</h2>
        <p>Tell us about your business. We'll get back to you with a clear plan and a quote, free.</p>
        <Link to="/contact" className="button button--light button--lg">
          Get My Free Quote <ArrowRight size={18} />
        </Link>
      </Reveal>
    </section>
  );
}
