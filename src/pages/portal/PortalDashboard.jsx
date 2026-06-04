import { useEffect, useState } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { BarChart2, ExternalLink, FileText, LifeBuoy } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { collections, getClient, listenToCollection } from '../../services/firestoreService';

const WEBSITE_STATUS_COLOR = {
  Live: 'active',
  'In Progress': 'building',
  Discovery: 'pending',
  'On Hold': 'warning',
  Archived: 'inactive',
};

const PAYMENT_STATUS_COLOR = {
  Active: 'active',
  Overdue: 'danger',
  'Not started': 'inactive',
  Pending: 'pending',
};

export default function PortalDashboard() {
  const { profile } = useAuth();
  const [client, setClient] = useState(null);
  const [forms, setForms] = useState([]);
  const [support, setSupport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.clientId) return undefined;
    getClient(profile.clientId).then((c) => {
      setClient(c);
      setLoading(false);
    });
    const constraints = [where('clientId', '==', profile.clientId), orderBy('createdAt', 'desc')];
    const stops = [
      listenToCollection(collections.formSubmissions, setForms, constraints),
      listenToCollection(collections.supportRequests, setSupport, constraints),
    ];
    return () => stops.forEach((s) => s());
  }, [profile?.clientId]);

  if (loading) {
    return (
      <section className="workspace-section">
        <div className="screen-loader" style={{ minHeight: 'auto', padding: '60px 0' }}>Loading your dashboard…</div>
      </section>
    );
  }

  const openRequests = support.filter((s) => s.status !== 'closed').length;
  const newForms = forms.filter((f) => f.status === 'new' || !f.status).length;
  const hasGA = !!client?.googleAnalyticsPropertyId;
  const hasSheet = !!client?.googleSheetId;

  return (
    <section className="workspace-section">
      {/* Page header */}
      <div className="workspace-title-row" style={{ marginBottom: 8, alignItems: 'flex-start' }}>
        <div>
          <p className="eyebrow">Client Portal</p>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>
            {client?.businessName || profile?.businessName || 'Your Website'}
          </h2>
          {client?.websiteUrl && (
            <a
              href={client.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--muted)' }}
            >
              {client.websiteUrl} <ExternalLink size={11} />
            </a>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
          <span className={`status-chip ${WEBSITE_STATUS_COLOR[client?.websiteStatus] || 'inactive'}`}>
            {client?.websiteStatus || 'Active'}
          </span>
          <Link to="/portal/support" className="button primary sm">
            <LifeBuoy size={13} /> Request Support
          </Link>
        </div>
      </div>

      {/* KPI stat row */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', marginBottom: 24 }}>
        <StatCard
          label="Website Status"
          value={client?.websiteStatus || 'Active'}
        />
        <StatCard
          label="Monthly Visits"
          value="—"
          note={hasGA ? 'API connection pending' : 'Google Analytics not set up'}
        />
        <StatCard
          label="Form Submissions"
          value={forms.length}
          note={newForms > 0 ? `${newForms} new` : 'none new'}
        />
        <StatCard
          label="Open Requests"
          value={openRequests}
        />
      </div>

      {/* Main two-column layout */}
      <div className="portal-main-grid">
        {/* LEFT: Analytics + Forms */}
        <div style={{ display: 'grid', gap: 16 }}>

          {/* Google Analytics card */}
          <div className="workspace-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Website Analytics</h3>
              {hasGA
                ? <span className="status-chip building">GA4 Configured</span>
                : <Link to="/portal/analytics" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>Set up →</Link>
              }
            </div>

            {!hasGA ? (
              <div style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line)' }}>
                <BarChart2 size={32} style={{ color: 'var(--muted)', margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Google Analytics not connected</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, maxWidth: 360, margin: '0 auto 16px' }}>
                  Add your GA4 Property ID in your profile to see website traffic, top pages, and visitor data.
                </p>
                <Link to="/portal/analytics" className="button ghost sm">Connect Analytics</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {['Sessions', 'Users', 'Pageviews'].map((label) => (
                    <div key={label} style={{ padding: '14px 16px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>{label}</p>
                      <strong style={{ fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.02em', fontWeight: 900 }}>—</strong>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(139,0,0,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139,0,0,0.14)', fontSize: 12, color: 'var(--red)', lineHeight: 1.5 }}>
                  Property ID: <strong>{client.googleAnalyticsPropertyId}</strong> · Live data will appear here once the Google Analytics API is connected.
                  {' '}<Link to="/portal/analytics" style={{ color: 'var(--red)', fontWeight: 700, textDecoration: 'underline' }}>View analytics →</Link>
                </div>
              </div>
            )}
          </div>

          {/* Recent form submissions */}
          <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <h3 style={{ margin: 0 }}>Recent Form Submissions</h3>
              <Link to="/portal/forms" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>View all →</Link>
            </div>

            {!hasSheet && (
              <div style={{ padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={13} style={{ flexShrink: 0 }} />
                <span>Connect Google Sheets to pull live form submissions from your website.</span>
                <Link to="/portal/profile" style={{ fontWeight: 700, color: '#92400e', textDecoration: 'underline', flexShrink: 0 }}>Add Sheet ID →</Link>
              </div>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {forms.slice(0, 6).map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.name || f.businessName || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{f.email || '—'}</td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={`status-chip ${
                        f.status === 'new' || !f.status ? 'new'
                        : f.status === 'completed' ? 'active'
                        : 'building'
                      }`}>
                        {f.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!forms.length && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)' }}>
                      No form submissions yet. They will appear here once your website visitors submit your contact form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Services, Website Info, Requests, Notes */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>

          {/* Services & plan */}
          <div className="workspace-card">
            <h3>Services &amp; Plan</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: 'Plan', value: client?.planName || 'Website + Maintenance' },
                { label: 'Monthly', value: `$${client?.monthlyMaintenanceAmount ?? 95}/mo` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Payment</span>
                <span className={`status-chip ${PAYMENT_STATUS_COLOR[client?.paymentStatus] || 'inactive'}`}>
                  {client?.paymentStatus || 'Not started'}
                </span>
              </div>
              {client?.billingDueDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Next billing</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{client.billingDueDate}</span>
                </div>
              )}
              {client?.servicesIncluded && (
                <div style={{ marginTop: 6, padding: '10px 12px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--body)', lineHeight: 1.7, borderLeft: '3px solid var(--line)' }}>
                  {client.servicesIncluded}
                </div>
              )}
            </div>
            <Link to="/portal/billing" style={{ display: 'inline-flex', marginTop: 14, fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>
              View billing details →
            </Link>
          </div>

          {/* Website details */}
          {(client?.websiteUrl || client?.launchDate || client?.sslStatus) && (
            <div className="workspace-card">
              <h3>Website Details</h3>
              <div style={{ display: 'grid', gap: 9 }}>
                {client?.websiteUrl && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>URL</span>
                    <a
                      href={client.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Visit site <ExternalLink size={11} />
                    </a>
                  </div>
                )}
                {client?.launchDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Launched</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{client.launchDate}</span>
                  </div>
                )}
                {client?.sslStatus && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>SSL Certificate</span>
                    <span className={`status-chip ${client.sslStatus === 'Active' ? 'active' : 'warning'}`}>
                      {client.sslStatus}
                    </span>
                  </div>
                )}
                {client?.hostingProvider && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Hosting</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{client.hostingProvider}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Open requests */}
          <div className="workspace-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Open Requests</h3>
              <Link to="/portal/support" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>+ New request</Link>
            </div>
            {openRequests === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No open requests.</p>
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                {support
                  .filter((r) => r.status !== 'closed')
                  .slice(0, 5)
                  .map((r) => (
                    <div
                      key={r.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subject}</span>
                      <span className={`status-chip ${r.status === 'open' ? 'pending' : 'building'}`} style={{ flexShrink: 0 }}>
                        {r.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Notes from account manager */}
          {client?.notes && (
            <div className="workspace-card" style={{ borderLeft: '3px solid var(--red)' }}>
              <h3>Note from Your Account Manager</h3>
              <p style={{ fontSize: 13, color: 'var(--body)', lineHeight: 1.75 }}>{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
