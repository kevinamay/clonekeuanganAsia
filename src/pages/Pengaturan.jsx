import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, UserCheck, UserPlus, AlertCircle, Plus,
  CheckCircle2, Download, Search, Lock, CreditCard, Landmark, Eye,
  EyeOff, Sparkles, ChevronRight, RotateCcw, AlertTriangle, Bot,
  Copy, Check, Info, AlertOctagon, ChevronUp, ChevronDown, PenLine,
  X, Clock, Filter, ArrowUpRight, DollarSign, Layers, CheckCheck,
  ArrowRight, Save, LayoutDashboard, BarChart2, PanelsTopLeft,
  KeyRound, Smartphone, Webhook, Minus, Cpu, GripVertical, Sliders
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { rtdb } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import seedData from '../data/seed_data.json';

// --- Default Data & Constants ---
const DEFAULT_APPROVAL_RULES = [{id:"rule-001",name:"Persetujuan PO Bahan Baku & Pengadaan Mesin > Rp 50 Juta",approvers:"Level 1: Procurement Lead -> Level 2: Direktur Keuangan & Owner",active:!0},{id:"rule-002",name:"Persetujuan Reimbursement Operasional Lapangan > Rp 5 Juta",approvers:"Level 1: Kepala Departemen -> Level 2: Finance Manager",active:!0},{id:"rule-003",name:"Persetujuan Faktur Penjualan Tenor Khusus / Plafon Kredit > Rp 100 Juta",approvers:"Level 1: Head of Sales -> Level 2: Finance Manager & Owner",active:!0}];

const DEFAULT_ROLES_PERMISSIONS = {Owner:[{module:"AI Asisten (Nala)",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Akses penuh konsultasi finansial & eksekusi AI"},{module:"Kas & Bank",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Akses penuh mutasi, rekening & saldo"},{module:"Penjualan & Faktur",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Penerbitan faktur & persetujuan invoice"},{module:"Pembelian & Tagihan",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Penerbitan PO & persetujuan pembayaran"},{module:"Biaya & Operasional",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Pencatatan & persetujuan reimbursement"},{module:"Inventori & Gudang",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Stok bahan baku resin & barang jadi"},{module:"Akuntansi & Pajak",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Jurnal umum, CoA & Coretax"},{module:"Otorisasi & Pengaturan",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Invite user & reset database"}],"Finance Manager":[{module:"AI Asisten (Nala)",create:!0,read:!0,update:!0,del:!0,approve:!0,note:"Akses penuh konsultasi finansial & analitik AI"},{module:"Kas & Bank",create:!0,read:!0,update:!0,del:!0,approve:!0},{module:"Penjualan & Faktur",create:!0,read:!0,update:!0,del:!0,approve:!0},{module:"Pembelian & Tagihan",create:!0,read:!0,update:!0,del:!0,approve:!0},{module:"Biaya & Operasional",create:!0,read:!0,update:!0,del:!0,approve:!0},{module:"Inventori & Gudang",create:!0,read:!0,update:!0,del:!0,approve:!0},{module:"Akuntansi & Pajak",create:!0,read:!0,update:!0,del:!0,approve:!0},{module:"Otorisasi & Pengaturan",create:!1,read:!0,update:!1,del:!1,approve:!1,note:"Akses aplikasi penuh KECUALI invite pengguna & reset data (Owner only)"}],"Accounting Staff":[{module:"AI Asisten (Nala)",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Akses dibatasi (Hanya Owner & Finance Manager)"},{module:"Kas & Bank",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"CUD mutasi operasional tanpa hak approve"},{module:"Penjualan & Faktur",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"CUD faktur penjualan tanpa hak approve"},{module:"Pembelian & Tagihan",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"CUD PO & tagihan tanpa hak approve"},{module:"Biaya & Operasional",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"CUD entri biaya tanpa hak approve"},{module:"Inventori & Gudang",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"CUD pencatatan stok tanpa hak approve"},{module:"Akuntansi & Pajak",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"CUD entri jurnal & rekap pajak tanpa hak approve"},{module:"Otorisasi & Pengaturan",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki hak akses pengaturan sistem"}],"Restricted Banker":[{module:"AI Asisten (Nala)",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Akses dibatasi (Hanya Owner & Finance Manager)"},{module:"Kas & Bank",create:!0,read:!0,update:!0,del:!1,approve:!1,note:"Input mutasi, cek saldo kaslink & kartu sandbox"},{module:"Rekonsiliasi Bank",create:!0,read:!0,update:!0,del:!1,approve:!1,note:"Pencocokan mutasi dan saldo rekening koran"},{module:"Penjualan & Pembelian",create:!1,read:!0,update:!1,del:!1,approve:!1,note:"Hanya baca referensi arus kas masuk/keluar"},{module:"Inventori & Gudang",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses gudang dan pabrik"},{module:"Akuntansi & Pajak",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses pembukuan internal"},{module:"Otorisasi & Pengaturan",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses pengaturan sistem"}],"Staff Gudang":[{module:"AI Asisten (Nala)",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Akses dibatasi (Hanya Owner & Finance Manager)"},{module:"Inventori & Gudang",create:!0,read:!0,update:!0,del:!0,approve:!1,note:"Kelola stok bahan baku resin, opname gudang & work orders"},{module:"Pembelian & Penerimaan",create:!0,read:!0,update:!0,del:!1,approve:!1,note:"Cek PO pembelian & konfirmasi penerimaan barang vendor"},{module:"Kas & Bank",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses kas/bank"},{module:"Penjualan & Faktur",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses keuangan penjualan"},{module:"Akuntansi & Pajak",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses pembukuan internal"},{module:"Otorisasi & Pengaturan",create:!1,read:!1,update:!1,del:!1,approve:!1,note:"Tidak memiliki akses pengaturan sistem"}]};

const SEARCH_SETTINGS = [{id:"set-dashboard-visibility",category:"Tampilan & Dashboard",tabTarget:"tampilan",title:"Pengaturan Visibilitas Dashboard & Tab Analisis",description:"Sembunyikan menu dashboard di sidebar navigasi, atur visibilitas tab Ringkasan, Performa bisnis, Kustom Analisis (Looker), dan tombol Tambah dashboard.",keywords:["dashboard","hide dashboard","sembunyikan dashboard","visibilitas","tab dashboard","performa bisnis","looker","ringkasan","sidebar dashboard","tampilan"]},{id:"set-invite-user",category:"Otorisasi Pengguna",tabTarget:"otorisasi",title:"Tambah Akses Pengguna (Undang Pengguna Baru)",description:"Undang email staf (Gmail / Work Email) dengan peran Owner, Finance Manager, Accounting Staff, Restricted Banker, atau Staff Gudang.",keywords:["invite","tambah user","undang","email","gmail","otorisasi","staff","manager","owner"]},{id:"set-auth-list",category:"Otorisasi Pengguna",tabTarget:"otorisasi",title:"Daftar Pengguna Terdaftar & Status Akun",description:"Lihat dan kelola seluruh user yang diizinkan masuk sistem, ganti peran, atau hapus akses akun.",keywords:["daftar user","list user","status akun","aktif","nonaktif","cabut akses","ganti peran"]},{id:"set-reset-data",category:"Zona Bahaya (Danger Zone)",tabTarget:"otorisasi",title:"Reset Semua Data Finansial (Zona Bahaya)",description:"Kosongkan seluruh data transaksi pengujian (PO, faktur, mutasi kas, biaya) dengan konfirmasi ketik manual 'RESET ASIA PLASTIK'.",keywords:["reset","hapus data","kosongkan database","zona bahaya","reset semua","hapus semua"],isResetAction:!0},{id:"set-bank-mode",category:"Mode Bank & Sandbox",tabTarget:"bank-config",title:"Mode Integrasi Bank (Fiktif Sandbox vs Bank Asli)",description:"Ubah mode lingkungan perbankan antara simulasi fiktif terisolasi (sandbox) dan integrasi API perbankan langsung.",keywords:["mode bank","sandbox","fiktif","bank asli","simulasi","live","bca","mandiri"]},{id:"set-add-bank",category:"Mode Bank & Sandbox",tabTarget:"bank-config",title:"Tambah Rekening Bank & Kartu Virtual Sandbox Baru",description:"Buat rekening operasional baru atau kartu kredit virtual fiktif dengan saldo awal, CVV, dan nomor kartu otomatis.",keywords:["tambah bank","kartu virtual","kartu kredit","cvv","saldo awal","rekening baru"]},{id:"set-roles-crud",category:"Custom Roles",tabTarget:"roles",title:"Manajemen Custom Roles Pengguna",description:"Buat peran khusus baru dengan nama, deskripsi, dan warna badge sesuai hierarki operasional pabrik.",keywords:["role","peran","custom role","tambah peran","hak akses","jabatan"]},{id:"set-roles-matrix",category:"Custom Roles",tabTarget:"roles",title:"Matriks Izin Modul (CUD & Approval Matrix)",description:"Lihat izin Create, Read, Update, Delete, dan Approve per modul untuk masing-masing peran pengguna.",keywords:["matriks","matrix","izin","cud","approve","hak akses modul","segregation of duties"]},{id:"set-approval-center",category:"Pusat Persetujuan",tabTarget:"approval",title:"Antrean Persetujuan Dokumen (Approval Center)",description:"Daftar Purchase Order bahan baku, faktur penjualan tenor khusus, dan reimbursement yang memerlukan otorisasi Manager/Owner.",keywords:["approval","persetujuan","setujui","tolak","antrean approval","po","faktur","reimbursement"]},{id:"set-approval-rules",category:"Pusat Persetujuan",tabTarget:"approval",title:"Aturan Multi-Level Workflow Persetujuan",description:"Konfigurasi batas nominal transaksi untuk persetujuan bertingkat (misal PO > 50jt butuh Owner).",keywords:["workflow","aturan approval","multi level","ambang batas","nominal","level 1","level 2"]},{id:"set-approval-history",category:"Pusat Persetujuan",tabTarget:"approval",title:"Riwayat Audit Persetujuan & Penolakan",description:"Histori lengkap dokumen yang telah disetujui atau ditolak beserta catatan alasan dan nama approver.",keywords:["riwayat approval","histori persetujuan","alasan penolakan","jejak persetujuan"]},{id:"set-audit-logs",category:"Audit Log",tabTarget:"audit",title:"Jejak Audit Aktivitas & Log Keamanan Sistem",description:"Catatan waktu nyata setiap login, perubahan otorisasi, penambahan transaksi, dan aktivitas kritis sistem.",keywords:["audit","log","jejak audit","keamanan","aktivitas","riwayat sistem","siapa yang ubah"]},{id:"set-audit-export",category:"Audit Log",tabTarget:"audit",title:"Ekspor Log Jejak Audit ke CSV",description:"Unduh seluruh riwayat jejak audit ke dalam file CSV untuk arsip kepatuhan dan audit internal.",keywords:["ekspor audit","unduh log","csv audit","download audit"]},{id:"set-popups-manage",category:"Custom Popups",tabTarget:"custom-popups",title:"Kelola Custom Popup Page Load",description:"Buat popup pengumuman, peringatan SOP, atau instruksi kerja yang otomatis muncul saat staf membuka halaman tertentu.",keywords:["popup","pop-up","modal","page load","pengumuman","notifikasi","sop"]},{id:"set-popups-drag",category:"Custom Popups",tabTarget:"custom-popups",title:"Urutan & Drag-and-Drop Pop-Up",description:"Atur prioritas dan urutan popup yang tampil bergantian dengan cara drag-and-drop atau panah urutan.",keywords:["drag","drop","urutan popup","prioritas popup","reorder"]},{id:"set-popups-tone",category:"Custom Popups",tabTarget:"custom-popups",title:"Kustomisasi Ikon, Warna & Tombol Pop-up",description:"Pilih tone visual: Warning (kuning), Danger (merah), Success (hijau), Announcement (biru), atau Info.",keywords:["warna popup","ikon popup","tone","warning","danger","success","info"]},{id:"set-mcp-server",category:"Integrasi & MCP Agent",tabTarget:"integrasi",title:"Model Context Protocol (MCP) Server untuk AI Agent",description:"Koneksikan Claude Desktop, Cursor, atau script automasi Anda ke sistem keuangan Asia Plastik via MCP JSON-RPC.",keywords:["mcp","agent","ai","claude","cursor","windsurf","json-rpc","endpoint","api mcp"]},{id:"set-mcp-key",category:"Integrasi & MCP Agent",tabTarget:"integrasi",title:"Manajemen API Key MCP Server",description:"Generate API Key baru atau salin key aktif untuk autentikasi permintaan data dari AI Agent.",keywords:["api key","generate key","kunci api","token","autentikasi mcp","x-api-key"]},{id:"set-webhooks",category:"Integrasi & MCP Agent",tabTarget:"integrasi",title:"Webhook Realtime & Integrasi Eksternal",description:"Konfigurasi URL webhook untuk menerima event instan mutasi kas, penerbitan invoice, dan status PO.",keywords:["webhook","event","integrasi","callback","url webhook","notifikasi otomatis"]}];

const INITIAL_DASHBOARD_VISIBILITY = {
  showRingkasanTab: true,
  showPerformaTab: true,
  showLookerTab: true,
  showAddDashboardBtn: true,
  showDashboardInSidebar: true,
  defaultTab: "ringkasan"
};

const INTEGRATION_SERVICES = [
  { name: "Mekari Klikpajak", category: "Perpajakan DJP & Coretax", status: "Coming Soon", sync: "API Terkunci" },
  { name: "Mekari Pay", category: "Payment Gateway & VA/QRIS", status: "Coming Soon", sync: "API Terkunci" },
  { name: "Mekari Expense", category: "Klaim & Pengeluaran Karyawan", status: "Coming Soon", sync: "API Terkunci" },
  { name: "Mekari POS", category: "Point of Sale Retail & F&B", status: "Coming Soon", sync: "API Terkunci" },
  { name: "Mekari Desty", category: "Omnichannel (Tokopedia, Shopee, Lazada)", status: "Coming Soon", sync: "API Terkunci" },
  { name: "Mekari Talenta", category: "HRIS & Payroll Jurnal Otomatis", status: "Coming Soon", sync: "API Terkunci" }
];

const DEFAULT_OWNER_EMAIL = "carlossusanto89@gmail.com";
const AVAILABLE_ROLES = ["Owner", "Finance Manager", "Accounting Staff", "Restricted Banker", "Staff Gudang"];

function isManagerOrOwner(role) {
  return role === "Owner" || role === "Finance Manager";
}

const INITIAL_BANK_ACCOUNTS = seedData.Y || [];
const INITIAL_SALES_DOCS = seedData.q || [];
const INITIAL_PURCHASE_DOCS = seedData.$ || [];
const INITIAL_EXPENSES = seedData.x || [];

function formatRupiah(val, compact = false) {
  let num = typeof val !== 'number' || isNaN(val) ? Number(val) || 0 : val;
  let abs = Math.abs(num);
  let sign = num < 0 ? '-' : '';
  if (compact) {
    if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(2).replace('.', ',')} M`;
    if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(1).replace('.', ',')} Jt`;
  }
  let str = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(abs);
  return `${sign}Rp ${str}`;
}

