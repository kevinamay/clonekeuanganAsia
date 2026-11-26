import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/format';
import {
  FilePlus2,
  Users,
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
  ShieldCheck,
  RotateCcw,
  Building2,
  Package,
  Plus,
  Lock
} from 'lucide-react';

const defaultVendorsData = [
  {
    id: 'vnd-1',
    code: 'VND-001',
    name: 'PT MITRA GLOBAL PLASTINDO',
    category: 'Bahan Baku Plastik',
    phone: '021-8984-2200',
    email: 'sales@mitraglobal.co.id',
    address: 'Kawasan Industri Jababeka V, Cikarang',
    paymentTerm: 'Net 30',
    bankName: 'BCA',
    bankAccount: '8223-5000-89',
    bankHolder: 'PT Mitra Global Plastindo',
    status: 'Aktif'
  },
  {
    id: 'vnd-2',
    code: 'VND-002',
    name: 'Pamerindo Indonesia',
    category: 'Jasa & Pameran',
    phone: '021-2525-320',
    email: 'info@pamerindo.com',
    address: 'Menara Jamsostek Lt. 12, Jakarta Selatan',
    paymentTerm: 'Net 30',
    bankName: 'Mandiri',
    bankAccount: '141-00-2772799-9',
    bankHolder: 'PT Pamerindo Indonesia',
    status: 'Aktif'
  },
  {
    id: 'vnd-3',
    code: 'VND-003',
    name: 'LIEK MOTOR',
    category: 'Kendaraan & Armada',
    phone: '031-503-4455',
    email: 'fleet@liekmotor.com',
    address: 'Jl. Walikota Mustajab No. 2, Surabaya',
    paymentTerm: 'Net 30',
    bankName: 'BCA',
    bankAccount: '018-388-9900',
    bankHolder: 'PT Liek Motor Surabaya',
    status: 'Aktif'
  },
  {
    id: 'vnd-4',
    code: 'VND-004',
    name: 'NINGBO TONGSHENG NETWORK TECHN',
    category: 'Mesin & Suku Cadang',
    phone: '+86-574-8899-221',
    email: 'export@tongsheng-cn.com',
    address: 'Ningbo Free Trade Zone, Zhejiang, China',
    paymentTerm: 'Net 30',
    bankName: 'BCA Valas USD',
    bankAccount: '8221-8900-01',
    bankHolder: 'Ningbo Tongsheng Network',
    status: 'Aktif'
  },
  {
    id: 'vnd-5',
    code: 'VND-005',
    name: 'NINGBO QIMING MACHINERY MANUFACTURING CO.,LTD.',
    category: 'Mesin & Peralatan Pabrik',
    phone: '+86-574-8771-332',
    email: 'sales@qiming-machinery.cn',
    address: 'Yuyao Plastic Industrial City, Ningbo, China',
    paymentTerm: 'Net 30',
    bankName: 'BCA Valas USD',
    bankAccount: '8221-8900-01',
    bankHolder: 'Ningbo Qiming Machinery Co Ltd',
    status: 'Aktif'
  },
  {
    id: 'vnd-6',
    code: 'VND-006',
    name: 'HANGZHOU LISHIDA TRADING CO.,LTD',
    category: 'Bahan Baku & Trading',
    phone: '+86-571-8822-110',
    email: 'trade@lishida-hz.com',
    address: 'Xiaoshan Economic Zone, Hangzhou, China',
    paymentTerm: 'Net 30',
    bankName: 'BCA Valas USD',
    bankAccount: '8221-8900-01',
    bankHolder: 'Hangzhou Lishida Trading',
    status: 'Aktif'
  },
  {
    id: 'vnd-7',
    code: 'VND-007',
    name: 'ZHEJIANG RISINGSUN INTER TRANS CO',
    category: 'Jasa Ekspedisi & Logistik',
    phone: '+86-571-8551-998',
    email: 'shipping@risingsun-logistics.cn',
    address: 'Ningbo Port International Logistics Hub, Zhejiang',
    paymentTerm: 'Net 30',
    bankName: 'BCA Valas USD',
    bankAccount: '8221-8900-01',
    bankHolder: 'Zhejiang Risingsun Logistics',
    status: 'Aktif'
  },
  {
    id: 'vnd-8',
    code: 'VND-008',
    name: 'TAIZHOU WATON MACHINERY CO.,LTD',
    category: 'Mesin Moulding',
    phone: '+86-576-8401-229',
    email: 'info@waton-blower.com',
    address: 'Huangyan Mould Industrial City, Taizhou, China',
    paymentTerm: 'Net 30',
    bankName: 'BCA Valas USD',
    bankAccount: '8221-8900-01',
    bankHolder: 'Taizhou Waton Machinery Co Ltd',
    status: 'Aktif'
  }
];

