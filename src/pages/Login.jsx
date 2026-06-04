import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isFirebaseConfigured } from '../firebase/config.js';

const AUTH_ERRORS = {
  'auth/user-not-found':     'No account found with that email.',
  'auth/wrong-password':     'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email':      'Please enter a valid email address.',
  'auth/user-disabled':      'This account has been disabled.',
  'auth/too-many-requests':  'Too many failed attempts. Please wait a few minutes and try again.',
};

export default function Login() {
  const { login, loading, user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  // Already signed in with a loaded profile — redirect to their area
  if (!loading && user && profile?.role) {
    const intended = location.state?.from;
    // Only honour the intended path if it matches their role
    const adminPath = intended?.startsWith('/admin') ? intended : '/admin';
    const clientPath = intended?.startsWith('/portal') ? intended : '/portal';
    return <Navigate to={profile.role === 'admin' ? adminPath : clientPath} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // Do NOT navigate manually here.
      // AuthContext sets loading → true, fetches the Firestore profile,
      // then sets loading → false + profile. The Navigate above then fires.
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Unable to sign in. Check the email and password.');
      setSubmitting(false);
    }
  }

  return (
    <section className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Secure access</p>
        <h1>Sign in to Frontier</h1>

        {!isFirebaseConfigured && (
          <p className="form-error">
            Firebase is not configured. Add your Firebase credentials to the <code>.env</code> file.
          </p>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button
          className="button primary"
          type="submit"
          disabled={!isFirebaseConfigured || submitting || loading}
        >
          {submitting || (loading && user) ? 'Signing in…' : 'Sign in'}
        </button>

        {error && <p className="form-error">{error}</p>}
      </form>
    </section>
  );
}
