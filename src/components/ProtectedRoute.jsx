import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { loading, user, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="screen-loader">Loading secure workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile) {
    return (
      <div className="screen-loader">
        This account is signed in but does not have a Frontier role profile yet.
      </div>
    );
  }

  if (role && profile?.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/portal'} replace />;
  }

  return children;
}
