import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { Scale, Check, AlertCircle } from 'lucide-react';

export default function Rekonsiliasi() {
  const { bankMutations, setBankMutations, notify } = useAppContext();

  const handleMatch = (id) => {
    setBankMutations(prev => prev.map(m => m.id === id ? { ...m, status: 'Terekonsiliasi' } : m));
    notify('Mutasi berhasil dicocokkan dengan buku besar.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Rekonsiliasi Bank</h1>
        <p className="mt-1 text-xs text-slate-500">Pencocokan mutasi bank &amp; catatan pembukuan otomatis</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Mutasi Rekening</th>
                <th className="pb-3 text-right">Nominal</th>
                <th className="pb-3">Saran Pencocokan</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bankMutations.map((mut) => (
                <tr key={mut.id} className="hover:bg-slate-50/60">
                  <td className="py-3 text-slate-500">{formatDate(mut.date)}</td>
                  <td className="py-3 font-semibold text-slate-900">{mut.description}</td>
                  <td className="py-3 text-right font-black">{formatRupiah(mut.amount)}</td>
                  <td className="py-3 text-blue-600 font-medium">{mut.suggestion || '-'}</td>
                  <td className="py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      mut.status === 'Terekonsiliasi' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {mut.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {mut.status !== 'Terekonsiliasi' && (
                      <button
                        type="button"
                        onClick={() => handleMatch(mut.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700"
                      >
                        Cocokkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
