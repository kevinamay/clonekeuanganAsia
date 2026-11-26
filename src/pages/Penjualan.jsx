import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/format';
import {
  FilePlus2,
  Lock,
  Search,
  History,
  CreditCard,
  Printer,
  Trash2,
  Check,
  X,
  FileText,
  ExternalLink,
  Percent,
  CircleAlert,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

function StatusBadge({ status }) {
  const n = (status || '').toLowerCase();
  let color = 'bg-sky-50 text-sky-700 border-sky-200';
  if (
    n.includes('lunas') ||
    n.includes('aktif') ||
    n.includes('selesai') ||
    n.includes('terverifikasi') ||
    n.includes('terekonsiliasi')
  ) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    n.includes('belum') ||
    n.includes('pending') ||
    n.includes('parsial') ||
    n.includes('terbayar sebagian') ||
    n.includes('proses')
  ) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (n.includes('batal') || n.includes('tolak') || n.includes('jatuh tempo')) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (n.includes('butuh persetujuan')) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
}

function StatCard({ label, value, subtext, tone = 'neutral' }) {
  let indicatorColor = 'bg-slate-300';
  let valueColor = 'text-slate-900';

  if (tone === 'sky') {
    indicatorColor = 'bg-sky-500';
    valueColor = 'text-sky-700';
  } else if (tone === 'warning') {
    indicatorColor = 'bg-amber-500';
    valueColor = 'text-amber-700';
  } else if (tone === 'positive') {
    indicatorColor = 'bg-emerald-500';
    valueColor = 'text-emerald-700';
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${indicatorColor}`} />
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <div className={`mt-2 font-mono text-xl font-bold tracking-tight ${valueColor}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  open,
  onClose,
  docNumber,
  partyName,
  partyRole = 'Pelanggan',
  direction = 'in',
  total,
  alreadyPaid,
  bankAccounts,
  initialNote = '',
  onConfirm
}) {
  const remaining = useMemo(() => Math.max(0, total - alreadyPaid), [total, alreadyPaid]);
  const [scheme, setScheme] = useState('partial');
  const [amount, setAmount] = useState(0);
  const [targetBankId, setTargetBankId] = useState('');
  const [note, setNote] = useState(initialNote);
  const [quickType, setQuickType] = useState(null);

  useEffect(() => {
    if (open) {
      if (alreadyPaid > 0) {
        setScheme('partial');
        setAmount(remaining);
        setQuickType('remaining');
      } else {
        setScheme('partial');
        const dp = Math.round(0.3 * total);
        setAmount(dp > 0 ? dp : remaining);
        setQuickType('dp30');
      }
      setNote(initialNote || '');
    }
  }, [open, total, alreadyPaid, remaining, initialNote]);

  if (!open) return null;

  const validAmount = Math.min(Math.max(0, amount), remaining);
  const newTotalPaid = alreadyPaid + validAmount;
  const remainingAfter = Math.max(0, total - newTotalPaid);
  const progressBefore = total > 0 ? Math.round((alreadyPaid / total) * 100) : 0;
  const progressAfter = total > 0 ? Math.round((newTotalPaid / total) * 100) : 0;
  const nextStatus = newTotalPaid >= total ? 'Lunas' : newTotalPaid > 0 ? 'Terbayar Sebagian' : 'Belum Dibayar';

  const selectedBank = bankAccounts.find((b) => b.id === targetBankId);
  const isInsufficient = direction === 'out' && selectedBank && selectedBank.balanceBank < validAmount;

  const handleQuickSelect = (type, amt, label) => {
    setQuickType(type);
    setScheme(amt >= remaining ? 'full' : 'partial');
    setAmount(amt);
    if (!note || note.startsWith('Pembayaran DP') || note.startsWith('Pelunasan') || note.startsWith('Termin')) {
      if (amt >= remaining) {
        setNote(`Pelunasan sisa tagihan ${docNumber} (${partyName})`);
      } else {
        setNote(`Pembayaran ${label} ${docNumber} (${partyName})`);
      }
    }
  };

  const handleSchemeChange = (newScheme) => {
    setScheme(newScheme);
    if (newScheme === 'full') {
      setAmount(remaining);
      setQuickType('remaining');
      if (!note || note.startsWith('Pembayaran DP') || note.startsWith('Termin')) {
        setNote(`Pelunasan penuh tagihan ${docNumber} (${partyName})`);
      }
    } else {
      setQuickType(null);
      const half = Math.round(remaining / 2);
      setAmount(half > 0 ? half : remaining);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validAmount <= 0 || isInsufficient) return;
    onConfirm({
      amount: validAmount,
      accountId: targetBankId,
      note: note.trim(),
      newPaid: newTotalPaid,
      remainingAfter,
      nextStatus
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Catat Pembayaran — {docNumber}</h3>
            <p className="text-[11px] text-slate-500">
              {partyRole}: {partyName} · Fasilitas Pembayaran Parsial (DP / Termin) &amp; Pelunasan
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Total Tagihan</span>
                <span className="font-mono text-xs font-bold text-slate-900 block mt-0.5">{formatRupiah(total)}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">Sudah Terbayar</span>
                <span className="font-mono text-xs font-bold text-emerald-700 block mt-0.5">{formatRupiah(alreadyPaid)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 block">Sisa Tagihan</span>
                <span className="font-mono text-xs font-extrabold text-blue-700 block mt-0.5">{formatRupiah(remaining)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                <span>Progress Pembayaran:</span>
                <span className="font-semibold text-slate-700">
                  {progressBefore}% → {progressAfter}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-slate-400"
                  style={{ width: `${Math.min(100, progressBefore)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 left-0 bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, progressAfter)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scheme Selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">Pilih Skema Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSchemeChange('partial')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  scheme === 'partial'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Percent className="h-3.5 w-3.5" />
                <span>Bayar Parsial (DP / Termin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSchemeChange('full')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  scheme === 'full'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Pelunasan Penuh (100%)</span>
              </button>
            </div>
          </div>

          {/* Quick Select Buttons */}
          {scheme === 'partial' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Pilih Cepat Persentase:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('dp30', Math.min(remaining, Math.round(0.3 * total)), 'DP 30%')}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors text-center cursor-pointer ${
                    quickType === 'dp30'
                      ? 'border-blue-600 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  DP 30%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('dp50', Math.min(remaining, Math.round(0.5 * total)), 'Termin 50%')}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors text-center cursor-pointer ${
                    quickType === 'dp50'
                      ? 'border-blue-600 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Termin 50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('remaining', remaining, 'Pelunasan Penuh')}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors text-center cursor-pointer ${
                    quickType === 'remaining'
                      ? 'border-blue-600 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Sisa 100%
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nominal yang {direction === 'in' ? 'Diterima' : 'Dibayarkan'} (IDR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min={1}
                max={remaining}
                value={amount || ''}
                onChange={(e) => {
                  setQuickType(null);
                  const val = Number(e.target.value) || 0;
                  setAmount(val);
                  if (val >= remaining) setScheme('full');
                  else setScheme('partial');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Terbilang: {formatRupiah(amount)}</span>
              <span className="text-slate-400">Maksimal: {formatRupiah(remaining)}</span>
            </div>
          </div>

          {/* Simulation Box */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-blue-50/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>Simulasi Dampak Pembayaran Ini:</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-200/50">
              <span className="text-slate-600">Sisa Tagihan Setelah Ini:</span>
              <span className={`font-mono font-bold ${remainingAfter === 0 ? 'text-emerald-600' : 'text-indigo-700'}`}>
                {formatRupiah(remainingAfter)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Status Dokumen Berikutnya:</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  nextStatus === 'Lunas'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}
              >
                {nextStatus === 'Lunas' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Lunas (100%)</span>
                  </>
                ) : (
                  <>
                    <History className="h-3 w-3" />
                    <span>Terbayar Sebagian ({progressAfter}%)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Bank Account Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {direction === 'in' ? 'Pilih Rekening Penerima (Kas / Bank)' : 'Pilih Rekening Sumber Dana (Kas / Bank)'}
            </label>
            <select
              value={targetBankId}
              onChange={(e) => setTargetBankId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Catat Transaksi Saja (Tanpa Potong/Tambah Rekening Bank) --</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code}) — Saldo: {formatRupiah(b.balanceBank || 0)}
                </option>
              ))}
            </select>
            {isInsufficient && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 font-semibold">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Saldo rekening tidak mencukupi untuk pembayaran senilai {formatRupiah(validAmount)}.</span>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan / Referensi Bukti Transfer</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Transfer termin 1 via BCA ref #89281, DP 30%..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={validAmount <= 0 || isInsufficient}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer ${
                nextStatus === 'Lunas' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>
                {nextStatus === 'Lunas' ? 'Konfirmasi Pelunasan' : 'Konfirmasi Bayar Parsial'} ({formatRupiah(validAmount)})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Penjualan() {
  const {
    salesDocs = [],
    setSalesDocs,
    bankAccounts = [],
    setBankAccounts,
    bankMutations = [],
    setBankMutations,
    auditLogs = [],
    setAuditLogs,
    notify,
    confirmAction
  } = useAppContext();

  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'Owner';
  const canApprove = userRole === 'Owner' || userRole === 'Finance Manager';

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [timeFilter, setTimeFilter] = useState('semua');

  // Modals state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [paymentDoc, setPaymentDoc] = useState(null);
  const [infoModalMessage, setInfoModalMessage] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // New Invoice form state
  const [newCustomer, setNewCustomer] = useState('');
  const [newType, setNewType] = useState('Faktur Penjualan');
  const [newSubtotal, setNewSubtotal] = useState(0);
  const [newDate, setNewDate] = useState('2026-11-13');
  const [newDueDate, setNewDueDate] = useState('2026-12-13');
  const [newPpnRate, setNewPpnRate] = useState(11);
  const [newTaxInclusive, setNewTaxInclusive] = useState(false);
  const [newWithholdingRate, setNewWithholdingRate] = useState(0);
  const [newDownPayment, setNewDownPayment] = useState(0);

  // KPI Calculations
  const unpaidSalesTotal = useMemo(() => {
    return salesDocs
      .filter((d) => d.status !== 'Lunas')
      .reduce((sum, d) => sum + Math.max(0, (d.total || 0) - (d.paid || 0)), 0);
  }, [salesDocs]);

  const overdueSalesTotal = useMemo(() => {
    return salesDocs
      .filter((d) => d.status === 'Jatuh Tempo')
      .reduce((sum, d) => sum + Math.max(0, (d.total || 0) - (d.paid || 0)), 0);
  }, [salesDocs]);

  const totalPaidRevenue = useMemo(() => {
    return salesDocs.reduce((sum, d) => sum + (d.paid || 0), 0);
  }, [salesDocs]);

  const approvalCount = useMemo(() => {
    return salesDocs.filter((d) => d.status === 'Butuh Persetujuan').length;
  }, [salesDocs]);

  // Filtered sales documents
  const filteredSalesDocs = useMemo(() => {
    return salesDocs.filter((doc) => {
      // Tab filter
      if (activeTab === 'faktur') {
        const isFaktur =
          doc.type === 'Faktur Penjualan' ||
          doc.type === 'Proforma Invoice' ||
          doc.type === 'Progress Invoice' ||
          doc.type === 'Join Invoice';
        if (!isFaktur) return false;
      } else if (activeTab === 'pesanan') {
        const isPesanan = doc.type === 'Penawaran' || doc.type === 'Pesanan Penjualan' || doc.type === 'Surat Jalan';
        if (!isPesanan) return false;
      } else if (activeTab === 'approval') {
        if (doc.status !== 'Butuh Persetujuan') return false;
      } else if (activeTab === 'retur') {
        return false;
      }

      // Status dropdown filter
      if (statusFilter !== 'semua' && doc.status !== statusFilter) {
        return false;
      }

      // Time dropdown filter
      if (timeFilter === 'bulan-ini' && doc.date && !doc.date.startsWith('2026-11')) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = doc.number && doc.number.toLowerCase().includes(q);
        const matchCustomer = doc.customer && doc.customer.toLowerCase().includes(q);
        if (!matchNumber && !matchCustomer) return false;
      }

      return true;
    });
  }, [salesDocs, activeTab, statusFilter, timeFilter, searchQuery]);

  // Handler: Create new invoice
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.trim() || newSubtotal <= 0) return;

    const dpp = newTaxInclusive ? Math.round(newSubtotal / (1 + newPpnRate / 100)) : newSubtotal;
    const ppnAmount = Math.round((dpp * newPpnRate) / 100);
    const withholdingAmount = Math.round((newWithholdingRate / 100) * dpp);
    const totalAmount = dpp + ppnAmount - withholdingAmount;
    const paidAmount = Number(newDownPayment) || 0;

    const newDoc = {
      id: `s-${Date.now()}`,
      number: `${newType === 'Proforma Invoice' ? 'PRO' : 'INV'}-2026-${1100 + salesDocs.length + 1}`,
      type: newType,
      customer: newCustomer.trim(),
      date: newDate || new Date().toISOString().split('T')[0],
      dueDate: newDueDate || new Date(Date.now() + 2592000000).toISOString().split('T')[0],
      tag: 'Proyek Utama',
      subtotal: dpp,
      ppn: ppnAmount,
      withholding: withholdingAmount,
      total: totalAmount,
      paid: paidAmount,
      status: paidAmount >= totalAmount ? 'Lunas' : paidAmount > 0 ? 'Terbayar Sebagian' : 'Belum Dibayar',
      paymentMethod: 'Transfer Bank'
    };

    setSalesDocs((prev) => [newDoc, ...prev]);

    const auditEntry = {
      time: 'Baru saja',
      user: currentUser?.name || 'Carlos Susanto',
      action: `Faktur Baru Dibuat: ${newDoc.number} (${newDoc.customer}) senilai ${formatRupiah(newDoc.total)} tanggal ${newDoc.date}`,
      module: 'Penjualan'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    setNewModalOpen(false);
    setNewCustomer('');
    setNewSubtotal(0);
    setNewDownPayment(0);
    notify(`${newDoc.number} berhasil dibuat (Tanggal: ${newDoc.date}) dan tercatat di sistem.`);
  };

  // Handler: Confirm payment
  const handlePaymentConfirm = (res) => {
    if (!paymentDoc || res.amount <= 0) return;

    const { amount, accountId, note: paymentNote, newPaid, nextStatus } = res;

    // Update sales document
    setSalesDocs((prev) =>
      prev.map((d) =>
        d.id === paymentDoc.id
          ? {
              ...d,
              paid: newPaid,
              status: nextStatus,
              paymentNote: paymentNote || d.paymentNote
            }
          : d
      )
    );

    // Update bank account balance if account selected
    if (accountId) {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === accountId
            ? {
                ...b,
                balanceBank: (b.balanceBank || 0) + amount,
                balanceBook: (b.balanceBook || 0) + amount
              }
            : b
        )
      );

      // Create new bank mutation
      const newMutation = {
        id: `mut-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description:
          nextStatus === 'Lunas'
            ? paymentNote
              ? `Pelunasan ${paymentDoc.number} dari ${paymentDoc.customer} (${paymentNote})`
              : `Pelunasan ${paymentDoc.number} dari ${paymentDoc.customer}`
            : paymentNote
            ? `Pembayaran Parsial ${paymentDoc.number} dari ${paymentDoc.customer} (${paymentNote})`
            : `Pembayaran Parsial ${paymentDoc.number} dari ${paymentDoc.customer}`,
        amount,
        direction: 'CR',
        status: 'Terekonsiliasi',
        matchedDoc: paymentDoc.number
      };
      setBankMutations((prev) => [newMutation, ...prev]);
    }

    // Add audit log
    const now = new Date();
    const timeFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const auditEntry = {
      time: timeFormatted,
      user: currentUser?.name || 'Carlos Susanto',
      action: `Pembayaran ${paymentDoc.number} senilai ${formatRupiah(amount)} [${nextStatus}]${
        paymentNote ? ` - Catatan: "${paymentNote}"` : ''
      }`,
      module: 'Penjualan'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    setPaymentDoc(null);
    notify(`Pembayaran ${formatRupiah(amount)} untuk ${paymentDoc.number} berhasil dibukukan (${nextStatus}).`);
  };

  // Handler: Approve invoice
  const handleApprove = (docId) => {
    if (!canApprove) {
      notify('Akses Ditolak: Hanya Finance Manager dan Owner yang berhak menyetujui faktur.', 'error');
      return;
    }
    const target = salesDocs.find((d) => d.id === docId);
    setSalesDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'Belum Dibayar' } : d)));
    if (target) {
      setAuditLogs((prev) => [
        {
          time: 'Baru saja',
          user: currentUser?.name || 'Carlos Susanto',
          action: `Persetujuan Faktur: ${target.number} (${target.customer}) senilai ${formatRupiah(target.total)} disetujui`,
          module: 'Penjualan'
        },
        ...prev
      ]);
    }
    notify('Faktur disetujui dan diterbitkan sebagai tagihan aktif.');
  };

  // Handler: Reject invoice
  const handleReject = (docId) => {
    if (!canApprove) {
      notify('Akses Ditolak: Hanya Finance Manager dan Owner yang berhak menolak faktur.', 'error');
      return;
    }
    const target = salesDocs.find((d) => d.id === docId);
    const docNo = target?.number || docId;
    confirmAction({
      title: 'Tolak Faktur Penjualan',
      message: `Tolak faktur penjualan "${docNo}" (${target?.customer || ''})? Status faktur akan diubah menjadi 'Dibatalkan'.`,
      confirmText: 'Tolak Faktur',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setSalesDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'Dibatalkan' } : d)));
        if (target) {
          setAuditLogs((prev) => [
            {
              time: 'Baru saja',
              user: currentUser?.name || 'Carlos Susanto',
              action: `Penolakan Faktur: ${target.number} (${target.customer}) senilai ${formatRupiah(target.total)} ditolak.`,
              module: 'Penjualan'
            },
            ...prev
          ]);
        }
        notify(`Faktur ${docNo} berhasil dibatalkan/ditolak.`);
      }
    });
  };

  // Handler: Delete invoice
  const handleDelete = (docId, docNumber) => {
    confirmAction({
      title: 'Hapus Faktur Penjualan',
      message: `Hapus faktur penjualan "${docNumber}"? Data yang dihapus tidak dapat dipulihkan.`,
      confirmText: 'Hapus Faktur',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setSalesDocs((prev) => prev.filter((d) => d.id !== docId));
        setAuditLogs((prev) => [
          {
            time: 'Baru saja',
            user: currentUser?.name || 'Carlos Susanto',
            action: `Faktur Dihapus: ${docNumber} dihapus dari sistem`,
            module: 'Penjualan'
          },
          ...prev
        ]);
        notify(`Faktur ${docNumber} berhasil dihapus.`);
      }
    });
  };

  // Calculations for dynamic preview in create modal
  const previewDpp = newTaxInclusive ? Math.round((newSubtotal || 0) / (1 + newPpnRate / 100)) : newSubtotal || 0;
  const previewPpn = Math.round((previewDpp * newPpnRate) / 100);
  const previewPph = Math.round((newWithholdingRate / 100) * previewDpp);
  const previewTotal = Math.max(0, previewDpp + previewPpn - previewPph);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">Penjualan &amp; Invoicing</h1>
          <p className="mt-1 text-xs text-[#586E89]">
            Faktur penjualan, proforma invoice, termin progres, surat jalan, dan pencatatan pelunasan terintegrasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setInfoModalMessage(
                'Integrasi WhatsApp & SMS Gateway untuk pengiriman reminder massal membutuhkan API Key Twilio / WhatsApp Business API.'
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C] hover:bg-[#F8FBFF] shadow-xs cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>Reminder Massal API</span>
            <span className="rounded-md bg-amber-50 text-[10px] font-bold text-amber-700 px-1.5 py-0.5 border border-amber-200">
              Coming Soon
            </span>
          </button>
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] shadow-xs cursor-pointer"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Buat Penjualan Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Penjualan Belum Dibayar"
          value={formatRupiah(unpaidSalesTotal)}
          subtext={
            salesDocs.filter((d) => d.status !== 'Lunas').length > 0
              ? `${salesDocs.filter((d) => d.status !== 'Lunas').length} faktur aktif`
              : 'Tidak ada piutang berjalan'
          }
          tone="sky"
        />
        <StatCard
          label="Penjualan Jatuh Tempo"
          value={formatRupiah(overdueSalesTotal)}
          subtext={
            overdueSalesTotal > 0
              ? `${salesDocs.filter((d) => d.status === 'Jatuh Tempo').length} faktur jatuh tempo`
              : 'Tidak ada faktur lewat tempo'
          }
          tone="warning"
        />
        <StatCard
          label="Total Pelunasan Diterima"
          value={formatRupiah(totalPaidRevenue)}
          subtext="Realisasi penerimaan dana"
          tone="positive"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={`${approvalCount} Dokumen`}
          subtext={approvalCount > 0 ? 'Perlu approval' : 'Semua faktur telah disetujui'}
          tone="neutral"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-[#DCE7F5] gap-1 overflow-x-auto">
        {[
          { id: 'semua', label: 'Semua Transaksi', count: salesDocs.length },
          { id: 'faktur', label: 'Faktur & Proforma' },
          { id: 'pesanan', label: 'Penawaran & Pesanan' },
          { id: 'approval', label: 'Butuh Persetujuan', count: approvalCount },
          { id: 'retur', label: 'Kredit Memo & Retur' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#0284C7] text-[#0284C7]'
                  : 'border-transparent text-[#586E89] hover:text-[#0B192C]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-[#EDF4FC] text-[#0284C7]' : 'bg-gray-100 text-[#586E89]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Table Container */}
      {activeTab === 'retur' ? (
        <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
          <RotateCcw className="mx-auto h-8 w-8 text-[#0284C7] mb-2" />
          <h4 className="text-sm font-semibold text-[#0B192C]">Tidak ada retur penjualan aktif</h4>
          <p className="mt-1 text-xs text-[#586E89]">
            Retur barang dari pelanggan otomatis mengurangi piutang dan memperbarui stok gudang.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pelanggan atau nomor faktur..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="semua">Semua Status</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Dibayar">Belum Dibayar</option>
                <option value="Butuh Persetujuan">Butuh Persetujuan</option>
                <option value="Terbayar Sebagian">Terbayar Sebagian</option>
              </select>

              {/* Time Dropdown */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="semua">Semua Waktu</option>
                <option value="bulan-ini">Bulan Ini (Nov 2026)</option>
              </select>

              {/* Reset Filter */}
              {(searchQuery || statusFilter !== 'semua' || timeFilter !== 'semua') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('semua');
                    setTimeFilter('semua');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Audit Log Button */}
            <button
              type="button"
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span>Log Aktivitas Penjualan</span>
            </button>
          </div>

          {/* Table Content */}
          {filteredSalesDocs.length === 0 ? (
            <div className="p-8 text-center">
              <FilePlus2 className="mx-auto h-8 w-8 text-[#0284C7] mb-2" />
              <h4 className="text-sm font-semibold text-[#0B192C]">Belum ada transaksi penjualan</h4>
              <p className="mt-1 text-xs text-[#586E89]">
                Buat faktur penjualan baru untuk mulai menagih pelanggan dan mencatat piutang di sistem.
              </p>
              <button
                type="button"
                onClick={() => setNewModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0369A1]"
              >
                <span>Buat Penjualan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Nomor &amp; Tipe</th>
                    <th className="px-6 py-3.5">Pelanggan</th>
                    <th className="px-6 py-3.5">Tanggal / Tempo</th>
                    <th className="px-6 py-3.5 text-right">Total Faktur</th>
                    <th className="px-6 py-3.5 text-right">Sisa Piutang</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalesDocs.map((doc) => {
                    const remaining = Math.max(0, (doc.total || 0) - (doc.paid || 0));
                    return (
                      <tr key={doc.id || doc.number} className="hover:bg-slate-50/60 transition-colors">
                        {/* Nomor & Tipe */}
                        <td className="px-6 py-4">
                          <Link
                            to={`/dokumen?id=${encodeURIComponent(doc.number)}`}
                            className="text-left group block"
                            title="Buka halaman dokumen & cetak"
                          >
                            <div className="num font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline flex items-center gap-1">
                              <span>{doc.number}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400">{doc.type || 'Faktur Penjualan'}</div>
                          </Link>
                        </td>

                        {/* Pelanggan */}
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div>{doc.customer}</div>
                          <Link
                            to={`/dokumen?id=${encodeURIComponent(doc.number)}`}
                            className="mt-1 flex items-center gap-1.5 text-[11px] font-normal text-slate-500 hover:text-blue-600 transition-colors text-left group"
                            title="Klik untuk membuka rincian dokumen lengkap"
                          >
                            <FileText className="h-3 w-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                            <span className="line-clamp-1 max-w-[200px] text-slate-600 group-hover:text-blue-600 group-hover:underline">
                              {doc.paymentNote || doc.tag || 'Buka rincian dokumen...'}
                            </span>
                          </Link>
                        </td>

                        {/* Tanggal / Tempo */}
                        <td className="num px-6 py-4 text-xs text-slate-600">
                          <div>{doc.date}</div>
                          <div className="text-slate-400">Tempo: {doc.dueDate}</div>
                        </td>

                        {/* Total Faktur */}
                        <td className="num px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(doc.total)}</td>

                        {/* Sisa Piutang */}
                        <td className="num px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(remaining)}</td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={doc.status} />
                        </td>

                        {/* Tindakan */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.status === 'Butuh Persetujuan' ? (
                              canApprove ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(doc.id)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs cursor-pointer"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReject(doc.id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                    title="Tolak Faktur"
                                  >
                                    <X className="h-3 w-3" />
                                    <span>Tolak</span>
                                  </button>
                                </div>
                              ) : (
                                <span
                                  title="Peran Anda tidak memiliki hak approval (Staff CUD tanpa approve - hanya Manager & Owner)"
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-400 cursor-not-allowed"
                                >
                                  <Lock className="h-3 w-3" />
                                  <span>Perlu Approval Manager</span>
                                </span>
                              )
                            ) : doc.status !== 'Lunas' ? (
                              <button
                                type="button"
                                onClick={() => setPaymentDoc(doc)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0369A1] shadow-2xs cursor-pointer"
                              >
                                <CreditCard className="h-3 w-3" />
                                <span>{doc.paid > 0 ? 'Lanjut Bayar' : 'Terima Bayar'}</span>
                              </button>
                            ) : (
                              <Link
                                to={`/dokumen?id=${encodeURIComponent(doc.number)}`}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                title="Buka & Cetak Dokumen"
                              >
                                <Printer className="h-3 w-3 text-slate-500" />
                                <span>Cetak</span>
                              </Link>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id, doc.number)}
                              className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Faktur"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Buat Penjualan Baru */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Buat Dokumen Penjualan Baru</h3>
                <p className="text-[11px] text-slate-500">Otomatis menghitung DPP, PPN 11%, dan tersimpan di sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* Document Type */}
              <div>
                <label className="text-xs font-semibold text-slate-700">Tipe Dokumen</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Faktur Penjualan">Faktur Penjualan (Invoice)</option>
                  <option value="Proforma Invoice">Proforma Invoice</option>
                  <option value="Progress Invoice">Progress Invoice (Termin)</option>
                  <option value="Penawaran">Surat Penawaran Harga (Quotation)</option>
                  <option value="Pesanan Penjualan">Pesanan Penjualan (Sales Order)</option>
                  <option value="Surat Jalan">Surat Jalan / Delivery Order</option>
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700">Nama Pelanggan / Rekanan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Mulia Polyindo"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Dokumen</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Jatuh Tempo</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtotal */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Subtotal Nilai Transaksi (IDR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="0"
                  value={newSubtotal || ''}
                  onChange={(e) => setNewSubtotal(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Tax Selection */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Pajak PPN (%)</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { val: 0, label: '0%' },
                      { val: 11, label: '11% (Default)' },
                      { val: 12, label: '12% (UU HPP)' }
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setNewPpnRate(p.val)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          newPpnRate === p.val ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newPpnRate}
                    onChange={(e) => setNewPpnRate(Number(e.target.value))}
                    className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">
                    Nilai PPN: <b>{formatRupiah(previewPpn)}</b>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <input
                    type="checkbox"
                    id="taxInc"
                    checked={newTaxInclusive}
                    onChange={(e) => setNewTaxInclusive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="taxInc" className="text-xs text-slate-600 cursor-pointer">
                    Harga input sudah termasuk PPN (Tax Inclusive)
                  </label>
                </div>
              </div>

              {/* Withholding & Down Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Potongan PPh 23 (%)</label>
                  <input
                    type="number"
                    value={newWithholdingRate || ''}
                    onChange={(e) => setNewWithholdingRate(Number(e.target.value))}
                    placeholder="0 (opsional)"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Uang Muka / DP (IDR)</label>
                  <input
                    type="number"
                    value={newDownPayment || ''}
                    onChange={(e) => setNewDownPayment(Number(e.target.value))}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Summary Calculation Preview */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>DPP (Dasar Pengenaan Pajak):</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(previewDpp)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({newPpnRate}%):</span>
                  <span className="font-semibold text-blue-700">+{formatRupiah(previewPpn)}</span>
                </div>
                {newWithholdingRate > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>PPh Dipotong ({newWithholdingRate}%):</span>
                    <span className="font-semibold text-amber-700">-{formatRupiah(previewPph)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-blue-200/60 pt-1.5 font-bold text-slate-900 text-sm">
                  <span>Total Tagihan:</span>
                  <span className="text-blue-600">{formatRupiah(previewTotal)}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] cursor-pointer"
                >
                  Terbitkan Faktur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payment (Terima Bayar) */}
      {paymentDoc && (
        <PaymentModal
          open={!!paymentDoc}
          onClose={() => setPaymentDoc(null)}
          docNumber={paymentDoc.number}
          partyName={paymentDoc.customer}
          partyRole="Pelanggan"
          direction="in"
          total={paymentDoc.total || 0}
          alreadyPaid={paymentDoc.paid || 0}
          bankAccounts={bankAccounts}
          initialNote={paymentDoc.paymentNote || ''}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* Modal: Reminder Massal API (Coming Soon) */}
      {infoModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Fitur API Eksternal</h3>
              <button
                type="button"
                onClick={() => setInfoModalMessage(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <div className="font-bold">Fitur Terkunci (Coming Soon)</div>
                <div className="mt-1 text-slate-600">{infoModalMessage}</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalMessage(null)}
                className="rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1]"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Aktivitas Penjualan */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Riwayat Log Aktivitas Penjualan</h3>
                <p className="text-[11px] text-slate-500">
                  Jejak audit seluruh pembuatan faktur, persetujuan, dan transaksi di modul penjualan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {auditLogs.filter((l) => l.module === 'Penjualan').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Belum ada riwayat aktivitas yang tercatat untuk modul penjualan.
                </div>
              ) : (
                auditLogs
                  .filter((l) => l.module === 'Penjualan')
                  .map((log, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.user}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{log.action}</p>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
