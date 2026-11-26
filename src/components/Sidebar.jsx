import React from 'react';
import { NavLink } from 'react-router-dom';
import AsiaPlastikLogo from './AsiaPlastikLogo';
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  Landmark,
  Scale,
  PieChart,
  BarChart3,
  Receipt,
  ShoppingBag,
  Truck,
  Building2,
  Boxes,
  FileSpreadsheet,
  UserCircle,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { salesDocs, purchaseDocs, bankMutations, personalNotes } = useAppContext();
  const { user, logout } = useAuth();

  // Navigation Items exactly matching the target application
  const navigation = [
    {
      group: 'MENU',
      items: [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/ai', label: 'AI Asisten', icon: Bot, badge: 'PRO' },
        { href: '/tugas', label: 'Tugas & Catatan', icon: CheckSquare, count: personalNotes.filter(n => !n.completed).length },
        { href: '/kas-bank', label: 'Kas & Bank', icon: Landmark },
        { href: '/rekonsiliasi', label: 'Rekonsiliasi', icon: Scale, count: bankMutations.filter(m => m.status === 'Perlu Tinjau').length },
        { href: '/biaya-anggaran', label: 'Budgeting & Biaya', icon: PieChart },
        { href: '/laporan', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      group: 'MANAGEMENT',
      items: [
        { href: '/penjualan', label: 'Invoices & Penjualan', icon: Receipt, count: salesDocs.length },
        { href: '/pembelian', label: 'Pembelian & Tagihan', icon: ShoppingBag, count: purchaseDocs.length },
        { href: '/pemenuhan', label: 'Pemenuhan & Logistik', icon: Truck },
        { href: '/vendor', label: 'Vendor & Pemasok', icon: Building2 },
        { href: '/inventori-produksi', label: 'Inventori & Gudang', icon: Boxes },
        { href: '/perpajakan', label: 'Pajak & Coretax', icon: FileSpreadsheet }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { href: '/pengguna', label: 'Profil & Pengguna', icon: UserCircle },
        { href: '/akuntansi', label: 'Akuntansi & CoA', icon: BookOpen },
        { href: '/pengaturan', label: 'Settings & Akses', icon: Settings },
        { href: '/dokumentasi', label: 'Dokumentasi & Panduan', icon: HelpCircle }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0C4F7A] text-white shadow-xs p-1.5 shrink-0">
            <AsiaPlastikLogo className="h-full w-full" color="#FFFFFF" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">Asia Plastik</span>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold tracking-wider">FINANCE</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`h-4 w-4 transition-colors ${
                                isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Footer Card */}
        <div className="border-t border-slate-100 p-3.5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 font-bold text-white text-xs shadow-xs">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'K'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.displayName || 'Kevina'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  {user?.role || 'Owner'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Keluar dari Workspace"
              className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