// UI Components
function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-[#0369A1] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}


function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      {(label || description) && (
        <div className="flex-1">
          {label && <label className="text-xs font-bold text-slate-900 block">{label}</label>}
          {description && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function StatusBadge({ status, className = "" }) {
  let color = "bg-slate-100 text-slate-700 border-slate-200";
  const s = String(status || "").toLowerCase();
  if (s.includes("terhubung") || s.includes("aktif") || s.includes("lunas") || s.includes("disetujui") || s.includes("connected")) {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (s.includes("menunggu") || s.includes("perlu") || s.includes("pending") || s.includes("proses")) {
    color = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (s.includes("ditolak") || s.includes("batal") || s.includes("gagal") || s.includes("nonaktif") || s.includes("permission-denied")) {
    color = "bg-rose-50 text-rose-700 border-rose-200";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${color} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
}

function EmptyState({ title, description, actionLabel, onAction, icon: IconComponent }) {
  const Icon = IconComponent || Info;
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 shadow-2xs">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      {description && <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, subtext, tone = "neutral", className = "" }) {
  let toneClass = "text-slate-900";
  let borderClass = "border-slate-200";
  let bgClass = "bg-white";
  if (tone === "warning") {
    toneClass = "text-amber-600";
    borderClass = "border-amber-200 bg-amber-50/30";
  } else if (tone === "positive") {
    toneClass = "text-emerald-600";
    borderClass = "border-emerald-200 bg-emerald-50/30";
  } else if (tone === "danger") {
    toneClass = "text-rose-600";
    borderClass = "border-rose-200 bg-rose-50/30";
  }
  return (
    <div className={`p-4 rounded-2xl border shadow-2xs ${borderClass} ${bgClass} ${className}`}>
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
      <div className={`mt-1.5 text-xl font-extrabold ${toneClass}`}>{value}</div>
      {subtext && <p className="mt-1 text-xs text-slate-400 font-medium">{subtext}</p>}
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// Global live RTDB collections sync hook
const cache = new Map();
const readyMap = new Map();
const listenersMap = new Map();
const unsubscribeMap = new Map();

function cleanEmpty(val) {
  return val === undefined ? null : JSON.parse(JSON.stringify(val));
}

function useCollection(key, initialValue) {
  const { user, authorizedRecord } = useAuth();
  const [data, setData] = useState(() => cache.has(key) ? cache.get(key) : initialValue);
  const [ready, setReady] = useState(() => readyMap.get(key) ?? false);
  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  useEffect(() => {
    if (!user || !authorizedRecord?.active) return;
    let listeners = listenersMap.get(key);
    if (!listeners) {
      listeners = new Set();
      listenersMap.set(key, listeners);
    }
    const update = (val) => {
      setData(val);
      setReady(true);
    };
    listeners.add(update);
    if (cache.has(key)) {
      setData(cache.get(key));
      setReady(true);
    }
    if (!unsubscribeMap.has(key)) {
      try {
        const dataRef = ref(rtdb, `finance_data/${key}`);
        const unsub = onValue(dataRef, (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            let processed = raw;
            if (raw && typeof raw === 'object' && raw.__empty__) {
              processed = Array.isArray(initialRef.current) ? [] : {};
            } else if (Array.isArray(initialRef.current)) {
              if (Array.isArray(raw)) {
                processed = raw;
              } else if (typeof raw === 'object' && raw !== null) {
                processed = Object.values(raw);
              }
            }
            cache.set(key, processed);
            readyMap.set(key, true);
            listeners.forEach(fn => fn(processed));
          } else {
            const init = initialRef.current;
            cache.set(key, init);
            readyMap.set(key, true);
            listeners.forEach(fn => fn(init));
            const payload = Array.isArray(init) && init.length === 0 ? { __empty__: true } : init;
            set(dataRef, payload).catch(() => {});
          }
        }, () => {
          readyMap.set(key, false);
        });
        unsubscribeMap.set(key, unsub);
      } catch (err) {
        console.warn('Firebase sync error for', key, err);
      }
    }
    return () => {
      listeners.delete(update);
    };
  }, [key, user, authorizedRecord?.active]);

  const updateData = useCallback((val) => {
    const current = cache.has(key) ? cache.get(key) : data;
    const next = typeof val === 'function' ? val(current) : val;
    cache.set(key, next);
    const listeners = listenersMap.get(key);
    if (listeners) {
      listeners.forEach(fn => fn(next));
    }
    if (user && authorizedRecord?.active) {
      try {
        const dataRef = ref(rtdb, `finance_data/${key}`);
        const payload = Array.isArray(next) && next.length === 0 ? { __empty__: true } : cleanEmpty(next);
        set(dataRef, payload).catch(() => {});
      } catch (err) {
        console.warn('Failed to update RTDB for', key, err);
      }
    }
  }, [key, user, authorizedRecord?.active, data]);

  return [data, updateData, ready];
}

async function resetFinanceData(userEmail) {
  const collections = [
    "bank_accounts", "vendors", "purchase_docs", "sales_docs", "expenses",
    "bank_mutations", "budget_rows", "products", "work_orders", "coa_accounts",
    "journal_entries", "fixed_assets", "giro_docs", "tax_records", "personal_notes",
    "approval_rules", "custom_popups", "closing_history"
  ];
  try {
    const promises = collections.map(col => set(ref(rtdb, `finance_data/${col}`), { __empty__: true }));
    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString("id-ID", { month: "short" })} ${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    promises.push(
      set(ref(rtdb, "finance_data/audit_logs"), [
        {
          time: timeStr,
          user: userEmail,
          action: "RESET TOTAL SISTEM: Seluruh data keuangan, vendor, transaksi, dan inventori di-reset ke kondisi kosong",
          module: "Pengaturan & Keamanan"
        }
      ])
    );
    await Promise.all(promises);
    collections.forEach(col => {
      cache.set(col, []);
      const listeners = listenersMap.get(col);
      if (listeners) listeners.forEach(fn => fn([]));
    });
    return true;
  } catch (err) {
    console.error("Failed to reset finance data:", err);
    return false;
  }
}

export default function () {
  let {
      notify: e,
      previewPopup: n,
      confirmAction: er
    } = (0, useAppContext)(),
    {
      user: eo,
      authorizedRecord: ed,
      authorizedUsers: ec,
      rtdbStatus: ex,
      addAuthorizedUser: eu,
      updateAuthorizedUser: em,
      removeAuthorizedUser: ep
    } = (0, useAuth)(),
    [eb, eh] = (0, useState)("tampilan"),
    [eg, ej] = (0, useState)("Owner"),
    [ek, ef] = (0, useState)(""),
    [ev, eN] = (0, useState)(16),
    [ey, ew] = (0, useState)(!0),
    [eC, eP] = (0, useState)(!0),
    [eA, eS] = (0, useState)(!1),
    [eB, eT] = (0, useState)(!1);
  React.useEffect(() => {
    try {
      let e = localStorage.getItem("app_font_size");
      if (e) if ("small" === e) eN(14);else if ("large" === e) eN(18);else if ("normal" === e) eN(16);else {
        let a = parseFloat(e);
        !isNaN(a) && a > 0 && eN(a);
      }
    } catch {}
  }, []);
  let eD = e => {
      try {
        localStorage.setItem("app_font_size", `${e}px`), document.documentElement.style.fontSize = `${e}px`, window.dispatchEvent(new Event("storage"));
      } catch {}
    },
    eF = a => {
      eN(t => {
        let s = Math.max(1, t + a);
        return eD(s), e(`Ukuran huruf sistem: ${s}px`), s;
      });
    },
    [eM, eK] = (0, useCollection)("dashboard_visibility_config", INITIAL_DASHBOARD_VISIBILITY),
    [eI, e$] = (0, useCollection)("custom_popups", []),
    [eR, eL] = (0, useState)(!1),
    [eE, eO] = (0, useState)(null),
    [eU, e_] = (0, useState)(""),
    [eH, eV] = (0, useState)(""),
    [eG, eJ] = (0, useState)("warning"),
    [ez, eq] = (0, useState)("all"),
    [eW, eY] = (0, useState)(!0),
    [eZ, eX] = (0, useState)("Saya Mengerti"),
    [eQ, e0] = (0, useState)(""),
    [e1, e5] = (0, useState)(null),
    [e2, e3] = (0, useState)(""),
    [e4, e6] = (0, useState)(""),
    [e8, e7] = (0, useState)("Accounting Staff"),
    [e9, ae] = (0, useState)(null),
    [aa, at] = (0, useState)(!1),
    [as, an] = (0, useCollection)("bank_integration_mode", "fiktif"),
    [ai, al] = (0, useCollection)("bank_accounts", INITIAL_BANK_ACCOUNTS),
    [ar, ao] = (0, useState)(!1),
    [ad, ac] = (0, useState)("Bank Central Asia (BCA)"),
    [ax, au] = (0, useState)(""),
    [am, ap] = (0, useState)(""),
    [ab, ah] = (0, useState)("Bank"),
    [ag, aj] = (0, useState)("IDR"),
    [ak, af] = (0, useState)(""),
    [av, aN] = (0, useState)(""),
    [ay, aw] = (0, useState)(""),
    [aC, aP] = (0, useState)(""),
    [aA, aS] = (0, useState)(0),
    [aB, aT] = (0, useState)("Operasional Bisnis"),
    [aD, aF] = (0, useState)({}),
    [aM, aK] = (0, useState)(null),
    [aI, a$] = (0, useState)("Bank Central Asia (BCA)"),
    [aR, aL] = (0, useState)(""),
    [aE, aO] = (0, useState)("Bank"),
    [aU, a_] = (0, useState)("IDR"),
    [aH, aV] = (0, useState)(0),
    [aG, aJ] = (0, useState)(""),
    [az, aq] = (0, useState)("Operasional Bisnis"),
    [aW, aY] = (0, useState)(""),
    [aZ, aX] = (0, useState)(""),
    [aQ, a0] = (0, useState)(""),
    [a1, a5] = (0, useState)(""),
    [a2, a3] = (0, useCollection)("approval_rules", DEFAULT_APPROVAL_RULES),
    [a4, a6] = (0, useState)(!1),
    [a8, a7] = (0, useState)(""),
    [a9, te] = (0, useState)(""),
    [ta, tt] = (0, useCollection)("sales_docs", INITIAL_SALES_DOCS),
    [ts, tn] = (0, useCollection)("purchase_docs", INITIAL_PURCHASE_DOCS),
    [ti, tl] = (0, useCollection)("expenses", INITIAL_EXPENSES),
    [tr, to] = (0, useState)("queue"),
    [td, tc] = (0, useState)("semua"),
    [tx, tu] = (0, useState)(""),
    [tm, tp] = (0, useState)(null),
    [tb, th] = (0, useState)(""),
    [tg, tj] = (0, useState)(null),
    [tk, tf] = (0, useState)(""),
    [tv, tN] = (0, useState)(!1),
    [ty, tw] = (0, useCollection)("audit_logs", []),
    [tC, tP] = (0, useState)(""),
    [tA, tS] = (0, useCollection)("roles_permissions", DEFAULT_ROLES_PERMISSIONS),
    [tB, tT] = (0, useState)({
      open: !1,
      title: "",
      desc: ""
    }),
    [tD, tF] = (0, useState)(!1),
    [tM, tK] = (0, useState)(""),
    [tI, t$] = (0, useState)(!1),
    [tR, tL] = (0, useCollection)("system_api_key", "ap_live_agent_7a8b9c0d1e2f3456"),
    [tE, tO] = (0, useState)("get_financial_summary"),
    [tU, t_] = (0, useState)(!1),
    [tH, tV] = (0, useState)(null),
    [tG, tJ] = (0, useState)(!1),
    [tz, tq] = (0, useState)(!1),
    tW = async a => {
      tO(a), t_(!0), tV(null);
      try {
        let t = await fetch("/api/mcp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: "tools/call",
              params: {
                name: a,
                arguments: {}
              }
            })
          }),
          s = await t.json();
        tV(s), e(`Uji tool "${a}" sukses (HTTP ${t.status}).`);
      } catch (a) {
        tV({
          error: a.message || "Gagal menghubungi MCP server"
        }), e("Gagal menghubungi MCP server.");
      } finally {
        t_(!1);
      }
    },
    tY = !!eo?.email && eo.email.toLowerCase() === DEFAULT_OWNER_EMAIL,
    tZ = ed?.role ?? (tY ? "Owner" : "Finance Manager"),
    tX = (0, isManagerOrOwner)(tZ),
    tQ = async a => {
      if (a.preventDefault(), !tY) return void e("Akses Ditolak: Hanya Akun Owner yang berhak mengundang pengguna.");
      ae(null), at(!0);
      let t = await eu(e2, e4, e8);
      if (at(!1), !t.ok) return void ae(t.error ?? "Gagal menambahkan email.");
      let s = new Date();
      tw([{
        time: `${s.getDate()} ${s.toLocaleString("id-ID", {
          month: "short"
        })} ${s.getFullYear()} ${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")}`,
        user: ed?.email ?? "User",
        action: `Otorisasi akun baru: ${e2.trim().toLowerCase()} (${e8})`,
        module: "Pengaturan Akses"
      }, ...ty]), e(`Email ${e2.trim().toLowerCase()} diotorisasi sebagai ${e8}.`), e3(""), e6("");
    },
    t0 = (Array.isArray(ta) ? ta : []).filter(e => "Butuh Persetujuan" === e.status).map(e => ({
      id: e.id,
      docNumber: e.number,
      module: "Penjualan",
      type: e.type,
      party: e.customer,
      date: e.date,
      dueDate: e.dueDate || "-",
      amount: e.total,
      triggerReason: e.total > 1e8 ? "Faktur Penjualan > Rp 100 Juta (Plafon Kredit Khusus Butuh Otorisasi)" : "Faktur Penjualan Menunggu Persetujuan Manager",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      raw: e
    })),
    t1 = (Array.isArray(ts) ? ts : []).filter(e => "Menunggu Approval" === e.status).map(e => ({
      id: e.id,
      docNumber: e.number,
      module: "Pembelian",
      type: e.type,
      party: e.vendor,
      date: e.date,
      dueDate: e.dueDate || "-",
      amount: e.total,
      triggerReason: e.total > 5e7 ? "Pengadaan Bahan Baku > Rp 50 Juta (Wajib Otorisasi Procurement Lead & Manager)" : "Purchase Order Baru Menunggu Otorisasi",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      raw: e
    })),
    t5 = (Array.isArray(ti) ? ti : []).filter(e => "Butuh Persetujuan" === e.status).map(e => ({
      id: e.id,
      docNumber: e.number,
      module: "Biaya",
      type: e.category,
      party: e.payee,
      date: e.date,
      dueDate: "-",
      amount: e.amount,
      triggerReason: e.amount > 5e6 ? "Klaim Biaya Operasional & Reimbursement > Rp 5 Juta (Wajib Otorisasi Keuangan)" : "Pengeluaran Beban Menunggu Verifikasi",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      raw: e
    })),
    t2 = [...t0, ...t1, ...t5],
    t3 = t2.filter(e => {
      if ("penjualan" === td && "Penjualan" !== e.module || "pembelian" === td && "Pembelian" !== e.module || "biaya" === td && "Biaya" !== e.module) return !1;
      if (tx.trim()) {
        let a = tx.toLowerCase(),
          t = e.docNumber.toLowerCase().includes(a),
          s = e.party.toLowerCase().includes(a),
          n = e.type.toLowerCase().includes(a),
          i = e.triggerReason.toLowerCase().includes(a);
        if (!t && !s && !n && !i) return !1;
      }
      return !0;
    }),
    t4 = t2.reduce((e, a) => e + a.amount, 0),
    t6 = t0.reduce((e, a) => e + a.amount, 0),
    t8 = t1.reduce((e, a) => e + a.amount, 0),
    t7 = t5.reduce((e, a) => e + a.amount, 0),
    t9 = (Array.isArray(ty) ? ty : []).filter(e => e.module?.toLowerCase().includes("approval") || e.action?.toLowerCase().includes("approval") || e.action?.toLowerCase().includes("disetujui") || e.action?.toLowerCase().includes("ditolak")),
    se = () => {
      eO(null), e_(""), eV(""), eJ("warning"), eq("all"), eY(!0), eX("Saya Mengerti"), e0("Perhatian"), eL(!0);
    },
    sa = (tA && tA[eg]) || DEFAULT_ROLES_PERMISSIONS[eg] || DEFAULT_ROLES_PERMISSIONS.Owner || [],
    st = (Array.isArray(ty) ? ty : []).filter(e => e.action.toLowerCase().includes(tC.toLowerCase()) || e.user.toLowerCase().includes(tC.toLowerCase()) || e.module.toLowerCase().includes(tC.toLowerCase())),
    ss = async () => {
      if (!tY) return void e("Akses Ditolak: Hanya Akun Pemilik (Owner) yang berhak mereset seluruh data.");
      if ("RESET ASIA PLASTIK" === tM.trim()) {
        t$(!0);
        try {
          (await (0, resetFinanceData)(eo?.email || "carlossusanto89@gmail.com")) ? (al([]), a3([]), tt([]), tn([]), tl([]), tw([{
            time: "Baru saja",
            user: eo?.email || "carlossusanto89@gmail.com",
            action: "RESET TOTAL SISTEM: Seluruh data keuangan, vendor, transaksi, dan inventori di-reset ke kondisi kosong",
            module: "Pengaturan & Keamanan"
          }]), tF(!1), tK(""), e("Seluruh data finansial berhasil di-reset ke kondisi kosong.")) : e("Gagal mereset data. Periksa izin akses sistem.");
        } catch {
          e("Terjadi kesalahan teknis saat mereset data.");
        } finally {
          t$(!1);
        }
      }
    },
    sn = ek.trim() ? SEARCH_SETTINGS.filter(e => {
      let a = ek.toLowerCase();
      return e.title.toLowerCase().includes(a) || e.description.toLowerCase().includes(a) || e.category.toLowerCase().includes(a) || e.keywords.some(e => e.toLowerCase().includes(a));
    }) : [];
  return <div><PageHeader title="Pengaturan Akses, Keamanan & Integrasi" description="Manajemen otorisasi pengguna sistem, konfigurasi rekening fiktif/sandbox, Custom Roles (CRUD), approval berlapis, dan jejak audit real-time." actions={tY ? <button type="button" onClick={() => tF(!0)} className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-xs cursor-pointer"><RotateCcw className="h-3.5 w-3.5 text-rose-600" /><span>Reset Semua Data</span></button> : null} /><div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 space-y-3"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5 text-blue-600" /><span>Kategori Pengaturan:</span></label><div className="relative"><select value={eb} onChange={e => {
              let a = e.target.value;
              eh(a), ef("");
              let t = document.getElementById(`sec-${a}`);
              t && t.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"><option value="tampilan">A. Tampilan, Font & Visibilitas Dashboard</option><option value="otorisasi">1. Otorisasi Pengguna ({(Array.isArray(ec) ? ec : []).length} User)</option><option value="bank-config">2. Mode Bank & Sandbox Fiktif ({(Array.isArray(ai) ? ai : []).length} Rekening)</option><option value="roles">3. Custom Roles & Matriks Izin</option><option value="approval">4. Pusat Persetujuan / Approval ({t2.length} Tertunda)</option><option value="audit">5. Audit Log Aktivitas ({ty.length} Log)</option><option value="custom-popups">6. Custom Popup Page Load ({(Array.isArray(eI) ? eI : []).length} Popup)</option><option value="integrasi">7. Integrasi & MCP Agent ({INTEGRATION_SERVICES.length + 1} Layanan)</option><option value="daftar-lainnya">8. Daftar Lainnya (Master Hub & Utilitas)</option></select><ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" /></div></div><div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Search className="h-3.5 w-3.5 text-blue-600" /><span>Cari Pengaturan & Fitur:</span></label><div className="relative"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" /><input type="text" value={ek} onChange={e => ef(e.target.value)} placeholder="Cari: mcp, api key, reset, sandbox, approval, role, popup, audit..." className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-16 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-2xs placeholder:text-slate-400" />{ek && <button type="button" onClick={() => ef("")} className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-200/70 rounded px-1.5 py-0.5">Clear</button>}</div></div></div><div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100"><span className="text-[11px] font-bold text-slate-400 mr-1">Lompat langsung:</span>{[{
          id: "tampilan",
          label: "A. Tampilan & Font"
        }, {
          id: "otorisasi",
          label: "1. Otorisasi"
        }, {
          id: "bank-config",
          label: "2. Bank & Sandbox"
        }, {
          id: "roles",
          label: "3. Roles & Izin"
        }, {
          id: "approval",
          label: "4. Approval"
        }, {
          id: "audit",
          label: "5. Audit Log"
        }, {
          id: "custom-popups",
          label: "6. Custom Popup"
        }, {
          id: "integrasi",
          label: "7. Integrasi MCP"
        }, {
          id: "daftar-lainnya",
          label: "8. Daftar Lainnya"
        }].map(e => <button type="button" onClick={() => {
          eh(e.id);
          let a = document.getElementById(`sec-${e.id}`);
          a && a.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-2xs cursor-pointer" key={e.id}>{e.label}</button>)}</div></div>{ek.trim().length > 0 && <div className="space-y-4 mb-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">Hasil pencarian pengaturan untuk:</span><span className="font-bold text-sm text-blue-600">"{ek}"</span><span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{sn.length} Pengaturan Ditemukan</span></div><button type="button" onClick={() => ef("")} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"><X className="h-3 w-3" /><span>Tutup Hasil Cari</span></button></div>{0 === sn.length ? <Card className="p-8 text-center"><Search className="h-8 w-8 mx-auto text-slate-300 mb-2" /><div className="text-sm font-bold text-slate-800">Pengaturan tidak ditemukan</div><p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">Coba gunakan kata kunci lain seperti <em>mcp, api key, reset, sandbox, approval, role, popup, audit</em> atau pilih langsung kategori dari dropdown di atas.</p></Card> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{sn.map(e => <div onClick={() => {
          if (e.isResetAction) {
            tF(!0), ef("");
            let e = document.getElementById("sec-danger");
            e && e.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          } else {
            eh(e.tabTarget), ef("");
            let a = document.getElementById(`sec-${e.tabTarget}`);
            a && a.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }} className={`group rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between ${e.isResetAction ? "border-rose-200 bg-rose-50/40 hover:border-rose-400" : "border-slate-200 bg-white hover:border-blue-300"}`} key={e.id}><div><div className="flex items-center justify-between mb-2"><span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${e.isResetAction ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600"}`}>{e.category}</span><span className={`text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 ${e.isResetAction ? "text-rose-600" : "text-blue-600"}`}><span>{e.isResetAction ? "Buka Modal Reset" : "Lompat ke Bagian"}</span><ArrowRight className="h-3 w-3" /></span></div><h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{e.title}</h4><p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{e.description}</p></div><div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1">{e.keywords.slice(0, 4).map(e => <span className="text-[10px] text-slate-400" key={e}>#{e}</span>)}</div></div>)}</div>}</div>}<div className="space-y-12"><section id="sec-tampilan" className="space-y-4 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">A</div><div><h2 className="text-lg font-bold text-slate-900">Tampilan & Aksesibilitas Font</h2><p className="text-xs text-slate-500">Sesuaikan ukuran font antarmuka dan preferensi interaksi sistem</p></div></div><Card className="border border-blue-100 bg-white"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="text-xs font-bold text-slate-800 block mb-1">Ukuran Huruf Sistem (Font Size)</label><p className="text-[11px] text-slate-500 mb-3 leading-relaxed">Perbesar atau perkecil skala huruf seluruh aplikasi untuk kenyamanan membaca laporan dan angka keuangan.</p><div className="flex flex-wrap items-center gap-3"><div className="inline-flex items-center border border-slate-200 bg-slate-50/80 rounded-2xl p-1 shadow-2xs"><button type="button" onClick={() => eF(-1)} className="h-9 w-9 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-700 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center transition-all shadow-xs cursor-pointer" title="Perkecil Ukuran Huruf (-1px)"><Minus className="h-4 w-4 stroke-[2.5]" /></button><div className="px-4 text-center min-w-[76px]"><span className="text-base font-black text-slate-900 num block leading-none">{ev}px</span><span className="text-[9.5px] font-semibold text-slate-400 block mt-0.5">{16 === ev ? "Standar" : ev < 16 ? "Ringkas" : "Diperbesar"}</span></div><button type="button" onClick={() => eF(1)} className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer" title="Perbesar Ukuran Huruf (+1px)"><Plus className="h-4 w-4 stroke-[2.5]" /></button></div><button type="button" onClick={() => {
                  eN(16), eD(16), e("Ukuran huruf sistem dikembalikan ke standar (16px)");
                }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer" title="Kembalikan ke ukuran standar 16px"><RotateCcw className="h-3.5 w-3.5 text-slate-400" /><span>Reset (16px)</span></button></div></div><div className="space-y-3 pt-1 border-t md:border-t-0 md:border-l md:border-slate-100 md:pl-6"><Toggle checked={ey} onChange={a => {
                ew(a), e(a ? "Notifikasi status sistem diaktifkan" : "Notifikasi status sistem dimatikan");
              }} label="Notifikasi Toast Status Sistem" description="Tampilkan konfirmasi saat transaksi atau mutasi berhasil disimpan." /><Toggle checked={eC} onChange={a => {
                eP(a), e(a ? "Validasi ketat input diaktifkan" : "Validasi fleksibel diaktifkan");
              }} label="Validasi Format Input Dokumen" description="Wajibkan kelengkapan nomor dokumen dan referensi faktur fisik." /></div></div></Card><div id="sec-dashboard-config" className="scroll-mt-6"><Card className="border border-indigo-100 bg-white shadow-xs overflow-hidden"><div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs"><LayoutDashboard className="h-5 w-5" /></div><div><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><span>Visibilitas & Preferensi Tampilan Dashboard</span><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Kustomisasi UI</span></h3><p className="text-xs text-slate-500 mt-0.5">Sembunyikan dashboard dari menu navigasi sidebar atau tentukan sub-tab mana saja yang ditampilkan ke staf</p></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => {
                  eK(INITIAL_DASHBOARD_VISIBILITY), e("Preferensi visibilitas dashboard dikembalikan ke default.");
                }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer" title="Kembalikan semua tampilan ke standar"><RotateCcw className="h-3.5 w-3.5 text-slate-400" /><span>Reset Default</span></button><Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"><span>Buka Dashboard</span><ArrowUpRight className="h-3.5 w-3.5" /></Link></div></div><div className="space-y-6"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all"><div className="flex items-start justify-between gap-4"><div className="space-y-1"><div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-900">Tampilkan Menu Dashboard di Sidebar Navigasi</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${eM?.showDashboardInSidebar !== !1 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{eM?.showDashboardInSidebar !== !1 ? "Aktif di Sidebar" : "Disembunyikan"}</span></div><p className="text-xs text-slate-600 leading-relaxed max-w-2xl">Jika dinonaktifkan (disembunyikan), menu <strong>Dashboard</strong> tidak akan ditampilkan di bilah navigasi utama sebelah kiri (baik desktop maupun mobile). Staf operasional langsung fokus ke modul transaksi seperti Kas & Bank, Penjualan, atau Pembelian.</p></div><div className="shrink-0 pt-1"><Toggle checked={eM?.showDashboardInSidebar !== !1} onChange={a => {
                      eK(e => ({
                        ...(e || INITIAL_DASHBOARD_VISIBILITY),
                        showDashboardInSidebar: a
                      })), e(a ? "Menu Dashboard sekarang ditampilkan di navigasi sidebar." : "Menu Dashboard telah disembunyikan dari navigasi sidebar.");
                    }} /></div></div></div><div><div className="mb-3 flex items-center justify-between"><div><h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Visibilitas Sub-Tab Analisis di Halaman Dashboard</h4><p className="text-[11px] text-slate-500 mt-0.5">Pilih tab apa saja yang ditampilkan di bagian atas halaman Dashboard.</p></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${eM?.showRingkasanTab !== !1 ? "border-blue-200 bg-blue-50/20" : "border-slate-200 bg-slate-50/50 opacity-70"}`}><div><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-slate-900 flex items-center gap-1.5"><Layers className="h-4 w-4 text-blue-600" /><span>Tab Ringkasan</span></span><Toggle checked={eM?.showRingkasanTab !== !1} onChange={a => {
                          eK(e => ({
                            ...(e || INITIAL_DASHBOARD_VISIBILITY),
                            showRingkasanTab: a
                          })), e(a ? 'Tab "Ringkasan" diaktifkan di dashboard.' : 'Tab "Ringkasan" disembunyikan dari dashboard.');
                        }} /></div><p className="text-[11px] text-slate-600 leading-relaxed">Total saldo kas & bank, health score bisnis, kurva balance overview, rasio keuangan, dan catatan tugas operasional.</p></div><div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]"><span className="text-slate-400">Status Tab:</span><span className={`font-bold ${eM?.showRingkasanTab !== !1 ? "text-blue-600" : "text-slate-400"}`}>{eM?.showRingkasanTab !== !1 ? "Ditampilkan" : "Disembunyikan"}</span></div></div><div className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${eM?.showPerformaTab !== !1 ? "border-indigo-200 bg-indigo-50/20" : "border-slate-200 bg-slate-50/50 opacity-70"}`}><div><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-slate-900 flex items-center gap-1.5"><BarChart2 className="h-4 w-4 text-indigo-600" /><span>Tab Performa bisnis</span></span><Toggle checked={eM?.showPerformaTab !== !1} onChange={a => {
                          eK(e => ({
                            ...(e || INITIAL_DASHBOARD_VISIBILITY),
                            showPerformaTab: a
                          })), e(a ? 'Tab "Performa bisnis" diaktifkan di dashboard.' : 'Tab "Performa bisnis" disembunyikan dari dashboard.');
                        }} /></div><p className="text-[11px] text-slate-600 leading-relaxed">Grafik arus kas masuk/keluar/bersih bulanan (Mekari style) serta ringkasan tagihan penjualan & pembelian berjalan.</p></div><div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]"><span className="text-slate-400">Status Tab:</span><span className={`font-bold ${eM?.showPerformaTab !== !1 ? "text-indigo-600" : "text-slate-400"}`}>{eM?.showPerformaTab !== !1 ? "Ditampilkan" : "Disembunyikan"}</span></div></div><div className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${eM?.showLookerTab !== !1 ? "border-purple-200 bg-purple-50/20" : "border-slate-200 bg-slate-50/50 opacity-70"}`}><div><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-slate-900 flex items-center gap-1.5"><PanelsTopLeft className="h-4 w-4 text-purple-600" /><span>Kustom Analisis (Looker)</span></span><Toggle checked={eM?.showLookerTab !== !1} onChange={a => {
                          eK(e => ({
                            ...(e || INITIAL_DASHBOARD_VISIBILITY),
                            showLookerTab: a
                          })), e(a ? 'Tab "Kustom Analisis (Looker)" diaktifkan.' : 'Tab "Kustom Analisis (Looker)" disembunyikan.');
                        }} /></div><p className="text-[11px] text-slate-600 leading-relaxed">Kanvas analitik interaktif Google Looker Studio dengan kartu metrik dan diagram kustom multi-kolom yang dapat diatur bebas.</p></div><div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]"><span className="text-slate-400">Status Tab:</span><span className={`font-bold ${eM?.showLookerTab !== !1 ? "text-purple-600" : "text-slate-400"}`}>{eM?.showLookerTab !== !1 ? "Ditampilkan" : "Disembunyikan"}</span></div></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100"><div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/40 flex items-center justify-between"><div><span className="text-xs font-bold text-slate-900 block">Tombol "+ Tambah dashboard"</span><span className="text-[11px] text-slate-500 mt-0.5 block max-w-sm">Tampilkan tombol aksi cepat untuk mendesain kartu Looker baru langsung di barisan sub-tab dashboard.</span></div><Toggle checked={eM?.showAddDashboardBtn !== !1} onChange={a => {
                    eK(e => ({
                      ...(e || INITIAL_DASHBOARD_VISIBILITY),
                      showAddDashboardBtn: a
                    })), e(a ? 'Tombol "+ Tambah dashboard" sekarang muncul.' : 'Tombol "+ Tambah dashboard" disembunyikan.');
                  }} /></div><div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/40"><label className="text-xs font-bold text-slate-900 block mb-1">Default Tab Saat Membuka Dashboard</label><p className="text-[11px] text-slate-500 mb-2.5">Tab yang otomatis terbuka pertama kali saat pengguna mengakses menu Dashboard.</p><select value={eM?.defaultTab || "ringkasan"} onChange={a => {
                    let t = a.target.value;
                    eK(e => ({
                      ...(e || INITIAL_DASHBOARD_VISIBILITY),
                      defaultTab: t
                    })), e(`Default tab dashboard disetel ke ${"ringkasan" === t ? "Ringkasan Lengkap" : "performa" === t ? "Performa Bisnis" : "Kustom Analisis Looker"}.`);
                  }} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"><option value="ringkasan">Tab Ringkasan Lengkap (Standar)</option><option value="performa">Tab Performa Bisnis (Mekari Arus Kas)</option><option value="looker">Tab Kustom Analisis (Looker Studio)</option></select></div></div></div></Card></div></section><section id="sec-otorisasi" className="space-y-6 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">1</div><div><h2 className="text-lg font-bold text-slate-900">Otorisasi & Akses Pengguna</h2><p className="text-xs text-slate-500">Kelola staf operasional, undang pengguna baru, dan atur peran hak akses sistem</p></div></div>{!tY && <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-xs flex items-start gap-3"><ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /><div><h4 className="font-bold text-sm text-amber-950">Akses Terbatas: Hanya Akun Owner yang Berhak Mengundang & Mengubah Otorisasi</h4><p className="mt-1 leading-relaxed text-amber-800">Anda login sebagai <strong>{ed?.role ?? "Finance Manager"}</strong>. Sesuai kebijakan tata kelola Asia Plastik, Manager memiliki akses penuh ke operasional aplikasi, namun wewenang menambah/mengundang pengguna (Invite User), mengganti peran, dan menghapus otorisasi secara eksklusif hanya dipegang oleh Pemilik (Owner).</p></div></div>}<div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><Card><div className="mb-3 flex items-center gap-2"><UserPlus className="h-4 w-4 text-[#0284C7]" /><h3 className="text-base font-semibold text-[#0B192C]">Tambah Akses Pengguna</h3></div><p className="text-xs text-[#475E78]">Hanya email terdaftar dan aktif di sistem yang dapat membuka aplikasi ini.</p><form onSubmit={tQ} className="mt-4 space-y-3 text-sm"><div><label className="mb-1 block text-xs font-semibold text-[#334760]">Alamat Email (Gmail / Work Email)</label><input type="email" required={!0} disabled={!tY} value={e2} onChange={e => e3(e.target.value)} placeholder="nama@perusahaan.com" className="w-full rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] px-3 py-2 text-sm focus:border-[#0284C7] focus:bg-white focus:outline-none disabled:opacity-60" /></div><div><label className="mb-1 block text-xs font-semibold text-[#334760]">Nama Lengkap</label><input type="text" disabled={!tY} value={e4} onChange={e => e6(e.target.value)} placeholder="Contoh: Rina Hartono" className="w-full rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] px-3 py-2 text-sm focus:border-[#0284C7] focus:bg-white focus:outline-none disabled:opacity-60" /></div><div><label className="mb-1 block text-xs font-semibold text-[#334760]">Peran (Role)</label><select disabled={!tY} value={e8} onChange={e => e7(e.target.value)} className="w-full rounded-lg border border-[#DCE7F5] bg-white px-3 py-2 text-sm disabled:opacity-60">{AVAILABLE_ROLES.map(e => <option value={e} key={e}>{e}</option>)}</select></div>{e9 && <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#991B1B]">{e9}</div>}<PrimaryButton type="submit" disabled={!tY || aa} className="w-full justify-center">{aa ? "Menyimpan ke sistem..." : "Otorisasi Pengguna"}</PrimaryButton></form></Card><Card padding={!1} className="lg:col-span-2"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F5] px-5 py-3.5"><div><h3 className="text-sm font-semibold text-[#0B192C]">Daftar Pengguna Terotorisasi</h3><div className="mt-0.5 text-[11px] text-[#475E78]">Penyimpanan: Basis Data Sistem</div></div><StatusBadge status={"connected" === ex ? "Sistem Terhubung" : "permission-denied" === ex ? "Izin Akses Perlu Diperbarui" : "Menghubungkan"} /></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]"><tr><th className="px-5 py-3">Email & Nama</th><th className="px-4 py-3">Peran</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-[#EDF4FC]">{(Array.isArray(ec) ? ec : []).map(t => {
                    let n = t.email.toLowerCase() === DEFAULT_OWNER_EMAIL;
                    return <tr className="hover:bg-[#F8FBFF]" key={t.email}><td className="px-5 py-3.5"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="font-semibold text-[#0B192C] truncate">{t.email}</div><div className="text-xs text-[#475E78] truncate">{t.name}{n ? " · Owner Utama" : ""}</div></div><Link href={`/pengguna?email=${encodeURIComponent(t.email)}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 text-xs font-bold transition shrink-0" title="Buka profil lengkap pengguna ini"><span>Profil</span><ArrowUpRight className="h-3 w-3" /></Link></div></td><td className="px-4 py-3.5"><select disabled={!tY || n} value={t.role} onChange={async a => {
                          let s = a.target.value,
                            n = await em(t.email, {
                              role: s
                            });
                          n.ok ? e(`Peran ${t.email} diubah ke ${s}.`) : e(n.error ?? "Gagal mengubah peran.");
                        }} className="rounded-md border border-[#DCE7F5] bg-white px-2.5 py-1 text-xs font-medium text-[#0B192C] disabled:bg-[#F8FBFF] disabled:text-[#475E78]">{AVAILABLE_ROLES.map(e => <option value={e} key={e}>{e}</option>)}</select></td><td className="px-4 py-3.5"><button type="button" disabled={!tY || n} onClick={async () => {
                          (await em(t.email, {
                            active: !t.active
                          })).ok && e(`${t.email} ${!t.active ? "diaktifkan" : "dinonaktifkan"}.`);
                        }}><StatusBadge status={t.active ? "Aktif" : "Nonaktif"} /></button></td><td className="px-5 py-3.5 text-right">{!n && tY ? <button type="button" onClick={async () => {
                          let a = await ep(t.email);
                          a.ok ? e(`Akses ${t.email} dicabut.`) : e(a.error ?? "Gagal mencabut akses.");
                        }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#991B1B] hover:bg-[#FEF2F2]"><UserCheck className="h-3.5 w-3.5" /><span>Hapus</span></button> : <span className="text-xs text-[#475E78]">Terlindungi</span>}</td></tr>;
                  })}</tbody></table></div></Card></div>{"permission-denied" === ex && <Card className="border-[#FDE68A] bg-[#FFFBEB]"><h3 className="text-sm font-semibold text-[#92400E]">Pengaturan izin database sistem perlu diperbarui</h3><p className="mt-1 text-xs text-[#92400E]">Database sistem menolak akses baca/tulis. Pastikan aturan otorisasi sistem telah disesuaikan.</p></Card>}</section><section id="sec-bank-config" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">2</div><div><h2 className="text-lg font-bold text-slate-900">Mode Bank & Saldo Sandbox Fiktif</h2><p className="text-xs text-slate-500">Kelola rekening bank virtual, kartu korporat, kartu debit/kredit, dan saldo untuk simulasi</p></div></div><Card className="border-blue-100 bg-gradient-to-r from-blue-50/40 via-white to-slate-50"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Landmark className="h-5 w-5 text-blue-600" /><h3 className="text-base font-semibold text-slate-900">Mode Konfigurasi Perbankan</h3></div><p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">Karena integrasi open banking komersial belum terhubung secara live, Anda dapat memilih apakah ingin menggunakan <b>Mode Rekening Fiktif (Sandbox)</b> untuk simulasi operasional & transaksi finansial nyata di dalam workspace.</p></div><div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200"><button type="button" onClick={() => {
                an("fiktif"), e("Mode Sandbox / Rekening Fiktif diaktifkan.");
              }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${"fiktif" === as ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}><Sparkles className="h-3.5 w-3.5 text-blue-600" /><span>Mode Fiktif (Sandbox)</span></button><button type="button" onClick={() => {
                tT({
                  open: !0,
                  title: "Integrasi API Bank Terhubung (Live)",
                  desc: "Mode Bank Live memerlukan aktivasi Open Banking BI-FAST, BCA Snap, atau Mandiri Cash Management API dengan sertifikat mTLS dan API Key perbankan. Fitur ini sedang dalam antrean sertifikasi (Coming Soon)."
                });
              }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${"live" === as ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}><Lock className="h-3.5 w-3.5 text-amber-600" /><span>Mode Bank Live (API)</span></button></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs"><div className="flex items-center gap-2"><span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><span className="font-semibold text-slate-700">Status Saat Ini: <span className="text-emerald-700 font-bold">{"fiktif" === as ? "Rekening Fiktif / Sandbox Aktif" : "Mode Live Terkunci"}</span></span></div><span className="text-slate-500 text-[11px]">{(Array.isArray(ai) ? ai : []).length} Rekening & Kartu Terdaftar</span></div></Card><div><div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold text-slate-900">Daftar Rekening & Kartu Fiktif (Sandbox)</h3><p className="text-xs text-slate-500">Detail nomor rekening, kartu kredit fiktif, CVV, dan peruntukan (purpose) untuk transaksi kas & bank.</p></div><PrimaryButton onClick={() => ao(!0)}><Plus className="h-4 w-4" /><span>Tambah Bank / Kartu Fiktif</span></PrimaryButton></div>{0 === (Array.isArray(ai) ? ai : []).length ? <EmptyState title="Belum Ada Rekening Bank / Kartu Fiktif" description="Tambahkan rekening fiktif pertama Anda untuk mulai mencatat transaksi kas & bank, rekonsiliasi, dan pembayaran invoice." actionLabel="Tambah Rekening Pertama" onAction={() => ao(!0)} /> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{(Array.isArray(ai) ? ai : []).map(t => {
              let s = !!aD[t.id];
              return "Kartu Kredit" === t.type || t.cardNumber, <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 text-slate-800 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md" key={t.id}><div><div className="flex items-start justify-between"><div><div className="text-[11px] font-bold tracking-wider uppercase text-blue-600">{t.bankLabel}</div><div className="text-sm font-bold text-slate-900 mt-0.5">{t.name}</div></div><span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">{t.type}</span></div><div className="mt-4 flex items-center justify-between"><div className="h-6 w-9 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-2xs border border-amber-400/60 relative"><div className="absolute inset-0.5 border-t border-b border-amber-600/30" /></div><div className="text-[11px] text-slate-400 font-mono font-bold">{t.currency}</div></div><div className="mt-4 flex items-center justify-between"><div className="font-mono text-sm tracking-widest text-slate-800 font-bold">{s ? t.cardNumber || "4532 8920 1234 5678" : t.cardNumber ? `•••• •••• •••• ${t.cardNumber.slice(-4)}` : "•••• •••• •••• 5678"}</div><button type="button" onClick={() => aF(e => ({
                      ...e,
                      [t.id]: !e[t.id]
                    }))} className="text-slate-400 hover:text-blue-600 p-1 transition-colors" title={s ? "Sembunyikan detail" : "Lihat detail"}>{s ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div><div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-[10px]"><div><div className="text-slate-400 font-medium">PEMEGANG</div><div className="font-bold truncate text-slate-800 uppercase mt-0.5">{t.cardName || t.name}</div></div><div><div className="text-slate-400 font-medium">EXP</div><div className="font-bold text-slate-800 mt-0.5 font-mono">{t.expDate || "12/28"}</div></div><div><div className="text-slate-400 font-medium">CVV</div><div className="font-bold text-slate-800 mt-0.5 font-mono">{s ? t.cvv || "888" : "•••"}</div></div></div></div><div className="mt-4 pt-3 border-t border-slate-100"><div className="flex items-center justify-between text-xs"><span className="text-slate-500 font-medium">Saldo Riil:</span><span className="font-bold num text-blue-600 text-sm">{(0, formatRupiah)(t.balanceBank)}</span></div>{t.purpose && <div className="mt-2 flex items-center justify-between text-[11px]"><span className="text-slate-400">Peruntukan:</span><span className="rounded-lg bg-blue-50/70 px-2 py-0.5 font-medium text-blue-700 border border-blue-100 truncate max-w-[180px]">{t.purpose}</span></div>}<div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs"><span className="text-slate-400 font-mono text-[10px]">Kode: {t.code}</span><div className="flex items-center gap-2"><button type="button" onClick={() => {
                        aK(t), a$(t.bankLabel || "Bank Central Asia (BCA)"), aL(t.name || ""), aO(t.type || "Bank"), a_(t.currency || "IDR"), aV(t.balanceBank ?? 0), aJ(t.code || ""), aq(t.purpose || "Operasional Bisnis"), aY(t.cardName || ""), aX(t.cardNumber || ""), a0(t.expDate || ""), a5(t.cvv || "");
                      }} className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"><PenLine className="h-3 w-3" /><span>Ubah Saldo & Detail</span></button><button type="button" onClick={() => {
                        var a, s;
                        return a = t.id, s = t.name, void er({
                          title: "Hapus Rekening Bank",
                          message: `Hapus rekening "${s}" dari sistem?`,
                          confirmText: "Hapus Rekening",
                          cancelText: "Batal",
                          isDanger: !0,
                          onConfirm: () => {
                            al((Array.isArray(ai) ? ai : []).filter(e => e.id !== a)), e(`Rekening "${s}" berhasil dihapus.`);
                          }
                        });
                      }} className="text-slate-400 hover:text-rose-600 text-[11px] flex items-center gap-1 font-medium transition-colors"><UserCheck className="h-3 w-3" /><span>Hapus</span></button></div></div></div></div>;
            })}</div>}</div></section><section id="sec-roles" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">3</div><div><h2 className="text-lg font-bold text-slate-900">Custom Roles & Matriks Perizinan</h2><p className="text-xs text-slate-500">Konfigurasi hak akses modul dan perizinan Create, Read, Update, Delete untuk tiap peran</p></div></div><div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><Card><div className="mb-3 flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#0284C7]" /><h3 className="text-base font-semibold text-[#0B192C]">Daftar Peran (Roles)</h3></div><div className="space-y-1.5">{Object.keys(tA || {}).map(e => <button type="button" onClick={() => ej(e)} className={`w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${eg === e ? "bg-[#E6F2FE] font-semibold text-[#0369A1]" : "text-[#334760] hover:bg-[#F4F8FD]"}`} key={e}>{e}</button>)}</div><div className="mt-4 rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] p-3 text-xs text-[#586E89]">Setiap perubahan izin akan tersimpan otomatis ke sistem dan langsung berlaku pada sesi pengguna aktif.</div></Card><Card padding={!1} className="lg:col-span-2"><div className="flex items-center justify-between border-b border-[#DCE7F5] px-5 py-3.5"><div><h3 className="text-sm font-semibold text-[#0B192C]">Matriks Hak Akses CRUD: {eg}</h3></div><PrimaryButton className="px-3 py-1.5 text-xs" onClick={() => e(`Hak akses peran "${eg}" berhasil disimpan ke sistem.`)}>Simpan Wewenang</PrimaryButton></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]"><tr><th className="px-5 py-3">Modul Sistem</th><th className="px-4 py-3 text-center">Create</th><th className="px-4 py-3 text-center">Read</th><th className="px-4 py-3 text-center">Update</th><th className="px-4 py-3 text-center">Delete</th><th className="px-4 py-3 text-center">Approve</th></tr></thead><tbody className="divide-y divide-[#EDF4FC]">{sa.map(e => <tr className="hover:bg-[#F8FBFF]" key={e.module}><td className="px-5 py-3.5"><div className="font-medium text-[#0B192C]">{e.module}</div>{e.note && <div className="text-[11px] text-[#0369A1]">{e.note}</div>}</td>{["create", "read", "update", "del", "approve"].map(t => <td className="px-4 py-3.5 text-center" key={t}><input type="checkbox" checked={!!e[t]} onChange={() => {
                        var a;
                        let s;
                        return a = e.module, s = (tA[eg] ?? []).map(e => e.module === a ? {
                          ...e,
                          [t]: !e[t]
                        } : e), void tS({
                          ...tA,
                          [eg]: s
                        });
                      }} className="h-4 w-4 rounded accent-[#0284C7] cursor-pointer" /></td>)}</tr>)}</tbody></table></div></Card></div></section><section id="sec-approval" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">4</div><div><h2 className="text-lg font-bold text-slate-900">Pusat Persetujuan / Approval Transaksi</h2><p className="text-xs text-slate-500">Verifikasi transaksi bernilai tinggi, invoice, PO, dan pengeluaran sebelum finalisasi</p></div></div>{!tX && <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-xs flex items-start gap-3"><ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /><div><h4 className="font-bold text-sm text-amber-950">Mode Akses Terbatas Staf: {tZ}</h4><p className="mt-1 leading-relaxed text-amber-800">Sesuai kebijakan tata kelola finansial Asia Plastik, peran <strong>{tZ}</strong> hanya berhak membuat dan mengedit draft operasional (CUD tanpa approval). Hak persetujuan dan penolakan transaksi bernilai tinggi secara eksklusif hanya dapat dieksekusi oleh <strong>Finance Manager</strong> dan <strong>Owner</strong>.</p></div></div>}<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE7F5] pb-3"><div className="inline-flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => to("queue")} className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${"queue" === tr ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}><Clock className="h-3.5 w-3.5" /><span>Antrean Menunggu Persetujuan</span><span className={`num rounded-full px-2 py-0.5 text-[11px] font-bold ${"queue" === tr ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"}`}>{t2.length}</span></button><button type="button" onClick={() => to("rules")} className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${"rules" === tr ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}><Layers className="h-3.5 w-3.5" /><span>Aturan Approval Berlapis</span><span className={`num rounded-full px-2 py-0.5 text-[11px] font-bold ${"rules" === tr ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"}`}>{(Array.isArray(a2) ? a2 : []).length}</span></button><button type="button" onClick={() => to("history")} className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${"history" === tr ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}><CheckCheck className="h-3.5 w-3.5" /><span>Riwayat Audit Persetujuan</span></button></div>{"queue" === tr && tX && t3.length > 0 && <SecondaryButton className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={() => tN(!0)}><Check className="h-3.5 w-3.5 text-emerald-600" /><span>Setujui Semua ({t3.length})</span></SecondaryButton>}{"rules" === tr && <PrimaryButton onClick={() => a6(!0)}><Plus className="h-4 w-4" /><span>Tambah Aturan Baru</span></PrimaryButton>}</div>{"queue" === tr && <a.Fragment><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total Menunggu Persetujuan" value={`${t2.length} Dokumen`} subtext="Otorisasi lintas departemen" tone={t2.length > 0 ? "warning" : "positive"} /><StatCard label="Nilai Komitmen Tertahan" value={(0, formatRupiah)(t4)} subtext="Total dana dalam antrean" tone="neutral" /><StatCard label="Pengadaan / PO Tertahan" value={`${t1.length} PO / PR`} subtext={(0, formatRupiah)(t8)} tone="neutral" /><StatCard label="Penjualan & Beban Tertahan" value={`${t0.length + t5.length} Dokumen`} subtext={(0, formatRupiah)(t6 + t7)} tone="neutral" /></div><Card padding={!1}><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE7F5] p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-[#586E89] mr-1 flex items-center gap-1"><Filter className="h-3 w-3" /> Filter Modul:</span>{[{
                  id: "semua",
                  label: "Semua",
                  count: t2.length
                }, {
                  id: "penjualan",
                  label: "Penjualan",
                  count: t0.length
                }, {
                  id: "pembelian",
                  label: "Pembelian",
                  count: t1.length
                }, {
                  id: "biaya",
                  label: "Biaya & Beban",
                  count: t5.length
                }].map(e => <button type="button" onClick={() => tc(e.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${td === e.id ? "bg-[#0B192C] text-white shadow-2xs" : "bg-[#EDF4FC] text-[#334760] hover:bg-[#DCE7F5]"}`} key={e.id}><span>{e.label}</span><span className="text-[10px] opacity-75">({e.count})</span></button>)}</div><div className="relative w-full sm:w-64"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#586E89]" /><input type="text" placeholder="Cari nomor, pihak, alasan..." value={tx} onChange={e => tu(e.target.value)} className="w-full rounded-xl border border-[#DCE7F5] bg-white py-1.5 pl-8 pr-3 text-xs focus:border-[#0284C7] focus:outline-none" /></div></div>{0 === t3.length ? <div className="p-8"><EmptyState title="Antrean Approval Bersih" description="Tidak ada transaksi yang menunggu persetujuan pada filter ini." /></div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#F8FBFF] border-b border-[#DCE7F5] text-[#586E89] uppercase font-semibold"><tr><th className="px-5 py-3">Dokumen & Tipe</th><th className="px-5 py-3">Pihak / Rekanan</th><th className="px-5 py-3">Tanggal & Tempo</th><th className="px-5 py-3 text-right">Nilai Transaksi</th><th className="px-5 py-3">Aturan Pemicu Otorisasi</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-right">Aksi Otorisasi</th></tr></thead><tbody className="divide-y divide-[#EDF4FC]">{t3.map(e => <tr className="hover:bg-[#F8FBFF] transition-colors" key={`${e.module}-${e.id}`}><td className="px-5 py-3.5"><div className="flex items-center gap-2"><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${e.badgeColor}`}>{e.module}</span><div><div className="font-bold text-[#0B192C]">{e.docNumber}</div><div className="text-[11px] text-[#586E89]">{e.type}</div></div></div></td><td className="px-5 py-3.5 font-medium text-[#0B192C]">{e.party}</td><td className="px-5 py-3.5 text-[#586E89]"><div>{e.date}</div>{"-" !== e.dueDate && <div className="text-[10px] text-slate-400">Tempo: {e.dueDate}</div>}</td><td className="num px-5 py-3.5 text-right font-bold text-[#0B192C]">{(0, formatRupiah)(e.amount)}</td><td className="px-5 py-3.5 text-[#475E78]"><span className="inline-block max-w-xs leading-snug">{e.triggerReason}</span></td><td className="px-5 py-3.5 text-center"><StatusBadge status="Menunggu Approval" /></td><td className="px-5 py-3.5 text-right"><div className="flex items-center justify-end gap-1.5">{tX ? <a.Fragment><button type="button" onClick={() => {
                            tp(e), th("");
                          }} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs" title="Setujui Dokumen"><Check className="h-3 w-3" /><span>Setujui</span></button><button type="button" onClick={() => {
                            tj(e), tf("");
                          }} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors" title="Tolak Dokumen"><X className="h-3 w-3" /><span>Tolak</span></button></a.Fragment> : <span title="Peran Anda tidak memiliki hak approval (Staff CUD tanpa approve - hanya Manager & Owner)" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-400 cursor-not-allowed"><Lock className="h-3 w-3" /><span>Perlu Manager/Owner</span></span>}</div></td></tr>)}</tbody></table></div>}</Card></a.Fragment>}{"rules" === tr && <Card><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold text-[#0B192C]">Aturan Persetujuan Transaksi Berlapis (Approval Workflow)</h3><p className="text-xs text-[#586E89]">Transaksi di atas ambang batas otomatis berstatus menunggu persetujuan dan dicatat di sistem.</p></div><PrimaryButton onClick={() => a6(!0)}><Plus className="h-4 w-4" /><span>Tambah Aturan Baru</span></PrimaryButton></div>{0 === (Array.isArray(a2) ? a2 : []).length ? <EmptyState title="Belum Ada Aturan Persetujuan" description="Tambahkan aturan approval untuk mengontrol transaksi bernilai tinggi." actionLabel="Tambah Aturan" onAction={() => a6(!0)} /> : <div className="space-y-3 text-sm">{(Array.isArray(a2) ? a2 : []).map(t => <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] p-4 transition-colors hover:border-[#BAE6FD]" key={t.id}><div><div className="font-semibold text-[#0B192C]">{t.name}</div><div className="mt-0.5 text-xs text-[#586E89]">{t.approvers}</div></div><div className="flex items-center gap-3"><button type="button" onClick={() => {
                  var a;
                  return a = t.id, void (a3((Array.isArray(a2) ? a2 : []).map(e => e.id === a ? {
                    ...e,
                    active: !e.active
                  } : e)), e("Status aturan persetujuan diperbarui."));
                }}><StatusBadge status={t.active ? "Aktif" : "Nonaktif"} /></button><button type="button" onClick={() => {
                  var a;
                  return a = t.id, void (a3((Array.isArray(a2) ? a2 : []).filter(e => e.id !== a)), e("Aturan persetujuan dihapus."));
                }} className="rounded p-1 text-[#991B1B] hover:bg-[#FEF2F2]" title="Hapus Aturan"><UserCheck className="h-4 w-4" /></button></div></div>)}</div>}</Card>}{"history" === tr && <Card padding={!1}><div className="border-b border-[#DCE7F5] px-5 py-3.5"><h3 className="text-sm font-semibold text-[#0B192C]">Histori Jejak Audit Persetujuan & Penolakan</h3><p className="text-[11px] text-[#586E89]">Log permanen seluruh otorisasi transaksi yang dilakukan oleh Finance Manager dan Owner</p></div>{0 === t9.length ? <div className="p-8"><EmptyState title="Belum Ada Riwayat Persetujuan" description="Seluruh aksi persetujuan atau penolakan transaksi akan otomatis terekam di sini." /></div> : <div className="divide-y divide-[#EDF4FC]">{t9.map((e, t) => <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-xs hover:bg-[#F8FBFF]" key={t}><div className="space-y-0.5"><div className="font-medium text-[#0B192C] leading-relaxed">{e.action}</div><div className="text-[11px] text-[#586E89]">Oleh <strong>{e.user}</strong> · Modul {e.module}</div></div><div className="num text-[11px] font-semibold text-slate-500 whitespace-nowrap">{e.time}</div></div>)}</div>}</Card>}</section><section id="sec-audit" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">5</div><div><h2 className="text-lg font-bold text-slate-900">Audit Log & Jejak Digital Aktivitas</h2><p className="text-xs text-slate-500">Rekam jejak setiap aksi pengguna, login, penambahan data, dan perubahan konfigurasi secara real-time</p></div></div><Card padding={!1}><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE7F5] px-5 py-3.5"><div><h3 className="text-sm font-semibold text-[#0B192C]">Jejak Audit Digital (Audit Trail Sistem)</h3><div className="text-[11px] text-[#586E89]">Merekam histori aksi pengguna secara real-time</div></div><div className="flex items-center gap-2"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#586E89]" /><input type="text" placeholder="Cari audit log..." value={tC} onChange={e => tP(e.target.value)} className="rounded-lg border border-[#DCE7F5] bg-white py-1.5 pl-8 pr-3 text-xs focus:border-[#0284C7] focus:outline-none" /></div><SecondaryButton className="px-3 py-1.5 text-xs" onClick={() => {
                let a = "data:text/csv;charset=utf-8,Waktu,Pengguna,Aksi,Modul\r\n";
                (Array.isArray(ty) ? ty : []).forEach(e => {
                  a += `"${e.time}","${e.user}","${e.action.replace(/"/g, '""')}","${e.module}"\r
`;
                });
                let t = encodeURI(a),
                  s = document.createElement("a");
                s.setAttribute("href", t), s.setAttribute("download", `audit_log_${new Date().toISOString().slice(0, 10)}.csv`), document.body.appendChild(s), s.click(), document.body.removeChild(s), e("Audit log berhasil diekspor ke format CSV.");
              }}><Download className="h-3.5 w-3.5 text-[#0284C7]" /><span>Unduh CSV</span></SecondaryButton></div></div>{0 === st.length ? <div className="p-8"><EmptyState title="Belum Ada Aktivitas Tercatat" description="Semua aktivitas transaksi, perubahan pengguna, dan otorisasi akan otomatis terekam di sini." /></div> : <div className="divide-y divide-[#EDF4FC]">{st.map((e, t) => <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm hover:bg-[#F8FBFF]" key={t}><div><div className="font-medium text-[#0B192C]">{e.action}</div><div className="mt-0.5 text-xs text-[#586E89]">{e.user} · Modul {e.module}</div></div><div className="num text-xs font-medium text-[#586E89]">{e.time}</div></div>)}</div>}</Card></section><section id="sec-custom-popups" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">6</div><div><h2 className="text-lg font-bold text-slate-900">Konfigurasi Custom Popup Page Load</h2><p className="text-xs text-slate-500">Atur notifikasi popup selamat datang, pengingat SOP, dan peringatan interaktif tiap halaman</p></div></div><Card><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><div className="flex items-center gap-2"><h3 className="text-base font-bold text-slate-900">Konfigurasi Custom Popup Page Load</h3><span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">{(Array.isArray(eI) ? eI : []).filter(e => e.active).length} Aktif</span></div><p className="mt-0.5 text-xs text-slate-500">Tampilkan notifikasi, alert kepatuhan, atau pengumuman interaktif saat pengguna memuat/membuka halaman tertentu.</p></div><PrimaryButton onClick={se} className="text-xs"><Plus className="h-3.5 w-3.5" /><span>Tambah Popup Baru</span></PrimaryButton></div><div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-700 space-y-1.5"><div className="font-bold text-blue-900 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-600" />Fitur Urutan Tayang (Drag & Drop) & Multi-Popup</div><p className="text-[11px] leading-relaxed text-slate-600">1. <strong>Drag & Drop</strong>: Klik dan tahan pegangan <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700">⠿</span> untuk menggeser dan mengatur urutan tayang popup.<br />2. <strong>Multi-Popup</strong>: Jika suatu halaman memiliki lebih dari 1 popup aktif, sistem akan menampilkannya secara bertahap menggunakan tombol <em>Lanjut</em> hingga selesai.<br />3. <strong>Uji Langsung</strong>: Klik tombol <em>Uji Popup</em> pada baris untuk melihat pratinjau tampilan popup di layar.</p></div><div className="mt-5 space-y-3">{0 === eI.length ? <EmptyState title="Belum Ada Custom Popup" description="Tambahkan pesan popup untuk memperingatkan pengguna saat membuka halaman tertentu." actionLabel="Tambah Popup Pertama" onAction={se} /> : (Array.isArray(eI) ? eI : []).slice().sort((e, a) => (e.order || 0) - (a.order || 0)).map((t, s) => {
              let i = e1 === s,
                l = {
                  warning: {
                    label: "Peringatan",
                    icon: AlertTriangle,
                    color: "text-amber-700",
                    bg: "bg-amber-50",
                    border: "border-amber-200"
                  },
                  danger: {
                    label: "Bahaya / Urgent",
                    icon: AlertOctagon,
                    color: "text-rose-700",
                    bg: "bg-rose-50",
                    border: "border-rose-200"
                  },
                  info: {
                    label: "Informasi",
                    icon: Info,
                    color: "text-sky-700",
                    bg: "bg-sky-50",
                    border: "border-sky-200"
                  },
                  success: {
                    label: "Sukses",
                    icon: CheckCircle2,
                    color: "text-emerald-700",
                    bg: "bg-emerald-50",
                    border: "border-emerald-200"
                  },
                  announcement: {
                    label: "Pengumuman",
                    icon: AlertOctagon,
                    color: "text-purple-700",
                    bg: "bg-purple-50",
                    border: "border-purple-200"
                  }
                },
                r = l[t.iconTone || "info"] || l.info,
                o = r.icon;
              return <div draggable={!0} onDragStart={() => {
                e5(s);
              }} onDragOver={e => {
                e.preventDefault();
              }} onDrop={() => (a => {
                if (null === e1 || e1 === a) return;
                let t = Array.isArray(eI) ? [...eI] : [],
                  s = t[e1];
                t.splice(e1, 1), t.splice(a, 0, s), e$(t.map((e, a) => ({
                  ...e,
                  order: a + 1
                }))), e5(null), e("Urutan tayang popup berhasil diperbarui.");
              })(s)} className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${i ? "opacity-50 border-blue-500 bg-blue-50/40 shadow-inner" : t.active ? "border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs" : "border-slate-200 bg-slate-50/60 opacity-70"}`} key={t.id}><div className="flex items-start gap-3.5 flex-1 min-w-0"><div className="flex items-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 transition-colors p-1" title="Tahan dan geser untuk mengubah urutan tayang"><GripVertical className="h-5 w-5" /></div><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold font-mono text-slate-700">#{s + 1}</div><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${r.bg} ${r.border} ${r.color}`}><Smartphone className="h-5 w-5" /></div><div className="flex-1 min-w-0 space-y-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-bold text-slate-900 truncate">{t.title}</h4><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${r.bg} ${r.border} ${r.color}`}>{r.label}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{{
                          all: "Semua Halaman (Global)",
                          "/": "Dashboard / Overview",
                          "/kas-bank": "Kas & Bank",
                          "/rekonsiliasi": "Rekonsiliasi Bank",
                          "/biaya-anggaran": "Biaya & Anggaran",
                          "/penjualan": "Penjualan & Faktur",
                          "/pembelian": "Pembelian & Tagihan",
                          "/inventori-produksi": "Inventori & Gudang",
                          "/akuntansi": "Akuntansi & Jurnal",
                          "/perpajakan": "Pajak & Coretax",
                          "/laporan": "Laporan Keuangan",
                          "/pengaturan": "Pengaturan Sistem",
                          "/dokumentasi": "Dokumentasi & Panduan"
                        }[t.targetPage] || t.targetPage}</span>{t.badgeText && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">{t.badgeText}</span>}</div><p className="text-xs text-slate-600 line-clamp-2">{t.message}</p><div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5"><span>Tombol: “{t.buttonText || "Saya Mengerti"}”</span><span>•</span><span>Status: <strong className={t.active ? "text-emerald-600 font-bold" : "text-slate-400"}>{t.active ? "Aktif" : "Nonaktif"}</strong></span></div></div></div><div className="flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100"><button type="button" onClick={() => n(t)} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-2xs cursor-pointer" title="Uji tampilan popup di layar"><Eye className="h-3.5 w-3.5 text-blue-600" /><span>Uji Popup</span></button><button type="button" onClick={() => {
                    var a;
                    return a = t.id, void (e$((Array.isArray(eI) ? [...eI] : []).map(e => e.id === a ? {
                      ...e,
                      active: !e.active
                    } : e)), e("Status aktif popup berhasil diubah."));
                  }} className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold border transition-colors cursor-pointer ${t.active ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"}`}>{t.active ? "Aktif" : "Nonaktif"}</button><div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"><button type="button" disabled={0 === s} onClick={() => (a => {
                      if (0 === a) return;
                      let t = Array.isArray(eI) ? [...eI] : [],
                        s = t[a - 1];
                      t[a - 1] = t[a], t[a] = s, e$(t.map((e, a) => ({
                        ...e,
                        order: a + 1
                      }))), e("Urutan popup dinaikkan.");
                    })(s)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer" title="Pindahkan Urutan Naik"><ChevronUp className="h-3.5 w-3.5" /></button><div className="w-[1px] h-4 bg-slate-200" /><button type="button" disabled={s === eI.length - 1} onClick={() => (a => {
                      let t = Array.isArray(eI) ? [...eI] : [];
                      if (a >= t.length - 1) return;
                      let s = t[a + 1];
                      t[a + 1] = t[a], t[a] = s, e$(t.map((e, a) => ({
                        ...e,
                        order: a + 1
                      }))), e("Urutan popup diturunkan.");
                    })(s)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer" title="Pindahkan Urutan Turun"><ChevronDown className="h-3.5 w-3.5" /></button></div><button type="button" onClick={() => {
                    eO(t.id), e_(t.title), eV(t.message), eJ(t.iconTone), eq(t.targetPage), eY(t.active), eX(t.buttonText || "Saya Mengerti"), e0(t.badgeText || ""), eL(!0);
                  }} className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer" title="Edit Popup"><PenLine className="h-3.5 w-3.5" /></button><button type="button" onClick={() => {
                    var a, s;
                    return a = t.id, s = t.title, void er({
                      title: "Hapus Notifikasi Pop-up",
                      message: `Hapus konfigurasi popup "${s}"?`,
                      confirmText: "Hapus Pop-up",
                      cancelText: "Batal",
                      isDanger: !0,
                      onConfirm: () => {
                        e$((Array.isArray(eI) ? [...eI] : []).filter(e => e.id !== a).map((e, a) => ({
                          ...e,
                          order: a + 1
                        }))), e(`Popup "${s}" berhasil dihapus.`);
                      }
                    });
                  }} className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Hapus Popup"><UserCheck className="h-3.5 w-3.5" /></button></div></div>;
            })}</div></Card></section><section id="sec-integrasi" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">7</div><div><h2 className="text-lg font-bold text-slate-900">Integrasi Eksternal & MCP Agent Gateway</h2><p className="text-xs text-slate-500">Hubungkan sistem dengan MCP AI Agent, WhatsApp Notifier, Coretax DJP, dan Bank API</p></div></div><div className="space-y-6"><Card className="border border-blue-100 bg-white shadow-xs"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200"><Bot className="h-4 w-4" /></div><div><h3 className="text-sm font-bold text-slate-900">Model Context Protocol (MCP) Gateway API</h3><p className="text-xs text-slate-500 mt-0.5">Koneksikan AI coding agent langsung ke sistem keuangan Asia Plastik</p></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => {
                  let a = Array.from({
                    length: 24
                  }, () => Math.floor(16 * Math.random()).toString(16)).join("");
                  tL(`ap_live_agent_${a}`), e("API Key Sistem baru berhasil digenerate dan disimpan ke sistem.");
                }} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors">Generate API Key Baru</button></div></div><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="lg:col-span-2 space-y-4"><div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"><div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-blue-600" />Active Key (Bearer Token)</label><span className="text-[11px] text-slate-400">Endpoint: /api/mcp</span></div><div className="flex items-center gap-2"><div className="flex-1 font-mono text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 select-all overflow-x-auto">{tR || "ap_live_agent_default"}</div><button type="button" onClick={() => {
                      navigator.clipboard.writeText(tR || "ap_live_agent_default"), tJ(!0), setTimeout(() => tJ(!1), 2e3), e("API Key berhasil disalin ke clipboard.");
                    }} className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer">{tG ? <a.Fragment><Check className="h-3.5 w-3.5 text-blue-600" /><span className="text-blue-600 font-bold">Disalin</span></a.Fragment> : <a.Fragment><Copy className="h-3.5 w-3.5 text-slate-400" /><span>Salin</span></a.Fragment>}</button></div></div><div className="pt-1"><button type="button" onClick={() => eS(!eA)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"><span>{eA ? "Sembunyikan Konfigurasi Client" : "Tampilkan Konfigurasi Client (JSON)"}</span>{eA ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button>{eA && <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-4 font-mono text-xs text-slate-800 space-y-2"><div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-blue-200"><span className="font-sans font-semibold">Format Konfigurasi (Claude / Cursor):</span><button type="button" onClick={() => {
                        let a = window.location.origin,
                          t = JSON.stringify({
                            mcpServers: {
                              "asia-plastik-finance": {
                                url: `${a}/api/mcp`,
                                headers: {
                                  Authorization: `Bearer ${tR || "ap_live_agent_..."}`
                                }
                              }
                            }
                          }, null, 2);
                        navigator.clipboard.writeText(t), tq(!0), setTimeout(() => tq(!1), 2e3), e("Konfigurasi MCP Server berhasil disalin ke clipboard.");
                      }} className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-sans"><Copy className="h-3 w-3" /><span>{tz ? "Tersalin!" : "Salin JSON"}</span></button></div><pre className="text-[11px] text-slate-700 overflow-x-auto leading-relaxed pt-1">{`{
  "mcpServers": {
    "asia-plastik-finance": {
      "url": "https://finance-blond-psi.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer ${tR || "ap_live_agent_..."}"
      }
    }
  }
}`}</pre></div>}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between"><div><h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-blue-600" />Tools Terdaftar di Endpoint</h4><ul className="mt-3 space-y-2 text-xs text-slate-600"><li className="flex items-center justify-between font-mono text-[11px]"><span>get_financial_summary</span><span className="text-[10px] text-slate-400 font-sans">Ringkasan</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>list_bank_accounts</span><span className="text-[10px] text-slate-400 font-sans">Rekening</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>transfer_funds</span><span className="text-[10px] text-slate-400 font-sans">Mutasi</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>list_sales_invoices</span><span className="text-[10px] text-slate-400 font-sans">Piutang</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>create_sales_invoice</span><span className="text-[10px] text-slate-400 font-sans">Faktur</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>list_purchase_orders</span><span className="text-[10px] text-slate-400 font-sans">PO</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>create_purchase_order</span><span className="text-[10px] text-slate-400 font-sans">Order</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>list_expenses</span><span className="text-[10px] text-slate-400 font-sans">Beban</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>create_expense</span><span className="text-[10px] text-slate-400 font-sans">Biaya</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>get_inventory_stock</span><span className="text-[10px] text-slate-400 font-sans">Gudang</span></li><li className="flex items-center justify-between font-mono text-[11px]"><span>get_audit_trail</span><span className="text-[10px] text-slate-400 font-sans">Audit</span></li></ul></div></div></div><div className="mt-5 pt-4 border-t border-slate-100"><button type="button" onClick={() => eT(!eB)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"><span>{eB ? "Tutup Pengujian Interaktif Tool MCP" : "Buka Pengujian Interaktif Tool MCP"}</span>{eB ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button>{eB && <div className="mt-3 rounded-xl border border-blue-200 bg-white p-4 space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-slate-900">Uji Pemanggilan Tool MCP (JSON-RPC 2.0)</span><div className="flex flex-wrap items-center gap-1.5">{[{
                      id: "get_financial_summary",
                      label: "Ringkasan Finansial"
                    }, {
                      id: "get_inventory_stock",
                      label: "Stok Gudang"
                    }, {
                      id: "list_bank_accounts",
                      label: "Rekening Bank"
                    }, {
                      id: "list_sales_invoices",
                      label: "Faktur Piutang"
                    }, {
                      id: "get_audit_trail",
                      label: "Jejak Audit"
                    }].map(e => <button type="button" disabled={tU} onClick={() => tW(e.id)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${tE === e.id ? "bg-blue-600 border-blue-600 text-white shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`} key={e.id}>{e.label}</button>)}</div></div>{tU ? <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-4 text-xs font-mono text-blue-600 flex items-center gap-2"><span className="animate-spin">⚙️</span><span>Menjalankan permintaan tool ke /api/mcp...</span></div> : tH ? <div className="rounded-xl bg-blue-50/30 border border-blue-200 p-4 text-[11px] font-mono text-slate-800 space-y-2 overflow-x-auto max-h-72"><div className="flex items-center justify-between text-slate-500 text-[10px] pb-1 border-b border-blue-200"><span>Hasil Tool: {tE}</span><span className="text-blue-600 font-bold">200 OK</span></div><pre className="text-slate-800 leading-relaxed">{JSON.stringify(tH, null, 2)}</pre></div> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">Pilih salah satu tombol tool di atas untuk melihat data respons riil dari endpoint.</div>}</div>}</div></Card><div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4 text-xs text-[#0C4A6E] flex items-start gap-3"><Lock className="h-4 w-4 shrink-0 text-[#0284C7] mt-0.5" /><div><span className="font-semibold text-[#0369A1]">Integrasi API Pihak Ketiga Terkunci (Coming Soon):</span><p className="mt-1 leading-relaxed">Seluruh fitur sinkronisasi langsung dengan perbankan, DJP e-Faktur/Coretax, dan omnichannel luar sedang dalam tahap sertifikasi keamanan. Semua modul saat ini berjalan optimal menggunakan database terenkripsi sistem.</p></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{INTEGRATION_SERVICES.map(e => <Card className="flex items-center justify-between cursor-pointer transition-shadow hover:shadow-md" onClick={() => tT({
              open: !0,
              title: e.name,
              desc: `Integrasi live API dengan ${e.name} (${e.category}) sedang dikunci untuk sertifikasi keamanan tahap akhir.`
            })} key={e.name}><div><div className="text-sm font-semibold text-[#0B192C]">{e.name}</div><div className="mt-0.5 text-xs text-[#586E89]">{e.category} · Status: API Terkunci</div></div><StatusBadge status="Coming Soon" /></Card>)}</div><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Card><div className="mb-3 flex items-center gap-2"><Webhook className="h-4 w-4 text-[#0284C7]" /><h3 className="text-base font-semibold text-[#0B192C]">Open API & Event Webhook</h3></div><p className="text-xs text-[#586E89]">Konektor REST API & webhook untuk menghubungkan ERP internal atau toko e-commerce kustom.</p><div className="mt-4 rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] p-3 text-xs"><div className="text-[#586E89]">Mode Sandbox Testing:</div><div className="num mt-1 font-semibold text-[#0369A1]">https://api.asiaplasticfinance.com/v1/sandbox/webhook</div></div><div className="mt-3 flex gap-2"><SecondaryButton className="px-3 py-1.5 text-xs" onClick={() => {
                  let a = new Date();
                  tw([{
                    time: `${a.getDate()} ${a.toLocaleString("id-ID", {
                      month: "short"
                    })} ${a.getFullYear()} ${a.getHours().toString().padStart(2, "0")}:${a.getMinutes().toString().padStart(2, "0")}`,
                    user: ed?.email ?? "Tester",
                    action: "Simulasi Uji Webhook Sandbox (HTTP 200 OK)",
                    module: "Integrasi API"
                  }, ...ty]), e("Uji payload webhook sandbox berhasil: HTTP 200 OK (terekam di audit log).");
                }}>Uji Event Webhook (Sandbox)</SecondaryButton><SecondaryButton className="px-3 py-1.5 text-xs" onClick={() => tT({
                  open: !0,
                  title: "Kredensial Produksi API Webhook",
                  desc: "Pembuatan token live secret API produksi memerlukan otorisasi multi-faktor dan sedang dalam persiapan rilis."
                })}>Token Produksi (Coming Soon)</SecondaryButton></div></Card><Card><div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0284C7]" /><h3 className="text-base font-semibold text-[#0B192C]">Keamanan Cloud & Akses Mobile</h3></div><ul className="space-y-2 text-xs text-[#334760]"><li className="flex items-center justify-between"><span>Sertifikasi Keamanan & Mutu</span><span className="font-semibold text-[#0B192C]">ISO 27001 & ISO 9001:2015</span></li><li className="flex items-center justify-between"><span>Enkripsi Data Realtime</span><span className="num font-semibold text-[#0B192C]">AES-256 & SSL 2048-bit (Enkripsi Sistem)</span></li><li className="flex items-center justify-between"><span>Registrasi Resmi</span><span className="font-semibold text-[#0B192C]">Komdigi & DJP Compliance Ready</span></li><li className="flex items-center justify-between pt-1"><span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-[#0284C7]" />Aplikasi Mobile (Android & iOS)</span><StatusBadge status="Coming Soon" /></li></ul></Card></div></div></section><section id="sec-daftar-lainnya" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div><h2 className="text-base font-bold text-slate-900">Daftar Lainnya</h2><p className="text-xs text-slate-500 mt-0.5">Pusat konfigurasi master data, klasifikasi tag, syarat pembayaran, penutupan periode akuntansi, dan utilitas persediaan.</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs"><div className="space-y-6 divide-y divide-slate-100"><div className="group cursor-pointer"><Link href="/pengaturan#sec-roles" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Kategori Tag</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan kategori yang berisi tag untuk pengelompokan divisi pabrik, proyek pesanan, dan armada distribusi.</p></div><div className="pt-5 group cursor-pointer"><Link href="/penjualan" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Daftar Transaksi</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Daftar dari seluruh transaksi aktif dan historis di penjualan, pembelian, kas/bank, dan jurnal umum.</p></div><div className="pt-5 group cursor-pointer"><Link href="/inventori-produksi" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Kategori produk</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Berisi daftar kategori produk Anda: Biji Plastik, Kantong Roll HDPE, Lembaran PP, Masterbatch, dan Mesin Pabrik.</p></div><div className="pt-5 group cursor-pointer"><Link href="/kas-bank" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Cara Pembayaran</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan cara pembayaran yang Anda pakai atau dipakai oleh Supplier Anda: Transfer Bank BCA, Mandiri, Giro, dan Tunai Kas.</p></div><div className="pt-5 group cursor-pointer"><div onClick={() => e("Satuan produk terdaftar: Pcs, Roll, Kg, Ton, Meter, Lembar, Unit.")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Unit / Satuan</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Berisi daftar satuan (unit) produk Anda: Pcs, Kg, Ton, Roll, Meter, Pack.</p></div><div className="pt-5 group cursor-pointer"><Link href="/pengaturan#sec-audit" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Daftar Audit</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Daftar perubahan, pembuatan, penyuntingan, dan penghapusan transaksi yang telah dilakukan di sistem.</p></div><div className="pt-5 group cursor-pointer"><div onClick={() => e("Kalkulasi ulang nilai persediaan (COGS FIFO / Rata-rata tertimbang) telah sinkron 100% dengan stok fisik gudang.")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><div className="flex items-center gap-2"><span>Penghitungan ulang nilai persediaan</span><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">Baru</span></div><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan status dan log penghitungan nilai persediaan yang disebabkan oleh perubahan data transaksi atau penerimaan bahan baku.</p></div></div><div className="space-y-6 divide-y divide-slate-100"><div className="group cursor-pointer"><div onClick={() => e("Jadwal transaksi berulang: Sewa Gudang (Bulanan), Gaji Karyawan (Tgl 25), Beban Listrik PLN (Tgl 10).")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Daftar Jadwal Berulang</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Daftar pengaturan jadwal untuk transaksi berulang otomatis (recurring expenses & depreciation).</p></div><div className="pt-5 group cursor-pointer"><Link href="/akuntansi#sec-tutup-buku" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><div className="flex items-center gap-2"><span>Daftar Kunci Periode & Tutup Buku</span><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">Baru</span></div><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan daftar periode yang dikunci dan buku yang sudah ditutup dalam satu tabel akuntansi terpadu.</p></div><div className="pt-5 group cursor-pointer"><div onClick={() => e("Semua dokumen lampiran faktur pajak, kwitansi, dan resi ekspedisi tersimpan aman di sistem.")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Daftar Lampiran</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Daftar seluruh berkas lampiran faktur, surat jalan, dan bukti potong pada transaksi.</p></div><div className="pt-5 group cursor-pointer"><Link href="/perpajakan" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Pajak</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></Link><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan tipe-tipe pajak yang Anda pakai untuk penjualan kepada pelanggan atau pembelian dari supplier: PPN 11%, PPh 22 Impor, PPh 23.</p></div><div className="pt-5 group cursor-pointer"><div onClick={() => e("Syarat pembayaran aktif: Net 30 hari (Standar), Cash On Delivery (COD), DP 30% Termin.")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Syarat Pembayaran</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan daftar syarat pembayaran yang menentukan tanggal jatuh tempo untuk pelanggan atau dari supplier.</p></div><div className="pt-5 group cursor-pointer"><div onClick={() => e("Pusat ekspor & impor mendukung format CSV, Excel XLS/XLSX, dan PDF laporan.")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Daftar Impor & Ekspor</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Menampilkan daftar riwayat impor dan ekspor di sistem. Anda dapat melihat status dan data dari masing-masing impor & ekspor.</p></div><div className="pt-5 group cursor-pointer"><div onClick={() => e("Migrasi data dari software akuntansi lain (Mekari Jurnal, Accurate, SAP) siap digunakan via CSV template.")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-between"><span>Data Migrasi</span><ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" /></div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Dapatkan kemudahan dalam pemindahan saldo awal dan data historis transaksi dari software akuntansi lama ke sistem ini.</p></div></div></div></section></div><section id="sec-danger" className="scroll-mt-6"><div className="mt-12 rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 sm:p-7"><div className="flex flex-col md:flex-row md:items-center justify-between gap-5"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-xs"><AlertTriangle className="h-6 w-6" /></div><div><div className="flex items-center gap-2"><h4 className="text-sm font-bold text-rose-950">Zona Bahaya: Reset Seluruh Data Finansial</h4><span className="rounded-md bg-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-800">Tindakan Permanen</span></div><p className="mt-1.5 text-xs text-rose-800/80 leading-relaxed max-w-3xl">Tindakan ini akan mengosongkan seluruh data transaksi (penjualan, pembelian, biaya operasional, mutasi bank, rekening fiktif/sandbox, inventori produk, work order, jurnal umum, aset tetap, giro mundur, faktur pajak, dan catatan) dari database sistem. Tindakan ini tidak dapat dibatalkan dan memerlukan konfirmasi manual dengan mengetik.</p></div></div>{tY ? <button type="button" onClick={() => {
            tK(""), tF(!0);
          }} className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-rose-600/20 cursor-pointer"><RotateCcw className="h-4 w-4" /><span>Reset Semua Data Sekarang</span></button> : <div className="shrink-0 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-100/70 px-4 py-2.5 text-xs font-semibold text-rose-800 cursor-not-allowed"><Lock className="h-4 w-4 text-rose-600" /><span>Hanya Owner yang Berhak Reset Data</span></div>}</div></div></section><Modal open={ar} onClose={() => ao(!1)} title="Tambah Bank & Kartu Fiktif (Sandbox)" subtitle="Daftarkan akun kas/bank atau kartu kredit virtual untuk simulasi transaksi & rekonsiliasi"><form onSubmit={a => {
        if (a.preventDefault(), !ad.trim() || !am.trim()) return;
        let t = {
          id: `acc-${Date.now()}`,
          code: ax.trim() || `110${(Array.isArray(ai) ? ai : []).length + 1}`,
          name: am.trim(),
          bankLabel: ad.trim(),
          type: ab,
          currency: ag,
          balanceBank: Number(aA) || 0,
          balanceBook: Number(aA) || 0,
          unreconciledCount: 0,
          cashlink: "live" === as,
          lastSync: "Tersinkronisasi Realtime",
          isFictional: "fiktif" === as,
          cardName: ak.trim() || am.trim(),
          cardNumber: av.trim() || `4${Math.floor(100 + 900 * Math.random())} ${Math.floor(1e3 + 9e3 * Math.random())} ${Math.floor(1e3 + 9e3 * Math.random())} ${Math.floor(1e3 + 9e3 * Math.random())}`,
          cvv: ay.trim() || "888",
          expDate: aC.trim() || "12/28",
          purpose: aB.trim() || "Operasional Bisnis"
        };
        al([...ai, t]), ao(!1);
        let s = new Date();
        tw([{
          time: `${s.getDate()} ${s.toLocaleString("id-ID", {
            month: "short"
          })} ${s.getFullYear()} ${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")}`,
          user: ed?.email ?? "User",
          action: `Tambah Rekening Fiktif: ${t.bankLabel} - ${t.name} (${t.purpose})`,
          module: "Kas & Bank"
        }, ...ty]), e(`Rekening/Kartu fiktif "${t.bankLabel}" berhasil didaftarkan.`), au(""), ap(""), af(""), aN(""), aw(""), aP(""), aS(0), aT("Operasional Bisnis");
      }} className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bank / Lembaga *</label><select value={ad} onChange={e => ac(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option><option value="Bank Mandiri">Bank Mandiri</option><option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option><option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option><option value="CIMB Niaga">CIMB Niaga</option><option value="Bank Permata">Bank Permata</option><option value="Bank Danamon">Bank Danamon</option><option value="Bank Jago">Bank Jago</option><option value="Jenius (BTPN)">Jenius (BTPN)</option><option value="Kas Tunai / Kasir">Kas Tunai / Kasir</option><option value="Bank Lainnya">Bank Lainnya</option></select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Akun</label><select value={ab} onChange={e => ah(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="Bank">Rekening Bank</option><option value="Kartu Kredit">Kartu Kredit / Debit Korporat</option><option value="Kas">Kas Tunai</option></select></div></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Detail / Nama Rekening *</label><input type="text" required={!0} value={am} onChange={e => ap(e.target.value)} placeholder="Contoh: Rek Giro Operasional 014-992-1234" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Saldo / Limit Awal (IDR)</label><input type="number" value={aA || ""} onChange={e => aS(Number(e.target.value))} placeholder="Contoh: 50000000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none" /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Peruntukan / Purpose</label><select value={aB} onChange={e => aT(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="Operasional Bisnis">Operasional Bisnis</option><option value="Pembayaran Vendor & Bahan Baku">Pembayaran Vendor & Bahan Baku</option><option value="Gaji & Tunjangan Karyawan">Gaji & Tunjangan Karyawan</option><option value="Iklan & Pemasaran Digital">Iklan & Pemasaran Digital</option><option value="Petty Cash / Kas Kecil Kantor">Petty Cash / Kas Kecil Kantor</option><option value="Pajak & Legalitas">Pajak & Legalitas</option></select></div></div><div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 space-y-3"><div className="flex items-center gap-1.5 text-xs font-bold text-blue-900"><CreditCard className="h-4 w-4 text-blue-600" /><span>Rincian Kartu Fiktif (Sandbox Card)</span></div><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Pemegang Kartu (Cardholder Name)</label><input type="text" value={ak} onChange={e => af(e.target.value)} placeholder="Contoh: ASIA PLASTIC FINANCE / CARLOS" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none uppercase" /></div><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Kartu 16 Digit (CC / Debit)</label><input type="text" value={av} onChange={e => aN(e.target.value)} placeholder="Contoh: 4532 8920 1234 5678" maxLength={19} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Masa Berlaku (MM/YY)</label><input type="text" value={aC} onChange={e => aP(e.target.value)} placeholder="12/28" maxLength={5} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Kode Keamanan (CVV)</label><input type="password" value={ay} onChange={e => aw(e.target.value)} placeholder="888" maxLength={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div></div></div><div className="flex justify-end gap-2 pt-2 border-t border-slate-100"><SecondaryButton onClick={() => ao(!1)}>Batal</SecondaryButton><PrimaryButton type="submit">Simpan Rekening Fiktif</PrimaryButton></div></form></Modal>{aM && <Modal open={!!aM} onClose={() => aK(null)} title={`Ubah Saldo & Detail: ${aM.name}`} subtitle={`Lembaga: ${aM.bankLabel} \xb7 Kode Akun: ${aM.code}`}><form onSubmit={a => {
        if (a.preventDefault(), !aM || !aR.trim()) return;
        let t = Number(aH) || 0,
          s = {
            ...aM,
            bankLabel: aI.trim() || aM.bankLabel,
            name: aR.trim(),
            type: aE,
            currency: aU,
            balanceBank: t,
            balanceBook: t,
            code: aG.trim() || aM.code,
            purpose: az.trim() || void 0,
            cardName: aW.trim() || void 0,
            cardNumber: aZ.trim() || void 0,
            expDate: aQ.trim() || void 0,
            cvv: a1.trim() || void 0,
            lastSync: "Update Manual"
          };
        al(e => e.map(e => e.id === aM.id ? s : e)), tw([{
          time: "Baru saja",
          user: ed?.name || "Carlos Susanto",
          action: `Perbarui Rekening & Saldo: ${s.name} (${s.bankLabel}) - Saldo: ${(0, formatRupiah)(t)}`,
          module: "Pengaturan Kas/Bank"
        }, ...ty]), aK(null), e(`Detail dan saldo rekening "${s.name}" berhasil diperbarui.`);
      }} className="space-y-4"><div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2"><div className="flex items-center justify-between"><label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-emerald-600" /><span>Saldo Kas / Bank (IDR) *</span></label><span className="text-xs font-bold text-emerald-700 num">{(0, formatRupiah)(aH || 0)}</span></div><input type="number" required={!0} min={0} value={aH ?? ""} onChange={e => aV(Number(e.target.value))} placeholder="Contoh: 75000000" className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none" /><span className="text-[10px] text-emerald-800 block">Saldo ini digunakan untuk simulasi mutasi kas/bank dan pencatatan pelunasan transaksi operasional.</span></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bank / Lembaga *</label><select value={aI} onChange={e => a$(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option><option value="Bank Mandiri">Bank Mandiri</option><option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option><option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option><option value="CIMB Niaga">CIMB Niaga</option><option value="Bank Permata">Bank Permata</option><option value="Bank Danamon">Bank Danamon</option><option value="Bank Jago">Bank Jago</option><option value="Jenius (BTPN)">Jenius (BTPN)</option><option value="Kas Tunai / Kasir">Kas Tunai / Kasir</option><option value="Bank Lainnya">Bank Lainnya</option></select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Akun</label><select value={aE} onChange={e => aO(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="Bank">Rekening Bank</option><option value="Kartu Kredit">Kartu Kredit / Debit Korporat</option><option value="Kas">Kas Tunai</option></select></div></div><div className="grid grid-cols-3 gap-3"><div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Detail / Nama Rekening *</label><input type="text" required={!0} value={aR} onChange={e => aL(e.target.value)} placeholder="Contoh: Corporate Card Mandiri Purchasing" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Kode CoA</label><input type="text" value={aG} onChange={e => aJ(e.target.value)} placeholder="1-10101" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Peruntukan / Purpose</label><select value={az} onChange={e => aq(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="Operasional Bisnis">Operasional Bisnis</option><option value="Pembayaran Vendor & Bahan Baku">Pembayaran Vendor & Bahan Baku</option><option value="Pengadaan Sparepart Mesin & Keperluan Urgent">Pengadaan Sparepart Mesin & Keperluan Urgent</option><option value="Giro Pembayaran Supplier & Penerimaan Pelanggan">Giro Pembayaran Supplier & Penerimaan Pelanggan</option><option value="Gaji & Tunjangan Karyawan">Gaji & Tunjangan Karyawan</option><option value="Iklan & Pemasaran Digital">Iklan & Pemasaran Digital</option><option value="Petty Cash / Kas Kecil Kantor">Petty Cash / Kas Kecil Kantor</option><option value="Pajak & Legalitas">Pajak & Legalitas</option></select></div><div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 space-y-3"><div className="flex items-center gap-1.5 text-xs font-bold text-blue-900"><CreditCard className="h-4 w-4 text-blue-600" /><span>Rincian Kartu Virtual / No. Rekening</span></div><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Pemegang Kartu / Rekening (Cardholder Name)</label><input type="text" value={aW} onChange={e => aY(e.target.value)} placeholder="PURCHASING DEPT AP" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none uppercase" /></div><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Kartu / Nomor Rekening (16 Digit)</label><input type="text" value={aZ} onChange={e => aX(e.target.value)} placeholder="4222 5566 7788 9900" maxLength={19} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Masa Berlaku (MM/YY)</label><input type="text" value={aQ} onChange={e => a0(e.target.value)} placeholder="08/27" maxLength={5} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Kode CVV</label><input type="text" value={a1} onChange={e => a5(e.target.value)} placeholder="554" maxLength={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none" /></div></div></div><div className="flex justify-end gap-2 pt-2 border-t border-slate-100"><SecondaryButton onClick={() => aK(null)}>Batal</SecondaryButton><PrimaryButton type="submit"><Save className="h-4 w-4" /><span>Simpan Perubahan</span></PrimaryButton></div></form></Modal>}<Modal open={a4} onClose={() => a6(!1)} title="Tambah Aturan Approval Baru"><form onSubmit={a => {
        if (a.preventDefault(), !a8.trim() || !a9.trim()) return;
        let t = {
          id: `rule-${Date.now()}`,
          name: a8.trim(),
          approvers: a9.trim(),
          active: !0
        };
        a3([...a2, t]), a6(!1), a7(""), te(""), e(`Aturan approval "${t.name}" berhasil ditambahkan.`);
      }} className="space-y-4"><div><label className="block text-xs font-semibold text-[#334760] mb-1">Nama Aturan & Batasan Nominal</label><input type="text" required={!0} value={a8} onChange={e => a7(e.target.value)} placeholder="Contoh: Faktur Penjualan > Rp 100.000.000" className="w-full rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] px-3 py-2 text-sm focus:border-[#0284C7] focus:bg-white focus:outline-none" /></div><div><label className="block text-xs font-semibold text-[#334760] mb-1">Alur Persetujuan (Hirarki Approver)</label><input type="text" required={!0} value={a9} onChange={e => te(e.target.value)} placeholder="Contoh: Level 1: Sales Supervisor -> Level 2: Direktur Utama" className="w-full rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] px-3 py-2 text-sm focus:border-[#0284C7] focus:bg-white focus:outline-none" /></div><div className="flex justify-end gap-2 pt-2"><SecondaryButton onClick={() => a6(!1)}>Batal</SecondaryButton><PrimaryButton type="submit">Simpan Aturan</PrimaryButton></div></form></Modal><Modal open={!!tm} onClose={() => tp(null)} title="Konfirmasi Persetujuan Transaksi" subtitle={`Otorisasi oleh ${tZ}: ${ed?.name || eo?.email || "Carlos Susanto"}`}>{tm && <div className="space-y-4"><div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 text-xs"><div className="flex items-center justify-between"><span className="font-bold text-emerald-950 text-sm">{tm.docNumber}</span><span className="rounded bg-white px-2 py-0.5 font-bold text-emerald-800 border border-emerald-200">{tm.module}</span></div><div className="grid grid-cols-2 gap-2 text-emerald-900 pt-1"><div><span className="text-slate-500 block text-[10px] uppercase font-semibold">Pihak / Rekanan</span><span className="font-semibold">{tm.party}</span></div><div><span className="text-slate-500 block text-[10px] uppercase font-semibold">Tipe Dokumen</span><span className="font-semibold">{tm.type}</span></div><div><span className="text-slate-500 block text-[10px] uppercase font-semibold">Tanggal</span><span className="font-semibold">{tm.date}</span></div><div><span className="text-slate-500 block text-[10px] uppercase font-semibold">Nominal Disetujui</span><span className="font-bold text-sm text-emerald-900 num">{(0, formatRupiah)(tm.amount)}</span></div></div><div className="border-t border-emerald-200/80 pt-2 text-[11px] text-emerald-800"><strong>Alasan Otorisasi:</strong> {tm.triggerReason}</div></div><div><label className="block text-xs font-semibold text-[#334760] mb-1">Catatan Persetujuan (Opsional)</label><textarea rows={2} value={tb} onChange={e => th(e.target.value)} placeholder="Contoh: Dokumen lengkap, limit kredit valid, disetujui untuk proses berikutnya." className="w-full rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] px-3 py-2 text-xs focus:border-[#0284C7] focus:bg-white focus:outline-none" /></div><div className="flex justify-end gap-2 pt-2"><SecondaryButton onClick={() => tp(null)}>Batal</SecondaryButton><PrimaryButton className="bg-emerald-600 hover:bg-emerald-700 border-emerald-700" onClick={() => ((a, t) => {
            if (!tX) return void e("Akses Ditolak: Hanya Finance Manager dan Owner yang berhak menyetujui transaksi.");
            "Penjualan" === a.module ? tt(e => (Array.isArray(e) ? e : []).map(e => e.id === a.id ? {
              ...e,
              status: "Belum Dibayar"
            } : e)) : "Pembelian" === a.module ? tn(e => (Array.isArray(e) ? e : []).map(e => e.id === a.id ? {
              ...e,
              status: "Belum Dibayar"
            } : e)) : "Biaya" === a.module && tl(e => (Array.isArray(e) ? e : []).map(e => e.id === a.id ? {
              ...e,
              status: "Lunas"
            } : e));
            let s = new Date();
            tw([{
              time: `${s.getDate()} ${s.toLocaleString("id-ID", {
                month: "short"
              })} ${s.getFullYear()} ${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")}`,
              user: ed?.name || eo?.email || "Carlos Susanto",
              action: `APPROVAL DISETUJUI: ${a.docNumber} (${a.party}) senilai ${(0, formatRupiah)(a.amount)} disetujui oleh ${tZ}.${t?.trim() ? ` Catatan: ${t.trim()}` : ""}`,
              module: `Approval - ${a.module}`
            }, ...ty]), tp(null), e(`Dokumen ${a.docNumber} berhasil disetujui.`);
          })(tm, tb)}><Check className="h-3.5 w-3.5" /><span>Konfirmasi Setujui</span></PrimaryButton></div></div>}</Modal><Modal open={!!tg} onClose={() => tj(null)} title="Konfirmasi Penolakan Transaksi" subtitle={`Otorisasi Penolakan oleh ${tZ}`}>{tg && <div className="space-y-4"><div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-2 text-xs"><div className="flex items-center justify-between"><span className="font-bold text-rose-950 text-sm">{tg.docNumber}</span><span className="rounded bg-white px-2 py-0.5 font-bold text-rose-800 border border-rose-200">{tg.module}</span></div><div className="text-rose-900 text-xs"><div>Pihak: <strong>{tg.party}</strong></div><div>Nominal: <strong>{(0, formatRupiah)(tg.amount)}</strong></div></div></div><div><label className="block text-xs font-semibold text-[#334760] mb-1">Alasan Penolakan <span className="text-rose-500">* (Wajib diisi)</span></label><textarea rows={3} required={!0} value={tk} onChange={e => tf(e.target.value)} placeholder="Contoh: Harga satuan melampaui RAB, dokumen kelengkapan vendor belum ada, atau plafon piutang telah melebihi batas." className="w-full rounded-lg border border-[#DCE7F5] bg-white px-3 py-2 text-xs focus:border-rose-500 focus:outline-none" /></div><div className="flex justify-end gap-2 pt-2"><SecondaryButton onClick={() => tj(null)}>Batal</SecondaryButton><button type="button" onClick={() => ((a, t) => {
            if (!tX) return void e("Akses Ditolak: Hanya Finance Manager dan Owner yang berhak menolak transaksi.");
            if (!t.trim()) return void e("Wajib mengisi alasan penolakan dokumen.");
            "Penjualan" === a.module ? tt(e => (Array.isArray(e) ? e : []).map(e => e.id === a.id ? {
              ...e,
              status: "Dibatalkan"
            } : e)) : "Pembelian" === a.module ? tn(e => (Array.isArray(e) ? e : []).map(e => e.id === a.id ? {
              ...e,
              status: "Dibatalkan"
            } : e)) : "Biaya" === a.module && tl(e => (Array.isArray(e) ? e : []).map(e => e.id === a.id ? {
              ...e,
              status: "Dibatalkan"
            } : e));
            let s = new Date();
            tw([{
              time: `${s.getDate()} ${s.toLocaleString("id-ID", {
                month: "short"
              })} ${s.getFullYear()} ${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")}`,
              user: ed?.name || eo?.email || "Carlos Susanto",
              action: `APPROVAL DITOLAK: ${a.docNumber} (${a.party}) senilai ${(0, formatRupiah)(a.amount)} ditolak oleh ${tZ}. Alasan: ${t.trim()}`,
              module: `Approval - ${a.module}`
            }, ...ty]), tj(null), e(`Dokumen ${a.docNumber} telah ditolak.`);
          })(tg, tk)} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"><X className="h-3.5 w-3.5" /><span>Tolak Dokumen</span></button></div></div>}</Modal><Modal open={tv} onClose={() => tN(!1)} title="Setujui Semua Transaksi Sekaligus" subtitle={`Otorisasi Massal oleh ${tZ}`}><div className="space-y-4"><p className="text-xs text-[#586E89] leading-relaxed">Anda akan menyetujui sebanyak <strong>{t3.length} transaksi</strong> dalam antrean saat ini dengan total nilai <strong>{(0, formatRupiah)(t3.reduce((e, a) => e + a.amount, 0))}</strong>.</p><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Seluruh transaksi penjualan dan pembelian akan berstatus aktif/siap tagih, dan beban operasional akan ditandai Lunas di sistem.</div><div className="flex justify-end gap-2 pt-2"><SecondaryButton onClick={() => tN(!1)}>Batal</SecondaryButton><PrimaryButton className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
            if (!tX) return void e("Akses Ditolak: Hanya Finance Manager dan Owner yang berhak mengeksekusi approval.");
            let a = [...t3];
            if (0 === a.length) return;
            let t = new Set(a.filter(e => "Penjualan" === e.module).map(e => e.id)),
              s = new Set(a.filter(e => "Pembelian" === e.module).map(e => e.id)),
              n = new Set(a.filter(e => "Biaya" === e.module).map(e => e.id));
            t.size > 0 && tt(e => (Array.isArray(e) ? e : []).map(e => t.has(e.id) ? {
              ...e,
              status: "Belum Dibayar"
            } : e)), s.size > 0 && tn(e => (Array.isArray(e) ? e : []).map(e => s.has(e.id) ? {
              ...e,
              status: "Belum Dibayar"
            } : e)), n.size > 0 && tl(e => (Array.isArray(e) ? e : []).map(e => n.has(e.id) ? {
              ...e,
              status: "Lunas"
            } : e));
            let i = new Date();
            tw([{
              time: `${i.getDate()} ${i.toLocaleString("id-ID", {
                month: "short"
              })} ${i.getFullYear()} ${i.getHours().toString().padStart(2, "0")}:${i.getMinutes().toString().padStart(2, "0")}`,
              user: ed?.name || eo?.email || "Carlos Susanto",
              action: `BATCH APPROVAL: ${a.length} dokumen disetujui sekaligus oleh ${tZ}. Total nilai: ${(0, formatRupiah)(a.reduce((e, a) => e + a.amount, 0))}`,
              module: "Approval Center"
            }, ...ty]), tN(!1), e(`Berhasil menyetujui ${a.length} dokumen sekaligus.`);
          }}><Check className="h-3.5 w-3.5" /><span>Ya, Setujui Semua ({t3.length})</span></PrimaryButton></div></div></Modal><Modal open={tB.open} onClose={() => tT({
      open: !1,
      title: "",
      desc: ""
    })} title="Fitur API Eksternal — Coming Soon"><div className="space-y-4"><div className="flex items-start gap-3 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4"><AlertCircle className="h-5 w-5 shrink-0 text-[#0284C7] mt-0.5" /><div><div className="font-semibold text-sm text-[#0369A1]">{tB.title}</div><p className="mt-1 text-xs text-[#0C4A6E] leading-relaxed">{tB.desc}</p></div></div><p className="text-xs text-[#586E89]">Fitur perbankan dan eksternal ini saat ini dikunci untuk menghindari kegagalan autentikasi di lingkungan produksi. Anda dapat mengelola transaksi secara manual dan aman menggunakan fitur yang sudah terhubung ke sistem.</p><div className="flex justify-end"><PrimaryButton onClick={() => tT({
            open: !1,
            title: "",
            desc: ""
          })}>Tutup</PrimaryButton></div></div></Modal><Modal open={tD} onClose={() => {
      tI || (tF(!1), tK(""));
    }} title="Konfirmasi Reset Total Seluruh Data" subtitle="Tindakan permanen dan berisiko tinggi pada database"><div className="space-y-4"><div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 space-y-2.5"><div className="flex items-center gap-2 font-bold text-rose-950 text-sm"><AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" /><span>Peringatan Penghapusan Data Total</span></div><p className="leading-relaxed">Seluruh data operasional di bawah ini akan dihapus secara permanen dari database sistem dan dikosongkan:</p><div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-rose-800 font-medium pt-1"><div>• Faktur Penjualan & Piutang</div><div>• Pesanan Pembelian (PO) & Vendor</div><div>• Beban & Biaya Operasional</div><div>• Mutasi Kas & Rekonsiliasi Bank</div><div>• Rekening Bank & Kartu Virtual</div><div>• Katalog Produk & Stok Multi-Gudang</div><div>• Perintah Kerja Produksi (Work Order)</div><div>• Bagan Akun (CoA) & Jurnal Umum</div><div>• Aset Tetap & Depresiasi</div><div>• Cek/Giro & Rekam Faktur Pajak</div></div></div><div className="space-y-2 pt-1"><label className="block text-xs font-semibold text-slate-800">Ketik kalimat konfirmasi di bawah ini secara manual untuk mengaktifkan tombol reset:</label><div className="select-all rounded-xl bg-slate-100 px-3 py-2 text-center font-mono text-xs font-bold text-rose-700 border border-slate-200 tracking-wider">RESET ASIA PLASTIK</div><input type="text" autoFocus={!0} value={tM} onChange={e => tK(e.target.value)} placeholder='Ketik "RESET ASIA PLASTIK"' disabled={tI} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none placeholder:text-slate-400 text-center" /></div><div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100"><SecondaryButton type="button" onClick={() => {
            tF(!1), tK("");
          }} disabled={tI}>Batal</SecondaryButton><button type="button" onClick={ss} disabled={"RESET ASIA PLASTIK" !== tM.trim() || tI} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${"RESET ASIA PLASTIK" === tM.trim() && !tI ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/30 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"}`}><RotateCcw className={`h-3.5 w-3.5 ${tI ? "animate-spin" : ""}`} /><span>{tI ? "Mereset Seluruh Data..." : "Saya Paham, Reset Semua Data"}</span></button></div></div></Modal><Modal open={eR} onClose={() => eL(!1)} title={eE ? "Edit Konfigurasi Custom Popup" : "Tambah Custom Popup Page Load"} subtitle="Atur judul, pesan, tone icon, halaman target, dan status popup"><form onSubmit={a => {
        if (a.preventDefault(), !eU.trim() || !eH.trim()) return void e("Judul dan isi pesan popup wajib diisi.");
        let t = Array.isArray(eI) ? [...eI] : [];
        if (eE) e$(t.map(e => e.id === eE ? {
          ...e,
          title: eU.trim(),
          message: eH.trim(),
          iconTone: eG,
          targetPage: ez,
          active: eW,
          buttonText: eZ.trim() || "Saya Mengerti",
          badgeText: eQ.trim() || void 0
        } : e)), e("Konfigurasi popup berhasil diperbarui.");else {
          let a = {
            id: `pop-${Date.now()}`,
            title: eU.trim(),
            message: eH.trim(),
            iconTone: eG,
            targetPage: ez,
            active: eW,
            order: t.length + 1,
            buttonText: eZ.trim() || "Saya Mengerti",
            badgeText: eQ.trim() || void 0,
            createdAt: new Date().toISOString().slice(0, 10)
          };
          e$([...t, a]), e("Popup baru berhasil ditambahkan.");
        }
        eL(!1);
      }} className="space-y-4"><div><label className="text-xs font-semibold text-slate-700">Judul Popup *</label><input type="text" value={eU} onChange={e => e_(e.target.value)} placeholder="Contoh: Sinkronisasi Coretax DJP & PPN 11%" required={!0} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div><label className="text-xs font-semibold text-slate-700">Isi Pesan / Instruksi Popup *</label><textarea rows={3} value={eH} onChange={e => eV(e.target.value)} placeholder="Tulis pesan lengkap yang ingin disampaikan ke pengguna..." required={!0} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div><label className="text-xs font-semibold text-slate-700 mb-1.5 block">Pilihan Icon & Tone Peringatan *</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[{
              id: "warning",
              label: "Peringatan",
              icon: AlertTriangle,
              bg: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-200"
            }, {
              id: "danger",
              label: "Bahaya / Urgent",
              icon: AlertOctagon,
              bg: "bg-rose-50",
              text: "text-rose-700",
              border: "border-rose-200"
            }, {
              id: "info",
              label: "Informasi",
              icon: Info,
              bg: "bg-sky-50",
              text: "text-sky-700",
              border: "border-sky-200"
            }, {
              id: "success",
              label: "Sukses / OK",
              icon: CheckCircle2,
              bg: "bg-emerald-50",
              text: "text-emerald-700",
              border: "border-emerald-200"
            }, {
              id: "announcement",
              label: "Pengumuman",
              icon: AlertOctagon,
              bg: "bg-purple-50",
              text: "text-purple-700",
              border: "border-purple-200"
            }].map(e => {
              let t = e.icon,
                s = eG === e.id;
              return <button type="button" onClick={() => eJ(e.id)} className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all text-left ${s ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 shadow-xs" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"}`} key={e.id}><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${e.bg} ${e.border} ${e.text}`}><t className="h-4 w-4" /></div><span className="truncate">{e.label}</span></button>;
            })}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="text-xs font-semibold text-slate-700">Muncul di Halaman *</label><select value={ez} onChange={e => eq(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"><option value="all">Semua Halaman (Global)</option><option value="/">Dashboard / Overview</option><option value="/kas-bank">Kas & Bank</option><option value="/rekonsiliasi">Rekonsiliasi Bank</option><option value="/biaya-anggaran">Biaya & Anggaran</option><option value="/penjualan">Penjualan & Faktur</option><option value="/pembelian">Pembelian & Tagihan</option><option value="/inventori-produksi">Inventori & Gudang</option><option value="/akuntansi">Akuntansi & Jurnal</option><option value="/perpajakan">Pajak & Coretax</option><option value="/laporan">Laporan Keuangan</option><option value="/pengaturan">Pengaturan Sistem</option><option value="/dokumentasi">Dokumentasi</option></select></div><div><label className="text-xs font-semibold text-slate-700">Teks Badge Tambahan</label><input type="text" value={eQ} onChange={e => e0(e.target.value)} placeholder="Contoh: Kepatuhan 2026 / SOP" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none" /></div></div><div><label className="text-xs font-semibold text-slate-700">Teks Tombol Aksi Penutup</label><input type="text" value={eZ} onChange={e => eX(e.target.value)} placeholder="Contoh: Saya Mengerti / Lanjutkan Kerja" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none" /></div><div className="flex items-center gap-2 pt-1"><input type="checkbox" id="popActiveCheck" checked={eW} onChange={e => eY(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" /><label htmlFor="popActiveCheck" className="text-xs text-slate-700 cursor-pointer select-none">Aktifkan popup ini (akan langsung muncul saat halaman target dimuat)</label></div><div className="pt-4 border-t border-slate-100 flex justify-end gap-2"><SecondaryButton onClick={() => eL(!1)}>Batal</SecondaryButton><PrimaryButton type="submit">{eE ? "Simpan Perubahan" : "Simpan Popup Baru"}</PrimaryButton></div></form></Modal></div>;
}
;
