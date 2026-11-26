import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Check,
  CheckCircle2,
  HelpCircle,
  Receipt,
  PlayCircle,
  FileText,
  Settings,
  Shield,
  Bot,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Lock,
  Globe,
  Zap,
  Trash2,
  DollarSign,
  AlertTriangle,
  Command,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs ${className}`} {...props}>
      {children}
    </div>
  );
}

// Data Array D (Searchable Topics)
const D = [{
  id: "alur-1",
  category: "Alur Siklus Bisnis",
  tabTarget: "alur",
  title: "Tahap 1: Pengadaan Bahan Baku (Resin Biji Plastik)",
  excerpt: "Bagian gudang cek stok minimum, terbitkan Purchase Request / PO ke supplier (PT Duta Polimer / Chandra Asri), dan bayar sesuai tempo.",
  keywords: ["alur", "pembelian", "bahan baku", "resin", "po", "gudang", "vendor", "pengadaan"]
}, {
  id: "alur-2",
  category: "Alur Siklus Bisnis",
  tabTarget: "alur",
  title: "Tahap 2: Proses Produksi & Biaya Operasional",
  excerpt: "Mesin blowing ekstrusi melelehkan biji plastik jadi roll lembaran, dicetak dan dipotong jadi kantong kresek. Beban listrik PLN dicatat di menu Biaya.",
  keywords: ["alur", "produksi", "pabrik", "mesin", "blowing", "roll", "biaya", "pln", "beban"]
}, {
  id: "alur-3",
  category: "Alur Siklus Bisnis",
  tabTarget: "alur",
  title: "Tahap 3: Penjualan, Invoicing & Arus Kas Masuk",
  excerpt: "Faktur penjualan diterbitkan ke toko/distributor (PT Surya Kencana, CV Makmur), tukar faktur, dan konfirmasi pelunasan masuk rekening bank.",
  keywords: ["alur", "penjualan", "invoice", "faktur", "tukar faktur", "kas", "piutang", "pelunasan"]
}, {
  id: "modul-dashboard",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 01: Dashboard Overview Finansial",
  excerpt: "Pusat komando eksekutif melihat total kas, pendapatan bulan berjalan, piutang tertahan, filter tanggal kustom, dan unduh laporan CSV.",
  keywords: ["dashboard", "overview", "saldo", "omset", "laba", "unduh csv", "filter tanggal"]
}, {
  id: "modul-kas",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 02: Kas & Bank Realtime",
  excerpt: "Kelola rekening BCA operasional, Mandiri pajak, kartu virtual sandbox fiktif, input mutasi kas masuk/keluar, dan transfer antar bank.",
  keywords: ["kas", "bank", "bca", "mandiri", "kartu", "sandbox", "fiktif", "mutasi", "rekening"]
}, {
  id: "modul-rekonsiliasi",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 03: Rekonsiliasi Bank Otomatis",
  excerpt: "Mencocokkan mutasi rekening koran bank dengan catatan buku faktur secara otomatis dengan auto-matching algoritma akuntansi.",
  keywords: ["rekonsiliasi", "rekening koran", "cocok", "mutasi", "audit", "buku bank"]
}, {
  id: "modul-penjualan",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 04: Penjualan & Invoicing",
  excerpt: "Menerbitkan faktur penjualan, mengatur jatuh tempo, tarif PPN 11%, potongan PPh 2%, tukar faktur, dan persetujuan faktur plafon kredit besar.",
  keywords: ["penjualan", "faktur", "invoice", "ppn", "pph", "piutang", "tukar faktur", "approval faktur"]
}, {
  id: "modul-pembelian",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 05: Pembelian & Vendor PO",
  excerpt: "Mendaftarkan vendor resin, membuat Purchase Order (PO), menyetujui PO > Rp 50jt, konfirmasi barang datang, dan pelunasan utang usaha.",
  keywords: ["pembelian", "po", "purchase order", "vendor", "supplier", "utang", "bayar vendor"]
}, {
  id: "modul-biaya",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 06: Biaya & Beban Operasional",
  excerpt: "Mencatat beban listrik PLN, solar diesel pabrik, perbaikan mesin, gaji operator, dan memantau realisasi vs anggaran (budget cap).",
  keywords: ["biaya", "beban", "anggaran", "budget", "pln", "solar", "reimbursement", "mesin"]
}, {
  id: "modul-inventori",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 07: Inventori & Gudang Pabrik",
  excerpt: "Pantau stok biji plastik HDPE/PP per gudang (Cikarang, Surabaya), reorder point minimum, dan surat perintah kerja (Work Order).",
  keywords: ["inventori", "gudang", "stok", "biji plastik", "hdpe", "work order", "wo", "reorder point"]
}, {
  id: "modul-akuntansi",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 08: Akuntansi, Jurnal Umum & Tutup Buku",
  excerpt: "Bagan akun CoA, jurnal penyesuaian, perhitungan PPh 29 (22%), 5-point checklist pra-tutup buku, closing bulanan/tahunan, dan re-open Owner.",
  keywords: ["akuntansi", "tutup buku", "closing", "jurnal penutup", "coa", "pph 29", "retained earnings", "laba ditahan", "reopen"]
}, {
  id: "modul-approval",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 08: Pusat Persetujuan (Approval Center)",
  excerpt: "Antrean terpusat transaksi bernilai tinggi dari Penjualan, Pembelian, dan Biaya. Otorisasi Setujui/Tolak oleh Manager & Owner, serta batch approve.",
  keywords: ["approval", "persetujuan", "otorisasi", "setujui", "tolak", "antrean approval", "batch approve", "manager", "owner"]
}, {
  id: "modul-tugas-slash",
  category: "Panduan Modul",
  tabTarget: "modul",
  title: "Modul 09: Tugas, Catatan Tim & Slash Command (/) Dokumen",
  excerpt: "Cara membuat tombol pintasan dokumen otomatis di tengah kalimat instruksi tugas menggunakan karakter slash '/' atau menyebutkan nomor PO/Faktur/Mutasi secara langsung.",
  keywords: ["slash", "shortcut", "pintasan", "tugas", "catatan", "slash command", "/", "po", "faktur", "chip", "autolink", "cetak", "dokumen"]
}, {
  id: "fundamental-cash",
  category: "Fundamental Finansial",
  tabTarget: "fundamental",
  title: "Fundamental 1: Uang Kas (Cashflow) Tidak Sama dengan Laba (Profit)",
  excerpt: "Laba di atas kertas tidak bisa dipakai bayar listrik jika pelanggan masih berutang. Mengapa menjaga kas fisik lebih penting daripada sekadar angka profit.",
  keywords: ["fundamental", "cashflow", "profit", "laba", "kas", "piutang", "tempo"]
}, {
  id: "fundamental-debt",
  category: "Fundamental Finansial",
  tabTarget: "fundamental",
  title: "Fundamental 2: Piutang Pelanggan vs Utang Usaha (Terms of Payment)",
  excerpt: "Strategi tempo aman: Jangan sampai memberi tempo pelanggan 60 hari sementara vendor minta dibayar dalam 14 hari.",
  keywords: ["fundamental", "piutang", "utang", "top", "tempo", "vendor", "termin"]
}, {
  id: "fundamental-closing",
  category: "Fundamental Finansial",
  tabTarget: "fundamental",
  title: "Fundamental 3: Neraca Saldo & Mengapa Harus Tutup Buku",
  excerpt: "Tutup buku memindahkan laba periode berjalan ke Laba Ditahan (Retained Earnings) akun 3-20000 dan mengunci buku agar angka finansial tidak dimanipulasi.",
  keywords: ["fundamental", "neraca", "tutup buku", "retained earnings", "laba ditahan", "closing"]
}, {
  id: "fundamental-tax",
  category: "Fundamental Finansial",
  tabTarget: "fundamental",
  title: "Fundamental 4: PPN 11% & Provisi Pajak PPh 29 Badan (22%)",
  excerpt: "PPN adalah titipan negara yang wajib disetor ke DJP Coretax, sedangkan PPh 29 adalah kewajiban pajak tahunan dari Laba Bersih Kena Pajak.",
  keywords: ["fundamental", "pajak", "ppn", "pph 29", "coretax", "djp", "provisi pajak"]
}, {
  id: "peran-owner",
  category: "Hak Akses Peran",
  tabTarget: "peran",
  title: "Peran: Owner (Pemilik Utama)",
  excerpt: "Akses mutlak sistem, mengundang akun baru (Invite User), mengubah role, menyetujui transaksi, membuka kembali tutup buku, dan mereset database.",
  keywords: ["peran", "role", "owner", "pemilik", "invite", "reset"]
}, {
  id: "peran-manager",
  category: "Hak Akses Peran",
  tabTarget: "peran",
  title: "Peran: Finance Manager",
  excerpt: "Akses penuh operasional finansial dan berhak menyetujui (approve) seluruh transaksi bernilai tinggi. Dilarang mengundang user atau mereset data.",
  keywords: ["peran", "role", "finance manager", "manager", "approval", "otorisasi"]
}, {
  id: "peran-staff",
  category: "Hak Akses Peran",
  tabTarget: "peran",
  title: "Peran: Accounting Staff & Gudang (CUD tanpa Approve)",
  excerpt: "Staf operasional berhak Create, Update, Delete nota harian tetapi tombol approval digembok sesuai tata kelola pemisahan tugas (segregation of duties).",
  keywords: ["peran", "role", "staff", "accounting staff", "staff gudang", "banker", "cud tanpa approve"]
}, {
  id: "mcp-setup-claude",
  category: "Integrasi AI Agent (MCP)",
  tabTarget: "mcp",
  title: "Setup MCP ke Claude Desktop (macOS / Windows)",
  excerpt: "Panduan mengedit file claude_desktop_config.json dan mendaftarkan URL http://localhost:3001/api/mcp dengan x-api-key autentikasi.",
  keywords: ["mcp", "claude desktop", "claude_desktop_config.json", "setup", "konfigurasi", "api key"]
}, {
  id: "mcp-setup-cursor",
  category: "Integrasi AI Agent (MCP)",
  tabTarget: "mcp",
  title: "Setup MCP ke Cursor IDE & Windsurf",
  excerpt: "Cara mendaftarkan server asia-plastik-finance di Cursor Settings MCP atau .cursor/mcp.json untuk automasi coding & finansial.",
  keywords: ["mcp", "cursor", "windsurf", "codeium", "ide", "mcp.json", "developer"]
}, {
  id: "mcp-setup-cli",
  category: "Integrasi AI Agent (MCP)",
  tabTarget: "mcp",
  title: "Setup MCP via Claude Code & Terminal CLI",
  excerpt: "Perintah satu baris 'claude mcp add asia-plastik http://localhost:3001/api/mcp' untuk agen terminal autonomous.",
  keywords: ["mcp", "claude code", "terminal", "cli", "command line", "agent"]
}, {
  id: "mcp-tools-list",
  category: "Integrasi AI Agent (MCP)",
  tabTarget: "mcp",
  title: "Daftar 8 Tool MCP Finansial (get_financial_summary, record_transaction, dll)",
  excerpt: "Spesifikasi lengkap fungsi yang dapat dipanggil oleh agen AI untuk membaca kas, mengecek stok bahan baku, dan mencatat transaksi ke database.",
  keywords: ["mcp", "tools", "get_financial_summary", "list_sales_invoices", "list_purchase_orders", "record_transaction", "api"]
}, {
  id: "mcp-prompt-examples",
  category: "Integrasi AI Agent (MCP)",
  tabTarget: "mcp",
  title: "Contoh Prompt & Dialog Nyata Perintah ke AI Agent",
  excerpt: "Contoh instruksi operasional harian: cek stok resin sebelum terima order, buat draf PO bahan baku, dan verifikasi piutang macet.",
  keywords: ["mcp", "prompt", "contoh perintah", "dialog", "ai agent", "otomasi"]
}, {
  id: "faq-approve",
  category: "FAQ: Akses & Approval",
  tabTarget: "faq",
  title: "FAQ: Mengapa Tombol Setujui (Approve) Ada Tanda Gembok?",
  excerpt: "Hanya Owner dan Finance Manager yang memiliki hak otorisasi. Akun staff memiliki akses CUD tanpa approval demi keamanan audit.",
  keywords: ["faq", "gembok", "tidak bisa klik", "approve", "setujui", "hak akses", "staf"]
}, {
  id: "faq-date",
  category: "FAQ: Transaksi & Tanggal",
  tabTarget: "faq",
  title: "FAQ: Cara Mengubah Tanggal Transaksi Nota Lampau",
  excerpt: "Gunakan kolom Tanggal Transaksi pada formulir pembuatan Faktur, PO, atau Biaya untuk menyesuaikan dengan tanggal nota fisik kuitansi.",
  keywords: ["faq", "tanggal", "custom tanggal", "lampau", "nota", "kuitansi"]
}, {
  id: "faq-reset",
  category: "FAQ: Pengaturan & Sistem",
  tabTarget: "faq",
  title: "FAQ: Cara Reset Total Seluruh Data Pengujian",
  excerpt: "Buka menu Pengaturan -> tombol Reset Semua Data di pojok kanan atas, lalu ketik manual 'RESET ASIA PLASTIK' sebagai konfirmasi keamanan.",
  keywords: ["faq", "reset", "hapus data", "reset asia plastik", "zona bahaya"]
}, {
  id: "faq-ai-ocr",
  category: "FAQ: AI Asisten & Otomasi",
  tabTarget: "faq",
  title: "FAQ: Cara Menggunakan AI Asisten untuk Membaca Foto Invoice / Kuitansi Fisik",
  excerpt: "Lampirkan foto faktur/kuitansi (JPG, PNG, PDF) di menu AI Asisten. AI mengekstrak nomor dokumen, vendor, nominal, dan tanggal tempo secara otomatis.",
  keywords: ["faq", "ai", "ocr", "foto invoice", "struk", "kuitansi", "unggah gambar", "catat otomatis"]
}, {
  id: "faq-ai-duplicate",
  category: "FAQ: AI Asisten & Otomasi",
  tabTarget: "faq",
  title: "FAQ: Cara Meminta AI Mendeteksi & Menghapus Beban Operasional Duplikat",
  excerpt: "Ketik 'cek duplikasi beban' di AI Asisten. AI akan memeriksa kesamaan nominal, tanggal, dan vendor, lalu menawarkan pembersihan data ganda.",
  keywords: ["faq", "ai", "duplikat", "ganda", "beban ganda", "bersihkan duplikasi", "mcp"]
}, {
  id: "faq-ai-shortcut",
  category: "FAQ: AI Asisten & Otomasi",
  tabTarget: "faq",
  title: "FAQ: Cara Membuka Pintasan Dokumen yang Diberikan AI Asisten",
  excerpt: "Setiap kali AI mencatat transaksi, AI menyertakan tombol pintasan biru interaktif yang dapat langsung diklik untuk melihat atau mencetak dokumen.",
  keywords: ["faq", "ai", "shortcut", "tombol pintasan", "buka dokumen"]
}, {
  id: "faq-slash-docs",
  category: "FAQ: Dokumen & Pintasan (/)",
  tabTarget: "faq",
  title: "FAQ: Cara Menyisipkan Pintasan Dokumen dengan Simbol Slash (/) pada Catatan Tugas",
  excerpt: "Ketik '/' pada kolom teks rincian catatan tugas untuk membuka menu pencarian dokumen cepat mencakup PO, Faktur, Surat Jalan, Vendor, Beban, dan Jurnal.",
  keywords: ["faq", "slash", "/", "shortcut", "tugas", "catatan", "sisipkan dokumen", "surat jalan"]
}, {
  id: "faq-slash-shorthand",
  category: "FAQ: Dokumen & Pintasan (/)",
  tabTarget: "faq",
  title: "FAQ: Kata Kunci Singkat (Shorthand) pada Menu Slash (/sj, /vendor, /po, /inv, /exp)",
  excerpt: "Gunakan shorthand seperti /sj untuk logistik, /vendor untuk supplier rekanan, /po untuk pembelian, dan /inv untuk faktur penjualan.",
  keywords: ["faq", "shorthand", "singkatan", "/sj", "/vendor", "/po", "/inv", "/exp", "/jv"]
}, {
  id: "faq-print-page",
  category: "FAQ: Dokumen & Cetak",
  tabTarget: "faq",
  title: "FAQ: Cara Mencetak Dokumen Resmi (PO, Faktur, Surat Jalan) Tanpa Pop-up",
  excerpt: "Klik tombol 'Buka Halaman Penuh & Cetak Dokumen' untuk membuka format cetak beresolusi tinggi yang bersih dan siap cetak via Ctrl+P.",
  keywords: ["faq", "cetak", "print", "pdf", "halaman penuh", "surat jalan", "po"]
}, {
  id: "faq-multicurrency",
  category: "FAQ: Transaksi & Valas",
  tabTarget: "faq",
  title: "FAQ: Cara Melihat Saldo Kas dalam Mata Uang Asing (USD, JPY, CNY, EUR, dll)",
  excerpt: "Buka kartu Total Balance di Dashboard, klik dropdown mata uang, dan gunakan kotak pencarian untuk memilih mata uang internasional.",
  keywords: ["faq", "mata uang", "valas", "usd", "jpy", "cny", "eur", "kurs", "multi-currency"]
}, {
  id: "faq-custom-popup",
  category: "FAQ: Pengaturan & Sistem",
  tabTarget: "faq",
  title: "FAQ: Cara Membuat Notifikasi Pop-up Pengumuman untuk Seluruh Staf",
  excerpt: "Buka menu Pengaturan -> Notifikasi Pop-up Kustom untuk menambah banner pengumuman dengan gambar dan tombol ajakan aksi.",
  keywords: ["faq", "popup", "pengumuman", "notifikasi", "banner", "pengaturan"]
}, {
  id: "faq-audit-trail",
  category: "FAQ: Hak Akses & Audit",
  tabTarget: "faq",
  title: "FAQ: Cara Melacak Riwayat Pengubahan & Persetujuan Dokumen (Audit Trail)",
  excerpt: "Setiap aksi tercatat pada Log Aktivitas yang dapat diakses di masing-masing modul serta widget Dashboard utama.",
  keywords: ["faq", "audit", "log aktivitas", "riwayat", "siapa yang ubah", "keamanan"]
}, {
  id: "faq-offline-sync",
  category: "FAQ: Pengaturan & Sistem",
  tabTarget: "faq",
  title: "FAQ: Apakah Data Transaksi Tersimpan Aman Jika Koneksi Internet Terputus?",
  excerpt: "Sistem didukung sinkronisasi state lokal offline-first, data tersimpan di peramban dan otomatis disinkronkan kembali saat koneksi pulih.",
  keywords: ["faq", "offline", "sinkronisasi", "internet terputus", "keamanan data"]
}, {
  id: "faq-partial-payment",
  category: "FAQ: Transaksi & Pembayaran",
  tabTarget: "faq",
  title: "FAQ: Cara Mencatat Pembayaran Bertahap (Termin / Parsial)",
  excerpt: "Klik tombol Bayar pada faktur, masukkan nominal cicilan yang dibayar, sistem otomatis menghitung sisa piutang dan mengubah status ke Dibayar Sebagian.",
  keywords: ["faq", "termin", "parsial", "cicilan", "bayar sebagian", "sisa piutang"]
}];

// Data Array O (FAQ Categories)
const O = [{
  id: "semua",
  label: "Semua FAQ",
  icon: HelpCircle
}, {
  id: "ai",
  label: "🤖 AI Asisten & OCR",
  icon: Bot
}, {
  id: "slash",
  label: "⌨️ Pintasan Slash (/)",
  icon: Command
}, {
  id: "role",
  label: "🔒 Hak Akses & Approval",
  icon: Shield
}, {
  id: "transaksi",
  label: "💵 Transaksi & Valas",
  icon: DollarSign
}, {
  id: "sistem",
  label: "⚙️ Sistem & Audit",
  icon: Settings
}];

// Data Array I (FAQ Items)
const I = [{
  id: "faq-ai-ocr",
  category: "ai",
  categoryLabel: "AI Asisten & Otomasi",
  badge: "Vision OCR Cerdas",
  badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  q: "Bagaimana cara menggunakan AI Asisten untuk mencatat faktur/invoice dari foto kuitansi?",
  a: "Anda dapat mengunggah foto kuitansi atau invoice fisik langsung ke menu AI Asisten. AI menggunakan model Vision cerdas untuk mengekstrak nomor dokumen, vendor/pemasok, tanggal terbit, jatuh tempo, serta total nilai transaksi secara otomatis tanpa perlu input manual satu per satu.",
  steps: ["Buka menu AI Asisten pada navigasi samping kiri.", "Klik tombol 'Lampirkan Berkas' (ikon klip kertas) atau seret berkas (drag-and-drop) gambar JPG, PNG, atau PDF invoice fisik.", "Ketik instruksi: 'Tolong catatkan transaksi dari foto invoice ini ke sistem', lalu klik Kirim.", "AI akan membaca Purchase Order (nomor PO, vendor, tanggal, nominal, dan gudang tujuan).", "Jika ada rincian yang buram atau tidak lengkap (misal tanggal jatuh tempo tidak tertera), AI akan secara cerdas menanyakan konfirmasi kepada Anda dan menyediakan kartu edit interaktif agar dapat langsung disesuaikan sebelum difinalkan."],
  tip: "Anda dapat langsung mengoreksi data sebelum difinalkan melalui kartu konfirmasi interaktif yang disediakan AI."
}, {
  id: "faq-ai-duplicate",
  category: "ai",
  categoryLabel: "AI Asisten & Otomasi",
  badge: "MCP Pembersih Data",
  badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  q: "Bagaimana cara meminta AI mendeteksi dan menghapus beban atau tagihan operasional yang duplikat?",
  a: "AI Asisten terintegrasi dengan fungsi pembersih data (clean_duplicate_expenses). Anda dapat meminta AI memindai seluruh pencatatan beban operasional atau berkas spreadsheet mutasi rekening untuk mencari rekaman ganda.",
  steps: ["Pada menu AI Asisten, ketik instruksi: 'Cek apakah ada catatan beban operasional yang duplikat di sistem' atau unggah berkas Excel mutasi.", "AI akan memindai rekaman dengan pihak penerima, nominal, dan tanggal yang sama persis (misal tagihan internet atau langganan berulang).", "AI akan melaporkan daftar temuan duplikasi dan merekomendasikan pembersihan dengan menyisakan 1 transaksi yang valid.", "Cukup ketik: 'Hapuskan yang duplikat dan sisakan satu yang valid', maka AI akan mengeksekusi penghapusan rekaman berlebih secara instan."],
  tip: "Pembersihan transaksi duplikat menjaga keakuratan laporan laba rugi dan mencegah pengeluaran kas ganda."
}, {
  id: "faq-ai-shortcut",
  category: "ai",
  categoryLabel: "AI Asisten & Otomasi",
  badge: "Pintasan Interaktif",
  badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  q: "Bagaimana cara membuka pintasan dokumen yang diberikan oleh AI Asisten?",
  a: "Setiap kali AI Asisten mencatat transaksi baru, menemukan faktur bermasalah, atau memberikan saran pembukuan, AI menyertakan tombol pintasan biru interaktif seperti [PO-5703 ↗] atau [INV-4746 ↗].",
  steps: ["Klik tombol pintasan dokumen berwarna biru pada respon obrolan AI.", "Sistem akan langsung membuka halaman rincian transaksi atau halaman cetak resmi dokumen tersebut.", "Anda tidak perlu lagi mencari manual nomor transaksi di tabel modul terkait."]
}, {
  id: "faq-mcp-integration",
  category: "ai",
  categoryLabel: "AI Asisten & Otomasi",
  badge: "MCP API Gateway",
  badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  q: "Bagaimana cara menghubungkan aplikasi ini ke Claude Desktop, Cursor, atau Windsurf via MCP?",
  a: "Sistem menyediakan endpoint Model Context Protocol (MCP) terpadu di URL /api/mcp yang memungkinkan AI Agent eksternal membaca data keuangan, mengecek stok bahan baku, dan membuat draf transaksi secara aman.",
  steps: ["Buka tab '5. Integrasi AI MCP' pada menu Dokumentasi ini.", "Pilih klien AI Anda (Claude Desktop, Cursor, Windsurf, atau Claude Code).", "Salin konfigurasi JSON yang tersedia dan tempelkan ke berkas konfigurasi tools AI Anda.", "AI Agent Anda kini memiliki akses ke 6 fungsi finansial: list_accounts, list_purchase_orders, list_inventory, list_receivables, create_purchase_order, dan clean_duplicate_expenses."],
  tip: "Integrasi MCP mendukung standar SSE dan HTTP POST kompatibel dengan ekosistem AI modern."
}, {
  id: "faq-slash-docs",
  category: "slash",
  categoryLabel: "Pintasan Slash (/)",
  badge: "Autocomplete (/)",
  badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  q: "Bagaimana cara menyisipkan pintasan dokumen menggunakan tombol slash ('/') pada catatan tugas?",
  a: "Fitur slash autocomplete memudahkan Anda menautkan dokumen transaksi ke dalam instruksi kerja atau memo staf tanpa perlu mengetik manual kode dokumen.",
  steps: ["Buka menu Tugas & Catatan, lalu klik tombol '+ Buat Catatan Baru' atau edit catatan yang sudah ada.", "Pada kolom 'Rincian & Instruksi Lengkap', ketik simbol slash '/' di mana saja (misal: 'Harap tindak lanjuti pelunasan /').", "Jendela pop-up pencarian dokumen otomatis akan melayang di bawah kursor Anda.", "Ketik kode dokumen, nama vendor, atau gunakan tombol panah ↑ / ↓ lalu tekan Enter untuk memilih.", "Dokumen akan tersisip rapi dan saat disimpan akan berubah menjadi tombol pintasan biru yang dapat diklik langsung oleh staf."],
  tip: "Dokumen yang disisipkan otomatis dapat diklik untuk membuka rincian atau mencetak berkas."
}, {
  id: "faq-slash-categories",
  category: "slash",
  categoryLabel: "Pintasan Slash (/)",
  badge: "Multi-Kategori Dokumen",
  badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
  q: "Dokumen operasional apa saja yang bisa ditautkan menggunakan tombol slash ('/')?",
  a: "Menu slash picker mendukung seluruh jenis dokumen operasional Asia Plastik, dikelompokkan dalam tab filter interaktif: Pembelian (PO & PR), Penjualan (Faktur INV & SO), Logistik & Ekspedisi (Surat Jalan SJ, Delivery Order DO, Bongkar Gudang BGR), Vendor Rekanan (Data Master Pemasok VND), Beban & Biaya Operasional (EXP), Kas & Bank (Mutasi Rekening MUT & Cek/Giro BG), serta Akuntansi & Produksi (Jurnal JV & SPK).",
  steps: ["🛒 Pembelian: Purchase Order (PO) & Purchase Request (PR)", "📈 Penjualan: Faktur Penjualan (INV) & Sales Order (SO)", "🚚 Logistik & Ekspedisi: Surat Jalan (SJ), Delivery Order (DO), dan Bongkar Gudang (BGR)", "🏢 Vendor Rekanan: Data Master Vendor Rekanan & Supplier Bahan Baku (VND)", "💸 Biaya Operasional: Beban Pabrik & Pengeluaran Kas Kecil (EXP)", "🏛️ Kas & Bank: Mutasi Rekening Bank (MUT) dan Cek / Bilyet Giro (BG)", "📑 Akuntansi: Entri Jurnal Penyesuaian (JV) dan Surat Perintah Kerja (SPK)"]
}, {
  id: "faq-slash-shorthand",
  category: "slash",
  categoryLabel: "Pintasan Slash (/)",
  badge: "Shorthand Cepat",
  badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
  q: "Apakah ada kata kunci singkat (shorthand) saat mengetik tanda slash ('/')?",
  a: "Ya! Anda dapat langsung mengetik singkatan setelah tanda slash untuk menyaring kategori secara instan tanpa perlu mengklik tab:",
  steps: ["/sj atau /log → Langsung memfilter dokumen Logistik & Surat Jalan.", "/vendor atau /vnd → Langsung menyaring direktori master Vendor Pemasok.", "/inv atau /jual → Langsung menampilkan Faktur Penjualan ke Pelanggan.", "/po atau /beli → Langsung menampilkan Pesanan Pembelian Bahan Baku.", "/exp atau /biaya → Langsung menyaring Pengeluaran Beban Pabrik.", "/jv atau /akun → Langsung menyaring Entri Jurnal Akuntansi."],
  tip: "Shorthand mempercepat pengisian instruksi dan memo operasional hingga 3x lipat."
}, {
  id: "faq-print-page",
  category: "slash",
  categoryLabel: "Dokumen & Cetak",
  badge: "Format Cetak Resmi",
  badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  q: "Bagaimana cara mencetak dokumen (PO, Faktur, Surat Jalan) ke format PDF atau cetak fisik?",
  a: "Setiap dokumen memiliki halaman cetak tersendiri tanpa pop-up yang mengganggu. Klik pintasan dokumen terkait atau klik tombol 'Buka Halaman Penuh & Cetak Dokumen'. Format cetak dirancang beresolusi tinggi dengan kop surat resmi Asia Plastik, tabel rincian barang, kolom tanda tangan pihak berwenang, stempel verifikasi, dan barcode dokumen, siap dicetak langsung via printer atau disimpan sebagai PDF (Ctrl + P).",
  tip: "Halaman cetak otomatis menyembunyikan bilah navigasi dan tombol aksi saat dicetak."
}, {
  id: "faq-approve",
  category: "role",
  categoryLabel: "Hak Akses & Approval",
  badge: "Otorisasi Keamanan",
  badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  q: "Kenapa tombol 'Setujui' (Approve) pada dokumen pembelian atau penjualan ada tanda gembok dan tidak bisa diklik?",
  a: "Sesuai prinsip Segregation of Duties dan tata kelola internal, otorisasi transaksi finansial dibatasi hanya untuk pemegang peran Owner dan Finance Manager. Jika Anda masuk dengan peran Accounting Staff atau Staff Gudang, tombol otorisasi akan menampilkan ikon gembok bertuliskan 'Perlu Approval Manager'. Hubungi Manajer Keuangan atau Owner untuk memvalidasi transaksi tersebut.",
  tip: "Prinsip ini melindungi integritas pembukuan dari potensi kekeliruan atau kecurangan pengeluaran kas."
}, {
  id: "faq-role-switch",
  category: "role",
  categoryLabel: "Hak Akses & Approval",
  badge: "Simulasi Multi-Peran",
  badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  q: "Bagaimana cara mengganti peran pengguna untuk keperluan uji coba atau simulasi tim?",
  a: "Anda dapat beralih peran kapan saja dengan mengklik kartu profil pengguna di pojok kiri bawah bilah navigasi (bertuliskan Carlos Susanto / Peran saat ini). Pilih peran yang ingin disimulasikan:",
  steps: ["👑 Owner: Akses tanpa batas ke seluruh modul, otorisasi transaksi, dan pengaturan sistem.", "💼 Finance Manager: Otorisasi PO/faktur, pengelolaan kas bank, rekonsiliasi, dan persetujuan anggaran.", "📊 Accounting Staff: Pencatatan faktur, pembukuan jurnal umum, pajak PPN/PPh, dan beban operasional.", "📦 Warehouse Staff: Pengelolaan stok bahan baku resin, gudang, inventori, dan Work Order produksi."]
}, {
  id: "faq-audit-trail",
  category: "role",
  categoryLabel: "Hak Akses & Approval",
  badge: "Audit Trail",
  badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
  q: "Di mana saya bisa melihat riwayat siapa yang membuat, mengedit, atau menghapus transaksi?",
  a: "Setiap aksi penting (pembuatan, perubahan status, persetujuan, atau penghapusan) dicatat secara otomatis ke dalam Log Audit Perusahaan. Anda dapat melihatnya melalui tombol 'Log Aktivitas' di pojok kanan atas setiap modul, atau memantau linimasa gabungan di kartu Log Aktivitas Perusahaan pada Dashboard utama yang mencantumkan nama staf, waktu kejadian, dan rincian transaksi.",
  tip: "Log audit tidak dapat dimanipulasi atau dihapus sepihak untuk menjamin kepatuhan audit perpajakan."
}, {
  id: "faq-multicurrency",
  category: "transaksi",
  categoryLabel: "Transaksi & Valas",
  badge: "Multi-Currency Valas",
  badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  q: "Bagaimana cara melihat saldo kas dalam mata uang asing (USD, JPY, CNY, EUR, SGD, dll)?",
  a: "Pada kartu Total Balance di Dashboard utama, klik menu dropdown mata uang di sudut kanan atas kartu. Tersedia fitur pencarian cepat (search bar) untuk memilih puluhan mata uang internasional. Sistem akan otomatis mengonversi total saldo kas rupiah ke nominal valas berdasarkan nilai tukar referensi pasar terkini.",
  steps: ["Buka Dashboard utama.", "Pada kartu Total Balance, klik dropdown mata uang (default: IDR).", "Ketik simbol atau nama mata uang pada kotak pencarian (misal: USD, CNY, JPY, EUR, SGD).", "Klik mata uang yang dipilih; angka saldo dan rincian kurs referensi akan diperbarui seketika."]
}, {
  id: "faq-date",
  category: "transaksi",
  categoryLabel: "Transaksi & Valas",
  badge: "Tanggal Transaksi",
  badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  q: "Bagaimana cara mengubah tanggal transaksi jika saya mencatat nota fisik yang terjadi kemarin?",
  a: "Saat mengisi formulir Faktur Penjualan, PO Pembelian, atau Beban Biaya, terdapat kolom isian 'Tanggal Transaksi'. Anda dapat memilih tanggal lampau secara manual sesuai tanggal yang tertera pada nota fisik/kuitansi. Namun untuk mutasi rekening bank yang tersinkronisasi otomatis, timestamp tanggal dikunci demi validitas audit.",
  tip: "Pastikan tanggal transaksi sesuai periode pembukuan berjalan agar laporan laba rugi bulanan akurat."
}, {
  id: "faq-partial-payment",
  category: "transaksi",
  categoryLabel: "Transaksi & Valas",
  badge: "Termin Pembayaran",
  badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
  q: "Bagaimana cara mencatat pembayaran bertahap (termin/parsial) pada faktur penjualan atau pembelian?",
  a: "Klik tombol 'Bayar' pada baris transaksi terkait. Masukkan nominal cicilan atau termin pembayaran pada kolom Jumlah Pembayaran. Sistem akan otomatis memperbarui status menjadi 'Dibayar Sebagian' dan menghitung sisa piutang/utang secara akurat hingga lunas.",
  steps: ["Buka menu Pembelian atau Penjualan.", "Klik tombol 'Bayar' pada faktur yang ingin dicicil.", "Ketik nominal pembayaran termin yang dilakukan.", "Sistem akan mencatat sisa utang/piutang dan mencantumkan persentase pelunasan secara visual."]
}, {
  id: "faq-custom-popup",
  category: "sistem",
  categoryLabel: "Sistem & Pengaturan",
  badge: "Pop-up Pengumuman",
  badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
  q: "Bagaimana cara membuat notifikasi pop-up pengumuman internal yang muncul saat staf membuka aplikasi?",
  a: "Buka menu Settings (Pengaturan) -> tab 'Notifikasi Pop-up Kustom'. Klik tombol 'Tambah Notifikasi Pop-up', tentukan judul pengumuman, pesan operasional, URL banner gambar (opsional), dan teks tombol ajakan (CTA). Anda dapat mengaktifkan/menonaktifkan pop-up kapan saja dan mengatur urutan penayangannya.",
  steps: ["Buka menu Settings & Akses pada bilah navigasi.", "Klik tab 'Notifikasi Pop-up Kustom'.", "Isi judul pengumuman (misal: 'Pemberitahuan Tutup Buku Akhir Tahun').", "Masukkan pesan penjelasan, tautan dokumen, dan tombol aksi.", "Pop-up akan langsung tampil di layar staf saat membuka halaman aplikasi."]
}, {
  id: "faq-offline-sync",
  category: "sistem",
  categoryLabel: "Sistem & Pengaturan",
  badge: "Offline Resilient",
  badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  q: "Apakah data transaksi saya hilang jika koneksi internet kantor tiba-tiba terputus?",
  a: "Tidak. Aplikasi Asia Plastik Finance menggunakan arsitektur cloud dengan sinkronisasi lokal offline-first. Transaksi yang dicatat saat offline tetap tersimpan aman di peramban Anda dan akan secara otomatis tersinkronisasi kembali ke server cloud begitu koneksi internet pulih tanpa risiko kehilangan data.",
  tip: "Penyimpanan lokal menggunakan cache terenkripsi peramban yang terisolasi aman."
}, {
  id: "faq-reset",
  category: "sistem",
  categoryLabel: "Sistem & Pengaturan",
  badge: "Zona Bahaya",
  badgeColor: "bg-red-50 text-red-700 border-red-200",
  q: "Bagaimana cara mengosongkan / mereset seluruh data uji coba tanpa merusak sistem?",
  a: "Buka menu Settings (Pengaturan), gulir ke bagian paling bawah ke kartu 'Zona Bahaya: Reset Seluruh Data Finansial'. Klik tombol Reset Semua Data, lalu ketik secara persis teks konfirmasi 'RESET ASIA PLASTIK' (huruf kapital). Sistem akan membersihkan database kembali ke kondisi awal yang siap pakai.",
  tip: "Aksi reset hanya dapat dilakukan oleh akun dengan peran Owner."
}, {
  id: "faq-export",
  category: "sistem",
  categoryLabel: "Sistem & Pengaturan",
  badge: "Ekspor Spreadsheet",
  badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
  q: "Di mana saya bisa mengekspor laporan keuangan ke format Excel atau spreadsheet CSV?",
  a: "Anda dapat mengklik tombol 'Export Data' / ikon Download di sudut kanan atas Dashboard atau pada bilah navigasi atas. Sistem akan langsung mengunduh file spreadsheet CSV komprehensif yang mencakup saldo seluruh rekening bank, rekap penjualan, utang usaha, dan rincian pengeluaran operasional.",
  steps: ["Klik ikon Download di navigasi atas atau tombol 'Export Laporan' di Dashboard.", "Pilih periode yang diinginkan (Bulan Berjalan, Kuartal, atau Tahunan).", "File spreadsheet .csv akan langsung terunduh dan siap dibuka di Microsoft Excel atau Google Sheets."]
}];

export default function Dokumentasi() {
  const { notify } = useAppContext();
  const { user } = useAuth();
  const role = user?.role ?? "Owner";
  const K = true;
  const [R, L] = useState("alur");
  const [F, _] = useState("");
  const [q, E] = useState("semua");
  const [J, U] = useState("");
  const [H, V] = useState("faq-ai-ocr");
  const [G, Q] = useState("claude-desktop");

  useEffect(() => {
    if (!K && R === "mcp") {
      L("alur");
    }
  }, [K, R]);

  const W = (a, e) => {
      navigator.clipboard.writeText(a), notify && notify(`e disalin ke clipboard.`);
    },
    X = F.trim() ? D.filter(a => {
      if (!K && ("mcp" === a.tabTarget || a.category.toLowerCase().includes("mcp"))) return !1;
      let e = F.toLowerCase();
      return a.title.toLowerCase().includes(e) || a.excerpt.toLowerCase().includes(e) || a.category.toLowerCase().includes(e) || a.keywords.some(a => a.toLowerCase().includes(e));
    }) : [];
  const filteredFaq = I.filter(a => {
          if ("semua" !== q && a.category !== q) return !1;
          if (J.trim()) {
            let e = J.toLowerCase();
            return a.q.toLowerCase().includes(e) || a.a.toLowerCase().includes(e) || a.categoryLabel.toLowerCase().includes(e) || a.badge.toLowerCase().includes(e) || a.steps?.some(a => a.toLowerCase().includes(e));
          }
          return !0;
        });

  return <div className="space-y-6 max-w-6xl mx-auto pb-12"><PageHeader title="Dokumentasi & Panduan Operasional Asia Plastik" description="Panduan lengkap dan praktis bagi staf operasional, manajer, dan pemilik bisnis. Dirancang dengan bahasa sederhana tanpa istilah berbelit agar siapa saja dapat menggunakan aplikasi ini dengan percaya diri." actions={<div className="flex items-center gap-2"><Link to="/" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"><span>Buka Dashboard</span><ArrowRight className="h-3.5 w-3.5 text-slate-400" /></Link></div>} /><div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-blue-600" /><span>Lompat Cepat ke Bagian Panduan:</span></label><div className="relative"><select value={R} onChange={a => {
              let e = a.target.value;
              L(e), _("");
              let n = document.getElementById(`sec-${e}`);
              n && n.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"><option value="alur">1. Alur Siklus Bisnis Manufaktur</option><option value="modul">2. Panduan Tiap Menu (Ke Mana & Ngapain)</option><option value="fundamental">3. Fundamental Finansial Pabrik</option><option value="peran">4. Hak Akses Peran Pengguna (Owner vs Staff)</option>{K && <option value="mcp">5. Integrasi AI Agent (MCP API Gateway & Cara Pakai)</option>}<option value="faq">{K ? "6." : "5."} Tanya Jawab Kendala Umum (FAQ)</option></select><ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" /></div></div><div><label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Search className="h-3.5 w-3.5 text-blue-600" /><span>Cari di Seluruh Dokumentasi:</span></label><div className="relative"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" /><input type="text" value={F} onChange={a => _(a.target.value)} placeholder={K ? "Ketik kata kunci: mcp, api key, tutup buku, po, invoice, pajak, role..." : "Ketik kata kunci: tutup buku, po, invoice, surat jalan, pajak, role..."} className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-16 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-2xs placeholder:text-slate-400" />{F && <button type="button" onClick={() => _("")} className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-200/70 rounded px-1.5 py-0.5">Clear</button>}</div></div></div><div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100"><span className="text-[11px] font-bold text-slate-400 mr-1">Lompat langsung:</span>{[{
          id: "alur",
          label: "1. Alur Siklus Bisnis"
        }, {
          id: "modul",
          label: "2. Panduan Tiap Menu"
        }, {
          id: "fundamental",
          label: "3. Fundamental Finansial"
        }, {
          id: "peran",
          label: "4. Hak Akses Peran"
        }, {
          id: "mcp",
          label: "5. Integrasi AI MCP"
        }, {
          id: "faq",
          label: "6. FAQ Kendala Umum"
        }].map(a => <button key={a.id} type="button" onClick={() => {
          L(a.id);
          let e = document.getElementById(`sec-${a.id}`);
          e && e.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-2xs">{a.label}</button>)}</div></div>{F.trim().length > 0 && <div className="space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">Hasil pencarian untuk:</span><span className="font-bold text-sm text-blue-600">"{F}"</span><span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{X.length} Topik Ditemukan</span></div><button type="button" onClick={() => _("")} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"><X className="h-3 w-3" /><span>Kembali ke Kategori</span></button></div>{0 === X.length ? <Card className="p-8 text-center"><HelpCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" /><div className="text-sm font-bold text-slate-800">Tidak ada topik yang cocok</div><p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">Coba gunakan kata kunci lain seperti <em>mcp, po, faktur, tutup buku, role, kas, approval</em>, atau pilih langsung kategori dari dropdown di atas.</p></Card> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{X.map(a => <div key={a.id} onClick={() => {
          L(a.tabTarget), _(""), setTimeout(() => {
            let e = document.getElementById(`sec-${a.tabTarget}`);
            e && e.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }, 50);
        }} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"><div><div className="flex items-center justify-between mb-2"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{a.category}</span><span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"><span>Buka</span><ArrowRight className="h-3 w-3" /></span></div><h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{a.title}</h4><p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{a.excerpt}</p></div><div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1">{a.keywords.slice(0, 4).map(a => <span key={a} className="text-[10px] text-slate-400">#{a}</span>)}</div></div>)}</div>}</div>}<div className="space-y-12"><section id="sec-alur" className="space-y-6 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">1</span><div><h2 className="text-base font-bold text-slate-900">Alur Siklus Bisnis Manufaktur Asia Plastik</h2><p className="text-xs text-slate-500">Dari pengadaan bahan baku resin, ekstrusi blowing, hingga penagihan piutang</p></div></div><Card><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Layers className="h-5 w-5" /></div><div><h3 className="text-base font-bold text-slate-900">Gambaran Besar: Dari Beli Bahan Baku Sampai Uang Masuk</h3><p className="mt-1 text-xs text-slate-600 leading-relaxed">Asia Plastik bergerak di bidang manufaktur plastik (kantong kresek, roll plastik HDPE, lembaran PP, dan plastik cor LDPE). Semua pencatatan di aplikasi ini mengikuti alur barang fisik dan arus uang kas yang sebenarnya.</p></div></div><div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-blue-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700">1</span><span>Pengadaan Bahan Baku</span></div><h4 className="mt-2 text-sm font-bold text-slate-900">Pembelian & Vendor</h4><p className="mt-1 text-xs text-slate-600 leading-relaxed">Pabrik memesan biji plastik dari vendor supplier (contoh: PT Duta Polimer). Catat Purchase Order (PO) di menu <strong>Pembelian</strong>. Saat barang datang dan disetujui manajer, PO berubah status jadi tagihan siap bayar.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-blue-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700">2</span><span>Gudang & Produksi</span></div><h4 className="mt-2 text-sm font-bold text-slate-900">Inventori & Pabrik</h4><p className="mt-1 text-xs text-slate-600 leading-relaxed">Biji plastik masuk ke stok gudang. Bagian produksi menjalankan mesin *blowing* dan *cutting* dengan Surat Perintah Kerja (Work Order). Pantau sisa bahan dan stok barang jadi di menu <strong>Inventori</strong>.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-blue-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700">3</span><span>Penjualan & Penagihan</span></div><h4 className="mt-2 text-sm font-bold text-slate-900">Penjualan & Faktur</h4><p className="mt-1 text-xs text-slate-600 leading-relaxed">Barang jadi dikirim ke distributor atau toko plastik. Terbitkan Faktur Penjualan di menu <strong>Penjualan</strong> lengkap dengan PPN 11%. Piutang tercatat dan sistem memantau tanggal jatuh tempo pembayaran.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-blue-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700">4</span><span>Penerimaan & Arus Kas</span></div><h4 className="mt-2 text-sm font-bold text-slate-900">Kas & Bank</h4><p className="mt-1 text-xs text-slate-600 leading-relaxed">Customer melunasi tagihan melalui transfer rekening bank (BCA, Mandiri, dll.). Mutasi bank tercatat di menu <strong>Kas & Bank</strong>, dan status faktur berubah otomatis menjadi Lunas.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-blue-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700">5</span><span>Pencocokan Rekening</span></div><h4 className="mt-2 text-sm font-bold text-slate-900">Rekonsiliasi Bank</h4><p className="mt-1 text-xs text-slate-600 leading-relaxed">Cocokkan catatan mutasi sistem dengan rekening koran bank yang sebenarnya di menu <strong>Rekonsiliasi</strong>. Fitur Smart Match mencocokkan angka otomatis agar tidak ada selisih saldo.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-blue-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700">6</span><span>Kepatuhan Pajak</span></div><h4 className="mt-2 text-sm font-bold text-slate-900">Pajak & DJP Coretax</h4><p className="mt-1 text-xs text-slate-600 leading-relaxed">Setiap faktur penjualan menghasilkan PPN Keluaran dan faktur pembelian menghasilkan PPN Masukan. Rekap faktur pajak siap diekspor dan dilaporkan ke sistem DJP Coretax di menu <strong>Perpajakan</strong>.</p></div></div></Card></section><section id="sec-modul" className="space-y-5 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">2</span><div><h2 className="text-base font-bold text-slate-900">Panduan Lengkap Tiap Menu (Ke Mana & Ngapain)</h2><p className="text-xs text-slate-500">Petunjuk langkah demi langkah pengisian form transaksi di setiap menu</p></div></div><div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900"><strong>Petunjuk Navigasi:</strong> Di bawah ini adalah petunjuk langkah demi langkah ke mana Anda harus mengklik dan apa yang harus diisi saat menjalankan tugas harian di aplikasi.</div><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">01</div><div><h4 className="text-sm font-bold text-slate-900">Dashboard (Overview)</h4><p className="text-[11px] text-slate-500">Menu utama: Ringkasan kondisi kesehatan finansial harian</p></div></div><Link to="/" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Apa yang bisa Anda lakukan di sini?</strong></p><ul className="list-disc pl-5 space-y-1 text-slate-600"><li><strong>Melihat Saldo Kas & Bank:</strong> Kartu hitam di kiri atas menampilkan total uang riil yang tersedia di seluruh rekening (BCA, Mandiri, Valas USD, Kas Pabrik).</li><li><strong>Mengatur Rentang Tanggal:</strong> Klik tombol tanggal di kanan atas (misal: <em>Nov 1, 2026 – Nov 13, 2026</em>). Anda bisa memilih preset cepat (Bulan Ini, 7 Hari, Tahun Ini) atau memasukkan tanggal kustom manual. Seluruh angka di layar akan otomatis menyesuaikan dengan periode yang Anda pilih.</li><li><strong>Mengunduh Ringkasan Finansial:</strong> Klik ikon Download di sudut kanan atas grafik atau di navigasi atas untuk langsung mengunduh file spreadsheet CSV yang berisi saldo kas, penjualan, utang, dan laba bersih.</li><li><strong>Memeriksa Dokumen Menunggu Persetujuan:</strong> Jika ada faktur atau pesanan pembelian yang butuh approval manajer, daftarnya langsung muncul di bagian tabel tengah.</li></ul></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">02</div><div><h4 className="text-sm font-bold text-slate-900">Kas & Bank</h4><p className="text-[11px] text-slate-500">Pengelolaan rekening perbankan, mutasi masuk/keluar, dan valas</p></div></div><Link to="/kas-bank" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional:</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Melihat Saldo Bank vs Saldo Buku:</strong> Saldo Bank adalah angka menurut mutasi rekening koran; Saldo Buku adalah angka menurut pembukuan kas Anda. Selisihnya harus diselesaikan di menu Rekonsiliasi.</li><li><strong>Transfer Uang Antar-Rekening:</strong> Klik tombol <em>+ Catat Mutasi / Transfer</em>, pilih rekening asal (misal BCA Giro), rekening tujuan (misal Kas Kecil Pabrik), masukkan nominal, lalu simpan.</li><li><strong>Mode Rekening Fiktif (Sandbox):</strong> Jika bank Anda belum terintegrasi API otomatis, Anda bisa membuat rekening atau kartu kredit simulasi di menu Pengaturan lengkap dengan detail CVV dan masa berlaku.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">03</div><div><h4 className="text-sm font-bold text-slate-900">Pembelian & Tagihan Vendor</h4><p className="text-[11px] text-slate-500">Pemesanan biji plastik, utang usaha, dan master supplier</p></div></div><Link to="/pembelian" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional:</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Mendaftarkan & Mengelola Vendor (CUD):</strong> Buka tab <em>Daftar Vendor</em> untuk mengelola data master, edit profil, ubah status aktif, dan hapus vendor, atau buka langsung tab <em>+ Tambah Vendor</em> untuk mendaftarkan supplier baru lengkap dengan rekening bank pembayaran, nomor NPWP, dan termin bayar (Net 30/COD).</li><li><strong>Menerbitkan Pesanan Pembelian (PO):</strong> Klik <em>+ Buat Pembelian Baru</em>, pilih vendor yang telah terdaftar, pilih tanggal transaksi fisik (bisa diatur sesuai tanggal nota), dan masukkan nominal. PO akan masuk ke status <em>Menunggu Approval</em>.</li><li><strong>Menyetujui PO:</strong> Hanya akun dengan peran Finance Manager atau Owner yang memiliki tombol <em>Setujui</em>. Akun staff akan melihat indikator <em>Perlu Approval Manager</em>.</li><li><strong>Membayar Tagihan:</strong> Setelah disetujui, klik tombol <em>Bayar</em> pada PO yang berstatus Belum Dibayar, pilih rekening bank pembayar, dan saldo kas Anda akan otomatis terpotong.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">04</div><div><h4 className="text-sm font-bold text-slate-900">Invoices & Penjualan</h4><p className="text-[11px] text-slate-500">Penerbitan tagihan ke pelanggan, piutang usaha, dan surat jalan</p></div></div><Link to="/penjualan" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional:</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Menerbitkan Faktur Baru:</strong> Klik tombol biru <em>+ Tambah Transaksi Penjualan</em>. Pilih tipe (Faktur Penjualan, Proforma, atau Pesanan Penjualan), isi nama pembeli, atur <em>Tanggal Faktur</em> dan <em>Tanggal Jatuh Tempo</em>, lalu masukkan nominal barang.</li><li><strong>Perhitungan PPN Otomatis:</strong> Sistem otomatis menghitung DPP (Dasar Pengenaan Pajak) dan PPN 11%. Anda bisa memilih apakah harga yang diinput sudah termasuk pajak (*tax inclusive*) atau belum.</li><li><strong>Mencatat Pelunasan Tagihan:</strong> Saat pembeli mentransfer pembayaran, klik tombol <em>Terima Bayar</em> pada faktur yang bersangkutan, pilih rekening bank yang menerima uang, dan status faktur otomatis menjadi Lunas.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">05</div><div><h4 className="text-sm font-bold text-slate-900">Budgeting & Biaya Operasional</h4><p className="text-[11px] text-slate-500">Pengeluaran rutin pabrik: PLN, solar genset, sparepart, dan gaji</p></div></div><Link to="/biaya-anggaran" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional:</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Mencatat Pengeluaran Baru:</strong> Klik <em>+ Catat Biaya Baru</em>, pilih tanggal kuitansi, pilih kategori (misal: Beban Operasional Kantor, Beban Pemeliharaan Mesin), isi penerima uang (misal: PT PLN Persero), dan masukkan nominal.</li><li><strong>Memasang Batas Anggaran (Budget Cap):</strong> Di bagian bawah terdapat tabel anggaran per departemen (Pabrik Cikarang, Gudang Surabaya, Kantor Pusat). Jika pengeluaran mendekati 100%, sistem akan memberikan peringatan visual agar pengeluaran tidak jebol.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">06</div><div><h4 className="text-sm font-bold text-slate-900">Inventori & Gudang Pabrik</h4><p className="text-[11px] text-slate-500">Stok biji plastik, barang jadi, dan Surat Perintah Kerja (WO)</p></div></div><Link to="/inventori-produksi" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional:</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Melihat Stok per Gudang:</strong> Anda bisa memantau stok biji plastik HDPE, lembaran PP, dan plastik cor di Gudang Cikarang, Gudang Surabaya, dan Bandung secara terpisah.</li><li><strong>Perintah Kerja (Work Order):</strong> Buka tab <em>Perintah Kerja (WO)</em> untuk melihat target produksi mesin (misal: target 1.000 roll kantong plastik). Perbarui jumlah selesai saat proses pabrikasi selesai.</li><li><strong>Peringatan Titik Pesan Ulang (Reorder Point):</strong> Jika stok fisik berada di bawah batas minimum (reorderMin), sistem menandai baris tersebut agar bagian pengadaan segera memesan bahan baku ke vendor sebelum mesin berhenti bekerja.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">07</div><div><h4 className="text-sm font-bold text-slate-900">Akuntansi, Jurnal Umum & Tutup Buku</h4><p className="text-[11px] text-slate-500">Bagan akun (CoA), jurnal penyesuaian, PPh 29, dan closing periode bulanan/tahunan</p></div></div><Link to="/akuntansi" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional Tutup Buku (Period Closing):</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Memilih Cakupan Periode:</strong> Buka tab <em>Tutup Buku</em> di menu Akuntansi. Tentukan apakah Anda ingin melakukan <em>Tutup Buku Bulanan (Month-End)</em> atau <em>Tutup Buku Tahunan (Year-End)</em>, lalu tetapkan tanggal cut-off fisik buku.</li><li><strong>Pemeriksaan Angka Finansial:</strong> Sistem otomatis merekap realisasi Penjualan Bersih, HPP Pembelian, dan Beban Operasional untuk menghasilkan Laba Sebelum Pajak (EBT), estimasi tarif PPh 29 Badan (22%), dan Laba Ditahan Bersih.</li><li><strong>Verifikasi 5-Point Checklist Audit:</strong> Pastikan seluruh mutasi bank sudah cocok (status terekonsiliasi), faktur penjualan dan tagihan vendor telah tercatat, beban depresiasi mesin telah dihitung, dan Neraca dalam posisi seimbang (Debit = Kredit).</li><li><strong>Eksekusi Tutup Buku:</strong> Klik tombol <em>Eksekusi Tutup Buku</em>. Sistem secara otomatis menerbitkan Jurnal Penutup resmi (kode <code>JV-CLOSE-...</code>), memindahkan laba periode berjalan ke akun Laba Ditahan (<code>3-20000</code>), mencatat riwayat permanen di database sistem, dan mengunci transaksi buku.</li><li><strong>Buka Kembali Periode (Re-Open):</strong> Jika terdapat salah catat yang mendesak, pengguna dengan peran <strong>Owner</strong> memiliki wewenang khusus untuk membuka kunci periode dengan mencantumkan alasan tertulis di Jejak Audit.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">08</div><div><h4 className="text-sm font-bold text-slate-900">Pusat Persetujuan (Approval Center) & Workflow</h4><p className="text-[11px] text-slate-500">Antrean otorisasi dokumen lintas modul (PO, Faktur, dan Klaim Beban)</p></div></div><Link to="/pengaturan" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed"><p><strong>Langkah Operasional Approval:</strong></p><ol className="list-decimal pl-5 space-y-1 text-slate-600"><li><strong>Pengecekan Antrean Dokumen:</strong> Buka menu <em>Pengaturan</em> lalu pilih tab <em>Pusat Persetujuan (Approval)</em>{". Di sini berkumpul semua dokumen yang tertahan di atas ambang batas (PO bahan baku > Rp 50jt, Faktur Penjualan plafon kredit > Rp 100jt, Reimbursement operasional > Rp 5jt)."}</li><li><strong>Menyetujui atau Menolak Dokumen:</strong> Akun <strong>Finance Manager</strong> dan <strong>Owner</strong> dapat langsung mengklik tombol <em>Setujui</em> untuk mengaktifkan dokumen menjadi tagihan/PO aktif, atau <em>Tolak</em> dengan memasukkan alasan penolakan tertulis.</li><li><strong>Setujui Semua Sekaligus:</strong> Manajer dan Pemilik dapat memanfaatkan tombol <em>Setujui Semua</em> untuk menyetujui seluruh antrean dokumen yang telah diverifikasi dalam 1 klik.</li><li><strong>Batasan Wewenang Staf:</strong> Akun staff (Accounting Staff, Staff Gudang, Banker) hanya dapat melihat status antrean tanpa tombol aksi approval (terkunci dengan tanda gembok), menjamin prinsip pemisahan tugas (segregation of duties).</li><li><strong>Riwayat Jejak Audit Persetujuan:</strong> Buka sub-tab <em>Riwayat Audit Persetujuan</em> untuk memantau histori siapa yang menyetujui, tanggal otorisasi, dan alasan penolakan secara transparan.</li></ol></div></Card><Card><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">09</div><div><h4 className="text-sm font-bold text-slate-900">Tugas & Catatan Tim (Fitur Pintasan Dokumen via Slash Command '/')</h4><p className="text-[11px] text-slate-500">Pusat komando memo kerja, audit anomali pembukuan, dan autolink dokumen interaktif</p></div></div><Link to="/tugas" className="text-xs font-bold text-blue-600 hover:underline">Buka Menu →</Link></div><div className="mt-4 space-y-4 text-xs text-slate-700 leading-relaxed"><div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-2"><div className="flex items-center gap-2 font-bold text-blue-900 text-sm"><Sparkles className="h-4 w-4 text-blue-600" /><span>Cara Membuat Tombol Pintasan Dokumen di Tengah Teks Catatan</span></div><p className="text-blue-800 leading-relaxed">Saat Anda menulis instruksi kerja, Anda tidak perlu repot menyalin tautan URL manual atau membuka banyak tab. Cukup sebutkan dokumen yang bersangkutan, dan sistem akan langsung mengubahnya menjadi <strong>tombol chip interaktif</strong> yang dapat diklik langsung menuju dokumen resmi siap cetak!</p></div><div><h5 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-wide">Tiga (3) Cara Mudah Menyisipkan Dokumen:</h5><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5"><div className="flex items-center gap-1.5 font-bold text-slate-900"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">1</span><span>Ketik Simbol Slash '/'</span></div><p className="text-slate-600 text-[11px] leading-relaxed">Ketik tanda <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-blue-600">/</code> di mana saja saat mengetik kalimat. Popover cerdas akan muncul otomatis menampilkan daftar seluruh PO, Faktur, SPK, dan Mutasi Bank. Ketik lanjut untuk memfilter (misal: <code>/PO</code> atau <code>/4746</code>), lalu tekan <strong>Enter</strong> atau klik untuk memilih.</p></div><div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5"><div className="flex items-center gap-1.5 font-bold text-slate-900"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">2</span><span>Ketik Nomor Dokumen Langsung</span></div><p className="text-slate-600 text-[11px] leading-relaxed">Anda bisa langsung mengetik kode dokumen resmi di tengah kalimat biasa (contoh: <strong className="text-slate-800">PO-5703</strong>, <strong className="text-slate-800">INV-4746</strong>, <strong className="text-slate-800">EXP-2025-002</strong>, atau <strong className="text-slate-800">MUT-2026-001</strong>). Sistem otomatis mendeteksi pola nomor tersebut dan mengonversinya menjadi tombol chip.</p></div><div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5"><div className="flex items-center gap-1.5 font-bold text-slate-900"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">3</span><span>Tombol Toolbar & Chip Cepat</span></div><p className="text-slate-600 text-[11px] leading-relaxed">Di atas kotak teks terdapat tombol biru <strong>+ Sisipkan Dokumen (Ketik /)</strong> dan tombol pil pintasan cepat dokumen terkini. Sekali klik akan menyisipkan nomor dokumen langsung ke posisi kursor Anda.</p></div></div></div><div><h5 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-wide">Awalan (Prefix) Dokumen yang Otomatis Dikenali:</h5><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]"><div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50"><span className="font-bold text-amber-900 font-mono">PO-xxxx / PR-xxxx</span><div className="text-slate-500 text-[10px] mt-0.5">Pesanan Pembelian / Request Vendor</div></div><div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50"><span className="font-bold text-blue-900 font-mono">INV-xxxx / SJ-xxxx</span><div className="text-slate-500 text-[10px] mt-0.5">Faktur Penjualan & Surat Jalan</div></div><div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50"><span className="font-bold text-purple-900 font-mono">EXP-xxxx / BIAYA-xxxx</span><div className="text-slate-500 text-[10px] mt-0.5">Beban Operasional & Reimbursement</div></div><div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50"><span className="font-bold text-emerald-900 font-mono">MUT-xxxx / BG-xxxx</span><div className="text-slate-500 text-[10px] mt-0.5">Mutasi Kas/Bank & Bilyet Giro</div></div></div></div><div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2"><span className="font-bold text-slate-800 text-xs">Contoh Tampilan Nyata di Lapangan:</span><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]"><div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1"><div className="font-bold text-slate-400 text-[10px] uppercase">Teks yang Anda Ketik:</div><p className="font-mono text-slate-700 text-xs">Eliminasi double entry (hapus /EXP-2025-002 agar tidak ganda dengan PO-5703). Koreksi pelanggan pada faktur /INV-4746.</p></div><div className="p-3 rounded-xl bg-white border border-blue-300 shadow-2xs space-y-1"><div className="font-bold text-blue-600 text-[10px] uppercase">Hasil Tampilan Interaktif di Layar:</div><p className="text-slate-800 text-xs leading-relaxed">Eliminasi double entry (hapus <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold border border-blue-200 text-[11px]"><Receipt className="h-3 w-3" /> EXP-2025-002 <Check className="h-2.5 w-2.5" /></span> agar tidak ganda dengan <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold border border-blue-200 text-[11px]"><Receipt className="h-3 w-3" /> PO-5703 <Check className="h-2.5 w-2.5" /></span>). Koreksi pelanggan pada faktur <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[11px]"><Receipt className="h-3 w-3" /> INV-4746 <Check className="h-2.5 w-2.5" /></span>.</p></div></div></div></div></Card></section><section id="sec-fundamental" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">3</span><div><h2 className="text-base font-bold text-slate-900">Fundamental Finansial Pabrik Plastik</h2><p className="text-xs text-slate-500">Konsep omset vs arus kas, piutang macet, dan perputaran modal kerja</p></div></div><Card><h3 className="text-base font-bold text-slate-900">Konsep Finansial Dasar (Diterangkan dengan Sederhana)</h3><p className="mt-1 text-xs text-slate-600 leading-relaxed">Anda tidak perlu gelar akuntansi untuk memahami angka-angka di aplikasi ini. Berikut adalah aturan main finansial pabrik plastik yang wajib dipahami seluruh tim.</p><div className="mt-6 space-y-6 divide-y divide-slate-100"><div className="pt-4 first:pt-0"><div className="flex items-center gap-2"><span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Prinsip 1</span><h4 className="text-sm font-bold text-slate-900">Uang Kas (Cashflow) Tidak Sama dengan Laba (Profit)</h4></div><p className="mt-2 text-xs text-slate-600 leading-relaxed">Banyak pengusaha pemula mengira jika di laporan laba rugi tertulis untung Rp 100 juta, maka ada uang Rp 100 juta di rekening bank. <strong>Kenyataannya tidak selalu begitu.</strong></p><div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1"><p><strong>Contoh Pabrik Plastik:</strong></p><p>Anda menjual 1.000 roll kantong kresek senilai Rp 100 juta dengan modal Rp 70 juta. Di atas kertas, laba Anda Rp 30 juta. Namun jika pelanggan meminta tempo pembayaran 30 hari (Net 30), uang tunai di kas Anda saat ini adalah <strong>Rp 0</strong>. Jika di saat yang sama Anda harus membayar tagihan listrik PLN sebesar Rp 35 juta minggu ini, kas Anda akan minus jika tidak mengelola arus kas dengan disiplin.</p></div></div><div className="pt-4"><div className="flex items-center gap-2"><span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Prinsip 2</span><h4 className="text-sm font-bold text-slate-900">Cara Hitung DPP dan PPN 11% yang Benar</h4></div><p className="mt-2 text-xs text-slate-600 leading-relaxed">PPN di Indonesia saat ini bertarif 11%. Dasar Pengenaan Pajak (DPP) adalah harga murni barang sebelum dikenakan pajak.</p><div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="font-bold text-slate-800">Kasus A: Harga Belum Termasuk PPN</div><p className="mt-1 text-slate-600">Harga biji plastik: Rp 100.000.000</p><p className="text-slate-600">PPN (11%): Rp 11.000.000</p><p className="font-semibold text-blue-700 mt-1">Total yang dibayar: Rp 111.000.000</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="font-bold text-slate-800">Kasus B: Harga Sudah Termasuk PPN (Inclusive)</div><p className="mt-1 text-slate-600">Total faktur disepakati: Rp 111.000.000</p><p className="text-slate-600">DPP = Rp 111.000.000 ÷ 1,11 = Rp 100.000.000</p><p className="font-semibold text-blue-700 mt-1">PPN = DPP × 11% = Rp 11.000.000</p></div></div></div><div className="pt-4"><div className="flex items-center gap-2"><span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Prinsip 3</span><h4 className="text-sm font-bold text-slate-900">Kenapa Harus Melakukan Rekonsiliasi Bank?</h4></div><p className="mt-2 text-xs text-slate-600 leading-relaxed">Rekonsiliasi adalah proses mencocokkan mutasi di buku catatan kas internal dengan mutasi rekening koran dari bank. Perbedaan sering terjadi karena 3 hal wajar:</p><ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-slate-600"><li><strong>Biaya Administrasi & Pajak Bunga Bank:</strong> Bank memotong biaya admin bulanan secara otomatis tanpa ada pemberitahuan nota fisik ke kantor Anda.</li><li><strong>Setoran Gantung (Deposit in Transit):</strong> Pelanggan mentransfer uang melalui kliring antar-bank pada hari Jumat sore, uang baru masuk ke rekening perusahaan pada hari Senin pagi.</li><li><strong>Giro Belum Cair:</strong> Anda sudah mencatat pembayaran dengan cek/giro, tetapi supplier belum mencairkannya ke bank.</li></ul></div><div className="pt-4"><div className="flex items-center gap-2"><span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Prinsip 4</span><h4 className="text-sm font-bold text-slate-900">Menghitung HPP (Harga Pokok Penjualan) Plastik</h4></div><p className="mt-2 text-xs text-slate-600 leading-relaxed">HPP menentukan harga jual terendah agar pabrik tidak rugi. Rumus dasarnya adalah:</p><div className="mt-2 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900 font-mono">HPP per Kg = Harga Biji Plastik per Kg + Biaya Listrik Mesin per Kg + Upah Operator per Kg + Biaya Kemasan</div><p className="mt-2 text-xs text-slate-600">Jika biji plastik Rp 20.000/kg, listrik mesin Rp 2.500/kg, dan upah operator Rp 1.500/kg, maka HPP Anda adalah Rp 24.000/kg. Menjual di bawah angka ini berarti pabrik sedang mensubsidi pembeli.</p></div></div></Card></section><section id="sec-peran" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">4</span><div><h2 className="text-base font-bold text-slate-900">Hak Akses & Otorisasi Pengguna (Owner vs Staff)</h2><p className="text-xs text-slate-500">Penjelasan batasan peran dan hierarki persetujuan approval dokumen</p></div></div><Card><h3 className="text-base font-bold text-slate-900">Aturan Hak Akses Pengguna (Role-Based Access Control)</h3><p className="mt-1 text-xs text-slate-600 leading-relaxed">Untuk mencegah penyalahgunaan wewenang dan menjaga keamanan kas perusahaan, setiap anggota tim hanya diberikan wewenang sesuai pekerjaannya masing-masing.</p><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold"><tr><th className="px-4 py-3">Peran (Role)</th><th className="px-4 py-3">Siapa Saja?</th><th className="px-4 py-3">Bisa Melakukan Apa?</th><th className="px-4 py-3">Batasan Ketat</th></tr></thead><tbody className="divide-y divide-slate-100 text-slate-600"><tr className="hover:bg-slate-50/70"><td className="px-4 py-3 font-bold text-slate-900">Owner (Pemilik)</td><td className="px-4 py-3 font-mono text-blue-600">Akun Terdaftar (Owner)</td><td className="px-4 py-3">Akses 100% penuh tanpa batas ke seluruh 11 menu, menyetujui transaksi, mengundang user baru, dan reset data.</td><td className="px-4 py-3 text-emerald-600 font-semibold">Tidak ada batasan</td></tr><tr className="hover:bg-slate-50/70"><td className="px-4 py-3 font-bold text-slate-900">Finance Manager</td><td className="px-4 py-3">Manajer Keuangan & Akunting</td><td className="px-4 py-3">Akses penuh ke seluruh modul aplikasi, menyetujui (Approve) PO dan faktur, melihat laporan laba rugi.</td><td className="px-4 py-3 text-rose-600 font-semibold">Tidak bisa mengundang (invite) user baru & tidak bisa reset data database.</td></tr><tr className="hover:bg-slate-50/70"><td className="px-4 py-3 font-bold text-slate-900">Accounting Staff</td><td className="px-4 py-3">Staf Administrasi & Kasir</td><td className="px-4 py-3">Bisa membuat, mengedit, dan menghapus (CUD) faktur, PO, biaya, dan jurnal harian.</td><td className="px-4 py-3 text-rose-600 font-semibold">Tidak memiliki tombol Approve & tidak bisa membuka menu Pengaturan.</td></tr><tr className="hover:bg-slate-50/70"><td className="px-4 py-3 font-bold text-slate-900">Restricted Banker</td><td className="px-4 py-3">Staf Perbendaharaan / Bank</td><td className="px-4 py-3">Mencatat mutasi bank, cek saldo kaslink, mengelola kartu kredit sandbox, dan melakukan rekonsiliasi.</td><td className="px-4 py-3 text-rose-600 font-semibold">Tidak memiliki akses ke gudang, produksi, jurnal pembukuan internal, dan perpajakan.</td></tr><tr className="hover:bg-slate-50/70"><td className="px-4 py-3 font-bold text-slate-900">Staff Gudang</td><td className="px-4 py-3">Kepala Gudang & Logistik</td><td className="px-4 py-3">Mencatat stok biji plastik, stok kantong jadi, kartu opname, dan verifikasi barang masuk dari PO vendor.</td><td className="px-4 py-3 text-rose-600 font-semibold">Tidak memiliki akses ke rekening bank, jurnal akuntansi, dan faktur pajak.</td></tr></tbody></table></div></Card></section>{K && <section id="sec-mcp" className="space-y-6 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex items-center gap-2.5 pb-2 border-b border-slate-200"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-2xs">5</span><div><h2 className="text-base font-bold text-slate-900">Integrasi AI Agent (MCP API Gateway & Cara Pakai)</h2><p className="text-xs text-slate-500">Panduan menghubungkan Claude Desktop, Cursor, Windsurf, dan Claude Code ke API MCP</p></div></div><Card><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Bot className="h-5 w-5" /></div><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-bold text-slate-900">Model Context Protocol (MCP) untuk AI Agent</h3><span className="text-xs font-semibold text-blue-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /><span>Aktif & Siap Pakai</span></span></div><p className="mt-1 text-xs text-slate-600 leading-relaxed">Aplikasi Asia Plastik menyediakan server API berstandar Model Context Protocol (MCP) untuk menghubungkan agen AI langsung ke sistem keuangan pabrik secara aman dan terprogram.</p></div></div><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"><div className="flex items-center justify-between mb-1.5"><span className="font-bold text-slate-700 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-600" /><span>URL Endpoint MCP:</span></span><span className="font-mono text-[10px] text-slate-500 font-semibold">HTTP POST</span></div><div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 font-mono text-[11px] text-blue-700"><span className="truncate">https://finance-blond-psi.vercel.app/api/mcp</span><button type="button" onClick={() => W("https://finance-blond-psi.vercel.app/api/mcp", "URL Endpoint MCP")} className="ml-2 flex items-center gap-1 text-slate-500 hover:text-slate-900 shrink-0 font-sans"><Copy className="h-3.5 w-3.5" /><span>Salin</span></button></div></div><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"><div className="flex items-center justify-between mb-1.5"><span className="font-bold text-slate-700 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-blue-600" /><span>Autentikasi & API Key:</span></span><Link to="/pengaturan" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"><span>Buka Pengaturan</span><ExternalLink className="h-2.5 w-2.5" /></Link></div><p className="text-[11px] text-slate-600 leading-relaxed">Endpoint diamankan dengan header <code>{"Authorization: Bearer <API_KEY>"}</code>. Buat atau salin API Key Anda melalui menu Pengaturan.</p></div></div></Card><Card><div className="flex items-center gap-2 mb-2"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">1</div><h4 className="text-sm font-bold text-slate-900">Cara Menggabungkan MCP ke Aplikasi Agent Anda</h4></div><p className="text-xs text-slate-600 leading-relaxed mb-4">Pilih klien atau aplikasi AI yang Anda gunakan di bawah ini untuk melihat format konfigurasi JSON yang harus disalin.</p><div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-4">{[{
              id: "claude-desktop",
              label: "Claude Desktop"
            }, {
              id: "cursor",
              label: "Cursor IDE"
            }, {
              id: "windsurf",
              label: "Windsurf IDE"
            }, {
              id: "claude-code",
              label: "Claude Code CLI"
            }, {
              id: "curl",
              label: "cURL & Python Script"
            }].map(a => <button key={a.id} type="button" onClick={() => Q(a.id)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${G === a.id ? "bg-blue-600 text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}>{a.label}</button>)}</div>{"claude-desktop" === G && <div className="space-y-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 leading-relaxed"><p className="font-semibold text-slate-800">Lokasi File Konfigurasi Claude Desktop:</p><ul className="mt-1 list-disc pl-5 text-slate-600 space-y-0.5 text-[11px] font-mono"><li>Windows: <code>%APPDATA%\Claude\claude_desktop_config.json</code></li><li>macOS: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></li></ul></div><div className="relative rounded-xl border border-blue-200 bg-blue-50/40 p-4 font-mono text-[11px] text-slate-800"><button type="button" onClick={() => W(`{
  "mcpServers": {
    "asia-plastik-finance": {
      "url": "https://finance-blond-psi.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer isi_api_key_disini"
      }
    }
  }
}`, "Konfigurasi Claude Desktop")} className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"><Copy className="h-3 w-3" /><span>Salin JSON</span></button><pre className="overflow-x-auto whitespace-pre leading-relaxed">{`{
  "mcpServers": {
    "asia-plastik-finance": {
      "url": "https://finance-blond-psi.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer isi_api_key_disini"
      }
    }
  }
}`}</pre></div></div>}{"cursor" === G && <div className="space-y-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 leading-relaxed"><p className="font-semibold text-slate-800">Cara Konfigurasi di Cursor IDE:</p><p className="mt-1 text-[11px] text-slate-600">Buat file <code>.cursor/mcp.json</code> di folder workspace proyek Anda:</p></div><div className="relative rounded-xl border border-blue-200 bg-blue-50/40 p-4 font-mono text-[11px] text-slate-800"><button type="button" onClick={() => W(`{
  "mcpServers": {
    "asia-plastik-finance": {
      "url": "https://finance-blond-psi.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer isi_api_key_disini"
      }
    }
  }
}`, "Konfigurasi Cursor MCP")} className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"><Copy className="h-3 w-3" /><span>Salin JSON</span></button><pre className="overflow-x-auto whitespace-pre leading-relaxed">{`{
  "mcpServers": {
    "asia-plastik-finance": {
      "url": "https://finance-blond-psi.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer isi_api_key_disini"
      }
    }
  }
}`}</pre></div></div>}{"windsurf" === G && <div className="space-y-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 leading-relaxed"><p className="font-semibold text-slate-800">Lokasi Konfigurasi Windsurf Cascade:</p><p className="mt-1 text-[11px] text-slate-600">Buka file <code>~/.codeium/windsurf/mcp_config.json</code> dan tambahkan konfigurasi berikut:</p></div><div className="relative rounded-xl border border-blue-200 bg-blue-50/40 p-4 font-mono text-[11px] text-slate-800"><button type="button" onClick={() => W(`{
  "mcpServers": {
    "asia-plastik-finance": {
      "serverUrl": "https://finance-blond-psi.vercel.app/api/mcp"
    }
  }
}`, "Konfigurasi Windsurf MCP")} className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"><Copy className="h-3 w-3" /><span>Salin JSON</span></button><pre className="overflow-x-auto whitespace-pre leading-relaxed">{`{
  "mcpServers": {
    "asia-plastik-finance": {
      "serverUrl": "https://finance-blond-psi.vercel.app/api/mcp"
    }
  }
}`}</pre></div></div>}{"claude-code" === G && <div className="space-y-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 leading-relaxed"><p className="font-semibold text-slate-800">Menghubungkan via Terminal Claude Code:</p></div><div className="relative rounded-xl border border-blue-200 bg-blue-50/40 p-4 font-mono text-[11px] text-slate-800"><button type="button" onClick={() => W("claude mcp add --transport http asia-plastik-finance https://finance-blond-psi.vercel.app/api/mcp", "Perintah Claude Code CLI")} className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"><Copy className="h-3 w-3" /><span>Salin Command</span></button><pre className="overflow-x-auto whitespace-pre leading-relaxed">claude mcp add --transport http asia-plastik-finance https://finance-blond-psi.vercel.app/api/mcp</pre></div></div>}{"curl" === G && <div className="space-y-3 text-xs"><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 leading-relaxed"><p className="font-semibold text-slate-800">Uji Coba Langsung dengan cURL (JSON-RPC 2.0):</p></div><div className="relative rounded-xl border border-blue-200 bg-blue-50/40 p-4 font-mono text-[11px] text-slate-800"><button type="button" onClick={() => W(`curl -X POST https://finance-blond-psi.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_financial_summary",
      "arguments": { "currency": "IDR" }
    }
  }'`, "Perintah cURL")} className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"><Copy className="h-3 w-3" /><span>Salin cURL</span></button><pre className="overflow-x-auto whitespace-pre leading-relaxed">{`curl -X POST https://finance-blond-psi.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_financial_summary",
      "arguments": { "currency": "IDR" }
    }
  }'`}</pre></div></div>}</Card><Card><div className="flex items-center gap-2 mb-2"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">2</div><h4 className="text-sm font-bold text-slate-900">Cara Pakai: Contoh Prompt Percakapan Nyata di Lapangan</h4></div><p className="text-xs text-slate-600 leading-relaxed mb-4">Setelah MCP terhubung, Anda tidak perlu memanggil fungsi teknis. Cukup ketik instruksi atau pertanyaan biasa kepada AI Agent Anda. Agen akan secara otomatis memilih tool yang tepat, mengeksekusinya, dan memberikan laporan yang jelas.</p><div className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-2 mb-2"><span className="font-bold text-xs text-slate-800 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-600" /><span>Skenario 1: Cek Kesehatan Kas & Piutang Pelanggan</span></span><span className="font-mono text-[11px] text-slate-500">get_financial_summary</span></div><div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-medium">💬 <strong>Prompt yang Anda ketik:</strong> "Tolong rekap kondisi kas perusahaan saat ini, dan tampilkan faktur penjualan mana saja yang belum lunas atau sudah jatuh tempo."</div><p className="mt-2 text-[11px] text-slate-600 leading-relaxed"><strong>Respons Agent:</strong> Agen memanggil <code>get_financial_summary</code> untuk mengambil total saldo kas dan laba bersih, lalu memanggil <code>list_sales_invoices</code> untuk menampilkan daftar faktur yang belum lunas.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-2 mb-2"><span className="font-bold text-xs text-slate-800 flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5 text-blue-600" /><span>Skenario 2: Peringatan Stok Biji Plastik & Saran Restock</span></span><span className="font-mono text-[11px] text-slate-500">get_inventory_stock</span></div><div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-medium">💬 <strong>Prompt yang Anda ketik:</strong> "Periksa stok bahan baku di Gudang Cikarang dan Surabaya. Apakah ada biji plastik yang sudah di bawah batas minimum dan harus segera dibuatkan PO?"</div><p className="mt-2 text-[11px] text-slate-600 leading-relaxed"><strong>Respons Agent:</strong> Agen mengeksekusi <code>get_inventory_stock</code> dan melaporkan stok bahan baku yang menipis serta menyarankan pembuatan PO.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-2 mb-2"><span className="font-bold text-xs text-slate-800 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-600" /><span>Skenario 3: Input Otomatis Nota Pengeluaran Operasional</span></span><span className="font-mono text-[11px] text-slate-500">record_transaction</span></div><div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-medium">💬 <strong>Prompt yang Anda ketik:</strong> "Catat pengeluaran operasional baru: Pembelian solar genset pabrik Cikarang sebesar Rp 15.000.000 ke SPBU Pertamina dengan nota tertanggal hari ini."</div><p className="mt-2 text-[11px] text-slate-600 leading-relaxed"><strong>Respons Agent:</strong> Agen memanggil <code>record_transaction</code> untuk mencatat beban operasional langsung ke database sistem.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-2 mb-2"><span className="font-bold text-xs text-slate-800 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-blue-600" /><span>Skenario 4: Investigasi Keamanan & Jejak Audit</span></span><span className="font-mono text-[11px] text-slate-500">get_audit_trail</span></div><div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-medium">💬 <strong>Prompt yang Anda ketik:</strong> "Siapa yang terakhir kali menyetujui transaksi atau mengubah konfigurasi pengguna di sistem?"</div><p className="mt-2 text-[11px] text-slate-600 leading-relaxed"><strong>Respons Agent:</strong> Agen memanggil <code>get_audit_trail</code> dan menyusun kronologis waktu, nama staf, serta aksi spesifik yang dilakukan.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-2 mb-2"><span className="font-bold text-xs text-slate-800 flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5 text-rose-600" /><span>Skenario 5: Pembersihan Data Duplikat & Double Entry</span></span><span className="font-mono text-[11px] text-slate-500">clean_duplicate_expenses</span></div><div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-medium">💬 <strong>Prompt yang Anda ketik:</strong> "Ada anomali tagihan Telkom Indonesia dan FedEx ganda di beban operasional. Tolong bersihkan rekaman yang duplikat dan sisakan masing-masing satu transaksi valid."</div><p className="mt-2 text-[11px] text-slate-600 leading-relaxed"><strong>Respons Agent:</strong> Agen memanggil <code>clean_duplicate_expenses</code> untuk mendeteksi kesamaan vendor & nominal, menghapus salinan berlebih secara otomatis, dan mempertahankan satu dokumen sah serta mencatat penghematan beban operasional.</p></div></div></Card><Card><div className="flex items-center gap-2 mb-2"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">3</div><h4 className="text-sm font-bold text-slate-900">Katalog Tool MCP API Asia Plastik</h4></div><p className="text-xs text-slate-600 leading-relaxed mb-4">Berikut adalah spesifikasi lengkap fungsi, parameter input, dan data yang dikembalikan oleh setiap tool MCP:</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">{[{
              name: "get_financial_summary",
              badge: "Read",
              desc: "Mengambil ringkasan eksekutif: total saldo kas, pendapatan kotor, beban operasional, dan laba bersih pabrik.",
              params: "currency: 'IDR' | 'USD' (opsional)",
              returns: "totalBalance, revenueMonth, expensesMonth, netProfit, cashRatio"
            }, {
              name: "list_bank_accounts",
              badge: "Read",
              desc: "Melihat daftar seluruh rekening kas, bank operasional (BCA/Mandiri), dan kartu kredit sandbox beserta saldo riil.",
              params: "type: 'Semua' | 'Kas' | 'Bank' | 'Kartu Kredit'",
              returns: "id, bankName, accountNumber, balance, isSandbox, status"
            }, {
              name: "list_sales_invoices",
              badge: "Read",
              desc: "Melihat daftar faktur penjualan dan piutang pelanggan Asia Plastik dengan filter status dan nama toko/distributor.",
              params: "status: 'Lunas' | 'Belum Dibayar' | 'Terbayar Sebagian' | 'Semua', customer: string",
              returns: "id, invoiceNumber, customer, totalAmount, dueDate, status"
            }, {
              name: "list_purchase_orders",
              badge: "Read",
              desc: "Melihat daftar Purchase Order (PO) pembelian bahan baku biji plastik dan status persetujuan dari vendor.",
              params: "status: 'Menunggu Approval' | 'Belum Dibayar' | 'Lunas' | 'Semua', vendor: string",
              returns: "id, poNumber, vendor, totalAmount, status, approvalStatus"
            }, {
              name: "list_expenses",
              badge: "Read",
              desc: "Melihat riwayat beban operasional pabrik (listrik PLN, solar industri, gaji, pemeliharaan mesin).",
              params: "category: string (opsional)",
              returns: "id, expenseNumber, category, recipient, amount, date, status"
            }, {
              name: "get_inventory_stock",
              badge: "Read",
              desc: "Mengecek stok fisik bahan baku (HDPE, PP, LDPE) dan barang jadi, serta menandai barang yang kritis.",
              params: "lowStockOnly: boolean (true untuk tampilkan stok di bawah minimum)",
              returns: "code, name, category, warehouse, stock, unit, reorderMin, isLow"
            }, {
              name: "record_transaction",
              badge: "Write / CUD",
              desc: "Mencatat transaksi baru (Faktur Penjualan, PO Pembelian, atau Beban Operasional) langsung ke sistem dengan jejak audit.",
              params: "transactionType: 'sales' | 'purchase' | 'expense', party: string, amount: number, date?: string, note?: string",
              returns: "success: true, recordId: string, timestamp: string"
            }, {
              name: "get_audit_trail",
              badge: "Security",
              desc: "Mengambil jejak audit riwayat aktivitas sistem, perubahan otorisasi, dan aksi transaksi untuk pengawasan kepatuhan.",
              params: "limit: number (default 20)",
              returns: "time, user, action, module"
            }, {
              name: "clean_duplicate_expenses",
              badge: "Write / Deduplikasi",
              desc: "Mendeteksi secara otomatis dan menghapus catatan beban operasional yang terduplikasi (Telkom, FedEx, Love Florist, dll), menyisakan 1 rekaman yang valid.",
              params: "payee?: string, keepStrategy?: 'first' | 'latest', dryRun?: boolean",
              returns: "success: true, cleanedCount, totalAmountEliminated, duplicateGroups"
            }, {
              name: "batch_delete_expenses",
              badge: "Write / Batch",
              desc: "Menghapus beberapa catatan beban operasional sekaligus dalam satu pemanggilan berdasarkan daftar ID atau nomor EXP-...",
              params: "ids: string[] (daftar ID atau nomor dokumen beban)",
              returns: "success: true, deletedCount, deletedNumbers, totalAmount"
            }, {
              name: "deduplicate_financial_records",
              badge: "Write / Multi-Modul",
              desc: "Pembersihan komprehensif data transaksi ganda/duplikat lintas modul finansial (Beban Operasional, Faktur Penjualan, PO Pembelian).",
              params: "module: 'expenses' | 'sales' | 'purchases' | 'all', dryRun?: boolean",
              returns: "success: true, totalCleaned, totalNominalEliminated, results"
            }].map(a => <div key={a.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between"><div><div className="flex items-center justify-between mb-1.5"><code className="font-mono font-bold text-xs text-blue-700">{a.name}</code></div><p className="text-slate-600 text-[11px] leading-relaxed">{a.desc}</p></div><div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1 text-[10px] font-mono"><div className="text-slate-500"><strong className="font-sans text-slate-700">Param:</strong> {a.params}</div><div className="text-slate-500"><strong className="font-sans text-slate-700">Output:</strong> {a.returns}</div></div></div>)}</div></Card></section>}<section id="sec-faq" className="space-y-5 pt-10 border-t-2 border-slate-200/80 scroll-mt-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">{K ? "6" : "5"}</span><div><h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><span>Tanya Jawab Kendala Umum & Panduan Penggunaan (FAQ)</span><span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">{I.length} Panduan</span></h2><p className="text-xs text-slate-500">Solusi cepat penggunaan AI Asisten Vision & OCR, pintasan slash (/), otorisasi approval, multi-currency, dan keamanan sistem</p></div></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" /><input type="text" value={J} onChange={a => U(a.target.value)} placeholder="Cari solusi atau kata kunci di FAQ..." className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs" />{J && <button type="button" onClick={() => U("")} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"><X className="h-3.5 w-3.5" /></button>}</div></div><div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">{O.map(a => {
            let n = a.icon,
              s = q === a.id,
              t = "semua" === a.id ? I.length : I.filter(e => e.category === a.id).length;
            return <button key={a.id} type="button" onClick={() => E(a.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${s ? "bg-blue-600 text-white shadow-xs font-bold" : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"}`}><n className="h-3.5 w-3.5" /><span>{a.label}</span><span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${s ? "bg-blue-700/80 text-white" : "bg-slate-200 text-slate-600"}`}>{t}</span></button>;
          })}</div>{filteredFaq.length === 0 ? <Card className="p-8 text-center bg-slate-50 border-dashed border-slate-200"><HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" /><p className="text-sm font-bold text-slate-800">Tidak ada FAQ yang sesuai dengan pencarian Anda</p><p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau reset filter kategori untuk melihat seluruh panduan.</p><button type="button" onClick={() => {
            E("semua"), U("");
          }} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs">Reset Filter Pencarian</button></Card> : <div className="space-y-3">{filteredFaq.map(a => {
            let n = H === a.id;
            return <Card key={a.id} className={`cursor-pointer transition-all border ${n ? "border-blue-300 ring-2 ring-blue-50 bg-white" : "hover:border-slate-300 bg-white"}`} onClick={() => V(n ? null : a.id)}><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1.5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${a.badgeColor}`}><span>{a.badge}</span></span><span className="text-[11px] text-slate-400 font-medium">• {a.categoryLabel}</span></div><h4 className="text-sm font-bold text-slate-900 leading-snug">{a.q}</h4></div><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{n ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div></div>{n && <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3 animate-in fade-in duration-150"><p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{a.a}</p>{a.steps && a.steps.length > 0 && <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2"><span className="text-[11px] font-bold text-slate-700 block">Rincian & Langkah-Langkah:</span><div className="space-y-1.5">{a.steps.map((a, n) => <div key={n} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold mt-0.5">{n + 1}</span><span>{a}</span></div>)}</div></div>}{a.tip && <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 border border-amber-200/70 p-2.5 text-xs text-amber-900"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /><div className="leading-relaxed"><strong className="font-semibold">Tips Praktis: </strong><span>{a.tip}</span></div></div>}</div>}</Card>;
          })}</div>}</section></div></div>;
};
