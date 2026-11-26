import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const {
    period,
    bankAccounts,
    salesDocs,
    purchaseDocs,
    expenses,
    bankMutations,
    personalNotes,
    notify
  } = useAppContext();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Currency exchange rates
  const rates = {
    IDR: 1,
    USD: 16120,
    EUR: 17350,
    SGD: 12150,
    CNY: 2240,
    JPY: 104.5
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      notify('Data dashboard berhasil diperbarui secara realtime.');
    }, 600);
  };

  // KPI Calculations
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + (b.balanceBank || 0), 0);
  const totalSales = salesDocs.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalPurchases = purchaseDocs.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netCashflow = totalSales - totalPurchases - totalExpenses;

  // AR Aging: Unpaid sales
  const totalReceivables = salesDocs.reduce((acc, s) => acc + ((s.total || 0) - (s.paid || 0)), 0);

  // AP Aging: Unpaid purchases
  const totalPayables = purchaseDocs.reduce((acc, p) => acc + ((p.total || 0) - (p.paid || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Page Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              Dashboard Finansial
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Ringkasan saldo, cashflow, net profit & analytics Asia Plastik • Periode {period}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Ticker Selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs">
            {['IDR', 'USD', 'CNY', 'SGD'].map(curr => (
              <button
                key={curr}
                type="button"
                onClick={() => setSelectedCurrency(curr)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  selectedCurrency === curr
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => notify('Laporan PDF Dashboard sedang diunduh...')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80">
        <div className="flex gap-1 -mb-px">
          {[
            { id: 'ringkasan', label: 'Ringkasan & KPI' },
            { id: 'performa', label: 'Performa & Analitik' },
            { id: 'looker', label: 'Looker Studio & Embed' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Currency Exchange Rates ticker bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kurs Valas Acuan:</span>
          <span className="font-semibold text-slate-700">1 USD = Rp 16.120</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">1 CNY = Rp 2.240</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">1 SGD = Rp 12.150</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">1 EUR = Rp 17.350</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Terakhir sinkronisasi: Hari ini 10:00 WIB • Realtime BI / Market Rate
        </div>
      </div>

      {/* TAB 1: RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* KPI Cards 4 Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Saldo Bank */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Total Saldo Kas & Bank</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Landmark className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">
                  {formatRupiah(totalBankBalance)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>5 Akun Kas & Rekening Aktif</span>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2.5 flex justify-between text-[11px] text-slate-400">
                <span>BCA, Mandiri, Kas Pabrik</span>
                <button
                  type="button"
                  onClick={() => navigate('/kas-bank')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Detail →
                </button>
              </div>
            </div>

            {/* 2. Net Cashflow */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Arus Kas Bersih (Net)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black ${netCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatRupiah(netCashflow)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Surplus operasional +18.4%</span>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2.5 flex justify-between text-[11px] text-slate-400">
                <span>Inflow: {formatRupiah(totalSales, true)}</span>
                <span className="text-rose-500 font-medium">Out: {formatRupiah(totalPurchases + totalExpenses, true)}</span>
              </div>
            </div>

            {/* 3. Piutang Usaha (AR) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Piutang Usaha (AR Aging)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">
                  {formatRupiah(totalReceivables)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-sky-600 font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>3 Faktur Penjualan Aktif</span>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2.5 flex justify-between text-[11px] text-slate-400">
                <span>100% Umur &lt; 30 Hari</span>
                <button
                  type="button"
                  onClick={() => navigate('/penjualan')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Kelola →
                </button>
              </div>
            </div>

            {/* 4. Utang Usaha (AP) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Utang Usaha & PO (AP)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">
                  {formatRupiah(totalPayables)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>3 Tagihan Vendor Menunggu</span>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2.5 flex justify-between text-[11px] text-slate-400">
                <span>Jatuh tempo Net 30/14</span>
                <button
                  type="button"
                  onClick={() => navigate('/pembelian')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Jadwal →
                </button>
              </div>
            </div>
          </div>

          {/* Charts Row: Tren Penjualan & Margin Bruto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Chart Box */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      Penjualan & Margin
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Tren Penjualan Produk & Margin Bruto Bulanan
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-blue-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    Penjualan
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Margin Bruto (24%)
                  </span>
                </div>
              </div>

              {/* Visualized Bar/Chart simulation */}
              <div className="mt-6 space-y-4">
                {[
                  { month: 'Agustus 2026', rev: 280000000, margin: 68000000, pct: 65 },
                  { month: 'September 2026', rev: 310000000, margin: 76000000, pct: 72 },
                  { month: 'Oktober 2026', rev: 350000000, margin: 89000000, pct: 85 },
                  { month: 'November 2026 (Berjalan)', rev: 395000000, margin: 98000000, pct: 95 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.month}</span>
                      <div className="flex gap-4">
                        <span className="text-blue-700 font-bold">{formatRupiah(item.rev)}</span>
                        <span className="text-emerald-600 font-medium">Margin: {formatRupiah(item.margin)}</span>
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span>Target kuartal IV tercapai 92% • Efisiensi bahan baku HDPE meningkat</span>
                <button
                  type="button"
                  onClick={() => navigate('/laporan')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Buka Laporan Laba Rugi Lengkap →
                </button>
              </div>
            </div>

            {/* Rekening Bank & Kas Operasional */}
            <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Rekening Bank & Valas</h3>
                  <button
                    type="button"
                    onClick={() => navigate('/kas-bank')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Kelola
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {bankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                          {acc.currency}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="text-sm font-black text-blue-700">
                          {acc.currency === 'USD' ? `$ ${acc.balanceBank?.toLocaleString()}` : formatRupiah(acc.balanceBank)}
                        </span>
                        <span className="text-[10px] text-slate-400">{acc.lastSync}</span>
                      </div>
                      <div className="mt-1 text-[10.5px] text-slate-500 line-clamp-1">
                        {acc.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/kas-bank?new=transfer')}
                  className="w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors text-center"
                >
                  + Transfer Antar Rekening
                </button>
              </div>
            </div>
          </div>

          {/* Tables Row: Recent Transactions & Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Faktur Penjualan Terkini */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Faktur Penjualan (Invoices)</h3>
                  <p className="text-[11px] text-slate-400">Tagihan pelanggan & status pelunasan</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/penjualan')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Lihat Semua ({salesDocs.length})
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {salesDocs.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{inv.number}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {inv.tag}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 mt-0.5">{inv.customer}</div>
                      <div className="text-[11px] text-slate-400">Jatuh Tempo: {formatDate(inv.dueDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">{formatRupiah(inv.total)}</div>
                      <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        inv.status === 'Lunas'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tugas & Catatan Finansial */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tugas & Catatan Finansial</h3>
                  <p className="text-[11px] text-slate-400">Instruksi manajemen & audit operasional</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/tugas')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Buka Modul Tugas ({personalNotes.length})
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {personalNotes.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            task.completed ? 'text-emerald-500' : 'text-slate-300'
                          }`}
                        />
                        <div>
                          <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {task.content}
                          </div>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        task.severity === 'Tinggi'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {task.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERFORMA & ANALITIK */}
      {activeTab === 'performa' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900">Analisis Rasio Finansial & Profitabilitas</h3>
            <p className="text-xs text-slate-500 mt-1">Rasio likuiditas, solvabilitas, dan margin laba bersih Asia Plastik.</p>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="text-xs text-blue-700 font-semibold">Current Ratio (Likuiditas)</div>
                <div className="text-2xl font-black text-blue-900 mt-1">2.85x</div>
                <div className="text-[11px] text-blue-600 mt-1">Sangat Sehat (Standar &gt; 1.5x)</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-xs text-emerald-700 font-semibold">Net Profit Margin</div>
                <div className="text-2xl font-black text-emerald-900 mt-1">16.4%</div>
                <div className="text-[11px] text-emerald-600 mt-1">Melampaui Target Industri (12%)</div>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                <div className="text-xs text-sky-700 font-semibold">Return on Equity (ROE)</div>
                <div className="text-2xl font-black text-sky-900 mt-1">21.8%</div>
                <div className="text-[11px] text-sky-600 mt-1">Pertumbuhan Kuat Kuartal 4</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOOKER STUDIO & EMBED */}
      {activeTab === 'looker' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xs text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Looker Studio Dashboard Embedded</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Visualisasi analitik tingkat enterprise terhubung langsung ke BigQuery data warehouse Asia Plastik untuk visualisasi multidimensi.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => notify('Membuka sesi Looker Studio terautentikasi...')}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              Buka Google Looker Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
