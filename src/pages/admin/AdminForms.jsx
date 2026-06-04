import { useEffect, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { collections, listenToCollection, updateFormSubmission } from '../../services/firestoreService';

const TYPE_LABELS = { contact: 'Contact', support: 'Support', newsletter: 'Newsletter' };

function timeAgo(ts) {
  if (!ts) return '—';
  const secs = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function AdminForms() {
  const [submissions, setSubmissions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [tab, setTab] = useState('contact');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const stops = [
      listenToCollection(collections.formSubmissions, setSubmissions, [orderBy('createdAt', 'desc')]),
      listenToCollection(collections.newsletterSignups, setSignups, [orderBy('createdAt', 'desc')]),
    ];
    return () => stops.forEach((s) => s());
  }, []);

  const contactForms = useMemo(() => submissions.filter((s) => s.type === 'contact' || !s.type), [submissions]);
  const supportForms = useMemo(() => submissions.filter((s) => s.type === 'support'), [submissions]);

  const activeList = tab === 'contact' ? contactForms : tab === 'support' ? supportForms : signups;

  const filtered = useMemo(() => {
    let list = activeList;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        (s.businessName || s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all' && tab !== 'newsletter') {
      list = list.filter((s) => (s.status || 'new') === statusFilter);
    }
    return list;
  }, [activeList, search, statusFilter, tab]);

  async function markStatus(id, newStatus) {
    await updateFormSubmission(id, { status: newStatus });
  }

  const newCount = contactForms.filter((s) => s.status === 'new' || !s.status).length;

  return (
    <section className="workspace-section">
      <div className="workspace-title-row">
        <h2>Form Submissions</h2>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{newCount} new contact inquiries</span>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn${tab === 'contact' ? ' active' : ''}`} onClick={() => setTab('contact')}>
          Contact Forms ({contactForms.length})
        </button>
        <button className={`tab-btn${tab === 'support' ? ' active' : ''}`} onClick={() => setTab('support')}>
          Support ({supportForms.length})
        </button>
        <button className={`tab-btn${tab === 'newsletter' ? ' active' : ''}`} onClick={() => setTab('newsletter')}>
          Newsletter ({signups.length})
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 30 }}
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {tab !== 'newsletter' && (
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        )}
      </div>

      {/* Contact / Support table */}
      {tab !== 'newsletter' && (
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business / Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <>
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                    <td style={{ fontWeight: 700 }}>{s.businessName || s.name || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.email}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.phone || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.service || '—'}</td>
                    <td>
                      <select
                        value={s.status || 'new'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => markStatus(s.id, e.target.value)}
                        style={{ fontSize: 11, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 3 }}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(s.createdAt)}</td>
                    <td style={{ color: 'var(--red)', fontSize: 12 }}>{expanded === s.id ? '▲' : '▼'}</td>
                  </tr>
                  {expanded === s.id && (
                    <tr key={`${s.id}-expanded`}>
                      <td colSpan={7} style={{ background: 'var(--soft)', padding: '14px 16px' }}>
                        {s.message && <div style={{ marginBottom: 8 }}><strong style={{ fontSize: 12 }}>Message:</strong><p style={{ fontSize: 13, color: 'var(--body)', marginTop: 4, lineHeight: 1.6 }}>{s.message}</p></div>}
                        {s.websiteUrl && <div style={{ fontSize: 12 }}><strong>Current site:</strong> <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)' }}>{s.websiteUrl}</a></div>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No submissions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Newsletter signups */}
      {tab === 'newsletter' && (
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Email</th><th>Source</th><th>Client ID</th><th>Signed Up</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.email}</td>
                  <td style={{ color: 'var(--muted)' }}>{s.source || 'public-site'}</td>
                  <td style={{ color: 'var(--muted)' }}>{s.clientId || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{timeAgo(s.createdAt)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No signups yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
