import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { auth, db } from '../firebase/config';
import { todayKey } from '../utils/format';
import { requestPasswordReset } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return undefined;
    const loginDate = localStorage.getItem('svtel-login-date');
    if (loginDate && loginDate !== todayKey()) {
      signOut(auth);
      toast('Session expired because calendar date changed.');
      return undefined;
    }

    const unsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
      if (!snapshot.exists()) {
        setProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          role: firebaseUser.email === 'rohitkumar5480@gmail.com' ? 'admin' : 'staff',
          permissions: {},
          status: 'active',
        });
      } else {
        setProfile({ uid: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('svtel-login-date', todayKey());
    return result;
  }

  async function logout() {
    localStorage.removeItem('svtel-login-date');
    await signOut(auth);
  }

  async function forgotPassword(email) {
    await requestPasswordReset(email);
    toast.success('Reset request sent to admin.');
  }

  const isAdmin = profile?.role === 'admin';
  const can = (permission) => isAdmin || profile?.permissions?.[permission] === true;
  const suspended = profile?.status === 'suspended';

  const value = useMemo(
    () => ({ firebaseUser, user: profile, loading, login, logout, forgotPassword, isAdmin, can, suspended }),
    [firebaseUser, profile, loading, isAdmin, suspended],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
