import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  HeadphonesIcon,
  LayoutDashboard,
  LineChart,
  Lock,
  RefreshCw,
  Settings2,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    desc: 'We design and build professional websites from the ground up — structured for credibility, performance, and conversion. Every build is customized to your business, not a generic template.',
    includes: [
      'Custom page layouts and design',
      'Mobile-responsive on all devices',
      'Contact forms and lead capture',
      'SEO-ready page structure',
      'Google Analytics integration',
      'Performance-optimized build',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Website Redesigns',
    desc: 'If your current site is outdated, unclear, or underperforming, a redesign resets the foundation. We improve layout, messaging, and performance while keeping your existing domain and business identity.',
    includes: [
      'Full visual and structural refresh',
      'Improved content hierarchy',
      'Faster page load performance',
      'Updated calls-to-action',
      'Maintained domain and brand identity',
      'Legacy content migration',
    ],
  },
  {
    icon: Settings2,
    title: 'Ongoing Maintenance',
    desc: 'Websites aren\'t set-and-forget. Every site we build includes a monthly maintenance plan — content updates, software patches, security monitoring, and reliable access to your team.',
    includes: [
      'Monthly content and page updates',
      'Security and software patches',
      'Uptime and performance monitoring',
      'Broken link and error checks',
      'Backup and recovery management',
      'Support request tracking via portal',
    ],
  },
  {
    icon: LayoutDashboard,
    title: 'Client Portal Access',
    desc: 'Every Frontier client gets access to a private dashboard where they can track website status, submit requests, view billing history, and communicate directly with their team.',
    includes: [
      'Real-time website status',
      'Support request submission',
      'Billing and subscription overview',
      'Form submission visibility',
      'Project update notifications',
      'Direct team communication',
    ],
  },
  {
    icon: LineChart,
    title: 'SEO & Analytics Setup',
    desc: 'A website no one can find isn\'t working. We configure search engine visibility fundamentals, connect analytics, and ensure your site is structured to rank and be discovered.',
    includes: [
      'On-page SEO configuration',
      'Google Search Console setup',
      'Google Analytics 4 integration',
      'Meta titles and descriptions',
      'Structured data markup',
      'Local SEO signals for service businesses',
    ],
  },
  {
    icon: HeadphonesIcon,
    title: 'Hosting & Support Coordination',
    desc: 'Domain configuration, hosting management, SSL certificates, DNS settings — these technical details are handled by Frontier so you never have to navigate them on your own.',
    includes: [
      'Domain registration or transfer',
      'Hosting account setup',
      'SSL certificate provisioning',
      'DNS configuration',
      'Email routing coordination',
      'Third-party integration support',
    ],
  },
];

const capabilities = [
  { icon: Smartphone, label: 'Mobile-First Design' },
  { icon: Zap, label: 'Performance Optimized' },
  { icon: Lock, label: 'SSL & Security' },
  { icon: BarChart3, label: 'Analytics Ready' },
  { icon: Activity, label: 'Uptime Monitoring' },
  { icon: Globe, label: 'Custom Domains' },
];

export default function Services() {
  return (
    <>
      {/* ── Header ── */}
      <section className="section" style={{ background: 'var(--soft)', paddingBottom: '64px' }}>
        <div className="section-inner">
          <div className="section-label">Services</div>
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <h1>Web services built for long-term business results</h1>
            <p>
              From first build to ongoing care, Frontier handles every layer of your web presence —
              so your website stays professional, functional, and supported.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="section" style={{ paddingTop: '64px' }}>
        <div className="section-inner">
          <div className="services-page-grid">
            {services.map((s) => (
              <div key={s.title} className="service-detail-card">
                <div className="service-icon">
                  <s.icon size={22} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="service-includes">
                  {s.includes.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={14} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="section" style={{ background: 'var(--soft)', paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="section-inner">
          <div className="section-heading centered">
            <div className="section-label">Built-In Standards</div>
            <h2>Every project includes these fundamentals</h2>
            <p>
              We don't charge extra for the basics. These capabilities are standard on every
              website we build or maintain.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {capabilities.map((c) => (
              <div key={c.label} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '28px 20px',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}>
                <div className="service-icon" style={{ margin: 0 }}>
                  <c.icon size={20} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>Not sure which services you need?</h2>
          <p>
            Start with a consultation. We'll review your current web presence and recommend
            exactly what makes sense for your business and budget.
          </p>
          <div className="cta-band-actions">
            <Link className="button primary lg" to="/contact">
              Request a Consultation <ArrowRight size={18} />
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
