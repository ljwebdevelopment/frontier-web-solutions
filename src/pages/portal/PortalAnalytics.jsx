import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, CheckCircle, ExternalLink, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getClient } from '../../services/firestoreService';

const METRIC_PLACEHOLDERS = [
  { label: 'Sessions (30d)', value: '—', note: 'Total visits' },
  { label: 'Users (30d)', value: '—', note: 'Unique visitors' },
  { label: 'Pageviews (30d)', value: '—', note: 'Total page loads' },
  { label: 'Bounce Rate', value: '—', note: 'Single-page sessions' },
  { label: 'Avg. Session', value: '—', note: 'Time on site' },
  { label: 'New Users', value: '—', note: 'First-time visitors' },
];

const SETUP_STEPS = [
  { step: '1', title: 'Add your GA4 Property ID', body: 'Go to your Profile page and enter your Google Analytics 4 Property ID (format: G-XXXXXXXXXX or numeric property ID). You can find this in your GA4 account under Admin → Property Settings.' },
  { step: '2', title: 'Google Analytics API activation', body: 'Once your Property ID is saved, Frontier Web Systems will connect the Google Analytics Data API to your property. This is handled on our end — no action needed from you.' },
  { step: '3', title: 'Live data starts flowing', body: 'After the API is activated, this page will display real-time traffic data including sessions, users, top pages, traffic sources, and trends.' },
];

export default function PortalAnalytics() {
  const { profile } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.clientId) return;
    getClient(profile.clientId).then((c) => {
      setClient(c);
      setLoading(false);
    });
  }, [profile?.clientId]);

  if (loading) {
    return (
      <section className="workspace-section">
        <div className="screen-loader" style={{ minHeight: 'auto', padding: '60px 0' }}>Loading…</div>
      </section>
    );
  }

  const hasGA = !!client?.googleAnalyticsPropertyId;

  return (
    <section className="workspace-section">
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Reporting</p>
          <h2>Website Analytics</h2>
        </div>
        {hasGA && (
          <span className="status-chip building" style={{ alignSelf: 'center' }}>
            GA4 · {client.googleAnalyticsPropertyId}
          </span>
        )}
      </div>

      {/* Setup flow if no GA property */}
      {!hasGA && (
        <div className="workspace-card" style={{ marginBottom: 20, borderTop: '3px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
            <BarChart2 size={28} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, textTransform: 'none', letterSpacing: 'normal' }}>Connect Google Analytics</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                Once connected, you'll see sessions, users, pageviews, traffic sources, and your top-performing pages — all updated daily from your Google Analytics 4 property.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            {SETUP_STEPS.map(({ step, title, body }) => (
              <div key={step} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {step}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to="/portal/profile" className="button primary sm">Go to Profile → Add Property ID</Link>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="button ghost sm"
            >
              Open Google Analytics <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Metric cards — placeholder until API connected */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Key Metrics — Last 30 Days
          </h3>
          {hasGA && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Live data pending API connection</span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          {METRIC_PLACEHOLDERS.map((m) => (
            <div
              key={m.label}
              className="stat-card"
              style={{ opacity: hasGA ? 0.8 : 0.5 }}
            >
              <p>{m.label}</p>
              <strong>—</strong>
              <span>{hasGA ? 'Pending API connection' : m.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 16 }}>
        {/* Traffic sources placeholder */}
        <div className="workspace-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ color: 'var(--red)' }} />
            <h3 style={{ margin: 0 }}>Traffic Sources</h3>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {['Organic Search', 'Direct', 'Referral', 'Social Media', 'Email'].map((source) => (
              <div key={source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--body)' }}>{source}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 200 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '0%', background: 'var(--red)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 26, textAlign: 'right' }}>—</span>
                </div>
              </div>
            ))}
          </div>
          {hasGA && (
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>Data will populate once API is connected.</p>
          )}
        </div>

        {/* Top pages placeholder */}
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ margin: 0 }}>Top Pages</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Page</th>
                <th style={{ textAlign: 'right' }}>Views</th>
              </tr>
            </thead>
            <tbody>
              {['/', '/services', '/contact', '/about', '/pricing'].map((page) => (
                <tr key={page}>
                  <td style={{ color: 'var(--body)' }}>{page}</td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasGA && (
        <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(139,0,0,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139,0,0,0.14)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>GA4 Property Configured</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Property ID <strong>{client.googleAnalyticsPropertyId}</strong> is saved. Live data will appear once Frontier Web Systems activates the Google Analytics Data API connection.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
