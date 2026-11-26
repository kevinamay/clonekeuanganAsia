import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import {
  Lock,
  ArrowLeftRight,
  Plus,
  ArrowUpRight,
  Check,
  CreditCard,
  Trash2,
  PenLine,
  FileText
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

function StatCard({ label, value, subtext, tone = 'neutral' }) {
  return (
    <div className="rounded-xl border border-[#DCE7F5] bg-white px-5 py-4 shadow-2xs">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

function TabBar({ items, active, onChange }) {
  return (
    <div className="mb-5 flex items-center gap-1 overflow-x-auto border-b border-[#DCE7F5]">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'text-[#0369A1]' : 'text-[#586E89] hover:text-[#0B192C]'
            }`}
          >
            <span className="flex items-center gap-2">
              {item.label}
              {typeof item.count === 'number' && (
                <span
                  className={`num rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive ? 'bg-[#E0F2FE] text-[#0369A1]' : 'bg-[#EDF4FC] text-[#586E89]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </span>
            {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0284C7]" />}
          </button>
        );
      })}
    </div>
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

export default function KasBank() {
  const {
    notify,
    confirmAction,
    bankAccounts = [],
    setBankAccounts,
    bankMutations = [],
    setBankMutations,
    bankRules = [],
    setBankRules,
    giroDocs = [],
    setGiroDocs,
    salesDocs = [],
    purchaseDocs = []
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('akun');

  // Modal visibility states
  const [apiLockMsg, setApiLockMsg] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showReceiveSend, setShowReceiveSend] = useState(false);
  const [showGiroModal, setShowGiroModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Form states: Tambah Rekening
  const [newAccCode, setNewAccCode] = useState('1-10103');
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('Bank');
  const [newAccCurrency, setNewAccCurrency] = useState('IDR');
  const [newAccInitialBalance, setNewAccInitialBalance] = useState(0);

  // Form states: Transfer Uang
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferMemo, setTransferMemo] = useState('');

  // Form states: Terima / Kirim Uang
  const [txType, setTxType] = useState('in'); // 'in' or 'out'
  const [txAccount, setTxAccount] = useState('');
  const [txAmount, setTxAmount] = useState(0);
  const [txDesc, setTxDesc] = useState('');

  // Form states: Catat Giro
  const [giroNo, setGiroNo] = useState('');
  const [giroParty, setGiroParty] = useState('');
  const [giroAmount, setGiroAmount] = useState(0);
  const [giroDueDate, setGiroDueDate] = useState('2026-11-28');
  const [giroType, setGiroType] = useState('Masuk');

  // Form states: Aturan Rekonsiliasi
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleCondition, setRuleCondition] = useState('');
  const [ruleTargetAccount, setRuleTargetAccount] = useState('');
  const [ruleActive, setRuleActive] = useState(true);

  // Totals & KPI metrics
  const totalSaldo = bankAccounts.reduce(
    (acc, b) => acc + (b.currency === 'IDR' ? b.balanceBank : 15720 * b.balanceBank),
    0
  );
  const creditCardBalance = bankAccounts
    .filter((b) => b.type === 'Kartu Kredit')
    .reduce((acc, b) => acc + b.balanceBank, 0);

  const incoming30Days = salesDocs
    .filter((s) => s.status !== 'Lunas')
    .reduce((acc, s) => acc + Math.max(0, (s.total || 0) - (s.paid || 0)), 0);

  const outgoing30Days = purchaseDocs
    .filter((p) => p.status !== 'Lunas')
    .reduce((acc, p) => acc + Math.max(0, (p.total || 0) - (p.paid || 0)), 0);

  // Handlers
  const handleAddAccountSubmit = (e) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const newAcc = {
      id: `acc-${Date.now()}`,
      code: newAccCode.trim() || `1-1010${bankAccounts.length + 1}`,
      name: newAccName.trim(),
      type: newAccType,
      currency: newAccCurrency,
      cashlink: false,
      bankLabel: newAccName.trim(),
      balanceBank: Number(newAccInitialBalance) || 0,
      balanceBook: Number(newAccInitialBalance) || 0,
      unreconciledCount: 0,
      lastSync: 'Manual'
    };
    setBankAccounts([newAcc, ...bankAccounts]);
    setShowAddAccount(false);
    setNewAccName('');
    setNewAccInitialBalance(0);
    notify(`Akun ${newAcc.name} berhasil ditambahkan ke sistem.`);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || transferAmount <= 0) {
      notify('Pilih rekening asal, rekening tujuan, dan nominal transfer.', 'error');
      return;
    }
    if (transferFrom === transferTo) {
      notify('Rekening asal dan tujuan tidak boleh sama.', 'error');
      return;
    }
    const sourceAcc = bankAccounts.find((b) => b.id === transferFrom);
    const destAcc = bankAccounts.find((b) => b.id === transferTo);
    if (!sourceAcc || sourceAcc.balanceBank < transferAmount) {
      notify('Saldo rekening asal tidak mencukupi untuk transfer.', 'error');
      return;
    }

    setBankAccounts((prev) =>
      prev.map((b) => {
        if (b.id === transferFrom) {
          return {
            ...b,
            balanceBank: b.balanceBank - transferAmount,
            balanceBook: b.balanceBook - transferAmount
          };
        }
        if (b.id === transferTo) {
          return {
            ...b,
            balanceBank: b.balanceBank + transferAmount,
            balanceBook: b.balanceBook + transferAmount
          };
        }
        return b;
      })
    );

    const nowIso = new Date().toISOString().split('T')[0];
    const outMut = {
      id: `mut-${Date.now()}-1`,
      date: nowIso,
      description: `Transfer keluar ke ${destAcc?.name}: ${transferMemo || 'Pemindahan dana'}`,
      amount: transferAmount,
      direction: 'DB',
      status: 'Terekonsiliasi',
      matchedDoc: 'Transfer Internal'
    };
    const inMut = {
      id: `mut-${Date.now()}-2`,
      date: nowIso,
      description: `Transfer masuk dari ${sourceAcc.name}: ${transferMemo || 'Pemindahan dana'}`,
      amount: transferAmount,
      direction: 'CR',
      status: 'Terekonsiliasi',
      matchedDoc: 'Transfer Internal'
    };
    setBankMutations([outMut, inMut, ...bankMutations]);

    setShowTransfer(false);
    setTransferAmount(0);
    setTransferMemo('');
    notify('Transfer antar rekening berhasil dibukukan secara otomatis.');
  };

  const handleReceiveSendSubmit = (e) => {
    e.preventDefault();
    if (!txAccount || txAmount <= 0) {
      notify('Pilih rekening dan isi nominal.', 'error');
      return;
    }
    const targetAcc = bankAccounts.find((b) => b.id === txAccount);
    if (!targetAcc) return;
    if (txType === 'out' && targetAcc.balanceBank < txAmount) {
      notify('Saldo rekening tidak mencukupi untuk pengeluaran ini.', 'error');
      return;
    }

    const delta = txType === 'in' ? txAmount : -txAmount;
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === txAccount
          ? {
              ...b,
              balanceBank: b.balanceBank + delta,
              balanceBook: b.balanceBook + delta
            }
          : b
      )
    );

    const newMutation = {
      id: `mut-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `${txType === 'in' ? 'Penerimaan' : 'Pengeluaran'} Non-Invoice: ${
        txDesc || 'Transaksi manual'
      }`,
      amount: txAmount,
      direction: txType === 'in' ? 'CR' : 'DB',
      status: 'Terekonsiliasi'
    };
    setBankMutations([newMutation, ...bankMutations]);

    setShowReceiveSend(false);
    setTxAmount(0);
    setTxDesc('');
    notify(
      `${txType === 'in' ? 'Penerimaan' : 'Pengeluaran'} sebesar ${formatRupiah(
        txAmount
      )} berhasil dicatat.`
    );
  };

  const handleGiroSubmit = (e) => {
    e.preventDefault();
    if (!giroNo.trim() || giroAmount <= 0) return;
    const newGiro = {
      id: `gr-${Date.now()}`,
      no: giroNo.trim(),
      party: giroParty.trim() || 'Mitra Bisnis',
      doc: `BG-${Date.now().toString().slice(-4)}`,
      dueDate: giroDueDate,
      amount: Number(giroAmount),
      type: giroType,
      status: 'Belum Cair'
    };
    setGiroDocs([newGiro, ...giroDocs]);
    setShowGiroModal(false);
    setGiroNo('');
    setGiroParty('');
    setGiroAmount(0);
    notify(`Cek / Giro ${newGiro.no} berhasil disimpan.`);
  };

  const handleRuleSubmit = (e) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      notify('Nama aturan wajib diisi.', 'error');
      return;
    }
    if (editingRuleId) {
      setBankRules(
        bankRules.map((r) =>
          r.id === editingRuleId
            ? {
                ...r,
                name: ruleName.trim(),
                condition: ruleCondition.trim(),
                targetAccount: ruleTargetAccount.trim(),
                active: ruleActive
              }
            : r
        )
      );
      notify(`Aturan "${ruleName.trim()}" berhasil diperbarui.`);
    } else {
      const newRule = {
        id: `rule-${Date.now()}`,
        name: ruleName.trim(),
        condition: ruleCondition.trim(),
        targetAccount: ruleTargetAccount.trim(),
        active: ruleActive
      };
      setBankRules([...bankRules, newRule]);
      notify(`Aturan baru "${newRule.name}" berhasil ditambahkan.`);
    }
    setShowRuleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Kas &amp; Bank</h1>
          <p className="mt-1 text-xs text-slate-500">
            Saldo real-time rekening bank, kas kecil, kartu kredit korporat, mutasi, serta pencatatan giro mundur.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setApiLockMsg(
                'Integrasi API CashLink Bank Mandiri & BCA memerlukan kredensial sandbox perbankan Open Banking (SNAP BI). Fitur integrasi API langsung sedang disiapkan.'
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>CashLink Bank API</span>
            <span className="rounded-md bg-amber-50 text-[10px] font-bold text-amber-700 px-1.5 py-0.5 border border-amber-200">
              Coming Soon
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowTransfer(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4 text-blue-600" />
            <span>Transfer Uang</span>
          </button>
          <button
            type="button"
            onClick={() => setShowReceiveSend(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Terima / Kirim Uang</span>
          </button>
        </div>
      </div>

      {/* 4 Summary / KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Saldo Kas & Bank"
          value={formatRupiah(totalSaldo)}
          subtext={
            bankAccounts.length > 0
              ? `${bankAccounts.length} rekening aktif di sistem`
              : 'Belum ada rekening terdaftar'
          }
          tone="sky"
        />
        <StatCard
          label="Saldo Kartu Kredit Korporat"
          value={formatRupiah(creditCardBalance)}
          subtext={creditCardBalance < 0 ? 'Tagihan berjalan' : 'Tidak ada tagihan kredit'}
          tone={creditCardBalance < 0 ? 'warning' : 'neutral'}
        />
        <StatCard
          label="Pemasukan 30 Hari Mendatang"
          value={formatRupiah(incoming30Days)}
          subtext={
            incoming30Days > 0
              ? `Dari ${salesDocs.filter((e) => 'Lunas' !== e.status).length} piutang belum lunas`
              : 'Tidak ada piutang aktif'
          }
          tone="positive"
        />
        <StatCard
          label="Pengeluaran 30 Hari Mendatang"
          value={formatRupiah(outgoing30Days)}
          subtext={
            outgoing30Days > 0
              ? `Dari ${purchaseDocs.filter((e) => 'Lunas' !== e.status).length} tagihan belum dibayar`
              : 'Tidak ada utang aktif'
          }
          tone="neutral"
        />
      </div>

      {/* Navigation Tabs */}
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'akun', label: 'Daftar Akun Kas & Bank', count: bankAccounts.length },
          {
            id: 'rekonsiliasi',
            label: 'Mutasi Bank',
            count: bankMutations.filter((e) => 'Terekonsiliasi' !== e.status).length
          },
          { id: 'aturan', label: 'Peraturan Rekonsiliasi', count: bankRules.length },
          {
            id: 'giro',
            label: 'Cek & Giro Mundur',
            count: giroDocs.filter((e) => 'Belum Cair' === e.status).length
          }
        ]}
      />

      {/* Tab Content: Daftar Akun Kas & Bank */}
      {activeTab === 'akun' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Rekening Kas &amp; Bank Terdaftar</h2>
              <p className="text-xs text-slate-400">Data tersimpan dan tersinkronisasi otomatis di sistem</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddAccount(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Akun Baru</span>
              </button>
            </div>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="Belum ada rekening kas atau bank"
                description="Tambahkan rekening bank operasional, kas kecil, atau rekening valas untuk mulai mencatat transaksi."
                action={
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Rekening Pertama</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Kode</th>
                    <th className="px-6 py-3.5">Nama Akun</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Saldo Rekening</th>
                    <th className="px-6 py-3.5 text-right">Saldo Pembukuan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bankAccounts.map((acc) => {
                    const formatMoney = (val) =>
                      acc.currency === 'USD'
                        ? `$ ${Number(val).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                        : formatRupiah(val);
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="num px-6 py-4 text-xs font-semibold text-slate-500 font-mono">
                          {acc.code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{acc.name}</div>
                          <div className="text-[11px] text-slate-400">Sinkron: {acc.lastSync}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          {acc.type} ({acc.currency})
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={acc.cashlink ? 'Terhubung API' : 'Manual / Sistem'} />
                        </td>
                        <td className="num px-6 py-4 text-right font-semibold text-slate-900">
                          {formatMoney(acc.balanceBank)}
                        </td>
                        <td className="num px-6 py-4 text-right font-bold text-slate-900">
                          {formatMoney(acc.balanceBook)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/rekonsiliasi"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <span>Rekonsiliasi</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
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

      {/* Tab Content: Mutasi Bank */}
      {activeTab === 'rekonsiliasi' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mutasi Rekening Bank</h2>
              <p className="text-xs text-slate-400">Daftar pergerakan debit/kredit yang tercatat</p>
            </div>
            <Link
              to="/rekonsiliasi"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <span>Buka Layar Pencocokan Rekonsiliasi</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {bankMutations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="Belum ada mutasi tercatat"
                description="Mutasi akan otomatis bertambah saat Anda melakukan transfer antar rekening atau mencatat penerimaan/pengeluaran uang."
                action={
                  <button
                    type="button"
                    onClick={() => setShowReceiveSend(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Catat Mutasi Pertama</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5">Deskripsi</th>
                    <th className="px-6 py-3.5">Arah</th>
                    <th className="px-6 py-3.5 text-right">Nominal</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bankMutations.map((mut) => (
                    <tr key={mut.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="num px-6 py-4 text-xs font-semibold text-slate-500 font-mono">
                        {mut.date}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{mut.description}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            mut.direction === 'CR'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {mut.direction === 'CR' ? 'KREDIT (+)' : 'DEBIT (-)'}
                        </span>
                      </td>
                      <td className="num px-6 py-4 text-right font-bold text-slate-900">
                        {formatRupiah(mut.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={mut.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Peraturan Rekonsiliasi */}
      {activeTab === 'aturan' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Aturan Penjurnalan Mutasi Berulang</h2>
              <p className="text-xs text-slate-400">
                Otomatis mencocokkan mutasi rutin seperti biaya admin bank atau bunga jasa giro
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRuleId(null);
                setRuleName('');
                setRuleCondition("Deskripsi mengandung 'BIAYA ADM'");
                setRuleTargetAccount('6-60012 Beban Administrasi Bank');
                setRuleActive(true);
                setShowRuleModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Aturan</span>
            </button>
          </div>

          {bankRules.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={FileText}
                title="Belum ada aturan rekonsiliasi aktif"
                description="Tambahkan aturan pencocokan otomatis untuk transaksi bank rutin bulanan."
              />
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {bankRules.map((rule) => (
                <div
                  key={rule.id}
                  className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rule.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          rule.active !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {rule.active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1 flex items-center gap-2">
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 font-mono">
                        {rule.condition}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Akun Sasaran:</div>
                      <span className="font-semibold text-blue-600">{rule.targetAccount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRuleId(rule.id);
                          setRuleName(rule.name || '');
                          setRuleCondition(rule.condition || '');
                          setRuleTargetAccount(rule.targetAccount || '');
                          setRuleActive(rule.active ?? true);
                          setShowRuleModal(true);
                        }}
                        className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-[11px] font-semibold transition-colors"
                        title="Edit Aturan"
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          confirmAction({
                            title: 'Hapus Aturan Rekonsiliasi',
                            message: `Hapus aturan rekonsiliasi otomatis "${rule.name}"?`,
                            confirmText: 'Hapus Aturan',
                            cancelText: 'Batal',
                            isDanger: true,
                            onConfirm: () => {
                              setBankRules(bankRules.filter((r) => r.id !== rule.id));
                              notify(`Aturan "${rule.name}" berhasil dihapus.`);
                            }
                          });
                        }}
                        className="h-8 px-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 text-[11px] font-semibold transition-colors"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Cek & Giro Mundur */}
      {activeTab === 'giro' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pencatatan Cek &amp; Bilyet Giro Mundur</h2>
              <p className="text-xs text-slate-400">
                Kelola tanggal jatuh tempo pencairan cek dari mitra bisnis
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGiroModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Catat Cek / Giro Baru</span>
            </button>
          </div>

          {giroDocs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="Tidak ada cek atau giro aktif"
                description="Catat pembayaran giro masuk dari pelanggan atau giro keluar ke pemasok."
                action={
                  <button
                    type="button"
                    onClick={() => setShowGiroModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Catat Giro Pertama</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Nomor Giro</th>
                    <th className="px-6 py-3.5">Pihak / Mitra</th>
                    <th className="px-6 py-3.5">Jatuh Tempo</th>
                    <th className="px-6 py-3.5 text-right">Nominal</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {giroDocs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="num px-6 py-4 text-xs font-bold text-blue-600 font-mono">
                        {item.no}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.party}</td>
                      <td className="num px-6 py-4 text-xs text-slate-600 font-mono">{item.dueDate}</td>
                      <td className="num px-6 py-4 text-right font-bold text-slate-900">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === 'Belum Cair' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const targetGiro = giroDocs.find((g) => g.id === item.id);
                                if (targetGiro) {
                                  if (bankAccounts.length > 0) {
                                    const firstAcc = bankAccounts[0];
                                    const diff =
                                      targetGiro.type === 'Masuk'
                                        ? targetGiro.amount
                                        : -targetGiro.amount;
                                    setBankAccounts((prev) =>
                                      prev.map((acc) =>
                                        acc.id === firstAcc.id
                                          ? {
                                              ...acc,
                                              balanceBank: acc.balanceBank + diff,
                                              balanceBook: acc.balanceBook + diff
                                            }
                                          : acc
                                      )
                                    );
                                  }
                                  setGiroDocs((prev) =>
                                    prev.map((g) => (g.id === item.id ? { ...g, status: 'Cair' } : g))
                                  );
                                  notify(
                                    `Giro ${targetGiro.no} dicairkan dan saldo rekening telah diperbarui.`
                                  );
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                            >
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Cairkan Giro</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600">Selesai</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              confirmAction({
                                title: 'Hapus Rekaman Giro',
                                message: `Hapus cek/giro "${item.no}" dari daftar pemantauan?`,
                                confirmText: 'Hapus Giro',
                                cancelText: 'Batal',
                                isDanger: true,
                                onConfirm: () => {
                                  setGiroDocs((prev) => prev.filter((g) => g.id !== item.id));
                                  notify(`Giro ${item.no} berhasil dihapus.`);
                                }
                              });
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Hapus giro"
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

      {/* Modal 1: Tambah Rekening Kas / Bank Baru */}
      <Modal
        open={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        title="Tambah Rekening Kas / Bank Baru"
        subtitle="Simpan rekening baru langsung ke dalam sistem"
      >
        <form onSubmit={handleAddAccountSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Kode Akun CoA</label>
            <input
              type="text"
              value={newAccCode}
              onChange={(e) => setNewAccCode(e.target.value)}
              placeholder="Contoh: 1-10103"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Nama Rekening / Bank *</label>
            <input
              type="text"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              placeholder="Contoh: Bank BCA Operasional / Kas Kecil Kantor"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Kategori</label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="Bank">Bank</option>
                <option value="Kas">Kas Tunai / Kas Kecil</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Mata Uang</label>
              <select
                value={newAccCurrency}
                onChange={(e) => setNewAccCurrency(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dollar AS)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Saldo Awal</label>
            <input
              type="number"
              value={newAccInitialBalance || ''}
              onChange={(e) => setNewAccInitialBalance(Number(e.target.value))}
              placeholder="0"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddAccount(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Simpan Rekening
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Transfer Uang Antar Rekening */}
      <Modal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        title="Transfer Uang Antar Rekening"
        subtitle="Pindahkan saldo antar akun kas atau bank yang terdaftar"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Dari Rekening Asal *</label>
            <select
              value={transferFrom}
              onChange={(e) => setTransferFrom(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Rekening Asal --</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo: {formatRupiah(acc.balanceBank)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Ke Rekening Tujuan *</label>
            <select
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Rekening Tujuan --</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo: {formatRupiah(acc.balanceBank)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Nominal Transfer (IDR) *</label>
            <input
              type="number"
              value={transferAmount || ''}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
              placeholder="Contoh: 10000000"
              required
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Catatan / Memo Internal</label>
            <input
              type="text"
              value={transferMemo}
              onChange={(e) => setTransferMemo(e.target.value)}
              placeholder="Contoh: Top-up Kas Operasional Pabrik"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowTransfer(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Eksekusi Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Pencatatan Terima / Kirim Uang */}
      <Modal
        open={showReceiveSend}
        onClose={() => setShowReceiveSend(false)}
        title="Pencatatan Terima / Kirim Uang"
        subtitle="Catat modal, prive, penerimaan lain, atau pengeluaran operasional non-invoice"
      >
        <form onSubmit={handleReceiveSendSubmit} className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTxType('in')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                txType === 'in' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Terima Uang (Masuk)
            </button>
            <button
              type="button"
              onClick={() => setTxType('out')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                txType === 'out' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Kirim Uang (Keluar)
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Rekening Kas / Bank *</label>
            <select
              value={txAccount}
              onChange={(e) => setTxAccount(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Rekening --</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo: {formatRupiah(acc.balanceBank)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Nominal (IDR) *</label>
            <input
              type="number"
              value={txAmount || ''}
              onChange={(e) => setTxAmount(Number(e.target.value))}
              placeholder="Contoh: 5000000"
              required
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Deskripsi Transaksi</label>
            <input
              type="text"
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              placeholder="Contoh: Setoran modal pemilik / Pembayaran retribusi"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReceiveSend(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Catat Cek / Giro Baru */}
      <Modal
        open={showGiroModal}
        onClose={() => setShowGiroModal(false)}
        title="Catat Cek / Giro Baru"
        subtitle="Tambahkan bilyet giro yang belum jatuh tempo"
      >
        <form onSubmit={handleGiroSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Tipe Giro</label>
              <select
                value={giroType}
                onChange={(e) => setGiroType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="Masuk">Giro Masuk (Penerimaan)</option>
                <option value="Keluar">Giro Keluar (Pembayaran)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Nomor Cek / Giro *</label>
              <input
                type="text"
                value={giroNo}
                onChange={(e) => setGiroNo(e.target.value)}
                placeholder="BG-BCA-10293"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Nama Mitra / Perusahaan</label>
            <input
              type="text"
              value={giroParty}
              onChange={(e) => setGiroParty(e.target.value)}
              placeholder="PT Sinar Mandiri"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nominal (IDR) *</label>
              <input
                type="number"
                value={giroAmount || ''}
                onChange={(e) => setGiroAmount(Number(e.target.value))}
                placeholder="10000000"
                required
                min={1}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Tanggal Jatuh Tempo</label>
              <input
                type="date"
                value={giroDueDate}
                onChange={(e) => setGiroDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowGiroModal(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Simpan Giro
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: Tambah / Edit Aturan Rekonsiliasi */}
      <Modal
        open={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title={editingRuleId ? 'Edit Aturan Rekonsiliasi' : 'Tambah Aturan Rekonsiliasi Baru'}
        subtitle="Atur kriteria pencocokan otomatis transaksi bank rutin dan akun tujuannya"
      >
        <form onSubmit={handleRuleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Nama Aturan *</label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Contoh: Biaya Administrasi Bank Bulanan"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Kondisi Pencocokan (Deskripsi / Mutasi) *
            </label>
            <input
              type="text"
              value={ruleCondition}
              onChange={(e) => setRuleCondition(e.target.value)}
              placeholder="Contoh: Deskripsi mengandung 'BIAYA ADM' atau 'BUNGA GIRO'"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Sistem akan otomatis mencocokkan mutasi bank yang memenuhi kata kunci ini.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Akun Sasaran Penjurnalan (CoA) *</label>
            <input
              type="text"
              value={ruleTargetAccount}
              onChange={(e) => setRuleTargetAccount(e.target.value)}
              placeholder="Contoh: 6-60012 Beban Administrasi Bank"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="ruleActive"
              checked={ruleActive}
              onChange={(e) => setRuleActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ruleActive" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Aktifkan aturan ini untuk rekonsiliasi otomatis
            </label>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRuleModal(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {editingRuleId ? 'Perbarui Aturan' : 'Simpan Aturan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 6: API Bank Eksternal (CashLink) */}
      <Modal
        open={!!apiLockMsg}
        onClose={() => setApiLockMsg(null)}
        title="Fitur API Bank Eksternal"
        subtitle="Status Perizinan & Integrasi Langsung"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-3">
            <Lock className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="font-bold">Fitur Terkunci (Coming Soon)</div>
              <div className="mt-1 text-slate-600">{apiLockMsg}</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Seluruh transaksi perbankan internal (Tambah rekening, transfer, catat mutasi, dan rekonsiliasi manual)
            sudah berfungsi penuh dan tersinkronisasi di sistem.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setApiLockMsg(null)}
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
