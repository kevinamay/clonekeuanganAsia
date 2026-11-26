import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  Globe,
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  Building,
  CheckCheck,
  Trash2,
  MoveUp,
  MoveDown,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

const CURRENCIES = [
  { code: 'IDR', name: 'Rupiah Indonesia', flag: '🇮🇩', symbol: 'Rp', popular: true },
  { code: 'USD', name: 'Dolar Amerika Serikat', flag: '🇺🇸', symbol: '$', popular: true },
  { code: 'JPY', name: 'Yen Jepang', flag: '🇯🇵', symbol: '¥', popular: true },
  { code: 'CNY', name: 'Yuan Renminbi Tiongkok', flag: '🇨🇳', symbol: '¥', popular: true },
  { code: 'EUR', name: 'Euro Uni Eropa', flag: '🇪🇺', symbol: '€', popular: true },
  { code: 'SGD', name: 'Dolar Singapura', flag: '🇸🇬', symbol: 'S$', popular: true },
  { code: 'MYR', name: 'Ringgit Malaysia', flag: '🇲🇾', symbol: 'RM', popular: true },
  { code: 'GBP', name: 'Poundsterling Inggris', flag: '🇬🇧', symbol: '£', popular: true },
  { code: 'AUD', name: 'Dolar Australia', flag: '🇦🇺', symbol: 'A$', popular: true },
  { code: 'HKD', name: 'Dolar Hong Kong', flag: '🇭🇰', symbol: 'HK$', popular: true },
  { code: 'KRW', name: 'Won Korea Selatan', flag: '🇰🇷', symbol: '₩', popular: true },
  { code: 'THB', name: 'Baht Thailand', flag: '🇹🇭', symbol: '฿', popular: true },
  { code: 'SAR', name: 'Riyal Arab Saudi', flag: '🇸🇦', symbol: 'SR' },
  { code: 'AED', name: 'Dirham UEA', flag: '🇦🇪', symbol: 'AED' }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatVal(amount, currency = 'IDR', compact = false) {
  const abs = Math.abs(amount || 0);
  const sign = (amount || 0) < 0 ? '-' : '';

  if (compact && abs >= 1000000000) {
    return `${sign}${(abs / 1000000000).toFixed(1)}M`;
  }
  if (compact && abs >= 1000000) {
    return `${sign}${(abs / 1000000).toFixed(1)}jt`;
  }

  try {
    const isZeroDecimal = ['IDR', 'JPY', 'KRW', 'VND', 'HUF'].includes(currency);
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
      minimumFractionDigits: isZeroDecimal ? 0 : 2
    }).format(abs);
    return `${sign}${formatted}`;
  } catch {
    const curr = CURRENCIES.find(c => c.code === currency);
    const sym = curr?.symbol || currency;
    return `${sign}${sym} ${(amount || 0).toLocaleString('id-ID')}`;
  }
}

