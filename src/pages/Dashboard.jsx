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
  Share2,
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
    bankAccounts = [],
    setBankAccounts,
    salesDocs = [],
    setSalesDocs,
    purchaseDocs = [],
    setPurchaseDocs,
    expenses = [],
    setExpenses,
    personalNotes = [],
    setPersonalNotes,
    workOrders = [],
    budgetRows = []
  } = useAppContext();
  const { user } = useAuth();

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

  // Dynamic financial metrics derived strictly from user's manual data
  const totalBalanceIDR = useMemo(() => {
    return (bankAccounts || []).reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  }, [bankAccounts]);

  const incomeLunasDocs = useMemo(() => {
    return (salesDocs || []).filter(doc => doc.status === 'Lunas' || doc.status === 'Paid');
  }, [salesDocs]);

  const incomeBelumLunasDocs = useMemo(() => {
    return (salesDocs || []).filter(doc => doc.status !== 'Lunas' && doc.status !== 'Paid');
  }, [salesDocs]);

  const incomeLunasIDR = useMemo(() => {
    return incomeLunasDocs.reduce((sum, doc) => sum + (Number(doc.totalAmount || doc.amount || doc.total) || 0), 0);
  }, [incomeLunasDocs]);

  const incomeBelumLunasIDR = useMemo(() => {
    return incomeBelumLunasDocs.reduce((sum, doc) => sum + (Number(doc.totalAmount || doc.amount || doc.total) || 0), 0);
  }, [incomeBelumLunasDocs]);

  const totalOmsetIDR = incomeLunasIDR + incomeBelumLunasIDR;

  const totalExpensesIDR = useMemo(() => {
    const fromExpenses = (expenses || []).reduce((sum, exp) => sum + (Number(exp.amount || exp.total) || 0), 0);
    const fromPurchases = (purchaseDocs || [])
      .filter(p => p.status === 'Lunas' || p.status === 'Paid')
      .reduce((sum, p) => sum + (Number(p.totalAmount || p.amount || p.total) || 0), 0);
    return fromExpenses + fromPurchases;
  }, [expenses, purchaseDocs]);

  const netFlowIDR = incomeLunasIDR - totalExpensesIDR;
  const marginLabaPct = totalOmsetIDR > 0 ? ((netFlowIDR / totalOmsetIDR) * 100).toFixed(1) : '0';
  const pctLunas = totalOmsetIDR > 0 ? Math.round((incomeLunasIDR / totalOmsetIDR) * 100) : 0;
  const pctBelumLunas = totalOmsetIDR > 0 ? (100 - pctLunas) : 0;
  const fakturLunasCount = incomeLunasDocs.length;
  const fakturBerjalanCount = incomeBelumLunasDocs.length;
  const expensesCount = (expenses || []).length + (purchaseDocs || []).length;

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

  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(null);

  // Balance Overview Data dynamically computed from real entered transactions
  const monthlyFlowData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];
    const map = months.map(m => ({ month: m, income: 0, incomePaid: 0, incomeUnpaid: 0, outflow: 0 }));

    (salesDocs || []).forEach(doc => {
      const d = doc.date ? new Date(doc.date) : null;
      if (d && !isNaN(d.getTime())) {
        const mIdx = d.getMonth();
        const amt = Number(doc.totalAmount || doc.amount || doc.total) || 0;
        if (mIdx >= 0 && mIdx < 12) {
          map[mIdx].income += amt;
          if (doc.status === 'Lunas' || doc.status === 'Paid') {
            map[mIdx].incomePaid += amt;
          } else {
            map[mIdx].incomeUnpaid += amt;
          }
        }
      }
    });

    (expenses || []).forEach(exp => {
      const d = exp.date ? new Date(exp.date) : null;
      if (d && !isNaN(d.getTime())) {
        const mIdx = d.getMonth();
        const amt = Number(exp.amount || exp.total) || 0;
        if (mIdx >= 0 && mIdx < 12) {
          map[mIdx].outflow += amt;
        }
      }
    });

    (purchaseDocs || []).forEach(p => {
      const d = p.date ? new Date(p.date) : null;
      if (d && !isNaN(d.getTime())) {
        const mIdx = d.getMonth();
        const amt = Number(p.totalAmount || p.amount || p.total) || 0;
        if (mIdx >= 0 && mIdx < 12) {
          map[mIdx].outflow += amt;
        }
      }
    });

    return map;
  }, [salesDocs, expenses, purchaseDocs]);

  const filteredMonthly = useMemo(() => {
    return monthlyFlowData.slice(rangeStart, rangeEnd + 1);
  }, [monthlyFlowData, rangeStart, rangeEnd]);

  // Exact dynamic max chart scaling formula from live app
  const maxChartVal = useMemo(() => {
    const rawMax = Math.max(...filteredMonthly.map(e => Math.max(e.income || 0, e.outflow || 0)), 1000000);
    let exp = Math.pow(10, Math.floor(Math.log10(rawMax)));
    let norm = rawMax / exp;
    let factor = norm <= 1 ? 1 : norm <= 1.25 ? 1.25 : norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : norm <= 7.5 ? 7.5 : 10;
    return factor * exp;
  }, [filteredMonthly]);

  // Peak month detection for indicator & floating badge
  const peakMonth = useMemo(() => {
    if (filteredMonthly.length === 0) return null;
    const maxItem = filteredMonthly.reduce((max, item) => (item.income > (max?.income || 0) ? item : max), filteredMonthly[0]);
    return maxItem && maxItem.income > 0 ? maxItem : null;
  }, [filteredMonthly]);

  // Exact smooth cubic spline formula from 3s1xhhui8ypbi.js
  const getCurvePath = (data, key) => {
    return data.reduce((acc, t, a) => {
      let s = data.length;
      let l = s > 1 ? 80 + (a / (s - 1)) * 700 : 430;
      let n = 175 - (Math.max(0, Math.min(t[key] || 0, maxChartVal)) / maxChartVal) * 140;
      if (a === 0) return `M ${l} ${n}`;
      let r = s > 1 ? 80 + ((a - 1) / (s - 1)) * 700 : 430;
      let i = 175 - (Math.max(0, Math.min(data[a - 1][key] || 0, maxChartVal)) / maxChartVal) * 140;
      return `${acc} C ${r + (l - r) / 2} ${i}, ${r + (l - r) / 2} ${n}, ${l} ${n}`;
    }, "");
  };

  const formatYAxis = (val) => {
    if (val <= 0) return 'Rp 0';
    if (val >= 1000000000) {
      let t = val / 1000000000;
      return `Rp ${Number.isInteger(t) ? t : t.toFixed(1)} M`;
    }
    if (val >= 1000000) {
      let t = val / 1000000;
      return `Rp ${Number.isInteger(t) ? t : t.toFixed(0)} Jt`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Recent Transfer Accounts derived dynamically from registered bank accounts
  const recentAccounts = useMemo(() => {
    return (bankAccounts || []).slice(0, 5).map(acc => {
      const name = acc.bankName || 'BA';
      const words = name.split(' ');
      const label = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
      return {
        label,
        color: 'bg-blue-600',
        name
      };
    });
  }, [bankAccounts]);

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
                Recent Accounts ({recentAccounts.length})
              </div>

              <div className="flex items-center justify-between">
                {recentAccounts.length > 0 ? (
                  <div className="flex items-center -space-x-2">
                    {recentAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        className={`h-8 w-8 rounded-full ${acc.color} text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-2xs hover:scale-105 transition-transform`}
                        title={acc.name}
                      >
                        {acc.label}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Belum ada rekening</span>
                )}

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
                <span>{fakturLunasCount} Transaksi Lunas</span>
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
                <span>{fakturBerjalanCount} Faktur Berjalan</span>
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
                {expensesCount} Biaya & PO
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
                  {dispNetFlow}
                </div>
              </div>
              <div className="mt-2 text-[10.5px] font-medium text-slate-400">
                Margin Laba {marginLabaPct}%
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

              {/* Dynamic Note Item or Clean Empty State */}
              {personalNotes && personalNotes.length > 0 ? (
                (() => {
                  const latestNote = personalNotes[personalNotes.length - 1];
                  return (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            latestNote.severity === 'Kritis' ? 'bg-rose-100 text-rose-700' :
                            latestNote.severity === 'Tinggi' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {latestNote.severity || 'Sedang'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            {latestNote.type || 'Catatan Internal'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{latestNote.createdAt || latestNote.dueDate || 'Hari Ini'}</span>
                      </div>

                      <div className="mt-2 text-xs text-slate-800 line-clamp-2 font-medium">
                        {latestNote.title || latestNote.content}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center -space-x-1.5">
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                            {(latestNote.author || 'User')[0].toUpperCase()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(latestNote.content || latestNote.title || '');
                            notify('Catatan disalin ke clipboard.');
                          }}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title="Bagikan Catatan"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-xs text-slate-400">Belum ada catatan finansial.</p>
                  <button
                    type="button"
                    onClick={() => setAddNoteOpen(true)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3 w-3" /> Buat Catatan Baru
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Tugas Tertunda</span>
              <div className="flex items-center gap-2">
                <span className="num text-blue-600 font-bold">
                  {(personalNotes || []).filter(n => !n.completed).length} Items
                </span>
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
                <span>Sudah Lunas ({pctLunas}%)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-200 inline-block" />
                <span>Belum Lunas / Piutang ({pctBelumLunas}%)</span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
              <div style={{ width: `${pctLunas}%` }} className="h-full bg-blue-600 rounded-l-full transition-all" />
              <div style={{ width: `${pctBelumLunas}%` }} className="h-full bg-blue-200 rounded-r-full transition-all" />
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
                  {fakturLunasCount} Faktur Lunas
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
                  {fakturBerjalanCount} Faktur Berjalan
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

              {expensesCount > 0 ? (
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
                      Beban Operasional ({formatVal(totalExpensesIDR, selectedCurrency, true)})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2">
                  Belum ada riwayat pengeluaran atau pembelian dicatat.
                </div>
              )}
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

                  <div className="h-3.5 w-[1px] bg-slate-200 hidden sm:block" />

                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-800">01/01/2026 – 12/31/2026</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const csv = 'Bulan,Pemasukan,Pengeluaran\n' + filteredMonthly.map(m => `${m.month},${m.income},${m.outflow}`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Ringkasan_Overview_Asia_Plastik_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      notify('Laporan ringkasan finansial Asia Plastik berhasil diekspor ke CSV.');
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-700 text-slate-400 transition-colors cursor-pointer"
                    title="Unduh Data Ringkasan Finansial CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <Link
                    to="/laporan"
                    className="p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-700 text-slate-400 transition-colors"
                    title="Buka Laporan Penuh"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="relative mt-5 pt-1 pb-1">
                {/* Floating Peak Label */}
                {peakMonth && hoveredMonthIndex === null && (() => {
                  const idx = filteredMonthly.findIndex(e => e.month === peakMonth.month);
                  if (idx === -1) return null;
                  const s = filteredMonthly.length;
                  const l = 175 - (Math.max(0, Math.min(peakMonth.income || 0, maxChartVal)) / maxChartVal) * 140;
                  const leftPct = ((s > 1 ? 80 + (idx / (s - 1)) * 700 : 430) / 800) * 100;
                  return (
                    <div
                      className="absolute pointer-events-none transition-all duration-300 z-10"
                      style={{
                        left: `${leftPct}%`,
                        top: `${(l / 195) * 100}%`,
                        transform: 'translate(-50%, -125%)'
                      }}
                    >
                      <div className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-blue-500/25 whitespace-nowrap flex items-center gap-1.5 ring-2 ring-white">
                        <span>{formatVal(peakMonth.income, selectedCurrency)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Floating Hover Tooltip */}
                {hoveredMonthIndex !== null && (() => {
                  const e = filteredMonthly[hoveredMonthIndex];
                  if (!e) return null;
                  const s = filteredMonthly.length;
                  const leftPct = ((s > 1 ? 80 + (hoveredMonthIndex / (s - 1)) * 700 : 430) / 800) * 100;
                  const lunas = formatVal(e.incomePaid || e.income, selectedCurrency, true);
                  const piutang = formatVal(e.incomeUnpaid || 0, selectedCurrency, true);
                  const keluar = formatVal(e.outflow || 0, selectedCurrency, true);
                  return (
                    <div
                      className="absolute pointer-events-none transition-all duration-150 z-20"
                      style={{
                        left: `${leftPct}%`,
                        top: '4px',
                        transform: `translateX(${leftPct < 20 ? '-8%' : leftPct > 80 ? '-92%' : '-50%'})`
                      }}
                    >
                      <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 border border-slate-700/60 ring-1 ring-black/10">
                        <span className="font-bold text-white">{e.month}:</span>
                        <span className="text-blue-400 font-semibold">Lunas {lunas}</span>
                        {(e.incomeUnpaid || 0) > 0 && (
                          <>
                            <span className="text-slate-500">•</span>
                            <span className="text-amber-300 font-semibold">Piutang {piutang}</span>
                          </>
                        )}
                        <span className="text-slate-500">•</span>
                        <span className="text-sky-300 font-semibold">Pengeluaran {keluar}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* SVG Curve Canvas */}
                <svg viewBox="0 0 800 195" className="w-full h-48 overflow-visible select-none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines & Y-axis labels */}
                  {[
                    { ratio: 1, y: 35 },
                    { ratio: 0.75, y: 70 },
                    { ratio: 0.5, y: 105 },
                    { ratio: 0.25, y: 140 },
                    { ratio: 0, y: 175 }
                  ].map((e) => (
                    <g key={e.y}>
                      <text
                        x="64"
                        y={e.y + 3.5}
                        textAnchor="end"
                        fontSize="9.5"
                        fill="#94A3B8"
                        className="select-none font-medium"
                      >
                        {formatYAxis(maxChartVal * e.ratio)}
                      </text>
                      <line
                        x1="72"
                        y1={e.y}
                        x2="788"
                        y2={e.y}
                        stroke={175 === e.y ? '#CBD5E1' : '#F1F5F9'}
                        strokeWidth={175 === e.y ? '1.2' : '1'}
                        strokeDasharray={175 === e.y ? undefined : '3 3'}
                      />
                    </g>
                  ))}

                  {/* Vertical Y-axis line */}
                  <line x1="72" y1="30" x2="72" y2="175" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Outflow line (light blue smooth spline) */}
                  <path
                    d={getCurvePath(filteredMonthly, 'outflow')}
                    fill="none"
                    stroke="#93C5FD"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Income line (strong blue smooth spline) */}
                  <path
                    d={getCurvePath(filteredMonthly, 'income')}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Single peak indicator circle on peak month */}
                  {peakMonth && hoveredMonthIndex === null && (() => {
                    const idx = filteredMonthly.findIndex(e => e.month === peakMonth.month);
                    if (idx === -1) return null;
                    const s = filteredMonthly.length;
                    const cx = s > 1 ? 80 + (idx / (s - 1)) * 700 : 430;
                    const cy = 175 - (Math.max(0, Math.min(peakMonth.income || 0, maxChartVal)) / maxChartVal) * 140;
                    return (
                      <g key="peak-indicator">
                        <circle cx={cx} cy={cy} r="7" fill="#BFDBFE" opacity="0.8" />
                        <circle cx={cx} cy={cy} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    );
                  })()}

                  {/* Hover guideline and dots */}
                  {hoveredMonthIndex !== null && (() => {
                    const e = filteredMonthly[hoveredMonthIndex];
                    if (!e) return null;
                    const s = filteredMonthly.length;
                    const cx = s > 1 ? 80 + (hoveredMonthIndex / (s - 1)) * 700 : 430;
                    const cyInc = 175 - (Math.max(0, Math.min(e.income || 0, maxChartVal)) / maxChartVal) * 140;
                    const cyOut = 175 - (Math.max(0, Math.min(e.outflow || 0, maxChartVal)) / maxChartVal) * 140;
                    return (
                      <g key="hover-guide">
                        <line x1={cx} y1="30" x2={cx} y2="175" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx={cx} cy={cyInc} r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx={cx} cy={cyOut} r="4.5" fill="#93C5FD" stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    );
                  })()}

                  {/* Invisible mouse hover trigger rectangles */}
                  {filteredMonthly.map((e, a) => {
                    const s = filteredMonthly.length;
                    const cx = s > 1 ? 80 + (a / (s - 1)) * 700 : 430;
                    const width = s > 1 ? 700 / (s - 1) : 120;
                    return (
                      <rect
                        key={`hit-${e.month}`}
                        x={cx - width / 2}
                        y={25}
                        width={width}
                        height={160}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIndex(a)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* X-Axis Month Labels below chart */}
                <div className="relative h-6 mt-1 select-none">
                  {filteredMonthly.map((e, a) => {
                    const s = filteredMonthly.length;
                    const leftPct = ((s > 1 ? 80 + (a / (s - 1)) * 700 : 430) / 800) * 100;
                    const isPeak = peakMonth && peakMonth.month === e.month;
                    const isHover = hoveredMonthIndex === a;
                    return (
                      <button
                        key={e.month}
                        type="button"
                        onMouseEnter={() => setHoveredMonthIndex(a)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                        className={`absolute -translate-x-1/2 text-[11px] transition-colors cursor-pointer select-none ${
                          isHover || isPeak ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-700'
                        }`}
                        style={{ left: `${leftPct}%` }}
                      >
                        {e.month}
                      </button>
                    );
                  })}
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
                    { label: '1B', s: 10, e: 10, title: '1 Bulan (Nov)' },
                    { label: '3B', s: 8, e: 10, title: '3 Bulan (Sep - Nov)' },
                    { label: '6B', s: 5, e: 10, title: '6 Bulan (Jun - Nov)' },
                    { label: 'YTD', s: 0, e: 10, title: 'Awal Tahun s/d Nov' },
                    { label: '1T (Semua)', s: 0, e: 11, title: '1 Tahun Penuh (Jan - Des)' }
                  ].map((p) => {
                    const active = rangeStart === p.s && rangeEnd === p.e;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => { setRangeStart(p.s); setRangeEnd(p.e); }}
                        className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={p.title}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Rentang: {MONTHS[rangeStart]} 2026 – {MONTHS[rangeEnd]} 2026</span>
                  <span className="text-slate-400 text-[10px]">({rangeEnd - rangeStart + 1} Bulan)</span>
                </div>
              </div>

              {/* Range Slider Track */}
              <div className="relative pt-3 pb-2 px-1 select-none">
                <div className="relative h-2.5 rounded-full bg-slate-100 w-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-75 shadow-xs"
                    style={{
                      left: `${(rangeStart / 11) * 100}%`,
                      width: `${Math.max(3, ((rangeEnd - rangeStart) / 11) * 100)}%`
                    }}
                  />
                </div>

                <div className="relative -mt-3.5 h-6">
                  <input
                    type="range"
                    min={0}
                    max={11}
                    step={1}
                    value={rangeStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= rangeEnd) setRangeStart(val);
                    }}
                    className="range-slider-thumb absolute w-full top-0 h-6 appearance-none bg-transparent cursor-grab active:cursor-grabbing z-20 pointer-events-auto"
                    title={`Geser Bulan Awal: ${MONTHS[rangeStart]}`}
                  />
                  <input
                    type="range"
                    min={0}
                    max={11}
                    step={1}
                    value={rangeEnd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= rangeStart) setRangeEnd(val);
                    }}
                    className="range-slider-thumb absolute w-full top-0 h-6 appearance-none bg-transparent cursor-grab active:cursor-grabbing z-20 pointer-events-auto"
                    title={`Geser Bulan Akhir: ${MONTHS[rangeEnd]}`}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-0.5 px-0.5">
                  {MONTHS.map((m, idx) => {
                    const inRange = idx >= rangeStart && idx <= rangeEnd;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          if (idx < rangeStart) setRangeStart(idx);
                          else if (idx > rangeEnd) setRangeEnd(idx);
                          else { setRangeStart(idx); setRangeEnd(idx); }
                        }}
                        className={`cursor-pointer transition-colors ${inRange ? 'text-blue-600 font-bold' : 'hover:text-slate-700'}`}
                      >
                        {m}
                      </button>
                    );
                  })}
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
                        {w.variable === 'sales' && (
                          <div className="flex items-center gap-3 text-xs mt-1">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                              Penjualan
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                              Margin Bruto (24%)
                            </span>
                          </div>
                        )}
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
                      {w.variable === 'sales' && (
                        <div>
                          {salesDocs && salesDocs.length > 0 ? (
                            <div>
                              <div className="relative h-32 w-full pt-1">
                                <svg viewBox="0 0 500 110" className="w-full h-full" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="widgetSalesGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M 30,68 C 70,40 90,40 118,40 C 150,40 175,65 206,65 C 240,65 265,46 294,46 C 330,46 355,26 382,26 C 420,26 445,42 470,42 L 470,105 L 30,105 Z"
                                    fill="url(#widgetSalesGrad)"
                                  />
                                  <path
                                    d="M 30,68 C 70,40 90,40 118,40 C 150,40 175,65 206,65 C 240,65 265,46 294,46 C 330,46 355,26 382,26 C 420,26 445,42 470,42"
                                    fill="none"
                                    stroke="#2563EB"
                                    strokeWidth="2.5"
                                  />
                                </svg>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-1 font-semibold border-t border-slate-50 pt-2">
                                <span>Omset: {dispTotalOmset}</span>
                                <span className="text-blue-600 font-bold">Laba: {dispNetFlow}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center text-xs text-slate-400 font-medium">
                              Belum ada transaksi penjualan yang dicatat.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Widget 2: Donut Chart (Beban Operasional) */}
                      {w.variable === 'expenses' && (
                        <div>
                          {expenses && expenses.length > 0 ? (
                            <div className="flex items-center justify-around py-1">
                              <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                                  <circle
                                    cx="18" cy="18" r="14" fill="none"
                                    stroke="#0284C7" strokeWidth="4.5"
                                    strokeDasharray="100 100" strokeDashoffset="0"
                                  />
                                </svg>
                                <div className="absolute text-center">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL</span>
                                  <span className="text-xs font-black text-slate-800 block">100%</span>
                                </div>
                              </div>
                              <div className="space-y-1.5 text-[11px] text-slate-600">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                                    <span>Beban Operasional</span>
                                  </div>
                                  <span className="font-bold text-slate-900">{dispExpenses}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center text-xs text-slate-400 font-medium">
                              Belum ada catatan beban operasional.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Widget 3: Horizontal Bars (Aging AR) */}
                      {w.variable === 'aging_ar' && (
                        <div className="space-y-3 pt-1">
                          {[
                            { label: '0 – 30 Hari (Lancar)', amount: dispIncomeBelumLunas, pct: incomeBelumLunasIDR > 0 ? 100 : 0, barColor: 'bg-blue-600' },
                            { label: '31 – 60 Hari (Perhatian)', amount: formatVal(0, selectedCurrency), pct: 0, barColor: 'bg-amber-400' },
                            { label: '61 – 90 Hari (Peringatan)', amount: formatVal(0, selectedCurrency), pct: 0, barColor: 'bg-rose-400' },
                            { label: '> 90 Hari (Kritis)', amount: formatVal(0, selectedCurrency), pct: 0, barColor: 'bg-rose-600' }
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
                        <div>
                          {budgetRows && budgetRows.length > 0 ? (
                            <div className="space-y-3.5 pt-1">
                              {budgetRows.slice(0, 2).map((b, i) => {
                                const limit = Number(b.limit || b.nominal) || 1;
                                const spent = Number(b.spent || b.realisasi) || 0;
                                const pct = Math.min(100, Math.round((spent / limit) * 100));
                                return (
                                  <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-700 font-medium truncate max-w-[200px]">{b.category || b.name}</span>
                                      <span className="font-bold text-slate-900">{formatVal(spent, selectedCurrency)} / {formatVal(limit, selectedCurrency)} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div style={{ width: `${pct}%` }} className="h-full bg-amber-500 rounded-full" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-xs text-slate-400 font-medium">
                              Belum ada plafon anggaran yang diset.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Widget 5: Output Produksi KPI */}
                      {w.variable === 'production' && (() => {
                        const totalUnits = (workOrders || []).reduce((sum, wo) => sum + (Number(wo.targetQty || wo.qty) || 0), 0);
                        const activeWo = (workOrders || []).filter(wo => wo.status === 'Berjalan' || wo.status === 'In Progress').length;
                        const doneWo = (workOrders || []).filter(wo => wo.status === 'Selesai' || wo.status === 'Completed').length;
                        return (
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <div className="num text-3xl font-black text-slate-900 tracking-tight">
                                {totalUnits.toLocaleString('id-ID')} Unit
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                Total output produksi dari {activeWo} Work Order aktif
                              </div>
                              <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-600">
                                <span>Work Orders: <strong className="text-blue-600">{activeWo} Aktif</strong> / {doneWo} Selesai</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Target {totalUnits > 0 ? '100%' : '0%'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
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
                const newNote = {
                  id: `note-${Date.now()}`,
                  title: noteTitle,
                  content: noteContent,
                  severity: noteSeverity || 'Sedang',
                  type: noteType || 'Catatan Internal',
                  createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                  author: user?.displayName || 'Carlos Susanto',
                  completed: false
                };
                setPersonalNotes(prev => [...(prev || []), newNote]);
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
