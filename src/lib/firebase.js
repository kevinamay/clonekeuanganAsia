import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Konfigurasi Firebase milik project sendiri (financeasia-47f36)
const firebaseConfig = {
  apiKey: "AIzaSyBhhj6JDkJ8Eqjrdac8VH47gcgpoxwZuCU",
  authDomain: "financeasia-47f36.firebaseapp.com",
  projectId: "financeasia-47f36",
  storageBucket: "financeasia-47f36.firebasestorage.app",
  messagingSenderId: "400730736049",
  appId: "1:400730736049:web:230265b434593d5a5da990",
  databaseURL: "https://financeasia-47f36-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let rtdbInstance = null;
try {
  rtdbInstance = getDatabase(app);
} catch (e) {
  console.warn("[Firebase] Realtime Database instance check:", e?.message || e);
}
export const rtdb = rtdbInstance;

export const googleProvider = new GoogleAuthProvider();
// Forces Google account chooser to appear every time:
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
