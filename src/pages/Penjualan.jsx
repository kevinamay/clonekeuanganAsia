import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { Receipt, Plus, Download, Filter, Search, CheckCircle2, Clock } from 'lucide-react';

export default function Penjualan() {
  const { salesDocs, setSalesDocs, notify } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInv, setNewInv] = useState({
    number: `INV-2026-00${salesDocs.length + 1}`,
    customer: '',
    subtotal: '',
    tag: 'Reguler',
    dueDate: '2026-12-15'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const sub = Number(newInv.subtotal) || 0;
    const ppn = sub * 0.11;
    const total = sub + ppn;
    const item = {
      id: `s-00${salesDocs.length + 1}`,
      number: newInv.number,
      customer: newInv.customer,
      subtotal: sub,
      ppn,
      total,
      paid: 0,
      status: 'Belum Lunas',
      tag: newInv.tag,
      date: '2026-11-14',
      dueDate: newInv.dueDate
    };
    setSalesDocs(prev => [item, ...prev]);
    notify(`Faktur Penjualan ${item.number} berhasil diterbitkan.`);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Invoices &amp; Penjualan</h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola faktur penjualan produk plastik, piutang pelanggan, dan PPN 11%
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Buat Faktur Baru</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">No. Faktur</th>
                <th className="pb-3">Pelanggan</th>
                <th className="pb-3">Tanggal / Tempo</th>
                <th className="pb-3 text-right">Subtotal</th>
                <th className="pb-3 text-right">PPN 11%</th>
                <th className="pb-3 text-right">Total Faktur</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {salesDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-blue-600">{doc.number}</td>
                  <td className="py-3 font-bold text-slate-900">{doc.customer}</td>
                  <td className="py-3 text-slate-500">
                    <div>{formatDate(doc.date)}</div>
                    <div className="text-[10px] text-slate-400">Tempo: {formatDate(doc.dueDate)}</div>
                  </td>
                  <td className="py-3 text-right font-medium">{formatRupiah(doc.subtotal)}</td>
                  <td className="py-3 text-right font-medium text-slate-500">{formatRupiah(doc.ppn)}</td>
                  <td className="py-3 text-right font-black text-slate-900">{formatRupiah(doc.total)}</td>
                  <td className="py-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      doc.status === 'Lunas'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Buat Faktur Penjualan Baru</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nama Pelanggan</label>
                <input
                  type="text"
                  required
                  placeholder="PT Surya Kencana Packindo"
                  value={newInv.customer}
                  onChange={e => setNewInv({ ...newInv, customer: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Subtotal Sebelum Pajak (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="100000000"
                  value={newInv.subtotal}
                  onChange={e => setNewInv({ ...newInv, subtotal: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Simpan &amp; Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
