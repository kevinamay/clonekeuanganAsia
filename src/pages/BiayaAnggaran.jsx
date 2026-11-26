import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import {
  Plus,
  Lock,
  Check,
  Trash2,
  Search,
  ArrowUpRight,
  Printer,
  History,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';

const defaultBudgetMatrix = [
  {
    code: '4-40000',
    name: 'Pendapatan Penjualan',
    category: 'Revenue',
    prevPeriods: [450000000, 520000000, 610000000],
    monthlyTargets: [
      600000000, 620000000, 650000000, 640000000, 680000000, 700000000, 720000000, 750000000,
      740000000, 780000000, 800000000, 850000000
    ]
  },
  {
    code: '4-40100',
    name: 'Diskon Penjualan',
    category: 'Revenue',
    prevPeriods: [5000000, 6000000, 7500000],
    monthlyTargets: [
      6000000, 6500000, 7000000, 7000000, 7500000, 8000000, 8000000, 8500000, 8500000, 9000000,
      9500000, 10000000
    ]
  },
  {
    code: '4-40200',
    name: 'Retur Penjualan',
    category: 'Revenue',
    prevPeriods: [2000000, 3000000, 1500000],
    monthlyTargets: [
      2500000, 2500000, 2500000, 2500000, 3000000, 3000000, 3000000, 3000000, 3500000, 3500000,
      3500000, 4000000
    ]
  },
  {
    code: '4-40201',
    name: 'Pendapatan Belum Ditagih',
    category: 'Revenue',
    prevPeriods: [15000000, 12000000, 18000000],
    monthlyTargets: [
      15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000,
      15000000, 15000000, 15000000
    ]
  },
  {
    code: '5-50000',
    name: 'Beban Pokok Pendapatan',
    category: 'Cost of Sales',
    prevPeriods: [280000000, 310000000, 370000000],
    monthlyTargets: [
      360000000, 370000000, 390000000, 380000000, 410000000, 420000000, 430000000, 450000000,
      440000000, 470000000, 480000000, 510000000
    ]
  },
  {
    code: '5-50100',
    name: 'Diskon Pembelian',
    category: 'Cost of Sales',
    prevPeriods: [4000000, 5000000, 6000000],
    monthlyTargets: [
      5000000, 5000000, 5500000, 5500000, 6000000, 6000000, 6500000, 6500000, 7000000, 7000000,
      7500000, 8000000
    ]
  },
  {
    code: '5-50200',
    name: 'Retur Pembelian',
    category: 'Cost of Sales',
    prevPeriods: [1000000, 1500000, 2000000],
    monthlyTargets: [
      1500000, 1500000, 1500000, 1500000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000,
      2000000, 2000000
    ]
  },
  {
    code: '5-50300',
    name: 'Pengiriman & Pengangkutan',
    category: 'Cost of Sales',
    prevPeriods: [12000000, 14000000, 16000000],
    monthlyTargets: [
      15000000, 15500000, 16000000, 16000000, 17000000, 17500000, 18000000, 18500000, 18500000,
      19000000, 19500000, 20000000
    ]
  },
  {
    code: '5-50400',
    name: 'Biaya Impor',
    category: 'Cost of Sales',
    prevPeriods: [25000000, 30000000, 45000000],
    monthlyTargets: [
      35000000, 35000000, 40000000, 35000000, 40000000, 40000000, 45000000, 45000000, 40000000,
      50000000, 50000000, 55000000
    ]
  }
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function StatusBadge({ status }) {
  const n = (status || '').toLowerCase();
  let color = 'bg-sky-50 text-sky-700 border-sky-200';
  if (n.includes('lunas') || n.includes('aktif') || n.includes('disetujui')) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (n.includes('belum') || n.includes('pending') || n.includes('perlu') || n.includes('butuh')) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (n.includes('batal') || n.includes('tolak')) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
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

function Drawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 animate-slide-left">
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none"
          >
            &times;
          </button>
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

export default function BiayaAnggaran() {
  const {
    notify,
    confirmAction,
    expenses = [],
    setExpenses,
    budgetRows = [],
    setBudgetRows,
    bankAccounts = [],
    setBankAccounts,
    bankMutations = [],
    setBankMutations,
    auditLogs = [],
    setAuditLogs
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('biaya');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterPeriod, setFilterPeriod] = useState('semua');

  // Drawers & Modals
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [apiNotice, setApiNotice] = useState(null);

  // Form: Catat Biaya Baru
  const [newExpDate, setNewExpDate] = useState('2026-11-14');
  const [newExpCategory, setNewExpCategory] = useState('Beban Operasional Kantor');
  const [newExpPayee, setNewExpPayee] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(0);
  const [newExpAccountId, setNewExpAccountId] = useState('');
  const [newExpRecurring, setNewExpRecurring] = useState(false);
  const [newExpTag, setNewExpTag] = useState('Proyek Cikarang');

  // Form: Target Anggaran Baru
  const [newBudgetAccount, setNewBudgetAccount] = useState('Beban Gaji & Upah');
  const [newBudgetAmount, setNewBudgetAmount] = useState(50000000);

  // Multi-Month Matrix State
  const [budgetMatrix, setBudgetMatrix] = useState(() => defaultBudgetMatrix);
  const [matrixRange, setMatrixRange] = useState('12 bulan kedepan');

  // Summary KPI Calculations
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const unpaidExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.status !== 'Lunas')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const totalBudgetAllocation = useMemo(() => {
    return budgetRows.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
  }, [budgetRows]);

  const penyerapanRatio = useMemo(() => {
    if (totalBudgetAllocation > 0) {
      return ((totalExpenses / totalBudgetAllocation) * 100).toFixed(1);
    }
    return totalExpenses > 0 ? '100.0' : '0.0';
  }, [totalExpenses, totalBudgetAllocation]);

  const bufferAmount = useMemo(() => {
    return Math.max(0, totalBudgetAllocation - totalExpenses);
  }, [totalBudgetAllocation, totalExpenses]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filterCategory !== 'semua' && e.category !== filterCategory) return false;
      if (filterStatus !== 'semua' && e.status !== filterStatus) return false;
      if (filterPeriod === 'bulan-ini' && !e.date?.startsWith('2026-11')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = (e.number || '').toLowerCase().includes(q);
        const payeeMatch = (e.payee || '').toLowerCase().includes(q);
        const catMatch = (e.category || '').toLowerCase().includes(q);
        const tagMatch = (e.tag || '').toLowerCase().includes(q);
        if (!numMatch && !payeeMatch && !catMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [expenses, filterCategory, filterStatus, filterPeriod, searchQuery]);

  // Handlers
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!newExpPayee.trim() || newExpAmount <= 0) return;

    const newExpenseDoc = {
      id: `exp-${Date.now()}`,
      number: `EXP-2026-${500 + expenses.length + 1}`,
      date: newExpDate || new Date().toISOString().split('T')[0],
      category: newExpCategory,
      payee: newExpPayee.trim(),
      tag: newExpTag || 'Operasional',
      recurring: newExpRecurring ? 'Bulanan' : undefined,
      source: 'Mekari Jurnal',
      amount: Number(newExpAmount),
      status: 'Lunas'
    };

    if (newExpAccountId) {
      setBankAccounts((prev) =>
        prev.map((acc) =>
          acc.id === newExpAccountId
            ? {
                ...acc,
                balanceBank: acc.balanceBank - newExpAmount,
                balanceBook: acc.balanceBook - newExpAmount
              }
            : acc
        )
      );

      const newMutation = {
        id: `mut-${Date.now()}`,
        date: newExpenseDoc.date,
        description: `Beban ${newExpenseDoc.category} (${newExpenseDoc.payee})`,
        amount: newExpAmount,
        direction: 'DB',
        status: 'Terekonsiliasi',
        matchedDoc: newExpenseDoc.number
      };
      setBankMutations([newMutation, ...bankMutations]);
    }

    setExpenses([newExpenseDoc, ...expenses]);

    setAuditLogs([
      {
        time: 'Baru saja',
        user: 'Carlos Susanto',
        action: `Beban Baru: ${newExpenseDoc.number} (${newExpenseDoc.payee}) senilai ${formatRupiah(
          newExpenseDoc.amount
        )} tanggal ${newExpenseDoc.date}`,
        module: 'Biaya & Anggaran'
      },
      ...auditLogs
    ]);

    setShowAddExpense(false);
    setNewExpPayee('');
    setNewExpAmount(0);
    setNewExpRecurring(false);
    notify(`Pengeluaran ${newExpenseDoc.number} berhasil dicatat (Tanggal: ${newExpenseDoc.date}).`);
  };

  const handleToggleExpenseStatus = (expId) => {
    const target = expenses.find((x) => x.id === expId);
    if (!target) return;
    const nextStatus = target.status === 'Lunas' ? 'Belum Dibayar' : 'Lunas';

    setExpenses((prev) => prev.map((x) => (x.id === expId ? { ...x, status: nextStatus } : x)));

    setAuditLogs([
      {
        time: 'Baru saja',
        user: 'Carlos Susanto',
        action: `Status Beban Diubah: ${target.number} (${target.payee}) menjadi ${nextStatus}`,
        module: 'Biaya & Anggaran'
      },
      ...auditLogs
    ]);

    notify('Status pengeluaran berhasil diperbarui.');
  };

  const handleApproveExpense = (expId) => {
    const target = expenses.find((x) => x.id === expId);
    if (!target) return;

    setExpenses((prev) => prev.map((x) => (x.id === expId ? { ...x, status: 'Lunas' } : x)));

    setAuditLogs([
      {
        time: 'Baru saja',
        user: 'Carlos Susanto',
        action: `APPROVAL DISETUJUI: Beban ${target.number} (${target.payee}) senilai ${formatRupiah(
          target.amount
        )} disetujui oleh Owner. Status diubah menjadi Lunas.`,
        module: 'Biaya & Anggaran'
      },
      ...auditLogs
    ]);

    notify(`Beban ${target.number || expId} disetujui.`);
  };

  const handleDeleteExpense = (expId, expNum) => {
    confirmAction({
      title: 'Hapus Pengeluaran',
      message: `Hapus pengeluaran "${expNum}" dari catatan beban operasional? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Pengeluaran',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setExpenses((prev) => prev.filter((x) => x.id !== expId));
        setAuditLogs([
          {
            time: 'Baru saja',
            user: 'Carlos Susanto',
            action: `Beban Dihapus: ${expNum}`,
            module: 'Biaya & Anggaran'
          },
          ...auditLogs
        ]);
        notify(`Pengeluaran "${expNum}" berhasil dihapus.`);
      }
    });
  };

  const handleAddBudgetSubmit = (e) => {
    e.preventDefault();
    if (!newBudgetAccount || newBudgetAmount <= 0) return;

    setBudgetRows([
      ...budgetRows,
      {
        account: newBudgetAccount,
        type: 'Beban',
        budget: Number(newBudgetAmount),
        actual: totalExpenses
      }
    ]);

    setShowAddBudget(false);
    notify(`Plafon anggaran untuk ${newBudgetAccount} berhasil disimpan.`);
  };

  const handleUpdateBudget = () => {
    if (!editingBudget || editingBudget.budget <= 0) {
      notify('Nominal plafon harus lebih dari 0.', 'error');
      return;
    }

    setBudgetRows((prev) =>
      prev.map((r) =>
        r.account === editingBudget.account ? { ...r, budget: Number(editingBudget.budget) } : r
      )
    );

    notify(`Plafon anggaran untuk ${editingBudget.account} berhasil diperbarui.`);
    setEditingBudget(null);
  };

  const handleDeleteBudget = (accName) => {
    confirmAction({
      title: 'Hapus Plafon Anggaran',
      message: `Hapus pagu anggaran untuk akun "${accName}"?`,
      confirmText: 'Hapus Anggaran',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setBudgetRows((prev) => prev.filter((r) => r.account !== accName));
        notify(`Plafon anggaran untuk ${accName} berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Biaya &amp; Anggaran Operasional
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola pos pengeluaran operasional pabrik, klaim beban, dan kontrol realisasi vs plafon anggaran bulanan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Catat Biaya Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary / KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatRupiah(totalExpenses)}
          subtext={`${expenses.length} transaksi pengeluaran tercatat`}
          tone="sky"
        />
        <StatCard
          label="Sisa Plafon Ekstra (Buffer)"
          value={formatRupiah(totalExpenses)}
          subtext="Realisasi beban bulan berjalan"
          tone="neutral"
        />
        <StatCard
          label="Rasio Penyerapan Beban"
          value={`${penyerapanRatio}%`}
          subtext="Stabil - sudah mendekati batas"
          tone={Number(penyerapanRatio) > 90 ? 'warning' : 'positive'}
        />
        <StatCard
          label="Tagihan Belum Dibayar"
          value={formatRupiah(unpaidExpenses)}
          subtext="Semua klaim lunas"
          tone={unpaidExpenses > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Tab Navigation Bar */}
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'biaya', label: 'Biaya & Pengeluaran', count: expenses.length },
          { id: 'anggaran', label: 'Plafon Anggaran Departemen', count: budgetRows.length },
          { id: 'rincian-anggaran', label: 'Rincian Anggaran (Multi-Bulan)' }
        ]}
      />

      {/* Tab 1: Biaya & Pengeluaran */}
      {activeTab === 'biaya' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white shadow-2xs overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari penerima, nomor, atau kategori beban..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="semua">Semua Kategori</option>
                <option value="Beban Gaji &amp; Upah">Beban Gaji &amp; Upah</option>
                <option value="Beban Listrik, Air &amp; Utilitas">Listrik &amp; Utilitas</option>
                <option value="Beban Sewa Gedung &amp; Gudang">Sewa Gudang</option>
                <option value="Beban Transportasi &amp; Logistik">Transport &amp; Logistik</option>
                <option value="Beban Pemeliharaan Mesin &amp; Armada">Pemeliharaan Mesin</option>
                <option value="Beban Operasional Kantor">Operasional Kantor</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="semua">Semua Status</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Dibayar">Belum Dibayar</option>
                <option value="Butuh Persetujuan">Butuh Persetujuan</option>
              </select>

              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="semua">Semua Waktu</option>
                <option value="bulan-ini">Bulan Ini (Nov 2026)</option>
              </select>

              {(searchQuery || filterCategory !== 'semua' || filterStatus !== 'semua' || filterPeriod !== 'semua') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('semua');
                    setFilterStatus('semua');
                    setFilterPeriod('semua');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAuditDrawer(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span>Log Aktivitas Biaya</span>
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="Belum ada catatan biaya operasional"
                description="Catat pengeluaran seperti sewa kantor, gaji, listrik, dan biaya operasional lainnya untuk memantau pengeluaran bisnis."
                action={
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Catat Biaya Pertama</span>
                  </button>
                }
              />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ada transaksi pengeluaran yang sesuai dengan kriteria filter atau pencarian Anda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Nomor &amp; Tanggal</th>
                    <th className="px-6 py-3.5">Kategori Akun</th>
                    <th className="px-6 py-3.5">Penerima (Payee)</th>
                    <th className="px-6 py-3.5">Tag / Proyek</th>
                    <th className="px-6 py-3.5 text-right">Nominal</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group/row">
                      <td className="px-6 py-4">
                        <Link
                          to={`/dokumen?id=${encodeURIComponent(item.number || item.id)}`}
                          className="group block text-left"
                          title="Buka Halaman Rincian &amp; Cetak Dokumen Beban"
                        >
                          <div className="num font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline flex items-center gap-1 font-mono">
                            <span>{item.number || item.id}</span>
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                          </div>
                          <div className="num text-[11px] text-slate-400 group-hover:text-slate-600">
                            {item.date}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link
                          to={`/dokumen?id=${encodeURIComponent(item.number || item.id)}`}
                          className="hover:text-blue-600 transition-colors inline-block"
                          title="Buka Halaman Rincian Dokumen"
                        >
                          {item.category}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{item.payee}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">
                          {item.tag}
                        </span>
                      </td>
                      <td className="num px-6 py-4 text-right font-bold text-slate-900">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/dokumen?id=${encodeURIComponent(item.number || item.id)}`}
                            className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs inline-flex items-center justify-center"
                            title="Buka Halaman Rincian &amp; Cetak Bukti Pengeluaran"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Link>

                          {item.status === 'Butuh Persetujuan' ? (
                            <button
                              type="button"
                              onClick={() => handleApproveExpense(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                              title="Setujui Pengeluaran Beban"
                            >
                              <Check className="h-3 w-3" />
                              <span>Setujui</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleExpenseStatus(item.id)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Ubah Status Pembayaran"
                            >
                              {item.status === 'Lunas' ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(item.id, item.number || item.id)}
                            className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Tab 2: Plafon Anggaran Departemen (Budget vs Actual) */}
      {activeTab === 'anggaran' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Laporan Budget vs Actual</h2>
              <p className="text-xs text-slate-400">
                Bandingkan target anggaran bulanan dengan realisasi biaya aktual
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBudget(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Target Anggaran</span>
            </button>
          </div>

          {budgetRows.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="Belum ada target anggaran (RAB)"
                description="Tetapkan pagu anggaran operasional untuk mengontrol pengeluaran tiap departemen."
                action={
                  <button
                    type="button"
                    onClick={() => setShowAddBudget(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tetapkan Anggaran Pertama</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Akun Anggaran</th>
                    <th className="px-6 py-3.5 text-right">Target Anggaran</th>
                    <th className="px-6 py-3.5 text-right">Realisasi Aktual</th>
                    <th className="px-6 py-3.5 text-right">Selisih (Variance)</th>
                    <th className="px-6 py-3.5">Persentase</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetRows.map((row) => {
                    const diff = row.budget - row.actual;
                    const pct = row.budget > 0 ? (row.actual / row.budget) * 100 : 0;
                    return (
                      <tr key={row.account} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{row.account}</td>
                        <td className="num px-6 py-4 text-right font-semibold text-slate-900">
                          {formatRupiah(row.budget)}
                        </td>
                        <td className="num px-6 py-4 text-right font-bold text-blue-600">
                          {formatRupiah(row.actual)}
                        </td>
                        <td className="num px-6 py-4 text-right font-bold text-slate-900">
                          {diff >= 0 ? `+${formatRupiah(diff)}` : formatRupiah(diff)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              pct <= 100
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingBudget({ ...row })}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Edit Plafon
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBudget(row.account)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              title="Hapus anggaran"
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Tab 3: Rincian Anggaran (Multi-Bulan) */}
      {activeTab === 'rincian-anggaran' && (
        <div className="rounded-xl border border-[#DCE7F5] bg-white shadow-2xs overflow-hidden">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Anggaran dimulai pada
                </label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Jan 2026</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Anggaran hingga
                </label>
                <select
                  value={matrixRange}
                  onChange={(e) => setMatrixRange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                >
                  <option value="12 bulan kedepan">12 bulan kedepan</option>
                  <option value="6 bulan kedepan">6 bulan kedepan</option>
                  <option value="3 bulan kedepan">3 bulan kedepan</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => notify('Data matriks anggaran bulanan diperbarui.')}
                className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                Tampilkan
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBudgetMatrix(defaultBudgetMatrix);
                  notify('Matriks anggaran di-reset ke nilai default.');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => notify('Seluruh alokasi anggaran bulanan berhasil disimpan ke database sistem!')}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Simpan Perubahan Matriks</span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 min-w-[220px]">Akun &amp; Kategori</th>
                  {months.map((m) => (
                    <th key={m} className="px-3 py-3 text-right min-w-[110px]">
                      {m} 2026
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right min-w-[130px] bg-slate-200/50">Total 12 Bulan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetMatrix.map((item) => {
                  const totalYear = item.monthlyTargets.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={item.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.code} · {item.category}
                        </div>
                      </td>
                      {item.monthlyTargets.map((target, idx) => (
                        <td key={idx} className="num px-3 py-3 text-right text-slate-700 font-mono">
                          {formatRupiah(target)}
                        </td>
                      ))}
                      <td className="num px-4 py-3 text-right font-bold text-blue-700 bg-slate-50/50 font-mono">
                        {formatRupiah(totalYear)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer: Catat Biaya Operasional Baru */}
      <Drawer
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Catat Biaya Operasional Baru"
        subtitle="Simpan data pengeluaran ke sistem"
      >
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Tanggal Pengeluaran / Bukti Kas Keluar *
              </label>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Bisa Diatur (Backdate Sesuai Kwitansi)
              </span>
            </div>
            <input
              type="date"
              value={newExpDate}
              onChange={(e) => setNewExpDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Sesuaikan dengan tanggal nota/bon fisik agar pencatatan beban akrual akurat.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Kategori Akun Beban *</label>
            <select
              value={newExpCategory}
              onChange={(e) => setNewExpCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="Beban Gaji &amp; Upah">Beban Gaji &amp; Upah</option>
              <option value="Beban Listrik, Air &amp; Utilitas">Beban Listrik, Air &amp; Utilitas</option>
              <option value="Beban Sewa Gedung &amp; Gudang">Beban Sewa Gedung &amp; Gudang</option>
              <option value="Beban Transportasi &amp; Logistik">Beban Transportasi &amp; Logistik</option>
              <option value="Beban Pemeliharaan Mesin &amp; Armada">Beban Pemeliharaan Mesin &amp; Armada</option>
              <option value="Beban Administrasi Bank">Beban Administrasi Bank</option>
              <option value="Beban Pemasaran &amp; Iklan">Beban Pemasaran &amp; Iklan</option>
              <option value="Beban Operasional Kantor">Beban Operasional Kantor</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Penerima Dana (Payee / Vendor) *</label>
            <input
              type="text"
              value={newExpPayee}
              onChange={(e) => setNewExpPayee(e.target.value)}
              placeholder="Contoh: PLN Distribusi Jakarta / Toko Surya Teknik"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Nominal Pengeluaran (IDR) *</label>
            <input
              type="number"
              value={newExpAmount || ''}
              onChange={(e) => setNewExpAmount(Number(e.target.value))}
              placeholder="Contoh: 12500000"
              required
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Potong Dari Rekening (Kas / Bank)</label>
            <select
              value={newExpAccountId}
              onChange={(e) => setNewExpAccountId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Catat Tanpa Mengurangi Rekening Bank --</option>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Saldo: {formatRupiah(a.balanceBank)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="recCheck"
              checked={newExpRecurring}
              onChange={(e) => setNewExpRecurring(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="recCheck" className="text-xs text-slate-700 cursor-pointer select-none">
              Tandai sebagai pengeluaran rutin bulanan (Recurring)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddExpense(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Simpan Biaya
            </button>
          </div>
        </form>
      </Drawer>

      {/* Modal: Tetapkan Target Anggaran (RAB) */}
      <Modal
        open={showAddBudget}
        onClose={() => setShowAddBudget(false)}
        title="Tetapkan Target Anggaran (RAB)"
        subtitle="Simpan pagu batas beban ke sistem"
      >
        <form onSubmit={handleAddBudgetSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Nama Akun Beban *</label>
            <input
              type="text"
              value={newBudgetAccount}
              onChange={(e) => setNewBudgetAccount(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Plafon Anggaran Bulanan (IDR) *</label>
            <input
              type="number"
              value={newBudgetAmount || ''}
              onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
              required
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddBudget(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Simpan Pagu Anggaran
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Ubah Target Plafon Anggaran */}
      <Modal
        open={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="Ubah Target Plafon Anggaran"
        subtitle={`Sesuaikan pagu batas pengeluaran untuk ${editingBudget?.account}`}
      >
        {editingBudget && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nama Akun Beban</label>
              <p className="mt-1 text-sm font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {editingBudget.account}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Nominal Plafon Baru (IDR) *</label>
              <input
                type="number"
                value={editingBudget.budget}
                onChange={(e) =>
                  setEditingBudget({ ...editingBudget, budget: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBudget(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateBudget}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Drawer: Riwayat Log Aktivitas Biaya & Anggaran */}
      <Drawer
        open={showAuditDrawer}
        onClose={() => setShowAuditDrawer(false)}
        title="Riwayat Log Aktivitas Biaya & Anggaran"
        subtitle="Jejak audit seluruh pencatatan pengeluaran, perubahan status bayar, dan anggaran beban"
      >
        <div className="space-y-3">
          {auditLogs.filter((l) => l.module === 'Biaya & Anggaran').length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada riwayat aktivitas yang tercatat untuk modul biaya &amp; anggaran.
            </div>
          ) : (
            auditLogs
              .filter((l) => l.module === 'Biaya & Anggaran')
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
      </Drawer>

      {/* Modal: Fitur API Pihak Ketiga (Notice) */}
      <Modal
        open={!!apiNotice}
        onClose={() => setApiNotice(null)}
        title="Fitur API Pihak Ketiga"
        subtitle="Status Integrasi"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-3">
            <Lock className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="font-bold">Fitur Terkunci (Coming Soon)</div>
              <div className="mt-1 text-slate-600">{apiNotice}</div>
            </div>
          </div>
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
