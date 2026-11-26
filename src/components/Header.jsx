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
  Clock
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
      {/* Left: Mobile Toggle & Selectors */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Entity Selector */}
        <div className="relative">
          <select
            value={entityId}
            onChange={(e) => {
              setEntityId(e.target.value);
              notify(`Beralih entitas ke: ${entities.find(x => x.id === e.target.value)?.name}`);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {entities.map(e => (
              <option key={e.id} value={e.id}>
                🏢 {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period Selector */}
        <div className="relative hidden sm:block">
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              notify(`Periode pembukuan aktif: ${e.target.value}`);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {periods.map(p => (
              <option key={p} value={p}>
                📅 {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Cari transaksi, invoice, CoA...</span>
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Quick New Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Transaksi Baru</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
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

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1 pl-2 sm:pr-3 text-left hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              {user?.displayName ? user.displayName.charAt(0) : 'C'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user?.displayName || 'Carlos Susanto'}</div>
              <div className="text-[10px] font-semibold text-blue-600 leading-tight flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                {user?.role || 'Owner'}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-fade-in z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user?.displayName || 'Carlos Susanto'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || 'carlossusanto89@gmail.com'}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  <Shield className="h-2.5 w-2.5" />
                  Role: {user?.role || 'Owner'}
                </div>
              </div>

              {/* Role switcher for testing */}
              <div className="p-2 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Simulasi Role:
                </div>
                {['Owner', 'Finance Manager', 'Accounting Staff', 'Restricted Banker'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setShowProfile(false);
                      notify(`Berganti peran menjadi: ${r}`);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      user?.role === r ? 'font-bold text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    • {r}
                  </button>
                ))}
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar dari Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
