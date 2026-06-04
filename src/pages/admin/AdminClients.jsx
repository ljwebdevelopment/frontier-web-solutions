import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import {
  archiveClient,
  createClientDirect,
  deleteClient,
  listenToClients,
  updateClient,
} from '../../services/firestoreService';

const blankClient = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  industry: '',
  websiteUrl: '',
  domain: '',
  hostingProvider: '',
  planName: 'Website + Maintenance',
  monthlyMaintenanceAmount: 95,
  buildPrice: 300,
  websiteStatus: 'Discovery',
  launchDate: '',
  billingDueDate: '',
  subscriptionEnabled: false,
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  paymentStatus: 'Not started',
  billingPortalUrl: '',
  notes: '',
  internalNotes: '',
  servicesIncluded: 'Website build, maintenance, form setup, analytics setup, client portal access',
  portalLoginEmail: '',
};

const STATUS_OPTIONS = ['All', 'Discovery', 'In Progress', 'Live', 'On Hold', 'Archived'];

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [tab, setTab] = useState('active'); // active | archived | new
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [form, setForm] = useState(blankClient);
  const [tempPassword, setTempPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => listenToClients(setClients), []);

  const activeClients = useMemo(() => clients.filter((c) => !c.archived), [clients]);
  const archivedClients = useMemo(() => clients.filter((c) => c.archived), [clients]);

  const displayClients = useMemo(() => {
    let list = tab === 'archived' ? archivedClients : activeClients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.businessName || '').toLowerCase().includes(q) ||
        (c.contactName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      list = list.filter((c) => (c.websiteStatus || '') === statusFilter);
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
    if (sortBy === 'revenue') list = [...list].sort((a, b) => (b.monthlyMaintenanceAmount || 0) - (a.monthlyMaintenanceAmount || 0));
    if (sortBy === 'status') list = [...list].sort((a, b) => (a.websiteStatus || '').localeCompare(b.websiteStatus || ''));
    return list;
  }, [clients, tab, search, statusFilter, sortBy, activeClients, archivedClients]);

  function updateField(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.businessName.trim() || !form.contactName.trim() || !form.email.trim()) {
      setStatus('Business name, contact name, and email are required.');
      return;
    }
    setStatus('Saving client…');
    try {
      const result = await createClientDirect({
        ...form,
        portalLoginEmail: form.portalLoginEmail || form.email,
        temporaryPassword: tempPassword || undefined,
      });
      setForm(blankClient);
      setTempPassword('');
      setStatus(`Client saved. Open the client record to set up portal login.`);
      setTab('active');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleArchive(c) {
    if (!window.confirm(`Archive ${c.businessName}?`)) return;
    await archiveClient(c.id);
    setStatus(`${c.businessName} archived.`);
  }

  async function handleRestore(c) {
    await updateClient(c.id, { status: 'Active', websiteStatus: c.websiteStatus === 'Archived' ? 'Live' : c.websiteStatus, archived: false });
    setStatus(`${c.businessName} restored.`);
  }

  async function handleDelete(c) {
    if (!window.confirm(`Permanently delete ${c.businessName} and remove their portal login? This cannot be undone.`)) return;
    setStatus('Deleting...');
    try {
      await deleteClient(c.id);
      setStatus('Client deleted.');
    } catch (err) {
      setStatus(err.message);
    }
  }

  const statusColor = {
    Discovery: 'pending',
    'In Progress': 'building',
    Live: 'active',
    'On Hold': 'warning',
    Archived: 'inactive',
  };

  return (
    <section className="workspace-section">
      <div className="workspace-title-row">
        <div>
          <h2>Clients</h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {activeClients.length} active · {archivedClients.length} archived
          </span>
        </div>
        <button className="button primary sm" onClick={() => setTab('new')}>
          <Plus size={14} /> New Client
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-btn${tab === 'active' ? ' active' : ''}`} onClick={() => setTab('active')}>Active ({activeClients.length})</button>
        <button className={`tab-btn${tab === 'archived' ? ' active' : ''}`} onClick={() => setTab('archived')}>Archived ({archivedClients.length})</button>
        <button className={`tab-btn${tab === 'new' ? ' active' : ''}`} onClick={() => setTab('new')}>+ Create Client</button>
      </div>

      {tab === 'new' ? (
        /* ── Create Client Form ── */
        <div className="workspace-card">
          <h3>Create New Client</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Contact Information</div>
              <div className="form-grid">
                <label>Business Name<input name="businessName" value={form.businessName} onChange={updateField} required /></label>
                <label>Contact Name<input name="contactName" value={form.contactName} onChange={updateField} required /></label>
                <label>Email<input type="email" name="email" value={form.email} onChange={updateField} required /></label>
                <label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label>
                <label>Address<input name="address" value={form.address} onChange={updateField} /></label>
                <label>Industry<input name="industry" value={form.industry} onChange={updateField} /></label>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Website &amp; Hosting</div>
              <div className="form-grid">
                <label>Website URL<input name="websiteUrl" value={form.websiteUrl} onChange={updateField} /></label>
                <label>Domain<input name="domain" value={form.domain} onChange={updateField} /></label>
                <label>Hosting Provider<input name="hostingProvider" value={form.hostingProvider} onChange={updateField} /></label>
                <label>Website Status
                  <select name="websiteStatus" value={form.websiteStatus} onChange={updateField}>
                    {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>Launch Date<input type="date" name="launchDate" value={form.launchDate} onChange={updateField} /></label>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Billing</div>
              <div className="form-grid">
                <label>Plan Name<input name="planName" value={form.planName} onChange={updateField} /></label>
                <label>Monthly Maintenance ($)<input type="number" min="0" name="monthlyMaintenanceAmount" value={form.monthlyMaintenanceAmount} onChange={updateField} /></label>
                <label>Build Price ($)<input type="number" min="0" name="buildPrice" value={form.buildPrice} onChange={updateField} /></label>
                <label>Payment Status<input name="paymentStatus" value={form.paymentStatus} onChange={updateField} /></label>
                <label>Billing Due Date<input type="date" name="billingDueDate" value={form.billingDueDate} onChange={updateField} /></label>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Portal Login</div>
              <div className="form-grid">
                <label>Portal Login Email<input type="email" name="portalLoginEmail" value={form.portalLoginEmail} onChange={updateField} placeholder="Defaults to email above" /></label>
                <label>Temporary Password<input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Auto-generated if blank" /></label>
                <label>Stripe Customer ID<input name="stripeCustomerId" value={form.stripeCustomerId} onChange={updateField} /></label>
                <label>Stripe Subscription ID<input name="stripeSubscriptionId" value={form.stripeSubscriptionId} onChange={updateField} /></label>
              </div>
            </div>
            <label style={{ marginBottom: 12 }}>Services Included<textarea name="servicesIncluded" value={form.servicesIncluded} onChange={updateField} style={{ minHeight: 72 }} /></label>
            <label style={{ marginBottom: 12 }}>Internal Notes<textarea name="internalNotes" value={form.internalNotes} onChange={updateField} style={{ minHeight: 72 }} /></label>
            <label className="check-row">
              <input type="checkbox" name="subscriptionEnabled" checked={form.subscriptionEnabled} onChange={updateField} />
              Automatic subscription billing enabled
            </label>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button className="button primary" type="submit">Create Client</button>
              <button className="button ghost" type="button" onClick={() => { setForm(blankClient); setTab('active'); }}>Cancel</button>
            </div>
            {status && <p className={status.includes('error') || status.includes('Error') ? 'form-error' : 'form-status'} style={{ marginTop: 10 }}>{status}</p>}
          </form>
        </div>
      ) : (
        /* ── Client List ── */
        <>
          <div className="filter-bar">
            <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                className="search-input"
                style={{ paddingLeft: 30 }}
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="revenue">Sort: Revenue</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>

          <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Monthly</th>
                  <th>Plan</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayClients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/admin/clients/${c.id}`} style={{ fontWeight: 700, color: 'var(--ink)' }}>
                        {c.businessName}
                      </Link>
                    </td>
                    <td>{c.contactName || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.email}</td>
                    <td>
                      <span className={`status-chip ${statusColor[c.websiteStatus] || 'inactive'}`}>
                        {c.websiteStatus || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>${c.monthlyMaintenanceAmount || 0}/mo</td>
                    <td style={{ color: 'var(--muted)' }}>{c.planName || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <Link to={`/admin/clients/${c.id}`} className="text-button">Edit</Link>
                        {c.archived
                          ? <button className="text-button" type="button" onClick={() => handleRestore(c)}>Restore</button>
                          : <button className="text-button muted" type="button" onClick={() => handleArchive(c)}>Archive</button>
                        }
                        <button className="text-button danger" type="button" onClick={() => handleDelete(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!displayClients.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No clients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {status && <p className="form-status" style={{ marginTop: 10 }}>{status}</p>}
        </>
      )}
    </section>
  );
}
