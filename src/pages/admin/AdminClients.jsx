import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Eye, EyeOff, Plus, Search } from 'lucide-react';
import {
  archiveClient,
  createClientWithPortalLogin,
  deleteClient,
  listenToClients,
  updateClient,
} from '../../services/firestoreService';

const blankClient = {
  // Contact
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  industry: '',
  // Portal login
  portalLoginEmail: '',
  temporaryPassword: '',
  // Website
  websiteUrl: '',
  domain: '',
  hostingProvider: '',
  websiteStatus: 'Discovery',
  launchDate: '',
  // Plan & billing
  planName: 'Website + Maintenance',
  monthlyMaintenanceAmount: 95,
  buildPrice: 300,
  paymentStatus: 'Not started',
  billingDueDate: '',
  subscriptionEnabled: false,
  stripeCustomerId: '',
  // Integrations
  googleAnalyticsPropertyId: '',
  googleSheetId: '',
  googleSheetUrl: '',
  // Services
  servicesIncluded: 'Website build, monthly maintenance, form tracking, client portal access',
  notes: '',
  internalNotes: '',
};

const STATUS_OPTIONS = ['All', 'Discovery', 'In Progress', 'Live', 'On Hold', 'Archived'];
const STATUS_COLOR = {
  Discovery: 'pending', 'In Progress': 'building', Live: 'active', 'On Hold': 'warning', Archived: 'inactive',
};

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [form, setForm] = useState(blankClient);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null); // { email, password, clientId }
  const [saving, setSaving] = useState(false);
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
    if (statusFilter !== 'All') list = list.filter((c) => c.websiteStatus === statusFilter);
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
    if (!form.businessName.trim() || !form.contactName.trim()) {
      setStatus('Business name and contact name are required.');
      return;
    }
    const loginEmail = (form.portalLoginEmail || form.email).trim();
    if (!loginEmail) {
      setStatus('Email is required — it will be used for portal login.');
      return;
    }
    setSaving(true);
    setStatus('Creating client and portal login…');
    setCreatedCreds(null);
    try {
      const result = await createClientWithPortalLogin({
        ...form,
        portalLoginEmail: loginEmail,
        monthlyMaintenanceAmount: Number(form.monthlyMaintenanceAmount),
        buildPrice: Number(form.buildPrice),
      });
      setCreatedCreds({
        email: loginEmail,
        password: result.temporaryPassword,
        clientId: result.clientId,
      });
      setForm(blankClient);
      setStatus('');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(c) {
    if (!window.confirm(`Archive ${c.businessName}?`)) return;
    await archiveClient(c.id);
  }

  async function handleRestore(c) {
    await updateClient(c.id, { archived: false, websiteStatus: c.websiteStatus === 'Archived' ? 'Live' : c.websiteStatus });
  }

  async function handleDelete(c) {
    if (!window.confirm(`Permanently delete ${c.businessName} and remove their portal login? This cannot be undone.`)) return;
    try {
      await deleteClient(c.id);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  function Section({ title }) {
    return (
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 24, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
        {title}
      </div>
    );
  }

  return (
    <section className="workspace-section">
      <div className="workspace-title-row">
        <div>
          <h2>Clients</h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {activeClients.length} active · {archivedClients.length} archived
          </span>
        </div>
        <button className="button primary sm" onClick={() => { setTab('new'); setCreatedCreds(null); setStatus(''); }}>
          <Plus size={14} /> New Client
        </button>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn${tab === 'active' ? ' active' : ''}`} onClick={() => setTab('active')}>
          Active ({activeClients.length})
        </button>
        <button className={`tab-btn${tab === 'archived' ? ' active' : ''}`} onClick={() => setTab('archived')}>
          Archived ({archivedClients.length})
        </button>
        <button className={`tab-btn${tab === 'new' ? ' active' : ''}`} onClick={() => { setTab('new'); setCreatedCreds(null); setStatus(''); }}>
          + Create Client
        </button>
      </div>

      {/* ── Create Client Form ── */}
      {tab === 'new' && (
        <div className="workspace-card">
          <h3 style={{ marginBottom: 4 }}>Create New Client</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            Fill in everything you have now. This creates the client record AND their portal login in one step.
            Anything left blank can be added later in the client detail page.
          </p>

          {/* Success — show credentials */}
          {createdCreds && (
            <div style={{ marginBottom: 24, padding: '18px 20px', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#166534', marginBottom: 12 }}>✓ Client created successfully</p>
              <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Portal Login Email', value: createdCreds.email },
                  { label: 'Temporary Password', value: createdCreds.password },
                  { label: 'Client ID', value: createdCreds.clientId },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#166534', fontWeight: 700, minWidth: 160 }}>{label}</span>
                    <code style={{ fontSize: 13, background: '#dcfce7', padding: '3px 8px', borderRadius: 4, flex: 1 }}>{value}</code>
                    <button
                      className="text-button"
                      style={{ color: '#166534' }}
                      onClick={() => navigator.clipboard.writeText(value)}
                      title="Copy"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#166534' }}>
                Share the email and temporary password with your client. They can change their password after logging in.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Link to={`/admin/clients/${createdCreds.clientId}`} className="button primary sm">
                  Open Client Record →
                </Link>
                <button className="button ghost sm" onClick={() => { setCreatedCreds(null); setTab('active'); }}>
                  Back to Clients
                </button>
              </div>
            </div>
          )}

          {!createdCreds && (
            <form onSubmit={handleCreate}>
              {/* Contact */}
              <Section title="Contact Information" />
              <div className="form-grid">
                <label>Business Name *<input name="businessName" value={form.businessName} onChange={updateField} required /></label>
                <label>Contact Name *<input name="contactName" value={form.contactName} onChange={updateField} required /></label>
                <label>Email *<input type="email" name="email" value={form.email} onChange={updateField} required /></label>
                <label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label>
                <label>Address<input name="address" value={form.address} onChange={updateField} /></label>
                <label>Industry<input name="industry" value={form.industry} onChange={updateField} placeholder="e.g. Landscaping, Dental, HVAC" /></label>
              </div>

              {/* Portal Login */}
              <Section title="Portal Login" />
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                This email and password are what your client uses to log in to their portal. Defaults to the email above if left blank.
              </p>
              <div className="form-grid">
                <label>
                  Portal Login Email
                  <input
                    type="email"
                    name="portalLoginEmail"
                    value={form.portalLoginEmail}
                    onChange={updateField}
                    placeholder="Defaults to email above"
                  />
                </label>
                <label>
                  Temporary Password
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="temporaryPassword"
                      value={form.temporaryPassword}
                      onChange={updateField}
                      placeholder="Auto-generated if blank"
                      style={{ paddingRight: 36 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>
              </div>

              {/* Website */}
              <Section title="Website" />
              <div className="form-grid">
                <label>
                  Website Status
                  <select name="websiteStatus" value={form.websiteStatus} onChange={updateField}>
                    {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>Website URL<input name="websiteUrl" value={form.websiteUrl} onChange={updateField} placeholder="https://example.com" /></label>
                <label>Domain<input name="domain" value={form.domain} onChange={updateField} placeholder="example.com" /></label>
                <label>Hosting Provider<input name="hostingProvider" value={form.hostingProvider} onChange={updateField} placeholder="e.g. Firebase, Netlify, GoDaddy" /></label>
                <label>Launch Date<input type="date" name="launchDate" value={form.launchDate} onChange={updateField} /></label>
              </div>

              {/* Analytics */}
              <Section title="Google Analytics" />
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                The client will see live analytics data in their portal once this is connected.
              </p>
              <div className="form-grid">
                <label>
                  GA4 Property ID
                  <input
                    name="googleAnalyticsPropertyId"
                    value={form.googleAnalyticsPropertyId}
                    onChange={updateField}
                    placeholder="G-XXXXXXXXXX or numeric property ID"
                  />
                </label>
              </div>

              {/* Google Sheets */}
              <Section title="Google Sheets — Form Submissions" />
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                The client will see their contact form submissions pulled from this sheet.
              </p>
              <div className="form-grid">
                <label>
                  Google Sheet ID
                  <input
                    name="googleSheetId"
                    value={form.googleSheetId}
                    onChange={updateField}
                    placeholder="Found in the sheet URL between /d/ and /edit"
                  />
                </label>
                <label>
                  Google Sheet URL
                  <input
                    name="googleSheetUrl"
                    value={form.googleSheetUrl}
                    onChange={updateField}
                    placeholder="https://docs.google.com/spreadsheets/d/…"
                  />
                </label>
              </div>

              {/* Plan & Billing */}
              <Section title="Plan &amp; Billing" />
              <div className="form-grid">
                <label>
                  Plan Name
                  <input name="planName" value={form.planName} onChange={updateField} />
                </label>
                <label>
                  Monthly Maintenance ($)
                  <input type="number" min="0" name="monthlyMaintenanceAmount" value={form.monthlyMaintenanceAmount} onChange={updateField} />
                </label>
                <label>
                  Build Price ($)
                  <input type="number" min="0" name="buildPrice" value={form.buildPrice} onChange={updateField} />
                </label>
                <label>
                  Payment Status
                  <select name="paymentStatus" value={form.paymentStatus} onChange={updateField}>
                    <option>Not started</option>
                    <option>Active</option>
                    <option>Overdue</option>
                    <option>Cancelled</option>
                  </select>
                </label>
                <label>
                  Billing Due Date
                  <input type="date" name="billingDueDate" value={form.billingDueDate} onChange={updateField} />
                </label>
                <label>
                  Stripe Customer ID
                  <input name="stripeCustomerId" value={form.stripeCustomerId} onChange={updateField} placeholder="cus_… (from Stripe dashboard)" />
                </label>
              </div>
              <label className="check-row" style={{ marginTop: 4 }}>
                <input type="checkbox" name="subscriptionEnabled" checked={form.subscriptionEnabled} onChange={updateField} />
                Automatic subscription billing enabled
              </label>

              {/* Services */}
              <Section title="Services Included" />
              <label style={{ marginBottom: 12, display: 'block' }}>
                <textarea name="servicesIncluded" value={form.servicesIncluded} onChange={updateField} style={{ minHeight: 72 }} />
              </label>

              {/* Notes */}
              <Section title="Notes" />
              <div className="form-grid">
                <label>
                  Client-Facing Notes (shown in portal)
                  <textarea name="notes" value={form.notes} onChange={updateField} style={{ minHeight: 72 }} />
                </label>
                <label>
                  Internal Notes (admin only)
                  <textarea name="internalNotes" value={form.internalNotes} onChange={updateField} style={{ minHeight: 72 }} />
                </label>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="button primary" type="submit" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Client + Portal Login'}
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => { setForm(blankClient); setTab('active'); setStatus(''); }}
                >
                  Cancel
                </button>
              </div>
              {status && (
                <p
                  className={status.startsWith('Error') || status.includes('required') ? 'form-error' : 'form-status'}
                  style={{ marginTop: 12 }}
                >
                  {status}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {/* ── Client List ── */}
      {tab !== 'new' && (
        <>
          <div className="filter-bar">
            <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
              <input
                className="search-input"
                style={{ paddingLeft: 30, width: '100%' }}
                placeholder="Search clients…"
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
                      {!c.authUid && (
                        <span className="status-chip inactive" style={{ marginLeft: 6, fontSize: 10 }}>no login</span>
                      )}
                    </td>
                    <td>{c.contactName || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.email}</td>
                    <td>
                      <span className={`status-chip ${STATUS_COLOR[c.websiteStatus] || 'inactive'}`}>
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
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                      {search || statusFilter !== 'All' ? 'No clients match your filters.' : 'No clients yet. Click "New Client" to add one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
