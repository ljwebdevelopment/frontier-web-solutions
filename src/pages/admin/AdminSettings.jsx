import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminSettings() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState('');

  return (
    <section className="workspace-section">
      <div className="workspace-title-row">
        <h2>Settings</h2>
      </div>

      <div className="workspace-grid">
        {/* ── Owner Account ── */}
        <div className="workspace-card">
          <h3>Owner Account</h3>
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{profile?.email || '—'}</div>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Role</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Owner / Administrator</div>
            </div>
          </div>
        </div>

        {/* ── Business Info ── */}
        <div className="workspace-card">
          <h3>Business Information</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <label>Company Name<input defaultValue="Frontier Web Systems" readOnly style={{ background: 'var(--soft)' }} /></label>
            <label>Business Email<input defaultValue="hello@frontierwebsystems.com" readOnly style={{ background: 'var(--soft)' }} /></label>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            To update business information, contact your developer or update directly in Firebase.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="workspace-card">
          <h3>System Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
            {[
              { label: 'Database', value: 'Firebase Firestore', status: 'active' },
              { label: 'Auth', value: 'Firebase Auth', status: 'active' },
              { label: 'Functions', value: 'Cloud Functions', status: 'active' },
              { label: 'Hosting', value: 'Firebase Hosting', status: 'active' },
              { label: 'Payments', value: 'Stripe (configured)', status: 'pending' },
              { label: 'Email', value: 'Not configured', status: 'inactive' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--soft)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: 'var(--body)', marginBottom: 6 }}>{item.value}</div>
                <span className={`status-chip ${item.status}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="workspace-card">
          <h3>Roadmap — Planned Features</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              'Stripe billing integration & automated invoicing',
              'Employee accounts & role-based permissions',
              'Client messaging & communication threads',
              'Automated maintenance report generation',
              'Domain & SSL expiry auto-alerts',
              'Client onboarding workflow automation',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--muted)', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--line)', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
