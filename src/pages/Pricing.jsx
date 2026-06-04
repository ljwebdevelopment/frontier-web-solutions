import { ArrowRight, CheckCircle2, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    tier: 'Starter',
    price: '$300',
    period: 'one-time',
    desc: 'A professional website for businesses that need a clean, credible web presence to get started.',
    features: [
      'Up to 5 custom pages',
      'Mobile-responsive design',
      'Contact form setup',
      'Basic on-page SEO',
      'Google Analytics integration',
      'SSL certificate',
      'Client portal access',
      { text: 'Custom web application', included: false },
      { text: 'Priority support response', included: false },
    ],
    cta: 'Get Started',
    ctaVariant: 'ghost',
  },
  {
    tier: 'Professional',
    price: '$600',
    period: 'one-time',
    desc: 'A comprehensive build for businesses that need a polished site with deeper content and functionality.',
    badge: 'Most Popular',
    featured: true,
    features: [
      'Up to 10 custom pages',
      'Mobile-responsive design',
      'Contact & intake forms',
      'Full on-page SEO setup',
      'Google Analytics 4 + Search Console',
      'SSL certificate',
      'Client portal access',
      'Blog or resources section',
      { text: 'Custom web application', included: false },
    ],
    cta: 'Get Started',
    ctaVariant: 'primary',
  },
  {
    tier: 'Custom',
    price: 'Custom',
    period: 'project',
    desc: 'For businesses that need a web application, booking system, or a fully custom digital solution.',
    features: [
      'Unlimited pages',
      'Custom web application',
      'Custom booking or intake systems',
      'Advanced integrations',
      'Full SEO setup',
      'Analytics & reporting dashboard',
      'SSL certificate',
      'Client portal access',
      'Priority support response',
    ],
    cta: 'Talk to Us',
    ctaVariant: 'secondary',
  },
];

const maintenance = [
  {
    tier: 'Basic Care',
    price: '$95',
    period: '/mo',
    desc: 'Core monthly maintenance to keep your site current and your team reachable.',
    features: [
      'Monthly content updates',
      'Security & software patches',
      'Uptime monitoring',
      'Support request portal',
      '2 support hours/month included',
    ],
  },
  {
    tier: 'Active Care',
    price: '$175',
    period: '/mo',
    desc: 'Expanded support for businesses that update frequently or want faster turnaround.',
    badge: 'Most Popular',
    featured: true,
    features: [
      'All Basic Care features',
      'Priority response (< 4 hrs)',
      '5 support hours/month included',
      'Monthly performance report',
      'SEO health checks',
    ],
  },
  {
    tier: 'Full Management',
    price: '$350',
    period: '/mo',
    desc: 'Comprehensive site management for businesses that want a fully hands-off web presence.',
    features: [
      'All Active Care features',
      'Unlimited content updates',
      'Monthly analytics review',
      'Quarterly strategy review',
      'Dedicated account manager',
    ],
  },
];

const faqs = [
  {
    q: 'Is the maintenance plan required?',
    a: 'Yes. Every website we build comes with a mandatory monthly maintenance plan starting at $95/mo. This ensures your site stays updated, secure, and supported long after launch.',
  },
  {
    q: 'What happens if I want to cancel?',
    a: 'Maintenance plans are month-to-month with no long-term contracts. You can cancel at any time. You retain ownership of your website files and domain.',
  },
  {
    q: 'Do you work with existing websites?',
    a: 'Yes. We offer redesigns and maintenance plans for sites you already have, even if we didn\'t build them. We\'ll review what\'s there and recommend the best path forward.',
  },
  {
    q: 'How long does a build take?',
    a: 'Most Starter and Professional builds take 2–4 weeks from start to launch. Custom projects vary by scope and are scoped individually.',
  },
  {
    q: 'What does "support hours" mean?',
    a: 'Support hours are time we spend on updates, changes, or tasks you request each month. Hours that go unused do not roll over. Additional hours can be purchased at $85/hr.',
  },
];

function FeatureRow({ feature }) {
  if (typeof feature === 'string') {
    return (
      <li className="price-feature">
        <CheckCircle2 size={15} />
        {feature}
      </li>
    );
  }
  return (
    <li className="price-feature" style={{ opacity: feature.included === false ? 0.38 : 1 }}>
      {feature.included === false ? <Minus size={15} style={{ color: 'var(--subtle)' }} /> : <CheckCircle2 size={15} />}
      {feature.text}
    </li>
  );
}

export default function Pricing() {
  return (
    <>
      {/* ── Header ── */}
      <section className="section" style={{ background: 'var(--soft)', paddingBottom: '64px' }}>
        <div className="section-inner">
          <div className="section-label">Pricing</div>
          <div className="section-heading centered" style={{ marginBottom: 0 }}>
            <h1>Straightforward pricing for every stage</h1>
            <p>
              Transparent project costs and predictable monthly rates. No hidden fees,
              no surprise invoices, no scope creep.
            </p>
          </div>
        </div>
      </section>

      {/* ── Build Plans ── */}
      <section className="section pricing-section" style={{ paddingTop: '72px' }}>
        <div className="section-inner">
          <div className="section-heading" style={{ marginBottom: '40px' }}>
            <h2>Website Build Packages</h2>
            <p>One-time project cost to design and launch your site.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.tier} className={`price-card${plan.featured ? ' featured' : ''}`}>
                {plan.badge && <div className="price-badge">{plan.badge}</div>}
                <div className="price-tier">{plan.tier}</div>
                <div className="price-amount">
                  {plan.price}
                  {plan.period !== 'project' && (
                    <span> {plan.period}</span>
                  )}
                </div>
                <p className="price-desc">{plan.desc}</p>
                <ul className="price-features">
                  {plan.features.map((f, i) => (
                    <FeatureRow key={i} feature={f} />
                  ))}
                </ul>
                <Link to="/contact" className={`button ${plan.ctaVariant}`}>
                  {plan.cta} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Maintenance Plans ── */}
      <section className="section" style={{ background: 'var(--soft)', paddingTop: '80px' }}>
        <div className="section-inner">
          <div className="section-heading" style={{ marginBottom: '40px' }}>
            <h2>Monthly Maintenance Plans</h2>
            <p>Required with every build. Choose the level of care that fits your business.</p>
          </div>
          <div className="pricing-grid">
            {maintenance.map((plan) => (
              <article key={plan.tier} className={`price-card${plan.featured ? ' featured' : ''}`}>
                {plan.badge && <div className="price-badge">{plan.badge}</div>}
                <div className="price-tier">{plan.tier}</div>
                <div className="price-amount">
                  {plan.price}<span>{plan.period}</span>
                </div>
                <p className="price-desc">{plan.desc}</p>
                <ul className="price-features">
                  {plan.features.map((f) => (
                    <FeatureRow key={f} feature={f} />
                  ))}
                </ul>
                <Link to="/contact" className={`button ${plan.featured ? 'primary' : 'ghost'}`}>
                  Get Started <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section pricing-section">
        <div className="section-inner">
          <div className="pricing-faq">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div key={faq.q} className="faq-item">
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>Ready to get started?</h2>
          <p>
            Send us a message and we'll put together a clear recommendation
            based on your business and what you need from your website.
          </p>
          <div className="cta-band-actions">
            <Link className="button primary lg" to="/contact">
              Request a Consultation <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
