import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { loading, user, profile, profileError } = useAuth();
  const location = useLocation();

  // Still determining auth state or loading profile from Firestore
  if (loading || user === undefined) {
    return <div className="screen-loader">Loading your workspace…</div>;
  }

  // Not signed in at all
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Signed in but profile not loaded yet (brief Firestore fetch window)
  if (!profile && !profileError) {
    return <div className="screen-loader">Loading your workspace…</div>;
  }

  // Signed in but no matching Firestore profile
  if (!profile && profileError === 'no-profile') {
    return (
      <div className="screen-loader" style={{ flexDirection: 'column', gap: 12 }}>
        <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Account not fully set up.</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, textAlign: 'center' }}>
          You're signed in but your account profile wasn't found. Contact Frontier Web Systems to fix this.
        </p>
        <button
          className="button ghost sm"
          onClick={async () => {
            const { getAuth, signOut } = await import('firebase/auth');
            await signOut(getAuth());
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  // Firestore permission error
  if (!profile && profileError === 'permission-error') {
    return (
      <div className="screen-loader" style={{ flexDirection: 'column', gap: 12 }}>
        <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Could not load your profile.</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, textAlign: 'center' }}>
          There was a permission error loading your account. Try signing out and back in.
        </p>
        <button
          className="button ghost sm"
          onClick={async () => {
            const { getAuth, signOut } = await import('firebase/auth');
            await signOut(getAuth());
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  // Wrong role — redirect to their correct area
  if (role && profile?.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/portal'} replace />;
  }

  return children;
}
