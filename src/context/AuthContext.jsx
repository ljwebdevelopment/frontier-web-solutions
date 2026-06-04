import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);   // undefined = not yet determined
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // Always reset to loading when auth state changes
      setLoading(true);
      setProfile(null);
      setProfileError(null);
      setUser(currentUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Subscribe to the Firestore user profile doc
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', currentUser.uid),
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ id: snapshot.id, ...snapshot.data() });
            setProfileError(null);
          } else {
            // Auth user exists but no Firestore profile — account not fully set up
            setProfile(null);
            setProfileError('no-profile');
          }
          setLoading(false);
        },
        (err) => {
          console.error('Profile snapshot error:', err);
          setProfile(null);
          setProfileError('permission-error');
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      profileError,
      loading,
      isAdmin: profile?.role === 'admin',
      isClient: profile?.role === 'client',
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      logout: () => signOut(auth),
    }),
    [user, profile, profileError, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