const defaultPurchaseDocsData = [
  {
    id: 'po-1',
    number: 'PO-5607',
    type: 'Purchase Order',
    vendor: 'Pamerindo Indonesia',
    warehouse: 'Gudang Utama Cikarang',
    date: '2026-11-14',
    dueDate: '2026-12-14',
    total: 99393840,
    paid: 0,
    status: 'Belum Dibayar',
    description: 'Jasa Penyelenggaraan Pameran Plastics & Rubber Indonesia 2026',
    items: [
      { id: 'poi-1', name: 'Jasa Penyelenggaraan Pameran', qty: 1, unit: 'Paket', price: 99393840 }
    ]
  },
  {
    id: 'po-2',
    number: 'PO-0892',
    type: 'Purchase Order',
    vendor: 'PT MITRA GLOBAL PLASTINDO',
    warehouse: 'Gudang Utama Cikarang',
    date: '2026-11-12',
    dueDate: '2026-12-12',
    total: 176601000,
    paid: 0,
    status: 'Belum Dibayar',
    description: 'Bijih Plastik PP & HDPE Film Grade',
    items: [
      { id: 'poi-2a', name: 'Bijih Plastik PP (Polypropylene) Natural - Grade A', qty: 5000, unit: 'Kg', price: 18500 },
      { id: 'poi-2b', name: 'Bahan Baku HDPE (High-Density Polyethylene) Red', qty: 3000, unit: 'Kg', price: 19500 },
      { id: 'poi-2c', name: 'Masterbatch Pigment Red', qty: 200, unit: 'Kg', price: 72000 }
    ]
  },
  {
    id: 'po-3',
    number: 'PO-2026',
    type: 'Purchase Order',
    vendor: 'PT MITRA GLOBAL PLASTINDO',
    warehouse: 'Gudang Utama Cikarang',
    date: '2026-11-12',
    dueDate: '2026-12-12',
    total: 176601000,
    paid: 0,
    status: 'Belum Dibayar',
    description: 'Bijih Plastik PP & HDPE Film Grade',
    items: [
      { id: 'poi-3a', name: 'Bijih Plastik PP (Polypropylene) Natural - Grade A', qty: 5000, unit: 'Kg', price: 18500 },
      { id: 'poi-3b', name: 'Bahan Baku HDPE (High-Density Polyethylene) Red', qty: 3000, unit: 'Kg', price: 19500 },
      { id: 'poi-3c', name: 'Masterbatch Pigment Red', qty: 200, unit: 'Kg', price: 72000 }
    ]
  },
  {
    id: 'po-4',
    number: 'PO-MHKAA1BY5SK07361',
    type: 'Purchase Order',
    vendor: 'LIEK MOTOR',
    warehouse: 'Head Office & Operasional Pabrik',
    date: '2026-01-20',
    dueDate: '2026-02-20',
    total: 221431000,
    paid: 221431000,
    status: 'Lunas',
    description: 'Pelunasan Pengadaan Armada Toyota Avanza 1.3 E CVT Pabrik',
    items: [
      { id: 'poi-4', name: 'Toyota Avanza 1.3 E CVT Operasional', qty: 1, unit: 'Unit', price: 221431000 }
    ]
  },
  {
    id: 'po-5',
    number: 'PO-2025-009',
    type: 'Purchase Order',
    vendor: 'NINGBO TONGSHENG NETWORK TECHN',
    warehouse: 'Gudang Utama Cikarang',
    date: '2026-03-12',
    dueDate: '2026-04-12',
    total: 640679,
    paid: 640679,
    status: 'Lunas',
    description: 'Suku Cadang Komponen Elektronik Extruder',
    items: [
      { id: 'poi-5', name: 'Sparepart Sensor Termokopel & PLC Module', qty: 5, unit: 'Set', price: 128135 }
    ]
  },
  {
    id: 'po-6',
    number: 'PO-2025-031',
    type: 'Purchase Order',
    vendor: 'NINGBO QIMING MACHINERY MANUFACTURING CO.,LTD.',
    warehouse: 'Gudang Utama Cikarang - Line Produksi 2',
    date: '2026-04-15',
    dueDate: '2026-05-15',
    total: 1069342494,
    paid: 1069342494,
    status: 'Lunas',
    description: 'Pengadaan Mesin Blow Molding Botol Agrokimia MP70D-2',
    items: [
      { id: 'poi-6', name: 'Mesin Blow Molding Otomatis MP70D-2', qty: 1, unit: 'Set', price: 1069342494 }
    ]
  },
  {
    id: 'po-7',
    number: 'PO-PIB 01001',
    type: 'Purchase Order',
    vendor: 'HANGZHOU LISHIDA TRADING CO.,LTD',
    warehouse: 'Gudang Utama Cikarang - Line Produksi 3',
    date: '2026-05-18',
    dueDate: '2026-06-18',
    total: 751545799,
    paid: 751545799,
    status: 'Lunas',
    description: 'Pengadaan Bahan Baku Resin Film Grade HF7000 Batch 3',
    items: [
      { id: 'poi-7', name: 'Resin Plastik HDPE Film HF7000 Import', qty: 38000, unit: 'Kg', price: 19777 }
    ]
  },
  {
    id: 'po-8',
    number: 'PO-2025-033',
    type: 'Purchase Order',
    vendor: 'ZHEJIANG RISINGSUN INTER TRANS CO',
    warehouse: 'Gudang Utama Cikarang',
    date: '2026-06-14',
    dueDate: '2026-07-14',
    total: 72491584,
    paid: 72491584,
    status: 'Lunas',
    description: 'Jasa Freight Forwarding & Ocean Container 40ft',
    items: [
      { id: 'poi-8', name: 'Ocean Freight & Handling Container 40ft', qty: 2, unit: 'Container', price: 36245792 }
    ]
  },
  {
    id: 'po-9',
    number: 'PO-PIB 1523',
    type: 'Purchase Order',
    vendor: 'TAIZHOU WATON MACHINERY CO.,LTD',
    warehouse: 'Gudang Utama Cikarang - Workshop',
    date: '2026-07-20',
    dueDate: '2026-08-20',
    total: 595414028,
    paid: 595414028,
    status: 'Lunas',
    description: 'Mesin Linear Stretch Blow Molding 4 Cavity',
    items: [
      { id: 'poi-9', name: 'Mesin Stretch Blow Molding 4 Cavity High Speed', qty: 1, unit: 'Unit', price: 595414028 }
    ]
  },
  {
    id: 'po-10',
    number: 'PO-PIB 1006',
    type: 'Purchase Order',
    vendor: 'NINGBO QIMING MACHINERY MANUFACTURING CO.,LTD.',
    warehouse: 'Gudang Utama Cikarang - Line Produksi 1',
    date: '2026-08-16',
    dueDate: '2026-09-16',
    total: 1667454403,
    paid: 1667454403,
    status: 'Lunas',
    description: 'Line Extrusion T-Die 75mm Heavy Duty & Moulding Injection',
    items: [
      { id: 'poi-10', name: 'Lini Mesin Extruder 75mm T-Die Lengkap', qty: 1, unit: 'Line', price: 1667454403 }
    ]
  },
  {
    id: 'po-11',
    number: 'PO-WLK GF25090239',
    type: 'Purchase Order',
    vendor: 'LIEK MOTOR',
    warehouse: 'Head Office',
    date: '2026-09-02',
    dueDate: '2026-10-02',
    total: 178171,
    paid: 178171,
    status: 'Lunas',
    description: 'Servis Berkala & Penggantian Sparepart Kendaraan Operasional',
    items: [
      { id: 'poi-11', name: 'Filter Oli & Servis Rutin Armada Pabrik', qty: 1, unit: 'Paket', price: 178171 }
    ]
  }
];

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
  } else if (n.includes('menunggu approval') || n.includes('butuh persetujuan')) {
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

// Payment Modal Component for Outgoing (Vendor AP)
function OutgoingPaymentModal({
  open,
  onClose,
  docNumber,
  partyName,
  partyRole = 'Pemasok (Vendor)',
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
  const isInsufficient = selectedBank && selectedBank.balanceBank < validAmount;

  const handleQuickSelect = (type, amt, label) => {
    setQuickType(type);
    setScheme(amt >= remaining ? 'full' : 'partial');
    setAmount(amt);
    if (!note || note.startsWith('Pembayaran DP') || note.startsWith('Pelunasan') || note.startsWith('Termin')) {
      if (amt >= remaining) {
        setNote(`Pelunasan tagihan PO ${docNumber} ke ${partyName}`);
      } else {
        setNote(`Pembayaran ${label} PO ${docNumber} ke ${partyName}`);
      }
    }
  };

  const handleSchemeChange = (newScheme) => {
    setScheme(newScheme);
    if (newScheme === 'full') {
      setAmount(remaining);
      setQuickType('remaining');
      if (!note || note.startsWith('Pembayaran DP') || note.startsWith('Termin')) {
        setNote(`Pelunasan penuh PO ${docNumber} ke ${partyName}`);
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
            <h3 className="text-sm font-bold text-slate-900">Catat Pembayaran Tagihan — {docNumber}</h3>
            <p className="text-[11px] text-slate-500">
              {partyRole}: {partyName} · Pengeluaran Kas / Bank ke Pemasok
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">Sudah Dibayar</span>
                <span className="font-mono text-xs font-bold text-emerald-700 block mt-0.5">{formatRupiah(alreadyPaid)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 block">Sisa Utang</span>
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
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nominal yang Dibayarkan (IDR) *</label>
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
              <span className="text-slate-600">Sisa Utang Setelah Ini:</span>
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

          {/* Bank Account Selection (Sumber Dana) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Pilih Rekening Sumber Dana (Kas / Bank)
            </label>
            <select
              value={targetBankId}
              onChange={(e) => setTargetBankId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Catat Transaksi Saja (Tanpa Pengurangan Kas Bank) --</option>
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
              placeholder="Contoh: Transfer termin 1 via BCA Giro ref #9982, pelunasan material..."
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
                {nextStatus === 'Lunas' ? 'Konfirmasi Pelunasan' : 'Konfirmasi Bayar'} ({formatRupiah(validAmount)})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Pembelian() {
  const {
    purchaseDocs: contextPurchaseDocs = [],
    setPurchaseDocs,
    vendors: contextVendors = [],
    setVendors,
    products = [],
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

  // Use full defaults if context has partial data
  const purchaseDocs = useMemo(() => {
    return contextPurchaseDocs && contextPurchaseDocs.length >= 11
      ? contextPurchaseDocs
      : defaultPurchaseDocsData;
  }, [contextPurchaseDocs]);

  const vendors = useMemo(() => {
    return contextVendors && contextVendors.length >= 8
      ? contextVendors
      : defaultVendorsData;
  }, [contextVendors]);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [timeFilter, setTimeFilter] = useState('semua');

  // Modals state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newVendorModalOpen, setNewVendorModalOpen] = useState(false);
  const [paymentDoc, setPaymentDoc] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // New PO form state
  const [newType, setNewType] = useState('Purchase Order');
  const [newVendor, setNewVendor] = useState('');
  const [newWarehouse, setNewWarehouse] = useState('Gudang Utama Cikarang');
  const [newDate, setNewDate] = useState('2026-11-13');
  const [newDueDate, setNewDueDate] = useState('2026-12-13');
  const [newPpnRate, setNewPpnRate] = useState(11);
  const [newDownPayment, setNewDownPayment] = useState(0);
  const [newItems, setNewItems] = useState([
    { id: 'li-1', name: 'Resin HDPE Film Grade HF7000', qty: 2500, unit: 'Kg', price: 20000 }
  ]);

  // New Vendor form state
  const [vendorCode, setVendorCode] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Bahan Baku Plastik');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorPaymentTerm, setVendorPaymentTerm] = useState('Net 30');

  // KPI Calculations
  const totalUnpaidAP = useMemo(() => {
    return purchaseDocs
      .filter((d) => d.status !== 'Lunas')
      .reduce((sum, d) => sum + Math.max(0, (d.total || 0) - (d.paid || 0)), 0);
  }, [purchaseDocs]);

  const overdueAP = useMemo(() => {
    return purchaseDocs
      .filter((d) => d.status === 'Jatuh Tempo')
      .reduce((sum, d) => sum + Math.max(0, (d.total || 0) - (d.paid || 0)), 0);
  }, [purchaseDocs]);

  const pendingApprovalCount = useMemo(() => {
    return purchaseDocs.filter((d) => d.status === 'Menunggu Approval' || d.status === 'Butuh Persetujuan').length;
  }, [purchaseDocs]);

  // Filtered purchase documents
  const filteredPurchaseDocs = useMemo(() => {
    return purchaseDocs.filter((doc) => {
      // Tab filter
      if (activeTab === 'po-pr') {
        const isPo = doc.type === 'Purchase Order' || doc.type === 'Purchase Request';
        if (!isPo) return false;
      } else if (activeTab === 'approval') {
        if (doc.status !== 'Menunggu Approval' && doc.status !== 'Butuh Persetujuan') return false;
      } else if (activeTab === 'debit') {
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
        const matchVendor = doc.vendor && doc.vendor.toLowerCase().includes(q);
        if (!matchNumber && !matchVendor) return false;
      }

      return true;
    });
  }, [purchaseDocs, activeTab, statusFilter, timeFilter, searchQuery]);

  // Handler: Add Line Item in New PO Modal
  const handleAddItem = () => {
    setNewItems((prev) => [
      ...prev,
      { id: `li-${Date.now()}`, name: '', qty: 1, unit: 'Kg', price: 0 }
    ]);
  };

  const handleItemChange = (idx, field, val) => {
    setNewItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveItem = (idx) => {
    if (newItems.length <= 1) return;
    setNewItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const newSubtotal = useMemo(() => {
    return newItems.reduce((acc, curr) => acc + (Number(curr.qty) || 0) * (Number(curr.price) || 0), 0);
  }, [newItems]);

  const newPpnAmount = Math.round((newSubtotal * newPpnRate) / 100);
  const newTotal = newSubtotal + newPpnAmount;

  // Handler: Submit New Purchase Document
  const handleCreatePOSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.trim() || newTotal <= 0) return;

    const paidAmount = Number(newDownPayment) || 0;
    const newDoc = {
      id: `po-${Date.now()}`,
      number: `PO-${2026}-${1100 + purchaseDocs.length + 1}`,
      type: newType,
      vendor: newVendor.trim(),
      warehouse: newWarehouse,
      date: newDate || new Date().toISOString().split('T')[0],
      dueDate: newDueDate || new Date(Date.now() + 2592000000).toISOString().split('T')[0],
      total: newTotal,
      paid: paidAmount,
      status: paidAmount >= newTotal ? 'Lunas' : paidAmount > 0 ? 'Terbayar Sebagian' : 'Belum Dibayar',
      description: newItems.map((it) => it.name).filter(Boolean).join(', '),
      items: newItems.map((it) => ({
        id: it.id,
        name: it.name,
        qty: Number(it.qty) || 1,
        unit: it.unit || 'Kg',
        price: Number(it.price) || 0
      }))
    };

    setPurchaseDocs((prev) => [newDoc, ...prev]);

    const auditEntry = {
      time: 'Baru saja',
      user: currentUser?.name || 'Carlos Susanto',
      action: `PO Baru Dibuat: ${newDoc.number} (${newDoc.vendor}) senilai ${formatRupiah(newDoc.total)}`,
      module: 'Pembelian'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    setNewModalOpen(false);
    setNewVendor('');
    setNewDownPayment(0);
    notify(`${newDoc.number} berhasil diterbitkan dan tersimpan di sistem.`);
  };

  // Handler: Submit New Vendor
  const handleCreateVendorSubmit = (e) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const newV = {
      id: `vnd-${Date.now()}`,
      code: vendorCode.trim() || `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      name: vendorName.trim(),
      category: vendorCategory,
      phone: vendorPhone.trim() || '-',
      email: vendorEmail.trim() || '-',
      address: vendorAddress.trim() || '-',
      paymentTerm: vendorPaymentTerm,
      status: 'Aktif'
    };

    setVendors((prev) => [newV, ...prev]);

    const auditEntry = {
      time: 'Baru saja',
      user: currentUser?.name || 'Carlos Susanto',
      action: `Tambah Vendor Baru: ${newV.code} - ${newV.name} (${newV.category})`,
      module: 'Pembelian'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    setNewVendorModalOpen(false);
    setVendorName('');
    setVendorCode('');
    setVendorPhone('');
    setVendorEmail('');
    setVendorAddress('');
    notify(`Vendor "${newV.name}" (${newV.code}) berhasil didaftarkan ke sistem.`);
  };

  // Handler: Confirm outgoing payment
  const handlePaymentConfirm = (res) => {
    if (!paymentDoc || res.amount <= 0) return;

    const { amount, accountId, note: paymentNote, newPaid, nextStatus } = res;

    // Update purchase document
    setPurchaseDocs((prev) =>
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

    // Deduct from bank account balance if account selected
    if (accountId) {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === accountId
            ? {
                ...b,
                balanceBank: (b.balanceBank || 0) - amount,
                balanceBook: (b.balanceBook || 0) - amount
              }
            : b
        )
      );

      // Create new bank mutation (DB - Kas Keluar)
      const newMutation = {
        id: `mut-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description:
          nextStatus === 'Lunas'
            ? paymentNote
              ? `Pelunasan ${paymentDoc.number} ke ${paymentDoc.vendor} (${paymentNote})`
              : `Pelunasan ${paymentDoc.number} ke ${paymentDoc.vendor}`
            : paymentNote
            ? `Pembayaran Parsial ${paymentDoc.number} ke ${paymentDoc.vendor} (${paymentNote})`
            : `Pembayaran Parsial ${paymentDoc.number} ke ${paymentDoc.vendor}`,
        amount,
        direction: 'DB',
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
      action: `Pembayaran PO ${paymentDoc.number} senilai ${formatRupiah(amount)} [${nextStatus}]${
        paymentNote ? ` - Catatan: "${paymentNote}"` : ''
      }`,
      module: 'Pembelian'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    setPaymentDoc(null);
    notify(`Pembayaran ${formatRupiah(amount)} untuk ${paymentDoc.number} berhasil dibukukan (${nextStatus}).`);
  };

  // Handler: Approve PO
  const handleApprove = (docId) => {
    if (!canApprove) {
      notify('Akses Ditolak: Hanya Finance Manager dan Owner yang berhak menyetujui pengadaan.', 'error');
      return;
    }
    const target = purchaseDocs.find((d) => d.id === docId);
    setPurchaseDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'Belum Dibayar' } : d)));
    if (target) {
      setAuditLogs((prev) => [
        {
          time: 'Baru saja',
          user: currentUser?.name || 'Carlos Susanto',
          action: `Persetujuan PO: ${target.number} (${target.vendor}) senilai ${formatRupiah(target.total)} disetujui`,
          module: 'Pembelian'
        },
        ...prev
      ]);
    }
    notify(`Dokumen ${target?.number || docId} disetujui.`);
  };

  // Handler: Reject PO
  const handleReject = (docId) => {
    if (!canApprove) {
      notify('Akses Ditolak: Hanya Finance Manager dan Owner yang berhak menolak pengadaan.', 'error');
      return;
    }
    const target = purchaseDocs.find((d) => d.id === docId);
    const docNo = target?.number || docId;
    confirmAction({
      title: 'Tolak Dokumen Pembelian',
      message: `Tolak dokumen pembelian "${docNo}" (${target?.vendor || ''})? Status dokumen akan diubah menjadi 'Dibatalkan'.`,
      confirmText: 'Tolak Pengadaan',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setPurchaseDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'Dibatalkan' } : d)));
        if (target) {
          setAuditLogs((prev) => [
            {
              time: 'Baru saja',
              user: currentUser?.name || 'Carlos Susanto',
              action: `Penolakan PO: ${target.number} (${target.vendor}) ditolak`,
              module: 'Pembelian'
            },
            ...prev
          ]);
        }
        notify(`Dokumen ${docNo} telah ditolak.`);
      }
    });
  };

  // Handler: Delete PO
  const handleDelete = (docId, docNumber) => {
    confirmAction({
      title: 'Hapus Dokumen Pembelian',
      message: `Hapus dokumen pembelian "${docNumber}"? Data yang dihapus tidak dapat dipulihkan.`,
      confirmText: 'Hapus Dokumen',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setPurchaseDocs((prev) => prev.filter((d) => d.id !== docId));
        setAuditLogs((prev) => [
          {
            time: 'Baru saja',
            user: currentUser?.name || 'Carlos Susanto',
            action: `PO Dihapus: ${docNumber} dihapus dari sistem`,
            module: 'Pembelian'
          },
          ...prev
        ]);
        notify(`Dokumen ${docNumber} berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">Pembelian &amp; Pengadaan</h1>
          <p className="mt-1 text-xs text-[#586E89]">
            Purchase Request, PO, pengelolaan vendor master, faktur pembelian, dan pembayaran ke pemasok.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNewVendorModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C] hover:bg-[#F8FBFF] shadow-xs cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-[#0284C7]" />
            <span>Tambah Vendor Baru</span>
          </button>
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] shadow-xs cursor-pointer"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Buat Pembelian Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Utang Pemasok (AP)"
          value={formatRupiah(totalUnpaidAP)}
          subtext={
            purchaseDocs.filter((d) => d.status !== 'Lunas').length > 0
              ? `${purchaseDocs.filter((d) => d.status !== 'Lunas').length} tagihan belum lunas`
              : 'Tidak ada utang aktif'
          }
          tone="sky"
        />
        <StatCard
          label="Tagihan Jatuh Tempo"
          value={formatRupiah(overdueAP)}
          subtext={
            overdueAP > 0
              ? `${purchaseDocs.filter((d) => d.status === 'Jatuh Tempo').length} tagihan lewat tempo`
              : 'Tidak ada tagihan jatuh tempo'
          }
          tone="warning"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={`${pendingApprovalCount} PR / PO`}
          subtext={pendingApprovalCount > 0 ? 'Perlu approval' : 'Semua pengajuan telah disetujui'}
          tone="neutral"
        />
        <StatCard
          label="Total Vendor Terdaftar"
          value={`${vendors.length} Vendor`}
          subtext="Pemasok bahan baku &amp; jasa aktif"
          tone="positive"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-[#DCE7F5] gap-1 overflow-x-auto">
        {[
          { id: 'semua', label: 'Semua Tagihan', count: purchaseDocs.length },
          { id: 'po-pr', label: 'PO & PR' },
          { id: 'approval', label: 'Menunggu Approval', count: pendingApprovalCount },
          { id: 'debit', label: 'Debit Memo & Retur' },
          { id: 'items', label: 'Katalog Barang', count: products.length || 8 },
          { id: 'vendor-list', label: 'Daftar Vendor', count: vendors.length }
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

      {/* View: Vendor List Tab */}
      {activeTab === 'vendor-list' && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Direktori Master Data Vendor &amp; Pemasok</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat manajemen rekanan pengadaan bahan baku resin plastik, kemasan, mesin, dan jasa operasional pabrik.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewVendorModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0369A1]"
            >
              <Plus className="h-4 w-4" />
              <span>+ Daftarkan Vendor Baru</span>
            </button>
          </div>

          {/* Vendor KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Total Vendor</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{vendors.length}</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
              <div className="text-[11px] font-semibold text-blue-700">Bahan Baku Resin</div>
              <div className="text-lg font-bold text-blue-900 mt-0.5">
                {vendors.filter((v) => (v.category || '').includes('Bahan Baku')).length || 2}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
              <div className="text-[11px] font-semibold text-emerald-700">Vendor Aktif</div>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">
                {vendors.filter((v) => v.status === 'Aktif').length || vendors.length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Nonaktif / Pending</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">0</div>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="overflow-x-auto border-t border-slate-100 pt-2">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kode &amp; Nama Vendor</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Kontak &amp; Telepon</th>
                  <th className="px-4 py-3">Alamat</th>
                  <th className="px-4 py-3">Termin</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => (
                  <tr key={v.id || v.code} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{v.name}</div>
                      <div className="text-xs text-blue-600 font-mono">{v.code}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{v.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{v.phone}</div>
                      <div className="text-slate-400">{v.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{v.address}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{v.paymentTerm || 'Net 30'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status || 'Aktif'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Catalog Items Tab */}
      {activeTab === 'items' && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Katalog Master Barang &amp; Bahan Baku Pengadaan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar referensi harga dan spesifikasi bahan baku resin plastik, aditif, kemasan, dan suku cadang.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU &amp; Nama Barang</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-center">Satuan</th>
                  <th className="px-4 py-3 text-right">Harga Referensi</th>
                  <th className="px-4 py-3">Supplier Utama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(products.length > 0 ? products : defaultVendorsData).map((it, idx) => (
                  <tr key={it.id || idx} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-[#0B192C]">
                      {it.name}
                      <span className="block font-normal text-xs text-[#586E89]">{it.sku || `SKU-MAT-00${idx + 1}`}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{it.category || 'Bahan Baku Plastik'}</td>
                    <td className="num px-4 py-3 text-center text-xs text-slate-600">{it.unit || 'Kg'}</td>
                    <td className="num px-4 py-3 text-right font-medium text-slate-900">
                      {formatRupiah(it.price || it.standardPrice || 18500 * (idx + 1))}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                      {it.defaultVendor || 'PT MITRA GLOBAL PLASTINDO'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Debit Memo & Retur Tab */}
      {activeTab === 'debit' && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
          <RotateCcw className="mx-auto h-8 w-8 text-[#0284C7] mb-2" />
          <h4 className="text-sm font-semibold text-[#0B192C]">Tidak ada debit memo atau retur pembelian aktif</h4>
          <p className="mt-1 text-xs text-[#586E89]">
            Retur barang ke pemasok dan nota debit otomatis memotong nilai kewajiban utang dagang (AP).
          </p>
        </div>
      )}

      {/* View: Main PO / Bills Table Tab (Semua Tagihan, PO & PR, Menunggu Approval) */}
      {(activeTab === 'semua' || activeTab === 'po-pr' || activeTab === 'approval') && (
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
                  placeholder="Cari vendor atau nomor PO..."
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
                <option value="Menunggu Approval">Menunggu Approval</option>
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
              <span>Log Aktivitas Pembelian</span>
            </button>
          </div>

          {/* Table */}
          {filteredPurchaseDocs.length === 0 ? (
            <div className="p-8 text-center">
              <FilePlus2 className="mx-auto h-8 w-8 text-[#0284C7] mb-2" />
              <h4 className="text-sm font-semibold text-[#0B192C]">Belum ada data pembelian</h4>
              <p className="mt-1 text-xs text-[#586E89]">
                Terbitkan Purchase Order atau tagihan vendor baru untuk mencatat pengadaan dan utang usaha.
              </p>
              <button
                type="button"
                onClick={() => setNewModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0369A1]"
              >
                <span>Buat Pembelian Pertama</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Nomor &amp; Dokumen</th>
                    <th className="px-6 py-3.5">Pemasok (Vendor)</th>
                    <th className="px-6 py-3.5">Gudang</th>
                    <th className="px-6 py-3.5">Tanggal / Tempo</th>
                    <th className="px-6 py-3.5 text-right">Total Nilai</th>
                    <th className="px-6 py-3.5 text-right">Sisa Utang</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchaseDocs.map((doc) => {
                    const remaining = Math.max(0, (doc.total || 0) - (doc.paid || 0));
                    return (
                      <tr key={doc.id || doc.number} className="hover:bg-slate-50/60 transition-colors">
                        {/* Nomor & Dokumen */}
                        <td className="px-6 py-4">
                          <Link
                            to={`/dokumen?id=${encodeURIComponent(doc.number)}`}
                            className="text-left group block"
                            title="Buka rincian dokumen & cetak"
                          >
                            <div className="num font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline flex items-center gap-1">
                              <span>{doc.number}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400">{doc.type || 'Purchase Order'}</div>
                          </Link>
                        </td>

                        {/* Pemasok (Vendor) & Line items badges */}
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div>{doc.vendor}</div>
                          {doc.description && (
                            <Link
                              to={`/dokumen?id=${encodeURIComponent(doc.number)}`}
                              className="mt-1 flex items-center gap-1.5 text-[11px] font-normal text-slate-500 hover:text-blue-600 transition-colors text-left group"
                              title="Buka rincian dokumen"
                            >
                              <FileText className="h-3 w-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                              <span className="line-clamp-1 max-w-[260px] text-slate-600 group-hover:text-blue-600 group-hover:underline">
                                {doc.description}
                              </span>
                            </Link>
                          )}
                          {doc.items && doc.items.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {doc.items.slice(0, 2).map((item, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                                >
                                  <Package className="h-2.5 w-2.5 text-blue-600" />
                                  <span>
                                    {item.qty} {item.unit} {item.name}
                                  </span>
                                </span>
                              ))}
                              {doc.items.length > 2 && (
                                <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
                                  +{doc.items.length - 2} barang lain
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Gudang */}
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{doc.warehouse || 'Gudang Utama Cikarang'}</td>

                        {/* Tanggal / Tempo */}
                        <td className="num px-6 py-4 text-xs text-slate-600">
                          <div>{doc.date}</div>
                          <div className="text-slate-400">Tempo: {doc.dueDate}</div>
                        </td>

                        {/* Total Nilai */}
                        <td className="num px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(doc.total)}</td>

                        {/* Sisa Utang */}
                        <td className="num px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(remaining)}</td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={doc.status} />
                        </td>

                        {/* Tindakan */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {doc.status === 'Menunggu Approval' || doc.status === 'Butuh Persetujuan' ? (
                              canApprove ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(doc.id)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer shadow-2xs"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReject(doc.id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                                    title="Tolak Dokumen"
                                  >
                                    <X className="h-3 w-3" />
                                    <span>Tolak</span>
                                  </button>
                                </div>
                              ) : (
                                <span
                                  title="Perlu Approval Manager"
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-400 cursor-not-allowed"
                                >
                                  <Lock className="h-3 w-3" />
                                  <span>Perlu Approval</span>
                                </span>
                              )
                            ) : doc.status !== 'Lunas' ? (
                              <button
                                type="button"
                                onClick={() => setPaymentDoc(doc)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#0284C7] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0369A1] shadow-2xs cursor-pointer"
                              >
                                <CreditCard className="h-3 w-3" />
                                <span>{doc.paid > 0 ? 'Lanjut Bayar' : 'Bayar'}</span>
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-emerald-600 px-1">Lunas</span>
                            )}

                            {/* Cetak Link */}
                            <Link
                              to={`/dokumen?id=${encodeURIComponent(doc.number)}`}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs inline-flex items-center justify-center"
                              title="Buka Halaman Rincian & Cetak Dokumen"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id, doc.number)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                              title="Hapus Dokumen"
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

      {/* Modal: Buat Pembelian Baru */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Buat Pembelian Baru</h3>
                <p className="text-[11px] text-slate-500">Pilih vendor parameter dan atur tarif PPN sesuai kebutuhan</p>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Tipe Dokumen */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tipe Dokumen</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Purchase Order">Purchase Order (PO)</option>
                    <option value="Purchase Request">Purchase Request (PR)</option>
                    <option value="Faktur Pembelian">Faktur Pembelian (Bill)</option>
                    <option value="Surat Jalan Masuk">Surat Jalan Masuk / Goods Receipt</option>
                  </select>
                </div>

                {/* Pilih Pemasok / Vendor */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Pemasok / Vendor *</label>
                  <select
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Vendor Terdaftar --</option>
                    {vendors.map((v) => (
                      <option key={v.id || v.code} value={v.name}>
                        {v.name} ({v.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gudang & Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Gudang Tujuan</label>
                  <select
                    value={newWarehouse}
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Gudang Utama Cikarang">Gudang Utama Cikarang</option>
                    <option value="Gudang Utama Jakarta">Gudang Utama Jakarta</option>
                    <option value="Gudang Surabaya">Gudang Surabaya</option>
                    <option value="Gudang Bandung">Gudang Bandung</option>
                    <option value="Head Office &amp; Operasional">Head Office &amp; Operasional</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Dokumen</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Rincian Barang &amp; Bahan Baku</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+ Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newItems.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang / Resin..."
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="Qty"
                          value={item.qty || ''}
                          onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono text-center text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Satuan"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-center text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="Harga Satuan"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono text-right text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={newItems.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PPN & Down Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Tarif PPN (%)</span>
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
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900"
                    />
                    <span className="text-xs text-slate-500">
                      Nilai PPN: <b>{formatRupiah(newPpnAmount)}</b>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Uang Muka / DP Dibayar (IDR)</label>
                  <input
                    type="number"
                    value={newDownPayment || ''}
                    onChange={(e) => setNewDownPayment(Number(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="mt-1 text-[11px] text-slate-400">
                    Sisa Utang Setelah DP: {formatRupiah(Math.max(0, newTotal - (Number(newDownPayment) || 0)))}
                  </div>
                </div>
              </div>

              {/* Total Preview */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Nilai Barang:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(newSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({newPpnRate}%):</span>
                  <span className="font-semibold text-blue-700">+{formatRupiah(newPpnAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200/60 pt-1.5 font-bold text-slate-900 text-sm">
                  <span>Total Tagihan PO:</span>
                  <span className="text-blue-600">{formatRupiah(newTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
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
                  Terbitkan Pembelian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Vendor Baru */}
      {newVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftarkan Vendor / Rekanan Baru</h3>
                <p className="text-[11px] text-slate-500">Master data pemasok untuk transaksi pengadaan pabrik</p>
              </div>
              <button
                type="button"
                onClick={() => setNewVendorModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVendorSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kode Vendor</label>
                  <input
                    type="text"
                    placeholder={`VND-${String(vendors.length + 1).padStart(3, '0')}`}
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori Rekanan</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Bahan Baku Plastik">Bahan Baku Plastik</option>
                    <option value="Mesin &amp; Peralatan Pabrik">Mesin &amp; Peralatan Pabrik</option>
                    <option value="Jasa &amp; Ekspedisi">Jasa &amp; Ekspedisi</option>
                    <option value="Kemasan &amp; Packaging">Kemasan &amp; Packaging</option>
                    <option value="Kendaraan &amp; Armada">Kendaraan &amp; Armada</option>
                    <option value="Operasional &amp; Umum">Operasional &amp; Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Perusahaan / Vendor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Sinar Jaya Abadi"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    placeholder="021-..."
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Alamat Email</label>
                  <input
                    type="email"
                    placeholder="finance@vendor.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Alamat Kantor / Pabrik</label>
                <input
                  type="text"
                  placeholder="Jl. Raya Industri..."
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Termin Pembayaran Standar</label>
                <select
                  value={vendorPaymentTerm}
                  onChange={(e) => setVendorPaymentTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Net 30">Net 30 (30 Hari)</option>
                  <option value="Net 14">Net 14 (14 Hari)</option>
                  <option value="Net 60">Net 60 (60 Hari)</option>
                  <option value="COD / Tunai">COD / Tunai Langsung</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewVendorModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] cursor-pointer"
                >
                  Daftarkan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bayar Tagihan Vendor (OutgoingPaymentModal) */}
      {paymentDoc && (
        <OutgoingPaymentModal
          open={!!paymentDoc}
          onClose={() => setPaymentDoc(null)}
          docNumber={paymentDoc.number}
          partyName={paymentDoc.vendor}
          partyRole="Pemasok (Vendor)"
          total={paymentDoc.total || 0}
          alreadyPaid={paymentDoc.paid || 0}
          bankAccounts={bankAccounts}
          initialNote={paymentDoc.paymentNote || ''}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* Modal: Log Aktivitas Pembelian */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Riwayat Log Aktivitas Pembelian</h3>
                <p className="text-[11px] text-slate-500">
                  Jejak audit pengadaan, persetujuan PO, dan pembayaran ke pemasok
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
              {auditLogs.filter((l) => l.module === 'Pembelian').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Belum ada riwayat aktivitas yang tercatat untuk modul pembelian.
                </div>
              ) : (
                auditLogs
                  .filter((l) => l.module === 'Pembelian')
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
