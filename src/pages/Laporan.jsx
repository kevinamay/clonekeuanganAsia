import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { BarChart3, Download } from 'lucide-react';

export default function Laporan() {
  const { notify } = useAppContext();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Laporan Keuangan</h1>
          <p className="mt-1 text-xs text-slate-500">Neraca, Laba Rugi, Laporan Arus Kas &amp; Catatan Atas Laporan Keuangan</p>
        </div>
        <button
          type="button"
          onClick={() => notify('Ekspor seluruh paket laporan keuangan sedang diproses')}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Unduh Paket Laporan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm">Laporan Laba Rugi</h3>
          <p className="text-xs text-slate-400 mt-1">Pendapatan, HPP &amp; Laba Bersih</p>
          <div className="mt-4 text-2xl font-black text-emerald-600">+ Rp 42.500.000</div>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm">Neraca Keuangan</h3>
          <p className="text-xs text-slate-400 mt-1">Total Aset vs Liabilitas + Ekuitas</p>
          <div className="mt-4 text-2xl font-black text-blue-700">Rp 650.000.000</div>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm">Arus Kas (Cash Flow)</h3>
          <p className="text-xs text-slate-400 mt-1">Aktivitas Operasi, Investasi &amp; Pendanaan</p>
          <div className="mt-4 text-2xl font-black text-slate-900">Rp 325.000.000</div>
        </div>
      </div>
    </div>
  );
}
