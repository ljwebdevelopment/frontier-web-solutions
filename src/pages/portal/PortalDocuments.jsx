import { useEffect, useState } from 'react';
import { ExternalLink, File, FileText, FolderOpen, Image, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listenToDocuments } from '../../services/firestoreService';

const TYPE_ICON = {
  drive: FolderOpen,
  invoice: FileText,
  brand: Image,
  onboarding: File,
  other: LinkIcon,
};

const TYPE_LABEL = {
  drive: 'Google Drive',
  invoice: 'Invoice',
  brand: 'Brand Assets',
  onboarding: 'Onboarding',
  other: 'Resource',
};

const TYPE_COLOR = {
  drive: '#1e40af',
  invoice: '#166534',
  brand: '#92400e',
  onboarding: 'var(--red)',
  other: 'var(--muted)',
};

const TYPE_BG = {
  drive: '#dbeafe',
  invoice: '#dcfce7',
  brand: '#fef3c7',
  onboarding: 'rgba(139,0,0,0.08)',
  other: 'var(--soft)',
};

export default function PortalDocuments() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.clientId) return undefined;
    setLoading(false);
    return listenToDocuments(profile.clientId, setDocuments);
  }, [profile?.clientId]);

  const grouped = documents.reduce((acc, doc) => {
    const type = doc.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <section className="workspace-section">
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Resources</p>
          <h2>Documents &amp; Files</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Important links and files for your website project, managed by Frontier Web Systems.
          </p>
        </div>
      </div>

      {loading && (
        <div className="screen-loader" style={{ minHeight: 'auto', padding: '40px 0' }}>Loading…</div>
      )}

      {!loading && documents.length === 0 && (
        <div className="workspace-card">
          <div className="empty-state">
            <FolderOpen size={36} />
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No documents yet</p>
            <p>Your account manager will add important links here — like your Google Drive folder, brand assets, invoices, and onboarding resources.</p>
          </div>
        </div>
      )}

      {!loading && documents.length > 0 && (
        <div style={{ display: 'grid', gap: 20 }}>
          {['drive', 'onboarding', 'brand', 'invoice', 'other'].map((type) => {
            const docs = grouped[type];
            if (!docs?.length) return null;
            const Icon = TYPE_ICON[type] || LinkIcon;
            return (
              <div key={type} className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--soft)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: TYPE_BG[type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color: TYPE_COLOR[type] }} />
                  </div>
                  <h3 style={{ margin: 0 }}>{TYPE_LABEL[type]}</h3>
                  <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>{docs.length} item{docs.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'grid', gap: 1, background: 'var(--line)' }}>
                  {docs.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'var(--panel)', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{doc.title}</p>
                        {doc.description && (
                          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{doc.description}</p>
                        )}
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button ghost sm"
                        style={{ flexShrink: 0 }}
                      >
                        Open <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
