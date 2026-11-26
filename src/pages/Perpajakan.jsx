import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function Perpajakan() {
  const { taxRecords } = useAppContext();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Pajak &amp; Coretax DJP</h1>
        <p className="mt-1 text-xs text-slate-500">PPN 11%, PPh 21/23 &amp; integrasi pelaporan Coretax terpadu</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">No. Faktur Pajak</th>
                <th className="pb-3">Tipe Pajak</th>
                <th className="pb-3">Lawan Transaksi</th>
                <th className="pb-3 text-right">DPP</th>
                <th className="pb-3 text-right">Pajak (PPN 11%)</th>
                <th className="pb-3 text-center">Status Coretax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {taxRecords.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-blue-600">{t.docNumber}</td>
                  <td className="py-3">{t.type}</td>
                  <td className="py-3 font-semibold text-slate-900">{t.partner}</td>
                  <td className="py-3 text-right font-medium">{formatRupiah(t.dpp)}</td>
                  <td className="py-3 text-right font-black text-slate-900">{formatRupiah(t.taxAmount)}</td>
                  <td className="py-3 text-center">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      {t.coretaxStatus}
                    </span>
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
