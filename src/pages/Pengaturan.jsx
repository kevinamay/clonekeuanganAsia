import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, Shield, Sliders } from 'lucide-react';

export default function Pengaturan() {
  const { notify } = useAppContext();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Settings &amp; Akses Sistem</h1>
        <p className="mt-1 text-xs text-slate-500">Konfigurasi workspace Asia Plastik, sandbox bank fiktif &amp; preferensi visual</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-900">Mode Sandbox Bank Fiktif</div>
            <div className="text-[11px] text-slate-400">Gunakan rekening simulasi transaksi tanpa mutasi riil</div>
          </div>
          <button
            type="button"
            onClick={() => notify('Pengaturan mode bank tersimpan')}
            className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            Aktif
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs font-bold text-slate-900">Visibilitas Tab Dashboard di Sidebar</div>
            <div className="text-[11px] text-slate-400">Tampilkan dashboard overview dan subtab analitik</div>
          </div>
          <button
            type="button"
            onClick={() => notify('Preferensi sidebar diperbarui')}
            className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            Tampilkan
          </button>
        </div>
      </div>
    </div>
  );
}
