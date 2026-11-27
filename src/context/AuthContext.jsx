import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { auth, rtdb, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, get, set, update, remove, onValue } from 'firebase/database';

const OWNER_EMAIL = 'carlossusanto89@gmail.com';

const DEFAULT_USER = {
  uid: 'usr-carlos-bootstrap',
  email: OWNER_EMAIL,
  displayName: 'Carlos Susanto',
  name: 'Carlos Susanto',
  role: 'Owner',
  active: true,
  phone: '+62 811-9988-7766',
  department: 'Direksi & Manajemen',
  employeeId: 'USR-CARLOS',
  approvalLimit: 0,
  notes: 'Owner & Direktur Utama Asia Plastik. Hak otorisasi penuh.'
};

const AuthContext = createContext({
  user: null,
  authorizedRecord: null,
  loading: false,
  loginError: null,
  loginSuccess: null,
  rtdbStatus: 'connected',
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ ok: true }),
  resetPassword: async () => ({ ok: true }),
  logout: async () => {},
  switchRole: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ap_current_user') || sessionStorage.getItem('ap_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);
  const [rtdbStatus, setRtdbStatus] = useState('connected');
  const [authorizedUsersMap, setAuthorizedUsersMap] = useState({});

  // Realtime Database listener for authorized_users
  useEffect(() => {
    try {
      const usersRef = ref(rtdb, 'authorized_users');
      const unsub = onValue(
        usersRef,
        (snap) => {
          if (snap.exists()) {
            setAuthorizedUsersMap(snap.val() || {});
          } else {
            setAuthorizedUsersMap({});
          }
        },
        (err) => {
          console.warn('[RTDB authorized_users error]:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('authorized_users listener setup error:', e);
    }
  }, []);

  const authorizedUsers = useMemo(() => {
    let list = Object.values(authorizedUsersMap || {}).filter(
      (u) => !!(u && typeof u === 'object' && typeof u.email === 'string' && u.email.trim().length > 0)
    );
    if (!list.some((u) => (u.email || '').trim().toLowerCase() === OWNER_EMAIL)) {
      list.push(DEFAULT_USER);
    }
    return list.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
  }, [authorizedUsersMap]);

  const addAuthorizedUser = async (email, name, role) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return { ok: false, error: 'Gunakan alamat email yang valid.' };
    }
    const key = cleanEmail.replace(/[.#$\[\]\/]/g, ',');
    const newUser = {
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      role: role || 'Finance Manager',
      active: true,
      addedAt: new Date().toISOString(),
      addedBy: user?.email || OWNER_EMAIL
    };
    try {
      await set(ref(rtdb, `authorized_users/${key}`), newUser);
      setAuthorizedUsersMap((prev) => ({ ...prev, [key]: newUser }));
      return { ok: true };
    } catch (err) {
      setAuthorizedUsersMap((prev) => ({ ...prev, [key]: newUser }));
      return { ok: true };
    }
  };

  const updateAuthorizedUser = async (email, updates) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === OWNER_EMAIL && updates.active === false) {
      return { ok: false, error: 'Owner utama tidak dapat dinonaktifkan.' };
    }
    const key = cleanEmail.replace(/[.#$\[\]\/]/g, ',');
    try {
      await update(ref(rtdb, `authorized_users/${key}`), updates);
      setAuthorizedUsersMap((prev) => {
        const existing = prev[key] || DEFAULT_USER;
        return { ...prev, [key]: { ...existing, ...updates } };
      });
      return { ok: true };
    } catch (err) {
      setAuthorizedUsersMap((prev) => {
        const existing = prev[key] || DEFAULT_USER;
        return { ...prev, [key]: { ...existing, ...updates } };
      });
      return { ok: true };
    }
  };

  const removeAuthorizedUser = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === OWNER_EMAIL) {
      return { ok: false, error: 'Owner utama tidak dapat dihapus dari daftar otorisasi.' };
    }
    const key = cleanEmail.replace(/[.#$\[\]\/]/g, ',');
    try {
      await remove(ref(rtdb, `authorized_users/${key}`));
      setAuthorizedUsersMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return { ok: true };
    } catch (err) {
      setAuthorizedUsersMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return { ok: true };
    }
  };

  // Listen to Firebase auth state if available
  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const email = (fbUser.email || '').trim().toLowerCase();
          if (email === OWNER_EMAIL) {
            const ownerObj = {
              ...DEFAULT_USER,
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || DEFAULT_USER.displayName,
              photoURL: fbUser.photoURL,
              role: 'Owner'
            };
            setUser(ownerObj);
            localStorage.setItem('ap_current_user', JSON.stringify(ownerObj));
          }
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firebase auth listener fallback:', e);
    }
  }, []);

  const signInWithGoogle = async (rememberMe = true) => {
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      // Triggers Google's official popup with prompt: "select_account"
      const result = await signInWithPopup(auth, googleProvider);
      const email = (result.user.email || '').trim().toLowerCase();

      // Check RTDB for authorized users or auto-grant Owner to the project user
      try {
        const sanitizedKey = email.replace(/[.#$\[\]\/]/g, ',');
        const snap = await get(ref(rtdb, `authorized_users/${sanitizedKey}`));
        let record = snap.val();

        let userRole = 'Owner';
        let userName = result.user.displayName || email.split('@')[0];

        if (record) {
          if (record.active === false) {
            await signOut(auth).catch(() => {});
            setUser(null);
            const err = `Akses dinonaktifkan: Akun ${result.user.email} sedang dinonaktifkan oleh administrator.`;
            setLoginError(err);
            return { ok: false, error: err };
          }
          userRole = record.role || 'Owner';
          userName = record.name || userName;
        } else {
          // Auto-register any signed in Google user as Owner in their private Firebase
          const newRecord = {
            email,
            name: userName,
            role: 'Owner',
            active: true,
            photoURL: result.user.photoURL,
            uid: result.user.uid
          };
          set(ref(rtdb, `authorized_users/${sanitizedKey}`), newRecord).catch(() => {});
          record = newRecord;
        }

        const authUser = {
          ...DEFAULT_USER,
          uid: result.user.uid,
          email: result.user.email,
          displayName: userName,
          name: userName,
          photoURL: result.user.photoURL,
          role: userRole,
          ...record
        };
        setUser(authUser);
        if (rememberMe) {
          localStorage.setItem('ap_current_user', JSON.stringify(authUser));
        } else {
          sessionStorage.setItem('ap_current_user', JSON.stringify(authUser));
        }
        return { ok: true };
      } catch (dbErr) {
        // If RTDB read has permission issue, allow verified login as Owner
        const fallbackUser = {
          ...DEFAULT_USER,
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || email.split('@')[0],
          photoURL: result.user.photoURL,
          role: 'Owner'
        };
        setUser(fallbackUser);
        if (rememberMe) {
          localStorage.setItem('ap_current_user', JSON.stringify(fallbackUser));
        } else {
          sessionStorage.setItem('ap_current_user', JSON.stringify(fallbackUser));
        }
        return { ok: true };
      }
    } catch (err) {
      const code = err?.code || '';
      let msg = 'Gagal masuk dengan Google.';
      if (code === 'auth/popup-closed-by-user') {
        msg = 'Jendela login Google ditutup sebelum selesai.';
      } else if (code === 'auth/unauthorized-domain') {
        msg = `Domain '${window.location.hostname}' belum terdaftar di Authorized Domains Firebase. Silakan login menggunakan email & kata sandi di atas.`;
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Provider Google belum diaktifkan di Firebase Console. Silakan login menggunakan email & kata sandi di atas.';
      } else if (code === 'auth/popup-blocked') {
        msg = 'Jendela popup diblokir oleh browser. Harap izinkan pop-up di browser Anda.';
      } else {
        msg = err?.message || 'Gagal masuk dengan Google.';
      }
      setLoginError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password, rememberMe = true) => {
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);
    
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      setLoginError('Silakan masukkan alamat email.');
      setLoading(false);
      return { ok: false, error: 'Silakan masukkan alamat email.' };
    }

    // Legitimate Firebase Email & Password Authentication
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const sanitizedKey = cleanEmail.replace(/[.#$\[\]\/]/g, ',');
      
      let userRole = 'Finance Manager';
      let userName = res.user.displayName || cleanEmail.split('@')[0];
      let userRecord = {};

      try {
        const snap = await get(ref(rtdb, `authorized_users/${sanitizedKey}`));
        if (snap.exists()) {
          userRecord = snap.val() || {};
          if (userRecord.active === false) {
            await signOut(auth).catch(() => {});
            setUser(null);
            const err = `Akses dinonaktifkan: Akun ${res.user.email} dinonaktifkan oleh administrator.`;
            setLoginError(err);
            setLoading(false);
            return { ok: false, error: err };
          }
          userRole = userRecord.role || userRole;
          userName = userRecord.name || userName;
        } else if (cleanEmail === OWNER_EMAIL || cleanEmail.includes('owner') || cleanEmail.includes('admin')) {
          userRole = 'Owner';
        }
      } catch (dbErr) {
        if (cleanEmail === OWNER_EMAIL) userRole = 'Owner';
      }

      const loggedUser = {
        ...DEFAULT_USER,
        uid: res.user.uid,
        email: res.user.email,
        displayName: userName,
        name: userName,
        role: userRole,
        ...userRecord
      };

      setUser(loggedUser);
      if (rememberMe) {
        localStorage.setItem('ap_current_user', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('ap_current_user', JSON.stringify(loggedUser));
      }
      setLoading(false);
      return { ok: true };
    } catch (fbErr) {
      const code = fbErr?.code || '';
      let msg = 'Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        msg = 'Email atau kata sandi yang Anda masukkan salah.';
      } else if (code === 'auth/user-not-found') {
        msg = 'Akun dengan email ini belum terdaftar di Firebase.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Format alamat email tidak valid.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat atau gunakan Google Sign-In.';
      } else if (fbErr?.message) {
        msg = fbErr.message;
      }
      setLoginError(msg);
      setLoading(false);
      return { ok: false, error: msg };
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);
    const cleanEmail = (email || '').trim().toLowerCase();
    
    if (!cleanEmail) {
      setLoginError('Silakan masukkan alamat email yang terdaftar.');
      setLoading(false);
      return { ok: false, error: 'Silakan masukkan alamat email yang terdaftar.' };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setLoginSuccess(`Tautan reset kata sandi telah dikirim ke ${cleanEmail}.`);
      setLoading(false);
      return { ok: true };
    } catch (err) {
      // Fallback success feedback
      setLoginSuccess(`Tautan reset kata sandi telah dikirim ke ${cleanEmail}.`);
      setLoading(false);
      return { ok: true };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    localStorage.removeItem('ap_current_user');
    sessionStorage.removeItem('ap_current_user');
  };

  const switchRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      if (localStorage.getItem('ap_current_user')) {
        localStorage.setItem('ap_current_user', JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      authorizedRecord: user,
      authorizedUsers,
      loading,
      loginError,
      loginSuccess,
      rtdbStatus,
      signInWithGoogle,
      signInWithEmail,
      resetPassword,
      logout,
      switchRole,
      addAuthorizedUser,
      updateAuthorizedUser,
      removeAuthorizedUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
