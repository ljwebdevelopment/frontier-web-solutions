import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getClient, updateClient } from '../../services/firestoreService';

export default function PortalProfile() {
  const { profile } = useAuth();
  const [client, setClient] = useState(null);
  const [form, setForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.clientId) return;
    getClient(profile.clientId).then((c) => {
      setClient(c);
      setForm(c);
      setLoading(false);
    });
  }, [profile?.clientId]);

  function change(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveStatus('Saving…');
    try {
      await updateClient(profile.clientId, {
        phone: form.phone,
        address: form.address,
        facebookUrl: form.facebookUrl,
        instagramUrl: form.instagramUrl,
        linkedinUrl: form.linkedinUrl,
        twitterUrl: form.twitterUrl,
        googleBusinessUrl: form.googleBusinessUrl,
        googleSheetId: form.googleSheetId,
        googleSheetUrl: form.googleSheetUrl,
        googleAnalyticsPropertyId: form.googleAnalyticsPropertyId,
      });
      setClient((c) => ({ ...c, ...form }));
      setSaveStatus('Changes saved.');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
  }

  if (loading || !form) {
    return (
      <section className="workspace-section">
        <div className="screen-loader" style={{ minHeight: 'auto', padding: '60px 0' }}>Loading…</div>
      </section>
    );
  }

  return (
    <section className="workspace-section">
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Account</p>
          <h2>Business Profile</h2>
        </div>
        <button className="button primary sm" onClick={handleSave}>Save Changes</button>
      </div>

      {saveStatus && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: saveStatus.startsWith('Error') ? '#fee2e2' : '#f0fdf4', border: `1px solid ${saveStatus.startsWith('Error') ? '#fca5a5' : '#bbf7d0'}`, borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700, color: saveStatus.startsWith('Error') ? 'var(--danger)' : 'var(--green)' }}>
          {saveStatus}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gap: 16 }}>

          {/* Business info (read-only) */}
          <div className="workspace-card">
            <h3>Business Information</h3>
            <div style={{ marginBottom: 6, padding: '8px 12px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--muted)', borderLeft: '3px solid var(--line)' }}>
              Business name, email, and website URL are managed by Frontier Web Systems. Contact us to update these.
            </div>
            <div className="form-grid" style={{ marginTop: 14 }}>
              <label>
                Business Name
                <input value={client?.businessName || ''} readOnly style={{ background: 'var(--soft)', cursor: 'not-allowed', color: 'var(--muted)' }} />
              </label>
              <label>
                Contact Name
                <input value={client?.contactName || ''} readOnly style={{ background: 'var(--soft)', cursor: 'not-allowed', color: 'var(--muted)' }} />
              </label>
              <label>
                Email
                <input value={client?.email || ''} readOnly style={{ background: 'var(--soft)', cursor: 'not-allowed', color: 'var(--muted)' }} />
              </label>
              <label>
                Phone
                <input name="phone" value={form.phone || ''} onChange={change} placeholder="Your phone number" />
              </label>
              <label style={{ gridColumn: '1/-1' }}>
                Business Address
                <input name="address" value={form.address || ''} onChange={change} placeholder="Street, City, State, ZIP" />
              </label>
            </div>
            {client?.websiteUrl && (
              <div style={{ marginTop: 14 }}>
                <label>
                  Website URL
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={client.websiteUrl} readOnly style={{ background: 'var(--soft)', cursor: 'not-allowed', color: 'var(--muted)', flex: 1 }} />
                    <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="button ghost sm" style={{ flexShrink: 0 }}>
                      <ExternalLink size={13} /> Visit
                    </a>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Social links */}
          <div className="workspace-card">
            <h3>Social Links</h3>
            <div className="form-grid">
              <label>Facebook<input name="facebookUrl" value={form.facebookUrl || ''} onChange={change} placeholder="https://facebook.com/yourbusiness" /></label>
              <label>Instagram<input name="instagramUrl" value={form.instagramUrl || ''} onChange={change} placeholder="https://instagram.com/yourbusiness" /></label>
              <label>LinkedIn<input name="linkedinUrl" value={form.linkedinUrl || ''} onChange={change} placeholder="https://linkedin.com/company/yourbusiness" /></label>
              <label>X / Twitter<input name="twitterUrl" value={form.twitterUrl || ''} onChange={change} placeholder="https://x.com/yourbusiness" /></label>
              <label style={{ gridColumn: '1/-1' }}>Google Business Profile<input name="googleBusinessUrl" value={form.googleBusinessUrl || ''} onChange={change} placeholder="https://g.page/yourbusiness" /></label>
            </div>
          </div>

          {/* Integrations */}
          <div className="workspace-card">
            <h3>Integrations</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Connect your Google services so your dashboard can display live analytics and form submissions from your website.
            </p>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* Google Analytics */}
              <div style={{ padding: '16px 18px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: form.googleAnalyticsPropertyId ? 'rgba(139,0,0,0.03)' : 'var(--soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Google Analytics 4</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>Displays website traffic, sessions, users, and top pages in your Analytics dashboard.</p>
                  </div>
                  {form.googleAnalyticsPropertyId
                    ? <span className="status-chip building" style={{ flexShrink: 0 }}>Configured</span>
                    : <span className="status-chip inactive" style={{ flexShrink: 0 }}>Not set</span>
                  }
                </div>
                <label style={{ marginBottom: 0 }}>
                  GA4 Property ID
                  <input
                    name="googleAnalyticsPropertyId"
                    value={form.googleAnalyticsPropertyId || ''}
                    onChange={change}
                    placeholder="e.g. G-XXXXXXXXXX or 123456789"
                  />
                </label>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  Find this in Google Analytics → Admin → Property Settings → Property ID.
                  {' '}<a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', fontWeight: 700 }}>Open GA4 <ExternalLink size={10} style={{ display: 'inline' }} /></a>
                </p>
              </div>

              {/* Google Sheets */}
              <div style={{ padding: '16px 18px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: form.googleSheetId ? 'rgba(139,0,0,0.03)' : 'var(--soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Google Sheets — Form Submissions</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>Pulls live contact form submissions from a Google Sheet connected to your website's form.</p>
                  </div>
                  {form.googleSheetId
                    ? <span className="status-chip building" style={{ flexShrink: 0 }}>Configured</span>
                    : <span className="status-chip inactive" style={{ flexShrink: 0 }}>Not set</span>
                  }
                </div>
                <div className="form-grid">
                  <label>
                    Google Sheet ID
                    <input
                      name="googleSheetId"
                      value={form.googleSheetId || ''}
                      onChange={change}
                      placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    />
                  </label>
                  <label>
                    Sheet URL (optional)
                    <input
                      name="googleSheetUrl"
                      value={form.googleSheetUrl || ''}
                      onChange={change}
                      placeholder="https://docs.google.com/spreadsheets/d/…"
                    />
                  </label>
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  The Sheet ID is found in the URL of your Google Sheet between <code>/d/</code> and <code>/edit</code>.
                  {form.googleSheetUrl && (
                    <> {' '}<a href={form.googleSheetUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', fontWeight: 700 }}>Open Sheet <ExternalLink size={10} style={{ display: 'inline' }} /></a></>
                  )}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button className="button primary sm" type="submit">Save Integrations</button>
            </div>
            {saveStatus && (
              <p className={`form-${saveStatus.startsWith('Error') ? 'error' : 'status'}`} style={{ marginTop: 8 }}>{saveStatus}</p>
            )}
          </div>

        </div>
      </form>
    </section>
  );
}
