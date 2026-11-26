import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Building2, Plus, Phone, Mail } from 'lucide-react';

export default function Vendor() {
  const { vendors, notify } = useAppContext();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Vendor &amp; Pemasok</h1>
          <p className="mt-1 text-xs text-slate-500">Direktori rekanan bahan baku, masterbatch &amp; mesin pabrik</p>
        </div>
        <button
          type="button"
          onClick={() => notify('Formulir tambah vendor dibuka')}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vendors.map((v) => (
          <div key={v.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600">{v.code}</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                {v.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">{v.name}</h3>
            <p className="text-xs text-slate-400">{v.category}</p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div>NPWP: <span className="font-mono font-semibold">{v.npwp}</span></div>
              <div>Rekening: <span className="font-semibold">{v.bankName} - {v.bankAccount} ({v.bankHolder})</span></div>
              <div>Syarat Bayar: <span className="font-semibold">{v.paymentTerm}</span></div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
              "{v.notes}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
