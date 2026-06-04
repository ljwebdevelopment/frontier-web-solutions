import { useEffect, useState } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { collections, listenToCollection, submitSupportRequest } from '../../services/firestoreService';

const STATUS_CHIP = {
  open: 'pending',
  'in-progress': 'building',
  waiting: 'warning',
  closed: 'active',
};

const STATUS_LABEL = {
  open: 'Open',
  'in-progress': 'In Progress',
  waiting: 'Waiting on Us',
  closed: 'Resolved',
};

export default function PortalSupport() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ subject: '', priority: 'Normal', message: '' });
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!profile?.clientId) return undefined;
    return listenToCollection(collections.supportRequests, setRequests, [
      where('clientId', '==', profile.clientId),
      orderBy('createdAt', 'desc'),
    ]);
  }, [profile?.clientId]);

  function change(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setStatus('Please fill in the subject and details.');
      return;
    }
    setStatus('Sending…');
    try {
      await submitSupportRequest({
        ...form,
        clientId: profile.clientId,
        businessName: profile.businessName,
        requesterEmail: profile.email,
      });
      setForm({ subject: '', priority: 'Normal', message: '' });
      setStatus('Request submitted. We\'ll be in touch shortly.');
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  const openCount = requests.filter((r) => r.status !== 'closed').length;

  return (
    <section className="workspace-section">
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Support</p>
          <h2>Website Requests</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {openCount} open · {requests.filter((r) => r.status === 'closed').length} resolved
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 16, alignItems: 'start' }}>
        {/* Submit form */}
        <div className="workspace-card" style={{ borderTop: '3px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <MessageSquare size={16} style={{ color: 'var(--red)' }} />
            <h3 style={{ margin: 0 }}>New Request</h3>
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <label>
              Subject
              <input
                name="subject"
                value={form.subject}
                onChange={change}
                placeholder="e.g. Update contact info, Add new page…"
                required
              />
            </label>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={change}>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </label>
            <label>
              Request Details
              <textarea
                name="message"
                value={form.message}
                onChange={change}
                placeholder="Describe what you need — be as specific as possible so we can get it done quickly."
                style={{ minHeight: 120 }}
                required
              />
            </label>
            <button className="button primary" type="submit">Submit Request</button>
            {status && (
              <p className={`form-${status.startsWith('Error') || status.startsWith('Please') ? 'error' : 'status'}`}>
                {status}
              </p>
            )}
          </form>
        </div>

        {/* Request history */}
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ margin: 0 }}>Request History</h3>
          </div>
          {requests.length === 0 ? (
            <div className="empty-state">
              <Clock size={28} />
              <p style={{ fontWeight: 700, marginBottom: 4 }}>No requests yet</p>
              <p>Submit a request and it will appear here with its current status.</p>
            </div>
          ) : (
            <div style={{ display: 'grid' }}>
              {requests.map((r) => (
                <div
                  key={r.id}
                  style={{ borderBottom: '1px solid var(--line)', cursor: expanded === r.id ? 'default' : 'pointer' }}
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
                    {r.status === 'closed'
                      ? <CheckCircle size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      : <Clock size={16} style={{ color: r.status === 'in-progress' ? '#1e40af' : r.status === 'waiting' ? '#92400e' : '#854d0e', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subject}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {r.priority && <>{r.priority} priority · </>}
                        {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className={`status-chip ${STATUS_CHIP[r.status] || 'pending'}`} style={{ flexShrink: 0 }}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </div>
                  {expanded === r.id && r.message && (
                    <div style={{ padding: '0 20px 16px 48px', fontSize: 13, color: 'var(--body)', lineHeight: 1.7, background: 'var(--soft)' }}>
                      {r.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
