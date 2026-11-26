import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Shield } from 'lucide-react';

export default function Pengguna() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Profil &amp; Otorisasi Pengguna</h1>
        <p className="mt-1 text-xs text-slate-500">Kelola pengguna terotorisasi, whitelist akses dan role RBAC</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs max-w-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white text-xl">
            {user?.displayName ? user.displayName.charAt(0) : 'C'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.displayName || 'Carlos Susanto'}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
              <Shield className="h-3 w-3" />
              Peran: {user?.role || 'Owner'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div>Departemen: <span className="font-semibold text-slate-900">{user?.department || 'Direksi & Manajemen'}</span></div>
          <div>ID Karyawan: <span className="font-semibold text-slate-900">{user?.employeeId || 'USR-CARLOS'}</span></div>
          <div>No. Telepon: <span className="font-semibold text-slate-900">{user?.phone || '+62 811-9988-7766'}</span></div>
        </div>
      </div>
    </div>
  );
}
