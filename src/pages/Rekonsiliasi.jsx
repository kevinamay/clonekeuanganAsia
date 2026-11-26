import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import {
  Lock,
  Plus,
  Trash2,
  CheckCheck,
  Check,
  Search,
  ArrowLeftRight,
  FileText,
  CreditCard,
  FileCheck2
} from 'lucide-react';

function StatusBadge({ status }) {
  const n = (status || '').toLowerCase();
  let color = 'bg-sky-50 text-sky-700 border-sky-200';
  if (
    n.includes('lunas') ||
    n.includes('aktif') ||
    n.includes('cair') ||
    n.includes('terekonsiliasi') ||
    n.includes('terhubung')
  ) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    n.includes('belum') ||
    n.includes('pending') ||
    n.includes('perlu') ||
    n.includes('tinjau')
  ) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (n.includes('batal') || n.includes('tolak') || n.includes('jatuh tempo')) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (n.includes('manual')) {
    color = 'bg-blue-50/70 text-blue-700 border-blue-200';
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
}

function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all`}>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function Rekonsiliasi() {
  const {
    notify,
    confirmAction,
    bankAccounts = [],
    bankMutations = [],
    setBankMutations,
    salesDocs = [],
    purchaseDocs = [],
    expenses = [],
    setExpenses
  } = useAppContext();

  // Filter legacy demo mutations if any
  const isLegacyDemo = (m) =>
    !!(
      m.id?.startsWith('bm-') ||
      m.description?.includes('SINAR BAJA JAYA') ||
      m.description?.includes('KARYA ABADI') ||
      m.description?.includes('MEKARI PAY') ||
      m.description?.includes('MITRA PLASTIK') ||
      m.description?.includes('BIAYA ADM REKENING')
    );

  const cleanMutations = useMemo(
    () => (Array.isArray(bankMutations) ? bankMutations.filter((m) => !isLegacyDemo(m)) : []),
    [bankMutations]
  );

  useEffect(() => {
    if (Array.isArray(bankMutations) && bankMutations.some(isLegacyDemo)) {
      setBankMutations((prev) => (Array.isArray(prev) ? prev.filter((m) => !isLegacyDemo(m)) : []));
    }
  }, [bankMutations, setBankMutations]);

  // Filter states
  const [selectedAccFilter, setSelectedAccFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua'); // 'semua', 'belum', 'terekonsiliasi'
  const [selectedMutationId, setSelectedMutationId] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Modals
  const [apiNotice, setApiNotice] = useState(null);
  const [showAddMutModal, setShowAddMutModal] = useState(false);

  // Add mutation form
  const [newMutAccId, setNewMutAccId] = useState(bankAccounts[0]?.id || 'acc-001');
  const [newMutDesc, setNewMutDesc] = useState('');
  const [newMutAmount, setNewMutAmount] = useState(0);
  const [newMutDirection, setNewMutDirection] = useState('CR');

  // Direct booking form inside bottom pane
  const [showDirectBooking, setShowDirectBooking] = useState(false);
  const [directBookingCategory, setDirectBookingCategory] = useState('Beban Operasional Bank');
  const [directBookingPayee, setDirectBookingPayee] = useState('');
  const [directBookingMemo, setDirectBookingMemo] = useState('');

  // Helper to map mutation to account ID
  const getAccId = (m) => {
    if (m.accountId) return m.accountId;
    const desc = (m.description || '').toLowerCase();
    if (
      desc.includes('transfer keluar ke kas besar') ||
      desc.includes('tf bca 0089') ||
      desc.includes('inv-2026-002')
    )
      return 'acc-001';
    if (
      desc.includes('transfer masuk dari bank bca') ||
      desc.includes('kas besar') ||
      desc.includes('cikarang')
    )
      return 'acc-002';
    if (desc.includes('mandiri')) {
      const a = bankAccounts.find((x) => x.name.toLowerCase().includes('mandiri'));
      if (a) return a.id;
    }
    if (desc.includes('usd') || desc.includes('8221-8900-01')) {
      const a = bankAccounts.find((x) => x.name.toLowerCase().includes('usd'));
      if (a) return a.id;
    }
    if (desc.includes('cny') || desc.includes('8221-8900-19')) {
      const a = bankAccounts.find((x) => x.name.toLowerCase().includes('cny'));
      if (a) return a.id;
    }
    for (const a of bankAccounts) {
      if (desc.includes(a.name.toLowerCase())) return a.id;
    }
    return bankAccounts[0]?.id || 'acc-001';
  };

  // Aggregate all general ledger documents
  const allLedgerDocs = useMemo(() => {
    return [
      ...salesDocs.map((s) => ({
        id: s.id,
        number: s.number,
        party: s.customer,
        date: s.date,
        direction: 'CR',
        amount: s.total,
        source: 'Faktur Penjualan',
        status: s.status
      })),
      ...purchaseDocs.map((p) => ({
        id: p.id,
        number: p.number,
        party: p.vendor,
        date: p.date,
        direction: 'DB',
        amount: p.total,
        source: 'Tagihan Pembelian',
        status: p.status
      })),
      ...expenses.map((x) => ({
        id: x.id,
        number: x.number,
        party: x.payee,
        date: x.date,
        direction: 'DB',
        amount: x.amount,
        source: 'Beban Operasional',
        status: x.status
      }))
    ];
  }, [salesDocs, purchaseDocs, expenses]);

  // Selected specific account object
  const currentAcc = selectedAccFilter === 'semua' ? null : bankAccounts.find((a) => a.id === selectedAccFilter) || null;

  // Filter mutations
  const displayedMutations = useMemo(() => {
    return cleanMutations.filter((m) => {
      const accId = getAccId(m);
      const accMatch = selectedAccFilter === 'semua' || accId === selectedAccFilter;
      const statusMatch =
        statusFilter === 'semua'
          ? true
          : statusFilter === 'belum'
          ? m.status !== 'Terekonsiliasi'
          : m.status === 'Terekonsiliasi';
      return accMatch && statusMatch;
    });
  }, [cleanMutations, selectedAccFilter, statusFilter]);

  // Selected mutation for matching pane
  const selectedMutation = useMemo(() => {
    return displayedMutations.find((m) => m.id === selectedMutationId) || displayedMutations[0] || null;
  }, [displayedMutations, selectedMutationId]);

  // Matching tab in bottom pane: 'smart' vs 'all'
  const [matchingTab, setMatchingTab] = useState('smart');

  // Check if selected mutation is an internal cash/bank transfer
  const isInternalTransfer = useMemo(() => {
    if (!selectedMutation) return false;
    const desc = (selectedMutation.description || '').toLowerCase();
    return (
      desc.includes('transfer') &&
      (desc.includes('kas besar') || desc.includes('ayat silang') || desc.includes('kas operasional'))
    );
  }, [selectedMutation]);

  // Filtered and sorted candidate documents
  const sortedCandidates = useMemo(() => {
    if (!selectedMutation) return [];
    return allLedgerDocs
      .filter(
        (doc) =>
          !docSearchQuery ||
          doc.number.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
          doc.party.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
          doc.source.toLowerCase().includes(docSearchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aExact = Math.abs(a.amount - selectedMutation.amount) < 100;
        const bExact = Math.abs(b.amount - selectedMutation.amount) < 100;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aDir = a.direction === selectedMutation.direction;
        const bDir = b.direction === selectedMutation.direction;
        if (aDir && !bDir) return -1;
        if (!aDir && bDir) return 1;

        return Math.abs(a.amount - selectedMutation.amount) - Math.abs(b.amount - selectedMutation.amount);
      });
  }, [selectedMutation, allLedgerDocs, docSearchQuery]);

  const exactMatchCount = useMemo(() => {
    if (!selectedMutation) return 0;
    return allLedgerDocs.filter((d) => Math.abs(d.amount - selectedMutation.amount) < 100).length;
  }, [selectedMutation, allLedgerDocs]);

  const candidateList =
    matchingTab === 'smart' && exactMatchCount > 0
      ? sortedCandidates.filter((d) => Math.abs(d.amount - (selectedMutation?.amount || 0)) < 100)
      : sortedCandidates;

  const unreconciledCount = displayedMutations.filter((m) => m.status !== 'Terekonsiliasi').length;

  const totalBankBalance = bankAccounts.reduce(
    (sum, a) => sum + (a.currency === 'IDR' ? a.balanceBank : 15720 * a.balanceBank),
    0
  );

  // Actions
  const handleReconcile = (mutId, docTitle) => {
    setBankMutations((prev) =>
      prev.map((m) => (m.id === mutId ? { ...m, status: 'Terekonsiliasi', matchedDoc: docTitle } : m))
    );
    notify(`Mutasi berhasil dicocokkan dengan ${docTitle}.`);
  };

  const handleUnmatch = (mutId) => {
    setBankMutations((prev) =>
      prev.map((m) => (m.id === mutId ? { ...m, status: 'Perlu Tinjau', matchedDoc: null } : m))
    );
    notify('Pencocokan mutasi telah dibatalkan.');
  };

  const handleSmartBatchReconcile = () => {
    let matchedCount = 0;
    setBankMutations((prev) =>
      prev.map((m) => {
        if (m.status === 'Terekonsiliasi') return m;
        const desc = (m.description || '').toLowerCase();
        if (
          desc.includes('transfer') &&
          (desc.includes('kas besar') || desc.includes('ayat silang') || desc.includes('kas operasional'))
        ) {
          matchedCount++;
          return { ...m, status: 'Terekonsiliasi', matchedDoc: 'Ayat Silang Kas/Bank (Otomatis)' };
        }
        const found = allLedgerDocs.find(
          (d) => d.direction === m.direction && Math.abs(d.amount - m.amount) < 100
        );
        if (found) {
          matchedCount++;
          return { ...m, status: 'Terekonsiliasi', matchedDoc: `${found.number} (${found.party})` };
        }
        return m;
      })
    );
    if (matchedCount > 0) {
      notify(
        `🎉 Pencocokan Cerdas Berhasil! ${matchedCount} mutasi rekening koran berhasil dicocokkan otomatis secara 100% klop.`
      );
    } else {
      notify('Tidak ada mutasi baru dengan nominal yang cocok secara otomatis.');
    }
  };

  const handleAddMutationSubmit = (e) => {
    e.preventDefault();
    if (!newMutDesc.trim() || newMutAmount <= 0) return;
    const targetAcc =
      bankAccounts.find((a) => a.id === newMutAccId) ||
      (selectedAccFilter !== 'semua' ? currentAcc : bankAccounts[0]) ||
      bankAccounts[0];

    const newMut = {
      id: `mut-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: newMutDesc.trim(),
      amount: newMutAmount,
      direction: newMutDirection,
      status: 'Perlu Tinjau',
      accountId: targetAcc?.id || 'acc-001',
      accountName: targetAcc?.name || 'Bank BCA'
    };
    setBankMutations([newMut, ...cleanMutations]);
    setSelectedMutationId(newMut.id);
    setShowAddMutModal(false);
    setNewMutDesc('');
    setNewMutAmount(0);
    notify('Mutasi bank baru berhasil dicatat.');
  };

  const handleDirectBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedMutation) return;
    const newDocNum = `EXP-REC-${Date.now().toString().slice(-4)}`;
    const newExpense = {
      id: `exp-${Date.now()}`,
      number: newDocNum,
      date: selectedMutation.date || new Date().toISOString().split('T')[0],
      category: directBookingCategory,
      payee:
        directBookingPayee.trim() ||
        (selectedMutation.direction === 'DB' ? 'Bank BCA / Biaya Administrasi' : 'Pendapatan Bunga Bank'),
      tag: directBookingMemo.trim() || selectedMutation.description || 'Rekonsiliasi Bank On-the-Fly',
      source: 'Mekari Expense',
      amount: selectedMutation.amount,
      status: 'Lunas',
      creator: 'Rekonsiliasi Bank Cerdas'
    };
    setExpenses([newExpense, ...expenses]);
    handleReconcile(selectedMutation.id, `${newDocNum} (${newExpense.payee})`);
    setShowDirectBooking(false);
    setDirectBookingPayee('');
    setDirectBookingMemo('');
    notify(`Beban pembukuan ${newDocNum} dibuat dan langsung terekonsiliasi dengan mutasi bank.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Rekonsiliasi Bank</h1>
          <p className="mt-1 text-xs text-slate-500">
            Cocokkan mutasi rekening koran dengan buku besar faktur penjualan, pembelian, dan beban secara otomatis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unreconciledCount > 0 && (
            <button
              type="button"
              onClick={handleSmartBatchReconcile}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 shadow-xs transition-colors cursor-pointer"
              title="Pencocokan otomatis semua mutasi yang memiliki nominal klop dengan dokumen pembukuan"
            >
              <span>Pencocokan Cerdas ({unreconciledCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setApiNotice(
                'Integrasi auto-feed rekening koran via Open Banking API Mandiri/BCA memerlukan persetujuan sandbox korporat. Sedang dalam tahap pengembangan.'
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>Auto-Feed Bank API</span>
            <span className="rounded-md bg-amber-50 text-[10px] font-bold text-amber-700 px-1.5 py-0.5 border border-amber-200">
              Coming Soon
            </span>
          </button>

          {cleanMutations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                confirmAction({
                  title: 'Bersihkan Seluruh Mutasi',
                  message:
                    'Hapus seluruh mutasi bank dan reset daftar rekonsiliasi? Tindakan ini akan mengosongkan seluruh riwayat mutasi bank.',
                  confirmText: 'Bersihkan Semua',
                  cancelText: 'Batal',
                  isDanger: true,
                  onConfirm: () => {
                    setBankMutations([]);
                    notify('Seluruh mutasi bank berhasil dibersihkan.');
                  }
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>Bersihkan Mutasi</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddMutModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Mutasi Bank</span>
          </button>
        </div>
      </div>

      {/* Filter Row 1: Bank Account Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedAccFilter('semua')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedAccFilter === 'semua'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Semua Rekening</span>
            <span
              className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                selectedAccFilter === 'semua' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cleanMutations.length}
            </span>
          </button>

          {bankAccounts.map((acc) => {
            const count = cleanMutations.filter((m) => getAccId(m) === acc.id).length;
            const isSelected = selectedAccFilter === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setSelectedAccFilter(acc.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{acc.name}</span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Row 2: Dropdown & Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Pilihan Rekening:</span>
            <select
              value={selectedAccFilter}
              onChange={(e) => setSelectedAccFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="semua">Semua Rekening (Konsolidasi)</option>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Filter Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('semua')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'semua'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({cleanMutations.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('belum')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'belum'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Belum Cocok ({cleanMutations.filter((m) => m.status !== 'Terekonsiliasi').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('terekonsiliasi')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'terekonsiliasi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Terekonsiliasi ({cleanMutations.filter((m) => m.status === 'Terekonsiliasi').length})
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        {currentAcc ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900">{currentAcc.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {currentAcc.type} ({currentAcc.currency}) · Kode Akun CoA: {currentAcc.code}
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Saldo Rekening Koran</span>
                <span className="num font-bold text-slate-900 text-sm">
                  {formatRupiah(currentAcc.balanceBank)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Saldo Buku Besar</span>
                <span className="num font-bold text-slate-900 text-sm">
                  {formatRupiah(currentAcc.balanceBook)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Status Rekonsiliasi</span>
                <span
                  className={`num font-bold text-xs ${
                    currentAcc.balanceBank === currentAcc.balanceBook ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {currentAcc.balanceBank === currentAcc.balanceBook
                    ? '✓ Saldo Klop'
                    : `⚠ Selisih ${formatRupiah(Math.abs(currentAcc.balanceBank - currentAcc.balanceBook))}`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Menampilkan mutasi seluruh rekening ({bankAccounts.length} rekening bank terdaftar)
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 font-medium">Total Saldo Bank</span>
                <span className="num font-bold text-slate-900 text-sm">{formatRupiah(totalBankBalance)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium">Total Mutasi</span>
                <span className="num font-bold text-blue-600 text-sm">
                  {displayedMutations.length} Mutasi
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pane 1: Mutasi Rekening Bank */}
      <div className="rounded-xl border border-[#DCE7F5] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Mutasi Rekening Bank ({displayedMutations.length})
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {unreconciledCount} belum cocok
          </span>
        </div>

        {displayedMutations.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={currentAcc ? `Tidak ada mutasi untuk ${currentAcc.name}` : 'Tidak ada mutasi yang perlu dicocokkan'}
            description={
              currentAcc
                ? `Rekening ${currentAcc.name} belum memiliki mutasi bank dengan filter status "${statusFilter}".`
                : 'Semua mutasi telah terekonsiliasi atau belum ada mutasi tercatat.'
            }
            action={
              <button
                type="button"
                onClick={() => {
                  if (currentAcc) setNewMutAccId(currentAcc.id);
                  setShowAddMutModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>{currentAcc ? `Tambah Mutasi ${currentAcc.name}` : 'Tambah Mutasi Manual'}</span>
              </button>
            }
          />
        ) : (
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {displayedMutations.map((mut) => {
              const isSelected = selectedMutation?.id === mut.id;
              const accName =
                mut.accountName || bankAccounts.find((a) => a.id === getAccId(mut))?.name || 'Bank BCA';

              return (
                <div
                  key={mut.id}
                  onClick={() => setSelectedMutationId(mut.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-2xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500/20'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                          {accName}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{mut.description}</div>
                      <div className="num text-[11px] text-slate-400 mt-0.5">{mut.date}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`num text-xs font-bold ${
                          mut.direction === 'CR' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {mut.direction === 'CR' ? '+' : '-'}
                        {formatRupiah(mut.amount)}
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-1.5">
                        <StatusBadge status={mut.status} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmAction({
                              title: 'Hapus Mutasi Bank',
                              message: `Hapus catatan mutasi "${mut.description}"?`,
                              confirmText: 'Hapus Mutasi',
                              cancelText: 'Batal',
                              isDanger: true,
                              onConfirm: () => {
                                setBankMutations((prev) => prev.filter((m) => m.id !== mut.id));
                                notify('Mutasi bank berhasil dihapus.');
                              }
                            });
                          }}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                          title="Hapus mutasi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {mut.matchedDoc ? (
                      <>
                        <span className="text-slate-500 text-[11px]">
                          Dicocokkan ke: <strong className="text-slate-700">{mut.matchedDoc}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnmatch(mut.id);
                          }}
                          className="text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
                        >
                          Batalkan
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-amber-600 text-[11px] font-medium">Belum dicocokkan</span>
                        <span className="text-blue-600 text-[11px] font-semibold">
                          Pilih transaksi di bawah &rarr;
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pane 2: Pencocokan Transaksi Pembukuan */}
      <div className="rounded-xl border border-[#DCE7F5] bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-sm font-bold text-slate-900">Pencocokan Transaksi Pembukuan</h2>
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder="Cari invoice/vendor..."
              className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {selectedMutation ? (
          <div>
            {/* Active Selected Mutation Summary */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Mutasi Terpilih</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedMutation.description}</div>
              </div>
              <div className="text-right">
                <div className="num text-sm font-bold text-slate-900">{formatRupiah(selectedMutation.amount)}</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {selectedMutation.direction === 'CR' ? 'Kredit Masuk' : 'Debit Keluar'}
                </span>
              </div>
            </div>

            {/* Ayat Silang Kas Internal Banner */}
            {isInternalTransfer && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900">
                      Transfer Kas / Bank Internal (Ayat Silang)
                    </div>
                    <div className="text-[11px] text-blue-700 mt-0.5">
                      Mutasi ini merupakan pemindahan dana internal antar rekening kas/bank perusahaan, bukan
                      pembayaran piutang penjualan ataupun pelunasan tagihan supplier.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={selectedMutation.status === 'Terekonsiliasi'}
                  onClick={() => handleReconcile(selectedMutation.id, 'Ayat Silang Kas/Bank')}
                  className="shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
                >
                  Klopkan Kas Silang
                </button>
              </div>
            )}

            {/* Candidate Tabs Bar & Match Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMatchingTab('smart');
                    setShowDirectBooking(false);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    matchingTab === 'smart' && !showDirectBooking
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Rekomendasi Cerdas ({exactMatchCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMatchingTab('all');
                    setShowDirectBooking(false);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    matchingTab === 'all' && !showDirectBooking
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Dokumen ({allLedgerDocs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowDirectBooking(!showDirectBooking)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    showDirectBooking
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Buat Pembukuan Baru Langsung</span>
                </button>
              </div>

              {exactMatchCount > 0 && !showDirectBooking && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>✓ Kecocokan 100% Ditemukan</span>
                </span>
              )}
            </div>

            {/* Direct Booking Inline Form */}
            {showDirectBooking && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 mb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Buat &amp; Klopkan Transaksi Baru untuk Mutasi Ini</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 num">
                    {formatRupiah(selectedMutation.amount)}
                  </span>
                </div>
                <form onSubmit={handleDirectBookingSubmit} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                        Kategori Transaksi
                      </label>
                      <select
                        value={directBookingCategory}
                        onChange={(e) => setDirectBookingCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Beban Operasional Bank">Beban Administrasi Bank</option>
                        <option value="Pendapatan Jasa Giro">Pendapatan Bunga / Jasa Giro</option>
                        <option value="Beban Operasional Pabrik">Beban Operasional Pabrik</option>
                        <option value="Beban Pengiriman &amp; Logistik">Beban Pengiriman / Kurir</option>
                        <option value="Beban Lain-lain">Beban Lain-lain</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Pihak / Payee</label>
                      <input
                        type="text"
                        value={directBookingPayee}
                        onChange={(e) => setDirectBookingPayee(e.target.value)}
                        placeholder="Contoh: Bank BCA / PT Logistik"
                        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Keterangan / Memo Pembukuan
                    </label>
                    <input
                      type="text"
                      value={directBookingMemo}
                      onChange={(e) => setDirectBookingMemo(e.target.value)}
                      placeholder={selectedMutation.description}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDirectBooking(false)}
                      className="rounded-xl border border-slate-200 bg-white text-xs py-1 px-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-3 font-semibold shadow-xs"
                    >
                      Simpan &amp; Klopkan Sekarang
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Candidate Documents List */}
            {candidateList.length === 0 ? (
              <EmptyState
                icon={FileCheck2}
                title="Belum ada transaksi pembukuan yang cocok"
                description="Buat faktur penjualan atau tagihan pembelian di menu Penjualan/Pembelian agar dapat dicocokkan dengan mutasi bank."
              />
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {candidateList.map((doc) => {
                  const amountMatch = Math.abs(doc.amount - selectedMutation.amount) < 100;
                  const dirMatch = doc.direction === selectedMutation.direction;
                  const isPerfectMatch = amountMatch && dirMatch;

                  return (
                    <div
                      key={doc.id}
                      className={`rounded-2xl border p-3.5 transition-all flex items-center justify-between gap-3 ${
                        isPerfectMatch
                          ? 'border-emerald-300 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/10'
                          : amountMatch
                          ? 'border-amber-300 bg-amber-50/30'
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="num font-bold text-xs text-blue-600 font-mono">{doc.number}</span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {doc.source}
                          </span>
                          {isPerfectMatch ? (
                            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1 shadow-2xs">
                              <CheckCheck className="h-3 w-3" />
                              <span>100% Cocok Sempurna</span>
                            </span>
                          ) : amountMatch ? (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                              Nominal Klop
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-slate-800 font-medium truncate mt-1">
                          {doc.party} · {doc.date}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="num text-xs font-bold text-slate-900">{formatRupiah(doc.amount)}</div>
                        <button
                          type="button"
                          disabled={selectedMutation.status === 'Terekonsiliasi'}
                          onClick={() => handleReconcile(selectedMutation.id, `${doc.number} (${doc.party})`)}
                          className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>Cocokkan</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="Pilih salah satu mutasi bank di sebelah kiri"
            description="Klik mutasi untuk melihat rekomendasi pencocokan dengan faktur atau beban pembukuan."
          />
        )}
      </div>

      {/* Modal 1: Catat Mutasi Bank Manual */}
      <Modal
        open={showAddMutModal}
        onClose={() => setShowAddMutModal(false)}
        title="Catat Mutasi Bank Manual"
        subtitle="Simpan data rekening koran ke sistem untuk rekonsiliasi"
      >
        <form onSubmit={handleAddMutationSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Rekening Bank Tujuan *</label>
            <select
              value={newMutAccId}
              onChange={(e) => setNewMutAccId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency}) - Saldo: {formatRupiah(a.balanceBank)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Arah Aliran Dana</label>
              <select
                value={newMutDirection}
                onChange={(e) => setNewMutDirection(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="CR">Kredit (+) Uang Masuk</option>
                <option value="DB">Debit (-) Uang Keluar</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Nominal (IDR) *</label>
              <input
                type="number"
                value={newMutAmount || ''}
                onChange={(e) => setNewMutAmount(Number(e.target.value))}
                placeholder="Contoh: 15000000"
                required
                min={1}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Keterangan / Berita Rekening Koran *
            </label>
            <input
              type="text"
              value={newMutDesc}
              onChange={(e) => setNewMutDesc(e.target.value)}
              placeholder="Contoh: TRSF CR DARI PT SINAR ABADI"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddMutModal(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Simpan Mutasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Fitur API Bank Otomatis (Notice) */}
      <Modal
        open={!!apiNotice}
        onClose={() => setApiNotice(null)}
        title="Fitur API Bank Otomatis"
        subtitle="Pemberitahuan Status Integrasi"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-3">
            <Lock className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="font-bold">Fitur Terkunci (Coming Soon)</div>
              <div className="mt-1 text-slate-600">{apiNotice}</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Pencocokan mutasi dan jurnal rekonsiliasi dapat dilakukan secara manual dan otomatis menggunakan data
            yang tersimpan di sistem.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setApiNotice(null)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