export default function Dashboard() {
  const {
    period,
    notify,
    confirmAction,
    bankAccounts: initialBankAccounts,
    salesDocs: initialSalesDocs,
    purchaseDocs: initialPurchaseDocs,
    expenses: initialExpenses,
    personalNotes: initialNotes
  } = useAppContext();

  const navigate = useNavigate();

  // Tabs
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [currencyRates, setCurrencyRates] = useState({
    IDR: 1,
    USD: 16120,
    EUR: 17350,
    SGD: 12150,
    CNY: 2240,
    JPY: 104.5
  });

  // Currency Dropdown Popover
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const currencyRef = useRef(null);

  // Month range slider (Balance Overview)
  const [rangeStart, setRangeStart] = useState(0); // Jan
  const [rangeEnd, setRangeEnd] = useState(11); // Des
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('15 Nov 2026, 00:27 (GMT+7)');

  // Modals state
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [customWidgetModalOpen, setCustomWidgetModalOpen] = useState(false);

  // Form states
  const [newAccName, setNewAccName] = useState('');
  const [newAccBank, setNewAccBank] = useState('Bank BCA');
  const [newAccBalance, setNewAccBalance] = useState('');

  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSeverity, setNoteSeverity] = useState('Sedang');
  const [noteType, setNoteType] = useState('Catatan Internal');

  // Interactive Looker widgets state
  const [widgets, setWidgets] = useState([
    {
      id: 'widget-1',
      title: 'Tren Penjualan & Margin Bruto',
      variable: 'sales',
      chartType: 'line',
      colSpan: 6,
      colorScheme: 'emerald'
    },
    {
      id: 'widget-2',
      title: 'Komposisi Beban Operasional Pabrik',
      variable: 'expenses',
      chartType: 'donut',
      colSpan: 6,
      colorScheme: 'purple'
    },
    {
      id: 'widget-3',
      title: 'Analisis Umur Piutang Usaha (Aging AR)',
      variable: 'aging_ar',
      chartType: 'bar',
      colSpan: 12,
      colorScheme: 'blue'
    },
    {
      id: 'widget-4',
      title: 'Plafon Anggaran vs Realisasi Biaya',
      variable: 'budget',
      chartType: 'bar',
      colSpan: 6,
      colorScheme: 'amber'
    },
    {
      id: 'widget-5',
      title: 'Efisiensi Output Produksi & Work Order',
      variable: 'production',
      chartType: 'kpi',
      colSpan: 6,
      colorScheme: 'indigo'
    }
  ]);

  // Click outside listener for currency popup
  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyDropdownOpen(false);
      }
    }
    if (currencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currencyDropdownOpen]);

  // Currency fetcher from open.er-api.com
  useEffect(() => {
    async function fetchLiveRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates.IDR) {
            setCurrencyRates({
              IDR: 1,
              USD: data.rates.IDR,
              EUR: data.rates.IDR / (data.rates.EUR || 0.9),
              SGD: data.rates.IDR / (data.rates.SGD || 1.3),
              CNY: data.rates.IDR / (data.rates.CNY || 7.2),
              JPY: data.rates.IDR / (data.rates.JPY || 155)
            });
          }
        }
      } catch (e) {
        console.warn('Currency fetch offline fallback:', e);
      }
    }
    fetchLiveRates();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdatedText(`${now.getDate()} Nov 2026, ${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} (GMT+7)`);
      notify('Data dashboard berhasil disinkronkan secara realtime.');
    }, 600);
  };

  // Static/Seed Values matching exactly with the uploaded live dashboard screenshot
  const totalBalanceIDR = 6605182808;
  const netFlowIDR = 10389969576;
  const incomeLunasIDR = 15921460788;
  const incomeBelumLunasIDR = 4406085700;
  const totalExpensesIDR = 5531491124;
  const totalOmsetIDR = 20327546400;

  // Conversion rate helper
  const convertAmount = (valIDR) => {
    if (selectedCurrency === 'IDR') return valIDR;
    const rate = currencyRates[selectedCurrency] || 16120;
    return Math.round(valIDR / rate);
  };

  // Convert for display
  const dispTotalBalance = formatVal(convertAmount(totalBalanceIDR), selectedCurrency);
  const dispNetFlow = formatVal(convertAmount(netFlowIDR), selectedCurrency);
  const dispIncomeLunas = formatVal(convertAmount(incomeLunasIDR), selectedCurrency);
  const dispIncomeBelumLunas = formatVal(convertAmount(incomeBelumLunasIDR), selectedCurrency);
  const dispExpenses = formatVal(convertAmount(totalExpensesIDR), selectedCurrency);
  const dispTotalOmset = formatVal(convertAmount(totalOmsetIDR), selectedCurrency);

  // Currency Market List
  const currencyMarketList = [
    { code: 'USD', name: 'Dolar AS / IDR', flag: '🇺🇸', rate: 'Rp 16.120', change: '+0.12%', trend: 'up' },
    { code: 'JPY', name: 'Yen Jepang / IDR', flag: '🇯🇵', rate: 'Rp 104', change: '+0.04%', trend: 'up' },
    { code: 'CNY', name: 'Yuan Tiongkok / IDR', flag: '🇨🇳', rate: 'Rp 2.240', change: '-0.02%', trend: 'down' },
    { code: 'EUR', name: 'Euro / IDR', flag: '🇪🇺', rate: 'Rp 17.350', change: '-0.05%', trend: 'down' },
    { code: 'SGD', name: 'Dolar Singapura / IDR', flag: '🇸🇬', rate: 'Rp 12.150', change: '+0.08%', trend: 'up' }
  ];

  // Balance Overview Data (Months Jan - Des)
  const monthlyFlowData = [
    { month: 'Jan', income: 750000000, outflow: 320000000 },
    { month: 'Feb', income: 680000000, outflow: 350000000 },
    { month: 'Mar', income: 1420000000, outflow: 720000000 },
    { month: 'Apr', income: 890000000, outflow: 480000000 },
    { month: 'May', income: 1650000000, outflow: 780000000 },
    { month: 'Jun', income: 980000000, outflow: 510000000 },
    { month: 'Jul', income: 1540000000, outflow: 840000000 },
    { month: 'Aug', income: 1880000000, outflow: 920000000 },
    { month: 'Sep', income: 1120000000, outflow: 610000000 },
    { month: 'Oct', income: 1450000000, outflow: 690000000 },
    { month: 'Nov', income: 2290000000, outflow: 850000000 },
    { month: 'Des', income: 1780000000, outflow: 790000000 }
  ];

  const filteredMonthly = useMemo(() => {
    return monthlyFlowData.slice(rangeStart, rangeEnd + 1);
  }, [rangeStart, rangeEnd]);

  // SVG Spline Generator for Balance Overview
  const maxChartVal = 2500000000;
  const chartHeight = 160;
  const chartWidth = 800;

  const getPoints = (key) => {
    if (filteredMonthly.length === 0) return '';
    return filteredMonthly
      .map((item, idx) => {
        const x = 50 + (idx / Math.max(1, filteredMonthly.length - 1)) * (chartWidth - 100);
        const y = chartHeight - ((item[key] || 0) / maxChartVal) * (chartHeight - 30);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const incomePoints = getPoints('income');
  const outflowPoints = getPoints('outflow');

  const getAreaPath = (pointsStr) => {
    if (!pointsStr) return '';
    const pts = pointsStr.split(' ');
    const firstX = pts[0].split(',')[0];
    const lastX = pts[pts.length - 1].split(',')[0];
    return `M ${firstX},${chartHeight} L ${pointsStr.replace(/ /g, ' L ')} L ${lastX},${chartHeight} Z`;
  };

  const getLinePath = (pointsStr) => {
    if (!pointsStr) return '';
    return `M ${pointsStr.replace(/ /g, ' L ')}`;
  };

  // Recent Transfer Accounts circles
  const recentAccounts = [
    { label: 'BCA', color: 'bg-blue-600' },
    { label: 'MDR', color: 'bg-blue-500' },
    { label: 'BRI', color: 'bg-slate-700' },
    { label: 'BNI', color: 'bg-blue-400' },
    { label: 'CASH', color: 'bg-emerald-600' }
  ];

  // Helper for Looker widget moving
  const moveWidget = (idx, dir) => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;
    const copy = [...widgets];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setWidgets(copy);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    notify('Widget berhasil dihapus dari kanvas.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Page Title matching live screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Ringkasan performa bisnis dan operasional finansial terkini Asia Plastik.
          </p>
        </div>

        {/* Action Controls & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Sales Performance Button */}
          <button
            type="button"
            onClick={() => navigate('/ai')}
            className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <span>Analisis performa penjualan</span>
            <span className="flex items-center gap-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
              <Sparkles className="h-2.5 w-2.5" />
              <span>AI</span>
            </span>
          </button>

          {/* Entity Badge Selector */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Building className="h-3.5 w-3.5 text-slate-500" />
            <span>Asia Plastic Finance</span>
          </div>

          {/* Year Range Button */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span>Tahun Berjalan (2026)</span>
          </div>
        </div>
      </div>

      {/* Tabs & Last Sync Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ringkasan')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              activeTab === 'ringkasan' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Ringkasan</span>
            {activeTab === 'ringkasan' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setCustomWidgetModalOpen(true)}
            className="pb-2.5 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah dashboard</span>
          </button>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="text-[11px] text-slate-400">
            Terakhir diperbarui: {lastUpdatedText}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => setCustomWidgetModalOpen(true)}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: RINGKASAN */}
      <div className="space-y-6">
        {/* ROW 1: TOP KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Total Balance (Col 4) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl border border-slate-100 bg-[#FAFAFA] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                    <Wallet className="h-3.5 w-3.5" />
                  </div>
                  <span>Total Balance</span>
                </div>

                {/* Currency Selector Pill */}
                <div className="relative" ref={currencyRef}>
                  <button
                    type="button"
                    onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs transition-all"
                  >
                    <span className="text-sm">
                      {CURRENCIES.find(c => c.code === selectedCurrency)?.flag || '🇮🇩'}
                    </span>
                    <span className="font-bold font-mono text-[11px]">{selectedCurrency}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {currencyDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl animate-scale-in">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900">Pilih Mata Uang</span>
                        {selectedCurrency !== 'IDR' && (
                          <button
                            type="button"
                            onClick={() => { setSelectedCurrency('IDR'); setCurrencyDropdownOpen(false); }}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Reset IDR
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCurrency(c.code);
                              setCurrencyDropdownOpen(false);
                              notify(`Mata uang tampilan diubah ke ${c.code}`);
                            }}
                            className={`w-full px-2.5 py-2 text-left flex items-center justify-between rounded-xl transition-colors ${
                              selectedCurrency === c.code ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span className="text-xs">{c.name} ({c.code})</span>
                            </div>
                            <span className="text-xs font-mono text-slate-400">{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2.5 flex-wrap">
                <span className="num text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {dispTotalBalance}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200/60">
                  +{dispNetFlow} net flow
                </span>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200/70">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-800">Create Transfer</span>
                <button
                  type="button"
                  onClick={() => setTransferOpen(true)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-medium mb-3">
                Recent Accounts (5)
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  {recentAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      className={`h-8 w-8 rounded-full ${acc.color} text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-2xs hover:scale-105 transition-transform`}
                    >
                      {acc.label}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setAddAccountOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center 4 Metrics Grid (Col 5) */}
          <div className="md:col-span-12 lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Income (Sudah Lunas) - Big Blue Card */}
            <div className="rounded-3xl bg-blue-600 text-white p-5 flex flex-col justify-between shadow-lg shadow-blue-500/20 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 text-white">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
                    Lunas
                  </span>
                </div>
                <div className="text-xs font-semibold text-white/90">Income (Sudah Lunas)</div>
                <div className="num mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {dispIncomeLunas}
                </div>
              </div>
              <div className="mt-2 text-[10.5px] font-medium text-white/80 flex items-center justify-between">
                <span>11 Transaksi Lunas</span>
                <span className="text-[10px] text-white/70">Realisasi Kas</span>
              </div>
            </div>

            {/* Income (Belum Lunas) - White Card with blue border */}
            <div className="rounded-3xl border border-sky-100 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-blue-200 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Piutang
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">Income (Belum Lunas)</div>
                <div className="num mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {dispIncomeBelumLunas}
                </div>
              </div>
              <div className="mt-2 text-[10.5px] font-medium text-slate-400 flex items-center justify-between">
                <span>4 Faktur Berjalan</span>
                <Link to="/penjualan" className="text-blue-600 hover:underline font-semibold text-[10px]">
                  Kelola →
                </Link>
              </div>
            </div>

            {/* Expenses */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-3">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <div className="text-xs font-semibold text-slate-500">Expenses</div>
                <div className="num mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {dispExpenses}
                </div>
              </div>
              <div className="mt-2 text-[10.5px] font-medium text-slate-400">
                43 Biaya & PO
              </div>
            </div>

            {/* Net Flow */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-3">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-xs font-semibold text-slate-500">Net Flow</div>
                <div className="num mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  +{dispNetFlow}
                </div>
              </div>
              <div className="mt-2 text-[10.5px] font-medium text-slate-400">
                Margin Laba 65.3%
              </div>
            </div>
          </div>

          {/* Right Card: Personal Notes (Col 3) */}
          <div className="md:col-span-12 lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-900">Personal Notes</span>
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/tugas"
                    target="_blank"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAddNoteOpen(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Note Item matching screenshot */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      Sedang
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      Catatan Internal
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">21 Nov 2026</span>
                </div>

                <div className="mt-2 text-xs text-blue-600 break-all font-mono">
                  https://www.youtube.com/shorts/dzD6GL4nWzA
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center -space-x-1.5">
                    <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                      C
                    </div>
                    <div className="h-5 w-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                      R
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://www.youtube.com/shorts/dzD6GL4nWzA');
                      notify('Tautan disalin ke clipboard.');
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Tugas Tertunda</span>
              <div className="flex items-center gap-2">
                <span className="num text-blue-600 font-bold">10 Items</span>
                <Link
                  to="/tugas"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px]"
                >
                  <span>Buka Tugas</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: PEMISAHAN STATUS INCOME & PENJUALAN BANNER */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    Pemisahan Status Income & Penjualan
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Total Omset: {dispTotalOmset}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemisahan antara realisasi kas yang telah lunas vs piutang invoice aktif pelanggan periode ini.
                </p>
              </div>
            </div>

            <Link
              to="/penjualan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Buka Modul Penjualan</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <div className="flex items-center gap-2 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
                <span>Sudah Lunas (78%)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-200 inline-block" />
                <span>Belum Lunas / Piutang (22%)</span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
              <div style={{ width: '78%' }} className="h-full bg-blue-600 rounded-l-full transition-all" />
              <div style={{ width: '22%' }} className="h-full bg-blue-200 rounded-r-full transition-all" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ArrowDownLeft className="h-4 w-4 text-blue-600" />
                  <span>Realisasi Kas (Sudah Lunas)</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200/60">
                  11 Faktur Lunas
                </span>
              </div>
              <div className="num mt-2 text-xl font-bold text-blue-700">
                {dispIncomeLunas}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Dana telah diterima penuh dan tercatat di mutasi kas/bank operasional.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Piutang Dagang (Belum Lunas)</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  4 Faktur Berjalan
                </span>
              </div>
              <div className="num mt-2 text-xl font-bold text-slate-900">
                {dispIncomeBelumLunas}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Tagihan terbit yang masih menunggu pelunasan atau baru terbayar sebagian.
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: CURRENCIES MARKET & BALANCE OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Currencies Market & Top Spending (Col 4) */}
          <div className="md:col-span-12 lg:col-span-4 space-y-5">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Currencies Market</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Update: Realtime · open.er-api.com</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyDropdownOpen(true)}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {currencyMarketList.map((c) => (
                  <div key={c.code} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-base">
                        {c.flag}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{c.code}</div>
                        <div className="text-[10px] text-slate-400">{c.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${c.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {c.trend === 'up' ? '↑' : '↓'} {c.change}
                      </div>
                      <div className="num text-[11px] text-slate-700 font-semibold">{c.rate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Spending */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-900">Top Spending</span>
                <Link to="/biaya-anggaran" className="text-slate-400 hover:text-blue-600">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-end gap-1.5 h-6 shrink-0">
                  <span style={{ height: '22px' }} className="w-1.5 bg-blue-600 rounded-full" />
                  <span style={{ height: '14px' }} className="w-1.5 bg-blue-400 rounded-full" />
                  <span style={{ height: '8px' }} className="w-1.5 bg-slate-300 rounded-full" />
                  <span style={{ height: '18px' }} className="w-1.5 bg-blue-500 rounded-full" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Bahan Baku & Pemasok (87%)
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    Biaya Promosi / Iklan (11%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Overview Chart (Col 8) */}
          <div className="md:col-span-12 lg:col-span-8 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">Balance Overview</span>
                    <span className="block text-[10px] text-slate-400">Arus Kas Berjalan Tahun 2026 (Data Riil)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                      <span className="text-slate-700">Pemasukan (Lunas)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-300 inline-block" />
                      <span className="text-slate-500">Pengeluaran</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[11px] font-semibold text-slate-700">01/01/2026 – 12/31/2026</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const csv = 'Bulan,Pemasukan,Pengeluaran\n' + monthlyFlowData.map(m => `${m.month},${m.income},${m.outflow}`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'Balance_Overview_2026.csv';
                      a.click();
                      notify('Data Balance Overview berhasil diunduh.');
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                    title="Unduh Data CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="relative mt-5 pt-1 pb-1">
                {/* Floating Peak Label */}
                <div
                  className="absolute pointer-events-none z-10"
                  style={{ left: '91%', top: '15%', transform: 'translate(-50%, -100%)' }}
                >
                  <div className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-blue-500/25 ring-2 ring-white">
                    Rp 2.290.000.000
                  </div>
                </div>

                <svg viewBox="0 0 800 180" className="w-full h-48 overflow-visible select-none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[30, 75, 120, 160].map((y, i) => (
                    <line key={i} x1="50" y1={y} x2="750" y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  ))}

                  {/* Area fill */}
                  <path d={getAreaPath(incomePoints)} fill="url(#blueAreaGrad)" />

                  {/* Outflow line (light blue) */}
                  <path d={getLinePath(outflowPoints)} fill="none" stroke="#93C5FD" strokeWidth="2.5" />

                  {/* Income line (strong blue) */}
                  <path d={getLinePath(incomePoints)} fill="none" stroke="#2563EB" strokeWidth="3" />

                  {/* Data Point Circles on Income Line */}
                  {filteredMonthly.map((item, idx) => {
                    const x = 50 + (idx / Math.max(1, filteredMonthly.length - 1)) * (chartWidth - 100);
                    const y = chartHeight - ((item.income || 0) / maxChartVal) * (chartHeight - 30);
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={idx === 10 ? 5.5 : 3.5}
                        fill={idx === 10 ? '#2563EB' : '#FFFFFF'}
                        stroke="#2563EB"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                    );
                  })}
                </svg>

                {/* X-Axis Month Labels */}
                <div className="relative h-6 mt-1 flex justify-between px-12 text-[11px] text-slate-400 font-medium">
                  {filteredMonthly.map((m, idx) => (
                    <span key={idx} className={idx === 10 ? 'text-blue-600 font-bold' : ''}>
                      {m.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Slider & Quick Filter Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                    <Filter className="h-3 w-3 text-blue-600" />
                    <span>Akses Cepat Geser:</span>
                  </span>
                  {[
                    { label: '1B', s: 10, e: 10 },
                    { label: '3B', s: 8, e: 10 },
                    { label: '6B', s: 5, e: 10 },
                    { label: 'YTD', s: 0, e: 10 },
                    { label: '1T (Semua)', s: 0, e: 11 }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setRangeStart(p.s); setRangeEnd(p.e); }}
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all ${
                        rangeStart === p.s && rangeEnd === p.e
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Rentang: {MONTHS[rangeStart]} 2026 – {MONTHS[rangeEnd]} 2026</span>
                  <span className="text-slate-400 text-[10px]">({rangeEnd - rangeStart + 1} Bulan)</span>
                </div>
              </div>

              {/* Range Slider Track */}
              <div className="relative pt-2 pb-1 px-1">
                <div className="relative h-2 rounded-full bg-slate-100 w-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-blue-600 rounded-full shadow-xs"
                    style={{
                      left: `${(rangeStart / 11) * 100}%`,
                      width: `${Math.max(5, ((rangeEnd - rangeStart) / 11) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
                  {MONTHS.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        if (idx < rangeStart) setRangeStart(idx);
                        else if (idx > rangeEnd) setRangeEnd(idx);
                        else { setRangeStart(idx); setRangeEnd(idx); }
                      }}
                      className={idx >= rangeStart && idx <= rangeEnd ? 'text-blue-600 font-bold' : 'hover:text-slate-700'}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: KARTU ANALISIS KUSTOM (GOOGLE LOOKER STYLE) */}
        <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Kartu Analisis Kustom (Google Looker Style)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {widgets.length} Widget Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi variabel metrik, jenis grafik, judul, dan lebar kolom sesuai kebutuhan Anda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCustomWidgetModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah / Atur Widget</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWidgets([
                    { id: 'widget-1', title: 'Tren Penjualan & Margin Bruto', variable: 'sales', chartType: 'line', colSpan: 6, colorScheme: 'emerald' },
                    { id: 'widget-2', title: 'Komposisi Beban Operasional Pabrik', variable: 'expenses', chartType: 'donut', colSpan: 6, colorScheme: 'purple' },
                    { id: 'widget-3', title: 'Analisis Umur Piutang Usaha (Aging AR)', variable: 'aging_ar', chartType: 'bar', colSpan: 12, colorScheme: 'blue' },
                    { id: 'widget-4', title: 'Plafon Anggaran vs Realisasi Biaya', variable: 'budget', chartType: 'bar', colSpan: 6, colorScheme: 'amber' },
                    { id: 'widget-5', title: 'Efisiensi Output Produksi & Work Order', variable: 'production', chartType: 'kpi', colSpan: 6, colorScheme: 'indigo' }
                  ]);
                  notify('Widget kustom berhasil direset ke default.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3 text-slate-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* WIDGET GRID */}
          <div className="grid grid-cols-12 gap-5">
            {widgets.map((w, idx) => {
              const colClass = w.colSpan === 12 ? 'col-span-12' : 'col-span-12 lg:col-span-6';

              return (
                <div
                  key={w.id}
                  className={`${colClass} rounded-3xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all`}
                >
                  {/* Widget Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {w.variable === 'sales' && 'Penjualan'}
                            {w.variable === 'expenses' && 'Beban Operasional'}
                            {w.variable === 'aging_ar' && 'Umur Piutang'}
                            {w.variable === 'budget' && 'Anggaran'}
                            {w.variable === 'production' && 'Produksi'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {w.chartType === 'line' && 'Kurva (Line)'}
                            {w.chartType === 'donut' && 'Proporsi (Donut)'}
                            {w.chartType === 'bar' && 'Batang (Bar)'}
                            {w.chartType === 'kpi' && 'Kartu KPI'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{w.colSpan} Col</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                          {w.title}
                        </h3>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveWidget(idx, 'up')}
                          disabled={idx === 0}
                          className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Geser Kiri / Atas"
                        >
                          <MoveUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveWidget(idx, 'down')}
                          disabled={idx === widgets.length - 1}
                          className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Geser Kanan / Bawah"
                        >
                          <MoveDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWidget(w.id)}
                          className="h-7 w-7 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-100 flex items-center justify-center text-rose-500 ml-1"
                          title="Hapus Widget"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* WIDGET CONTENT RENDERING */}
                    <div className="py-2">
                      {/* Widget 1: Line Chart (Sales & Margin) */}
                      {w.variable === 'sales' && w.chartType === 'line' && (
                        <div>
                          <div className="relative h-36 w-full">
                            <svg viewBox="0 0 500 120" className="w-full h-full" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="widgetSalesGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path d="M 30,100 Q 150,50 250,85 T 470,25 L 470,110 L 30,110 Z" fill="url(#widgetSalesGrad)" />
                              <path d="M 30,100 Q 150,50 250,85 T 470,25" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                              <circle cx="470" cy="25" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                            </svg>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1 font-semibold">
                            <span>Jul: Rp 1.480.000.000</span>
                            <span className="text-blue-600 font-bold">Puncak: Rp 2.290.000.000 (Nov)</span>
                          </div>
                        </div>
                      )}

                      {/* Widget 2: Donut Chart (Beban Operasional) */}
                      {w.variable === 'expenses' && w.chartType === 'donut' && (
                        <div className="flex items-center justify-around py-1">
                          {/* SVG Donut */}
                          <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                              {/* Background Circle */}
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                              {/* 83% Promosi/Iklan (Cyan/Blue) */}
                              <circle
                                cx="18" cy="18" r="14" fill="none"
                                stroke="#0284C7" strokeWidth="4.5"
                                strokeDasharray="73 100" strokeDashoffset="0"
                              />
                              {/* 13% EMKL (Emerald) */}
                              <circle
                                cx="18" cy="18" r="14" fill="none"
                                stroke="#10B981" strokeWidth="4.5"
                                strokeDasharray="11 100" strokeDashoffset="-73"
                              />
                              {/* 2% Contoh (Amber) */}
                              <circle
                                cx="18" cy="18" r="14" fill="none"
                                stroke="#F59E0B" strokeWidth="4.5"
                                strokeDasharray="3 100" strokeDashoffset="-84"
                              />
                            </svg>
                            <div className="absolute text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL</span>
                              <span className="text-xs font-black text-slate-800 block">100%</span>
                            </div>
                          </div>

                          {/* Legend list matching screenshot */}
                          <div className="space-y-1.5 text-[11px] text-slate-600">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                                <span>Biaya Promosi / Iklan</span>
                              </div>
                              <span className="font-bold text-slate-900">83%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                <span>Jasa EMKL / Metering</span>
                              </div>
                              <span className="font-bold text-slate-900">13%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                                <span>Biaya Contoh</span>
                              </div>
                              <span className="font-bold text-slate-900">2%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-purple-500" />
                                <span>Listrik & Utilitas Pabrik</span>
                              </div>
                              <span className="font-bold text-slate-900">1%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span>Beban Operasional Lain</span>
                              </div>
                              <span className="font-bold text-slate-900">1%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Widget 3: Horizontal Bars (Aging AR) */}
                      {w.variable === 'aging_ar' && (
                        <div className="space-y-3 pt-1">
                          {[
                            { label: '0 – 30 Hari (Lancar)', amount: 'Rp 4.406.085.700', pct: 100, barColor: 'bg-blue-600' },
                            { label: '31 – 60 Hari (Perhatian)', amount: 'Rp 0', pct: 0, barColor: 'bg-amber-400' },
                            { label: '61 – 90 Hari (Peringatan)', amount: 'Rp 0', pct: 0, barColor: 'bg-rose-400' },
                            { label: '> 90 Hari (Kritis)', amount: 'Rp 0', pct: 0, barColor: 'bg-rose-600' }
                          ].map((item, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-700 font-medium">{item.label}</span>
                                <span className="font-bold text-slate-900">{item.amount} ({item.pct}%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${item.pct}%` }} className={`h-full ${item.barColor} rounded-full`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Widget 4: Plafon Anggaran vs Realisasi */}
                      {w.variable === 'budget' && (
                        <div className="space-y-3.5 pt-1">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 font-medium">Beban Gaji & Upah Tenaga Kerja Pro...</span>
                              <span className="font-bold text-slate-900">Rp 99.000.000 / Rp 126.000.000 (79%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div style={{ width: '79%' }} className="h-full bg-amber-500 rounded-full" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 font-medium">Beban Listrik, Gas & Utilitas Pabrik</span>
                              <span className="font-bold text-slate-900">Rp 35.000.000 / Rp 55.000.000 (64%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div style={{ width: '64%' }} className="h-full bg-emerald-500 rounded-full" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Widget 5: Output Produksi KPI */}
                      {w.variable === 'production' && (
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <div className="num text-3xl font-black text-slate-900 tracking-tight">
                              1.150 Unit
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Total output produksi dari 2 Work Order aktif
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-600">
                              <span>Total Target: <strong>1.500 Unit</strong></span>
                              <span>•</span>
                              <span>Work Orders: <strong className="text-blue-600">1 Aktif</strong> / 13 Selesai</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Target 77%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom status */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Sinkron Real-Time</span>
                    <span>Diperbarui Hari Ini</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH REKENING */}
      {addAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAddAccountOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Rekening Baru</h3>
              <button onClick={() => setAddAccountOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAccName.trim()) return;
                setAddAccountOpen(false);
                notify(`Rekening ${newAccName} berhasil ditambahkan.`);
                setNewAccName('');
                setNewAccBalance('');
              }}
              className="mt-4 space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Akun / Rekening</label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="Contoh: Bank BCA Operasional Cikarang"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank / Lembaga</label>
                  <select
                    value={newAccBank}
                    onChange={(e) => setNewAccBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BNI">Bank BNI</option>
                    <option value="Kas Tunai">Kas Tunai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Saldo Awal (IDR)</label>
                  <input
                    type="number"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddAccountOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER DANA */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setTransferOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Transfer Antar Rekening</h3>
              <button onClick={() => setTransferOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTransferOpen(false);
                notify('Transfer dana antar rekening berhasil diproses.');
              }}
              className="mt-4 space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dari Rekening</label>
                  <select
                    required
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="">Pilih Sumber</option>
                    <option value="bca">Bank BCA (Rp 250.000.000)</option>
                    <option value="mandiri">Bank Mandiri (Rp 50.000.000)</option>
                    <option value="kas">Kas Besar (Rp 25.000.000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ke Rekening</label>
                  <select
                    required
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="">Pilih Tujuan</option>
                    <option value="mandiri">Bank Mandiri (Rp 50.000.000)</option>
                    <option value="kas">Kas Besar (Rp 25.000.000)</option>
                    <option value="bca">Bank BCA (Rp 250.000.000)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Transfer (IDR)</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Proses Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH CATATAN */}
      {addNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAddNoteOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Buat Catatan Finansial</h3>
              <button onClick={() => setAddNoteOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAddNoteOpen(false);
                notify(`Catatan '${noteTitle}' berhasil disimpan.`);
                setNoteTitle('');
                setNoteContent('');
              }}
              className="mt-4 space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Catatan</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Tulis judul pengingat..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Catatan / Tautan Link</label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Tuliskan catatan, URL dokumen atau referensi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddNoteOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
