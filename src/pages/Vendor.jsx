import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  Search,
  Filter,
  CreditCard,
  Eye,
  PenLine,
  Trash2,
  ArrowLeft,
  Save,
  MapPin,
  X
} from 'lucide-react';

export default function Vendor() {
  const [searchParams] = useSearchParams();
  const { vendors = [], setVendors, auditLogs = [], setAuditLogs, notify, confirmAction } = useAppContext();
  const { user } = useAuth();

  const [tab, setTab] = useState('list'); // 'list' | 'add'

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setTab('add');
    }
  }, [searchParams]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Modals
  const [detailVendor, setDetailVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('Bahan Baku Plastik');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Jakarta');
  const [newNpwp, setNewNpwp] = useState('');
  const [newBankName, setNewBankName] = useState('BCA');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newBankHolder, setNewBankHolder] = useState('');
  const [newPaymentTerm, setNewPaymentTerm] = useState('Net 30');
  const [newIsPkp, setNewIsPkp] = useState(true);
  const [newDefaultPpn, setNewDefaultPpn] = useState(11);
  const [newNotes, setNewNotes] = useState('');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editCategory, setEditCategory] = useState('Bahan Baku Plastik');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNpwp, setEditNpwp] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editBankHolder, setEditBankHolder] = useState('');
  const [editPaymentTerm, setEditPaymentTerm] = useState('Net 30');
  const [editIsPkp, setEditIsPkp] = useState(true);
  const [editDefaultPpn, setEditDefaultPpn] = useState(11);

  // Filtered vendors list
  const filteredVendors = useMemo(() => {
    const list = Array.isArray(vendors) ? vendors : [];
    return list.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.code?.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.bankName?.toLowerCase().includes(q);

      const matchCategory = categoryFilter === 'semua' || v.category === categoryFilter;
      const matchStatus = statusFilter === 'semua' || v.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [vendors, searchQuery, categoryFilter, statusFilter]);

  // Start edit
  const handleStartEdit = (v) => {
    setEditingVendor(v);
    setEditName(v.name || '');
    setEditCode(v.code || '');
    setEditCategory(v.category || 'Bahan Baku Plastik');
    setEditPhone(v.phone || '');
    setEditEmail(v.email || '');
    setEditAddress(v.address || '');
    setEditNpwp(v.npwp || '');
    setEditBankName(v.bankName || '');
    setEditBankAccount(v.bankAccount || '');
    setEditBankHolder(v.bankHolder || '');
    setEditPaymentTerm(v.paymentTerm || 'Net 30');
    setEditIsPkp(v.isPkp ?? true);
    setEditDefaultPpn(v.defaultPpn ?? 11);
  };

  // Submit edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingVendor) return;

    const updated = {
      ...editingVendor,
      name: editName.trim(),
      code: editCode.trim(),
      category: editCategory,
      phone: editPhone.trim() || undefined,
      email: editEmail.trim() || undefined,
      address: editAddress.trim() || undefined,
      npwp: editNpwp.trim() || undefined,
      bankName: editBankName.trim() || undefined,
      bankAccount: editBankAccount.trim() || undefined,
      bankHolder: editBankHolder.trim() || editName.trim(),
      paymentTerm: editPaymentTerm,
      isPkp: editIsPkp,
      defaultPpn: editDefaultPpn
    };

    setVendors((prev) => (prev || []).map((v) => (v.id === editingVendor.id ? updated : v)));
    setEditingVendor(null);
    notify(`Data vendor ${updated.name} berhasil diperbarui.`);
  };

  // Toggle status Aktif / Nonaktif
  const toggleVendorStatus = (id) => {
    const target = (vendors || []).find((v) => v.id === id);
    const nextStatus = target?.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    setVendors((prev) => (prev || []).map((v) => (v.id === id ? { ...v, status: nextStatus } : v)));
    notify(`Status vendor ${target?.name} diubah menjadi ${nextStatus}.`);
  };

  // Delete vendor
  const handleDeleteVendor = (vendor) => {
    confirmAction({
      title: 'Hapus Vendor',
      message: `Yakin ingin menghapus vendor "${vendor.name}" dari sistem? Data master vendor akan dihapus.`,
      confirmText: 'Hapus Vendor',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setVendors((prev) => (prev || []).filter((v) => v.id !== vendor.id));
        if (detailVendor?.id === vendor.id) setDetailVendor(null);
        notify(`Vendor "${vendor.name}" berhasil dihapus dari direktori.`);
      }
    });
  };

  // Submit add new vendor
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newVendor = {
      id: `vnd-${Date.now()}`,
      code: newCode.trim() || `VND-${String((vendors || []).length + 1).padStart(3, '0')}`,
      name: newName.trim(),
      category: newCategory,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      address: newAddress.trim() ? `${newAddress.trim()}, ${newCity}` : undefined,
      npwp: newNpwp.trim() || undefined,
      bankName: newBankName.trim() || undefined,
      bankAccount: newBankAccount.trim() || undefined,
      bankHolder: newBankHolder.trim() || newName.trim(),
      paymentTerm: newPaymentTerm,
      status: 'Aktif',
      isPkp: newIsPkp,
      defaultPpn: newDefaultPpn,
      notes: newNotes.trim() || undefined
    };

    setVendors((prev) => [newVendor, ...(prev || [])]);

    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (setAuditLogs) {
      setAuditLogs((prev) => [
        {
          time: timeStr,
          user: user?.name || 'Carlos Susanto',
          action: `TAMBAH VENDOR BARU: Registrasi rekanan ${newVendor.name} (${newVendor.code}) kategori ${newVendor.category}`,
          module: 'Vendor & Pemasok'
        },
        ...(prev || [])
      ]);
    }

    setNewName('');
    setNewCode('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewNpwp('');
    setNewBankAccount('');
    setNewBankHolder('');
    setNewNotes('');
    setTab('list');
    notify(`Vendor ${newVendor.name} (${newVendor.code}) berhasil didaftarkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header matching live application */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Vendor &amp; Pemasok
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Direktori rekanan pemasok bahan baku resin plastik, kemasan, sparepart mesin, utilitas, dan pendaftaran vendor baru.
          </p>
        </div>
        {tab === 'list' ? (
          <button
            type="button"
            onClick={() => setTab('add')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Daftarkan Vendor Baru</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setTab('list')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Vendor</span>
          </button>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('list')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            tab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Daftar &amp; Direktori Vendor</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tab === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {(vendors || []).length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('add')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            tab === 'add'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>+ Tambah Vendor Baru</span>
        </button>
      </div>

      {/* Tab: Daftar & Direktori Vendor */}
      {tab === 'list' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          {/* Header of main card & KPI cards */}
          <div className="border-b border-slate-100 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                onClick={() => setTab('add')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Daftarkan Vendor Baru</span>
              </button>
            </div>

            {/* 4 Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="text-[11px] font-semibold text-slate-500">Total Rekanan</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{(vendors || []).length}</div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="text-[11px] font-semibold text-blue-700">Bahan Baku Resin</div>
                <div className="text-lg font-bold text-blue-900 mt-0.5">
                  {(vendors || []).filter((e) => e.category === 'Bahan Baku Plastik').length}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="text-[11px] font-semibold text-emerald-700">Vendor Aktif</div>
                <div className="text-lg font-bold text-emerald-900 mt-0.5">
                  {(vendors || []).filter((e) => e.status === 'Aktif').length}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500">Nonaktif / Pending</div>
                <div className="text-lg font-bold text-slate-600 mt-0.5">
                  {(vendors || []).filter((e) => e.status === 'Nonaktif').length}
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama vendor, kode, telepon, bank..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="Bahan Baku Plastik">Bahan Baku Plastik</option>
                  <option value="Kemasan & Packaging">Kemasan &amp; Packaging</option>
                  <option value="Sparepart & Mesin">Sparepart &amp; Mesin</option>
                  <option value="Logistik & Ekspedisi">Logistik &amp; Ekspedisi</option>
                  <option value="Utilitas & Listrik">Utilitas &amp; Listrik</option>
                  <option value="Jasa & Konsultan">Jasa &amp; Konsultan</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Vendors */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Vendor / Perusahaan</th>
                  <th className="py-3 px-4">Kategori &amp; Kontak</th>
                  <th className="py-3 px-4">NPWP &amp; Termin</th>
                  <th className="py-3 px-4">Rekening Pembayaran</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      Tidak ada vendor yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* VENDOR / PERUSAHAAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {vendor.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {vendor.code}
                          </span>
                          {vendor.isPkp && (
                            <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1 rounded">
                              PKP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* KATEGORI & KONTAK */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{vendor.category || 'Bahan Baku'}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {vendor.phone || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {vendor.email || '-'}
                          </span>
                        </div>
                      </td>

                      {/* NPWP & TERMIN */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700 text-[11px]">{vendor.npwp || '-'}</div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          Termin: <span className="text-slate-800">{vendor.paymentTerm || 'Net 30'}</span>
                        </div>
                      </td>

                      {/* REKENING PEMBAYARAN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <CreditCard className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>{vendor.bankName || 'BCA'}</span>
                          <span className="font-mono text-slate-600">{vendor.bankAccount || '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          a.n. {vendor.bankHolder || vendor.name}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            vendor.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              vendor.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{vendor.status}</span>
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailVendor(vendor)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
                            title="Lihat Detail Vendor"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            <span>Rincian</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(vendor)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer"
                            title="Edit Data Vendor"
                          >
                            <PenLine className="h-3.5 w-3.5 text-amber-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleVendorStatus(vendor.id)}
                            className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer ${
                              vendor.status === 'Aktif'
                                ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Ubah Status Aktif/Nonaktif"
                          >
                            {vendor.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVendor(vendor)}
                            className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
                            title="Hapus Vendor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: + Tambah Vendor Baru */}
      {tab === 'add' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTab('list')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Daftar Vendor</span>
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Formulir Pendaftaran Rekanan Vendor Baru
                </h2>
                <p className="text-xs text-slate-500">
                  Lengkapi data legalitas, kontak, dan rekening bank vendor untuk penerbitan PO &amp; faktur pembelian Asia Plastik.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-6 max-w-4xl">
            {/* Section 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                  1
                </span>
                <span>Identitas &amp; Legalitas Perusahaan Vendor</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Vendor / PT / CV *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: PT Chandra Asri Petrochemical Tbk"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Vendor (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder={`Auto: VND-${String((vendors || []).length + 1).padStart(3, '0')}`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Pengadaan *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Bahan Baku Plastik">Bahan Baku Plastik</option>
                    <option value="Kemasan & Packaging">Kemasan &amp; Packaging</option>
                    <option value="Sparepart & Mesin">Sparepart &amp; Mesin</option>
                    <option value="Logistik & Ekspedisi">Logistik &amp; Ekspedisi</option>
                    <option value="Utilitas & Listrik">Utilitas &amp; Listrik</option>
                    <option value="Jasa & Konsultan">Jasa &amp; Konsultan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor NPWP Perusahaan
                  </label>
                  <input
                    type="text"
                    value={newNpwp}
                    onChange={(e) => setNewNpwp(e.target.value)}
                    placeholder="01.234.567.8-012.000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                  2
                </span>
                <span>Kontak Person &amp; Lokasi Kantor / Gudang</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="021-89901234 atau 081298765432"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi Penjualan / Finance
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sales@vendor.co.id"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Kantor / Pabrik
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Kawasan Industri MM2100 Blok C-12"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kota / Wilayah Operasional
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Cikarang, Bekasi, Jawa Barat"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                  3
                </span>
                <span>Informasi Rekening Bank &amp; Termin Pembayaran</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Tujuan Transfer
                  </label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="BCA / Mandiri / BNI / BRI"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={newBankAccount}
                    onChange={(e) => setNewBankAccount(e.target.value)}
                    placeholder="5012345678"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    value={newBankHolder}
                    onChange={(e) => setNewBankHolder(e.target.value)}
                    placeholder="Nama pada buku rekening"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Termin Pembayaran (Term of Payment)
                  </label>
                  <select
                    value={newPaymentTerm}
                    onChange={(e) => setNewPaymentTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Cash Before Delivery (CBD)">Cash Before Delivery (CBD)</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="Net 7">Net 7 Hari</option>
                    <option value="Net 14">Net 14 Hari</option>
                    <option value="Net 30">Net 30 Hari</option>
                    <option value="Net 45">Net 45 Hari</option>
                    <option value="Net 60">Net 60 Hari</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                  4
                </span>
                <span>Ketentuan Pajak &amp; Catatan Rekanan</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isPkp"
                    checked={newIsPkp}
                    onChange={(e) => setNewIsPkp(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isPkp" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Perusahaan Kena Pajak (PKP) - Menerbitkan Faktur Pajak PPN
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Tambahan
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Contoh: Diskon volume 2%, Lead time pengiriman 3 hari kerja"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTab('list')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Vendor Baru ke Database</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {detailVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Profil Vendor: {detailVendor.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kode: {detailVendor.code} • Status: {detailVendor.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailVendor(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[80vh]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                    {detailVendor.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      detailVendor.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        detailVendor.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>{detailVendor.status}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{detailVendor.name}</h3>
                <p className="text-xs text-slate-500">{detailVendor.category}</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="font-bold text-slate-900 text-xs border-b pb-2">
                  Informasi Legalitas &amp; Pajak
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-slate-400">NPWP Perusahaan</div>
                    <div className="font-mono font-semibold text-slate-800 mt-0.5">
                      {detailVendor.npwp || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Status PKP</div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {detailVendor.isPkp ? 'PKP (PPN 11%)' : 'Non-PKP'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="font-bold text-slate-900 text-xs border-b pb-2">
                  Kontak Person &amp; Alamat
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-800">{detailVendor.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-800">{detailVendor.email || '-'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-800">{detailVendor.address || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="font-bold text-slate-900 text-xs border-b pb-2">
                  Rekening Pembayaran &amp; Termin
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      {detailVendor.bankName || 'BCA'} - {detailVendor.bankAccount || '-'}
                    </span>
                    <span className="text-slate-500">
                      (a.n. {detailVendor.bankHolder || detailVendor.name})
                    </span>
                  </div>
                  <div className="text-slate-600 pl-6">
                    Termin Bayar:{' '}
                    <span className="font-semibold text-slate-900">
                      {detailVendor.paymentTerm || 'Net 30'}
                    </span>
                  </div>
                </div>
              </div>

              {detailVendor.notes && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50">
                  <div className="font-bold text-slate-900 text-xs">Catatan Tambahan</div>
                  <p className="text-slate-600 italic">"{detailVendor.notes}"</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailVendor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Data Vendor: {editingVendor.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui data kontak, legalitas, atau rekening pembayaran
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kode Vendor
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kategori Pengadaan
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Bahan Baku Plastik">Bahan Baku Plastik</option>
                    <option value="Kemasan & Packaging">Kemasan &amp; Packaging</option>
                    <option value="Sparepart & Mesin">Sparepart &amp; Mesin</option>
                    <option value="Logistik & Ekspedisi">Logistik &amp; Ekspedisi</option>
                    <option value="Utilitas & Listrik">Utilitas &amp; Listrik</option>
                    <option value="Jasa & Konsultan">Jasa &amp; Konsultan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Termin Pembayaran
                  </label>
                  <select
                    value={editPaymentTerm}
                    onChange={(e) => setEditPaymentTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Cash Before Delivery (CBD)">Cash Before Delivery (CBD)</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="Net 7">Net 7 Hari</option>
                    <option value="Net 14">Net 14 Hari</option>
                    <option value="Net 30">Net 30 Hari</option>
                    <option value="Net 45">Net 45 Hari</option>
                    <option value="Net 60">Net 60 Hari</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Vendor
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    NPWP
                  </label>
                  <input
                    type="text"
                    value={editNpwp}
                    onChange={(e) => setEditNpwp(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={editBankAccount}
                    onChange={(e) => setEditBankAccount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Atas Nama Rekening
                  </label>
                  <input
                    type="text"
                    value={editBankHolder}
                    onChange={(e) => setEditBankHolder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Alamat Perusahaan
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
