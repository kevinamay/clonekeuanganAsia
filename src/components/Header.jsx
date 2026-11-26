import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Building,
  Calendar,
  LogOut,
  User,
  Shield,
  Menu,
  CheckCircle2,
  Clock,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout, switchRole } = useAuth();
  const { entityId, setEntityId, period, setPeriod, entities, setSearchOpen, notify } = useAppContext();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);

  const periods = [
    'Nov 2026', 'Okt 2026', 'Sep 2026', 'Agu 2026', 'Jul 2026', 'Jun 2026',
    'Mei 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'FY 2025'
  ];

  const quickActions = [
    { label: 'Faktur Penjualan Baru', path: '/penjualan?new=1' },
    { label: 'Pesanan / Tagihan Pembelian', path: '/pembelian?new=1' },
    { label: 'Daftarkan Vendor Baru', path: '/vendor?new=1' },
    { label: 'Catat Biaya Operasional', path: '/biaya-anggaran?new=1' },
    { label: 'Transfer Kas & Bank', path: '/kas-bank?new=transfer' },
    { label: 'Jurnal Umum Manual', path: '/akuntansi?new=jurnal' }
  ];

  const notifications = [
    { id: 1, title: 'Mutasi Bank Masuk BCA', desc: 'Penerimaan Transfer INV-2026-002 Rp 44.400.000', time: '10 mnt lalu', unread: true },
    { id: 2, title: 'Jatuh Tempo Faktur PO-2026-001', desc: 'PT Duta Polimer Indonesia jatuh tempo dlm 3 hari', time: '1 jam lalu', unread: true },
    { id: 3, title: 'Coretax DJP Sinkron', desc: 'Faktur Pajak 010.002-26 siap dilaporkan', time: 'Kemarin', unread: false }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Input Trigger */}
        <div
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors w-72 sm:w-96 cursor-pointer shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Cari transaksi, vendor, setting, rekening... (Ctrl K)</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-fade-in z-50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifikasi Finansial</span>
                <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">Tandai Dibaca</span>
              </div>
              <div className="divide-y divide-slate-50 py-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inbox / Tray */}
        <button
          type="button"
          onClick={() => notify('Semua dokumen transaksi telah sinkron.')}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Sinkronisasi Dokumen"
        >
          <Inbox className="h-4 w-4" />
        </button>

        {/* Quick New Transaction Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>+ Add Transactions</span>
          </button>

          {showNewMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-fade-in z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Aksi Cepat
              </div>
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    navigate(qa.path);
                  }}
                  className="flex w-full items-center px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
