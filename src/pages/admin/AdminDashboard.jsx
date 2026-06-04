import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderBy } from 'firebase/firestore';
import { ArrowRight, DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import { collections, listenToClients, listenToCollection, listenToLeads, listenToNotifications } from '../../services/firestoreService';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function timeAgo(ts) {
  if (!ts) return '';
  const secs = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [support, setSupport] = useState([]);

  useEffect(() => {
    const stops = [
      listenToClients(setClients),
      listenToLeads(setLeads),
      listenToNotifications(setNotifications),
      listenToCollection(collections.formSubmissions, setSubmissions, [orderBy('createdAt', 'desc')]),
      listenToCollection(collections.supportRequests, setSupport, [orderBy('createdAt', 'desc')]),
    ];
    return () => stops.forEach((s) => s());
  }, []);

  const activeClients = useMemo(() => clients.filter((c) => !c.archived), [clients]);
  const archivedClients = useMemo(() => clients.filter((c) => c.archived), [clients]);
  const mrr = useMemo(() => activeClients.reduce((sum, c) => sum + (Number(c.monthlyMaintenanceAmount) || 0), 0), [activeClients]);
  const activeLeads = useMemo(() => leads.filter((l) => !['Won', 'Lost', 'Archived'].includes(l.status)), [leads]);
  const openSupport = useMemo(() => support.filter((s) => s.status !== 'closed'), [support]);
  const newSubmissions = useMemo(() => submissions.filter((s) => s.status === 'new'), [submissions]);
  const unread = useMemo(() => notifications.filter((n) => !n.read), [notifications]);

  // Upcoming renewals — clients whose billingDueDate is within 14 days
  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 14 * 86400000);
    return activeClients
      .filter((c) => c.billingDueDate && new Date(c.billingDueDate) <= cutoff && new Date(c.billingDueDate) >= now)
      .sort((a, b) => new Date(a.billingDueDate) - new Date(b.billingDueDate));
  }, [activeClients]);

  // Build activity feed from notifications + submissions
  const activity = useMemo(() => {
    return notifications.slice(0, 12);
  }, [notifications]);

  return (
    <section className="workspace-section">
      {/* ── KPI Stats ── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
        <div className="stat-card accent">
          <p><Users size={12} style={{ display: 'inline', marginRight: 4 }} />Active Clients</p>
          <strong>{activeClients.length}</strong>
          <span>{archivedClients.length} archived</span>
        </div>
        <div className="stat-card accent">
          <p><DollarSign size={12} style={{ display: 'inline', marginRight: 4 }} />Monthly Revenue</p>
          <strong>{formatCurrency(mrr)}</strong>
          <span>MRR from maintenance</span>
        </div>
        <div className="stat-card">
          <p><TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />Active Leads</p>
          <strong>{activeLeads.length}</strong>
          <span>{leads.length} total leads</span>
        </div>
        <div className="stat-card">
          <p><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />New Inquiries</p>
          <strong>{newSubmissions.length}</strong>
          <span>{openSupport.length} open support</span>
        </div>
      </div>

      {/* ── Second row: extended stats ── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <p>Annual Run Rate</p>
          <strong>{formatCurrency(mrr * 12)}</strong>
          <span>based on current MRR</span>
        </div>
        <div className="stat-card">
          <p>Unread Notifications</p>
          <strong>{unread.length}</strong>
          <span>of {notifications.length} total</span>
        </div>
        <div className="stat-card">
          <p>Upcoming Renewals</p>
          <strong>{upcomingRenewals.length}</strong>
          <span>within 14 days</span>
        </div>
        <div className="stat-card">
          <p>Open Support Tickets</p>
          <strong>{openSupport.length}</strong>
          <span>need attention</span>
        </div>
      </div>

      <div className="workspace-grid">
        {/* ── Recent Activity ── */}
        <div className="workspace-card">
          <div className="workspace-title-row">
            <h3>Recent Activity</h3>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{unread.length} unread</span>
          </div>
          <div className="activity-feed">
            {activity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-dot" style={{ background: item.read ? 'var(--line)' : 'var(--red)' }} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.message} · {timeAgo(item.createdAt)}</span>
                </div>
              </div>
            ))}
            {!activity.length && <div className="empty-state" style={{ padding: 24 }}>No activity yet.</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* ── Active Clients ── */}
          <div className="workspace-card">
            <div className="workspace-title-row">
              <h3>Active Clients</h3>
              <Link to="/admin/clients" className="text-button" style={{ fontSize: 12 }}>
                View all <ArrowRight size={12} style={{ display: 'inline' }} />
              </Link>
            </div>
            <div className="record-list">
              {activeClients.slice(0, 6).map((c) => (
                <div key={c.id} className="record-row" style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <div>
                    <Link to={`/admin/clients/${c.id}`} style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                      {c.businessName}
                    </Link>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.websiteStatus || 'Active'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>${c.monthlyMaintenanceAmount}/mo</div>
                  </div>
                </div>
              ))}
              {!activeClients.length && <div className="empty-state" style={{ padding: 16 }}>No active clients.</div>}
            </div>
          </div>

          {/* ── Upcoming Renewals ── */}
          <div className="workspace-card">
            <div className="workspace-title-row">
              <h3>Upcoming Renewals</h3>
            </div>
            {upcomingRenewals.length ? (
              <div className="record-list">
                {upcomingRenewals.map((c) => (
                  <div key={c.id} className="record-row" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Link to={`/admin/clients/${c.id}`} style={{ fontWeight: 600, fontSize: 13 }}>{c.businessName}</Link>
                    <span className="status-chip warning">{c.billingDueDate}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>No renewals in the next 14 days.</div>
            )}
          </div>

          {/* ── Quick Actions ── */}
          <div className="workspace-card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/admin/clients" className="button ghost sm" style={{ justifyContent: 'flex-start' }}>
                <Users size={14} /> Add New Client
              </Link>
              <Link to="/admin/leads" className="button ghost sm" style={{ justifyContent: 'flex-start' }}>
                <TrendingUp size={14} /> View Lead Pipeline
              </Link>
              <Link to="/admin/forms" className="button ghost sm" style={{ justifyContent: 'flex-start' }}>
                <FileText size={14} /> Review Form Submissions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Inquiries ── */}
      <div style={{ marginTop: 16 }}>
        <div className="workspace-card">
          <div className="workspace-title-row">
            <h3>Recent Contact Submissions</h3>
            <Link to="/admin/forms" className="text-button" style={{ fontSize: 12 }}>
              View all <ArrowRight size={12} style={{ display: 'inline' }} />
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Name</th>
                <th>Email</th>
                <th>Service</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 8).map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.businessName || '—'}</td>
                  <td>{s.name || '—'}</td>
                  <td>{s.email}</td>
                  <td>{s.service || '—'}</td>
                  <td>
                    <span className={`status-chip ${s.status === 'new' ? 'new' : 'inactive'}`}>
                      {s.status || 'new'}
                    </span>
                  </td>
                  <td>{timeAgo(s.createdAt)}</td>
                </tr>
              ))}
              {!submissions.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
