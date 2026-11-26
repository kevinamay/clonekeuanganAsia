import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import {
  User,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Mail,
  Phone,
  Building2,
  Edit3,
  Copy,
  Check,
  ChevronRight,
  Search,
  ArrowLeft,
  Activity,
  FileText,
  X
} from 'lucide-react';

const OWNER_EMAIL = 'carlossusanto89@gmail.com';
const ROLES_LIST = ['Owner', 'Finance Manager', 'Accounting Staff', 'Restricted Banker', 'Staff Gudang'];

export const ROLE_HIERARCHY = {
  Owner: {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    desc: 'Pemegang hak otorisasi mutlak sistem. Akses seluruh modul, approval pengeluaran tanpa limit, dan manajemen pengguna.',
    level: 'Tingkat Eksekutif (Tier 1 - Root)',
    defaultLimit: 0,
    department: 'Direksi & Manajemen'
  },
  'Finance Manager': {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    desc: 'Pengawas keuangan & operasional. Berwenang memvalidasi dan menyetujui transaksi harian, PO, dan pengeluaran operasional.',
    level: 'Tingkat Manajerial (Tier 2 - Otorisasi Tinggi)',
    defaultLimit: 500000000,
    department: 'Keuangan & Akuntansi'
  },
  'Accounting Staff': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    desc: 'Staf operasional akuntansi. Bertanggung jawab atas pencatatan mutasi kas, faktur, entri jurnal, dan rekapitulasi pajak.',
    level: 'Tingkat Operasional (Tier 3 - CUD Non-Approve)',
    defaultLimit: 50000000,
    department: 'Pembukuan & Perpajakan'
  },
  'Restricted Banker': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    desc: 'Akses terbatas operasional kas & perbankan. Terbatas pada mutasi bank dan rekonsiliasi kas tanpa akses pembukuan penuh.',
    level: 'Tingkat Terbatas (Tier 4 - Perbankan Saja)',
    defaultLimit: 25000000,
    department: 'Perbankan & Kas Operasional'
  },
  'Staff Gudang': {
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    desc: 'Pengawas inventori pabrik. Mengelola stok biji plastik, surat perintah kerja (SPK), dan penerimaan barang masuk.',
    level: 'Tingkat Lapangan (Tier 4 - Gudang & Logistik)',
    defaultLimit: 10000000,
    department: 'Logistik & Gudang Pabrik'
  }
};

