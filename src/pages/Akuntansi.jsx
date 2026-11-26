import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { BookOpen } from 'lucide-react';

export default function Akuntansi() {
  const { coaAccounts } = useAppContext();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Akuntansi &amp; Chart of Accounts (CoA)</h1>
        <p className="mt-1 text-xs text-slate-500">Bagan akun standar akuntansi Indonesia, jurnal memorial &amp; buku besar</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Kode Akun</th>
                <th className="pb-3">Nama Akun</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3 text-right">Saldo Normal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {coaAccounts.map((acc, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="py-2.5 font-mono font-bold text-blue-600">{acc.code}</td>
                  <td className="py-2.5 font-semibold text-slate-900">{acc.name}</td>
                  <td className="py-2.5 text-slate-500">{acc.category}</td>
                  <td className="py-2.5 text-right font-black">{formatRupiah(acc.balance || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
