import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { ShoppingBag, Plus } from 'lucide-react';

export default function Pembelian() {
  const { purchaseDocs, notify } = useAppContext();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Pembelian &amp; Tagihan Vendor</h1>
          <p className="mt-1 text-xs text-slate-500">Purchase Orders, utang usaha, dan penerimaan bahan baku</p>
        </div>
        <button
          type="button"
          onClick={() => notify('Formulir PO baru dibuka')}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Buat Purchase Order</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">No. PO</th>
                <th className="pb-3">Vendor / Pemasok</th>
                <th className="pb-3">Tanggal / Tempo</th>
                <th className="pb-3 text-right">Subtotal</th>
                <th className="pb-3 text-right">Total Tagihan</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {purchaseDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-blue-600">{doc.number}</td>
                  <td className="py-3 font-bold text-slate-900">{doc.vendor}</td>
                  <td className="py-3 text-slate-500">
                    <div>{formatDate(doc.date)}</div>
                    <div className="text-[10px] text-slate-400">Tempo: {formatDate(doc.dueDate)}</div>
                  </td>
                  <td className="py-3 text-right font-medium">{formatRupiah(doc.subtotal)}</td>
                  <td className="py-3 text-right font-black text-slate-900">{formatRupiah(doc.total)}</td>
                  <td className="py-3 text-center">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                      {doc.status}
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