export const PERMISSIONS_MATRIX = {
  Owner: [
    { module: 'AI Asisten (Nala)', create: true, read: true, update: true, del: true, approve: true, note: 'Akses penuh konsultasi, audit, & otomasi AI' },
    { module: 'Kas & Bank', create: true, read: true, update: true, del: true, approve: true, note: 'Kontrol penuh saldo & mutasi rekening' },
    { module: 'Invoices & Penjualan', create: true, read: true, update: true, del: true, approve: true, note: 'Persetujuan faktur komersial & harga' },
    { module: 'Pembelian & Tagihan', create: true, read: true, update: true, del: true, approve: true, note: 'Otorisasi final Purchase Order (PO)' },
    { module: 'Biaya & Anggaran', create: true, read: true, update: true, del: true, approve: true, note: 'Persetujuan pagu RAB & beban operasional' },
    { module: 'Inventori & Produksi', create: true, read: true, update: true, del: true, approve: true, note: 'Pengawasan stok & SPK mesin produksi' },
    { module: 'Akuntansi & Pajak', create: true, read: true, update: true, del: true, approve: true, note: 'Audit jurnal penyesuaian & tutup buku' },
    { module: 'Otorisasi & Pengaturan', create: true, read: true, update: true, del: true, approve: true, note: 'Kelola pengguna & kebijakan sistem' }
  ],
  'Finance Manager': [
    { module: 'AI Asisten (Nala)', create: true, read: true, update: true, del: true, approve: true, note: 'Akses penuh konsultasi finansial & analitik AI' },
    { module: 'Kas & Bank', create: true, read: true, update: true, del: true, approve: true, note: 'Persetujuan transfer & rekonsiliasi kas' },
    { module: 'Invoices & Penjualan', create: true, read: true, update: true, del: true, approve: true, note: 'Persetujuan termin piutang & kredit' },
    { module: 'Pembelian & Tagihan', create: true, read: true, update: true, del: true, approve: true, note: 'Approval PO pengadaan s/d Rp 500 Juta' },
    { module: 'Biaya & Anggaran', create: true, read: true, update: true, del: true, approve: true, note: 'Verifikasi pengajuan reimbursement & beban' },
    { module: 'Inventori & Produksi', create: true, read: true, update: true, del: false, approve: true, note: 'Monitor valuasi stok & work orders' },
    { module: 'Akuntansi & Pajak', create: true, read: true, update: true, del: false, approve: true, note: 'Review laporan keuangan berkala' },
    { module: 'Otorisasi & Pengaturan', create: false, read: true, update: false, del: false, approve: false, note: 'Melihat konfigurasi tanpa hak ubah' }
  ],
  'Accounting Staff': [
    { module: 'AI Asisten (Nala)', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi (Khusus Owner & Finance Manager)' },
    { module: 'Kas & Bank', create: true, read: true, update: true, del: true, approve: false, note: 'Pencatatan mutasi tanpa hak approval' },
    { module: 'Invoices & Penjualan', create: true, read: true, update: true, del: false, approve: false, note: 'Penerbitan faktur reguler' },
    { module: 'Pembelian & Tagihan', create: true, read: true, update: true, del: false, approve: false, note: 'Input nota & tagihan masuk' },
    { module: 'Biaya & Anggaran', create: true, read: true, update: true, del: false, approve: false, note: 'Input kuitansi biaya operasional' },
    { module: 'Inventori & Produksi', create: false, read: true, update: false, del: false, approve: false, note: 'Lihat data untuk perhitungan HPP' },
    { module: 'Akuntansi & Pajak', create: true, read: true, update: true, del: false, approve: false, note: 'Pencatatan jurnal umum & pajak faktur' },
    { module: 'Otorisasi & Pengaturan', create: false, read: false, update: false, del: false, approve: false, note: 'Tidak memiliki hak akses pengaturan' }
  ],
  'Restricted Banker': [
    { module: 'AI Asisten (Nala)', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi (Khusus Owner & Finance Manager)' },
    { module: 'Kas & Bank', create: true, read: true, update: true, del: false, approve: false, note: 'Pencatatan mutasi bank & kliring' },
    { module: 'Invoices & Penjualan', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Pembelian & Tagihan', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Biaya & Anggaran', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Inventori & Produksi', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Akuntansi & Pajak', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Otorisasi & Pengaturan', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' }
  ],
  'Staff Gudang': [
    { module: 'AI Asisten (Nala)', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi (Khusus Owner & Finance Manager)' },
    { module: 'Kas & Bank', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Invoices & Penjualan', create: false, read: true, update: false, del: false, approve: false, note: 'Cek Surat Jalan pengiriman barang' },
    { module: 'Pembelian & Tagihan', create: false, read: true, update: false, del: false, approve: false, note: 'Cek surat penerimaan barang (PO)' },
    { module: 'Biaya & Anggaran', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Inventori & Produksi', create: true, read: true, update: true, del: false, approve: true, note: 'Kontrol fisik stok & Work Orders' },
    { module: 'Akuntansi & Pajak', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' },
    { module: 'Otorisasi & Pengaturan', create: false, read: false, update: false, del: false, approve: false, note: 'Akses dibatasi' }
  ]
};

export default function Pengguna() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useAppContext();
  const { auditLogs } = useAppContext();
  const {
    user: currentUser,
    authorizedRecord,
    authorizedUsers,
    updateAuthorizedUser,
    addAuthorizedUser
  } = useAuth();

  const targetParam = searchParams.get('id') || searchParams.get('email') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [activeTab, setActiveTab] = useState('profile'); // profile, permissions, activity
  const [copiedKey, setCopiedKey] = useState(null);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('Finance Manager');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editApprovalLimit, setEditApprovalLimit] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Create form state
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState('Finance Manager');
  const [createPhone, setCreatePhone] = useState('');
  const [createDepartment, setCreateDepartment] = useState('');

  // Selected User
  const selectedUser = useMemo(() => {
    if (!authorizedUsers || authorizedUsers.length === 0) {
      return {
        email: OWNER_EMAIL,
        name: 'Carlos Susanto',
        role: 'Owner',
        active: true,
        addedAt: '2026-11-12T00:00:00.000Z',
        addedBy: 'system-bootstrap',
        phone: '+62 811-9988-7766',
        department: 'Direksi & Manajemen',
        employeeId: 'USR-CARLOS',
        approvalLimit: 0,
        notes: 'Owner & Direktur Utama Asia Plastik.'
      };
    }

    if (targetParam) {
      const clean = targetParam.trim().toLowerCase();
      const byEmail = authorizedUsers.find((a) => (a.email || '').trim().toLowerCase() === clean);
      if (byEmail) return byEmail;
      const byId = authorizedUsers.find((a) => (a.employeeId || '').toLowerCase() === clean);
      if (byId) return byId;
      const byFuzzy = authorizedUsers.find(
        (a) =>
          (a.email || '').toLowerCase().includes(clean) ||
          (a.name || '').toLowerCase().includes(clean) ||
          (a.employeeId || '').toLowerCase().includes(clean)
      );
      if (byFuzzy) return byFuzzy;
    }

    if (authorizedRecord) {
      const byAuth = authorizedUsers.find(
        (e) => (e.email || '').trim().toLowerCase() === (authorizedRecord.email || '').trim().toLowerCase()
      );
      if (byAuth) return byAuth;
    }

    return authorizedUsers[0];
  }, [authorizedUsers, targetParam, authorizedRecord]);

  // Filtered users directory
  const filteredUsers = useMemo(() => {
    return (authorizedUsers || []).filter((u) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.department || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'Semua' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [authorizedUsers, searchTerm, roleFilter]);

  // User-specific audit logs
  const userAuditLogs = useMemo(() => {
    if (!selectedUser) return [];
    const cleanEmail = (selectedUser.email || '').trim().toLowerCase();
    const lowerName = (selectedUser.name || '').toLowerCase();
    return (auditLogs || []).filter((t) => {
      const s = (t.user || '').toLowerCase();
      const l = (t.action || '').toLowerCase();
      return (
        s.includes(cleanEmail) ||
        s.includes(lowerName) ||
        l.includes(cleanEmail) ||
        l.includes(lowerName) ||
        (selectedUser.role === 'Owner' && s.includes('carlos'))
      );
    });
  }, [auditLogs, selectedUser]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify(`Tersalin ke clipboard: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenEdit = () => {
    if (!selectedUser) return;
    const roleConf = ROLE_HIERARCHY[selectedUser.role] || ROLE_HIERARCHY['Finance Manager'];
    setEditName(selectedUser.name || '');
    setEditRole(selectedUser.role || 'Finance Manager');
    setEditPhone(selectedUser.phone || '');
    setEditDepartment(selectedUser.department || roleConf.department);
    setEditEmployeeId(selectedUser.employeeId || `USR-${(selectedUser.name || 'USER').split(' ')[0].toUpperCase()}-${selectedUser.role === 'Owner' ? 'DIR' : 'STF'}`);
    setEditApprovalLimit(selectedUser.approvalLimit !== undefined ? selectedUser.approvalLimit : roleConf.defaultLimit);
    setEditNotes(selectedUser.notes || '');
    setEditActive(selectedUser.active !== false);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const res = await updateAuthorizedUser(selectedUser.email, {
      name: editName.trim() || selectedUser.name,
      role: editRole,
      phone: editPhone.trim(),
      department: editDepartment.trim(),
      employeeId: editEmployeeId.trim(),
      approvalLimit: Number(editApprovalLimit),
      notes: editNotes.trim(),
      active: editActive
    });
    if (res.ok) {
      notify(`Profil ${editName} (${selectedUser.email}) berhasil diperbarui.`);
      setEditOpen(false);
    } else {
      notify(res.error || 'Gagal memperbarui profil pengguna.', 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createEmail.trim() || !createName.trim()) {
      notify('Nama dan email wajib diisi.', 'error');
      return;
    }
    const res = await addAuthorizedUser(createEmail.trim(), createName.trim(), createRole);
    if (res.ok) {
      if (createPhone || createDepartment) {
        await updateAuthorizedUser(createEmail.trim(), {
          phone: createPhone.trim(),
          department: createDepartment.trim() || (ROLE_HIERARCHY[createRole]?.department || 'Keuangan & Akuntansi'),
          employeeId: `USR-${createName.trim().split(' ')[0].toUpperCase()}`,
          approvalLimit: ROLE_HIERARCHY[createRole]?.defaultLimit || 0
        });
      }
      notify(`Pengguna baru ${createName} (${createEmail}) berhasil didaftarkan.`);
      setCreateOpen(false);
      setCreateEmail('');
      setCreateName('');
      setCreatePhone('');
      setCreateDepartment('');
      setSearchParams({ email: createEmail.trim() });
    } else {
      notify(res.error || 'Gagal menambahkan pengguna.', 'error');
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    if (selectedUser.email === OWNER_EMAIL && selectedUser.active) {
      notify('Owner utama sistem tidak dapat dinonaktifkan demi integritas keamanan.', 'error');
      return;
    }
    const nextActive = !selectedUser.active;
    const res = await updateAuthorizedUser(selectedUser.email, { active: nextActive });
    if (res.ok) {
      notify(`Akun ${selectedUser.name} (${selectedUser.email}) sekarang ${nextActive ? 'AKTIF' : 'NONAKTIF'}.`);
    } else {
      notify(res.error || 'Gagal mengubah status akun.', 'error');
    }
  };

  const roleConfig = selectedUser ? ROLE_HIERARCHY[selectedUser.role] || ROLE_HIERARCHY['Finance Manager'] : ROLE_HIERARCHY.Owner;
  const userEmployeeId = selectedUser?.employeeId || `USR-${(selectedUser?.name || 'USER').split(' ')[0].toUpperCase()}`;
  
  // Format approval limit
  const formattedApprovalLimit = selectedUser?.approvalLimit === 0 
    ? 'Tanpa Batas (Unlimited)' 
    : new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(selectedUser?.approvalLimit !== undefined ? selectedUser.approvalLimit : roleConfig.defaultLimit);

  const permissionsList = PERMISSIONS_MATRIX[selectedUser?.role] || PERMISSIONS_MATRIX['Finance Manager'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/pengaturan" className="hover:text-blue-600 transition-colors">
              Pengaturan &amp; Akses
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Profil &amp; Pengguna</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Profil Pengguna &amp; Struktur Otorisasi
              </h1>
              <p className="text-xs text-slate-500">
                Pusat data identitas staf, hak akses modul finansial, batas persetujuan, dan jejak aktivitas resmi Asia Plastik.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/pengaturan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Pengaturan</span>
          </Link>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Direktori Pengguna */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Direktori Pengguna ({(authorizedUsers || []).length})
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {(authorizedUsers || []).filter((e) => e.active !== false).length} Aktif
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, atau ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {['Semua', 'Owner', 'Finance Manager', 'Accounting Staff', 'Staff Gudang'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    roleFilter === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada pengguna yang cocok dengan kriteria pencarian.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = (u.email || '').trim().toLowerCase() === (selectedUser.email || '').trim().toLowerCase();
                  const empId = u.employeeId || `USR-${(u.name || 'USER').split(' ')[0].toUpperCase()}`;
                  return (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => setSearchParams({ email: u.email })}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-bold text-slate-900">{u.name}</span>
                            {u.active === false && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 font-bold shrink-0">
                                Nonaktif
                              </span>
                            )}
                          </div>
                          <div className="truncate text-[11px] text-slate-400 font-mono">{u.email}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50/80 px-1.5 py-0.2 rounded border border-indigo-100">
                              {empId}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">{u.role}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: User Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            {/* Header User Card */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white ${
                      selectedUser.active !== false ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    title={selectedUser.active !== false ? 'Akun Aktif' : 'Akun Nonaktif'}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedUser.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleConfig.badge}`}
                    >
                      <Shield className="h-3 w-3" />
                      <span>{selectedUser.role}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Key className="h-3 w-3" />
                      <span>{userEmployeeId}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedUser.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedUser.email, 'email')}
                        className="text-slate-400 hover:text-indigo-600 transition"
                        title="Salin email"
                      >
                        {copiedKey === 'email' ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedUser.department || roleConfig.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Edit Profil</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-2xs transition ${
                    selectedUser.active !== false
                      ? 'border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800'
                      : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                  title={selectedUser.active !== false ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                >
                  {selectedUser.active !== false ? (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Nonaktifkan</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Aktifkan Akun</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4 Stat Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status Otorisasi
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedUser.active !== false ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {selectedUser.active !== false ? 'Aktif & Terverifikasi' : 'Akses Dinonaktifkan'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedUser.active !== false ? 'Dapat masuk & eksekusi aksi' : 'Akses sistem terkunci'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Batas Approval Transaksi
                </span>
                <div className="text-xs font-black text-slate-900">{formattedApprovalLimit}</div>
                <p className="text-[10px] text-slate-400">Limit otorisasi PO &amp; biaya harian</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tingkat Wewenang
                </span>
                <div className="text-xs font-bold text-indigo-700 truncate">
                  {roleConfig.level.split(' ')[0]} {roleConfig.level.split(' ')[1]}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{selectedUser.role}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Terdaftar Sejak
                </span>
                <div className="text-xs font-bold text-slate-900">
                  {selectedUser.addedAt
                    ? new Date(selectedUser.addedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '14 Nov 2026'}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Oleh: {selectedUser.addedBy || 'carlossusanto89@gmail.com'}
                </p>
              </div>
            </div>

            {/* Hierarki & Lingkup Tugas Peran */}
            <div className={`p-4 rounded-xl border ${roleConfig.border} ${roleConfig.bg} space-y-1`}>
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 shrink-0 ${roleConfig.text}`} />
                <span className={`text-xs font-bold ${roleConfig.text}`}>
                  Hierarki &amp; Lingkup Tugas Peran ({selectedUser.role}):
                </span>
              </div>
              <p className="text-xs text-slate-700 pl-6 leading-relaxed">{roleConfig.desc}</p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="border-b border-slate-200">
              <nav className="flex space-x-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'profile'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Rincian Profil &amp; Kontak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('permissions')}
                  className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'permissions'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Matriks Izin Modul (CRUD &amp; Approve)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'activity'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Jejak Audit &amp; Aktivitas ({userAuditLogs.length})</span>
                </button>
              </nav>
            </div>

            {/* Tab 1: Profile & Contact */}
            {activeTab === 'profile' && (
              <div className="space-y-6 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Data Personal & Kontak */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Data Personal &amp; Kontak</span>
                    </h3>
                    <div className="space-y-2 text-xs divide-y divide-slate-100">
                      <div className="pt-1.5 flex justify-between">
                        <span className="text-slate-500">Nama Lengkap</span>
                        <span className="font-bold text-slate-900">{selectedUser.name}</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500">Alamat Email</span>
                        <span className="font-mono font-bold text-indigo-600">{selectedUser.email}</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500">Nomor Telepon / WA</span>
                        <span className="font-semibold text-slate-800">
                          {selectedUser.phone || '+62 811-9988-7766'}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500">Lokasi Kerja</span>
                        <span className="font-medium text-slate-800">
                          Kawasan Industri GIIC Blok C-12 No. 8, Cikarang
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Struktur Organisasi & Akun */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Struktur Organisasi &amp; Akun</span>
                    </h3>
                    <div className="space-y-2 text-xs divide-y divide-slate-100">
                      <div className="pt-1.5 flex justify-between items-center">
                        <span className="text-slate-500">ID Pengguna (Employee ID)</span>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {userEmployeeId}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500">Departemen / Divisi</span>
                        <span className="font-bold text-slate-800">
                          {selectedUser.department || roleConfig.department}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <span className="text-slate-500">Peran Sistem (Role)</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${roleConfig.badge}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500">Ditambahkan Oleh</span>
                        <span className="font-mono text-slate-700">
                          {selectedUser.addedBy || 'carlossusanto89@gmail.com'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan Internal & Memo Penugasan */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Catatan Internal &amp; Memo Penugasan:</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/80">
                    "{selectedUser.notes || `Pengguna resmi Asia Plastik dengan wewenang ${selectedUser.role}. Bertanggung jawab penuh atas operasional di divisi ${selectedUser.department || roleConfig.department}.`}"
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Permissions Matrix */}
            {activeTab === 'permissions' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Matriks kewenangan modul sesuai peran aktif: <strong>{selectedUser.role}</strong>
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Diizinkan
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-300" /> Dibatasi / Tidak Ada
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Modul Aplikasi</th>
                        <th className="py-2.5 px-2 text-center">Create</th>
                        <th className="py-2.5 px-2 text-center">Read</th>
                        <th className="py-2.5 px-2 text-center">Update</th>
                        <th className="py-2.5 px-2 text-center">Delete</th>
                        <th className="py-2.5 px-2 text-center">Approve</th>
                        <th className="py-2.5 px-3">Keterangan Otorisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {permissionsList.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-bold text-slate-800">{p.module}</td>
                          <td className="py-2.5 px-2 text-center">
                            {p.create ? (
                              <Check className="h-4 w-4 text-emerald-600 inline" />
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {p.read ? (
                              <Check className="h-4 w-4 text-emerald-600 inline" />
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {p.update ? (
                              <Check className="h-4 w-4 text-emerald-600 inline" />
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {p.del ? (
                              <Check className="h-4 w-4 text-emerald-600 inline" />
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {p.approve ? (
                              <Check className="h-4 w-4 text-emerald-600 inline" />
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{p.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Audit Activity */}
            {activeTab === 'activity' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Log aktivitas terekam atas nama <strong>{selectedUser.name}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Total {userAuditLogs.length} entri</span>
                </div>

                {userAuditLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-1">
                    <Activity className="h-6 w-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Belum ada riwayat aktivitas spesifik</p>
                    <p className="text-[11px] text-slate-400">
                      Setiap aksi yang dilakukan oleh {selectedUser.name} di sistem akan tercatat otomatis di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {userAuditLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {log.time}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {log.module}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 leading-snug">{log.action}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.user}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Edit Profil Pengguna: {selectedUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ID Pengguna (Employee ID)</label>
                  <input
                    type="text"
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Peran / Hak Akses (Role)</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    disabled={selectedUser.email === OWNER_EMAIL}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Departemen / Divisi</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+62 8..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Batas Approval Transaksi (IDR)</label>
                  <input
                    type="number"
                    value={editApprovalLimit}
                    onChange={(e) => setEditApprovalLimit(e.target.value)}
                    min={0}
                    step={1000000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catatan Internal / Penugasan</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="Keterangan penugasan..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  disabled={selectedUser.email === OWNER_EMAIL}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-800">
                  Akun berstatus Aktif (diizinkan login dan eksekusi dokumen)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tambah Pengguna Baru Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah / Undang Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-400">Otorisasi akun staf ke sistem Asia Plastik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Alamat Email Pengguna</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="staf@asiaplastik.co.id atau @gmail.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Contoh: Hendra Wijaya"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Peran (Role)</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Departemen</label>
                  <input
                    type="text"
                    value={createDepartment}
                    onChange={(e) => setCreateDepartment(e.target.value)}
                    placeholder="Keuangan / Gudang"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nomor Telepon / WA (Opsional)</label>
                <input
                  type="text"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="+62 8..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition"
                >
                  Daftarkan &amp; Terbitkan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
