import { useEffect, useMemo, useState } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { collections, listenToCollection, updateFormSubmission } from '../../services/firestoreService';

const STATUSES = ['All', 'New', 'Reviewed', 'Contacted', 'Completed'];

const STATUS_CHIP = {
  new: 'new',
  New: 'new',
  reviewed: 'building',
  Reviewed: 'building',
  contacted: 'pending',
  Contacted: 'pending',
  completed: 'active',
  Completed: 'active',
};

export default function PortalForms() {
  const { profile } = useAuth();
  const [forms, setForms] = useState([]);
  const [signups, setSignups] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!profile?.clientId) return undefined;
    const constraints = [where('clientId', '==', profile.clientId), orderBy('createdAt', 'desc')];
    const stops = [
      listenToCollection(collections.formSubmissions, setForms, constraints),
      listenToCollection(collections.newsletterSignups, setSignups, constraints),
    ];
    return () => stops.forEach((stop) => stop());
  }, [profile?.clientId]);

  const filtered = useMemo(() => {
    let list = [...forms];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          (f.name || f.businessName || '').toLowerCase().includes(q) ||
          (f.email || '').toLowerCase().includes(q) ||
          (f.phone || '').toLowerCase().includes(q) ||
          (f.message || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      list = list.filter((f) => (f.status || 'new').toLowerCase() === statusFilter.toLowerCase());
    }
    if (sortBy === 'oldest') list = [...list].reverse();
    return list;
  }, [forms, search, statusFilter, sortBy]);

  async function handleStatus(id, status) {
    await updateFormSubmission(id, { status });
  }

  const newCount = forms.filter((f) => !f.status || f.status === 'new').length;

  return (
    <section className="workspace-section">
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Inbox</p>
          <h2>Form Submissions</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {forms.length} total · {newCount} new
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Search by name, email, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Contact form submissions */}
      <div className="workspace-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Contact Form Responses</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ minWidth: 200 }}>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{f.name || f.businessName || '—'}</td>
                  <td>
                    {f.email
                      ? <a href={`mailto:${f.email}`} style={{ color: 'var(--red)', fontWeight: 600 }}>{f.email}</a>
                      : <span style={{ color: 'var(--muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{f.phone || '—'}</td>
                  <td style={{ color: 'var(--muted)', maxWidth: 280 }}>
                    <span title={f.message}>{(f.message || '').slice(0, 90)}{f.message?.length > 90 ? '…' : ''}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <select
                      value={f.status || 'new'}
                      onChange={(e) => handleStatus(f.id, e.target.value)}
                      style={{ fontSize: 12, padding: '4px 8px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', background: '#fff', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Search size={28} />
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>
                        {forms.length ? 'No results match your filters.' : 'No form submissions yet.'}
                      </p>
                      <p>Form submissions from your website contact form will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Newsletter signups */}
      <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0 }}>Newsletter Signups <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>({signups.length})</span></h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {signups.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>
                  <a href={`mailto:${s.email}`} style={{ color: 'var(--red)' }}>{s.email}</a>
                </td>
                <td style={{ color: 'var(--muted)' }}>{s.source || 'Website'}</td>
                <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {!signups.length && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--muted)' }}>
                  No newsletter signups yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
