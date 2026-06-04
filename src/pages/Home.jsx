import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  HeadphonesIcon,
  LayoutDashboard,
  LineChart,
  Lock,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '50+', label: 'Businesses Served' },
  { value: '98%', label: 'Client Retention' },
  { value: '<4 hrs', label: 'Average Response Time' },
  { value: '100%', label: 'Sites Stay Maintained' },
];

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    desc: 'Custom websites built to attract customers, communicate your value, and convert visitors into clients.',
  },
  {
    icon: RefreshCw,
    title: 'Website Redesigns',
    desc: 'Modern refresh for outdated sites — better layouts, faster performance, and clear messaging.',
  },
  {
    icon: Settings2,
    title: 'Ongoing Maintenance',
    desc: 'Regular updates, content changes, security monitoring, and issue resolution after launch.',
  },
  {
    icon: LayoutDashboard,
    title: 'Client Portal Access',
    desc: 'A private workspace where clients track requests, billing, and website status in real time.',
  },
  {
    icon: LineChart,
    title: 'SEO & Analytics',
    desc: 'Traffic tracking and search visibility setup so your site works harder for your business.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Support',
    desc: 'Direct access to your web team — no tickets lost in a queue, no waiting weeks for a reply.',
  },
];

const whyItems = [
  {
    icon: ShieldCheck,
    title: 'Built-in maintenance from day one',
    desc: 'Every site we build includes an ongoing care plan — so it never goes stale or breaks without a backup.',
  },
  {
    icon: Zap,
    title: 'Fast, transparent communication',
    desc: 'You get direct contact with your team, a client portal for requests, and clear response timelines.',
  },
  {
    icon: Lock,
    title: 'Modern, secure technology',
    desc: 'We build on proven platforms with SSL, performance optimization, and regular security reviews baked in.',
  },
  {
    icon: Clock,
    title: 'Predictable pricing, no surprises',
    desc: 'Clear project costs and flat monthly rates — no mystery invoices or scope creep.',
  },
];

const testimonials = [
  {
    quote: 'Frontier completely changed how I think about my website. They built it, kept it updated, and were always reachable when something came up. Worth every dollar.',
    name: 'Sarah M.',
    title: 'Owner, Maple Lane Bakery',
    initial: 'S',
  },
  {
    quote: 'I had a broken site for months before finding Frontier. They fixed it fast, redesigned the layout, and now I actually get calls from my website.',
    name: 'James R.',
    title: 'Owner, RidgeTop Landscaping',
    initial: 'J',
  },
  {
    quote: 'The client portal alone is worth it. I can see everything happening with my site without having to chase anyone down. Very professional operation.',
    name: 'Diana K.',
    title: 'Founder, Keller Consulting Group',
    initial: 'D',
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span />
            Professional Web Solutions for Growing Businesses
          </div>
          <h1>
            Your website should work<br />
            as hard as <em>you do.</em>
          </h1>
          <p className="hero-sub">
            Frontier Web Systems builds, launches, and maintains professional websites for small
            businesses. We handle the technology — you focus on running your business.
          </p>
          <div className="hero-actions">
            <Link className="button primary lg" to="/contact">
              Start a Project <ArrowRight size={18} />
            </Link>
            <Link className="button outline-white lg" to="/services">
              Explore Services
            </Link>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-item">
              <CheckCircle2 size={16} />
              No long-term contracts
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} />
              Maintenance included
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} />
              Client portal access
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} />
              Dedicated support
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Services ── */}
      <section className="section services-section">
        <div className="section-inner">
          <div className="section-heading">
            <div className="section-label">What We Do</div>
            <h2>Everything your website needs to succeed</h2>
            <p>
              From initial build to long-term care, we provide the full range of services a
              small business needs to maintain a professional digital presence.
            </p>
          </div>
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.title} className="service-card">
                <div className="service-icon">
                  <s.icon size={22} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <Link to="/services" className="service-link">
                  Learn more <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section process-section">
        <div className="section-inner">
          <div className="section-heading centered">
            <div className="section-label">How It Works</div>
            <h2>From first conversation to live site</h2>
            <p>
              A simple, structured process that gets your business online quickly — and keeps it
              running reliably long after launch.
            </p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Discovery & Scoping</h3>
              <p>
                We start with a consultation to understand your business, goals, and what your
                website needs to accomplish. You get a clear scope and pricing before any work begins.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Build & Launch</h3>
              <p>
                We design and develop your site with your feedback built into the process.
                When it's ready, we handle the full launch — domain, hosting, forms, analytics, all of it.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Maintain & Improve</h3>
              <p>
                After launch, your site stays on a monthly maintenance plan. Updates, content changes,
                and support requests are handled through your dedicated client portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Frontier ── */}
      <section className="section why-section">
        <div className="section-inner">
          <div className="why-grid">
            <div className="why-content">
              <div className="section-label">Why Frontier</div>
              <h2>A web partner, not just a vendor</h2>
              <p>
                Most businesses get a website built and then never hear from their developer again.
                We operate differently — every client gets ongoing support, a dedicated team member,
                and a system built for long-term reliability.
              </p>
              <div className="why-list">
                {whyItems.map((item) => (
                  <div key={item.title} className="why-item">
                    <div className="why-icon">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="why-panel">
              <div className="why-panel-label">Client Results</div>
              <div className="why-panel-metric">
                <strong>98%</strong>
                <span>of clients stay on maintenance plans after launch</span>
              </div>
              <div className="why-checklist">
                {[
                  'Sites reviewed and updated monthly',
                  'Support requests resolved within 4 hours',
                  'Hosting and SSL always current',
                  'Client portal live from day one',
                  'Transparent billing, cancel anytime',
                  'Direct line to your assigned team member',
                ].map((item) => (
                  <div key={item} className="why-check">
                    <CheckCircle2 size={15} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials-section">
        <div className="section-inner">
          <div className="section-heading centered">
            <div className="section-label">Client Stories</div>
            <h2>Businesses that trust Frontier</h2>
            <p>Real results from real business owners who needed a website that just works.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initial}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-title">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>Ready to build something worth showing?</h2>
          <p>
            Tell us about your business and what you need from your website. We'll follow up
            with a clear plan and transparent pricing — no pressure, no hidden costs.
          </p>
          <div className="cta-band-actions">
            <Link className="button primary lg" to="/contact">
              Request a Free Consultation <ArrowRight size={18} />
            </Link>
            <Link className="button outline-white lg" to="/pricing">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
