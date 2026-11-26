import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { Landmark, ArrowUpRight, ArrowDownLeft, Plus, Download, RefreshCw, CreditCard, Send, Check } from 'lucide-react';

export default function KasBank() {
  const { bankAccounts, bankMutations, setBankAccounts, notify } = useAppContext();
  const [selectedAcc, setSelectedAcc] = useState('all');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [fromAcc, setFromAcc] = useState(bankAccounts[0]?.id || '');
  const [toAcc, setToAcc] = useState(bankAccounts[1]?.id || '');

  const totalBalance = bankAccounts.reduce((acc, b) => acc + (b.balanceBank || 0), 0);

  const handleTransfer = (e) => {
    e.preventDefault();
    const amount = Number(transferAmount);
    if (!amount || amount <= 0) {
      notify('Masukkan nominal transfer yang valid', 'error');
      return;
    }
    setBankAccounts(prev => prev.map(a => {
      if (a.id === fromAcc) return { ...a, balanceBank: a.balanceBank - amount };
      if (a.id === toAcc) return { ...a, balanceBank: a.balanceBank + amount };
      return a;
    }));
    notify(`Transfer ${formatRupiah(amount)} berhasil diproses.`);
    setShowTransferModal(false);
    setTransferAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Kas &amp; Bank</h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola rekening bank operasional, valas (USD/CNY), kas kecil, dan mutasi transaksi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Transfer Dana</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bankAccounts.map((acc) => (
          <div key={acc.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{acc.bankLabel || acc.name}</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {acc.currency}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">{acc.code}</div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900">
                {acc.currency === 'USD' ? `$ ${acc.balanceBank?.toLocaleString()}` : formatRupiah(acc.balanceBank)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">{acc.purpose}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{acc.cardNumber || acc.name}</span>
              <span className="text-emerald-600 font-semibold">{acc.cashlink ? 'Auto Sync' : 'Manual'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mutations Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Histori Mutasi Terkini</h3>
            <p className="text-xs text-slate-400">Daftar arus kas masuk (CR) dan keluar (DB)</p>
          </div>
          <button
            type="button"
            onClick={() => notify('Mutasi rekening disinkronkan langsung dari bank server')}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sinkron Bank</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Deskripsi Transaksi</th>
                <th className="pb-3 text-right">Nominal</th>
                <th className="pb-3 text-center">Tipe</th>
                <th className="pb-3 text-right">Status Rekon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bankMutations.map((mut) => (
                <tr key={mut.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-medium text-slate-500">{formatDate(mut.date)}</td>
                  <td className="py-3 font-semibold text-slate-900">{mut.description}</td>
                  <td className={`py-3 text-right font-black ${mut.direction === 'CR' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {mut.direction === 'CR' ? '+' : '-'} {formatRupiah(mut.amount)}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      mut.direction === 'CR' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {mut.direction}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      mut.status === 'Terekonsiliasi'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {mut.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Transfer Kas &amp; Bank</h3>
            <p className="text-xs text-slate-500 mt-1">Pindahkan saldo antar rekening Asia Plastik</p>

            <form onSubmit={handleTransfer} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Dari Rekening</label>
                <select
                  value={fromAcc}
                  onChange={(e) => setFromAcc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                >
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatRupiah(a.balanceBank)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Ke Rekening</label>
                <select
                  value={toAcc}
                  onChange={(e) => setToAcc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                >
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatRupiah(a.balanceBank)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Nominal Transfer (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 10000000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Kirim Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
