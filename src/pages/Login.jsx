import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isFirebaseConfigured } from '../firebase/config.js';

export default function Login() {
  const { login, profile, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  if (user && profile?.role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/portal'} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      const target = location.state?.from || (result.user ? '/portal' : '/login');
      navigate(target);
    } catch (err) {
      setError('Unable to sign in. Check the email and password.');
    }
  }

  return (
    <section className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Secure access</p>
        <h1>Sign in to Frontier</h1>
        {!isFirebaseConfigured && (
          <p className="form-error">Firebase is not configured yet. Copy `.env.example` to `.env` and add your Firebase web app values.</p>
        )}
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button className="button primary" type="submit" disabled={!isFirebaseConfigured}>Sign in</button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </section>
  );
}
