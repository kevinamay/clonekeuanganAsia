import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AsiaPlastikLogo from './AsiaPlastikLogo';
import { Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginModal() {
  const { signInWithEmail, signInWithGoogle, resetPassword, loading, loginError, loginSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setErrorMsg('Silakan masukkan alamat email.');
      return;
    }
    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi.');
      return;
    }
    const res = await signInWithEmail(email, password, rememberMe);
    if (!res.ok) {
      setErrorMsg(res.error || 'Gagal login.');
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await signInWithGoogle(rememberMe);
    if (!res.ok) {
      setErrorMsg('Gagal masuk dengan Google.');
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setErrorMsg('Silakan masukkan alamat email terlebih dahulu.');
      return;
    }
    const res = await resetPassword(email);
    if (res.ok) {
      setSuccessMsg(`Tautan reset kata sandi telah dikirim ke ${email.trim()}.`);
    } else {
      setErrorMsg(res.error || 'Gagal mengirim email reset password.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#111215] p-4 sm:p-8 overflow-hidden select-none">
      {/* Ambient glowing backdrops */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-4xl rounded-[36px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-800/20">
        {/* Left Column: Form */}
        <div className="md:col-span-6 p-8 sm:p-11 flex flex-col justify-between bg-white text-slate-900">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0C4F7A] text-white shadow-xs p-1">
                <AsiaPlastikLogo className="h-full w-full" color="#FFFFFF" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">Asia Plastik</span>
            </div>

            <div className="mt-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Selamat Datang, Silahkan Login</h1>
              <p className="mt-1.5 text-xs text-slate-400">Silakan masuk ke akun workspace Asia Plastik Anda</p>
            </div>

            {(errorMsg || loginError) && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 animate-fade-in flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg || loginError}</span>
              </div>
            )}

            {(successMsg || loginSuccess) && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700 animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg || loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  required
                  className="w-full rounded-full border border-slate-200 bg-slate-50/60 py-3 pl-4 pr-11 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                />
                <Mail className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full rounded-full border border-slate-200 bg-slate-50/60 py-3 pl-4 pr-11 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-blue-600 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Memverifikasi..." : "Login ke Workspace"}
              </button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                OR
              </span>
            </div>

            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                </svg>
                <span>{loading ? "Menghubungkan..." : "Masuk dengan Google"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Decorative Vector Wave Art */}
        <div className="relative hidden md:block md:col-span-6 bg-[#001D4A] overflow-hidden">
          <svg
            viewBox="0 0 600 800"
            className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B1C3D" />
                <stop offset="25%" stopColor="#0D3B85" />
                <stop offset="50%" stopColor="#1E6DEB" />
                <stop offset="75%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#05122B" />
                <stop offset="40%" stopColor="#124BA3" />
                <stop offset="80%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#BFDBFE" />
              </linearGradient>
              <linearGradient id="silkHighlight" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="600" height="800" fill="#04122C" />
            <path d="M0,0 C180,60 320,190 280,380 C240,560 420,680 600,720 L600,0 Z" fill="url(#waveGrad1)" opacity="0.85" />
            <path d="M600,100 C450,220 340,360 410,540 C470,690 320,780 200,800 L600,800 Z" fill="url(#waveGrad2)" opacity="0.9" />
            <path d="M150,0 C320,140 260,340 340,500 C410,640 480,720 540,800 L380,800 C320,700 240,580 180,440 C120,280 200,120 100,0 Z" fill="url(#waveGrad1)" />
            <path d="M260,0 C400,180 320,380 400,560 C460,680 500,740 580,800 L530,800 C450,720 390,620 330,480 C270,340 340,160 210,0 Z" fill="url(#silkHighlight)" />
            <path d="M220,0 Q340,240 280,440 T460,800" fill="none" stroke="#BAE6FD" strokeWidth="2.5" opacity="0.45" />
            <path d="M280,0 Q420,280 360,520 T560,800" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.6" />
          </svg>

          {/* Bottom Card text */}
          <div className="absolute inset-x-8 bottom-8 z-10">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-[10.5px] leading-relaxed text-white/80 backdrop-blur-md shadow-lg text-center">
              <div className="font-semibold text-white/95">© 2026 Asia Plastic Finance. All rights reserved.</div>
              <div className="mt-1 text-[10px] text-white/70">
                Sistem Keuangan & Akuntansi Real-Time Terproteksi Sistem Keamanan Terenkripsi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
