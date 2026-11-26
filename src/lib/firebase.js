import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAvyqROT1wX3_Y4P8F4GujkrNcVi5ERxVM",
  authDomain: "asia-plastic-finance.firebaseapp.com",
  databaseURL: "https://asia-plastic-finance-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "asia-plastic-finance",
  storageBucket: "asia-plastic-finance.firebasestorage.app",
  messagingSenderId: "485551473128",
  appId: "1:485551473128:web:65b0a5c247ab553214645d",
  measurementId: "G-5RJYFPQ351"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
// Forces Google account chooser to appear every time:
googleProvider.setCustomParameters({ prompt: "select_account" });
