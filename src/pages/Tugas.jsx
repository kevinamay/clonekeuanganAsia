import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  ExternalLink,
  BookOpen,
  Layers,
  User,
  Tag,
  Check,
  ShieldAlert,
  Send,
  Building,
  DollarSign
} from 'lucide-react';

const SEVERITIES = {
  Kritis: {
    label: 'Kritis',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    icon: AlertTriangle
  },
  Tinggi: {
    label: 'Tinggi',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: Flame
  },
  Sedang: {
    label: 'Sedang',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    icon: Clock
  },
  Rendah: {
    label: 'Rendah',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    icon: CheckCircle2
  }
};

const TASK_TYPES = {
  'Rekonsiliasi': { label: 'Rekonsiliasi', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200', dotClass: 'bg-sky-500' },
  'Persetujuan': { label: 'Persetujuan', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotClass: 'bg-indigo-500' },
  'Perpajakan': { label: 'Perpajakan', badgeClass: 'bg-pink-50 text-pink-700 border-pink-200', dotClass: 'bg-pink-500' },
  'Pembayaran': { label: 'Pembayaran', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  'Catatan Internal': { label: 'Catatan Internal', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200', dotClass: 'bg-slate-400' },
  'Operasional Pabrik': { label: 'Operasional Pabrik', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  'Penjualan & Piutang': { label: 'Penjualan & Piutang', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', dotClass: 'bg-purple-500' }
};

// Initial tasks initialized empty for clean manual input
const INITIAL_TASKS = [];

export default function Tugas() {
  const {
    personalNotes,
    setPersonalNotes,
    salesDocs,
    purchaseDocs,
    expenses,
    bankMutations,
    notify
  } = useAppContext();

  // Active Tab: 'tasks' | 'catatan'
  const [activeTab, setActiveTab] = useState('tasks');

  // Search, Status Filter, Severity Filter, Type Filter, Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua'); // 'semua' | 'tertunda' | 'selesai'
  const [severityFilter, setSeverityFilter] = useState('semua');
  const [typeFilter, setTypeFilter] = useState('semua');
  const [sortBy, setSortBy] = useState('severity'); // 'severity' | 'dueDate' | 'created'

  // Module filter for Integrated Hub Tab
  const [hubModuleFilter, setHubModuleFilter] = useState('semua');

  // Create form toggle & form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSeverity, setFormSeverity] = useState('Sedang');
  const [formType, setFormType] = useState('Catatan Internal');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignee, setFormAssignee] = useState('Carlos Susanto');
  const [formRelatedDoc, setFormRelatedDoc] = useState('');

  // Selected Task for Detail / Edit Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Use tasks directly from user's personal notes state (clean manual input)
  const tasksList = useMemo(() => {
    return Array.isArray(personalNotes) ? personalNotes : [];
  }, [personalNotes]);

  // Document link extractor helper
  const extractLinkedDocs = (task) => {
    let matched;
    const result = [];
    const seen = new Set();
    const add = (doc) => {
      if (!doc) return;
      const clean = doc.replace(/^[\/#\(\[\{"']+|[\)\]\}"',.;:]+$/g, '').trim();
      const upper = clean.toUpperCase();
      if (clean && !seen.has(upper) && clean.length >= 3) {
        seen.add(upper);
        result.push(clean);
      }
    };

    if (task.relatedDoc) {
      task.relatedDoc.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean).forEach(add);
    }
    const text = `${task.title || ''} ${task.content || ''}`;
    const regex = /(?:^|[\s\(\[\{/])((?:PO|PR|INV|EXP|MUT|WO|BG|GIRO|SJ|DO|BGR|JV|VND|SPK|BL|PPN|REQ|CTR)[A-Z0-9-]*-\d+[A-Z0-9-]*|(?:PO|PR|INV|EXP|MUT|WO|BG|GIRO|SJ|DO|BGR|JV|VND|SPK|BL|PPN|REQ|CTR)[A-Z0-9-]*)\b/gi;
    while ((matched = regex.exec(text)) !== null) {
      add(matched[1]);
    }
    return result;
  };

  // Toggle task completion status
  const toggleTask = (id) => {
    const updated = tasksList.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setPersonalNotes(updated);
    notify('Status tugas diperbarui.');
  };

  // Delete task
  const deleteTask = (id) => {
    const updated = tasksList.filter(t => t.id !== id);
    setPersonalNotes(updated);
    notify('Catatan/Tugas berhasil dihapus.');
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  // Handle new task submission
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      notify('Mohon masukkan judul catatan atau tugas.', 'error');
      return;
    }

    const newTask = {
      id: `task-${Date.now().toString(36)}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      severity: formSeverity,
      type: formType,
      dueDate: formDueDate || undefined,
      completed: false,
      createdAt: `${new Date().getDate()} Nov 2026`,
      author: 'Carlos Susanto',
      assignee: formAssignee,
      relatedDoc: formRelatedDoc.trim()
    };

    const updated = [newTask, ...tasksList];
    setPersonalNotes(updated);
    setIsFormOpen(false);
    setFormTitle('');
    setFormContent('');
    setFormDueDate('');
    setFormRelatedDoc('');
    notify('Catatan / Tugas baru berhasil ditambahkan.');
  };

  // Summary counts
  const totalTasks = tasksList.length;
  const criticalTasks = tasksList.filter(t => t.severity === 'Kritis' || t.severity === 'Tinggi').length;
  const pendingTasks = tasksList.filter(t => !t.completed).length;
  const completedTasks = tasksList.filter(t => t.completed).length;

  // Filtered & Sorted Tasks for Tab 1
  const filteredTasks = useMemo(() => {
    let result = [...tasksList];

    // Status filter
    if (statusFilter === 'tertunda') {
      result = result.filter(t => !t.completed);
    } else if (statusFilter === 'selesai') {
      result = result.filter(t => t.completed);
    }

    // Severity filter
    if (severityFilter !== 'semua') {
      result = result.filter(t => t.severity === severityFilter);
    }

    // Type filter
    if (typeFilter !== 'semua') {
      result = result.filter(t => t.type === typeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.content && t.content.toLowerCase().includes(q)) ||
        (t.assignee && t.assignee.toLowerCase().includes(q)) ||
        (t.relatedDoc && t.relatedDoc.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'severity') {
        const order = { Kritis: 4, Tinggi: 3, Sedang: 2, Rendah: 1 };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      }
      if (sortBy === 'dueDate') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return result;
  }, [tasksList, statusFilter, severityFilter, typeFilter, searchQuery, sortBy]);

  // Integrated System Notes for Tab 2
  const allSystemNotes = useMemo(() => {
    const list = [];

    // From tasks
    tasksList.forEach(t => {
      list.push({
        id: t.id,
        sourceModule: 'Tugas & Tim',
        title: t.title,
        noteText: t.content,
        partyName: t.assignee || 'Tim Internal',
        docNumber: t.relatedDoc || '-',
        date: t.dueDate || t.createdAt,
        author: t.author,
        statusBadge: t.completed ? 'Selesai' : 'Pending',
        rawTask: t
      });
    });

    // From Sales
    (salesDocs || []).forEach(s => {
      if (s.notes || s.paymentNote || s.tag) {
        list.push({
          id: `sales-${s.id}`,
          sourceModule: 'Penjualan',
          title: `Faktur ${s.number} - ${s.customer}`,
          noteText: s.notes || s.paymentNote || s.tag,
          partyName: s.customer,
          docNumber: s.number,
          date: s.date,
          author: 'Sistem Penjualan',
          statusBadge: s.status
        });
      }
    });

    // From Purchase
    (purchaseDocs || []).forEach(p => {
      if (p.notes || p.paymentNote || p.notesSpecial) {
        list.push({
          id: `po-${p.id}`,
          sourceModule: 'Pembelian',
          title: `Pesanan ${p.number} - ${p.vendor}`,
          noteText: p.notes || p.paymentNote || p.notesSpecial || 'Instruksi pengiriman & PO bahan baku',
          partyName: p.vendor,
          docNumber: p.number,
          date: p.date,
          author: 'Tim Purchasing',
          statusBadge: p.status
        });
      }
    });

    // From Expenses
    (expenses || []).forEach(x => {
      if (x.notes || x.description) {
        list.push({
          id: `exp-${x.id}`,
          sourceModule: 'Biaya',
          title: `Beban ${x.number || x.id} - ${x.payee || x.category}`,
          noteText: x.notes || x.description,
          partyName: x.payee || x.category,
          docNumber: x.number || x.id,
          date: x.date,
          author: 'Kasir & Akuntansi',
          statusBadge: x.status
        });
      }
    });

    // From Bank Mutations
    (bankMutations || []).forEach(m => {
      if (m.description || m.note) {
        list.push({
          id: `mut-${m.id}`,
          sourceModule: 'Kas & Bank',
          title: `Mutasi ${m.account || 'Rekening'} (${m.type})`,
          noteText: m.description || m.note,
          partyName: m.account,
          docNumber: m.reference || m.id,
          date: m.date,
          author: 'Sistem Perbankan',
          statusBadge: m.status
        });
      }
    });

    return list;
  }, [tasksList, salesDocs, purchaseDocs, expenses, bankMutations]);

  // Filtered System Notes for Tab 2
  const filteredSystemNotes = useMemo(() => {
    let result = allSystemNotes;
    if (hubModuleFilter !== 'semua') {
      result = result.filter(n => n.sourceModule === hubModuleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.noteText.toLowerCase().includes(q) ||
        (n.partyName && n.partyName.toLowerCase().includes(q)) ||
        (n.docNumber && n.docNumber.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allSystemNotes, hubModuleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Tugas &amp; Catatan Finansial
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Dedicated page untuk mengelola seluruh catatan operasional, instruksi kerja, dan memo keuangan tanpa pop-up.
          </p>
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Buat Catatan / Tugas Baru</span>
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`pb-2.5 font-bold text-xs sm:text-sm transition-colors relative cursor-pointer ${
            activeTab === 'tasks' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Daftar Tugas &amp; Memo Tim</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {totalTasks}
            </span>
          </span>
          {activeTab === 'tasks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catatan')}
          className={`pb-2.5 font-bold text-xs sm:text-sm transition-colors relative cursor-pointer ${
            activeTab === 'catatan' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Semua Catatan Sistem (Integrated Hub)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {allSystemNotes.length}
            </span>
          </span>
          {activeTab === 'catatan' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* INLINE CREATE FORM (when toggled open) */}
      {isFormOpen && (
        <div className="rounded-3xl border-2 border-blue-500/30 bg-blue-50/20 p-6 shadow-sm space-y-4 animate-scale-in">
          <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600 stroke-[2.5]" />
              <h3 className="text-sm font-bold text-slate-900">
                Form Catatan &amp; Tugas Baru (Langsung di Halaman)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Catatan / Tugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Rekonsiliasi Faktur Pembelian Bahan Baku Q4..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi / Instruksi Detail
              </label>
              <textarea
                rows={3}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Tuliskan detail instruksi kerja, pihak terkait, nomor dokumen terkait..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prioritas (Severity)</label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="Kritis">Kritis</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Tugas</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                >
                  {Object.keys(TASK_TYPES).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jatuh Tempo</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Penanggung Jawab</label>
                <select
                  value={formAssignee}
                  onChange={(e) => setFormAssignee(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="Carlos Susanto">Carlos Susanto</option>
                  <option value="Direktur Utama">Direktur Utama</option>
                  <option value="Finance & Accounting Staff">Finance & Accounting Staff</option>
                  <option value="Tax Specialist">Tax Specialist</option>
                  <option value="Finance Team">Finance Team</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Semua">Semua</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Terkait Dokumen</label>
                <input
                  type="text"
                  value={formRelatedDoc}
                  onChange={(e) => setFormRelatedDoc(e.target.value)}
                  placeholder="PO-2026-004, INV-1212"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Simpan Catatan / Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: DAFTAR TUGAS & MEMO TIM */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* 4 KPI SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Tugas */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Tugas
                </span>
                <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 num">{totalTasks}</div>
              <p className="mt-1 text-[11px] text-slate-400">Semua catatan &amp; instruksi kerja</p>
            </div>

            {/* Card 2: Prioritas Kritis */}
            <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Prioritas Kritis
                </span>
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-rose-700 num">{criticalTasks}</div>
              <p className="mt-1 text-[11px] text-rose-600/80 font-medium">Perlu tindakan &amp; persetujuan cepat</p>
            </div>

            {/* Card 3: Tugas Tertunda */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Tugas Tertunda
                </span>
                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-amber-700 num">{pendingTasks}</div>
              <p className="mt-1 text-[11px] text-amber-600/80 font-medium">Belum diselesaikan / in progress</p>
            </div>

            {/* Card 4: Telah Selesai */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Telah Selesai
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-700 num">{completedTasks}</div>
              <p className="mt-1 text-[11px] text-emerald-600/80 font-medium">Telah diverifikasi &amp; beres</p>
            </div>
          </div>

          {/* FILTER & SEARCH TOOLBAR */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-2xl w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter('semua')}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === 'semua'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semua ({totalTasks})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('tertunda')}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === 'tertunda'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tertunda ({pendingTasks})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('selesai')}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === 'selesai'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Selesai ({completedTasks})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tugas, PJ, dokumen..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown Filters & Sorters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Filter:</span>
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="semua">Semua Severity</option>
                <option value="Kritis">Severity: Kritis</option>
                <option value="Tinggi">Severity: Tinggi</option>
                <option value="Sedang">Severity: Sedang</option>
                <option value="Rendah">Severity: Rendah</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="semua">Semua Tipe Tugas</option>
                {Object.keys(TASK_TYPES).map(t => (
                  <option key={t} value={t}>Tipe: {t}</option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="severity">Urutkan: Prioritas / Severity</option>
                  <option value="dueDate">Urutkan: Tanggal Jatuh Tempo</option>
                  <option value="created">Urutkan: Tanggal Dibuat</option>
                </select>
              </div>
            </div>
          </div>

          {/* TASKS CARD GRID (2 Columns Matching Gambar 2) */}
          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Tidak ada tugas yang sesuai</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Coba sesuaikan kata kunci atau ubah pengaturan filter di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => {
                const sev = SEVERITIES[task.severity] || SEVERITIES.Sedang;
                const typ = TASK_TYPES[task.type] || TASK_TYPES['Catatan Internal'];
                const SevIcon = sev.icon;
                const linkedDocs = extractLinkedDocs(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group/card ${
                      task.completed
                        ? 'bg-slate-50/70 border-slate-200/80 opacity-80'
                        : task.severity === 'Kritis'
                        ? 'bg-white border-rose-200 ring-1 ring-rose-50'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top row: Badges & Action Buttons */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Severity Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sev.badgeClass}`}>
                            <SevIcon className="h-3 w-3" />
                            <span>{sev.label}</span>
                          </span>

                          {/* Type Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${typ.badgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${typ.dotClass}`} />
                            <span>{typ.label}</span>
                          </span>
                        </div>

                        {/* Edit & Delete Action Icons */}
                        <div
                          className="flex items-center gap-1 opacity-70 group-hover/card:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsEditing(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit Catatan"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title Row with Circular Checkbox */}
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                          className={`mt-0.5 shrink-0 h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {task.completed && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                        </button>
                        <h4
                          className={`text-sm font-bold text-slate-900 group-hover/card:text-blue-600 transition-colors line-clamp-2 ${
                            task.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>

                      {/* Content Description */}
                      <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed pl-7">
                        {task.content}
                      </p>

                      {/* Linked Document Pills */}
                      {linkedDocs.length > 0 && (
                        <div className="mt-3 pl-7 flex items-center gap-1.5 flex-wrap">
                          {linkedDocs.map((doc) => (
                            <span
                              key={doc}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{doc}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Date & Assignee */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{task.dueDate || task.createdAt}</span>
                      </div>
                      <span className="font-semibold text-slate-600 truncate max-w-[140px]">
                        {task.assignee || 'Semua'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEMUA CATATAN SISTEM (INTEGRATED HUB) */}
      {activeTab === 'catatan' && (
        <div className="space-y-6">
          {/* Integrated Hub Hero Banner */}
          <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  Dedicated Hub
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Total {allSystemNotes.length} Catatan Terkumpul
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Pusat Semua Catatan Operasional Bisnis Asia Plastik
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                Menghubungkan catatan instruksi dari Faktur Penjualan, Purchase Order Pembelian, Pengeluaran Beban, Mutasi Bank, serta Memo Tugas Tim ke dalam satu repositori terpadu tanpa pop up.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('tasks');
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Catatan Baru</span>
            </button>
          </div>

          {/* Filter Bar by Module */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-100 rounded-2xl overflow-x-auto w-full md:w-auto">
              {[
                { id: 'semua', label: 'Semua Modul' },
                { id: 'Tugas & Tim', label: 'Tugas & Tim' },
                { id: 'Penjualan', label: 'Penjualan' },
                { id: 'Pembelian', label: 'Pembelian' },
                { id: 'Biaya', label: 'Biaya' },
                { id: 'Kas & Bank', label: 'Kas & Bank' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHubModuleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    hubModuleFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari teks catatan, dokumen, pihak..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Integrated Notes Grid */}
          {filteredSystemNotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Tidak ada catatan yang ditemukan</h4>
              <p className="mt-1 text-xs text-slate-400">
                Coba sesuaikan kata kunci pencarian atau ganti filter modul.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSystemNotes.map((note) => {
                const getModuleColor = (mod) => {
                  switch (mod) {
                    case 'Tugas & Tim': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    case 'Penjualan': return 'bg-sky-50 text-sky-700 border-sky-200';
                    case 'Pembelian': return 'bg-purple-50 text-purple-700 border-purple-200';
                    case 'Biaya': return 'bg-rose-50 text-rose-700 border-rose-200';
                    case 'Kas & Bank': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    default: return 'bg-slate-50 text-slate-700 border-slate-200';
                  }
                };

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      if (note.rawTask) {
                        setSelectedTask(note.rawTask);
                      }
                    }}
                    className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getModuleColor(note.sourceModule)}`}>
                            {note.sourceModule}
                          </span>
                          {note.docNumber && note.docNumber !== '-' && (
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {note.docNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{note.date}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {note.title}
                      </h4>

                      <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line line-clamp-4">
                        {note.noteText}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Pihak: <strong className="text-slate-800">{note.partyName || '-'}</strong>
                      </span>
                      <span className="text-slate-400">{note.author}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TASK DETAIL & EDIT MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${SEVERITIES[selectedTask.severity]?.badgeClass}`}>
                  {selectedTask.severity}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TASK_TYPES[selectedTask.type]?.badgeClass}`}>
                  {selectedTask.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setIsEditing(false);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedTask.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedTask.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white rounded-2xl border border-slate-100 p-3">
                <div>
                  <span className="text-slate-400">Jatuh Tempo:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedTask.dueDate || selectedTask.createdAt}</div>
                </div>
                <div>
                  <span className="text-slate-400">Penanggung Jawab:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedTask.assignee || 'Semua'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Dibuat Oleh:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedTask.author}</div>
                </div>
                <div>
                  <span className="text-slate-400">Status Penyelesaian:</span>
                  <div className="mt-0.5 font-bold">
                    {selectedTask.completed ? (
                      <span className="text-emerald-600">✓ Telah Selesai</span>
                    ) : (
                      <span className="text-amber-600">⏳ Belum Selesai</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleTask(selectedTask.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedTask.completed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {selectedTask.completed ? 'Tandai Belum Selesai' : 'Tandai Telah Selesai'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => deleteTask(selectedTask.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
