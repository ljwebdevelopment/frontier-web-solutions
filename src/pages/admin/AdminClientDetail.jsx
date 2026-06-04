import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { where, orderBy } from 'firebase/firestore';
import { ArrowLeft, ExternalLink, Plus, Trash2 } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import {
  addDocument,
  collections,
  createPortalLogin,
  createProject,
  deleteDocument,
  deleteProject,
  getClient,
  listenToCollection,
  listenToDocuments,
  listenToProjects,
  updateClient,
  updateFormSubmission,
  updateProject,
  updateSupportRequest,
} from '../../services/firestoreService';

const STATUS_OPTS = ['Discovery', 'In Progress', 'Live', 'On Hold', 'Archived'];
const PROJECT_STATUSES = ['Not Started', 'In Progress', 'Waiting on Client', 'In Review', 'Complete'];
const DOC_TYPES = ['drive', 'invoice', 'brand', 'onboarding', 'other'];
const DOC_TYPE_LABELS = { drive: 'Google Drive', invoice: 'Invoice', brand: 'Brand Assets', onboarding: 'Onboarding', other: 'Other' };

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'project', label: 'Projects' },
  { key: 'website', label: 'Website' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'billing', label: 'Billing' },
  { key: 'forms', label: 'Forms' },
  { key: 'support', label: 'Requests' },
  { key: 'documents', label: 'Documents' },
  { key: 'notes', label: 'Notes' },
];

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState('overview');
  const [forms, setForms] = useState([]);
  const [support, setSupport] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [newProject, setNewProject] = useState({ name: '', status: 'Not Started', description: '', dueDate: '' });
  const [showNewProject, setShowNewProject] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', url: '', type: 'drive', description: '' });
  const [showNewDoc, setShowNewDoc] = useState(false);

  useEffect(() => {
    if (!clientId) return undefined;
    getClient(clientId).then(setClient);
    const constraints = [where('clientId', '==', clientId), orderBy('createdAt', 'desc')];
    const stops = [
      listenToCollection(collections.formSubmissions, setForms, constraints),
      listenToCollection(collections.supportRequests, setSupport, constraints),
      listenToProjects(clientId, setProjects),
      listenToDocuments(clientId, setDocuments),
    ];
    return () => stops.forEach((s) => s());
  }, [clientId]);

  if (!client) {
    return (
      <section className="workspace-section">
        <div className="workspace-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
          Loading client…
        </div>
      </section>
    );
  }

  function change(e) {
    const { name, value, type, checked } = e.target;
    setClient((c) => ({ ...c, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave(e) {
    if (e?.preventDefault) e.preventDefault();
    setSaveStatus('Saving…');
    try {
      await updateClient(clientId, client);
      setSaveStatus('Saved successfully.');
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
    setTimeout(() => setSaveStatus(''), 3000);
  }

  async function handleAddProject(e) {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    await createProject({ ...newProject, clientId });
    setNewProject({ name: '', status: 'Not Started', description: '', dueDate: '' });
    setShowNewProject(false);
  }

  async function handleDeleteProject(p) {
    if (!window.confirm(`Delete project "${p.name}"?`)) return;
    await deleteProject(p.id);
  }

  async function handleCreateLogin() {
    if (!client.portalLoginEmail) {
      setLoginStatus('Error: Set a portal login email first and save.');
      return;
    }
    setLoginStatus('Creating login…');
    try {
      const result = await createPortalLogin({
        businessName: client.businessName,
        contactName: client.contactName,
        email: client.email,
        phone: client.phone,
        websiteUrl: client.websiteUrl,
        planName: client.planName,
        monthlyMaintenanceAmount: client.monthlyMaintenanceAmount,
        websiteStatus: client.websiteStatus,
        portalLoginEmail: client.portalLoginEmail,
      });
      const { uid, temporaryPassword } = result.data;
      await updateClient(clientId, { authUid: uid });
      setClient((c) => ({ ...c, authUid: uid }));
      setLoginStatus(`Login created. Temp password: ${temporaryPassword}`);
    } catch (err) {
      setLoginStatus(`Error: ${err.message}`);
    }
  }

  async function handleAddDocument(e) {
    e.preventDefault();
    if (!newDoc.title.trim() || !newDoc.url.trim()) return;
    await addDocument({ ...newDoc, clientId });
    setNewDoc({ title: '', url: '', type: 'drive', description: '' });
    setShowNewDoc(false);
  }

  async function handleDeleteDocument(d) {
    if (!window.confirm(`Remove "${d.title}"?`)) return;
    await deleteDocument(d.id);
  }

  const statusColor = {
    Discovery: 'pending',
    'In Progress': 'building',
    Live: 'active',
    'On Hold': 'warning',
    Archived: 'inactive',
  };

  const SaveBar = ({ style }) => saveStatus ? (
    <p
      className={saveStatus.startsWith('Error') ? 'form-error' : 'form-status'}
      style={{ marginTop: 10, ...style }}
    >
      {saveStatus}
    </p>
  ) : null;

  return (
    <section className="workspace-section">
      {/* Header */}
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <Link
            to="/admin/clients"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}
          >
            <ArrowLeft size={12} /> All Clients
          </Link>
          <h2 style={{ marginBottom: 6 }}>{client.businessName}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`status-chip ${statusColor[client.websiteStatus] || 'inactive'}`}>
              {client.websiteStatus || 'Unknown'}
            </span>
            {client.websiteUrl && (
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--red)' }}
              >
                {client.websiteUrl} <ExternalLink size={11} />
              </a>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>${client.monthlyMaintenanceAmount || 0}/mo</span>
            {client.portalLoginEmail && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Portal: {client.portalLoginEmail}</span>
            )}
          </div>
        </div>
        <button className="button primary sm" onClick={handleSave}>Save Changes</button>
      </div>

      {/* KPI row */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', marginBottom: 20 }}>
        <StatCard label="Form Submissions" value={forms.length} />
        <StatCard label="Support Requests" value={support.length} note={`${support.filter(r => r.status !== 'closed').length} open`} />
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Monthly Revenue" value={`$${client.monthlyMaintenanceAmount || 0}`} />
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="workspace-grid">
          <div className="workspace-card">
            <h3>Contact Information</h3>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label>Business Name<input name="businessName" value={client.businessName || ''} onChange={change} required /></label>
                <label>Contact Name<input name="contactName" value={client.contactName || ''} onChange={change} /></label>
                <label>Email<input type="email" name="email" value={client.email || ''} onChange={change} /></label>
                <label>Phone<input name="phone" value={client.phone || ''} onChange={change} /></label>
                <label>Address<input name="address" value={client.address || ''} onChange={change} /></label>
                <label>Industry<input name="industry" value={client.industry || ''} onChange={change} /></label>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Social Links</div>
                <div className="form-grid">
                  <label>Facebook URL<input name="facebookUrl" value={client.facebookUrl || ''} onChange={change} placeholder="https://facebook.com/…" /></label>
                  <label>Instagram URL<input name="instagramUrl" value={client.instagramUrl || ''} onChange={change} placeholder="https://instagram.com/…" /></label>
                  <label>LinkedIn URL<input name="linkedinUrl" value={client.linkedinUrl || ''} onChange={change} placeholder="https://linkedin.com/company/…" /></label>
                  <label>X / Twitter URL<input name="twitterUrl" value={client.twitterUrl || ''} onChange={change} placeholder="https://x.com/…" /></label>
                  <label style={{ gridColumn: '1/-1' }}>Google Business Profile<input name="googleBusinessUrl" value={client.googleBusinessUrl || ''} onChange={change} /></label>
                </div>
              </div>

              <label style={{ marginTop: 16, display: 'block' }}>
                Client-Facing Notes
                <textarea name="notes" value={client.notes || ''} onChange={change} style={{ minHeight: 80 }} />
              </label>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="button primary sm" type="submit">Save</button>
                <SaveBar style={{ margin: 0 }} />
              </div>
            </form>
          </div>

          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <div className="workspace-card">
              <h3>Portal Preview</h3>
              <div className="portal-preview">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{client.websiteStatus || 'Status unknown'}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Maintenance: ${client.monthlyMaintenanceAmount || 0}/mo</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Payment: {client.paymentStatus || '—'}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Subscription: {client.subscriptionEnabled ? 'Enabled' : 'Disabled'}</div>
                {client.portalLoginEmail && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
                    Portal login: {client.portalLoginEmail}
                  </div>
                )}
                {client.googleAnalyticsPropertyId && (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>GA4: {client.googleAnalyticsPropertyId}</div>
                )}
                {client.googleSheetId && (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Sheet ID: {client.googleSheetId.slice(0, 20)}…</div>
                )}
              </div>
            </div>

            <div className="workspace-card">
              <h3>Recent Requests</h3>
              <div className="record-list">
                {support.slice(0, 4).map((r) => (
                  <div key={r.id} className="record-row" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subject}</span>
                    <span className={`status-chip ${r.status === 'closed' ? 'active' : 'pending'}`} style={{ flexShrink: 0 }}>{r.status}</span>
                  </div>
                ))}
                {!support.length && <p style={{ fontSize: 13, color: 'var(--muted)' }}>No requests yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECTS TAB ── */}
      {tab === 'project' && (
        <div className="workspace-card">
          <div className="workspace-title-row">
            <h3>Projects</h3>
            <button className="button primary sm" onClick={() => setShowNewProject((v) => !v)}>
              <Plus size={13} /> Add Project
            </button>
          </div>

          {showNewProject && (
            <form onSubmit={handleAddProject} style={{ padding: '14px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', marginBottom: 16, border: '1px solid var(--line)' }}>
              <div className="form-grid" style={{ marginBottom: 10 }}>
                <label>Project Name<input value={newProject.name} onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))} required /></label>
                <label>Status
                  <select value={newProject.status} onChange={(e) => setNewProject((p) => ({ ...p, status: e.target.value }))}>
                    {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>Due Date<input type="date" value={newProject.dueDate} onChange={(e) => setNewProject((p) => ({ ...p, dueDate: e.target.value }))} /></label>
              </div>
              <label style={{ marginBottom: 10 }}>Description<textarea value={newProject.description} onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))} style={{ minHeight: 60 }} /></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button primary sm" type="submit">Add Project</button>
                <button className="button ghost sm" type="button" onClick={() => setShowNewProject(false)}>Cancel</button>
              </div>
            </form>
          )}

          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Status</th><th>Due Date</th><th>Description</th><th /></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <select
                      value={p.status}
                      onChange={(e) => updateProject(p.id, { status: e.target.value })}
                      style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 4, background: 'transparent' }}
                    >
                      {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{p.dueDate || '—'}</td>
                  <td style={{ color: 'var(--muted)', maxWidth: 280 }}>{p.description || '—'}</td>
                  <td>
                    <button className="text-button danger" onClick={() => handleDeleteProject(p)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {!projects.length && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No projects yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── WEBSITE TAB ── */}
      {tab === 'website' && (
        <div className="workspace-card">
          <h3>Website &amp; Infrastructure</h3>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <label>Website URL<input name="websiteUrl" value={client.websiteUrl || ''} onChange={change} /></label>
              <label>Domain<input name="domain" value={client.domain || ''} onChange={change} /></label>
              <label>Hosting Provider<input name="hostingProvider" value={client.hostingProvider || ''} onChange={change} /></label>
              <label>Domain Registrar<input name="domainRegistrar" value={client.domainRegistrar || ''} onChange={change} /></label>
              <label>GitHub Repository<input name="githubRepo" value={client.githubRepo || ''} onChange={change} /></label>
              <label>SSL Status
                <select name="sslStatus" value={client.sslStatus || 'Active'} onChange={change}>
                  <option>Active</option>
                  <option>Expiring Soon</option>
                  <option>Expired</option>
                  <option>Not Configured</option>
                </select>
              </label>
              <label>DNS Provider<input name="dnsProvider" value={client.dnsProvider || ''} onChange={change} /></label>
              <label>Website Status
                <select name="websiteStatus" value={client.websiteStatus || 'Discovery'} onChange={change}>
                  {STATUS_OPTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Launch Date<input type="date" name="launchDate" value={client.launchDate || ''} onChange={change} /></label>
              <label>Renewal Date<input type="date" name="renewalDate" value={client.renewalDate || ''} onChange={change} /></label>
            </div>
            <label style={{ marginTop: 12, display: 'block' }}>Services Included
              <textarea name="servicesIncluded" value={client.servicesIncluded || ''} onChange={change} style={{ minHeight: 72 }} />
            </label>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="button primary sm" type="submit">Save</button>
              <SaveBar style={{ margin: 0 }} />
            </div>
          </form>
        </div>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {tab === 'integrations' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Google Analytics */}
          <div className="workspace-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Google Analytics 4</h3>
              {client.googleAnalyticsPropertyId
                ? <span className="status-chip building">Property saved</span>
                : <span className="status-chip inactive">Not configured</span>
              }
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Store the client's GA4 Property ID here. The client can also enter it themselves via their Profile page.
              Once set, the Analytics tab in the client portal will display the property ID and await API activation.
            </p>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label>GA4 Property ID<input name="googleAnalyticsPropertyId" value={client.googleAnalyticsPropertyId || ''} onChange={change} placeholder="G-XXXXXXXXXX or numeric ID" /></label>
                <label>Google Analytics URL (optional)<input name="googleAnalyticsUrl" value={client.googleAnalyticsUrl || ''} onChange={change} placeholder="https://analytics.google.com/…" /></label>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="button primary sm" type="submit">Save</button>
                <SaveBar style={{ margin: 0 }} />
              </div>
            </form>
          </div>

          {/* Google Sheets */}
          <div className="workspace-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Google Sheets — Form Submissions</h3>
              {client.googleSheetId
                ? <span className="status-chip building">Sheet saved</span>
                : <span className="status-chip inactive">Not configured</span>
              }
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
              When the Google Sheets API is connected, form submissions from the client's website will be pulled from this sheet and displayed in their Forms section.
            </p>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label>
                  Google Sheet ID
                  <input name="googleSheetId" value={client.googleSheetId || ''} onChange={change} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
                </label>
                <label>
                  Sheet URL
                  <input name="googleSheetUrl" value={client.googleSheetUrl || ''} onChange={change} placeholder="https://docs.google.com/spreadsheets/d/…" />
                </label>
              </div>
              {client.googleSheetUrl && (
                <a href={client.googleSheetUrl} target="_blank" rel="noopener noreferrer" className="button ghost sm" style={{ marginTop: 8, display: 'inline-flex' }}>
                  Open Sheet <ExternalLink size={12} />
                </a>
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="button primary sm" type="submit">Save</button>
                <SaveBar style={{ margin: 0 }} />
              </div>
            </form>
          </div>

          {/* Portal login */}
          <div className="workspace-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Portal Login Access</h3>
              {client.authUid
                ? <span className="status-chip active">Login active</span>
                : <span className="status-chip inactive">No login yet</span>
              }
            </div>

            {!client.authUid && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                This client has no portal login. Set the email below, save it, then click <strong>Create Portal Login</strong>. Requires Firebase Blaze plan with Cloud Functions deployed.
              </div>
            )}

            <form onSubmit={handleSave} style={{ marginBottom: 16 }}>
              <div className="form-grid">
                <label>Portal Login Email<input type="email" name="portalLoginEmail" value={client.portalLoginEmail || ''} onChange={change} placeholder="client@example.com" /></label>
                <label>Firebase Auth UID<input value={client.authUid || 'Not created yet'} readOnly style={{ background: 'var(--soft)', cursor: 'not-allowed', color: 'var(--muted)' }} /></label>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="button primary sm" type="submit">Save Email</button>
                {!client.authUid && (
                  <button
                    className="button ghost sm"
                    type="button"
                    onClick={handleCreateLogin}
                    disabled={loginStatus === 'Creating login…'}
                  >
                    {loginStatus === 'Creating login…' ? 'Creating…' : 'Create Portal Login'}
                  </button>
                )}
                <SaveBar style={{ margin: 0 }} />
              </div>
            </form>
            {loginStatus && (
              <p className={loginStatus.startsWith('Error') ? 'form-error' : 'form-status'}>
                {loginStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── BILLING TAB ── */}
      {tab === 'billing' && (
        <div className="workspace-card">
          <h3>Billing &amp; Subscription</h3>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <label>Plan Name<input name="planName" value={client.planName || ''} onChange={change} /></label>
              <label>Monthly Maintenance ($)<input type="number" name="monthlyMaintenanceAmount" value={client.monthlyMaintenanceAmount ?? 95} onChange={change} min="0" /></label>
              <label>Build Price ($)<input type="number" name="buildPrice" value={client.buildPrice ?? 0} onChange={change} min="0" /></label>
              <label>Payment Status<input name="paymentStatus" value={client.paymentStatus || ''} onChange={change} /></label>
              <label>Billing Due Date<input type="date" name="billingDueDate" value={client.billingDueDate || ''} onChange={change} /></label>
              <label>Stripe Customer ID<input name="stripeCustomerId" value={client.stripeCustomerId || ''} onChange={change} /></label>
              <label>Stripe Subscription ID<input name="stripeSubscriptionId" value={client.stripeSubscriptionId || ''} onChange={change} /></label>
              <label>Billing Portal URL<input name="billingPortalUrl" value={client.billingPortalUrl || ''} onChange={change} /></label>
            </div>
            <label className="check-row" style={{ marginTop: 10 }}>
              <input type="checkbox" name="subscriptionEnabled" checked={!!client.subscriptionEnabled} onChange={change} />
              Automatic subscription billing enabled
            </label>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="button primary sm" type="submit">Save Billing</button>
              <SaveBar style={{ margin: 0 }} />
            </div>
          </form>
        </div>
      )}

      {/* ── FORMS TAB ── */}
      {tab === 'forms' && (
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Form Submissions ({forms.length})</h3>
            {client.googleSheetUrl && (
              <a href={client.googleSheetUrl} target="_blank" rel="noopener noreferrer" className="button ghost sm">
                Open Google Sheet <ExternalLink size={12} />
              </a>
            )}
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Status</th><th>Received</th></tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.name || f.businessName || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{f.email || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{f.phone || '—'}</td>
                  <td style={{ color: 'var(--muted)', maxWidth: 260 }}>{(f.message || '').slice(0, 80)}{f.message?.length > 80 ? '…' : ''}</td>
                  <td>
                    <select
                      value={f.status || 'new'}
                      onChange={(e) => updateFormSubmission(f.id, { status: e.target.value })}
                      style={{ fontSize: 11, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer' }}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {!forms.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No form submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab === 'support' && (
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ margin: 0 }}>
              Support Requests ({support.length})
              {' · '}<span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 12 }}>
                {support.filter(r => r.status !== 'closed').length} open
              </span>
            </h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Subject</th><th>Priority</th><th>Message</th><th>Status</th><th>Submitted</th></tr>
            </thead>
            <tbody>
              {support.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.subject || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{r.priority || 'Normal'}</td>
                  <td style={{ color: 'var(--muted)', maxWidth: 300 }}>{(r.message || '').slice(0, 90)}{r.message?.length > 90 ? '…' : ''}</td>
                  <td>
                    <select
                      value={r.status || 'open'}
                      onChange={(e) => updateSupportRequest(r.id, { status: e.target.value })}
                      style={{ fontSize: 11, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer' }}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="waiting">Waiting on Client</option>
                      <option value="closed">Resolved</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {!support.length && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DOCUMENTS TAB ── */}
      {tab === 'documents' && (
        <div className="workspace-card">
          <div className="workspace-title-row">
            <h3>Documents &amp; Resources</h3>
            <button className="button primary sm" onClick={() => setShowNewDoc((v) => !v)}>
              <Plus size={13} /> Add Link
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Add links to Google Drive folders, brand assets, invoices, onboarding docs, and any other resources. These are visible in the client portal under Documents.
          </p>

          {showNewDoc && (
            <form onSubmit={handleAddDocument} style={{ padding: '16px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', marginBottom: 20, border: '1px solid var(--line)' }}>
              <div className="form-grid" style={{ marginBottom: 10 }}>
                <label>Title<input value={newDoc.title} onChange={(e) => setNewDoc((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Brand Assets Drive Folder" required /></label>
                <label>Type
                  <select value={newDoc.type} onChange={(e) => setNewDoc((d) => ({ ...d, type: e.target.value }))}>
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
                  </select>
                </label>
                <label style={{ gridColumn: '1/-1' }}>URL<input type="url" value={newDoc.url} onChange={(e) => setNewDoc((d) => ({ ...d, url: e.target.value }))} placeholder="https://…" required /></label>
                <label style={{ gridColumn: '1/-1' }}>Description (optional)<input value={newDoc.description} onChange={(e) => setNewDoc((d) => ({ ...d, description: e.target.value }))} placeholder="Short description of this resource" /></label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button primary sm" type="submit">Add Document</button>
                <button className="button ghost sm" type="button" onClick={() => setShowNewDoc(false)}>Cancel</button>
              </div>
            </form>
          )}

          {documents.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontWeight: 700 }}>No documents added yet.</p>
              <p>Click "Add Link" to add Google Drive folders, invoices, or other client resources.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Type</th><th>Description</th><th>URL</th><th /></tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.title}</td>
                    <td><span className="status-chip building">{DOC_TYPE_LABELS[d.type] || d.type}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{d.description || '—'}</td>
                    <td>
                      <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Open <ExternalLink size={11} />
                      </a>
                    </td>
                    <td>
                      <button className="text-button danger" onClick={() => handleDeleteDocument(d)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── NOTES TAB ── */}
      {tab === 'notes' && (
        <div className="workspace-card">
          <h3>Notes</h3>
          <form onSubmit={handleSave}>
            <label style={{ marginBottom: 14, display: 'block' }}>
              Internal Notes (admin only)
              <textarea name="internalNotes" value={client.internalNotes || ''} onChange={change} style={{ minHeight: 180 }} placeholder="Private notes — not visible to the client." />
            </label>
            <label style={{ marginBottom: 14, display: 'block' }}>
              Client Notes (visible in portal)
              <textarea name="notes" value={client.notes || ''} onChange={change} style={{ minHeight: 120 }} placeholder="Notes shown to the client in their dashboard overview." />
            </label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="button primary sm" type="submit">Save Notes</button>
              <SaveBar style={{ margin: 0 }} />
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
