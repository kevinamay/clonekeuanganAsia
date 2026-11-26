import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, X, ChevronRight, FileText, Landmark, Users, Package, Settings } from 'lucide-react';

export default function CommandPalette() {
  const { searchOpen, setSearchOpen, salesDocs, purchaseDocs, bankAccounts, vendors } = useAppContext();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!searchOpen) return null;

  const quickPages = [
    { title: 'Dashboard Finansial', href: '/', cat: 'Menu', desc: 'Ringkasan saldo, cashflow, net profit' },
    { title: 'Kas & Bank', href: '/kas-bank', cat: 'Menu', desc: 'Rekening operasional & mutasi' },
    { title: 'Rekonsiliasi Bank', href: '/rekonsiliasi', cat: 'Menu', desc: 'Pencocokan mutasi bank & pembukuan' },
    { title: 'Invoices & Penjualan', href: '/penjualan', cat: 'Manajemen', desc: 'Faktur penjualan, piutang & PPN' },
    { title: 'Pembelian & Tagihan Vendor', href: '/pembelian', cat: 'Manajemen', desc: 'Purchase Order & utang usaha' },
    { title: 'Vendor & Pemasok', href: '/vendor', cat: 'Manajemen', desc: 'Direktori master rekanan' },
    { title: 'Laporan Keuangan', href: '/laporan', cat: 'Menu', desc: 'Neraca, Laba Rugi & Arus Kas' },
    { title: 'Akuntansi & CoA', href: '/akuntansi', cat: 'Sistem', desc: 'Bagan akun & jurnal memorial' }
  ];

  const filteredPages = quickPages.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari menu, faktur, rekening, vendor..."
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Cepat
          </div>
          {filteredPages.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchOpen(false);
                navigate(item.href);
              }}
              className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left hover:bg-blue-50/70 transition-colors group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{item.title}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {item.cat}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5 bg-slate-50/60 text-[11px] text-slate-400">
          <span>Gunakan ↑ ↓ navigasi, Enter untuk memilih</span>
          <span>ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
}
