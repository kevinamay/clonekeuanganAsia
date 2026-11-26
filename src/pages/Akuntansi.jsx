import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, formatDate } from '../utils/format';
import seedData from '../data/seed_data.json';
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Pencil,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  History,
  BookOpen,
  ShieldCheck,
  X,
  Calendar,
  FileText,
  Building,
  DollarSign
} from 'lucide-react';

export default function Akuntansi() {
  const {
    notify,
    confirmAction,
    coaAccounts,
    setCoaAccounts,
    journalEntries,
    setJournalEntries,
    fixedAssets,
    setFixedAssets,
    closingHistory,
    setClosingHistory,
    salesDocs = [],
    purchaseDocs = [],
    expenses = [],
    bankMutations = [],
    auditLogs = [],
    setAuditLogs
  } = useAppContext();

  const { user, authorizedRecord } = useAuth();

  // Active sub-tab: 'coa' | 'jurnal' | 'tutup-buku' | 'aset'
  const [activeTab, setActiveTab] = useState('coa');

  // Coa accounts & lists with safe fallbacks
  const coaList = useMemo(() => (Array.isArray(coaAccounts) ? coaAccounts : []), [coaAccounts]);
  const journalsList = useMemo(() => (Array.isArray(journalEntries) ? journalEntries : []), [journalEntries]);
  const assetsList = useMemo(() => (Array.isArray(fixedAssets) ? fixedAssets : []), [fixedAssets]);
  const closingList = useMemo(() => (Array.isArray(closingHistory) ? closingHistory : []), [closingHistory]);

  // Parameters for Tutup Buku
  const [closeType, setCloseType] = useState('Bulanan');
  const [periodName, setPeriodName] = useState('November 2026');
  const [cutOffDate, setCutOffDate] = useState('2026-11-30');
  const [lockedDate, setLockedDate] = useState('2026-11-30');
  const [taxRate, setTaxRate] = useState(22);
  const [isLocked, setIsLocked] = useState(true);

  // Modals visibility
  const [createJournalOpen, setCreateJournalOpen] = useState(false);
  const [createCoaOpen, setCreateCoaOpen] = useState(false);
  const [createAssetOpen, setCreateAssetOpen] = useState(false);
  const [editCoaTarget, setEditCoaTarget] = useState(null);
  const [editJournalTarget, setEditJournalTarget] = useState(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenTarget, setReopenTarget] = useState(null);
  const [reopenReason, setReopenReason] = useState('');
  const [deprModalOpen, setDeprModalOpen] = useState(false);

  // Create CoA Form State
  const [newCoaCode, setNewCoaCode] = useState('');
  const [newCoaName, setNewCoaName] = useState('');
  const [newCoaCategory, setNewCoaCategory] = useState('Beban');
  const [newCoaBalance, setNewCoaBalance] = useState(0);

  // Edit CoA Form State
  const [editCoaName, setEditCoaName] = useState('');
  const [editCoaCategory, setEditCoaCategory] = useState('Beban');
  const [editCoaBalance, setEditCoaBalance] = useState(0);

  // Create Journal Form State
  const [newJournalNumber, setNewJournalNumber] = useState('');
  const [newJournalDate, setNewJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [newJournalMemo, setNewJournalMemo] = useState('');
  const [newJournalLines, setNewJournalLines] = useState([
    { account: 'Kas Operasional', debit: 0, credit: 0 },
    { account: 'Modal Disetor Pemilik', debit: 0, credit: 0 }
  ]);

  // Edit Journal Form State
  const [editJournalMemo, setEditJournalMemo] = useState('');
  const [editJournalDate, setEditJournalDate] = useState('');
  const [editJournalLines, setEditJournalLines] = useState([]);

  // Create Fixed Asset Form State
  const [newAssetCode, setNewAssetCode] = useState('AST-003');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState('Mesin & Peralatan Pabrik');
  const [newAssetCost, setNewAssetCost] = useState(0);
  const [newAssetLifeYears, setNewAssetLifeYears] = useState(4);
  const [newAssetDate, setNewAssetDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAssetAccount, setNewAssetAccount] = useState('(1-10700) Aset Tetap - Mesin & Peralatan');
  const [newAssetCashAccount, setNewAssetCashAccount] = useState('(1-10001) Kas Operasional');

  // Depresiasi Modal Form State
  const [deprMethod, setDeprMethod] = useState('Garis Lurus (Straight-Line)');
  const [deprExpenseAccount, setDeprExpenseAccount] = useState('(6-60001) Beban Penyusutan Mesin');
  const [deprAccumAccount, setDeprAccumAccount] = useState('(1-10751) Akumulasi Penyusutan - Mesin');
  const [deprPeriodDate, setDeprPeriodDate] = useState('2026-11-30');

  // Tutup Buku Calculations
  const salesRevenue = useMemo(() => {
    return (Array.isArray(salesDocs) ? salesDocs : []).reduce((acc, s) => acc + (Number(s.paid || s.total || 0)), 0);
  }, [salesDocs]);

  const purchaseExpenses = useMemo(() => {
    return (Array.isArray(purchaseDocs) ? purchaseDocs : []).reduce((acc, p) => acc + (Number(p.paid || p.total || 0)), 0);
  }, [purchaseDocs]);

  const operatingExpenses = useMemo(() => {
    return (Array.isArray(expenses) ? expenses : []).reduce((acc, e) => acc + (Number(e.amount || 0)), 0);
  }, [expenses]);

  const operatingProfitEBT = salesRevenue - purchaseExpenses - operatingExpenses;
  const taxPPh29 = operatingProfitEBT > 0 ? Math.round((taxRate / 100) * operatingProfitEBT) : 0;
  const netRetainedEarnings = Math.max(0, operatingProfitEBT - taxPPh29);

  // Journal creation balance check
  const createDebitTotal = newJournalLines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const createCreditTotal = newJournalLines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
  const isCreateJournalBalanced = createDebitTotal > 0 && createDebitTotal === createCreditTotal;

  // Journal editing balance check
  const editDebitTotal = editJournalLines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const editCreditTotal = editJournalLines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
  const isEditJournalBalanced = editDebitTotal > 0 && editDebitTotal === editCreditTotal;

  // Audit Checklist items
  const unreviewedMutationsCount = bankMutations.filter((m) => m.status === 'Perlu Tinjau').length;
  const pendingPurchaseApprovalCount = purchaseDocs.filter((p) => p.status === 'Menunggu Approval').length;

  // Reset / Load Indonesian Standard CoA
  const handleLoadStandardCoA = () => {
    setCoaAccounts(seedData.j || []);
    notify('Bagan Akun standar SAK Indonesia berhasil dimuat ke sistem.');
  };

  // Open Create Journal Modal
  const handleOpenCreateJournal = () => {
    const nextNum = `JV-2026-${String(journalsList.length + 1).padStart(3, '0')}`;
    setNewJournalNumber(nextNum);
    setNewJournalDate(new Date().toISOString().split('T')[0]);
    setNewJournalMemo('');
    setNewJournalLines([
      { account: 'Kas Operasional', debit: 0, credit: 0 },
      { account: 'Modal Disetor Pemilik', debit: 0, credit: 0 }
    ]);
    setCreateJournalOpen(true);
  };

  // Submit Create Journal
  const handleCreateJournalSubmit = (e) => {
    e.preventDefault();
    if (!isCreateJournalBalanced) {
      notify('Jurnal tidak seimbang. Total Debit harus sama dengan Total Kredit.', 'error');
      return;
    }
    const newEntry = {
      id: `jv-${Date.now()}`,
      number: newJournalNumber,
      date: newJournalDate,
      memo: newJournalMemo.trim() || 'Jurnal Umum Penyesuaian',
      description: newJournalMemo.trim() || 'Jurnal Umum Penyesuaian',
      lines: newJournalLines.map((l) => ({
        account: l.account.trim(),
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0)
      })),
      debitTotal: createDebitTotal,
      creditTotal: createCreditTotal,
      status: 'Posted'
    };
    setJournalEntries([newEntry, ...journalsList]);
    notify(`Jurnal umum ${newEntry.number} berhasil dibukukan.`);
    setCreateJournalOpen(false);
  };

  // Submit Edit Journal
  const handleEditJournalSubmit = (e) => {
    e.preventDefault();
    if (!editJournalTarget) return;
    if (!isEditJournalBalanced) {
      notify('Jurnal tidak seimbang. Total Debit harus sama dengan Total Kredit.', 'error');
      return;
    }
    const updated = {
      ...editJournalTarget,
      memo: editJournalMemo.trim() || editJournalTarget.memo || 'Jurnal Umum',
      description: editJournalMemo.trim() || editJournalTarget.description,
      date: editJournalDate,
      lines: editJournalLines.map((l) => ({
        account: l.account.trim(),
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0)
      })),
      debitTotal: editDebitTotal,
      creditTotal: editCreditTotal
    };
    setJournalEntries(journalsList.map((j) => (j.id === editJournalTarget.id ? updated : j)));
    notify(`Jurnal ${editJournalTarget.number} berhasil diperbarui.`);
    setEditJournalTarget(null);
  };

  // Submit Create CoA
  const handleCreateCoaSubmit = (e) => {
    e.preventDefault();
    if (!newCoaCode.trim() || !newCoaName.trim()) return;
    const newAccount = {
      code: newCoaCode.trim(),
      name: newCoaName.trim(),
      category: newCoaCategory,
      balance: Number(newCoaBalance) || 0
    };
    setCoaAccounts([...coaList, newAccount]);
    setCreateCoaOpen(false);
    setNewCoaCode('');
    setNewCoaName('');
    setNewCoaBalance(0);
    notify(`Akun ${newAccount.code} - ${newAccount.name} berhasil disimpan.`);
  };

  // Submit Edit CoA
  const handleEditCoaSubmit = (e) => {
    e.preventDefault();
    if (!editCoaTarget || !editCoaName.trim()) return;
    const newBal = Number(editCoaBalance) || 0;
    setCoaAccounts(
      coaList.map((a) =>
        a.code === editCoaTarget.code
          ? { ...a, name: editCoaName.trim(), category: editCoaCategory, balance: newBal }
          : a
      )
    );
    notify(`Akun CoA ${editCoaTarget.code} (${editCoaName}) berhasil diperbarui menjadi ${formatRupiah(newBal)}.`);
    setEditCoaTarget(null);
  };

  // Submit Create Asset
  const handleCreateAssetSubmit = (e) => {
    e.preventDefault();
    if (!newAssetCode.trim() || !newAssetName.trim() || Number(newAssetCost) <= 0) {
      notify('Lengkapi seluruh data aset dengan valid.', 'error');
      return;
    }
    const cost = Number(newAssetCost);
    const lifeMonths = Number(newAssetLifeYears || 4) * 12;
    const monthlyDepr = Math.round(cost / lifeMonths);
    const newAsset = {
      id: `ast-${Date.now()}`,
      code: newAssetCode.trim(),
      name: newAssetName.trim(),
      category: newAssetCategory,
      acquiredDate: newAssetDate,
      cost,
      method: 'Garis Lurus (Straight-Line)',
      usefulLifeMonths: lifeMonths,
      depreciationMonthly: monthlyDepr,
      accumulated: 0,
      bookValue: cost,
      status: 'Aktif'
    };
    setFixedAssets([...assetsList, newAsset]);
    setCreateAssetOpen(false);
    setNewAssetCode(`AST-${String(assetsList.length + 2).padStart(3, '0')}`);
    setNewAssetName('');
    setNewAssetCost(0);
    notify(`Aset tetap ${newAsset.code} - ${newAsset.name} berhasil ditambahkan.`);
  };

  // Submit Depresiasi Bulanan
  const handlePostDepreciation = () => {
    const totalMonthlyDepr = assetsList.reduce((acc, a) => acc + (Number(a.depreciationMonthly) || 0), 0);
    if (totalMonthlyDepr <= 0) {
      notify('Tidak ada aset tetap aktif yang membutuhkan posting depresiasi.', 'warning');
      return;
    }
    const jvNumber = `JV-DEPR-${Date.now().toString().slice(-4)}`;
    const deprEntry = {
      id: `jv-${Date.now()}`,
      number: jvNumber,
      date: deprPeriodDate,
      memo: `Penyusutan Bulanan Aset Tetap Periode ${deprPeriodDate}`,
      description: `Beban penyusutan operasional ${assetsList.length} aset mesin & armada`,
      lines: [
        { account: deprExpenseAccount, debit: totalMonthlyDepr, credit: 0 },
        { account: deprAccumAccount, debit: 0, credit: totalMonthlyDepr }
      ],
      debitTotal: totalMonthlyDepr,
      creditTotal: totalMonthlyDepr,
      status: 'Posted'
    };
    setJournalEntries([deprEntry, ...journalsList]);
    setFixedAssets(
      assetsList.map((a) => {
        const addDepr = Number(a.depreciationMonthly) || 0;
        const newAccum = (Number(a.accumulated) || 0) + addDepr;
        const cost = Number(a.cost) || 0;
        return {
          ...a,
          accumulated: newAccum,
          bookValue: Math.max(0, cost - newAccum)
        };
      })
    );
    setDeprModalOpen(false);
    notify(`Depresiasi aset sebesar ${formatRupiah(totalMonthlyDepr)} berhasil diposting ke Jurnal (${jvNumber}).`);
  };

  // Execute Tutup Buku
  const handleExecuteTutupBuku = () => {
    const retainedAlloc = Math.max(0, operatingProfitEBT - taxPPh29);
    const closeVoucherNumber = `JV-CLOSE-${closeType === 'Tahunan' ? '2026-YEAR' : '2026-11'}`;

    const closingJournal = {
      id: `jv-close-${Date.now()}`,
      number: closeVoucherNumber,
      date: cutOffDate,
      memo: `Jurnal Penutup (${closeType}) Periode ${periodName} - Alokasi Laba Ditahan & Provisi PPh 29`,
      lines: [
        { account: '4-10100 Pendapatan Penjualan Produk Plastik', debit: salesRevenue, credit: 0 },
        { account: '5-10100 Beban Pokok Penjualan (HPP Bahan Baku)', debit: 0, credit: purchaseExpenses },
        { account: '6-10000 Beban Operasional, Listrik & Pabrik', debit: 0, credit: operatingExpenses },
        ...(taxPPh29 > 0 ? [{ account: '2-10400 Utang Pajak PPh Pasal 29 Badan', debit: 0, credit: taxPPh29 }] : []),
        { account: '3-20000 Laba Ditahan (Retained Earnings)', debit: 0, credit: retainedAlloc }
      ],
      debitTotal: salesRevenue,
      creditTotal: salesRevenue,
      status: 'Posted'
    };

    setJournalEntries([closingJournal, ...journalsList]);

    // Update retained earnings in CoA
    setCoaAccounts((prev) =>
      (Array.isArray(prev) ? prev : []).map((acc) =>
        acc.code === '3-20000' || acc.name.toLowerCase().includes('laba ditahan')
          ? { ...acc, balance: (acc.balance || 0) + retainedAlloc }
          : acc
      )
    );

    // Save closing history log
    const newClosingRecord = {
      id: `cls-${Date.now()}`,
      period: periodName,
      closedAt: `${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      closedBy: authorizedRecord?.name || user?.displayName || 'Carlos Susanto (Owner)',
      type: closeType,
      netIncome: operatingProfitEBT,
      pph29: taxPPh29,
      retainedEarningsAdded: retainedAlloc,
      closingJournalNumber: closeVoucherNumber,
      status: 'Terkunci'
    };

    setClosingHistory([newClosingRecord, ...closingList]);

    // Append audit log
    if (setAuditLogs) {
      setAuditLogs((prev) => [
        {
          time: 'Baru saja',
          user: authorizedRecord?.email || user?.email || 'Carlos Susanto',
          action: `TUTUP BUKU SUKSES: Periode ${periodName} (${closeType}) resmi ditutup. Jurnal penutup ${closeVoucherNumber} dibukukan. Laba Ditahan bertambah ${formatRupiah(retainedAlloc)}. Periode dikunci s/d ${cutOffDate}.`,
          module: 'Akuntansi'
        },
        ...(Array.isArray(prev) ? prev : [])
      ]);
    }

    setIsLocked(true);
    setLockedDate(cutOffDate);
    setCloseModalOpen(false);
    notify(`Tutup Buku ${periodName} berhasil dieksekusi & dibukukan.`);
  };

  // Re-Open Period
  const handleExecuteReopen = () => {
    if (!reopenTarget || !reopenReason.trim()) return;
    setClosingHistory(
      closingList.map((item) =>
        item.id === reopenTarget.id
          ? {
              ...item,
              status: 'Dibuka Kembali',
              reopenedAt: new Date().toISOString(),
              reopenedBy: authorizedRecord?.name || 'Carlos Susanto (Owner)',
              reopenReason: reopenReason.trim()
            }
          : item
      )
    );
    setIsLocked(false);
    if (setAuditLogs) {
      setAuditLogs((prev) => [
        {
          time: 'Baru saja',
          user: authorizedRecord?.email || 'Carlos Susanto',
          action: `RE-OPEN PERIODE: Tutup buku ${reopenTarget.period} dibuka kembali oleh Owner. Alasan: "${reopenReason.trim()}".`,
          module: 'Akuntansi'
        },
        ...(Array.isArray(prev) ? prev : [])
      ]);
    }
    setReopenModalOpen(false);
    setReopenTarget(null);
    setReopenReason('');
    notify(`Periode ${reopenTarget.period} berhasil dibuka kembali.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Akuntansi &amp; Tutup Buku
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Bagan akun (CoA), jurnal penyesuaian manual, saldo awal konversi, depresiasi aset tetap, dan tutup buku PPh 29.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('tutup-buku')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            <Lock className="h-4 w-4 text-blue-600" />
            <span>Tutup Buku &amp; Kunci</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateJournal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Buat Jurnal Umum</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('coa')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'coa'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Daftar Akun (CoA)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === 'coa' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {coaList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jurnal')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'jurnal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Jurnal Umum</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === 'jurnal' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {journalsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tutup-buku')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tutup-buku'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Tutup Buku &amp; Kunci Periode</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aset')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'aset'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Aset Tetap &amp; Depresiasi</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === 'aset' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {assetsList.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Chart of Accounts (CoA) */}
      {activeTab === 'coa' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Struktur Bagan Akun (Chart of Accounts)</h2>
              <p className="text-xs text-slate-400">Data master akun keuangan terdaftar di sistem</p>
            </div>
            <div className="flex items-center gap-2">
              {coaList.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadStandardCoA}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-600 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
                  <span>Muat Standar CoA Indonesia</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setCreateCoaOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Tambah Akun CoA</span>
              </button>
            </div>
          </div>

          {coaList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <p className="font-bold text-slate-700">Bagan Akun (CoA) masih kosong</p>
              <button
                type="button"
                onClick={handleLoadStandardCoA}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Muat Standar CoA Indonesia</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Kode Akun</th>
                    <th className="px-6 py-3.5">Nama Akun</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5 text-right">Saldo Saat Ini</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coaList.map((s) => (
                    <tr key={s.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-blue-600">{s.code}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {s.name}
                        {s.isContra && (
                          <span className="ml-2 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            Kontra
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{s.category}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(s.balance)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCoaTarget(s);
                              setEditCoaName(s.name);
                              setEditCoaCategory(s.category);
                              setEditCoaBalance(s.balance);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Ubah Saldo &amp; Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              confirmAction({
                                title: 'Hapus Akun CoA',
                                message: `Hapus akun CoA "${s.code} - ${s.name}" secara permanen?`,
                                confirmText: 'Hapus Akun',
                                cancelText: 'Batal',
                                isDanger: true,
                                onConfirm: () => {
                                  setCoaAccounts(coaList.filter((a) => a.code !== s.code));
                                  notify(`Akun ${s.code} - ${s.name} berhasil dihapus.`);
                                }
                              });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Hapus akun CoA"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Jurnal Umum */}
      {activeTab === 'jurnal' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Jurnal Umum &amp; Penyesuaian</h2>
              <p className="text-xs text-slate-400">Pencatatan debit-kredit manual yang telah dibukukan</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateJournal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Jurnal Baru</span>
            </button>
          </div>

          {journalsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <p className="font-bold text-slate-700">Belum ada entri jurnal umum manual</p>
              <button
                type="button"
                onClick={handleOpenCreateJournal}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Jurnal Pertama</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {journalsList.map((entry) => (
                <div key={entry.id} className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="text-blue-600">
                      {entry.number} · {entry.memo || entry.description}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-mono">{entry.date}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditJournalTarget(entry);
                          setEditJournalMemo(entry.memo || entry.description || '');
                          setEditJournalDate(entry.date || new Date().toISOString().split('T')[0]);
                          setEditJournalLines(
                            Array.isArray(entry.lines) && entry.lines.length > 0
                              ? entry.lines.map((l) => ({
                                  account: l.account || '',
                                  debit: Number(l.debit) || 0,
                                  credit: Number(l.credit) || 0
                                }))
                              : [
                                  { account: 'Kas Operasional', debit: 0, credit: 0 },
                                  { account: 'Modal Pemilik', debit: 0, credit: 0 }
                                ]
                          );
                        }}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        title="Edit jurnal umum"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          confirmAction({
                            title: 'Hapus Entri Jurnal',
                            message: `Hapus entri jurnal "${entry.number}" dari pembukuan?`,
                            confirmText: 'Hapus Jurnal',
                            cancelText: 'Batal',
                            isDanger: true,
                            onConfirm: () => {
                              setJournalEntries(journalsList.filter((j) => j.id !== entry.id));
                              notify(`Jurnal ${entry.number} berhasil dihapus.`);
                            }
                          });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                        title="Hapus jurnal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 space-y-1 text-xs">
                    {(entry.lines || []).map((line, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-slate-700">{line.account}</span>
                        <div className="space-x-4">
                          <span className="font-mono font-semibold text-slate-900">
                            Debit: {formatRupiah(line.debit)}
                          </span>
                          <span className="font-mono font-semibold text-slate-900">
                            Kredit: {formatRupiah(line.credit)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tutup Buku & Kunci Periode */}
      {activeTab === 'tutup-buku' && (
        <div className="space-y-6">
          {/* Main Status Banner Card */}
          <div className="rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Tutup Buku Akuntansi &amp; Kunci Periode Finansial
                    </h2>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        isLocked
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="h-3 w-3" />
                          <span>Terkunci s/d {lockedDate}</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3" />
                          <span>Periode Terbuka</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Proses penutupan buku resmi: menolkan akun nominal (pendapatan &amp; beban), mengalokasikan laba bersih ke akun{' '}
                    <strong>3-20000 (Laba Ditahan)</strong>, menghitung provisi PPh 29 Badan, dan mengunci transaksi dari modifikasi backdate.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLocked((prev) => !prev);
                    notify(
                      isLocked
                        ? 'Kunci periode dibuka sementara oleh pengguna.'
                        : 'Periode transaksi berhasil dikunci manual.'
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isLocked
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Unlock className="h-3.5 w-3.5 text-slate-500" />
                      <span>Buka Kunci Manual</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Kunci Periode Sekarang</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Eksekusi Tutup Buku Periode Ini</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Parameter Tutup Buku */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Parameter Tutup Buku &amp; Alokasi Laba/Rugi</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Perhitungan real-time dari seluruh pendapatan, HPP, dan beban operasional di sistem
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tipe Tutup Buku</label>
                  <select
                    value={closeType}
                    onChange={(e) => setCloseType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Bulanan">Tutup Buku Bulanan (Month-End)</option>
                    <option value="Tahunan">Tutup Buku Tahunan (Year-End Close)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Nama Periode</label>
                  <input
                    type="text"
                    value={periodName}
                    onChange={(e) => setPeriodName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Cut-Off</label>
                  <input
                    type="date"
                    value={cutOffDate}
                    onChange={(e) => setCutOffDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Pendapatan Penjualan Produk Plastik (Terbayar):</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(salesRevenue)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Beban Pokok Penjualan / Pembelian Resin (Terbayar):</span>
                  <span className="font-mono font-bold text-slate-900">({formatRupiah(purchaseExpenses)})</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Beban Operasional, Listrik &amp; Pabrik:</span>
                  <span className="font-mono font-bold text-slate-900">({formatRupiah(operatingExpenses)})</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                  <span className="text-slate-800">Laba Bersih Operasional Sebelum Pajak (EBT):</span>
                  <span className={`font-mono text-sm ${operatingProfitEBT >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatRupiah(operatingProfitEBT)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Tarif PPh Pasal 29 Badan (%):</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-center font-bold text-xs"
                    />
                  </div>
                  <span className="font-mono font-bold text-rose-600">{formatRupiah(taxPPh29)}</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Alokasi Laba Ditahan Bersih:</span>
                    <p className="text-[10px] text-slate-400">Akan ditransfer ke Akun 3-20000 (Laba Ditahan)</p>
                  </div>
                  <span className="font-mono font-bold text-base text-blue-600">
                    {formatRupiah(netRetainedEarnings)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Checklist Audit Pra-Tutup Buku */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Checklist Audit Pra-Tutup Buku</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Status kepatuhan 5 poin verifikasi sebelum pembukuan dikunci
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* 1. Rekonsiliasi Kas & Bank */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  {unreviewedMutationsCount === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">1. Rekonsiliasi Kas &amp; Bank</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {unreviewedMutationsCount === 0
                        ? 'Seluruh mutasi rekening cocok & terekonsiliasi.'
                        : `${unreviewedMutationsCount} mutasi bank masih berstatus 'Perlu Tinjau'.`}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      unreviewedMutationsCount === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {unreviewedMutationsCount === 0 ? 'Siap' : 'Tinjau'}
                  </span>
                </div>

                {/* 2. Faktur Penjualan & Piutang */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">2. Faktur Penjualan &amp; Piutang</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {salesDocs.length} faktur penjualan diverifikasi (Total {formatRupiah(salesRevenue)}).
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Siap
                  </span>
                </div>

                {/* 3. Pembelian Bahan Baku & Tagihan */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  {pendingPurchaseApprovalCount === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">3. Pembelian Bahan Baku &amp; Tagihan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {pendingPurchaseApprovalCount === 0
                        ? 'Tidak ada PO menggantung yang butuh approval.'
                        : `${pendingPurchaseApprovalCount} PO masih menunggu approval.`}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Siap
                  </span>
                </div>

                {/* 4. Depresiasi Aset & Beban Akrual */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">4. Depresiasi Aset &amp; Beban Akrual</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {assetsList.length} aset tetap mesin &amp; armada tercatat penyusutannya.
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Siap
                  </span>
                </div>

                {/* 5. Keseimbangan Neraca Saldo */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">5. Keseimbangan Neraca Saldo (Balance)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Total Debit sama dengan Total Kredit di seluruh akun buku besar.
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Seimbang
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Closing History Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <History className="h-4 w-4 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Riwayat Periode Tutup Buku (Closing Log Ledger)</h3>
                  <p className="text-xs text-slate-400">Catatan arsip periode yang telah ditutup dan status kunci pembukuan</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">{closingList.length} Periode Tercatat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Periode &amp; Tipe</th>
                    <th className="px-6 py-3.5">Waktu Eksekusi</th>
                    <th className="px-6 py-3.5">Eksekutor</th>
                    <th className="px-6 py-3.5 text-right">Laba Ditahan Ditransfer</th>
                    <th className="px-6 py-3.5">Jurnal Penutup</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {closingList.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{e.period}</div>
                        <div className="text-[11px] text-slate-400">Tutup Buku {e.type}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">{e.closedAt}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{e.closedBy}</td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-blue-600">
                        {formatRupiah(e.retainedEarningsAdded)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {e.closingJournalNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            e.status === 'Terkunci'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {e.status === 'Terkunci' ? (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Terkunci</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Dibuka Kembali</span>
                            </>
                          )}
                        </span>
                        {e.reopenedAt && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Dibuka: {e.reopenReason || 'Penyesuaian'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {e.status === 'Terkunci' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReopenTarget(e);
                              setReopenModalOpen(true);
                            }}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
                            title="Buka kembali periode ini untuk koreksi"
                          >
                            Buka Kembali
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Telah Dibuka</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Aset Tetap & Depresiasi */}
      {activeTab === 'aset' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Aset Tetap &amp; Nilai Buku</h2>
              <p className="text-xs text-slate-400">Pencatatan aset mesin, kendaraan, dan akumulasi penyusutan</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeprModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Hitung &amp; Posting Depresiasi Bulanan</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateAssetOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Aset Tetap</span>
              </button>
            </div>
          </div>

          {assetsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <p className="font-bold text-slate-700">Belum ada aset tetap tercatat</p>
              <button
                type="button"
                onClick={() => setCreateAssetOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Aset Pertama</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Kode</th>
                    <th className="px-6 py-3.5">Nama Aset</th>
                    <th className="px-6 py-3.5 text-right">Harga Perolehan</th>
                    <th className="px-6 py-3.5 text-right">Akumulasi Depresiasi</th>
                    <th className="px-6 py-3.5 text-right">Nilai Buku</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assetsList.map((s) => {
                    const cost = s.cost ?? s.acquisitionCost ?? 0;
                    const accum = s.accumulated ?? s.accumulatedDepreciation ?? 0;
                    const book = s.bookValue ?? Math.max(0, cost - accum);
                    return (
                      <tr key={s.id || s.code} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-blue-600">{s.code}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {s.category} · Perolehan: {s.acquiredDate || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(cost)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-600">
                          ({formatRupiah(accum)})
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                          {formatRupiah(book)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            {s.status || 'Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              confirmAction({
                                title: 'Hapus Aset Tetap',
                                message: `Hapus aset "${s.code} - ${s.name}" dari pembukuan?`,
                                confirmText: 'Hapus Aset',
                                cancelText: 'Batal',
                                isDanger: true,
                                onConfirm: () => {
                                  setFixedAssets(assetsList.filter((a) => a.code !== s.code));
                                  notify(`Aset ${s.name} berhasil dihapus.`);
                                }
                              });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Hapus aset tetap"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Modal 1: Buat Jurnal Umum Baru */}
      {createJournalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Buat Entri Jurnal Umum Baru</h3>
                <p className="text-[11px] text-slate-400">Catat transaksi manual secara berimbang (Debit = Kredit)</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateJournalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJournalSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Nomor Voucher</label>
                  <input
                    type="text"
                    value={newJournalNumber}
                    disabled
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700">Tanggal Jurnal *</label>
                  <input
                    type="date"
                    required
                    value={newJournalDate}
                    onChange={(e) => setNewJournalDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Keterangan / Memo Jurnal *</label>
                <input
                  type="text"
                  required
                  value={newJournalMemo}
                  onChange={(e) => setNewJournalMemo(e.target.value)}
                  placeholder="Contoh: Penyetoran modal awal atau penyesuaian..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Baris Akun Debit &amp; Kredit</label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewJournalLines([...newJournalLines, { account: '', debit: 0, credit: 0 }])
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    + Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {newJournalLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={line.account}
                        onChange={(e) => {
                          const updated = [...newJournalLines];
                          updated[idx].account = e.target.value;
                          setNewJournalLines(updated);
                        }}
                        placeholder="Nama / Kode Akun..."
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const updated = [...newJournalLines];
                          updated[idx].debit = Number(e.target.value);
                          setNewJournalLines(updated);
                        }}
                        placeholder="Debit"
                        className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const updated = [...newJournalLines];
                          updated[idx].credit = Number(e.target.value);
                          setNewJournalLines(updated);
                        }}
                        placeholder="Kredit"
                        className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      {newJournalLines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setNewJournalLines(newJournalLines.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 flex justify-between text-xs font-bold">
                <span>Total Debit: {formatRupiah(createDebitTotal)}</span>
                <span className={isCreateJournalBalanced ? 'text-emerald-700' : 'text-rose-600'}>
                  Total Kredit: {formatRupiah(createCreditTotal)}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateJournalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isCreateJournalBalanced}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Jurnal Umum */}
      {editJournalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Jurnal: {editJournalTarget.number}</h3>
                <p className="text-[11px] text-slate-400">Entri Debit dan Kredit harus berimbang sebelum disimpan</p>
              </div>
              <button
                type="button"
                onClick={() => setEditJournalTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditJournalSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Nomor Voucher</label>
                  <input
                    type="text"
                    value={editJournalTarget.number}
                    disabled
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700">Tanggal Jurnal *</label>
                  <input
                    type="date"
                    required
                    value={editJournalDate}
                    onChange={(e) => setEditJournalDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Keterangan / Memo Jurnal *</label>
                <input
                  type="text"
                  required
                  value={editJournalMemo}
                  onChange={(e) => setEditJournalMemo(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Baris Akun Debit &amp; Kredit</label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditJournalLines([...editJournalLines, { account: '', debit: 0, credit: 0 }])
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    + Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {editJournalLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={line.account}
                        onChange={(e) => {
                          const updated = [...editJournalLines];
                          updated[idx].account = e.target.value;
                          setEditJournalLines(updated);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const updated = [...editJournalLines];
                          updated[idx].debit = Number(e.target.value);
                          setEditJournalLines(updated);
                        }}
                        className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const updated = [...editJournalLines];
                          updated[idx].credit = Number(e.target.value);
                          setEditJournalLines(updated);
                        }}
                        className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      {editJournalLines.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditJournalLines(editJournalLines.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 flex justify-between text-xs font-bold">
                <span>Total Debit: {formatRupiah(editDebitTotal)}</span>
                <span className={isEditJournalBalanced ? 'text-emerald-700' : 'text-rose-600'}>
                  Total Kredit: {formatRupiah(editCreditTotal)}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditJournalTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isEditJournalBalanced}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Tambah Akun CoA Baru */}
      {createCoaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Akun CoA Baru</h3>
                <p className="text-[11px] text-slate-400">Simpan bagan akun ke dalam sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateCoaOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoaSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Kode Akun *</label>
                  <input
                    type="text"
                    required
                    value={newCoaCode}
                    onChange={(e) => setNewCoaCode(e.target.value)}
                    placeholder="Contoh: 6-60020"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Kategori</label>
                  <select
                    value={newCoaCategory}
                    onChange={(e) => setNewCoaCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Kas & Bank">Kas &amp; Bank</option>
                    <option value="Piutang">Piutang</option>
                    <option value="Persediaan">Persediaan</option>
                    <option value="Aset Tetap">Aset Tetap</option>
                    <option value="Liabilitas">Liabilitas</option>
                    <option value="Ekuitas">Ekuitas</option>
                    <option value="Pendapatan">Pendapatan</option>
                    <option value="HPP">HPP</option>
                    <option value="Beban">Beban</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Akun *</label>
                <input
                  type="text"
                  required
                  value={newCoaName}
                  onChange={(e) => setNewCoaName(e.target.value)}
                  placeholder="Contoh: Beban Pemeliharaan Mesin"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Saldo Awal (IDR)</label>
                <input
                  type="number"
                  value={newCoaBalance}
                  onChange={(e) => setNewCoaBalance(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateCoaOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  Simpan Akun CoA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Ubah Saldo & Detail CoA */}
      {editCoaTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ubah Saldo &amp; Detail: {editCoaTarget.name}</h3>
                <p className="text-[11px] text-slate-400">
                  Kode Akun: {editCoaTarget.code} · Kategori: {editCoaTarget.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditCoaTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditCoaSubmit} className="space-y-4 text-xs">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Saldo Akun (IDR) *</label>
                  <span className="text-xs font-bold text-blue-700 font-mono">
                    {formatRupiah(editCoaBalance || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  value={editCoaBalance ?? ''}
                  onChange={(e) => setEditCoaBalance(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Akun Buku Besar *</label>
                <input
                  type="text"
                  required
                  value={editCoaName}
                  onChange={(e) => setEditCoaName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Kategori Akun</label>
                <select
                  value={editCoaCategory}
                  onChange={(e) => setEditCoaCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Kas & Bank">Kas &amp; Bank</option>
                  <option value="Piutang">Piutang Usaha</option>
                  <option value="Persediaan">Persediaan</option>
                  <option value="Aset Tetap">Aset Tetap</option>
                  <option value="Liabilitas">Liabilitas / Kewajiban</option>
                  <option value="Ekuitas">Modal / Ekuitas</option>
                  <option value="Pendapatan">Pendapatan Usaha</option>
                  <option value="HPP">Beban Pokok Penjualan (HPP)</option>
                  <option value="Beban">Beban Operasional</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditCoaTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Konfirmasi Eksekusi Tutup Buku */}
      {closeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Konfirmasi Tutup Buku &amp; Kunci Transaksi</h3>
                  <p className="text-[11px] text-slate-400">Periode: {periodName} ({closeType})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 space-y-2">
                <p className="font-semibold text-slate-800">
                  Sistem akan menerbitkan bukti jurnal umum penutup dan memposting perubahan saldo akun berikut:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 font-mono text-[11px]">
                  <li>
                    Mendebit Ikhtisar Laba Rugi / Penjualan: <strong>{formatRupiah(salesRevenue)}</strong>
                  </li>
                  <li>
                    Mengkredit Beban Pokok &amp; Beban Operasional:{' '}
                    <strong>{formatRupiah(purchaseExpenses + operatingExpenses)}</strong>
                  </li>
                  {taxPPh29 > 0 && (
                    <li>
                      Mengkredit Utang Pajak PPh 29 Badan: <strong>{formatRupiah(taxPPh29)}</strong>
                    </li>
                  )}
                  <li>
                    Mentransfer Laba Ditahan Bersih ke Akun 3-20000:{' '}
                    <strong>{formatRupiah(netRetainedEarnings)}</strong>
                  </li>
                  <li>
                    Mengunci transaksi s/d tanggal <strong>{cutOffDate}</strong>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Setelah ditutup, transaksi di periode ini tidak dapat diubah atau dihapus tanpa izin pembukaan kembali oleh Akun Owner.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteTutupBuku}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Ya, Eksekusi Tutup Buku</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Buka Kembali Periode Tutup Buku */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Buka Kembali Periode Tutup Buku (Re-Open)</h3>
                <p className="text-[11px] text-slate-400">
                  Periode: {reopenTarget ? reopenTarget.period : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReopenModalOpen(false);
                  setReopenTarget(null);
                  setReopenReason('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Peringatan Keamanan Pembukuan</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  Membuka kembali periode tutup buku memungkinkan pengguna mengedit dokumen di masa lalu. Tindakan ini hanya boleh dilakukan untuk penyesuaian khusus auditor dan akan dicatat secara permanen di Jejak Audit (Audit Trail).
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Alasan Pembukaan Kembali Periode * (Wajib)</label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Contoh: Koreksi faktur pajak retur dari Kantor Akuntan Publik / penyesuaian saldo bank..."
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setReopenModalOpen(false);
                    setReopenTarget(null);
                    setReopenReason('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!reopenReason.trim()}
                  onClick={handleExecuteReopen}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Buka Kembali Periode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 7: Tambah Aset Tetap Baru */}
      {createAssetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Aset Tetap Baru</h3>
                <p className="text-[11px] text-slate-400">Pencatatan aktiva tetap modal perusahaan</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateAssetOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssetSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Kode Aset *</label>
                  <input
                    type="text"
                    required
                    value={newAssetCode}
                    onChange={(e) => setNewAssetCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Kategori Aset</label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Mesin & Peralatan Pabrik">Mesin &amp; Peralatan Pabrik</option>
                    <option value="Kendaraan Operasional">Kendaraan Operasional</option>
                    <option value="Bangunan & Pabrik">Bangunan &amp; Pabrik</option>
                    <option value="Peralatan Kantor & Komputer">Peralatan Kantor &amp; Komputer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Aset *</label>
                <input
                  type="text"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="Contoh: Mesin Injection Molding 150 Ton"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Harga Perolehan (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={newAssetCost || ''}
                    onChange={(e) => setNewAssetCost(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Masa Manfaat (Tahun)</label>
                  <input
                    type="number"
                    value={newAssetLifeYears}
                    onChange={(e) => setNewAssetLifeYears(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tanggal Perolehan</label>
                <input
                  type="date"
                  value={newAssetDate}
                  onChange={(e) => setNewAssetDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateAssetOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  Simpan Aset Tetap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 8: Hitung & Posting Depresiasi Bulanan */}
      {deprModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hitung &amp; Posting Depresiasi Aset Tetap</h3>
                  <p className="text-[11px] text-slate-400">Otomasi jurnal penyusutan bulanan metode garis lurus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeprModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Jumlah Aset Aktif:</span>
                  <span className="font-bold text-slate-900">{assetsList.length} Aset</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Harga Perolehan:</span>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(assetsList.reduce((acc, a) => acc + (Number(a.cost) || 0), 0))}
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center font-bold text-blue-900">
                  <span>Estimasi Beban Penyusutan Bulan Ini:</span>
                  <span className="font-mono text-sm text-blue-700">
                    {formatRupiah(
                      assetsList.reduce((acc, a) => acc + (Number(a.depreciationMonthly) || 0), 0)
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tanggal Posting Jurnal</label>
                <input
                  type="date"
                  value={deprPeriodDate}
                  onChange={(e) => setDeprPeriodDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeprModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handlePostDepreciation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Posting Jurnal Depresiasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
