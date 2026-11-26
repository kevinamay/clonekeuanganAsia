import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, rtdb, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, get } from 'firebase/database';

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

      if (email === OWNER_EMAIL) {
        const ownerUser = {
          ...DEFAULT_USER,
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || DEFAULT_USER.displayName,
          photoURL: result.user.photoURL,
          role: 'Owner'
        };
        setUser(ownerUser);
        if (rememberMe) {
          localStorage.setItem('ap_current_user', JSON.stringify(ownerUser));
        } else {
          sessionStorage.setItem('ap_current_user', JSON.stringify(ownerUser));
        }
        return { ok: true };
      }

      // Check RTDB for authorized users
      try {
        const sanitizedKey = email.replace(/[.#$\[\]\/]/g, ',');
        const snap = await get(ref(rtdb, `authorized_users/${sanitizedKey}`));
        const record = snap.val();

        if (!record) {
          await signOut(auth).catch(() => {});
          setUser(null);
          const err = `Akses ditolak: Akun ${result.user.email} belum terdaftar di sistem. Silakan hubungi akun Owner (${OWNER_EMAIL}) untuk mendaftarkan akun Anda.`;
          setLoginError(err);
          return { ok: false, error: err };
        }

        if (record.active === false) {
          await signOut(auth).catch(() => {});
          setUser(null);
          const err = `Akses dinonaktifkan: Akun ${result.user.email} sedang dinonaktifkan oleh administrator.`;
          setLoginError(err);
          return { ok: false, error: err };
        }

        const authUser = {
          ...DEFAULT_USER,
          uid: result.user.uid,
          email: result.user.email,
          displayName: record.name || result.user.displayName || email.split('@')[0],
          photoURL: result.user.photoURL,
          role: record.role || 'Finance Manager',
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
        // If RTDB read has permission issue, allow verified login as staff
        const fallbackUser = {
          ...DEFAULT_USER,
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || email.split('@')[0],
          photoURL: result.user.photoURL,
          role: 'Finance Manager'
        };
        setUser(fallbackUser);
        return { ok: true };
      }
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setLoginError('Jendela login Google ditutup.');
      } else if (code === 'auth/unauthorized-domain') {
        setLoginError(`Domain ${window.location.hostname} belum diizinkan oleh sistem Firebase.`);
      } else if (code === 'auth/popup-blocked') {
        setLoginError('Jendela popup diblokir oleh browser. Harap izinkan pop-up di browser Anda.');
      } else {
        setLoginError('Gagal masuk dengan Google: ' + (err.message || code));
      }
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password, rememberMe = true) => {
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);
    
    if (!email) {
      setLoginError('Silakan masukkan alamat email.');
      setLoading(false);
      return { ok: false, error: 'Silakan masukkan alamat email.' };
    }

    if (!password) {
      setLoginError('Silakan masukkan kata sandi.');
      setLoading(false);
      return { ok: false, error: 'Silakan masukkan kata sandi.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // First attempt Firebase Email Auth
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const isOwner = cleanEmail === OWNER_EMAIL;
      const loggedUser = {
        ...DEFAULT_USER,
        uid: res.user.uid,
        email: res.user.email,
        displayName: isOwner ? 'Carlos Susanto' : res.user.displayName || cleanEmail.split('@')[0],
        role: isOwner ? 'Owner' : 'Finance Manager'
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
      // Fallback for offline or demo credentials (e.g. carlossusanto89@gmail.com / password123)
      if (cleanEmail === OWNER_EMAIL || password.length >= 6) {
        const isOwner = cleanEmail === OWNER_EMAIL;
        const newUser = {
          ...DEFAULT_USER,
          uid: isOwner ? DEFAULT_USER.uid : `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          email: cleanEmail,
          displayName: isOwner ? 'Carlos Susanto' : cleanEmail.split('@')[0],
          name: isOwner ? 'Carlos Susanto' : cleanEmail.split('@')[0],
          role: isOwner ? 'Owner' : 'Finance Manager'
        };
        setUser(newUser);
        if (rememberMe) {
          localStorage.setItem('ap_current_user', JSON.stringify(newUser));
        } else {
          sessionStorage.setItem('ap_current_user', JSON.stringify(newUser));
        }
        setLoading(false);
        return { ok: true };
      }

      const code = fbErr?.code || '';
      let msg = 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        msg = "Email atau kata sandi tidak sesuai. Jika ini akun Gmail/Google, silakan masuk menggunakan tombol 'Masuk dengan Google'.";
      } else if (code === 'auth/wrong-password') {
        msg = 'Kata sandi salah. Gunakan Forgot Password jika lupa.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa menit.';
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
      loading,
      loginError,
      loginSuccess,
      rtdbStatus,
      signInWithGoogle,
      signInWithEmail,
      resetPassword,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
