import { useState } from 'react';
import { submitNewsletterSignup } from '../services/firestoreService';

export default function NewsletterForm({ compact = false, clientId = null }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      await submitNewsletterSignup({ email, clientId, source: clientId ? 'client-portal' : 'public-site' });
      setEmail('');
      setStatus('You\'re on the list.');
    } catch (err) {
      setStatus(err.message || 'Something went wrong.');
    }
  }

  return (
    <form className="newsletter" onSubmit={handleSubmit}>
      {!compact && <h3>Stay in the loop</h3>}
      <div className="newsletter-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          aria-label="Email address"
        />
        <button className="button primary" type="submit" style={{ whiteSpace: 'nowrap', minHeight: '42px', padding: '10px 18px' }}>
          Subscribe
        </button>
      </div>
      {status && <small style={{ color: status.includes('wrong') ? 'var(--danger)' : '#94a3b8' }}>{status}</small>}
    </form>
  );
}
