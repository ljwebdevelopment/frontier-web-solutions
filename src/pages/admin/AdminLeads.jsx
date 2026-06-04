import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, UserPlus } from 'lucide-react';
import {
  LEAD_STATUSES,
  convertLeadToClient,
  createLead,
  deleteLead,
  listenToLeads,
  updateLead,
} from '../../services/firestoreService';

const blankLead = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  websiteUrl: '',
  service: '',
  notes: '',
  status: 'New Lead',
  source: '',
};

const STATUS_COLORS = {
  'New Lead': 'new',
  'Contacted': 'pending',
  'Discovery Scheduled': 'building',
  'Proposal Sent': 'warning',
  'Won': 'active',
  'Lost': 'inactive',
  'Archived': 'inactive',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('pipeline'); // pipeline | list | new
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blankLead);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => listenToLeads(setLeads), []);

  const activeLeads = useMemo(() => leads.filter((l) => !['Archived'].includes(l.status)), [leads]);

  const filtered = useMemo(() => {
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter((l) =>
      (l.businessName || '').toLowerCase().includes(q) ||
      (l.contactName || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q)
    );
  }, [leads, search]);

  const byStatus = useMemo(() =>
    LEAD_STATUSES.reduce((acc, s) => {
      acc[s] = leads.filter((l) => l.status === s);
      return acc;
    }, {}),
  [leads]);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      if (editingId) {
        await updateLead(editingId, form);
        setStatus('Lead updated.');
      } else {
        await createLead(form);
        setStatus('Lead created.');
      }
      setForm(blankLead);
      setEditingId(null);
      setView('pipeline');
    } catch (err) {
      setStatus(err.message);
    }
  }

  function startEdit(lead) {
    setForm({ ...blankLead, ...lead });
    setEditingId(lead.id);
    setView('new');
  }

  async function handleStatusChange(lead, newStatus) {
    await updateLead(lead.id, { status: newStatus });
  }

  async function handleDelete(lead) {
    if (!window.confirm(`Delete lead "${lead.businessName}"?`)) return;
    await deleteLead(lead.id);
  }

  async function handleConvert(lead) {
    if (!window.confirm(`Convert "${lead.businessName}" to a client? This will create a client record and portal login.`)) return;
    setStatus('Converting...');
    try {
      const result = await convertLeadToClient(lead);
      setStatus(`Client created. Temp password: ${result.data.temporaryPassword}`);
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <section className="workspace-section">
      <div className="workspace-title-row">
        <div>
          <h2>Lead Pipeline</h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{activeLeads.length} active leads</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`button ${view === 'pipeline' ? 'primary' : 'ghost'} sm`} onClick={() => setView('pipeline')}>Pipeline</button>
          <button className={`button ${view === 'list' ? 'primary' : 'ghost'} sm`} onClick={() => setView('list')}>List</button>
          <button className="button secondary sm" onClick={() => { setForm(blankLead); setEditingId(null); setView('new'); }}>
            <Plus size={13} /> Add Lead
          </button>
        </div>
      </div>

      {status && <p className="form-status" style={{ marginBottom: 12 }}>{status}</p>}

      {/* ── Pipeline View ── */}
      {view === 'pipeline' && (
        <div className="lead-pipeline">
          {LEAD_STATUSES.filter((s) => s !== 'Archived').map((s) => (
            <div key={s} className="pipeline-col">
              <div className="pipeline-col-header">
                <span>{s}</span>
                <span className="count">{byStatus[s]?.length || 0}</span>
              </div>
              {byStatus[s]?.map((lead) => (
                <div key={lead.id} className="pipeline-card" onClick={() => startEdit(lead)}>
                  <strong>{lead.businessName || lead.contactName}</strong>
                  <span>{lead.email}</span>
                  {lead.service && <div style={{ marginTop: 4, fontSize: 10, background: 'var(--soft)', padding: '2px 6px', borderRadius: 3, display: 'inline-block', color: 'var(--muted)' }}>{lead.service}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── List View ── */}
      {view === 'list' && (
        <>
          <div className="filter-bar">
            <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                className="search-input"
                style={{ paddingLeft: 30 }}
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Service Interest</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 700 }}>{lead.businessName || '—'}</td>
                    <td>{lead.contactName || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{lead.email}</td>
                    <td style={{ color: 'var(--muted)' }}>{lead.service || '—'}</td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        style={{ fontSize: 11, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 3 }}
                      >
                        {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{lead.source || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {!['Won', 'Lost', 'Archived'].includes(lead.status) && (
                          <button className="text-button" onClick={() => handleConvert(lead)} title="Convert to client">
                            <UserPlus size={13} />
                          </button>
                        )}
                        <button className="text-button" onClick={() => startEdit(lead)}>Edit</button>
                        <button className="text-button danger" onClick={() => handleDelete(lead)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No leads found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── New / Edit Lead Form ── */}
      {view === 'new' && (
        <div className="workspace-card">
          <h3>{editingId ? 'Edit Lead' : 'New Lead'}</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <label>Business Name<input name="businessName" value={form.businessName} onChange={updateField} /></label>
              <label>Contact Name<input name="contactName" value={form.contactName} onChange={updateField} required /></label>
              <label>Email<input type="email" name="email" value={form.email} onChange={updateField} required /></label>
              <label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label>
              <label>Current Website<input name="websiteUrl" value={form.websiteUrl} onChange={updateField} /></label>
              <label>Service Interest<input name="service" value={form.service} onChange={updateField} placeholder="e.g. New website build" /></label>
              <label>Lead Source<input name="source" value={form.source} onChange={updateField} placeholder="e.g. Contact form, referral" /></label>
              <label>Status
                <select name="status" value={form.status} onChange={updateField}>
                  {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <label style={{ marginTop: 12 }}>Notes<textarea name="notes" value={form.notes} onChange={updateField} style={{ minHeight: 90 }} /></label>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="button primary sm" type="submit">{editingId ? 'Update Lead' : 'Create Lead'}</button>
              <button className="button ghost sm" type="button" onClick={() => { setView('pipeline'); setForm(blankLead); setEditingId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
