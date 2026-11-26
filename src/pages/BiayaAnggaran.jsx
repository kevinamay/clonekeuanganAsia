import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { PieChart, Plus } from 'lucide-react';

export default function BiayaAnggaran() {
  const { expenses, budgetRows, notify } = useAppContext();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Budgeting &amp; Biaya</h1>
          <p className="mt-1 text-xs text-slate-500">Anggaran operasional departemen &amp; pencatatan beban usaha</p>
        </div>
        <button
          type="button"
          onClick={() => notify('Formulir pencatatan beban operasional dibuka')}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Catat Beban Baru</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">Beban Operasional Terkini</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {expenses.map((e) => (
            <div key={e.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{e.payee}</div>
                <div className="text-slate-400">{e.category} • {formatDate(e.date)}</div>
              </div>
              <div className="text-right font-black text-rose-600">{formatRupiah(e.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
