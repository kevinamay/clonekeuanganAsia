import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, formatDate } from '../utils/format';
import {
  Bot,
  Sparkles,
  Send,
  Key,
  Trash2,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

export default function AiAsisten() {
  const {
    bankAccounts = [],
    salesDocs = [],
    purchaseDocs = [],
    expenses = [],
    products = [],
    vendors = [],
    workOrders = [],
    personalNotes = [],
    notify
  } = useAppContext();
  const { user } = useAuth();

  // Gemini API Key state (Pre-configured with real Google Gemini 3.8 Flash)
  const getPreconfiguredKey = () => {
    try {
      return atob('QVEuQWI4Uk42TGF1b09mbnZSREhqX3hzLXAyaWxGZFYxaC10b3FIaVhzMllQdnlCazhIaWc=');
    } catch {
      return '';
    }
  };
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('asia_plastic_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || getPreconfiguredKey();
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testKeyError, setTestKeyError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Chat messages
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ap_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-0',
        role: 'assistant',
        text: `Halo ${user?.displayName || 'Rekan Finansial'}! 👋 Saya AI Asisten Finansial Asia Plastik.\n\nSaya terhubung langsung secara real-time dengan seluruh pembukuan Anda: rekening bank, faktur penjualan, tagihan pembelian bahan baku, serta pengeluaran pabrik.\n\nAda yang bisa saya bantu atau analisis hari ini? Anda bisa langsung mengetik pertanyaan atau memilih salah satu tombol cepat di bawah!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      sessionStorage.setItem('ap_ai_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages, isThinking]);

  // Compile full live financial data context
  const financialSummary = useMemo(() => {
    const totalCash = (bankAccounts || []).reduce((s, a) => s + (Number(a.balance) || 0), 0);
    const paidSales = (salesDocs || []).filter(d => d.status === 'Lunas' || d.status === 'Paid');
    const unpaidSales = (salesDocs || []).filter(d => d.status !== 'Lunas' && d.status !== 'Paid');
    const totalIncomePaid = paidSales.reduce((s, d) => s + (Number(d.totalAmount || d.amount || d.total) || 0), 0);
    const totalPiutang = unpaidSales.reduce((s, d) => s + (Number(d.totalAmount || d.amount || d.total) || 0), 0);
    
    const paidPurchases = (purchaseDocs || []).filter(p => p.status === 'Lunas' || p.status === 'Paid');
    const unpaidPurchases = (purchaseDocs || []).filter(p => p.status !== 'Lunas' && p.status !== 'Paid');
    const totalPurchasesPaid = paidPurchases.reduce((s, p) => s + (Number(p.totalAmount || p.amount || p.total) || 0), 0);
    const totalUtang = unpaidPurchases.reduce((s, p) => s + (Number(p.totalAmount || p.amount || p.total) || 0), 0);

    const totalOperationalExpenses = (expenses || []).reduce((s, e) => s + (Number(e.amount || e.total) || 0), 0);
    const totalExpenses = totalPurchasesPaid + totalOperationalExpenses;
    const netFlow = totalIncomePaid - totalExpenses;

    return {
      totalCash,
      bankAccounts: (bankAccounts || []).map(a => ({ name: a.bankName, number: a.accountNumber, balance: a.balance })),
      totalIncomePaid,
      totalPiutang,
      unpaidInvoices: unpaidSales.map(d => ({
        invoiceNo: d.docNumber || d.id,
        customer: d.customerName || d.partyName || 'Pelanggan',
        amount: Number(d.totalAmount || d.amount || d.total) || 0,
        dueDate: d.dueDate || d.date
      })),
      totalUtang,
      unpaidBills: unpaidPurchases.map(p => ({
        poNo: p.docNumber || p.id,
        vendor: p.vendorName || p.partyName || 'Pemasok',
        amount: Number(p.totalAmount || p.amount || p.total) || 0,
        dueDate: p.dueDate || p.date
      })),
      totalExpenses,
      netFlow,
      productsCount: (products || []).length,
      vendorsCount: (vendors || []).length,
      pendingTasksCount: (personalNotes || []).filter(n => !n.completed).length
    };
  }, [bankAccounts, salesDocs, purchaseDocs, expenses, products, vendors, personalNotes]);

  // Comprehensive Smart Conversational Financial Engine (Natural Language Understanding)
  const generateLocalAnswer = (query) => {
    const q = (query || '').toLowerCase().trim();

    // 1. Sapaan & Salam Santai (Greetings)
    const greetingWords = ['halo', 'hai', 'hi', 'hey', 'helo', 'hello', 'pagi', 'siang', 'sore', 'malam', 'assalamu', 'tes', 'test', 'ping', 'apa kabar'];
    if (greetingWords.some(w => q === w || q.startsWith(w + ' ') || q.endsWith(' ' + w) || q.includes(' ' + w + ' '))) {
      return `Halo ${user?.displayName || 'Rekan Finansial'}! 👋\n\nSenang menyapa Anda. Saya AI Asisten Finansial Asia Plastik. Ada yang bisa saya bantu atau analisis untuk operasional hari ini?\n\nAnda bisa menanyakan hal-hal seperti:\n- 💰 **Kas & Bank**: mengecek saldo rekening dan likuiditas\n- 📈 **Penjualan**: memantau omset dan piutang pelanggan\n- 🏢 **Utang & Vendor**: mengecek tagihan pembelian bahan baku\n- 📊 **Arus Kas**: memonitor laba bersih dan pengeluaran\n- ❓ **Panduan Fitur**: cara membuat faktur, input kas, atau rekonsiliasi\n\nSilakan tanyakan apa saja atau pilih tombol cepat di bawah!`;
    }

    // 2. Ucapan Terima Kasih & Konfirmasi
    const thanksWords = ['makasih', 'terima kasih', 'thanks', 'thx', 'oke', 'ok', 'sip', 'siap', 'mantap', 'bagus', 'keren', 'baiklah'];
    if (thanksWords.some(w => q.includes(w))) {
      return `Sama-sama! Senang bisa membantu Anda. 😊\n\nJika ada transaksi baru yang ingin dianalisis atau butuh perhitungan keuangan lainnya, langsung tanyakan kembali kapan saja ya!`;
    }

    // 3. Identitas & Kapabilitas AI
    if (q.includes('siapa kamu') || q.includes('kamu siapa') || q.includes('bisa apa') || q.includes('fitur apa') || q.includes('fungsi kamu') || q.includes('bisa bantu apa') || q.includes('tentang kamu')) {
      return `Saya adalah **CFO Virtual & AI Asisten Finansial** untuk PT Asia Plastik Indonesia. 🤖💼\n\n**Kemampuan Utama Saya:**\n1. **Analisis Data Real-Time**: Terhubung langsung ke database Firebase Anda (Kas, Penjualan, Pembelian, Biaya).\n2. **Monitoring Piutang & Utang**: Menampilkan rincian invoice dan tagihan supplier yang belum lunas.\n3. **Kalkulasi Cash Flow**: Menghitung net cash flow, surplus/defisit, dan rasio likuiditas.\n4. **Konsultasi SOP & Akuntansi**: Membimbing alur pembukuan pabrik dan cara penggunaan aplikasi.\n5. **Dukungan Generative AI**: Dapat dihubungkan ke Google Gemini API untuk konsultasi strategi bisnis bebas tanpa batas.`;
    }

    // 4. Panduan & Tutorial Aplikasi (SOP)
    if (q.includes('cara') || q.includes('bagaimana') || q.includes('gimana') || q.includes('tutorial') || q.includes('panduan')) {
      if (q.includes('faktur') || q.includes('invoice') || q.includes('jual') || q.includes('penjualan')) {
        return `**Panduan Membuat Faktur Penjualan:**\n1. Buka menu **Invoices & Penjualan** di sidebar kiri.\n2. Klik tombol **+ Buat Faktur Penjualan** di pojok kanan atas.\n3. Pilih nama pelanggan, masukkan item produk (misal Biji Plastik HDPE/PP), kuantiti, harga satuan, dan tenor pembayaran.\n4. Klik **Simpan & Terbitkan Faktur**.\n\n*Setelah disimpan, piutang dan omset akan langsung terupdate di dashboard dan terbaca oleh saya.*`;
      }
      if (q.includes('rekening') || q.includes('bank') || q.includes('kas') || q.includes('saldo')) {
        return `**Panduan Menambah Rekening Kas & Bank:**\n1. Buka menu **Kas & Bank** di sidebar kiri.\n2. Klik tombol **+ Tambah Rekening**.\n3. Masukkan nama bank (BCA, Mandiri, dll.), nomor rekening, dan saldo awal.\n4. Klik **Simpan Rekening**.\n\n*Saldo otomatis akan menjadi modal kas operasional awal perusahaan.*`;
      }
      if (q.includes('po') || q.includes('beli') || q.includes('pembelian') || q.includes('supplier')) {
        return `**Panduan Input Pembelian (PO Bahan Baku):**\n1. Buka menu **Pembelian & Tagihan** di sidebar kiri.\n2. Klik tombol **+ Buat Purchase Order (PO)**.\n3. Pilih vendor pemasok bahan baku, masukkan kuantiti resin, harga satuan, dan tanggal jatuh tempo.\n4. Klik **Terbitkan PO**.\n\n*Tagihan akan tercatat di daftar utang usaha hingga Anda menandainya lunas.*`;
      }
      if (q.includes('rekonsiliasi') || q.includes('cocok')) {
        return `**Panduan Rekonsiliasi Bank:**\n1. Buka menu **Rekonsiliasi** di sidebar kiri.\n2. Bandingkan mutasi rekening koran di kolom kiri dengan catatan pembukuan di kolom kanan.\n3. Klik **Cocokkan** pada transaksi yang sesuai untuk mengunci rekonsiliasi.`;
      }
      if (q.includes('pajak') || q.includes('coretax') || q.includes('ppn')) {
        return `**Panduan Pajak & Coretax:**\n1. Buka menu **Pajak & Coretax** di sidebar kiri.\n2. Sistem otomatis menghitung PPN 11% Keluaran dari penjualan dan Masukan dari pembelian bahan baku.\n3. Anda dapat mengunduh rekapitulasi untuk pelaporan SPT Masa ke portal DJP Coretax.`;
      }
      return `**Pusat Bantuan & Panduan Cepat:**\n- Untuk panduan lengkap standar pembukuan pabrik, Anda juga bisa membaca menu **Dokumentasi & Panduan** di sidebar.\n- Atau tanyakan hal spesifik seperti: *"Bagaimana cara input faktur penjualan?"* atau *"Bagaimana cara tambah rekening bank?"*.`;
    }

    // 5. Saldo / Kas & Bank
    if (q.includes('saldo') || q.includes('kas') || q.includes('rekening') || q.includes('bank') || q.includes('uang')) {
      if (financialSummary.bankAccounts.length === 0) {
        return `Saat ini **belum ada rekening bank atau saldo kas yang tercatat (Saldo: Rp 0)** karena database baru saja di-reset untuk simulasi.\n\n👉 **Langkah Awal:** Silakan buka menu **Kas & Bank** lalu klik **+ Tambah Rekening** untuk memasukkan rekening operasional (misal BCA Operasional atau Kas Besar) beserta saldo awalnya. Begitu rekening dibuat, saldonya akan langsung terpantau di sini!`;
      }
      const list = financialSummary.bankAccounts
        .map(a => `- **${a.name}** (${a.number}): ${formatRupiah(a.balance)}`)
        .join('\n');
      return `**Ringkasan Saldo Kas & Bank Asia Plastik:**\n\nTotal Likuiditas: **${formatRupiah(financialSummary.totalCash)}**\n\nRincian Rekening:\n${list}\n\n*Status: Dana siap dialokasikan untuk operasional pabrik dan pembayaran supplier.*`;
    }

    // 6. Piutang / Invoice Belum Lunas / Customer
    if (q.includes('piutang') || q.includes('belum lunas') || q.includes('tagihan pelanggan') || q.includes('invoice') || q.includes('penagihan')) {
      if (financialSummary.unpaidInvoices.length === 0) {
        return `Kabar baik! Saat ini **tidak ada piutang penjualan yang tertunggak (Total Piutang: Rp 0)**.\n\n👉 Jika Anda ingin mensimulasikan penagihan, buat faktur baru di menu **Invoices & Penjualan** dengan status belum lunas (tempo). Faktur tersebut akan langsung muncul di daftar pantauan piutang saya.`;
      }
      const list = financialSummary.unpaidInvoices
        .slice(0, 10)
        .map(i => `- **${i.customer}** (${i.invoiceNo}): ${formatRupiah(i.amount)} ${i.dueDate ? `· Jatuh Tempo: ${formatDate(i.dueDate)}` : ''}`)
        .join('\n');
      return `**Laporan Piutang Usaha (Trade Receivables):**\n\nTotal Piutang Aktif: **${formatRupiah(financialSummary.totalPiutang)}** (${financialSummary.unpaidInvoices.length} Faktur Berjalan)\n\nDaftar Pelanggan Belum Lunas:\n${list}\n\n💡 *Saran AI: Lakukan follow-up berkala sebelum tanggal jatuh tempo agar arus kas tunai tetap lancar.*`;
    }

    // 7. Omset / Penjualan / Revenue
    if (q.includes('omset') || q.includes('penjualan') || q.includes('pendapatan') || q.includes('income')) {
      const totalOmset = financialSummary.totalIncomePaid + financialSummary.totalPiutang;
      if (totalOmset === 0) {
        return `Saat ini **belum ada transaksi penjualan yang dicatat (Total Omset: Rp 0)**.\n\n👉 Anda bisa membuat faktur penjualan pertama di menu **Invoices & Penjualan**. Saya akan otomatis menghitung omset, realisasi kas lunas, dan piutang berjalan.`;
      }
      return `**Laporan Kinerja Penjualan (Revenue):**\n\n- **Total Omset Bruto:** ${formatRupiah(totalOmset)}\n- **Kas Diterima (Sudah Lunas):** ${formatRupiah(financialSummary.totalIncomePaid)}\n- **Piutang Berjalan:** ${formatRupiah(financialSummary.totalPiutang)}\n\nRealisasi penerimaan kas penjualan berada pada rasio **${Math.round((financialSummary.totalIncomePaid / totalOmset) * 100)}%**.`;
    }

    // 8. Utang / Tagihan Supplier / Vendor
    if (q.includes('utang') || q.includes('hutang') || q.includes('supplier') || q.includes('vendor') || q.includes('po') || q.includes('tagihan masuk')) {
      if (financialSummary.unpaidBills.length === 0) {
        return `Saat ini **tidak ada kewajiban atau utang supplier yang tertunggak (Total Utang Usaha: Rp 0)**.\n\n👉 Anda bisa mencatat pembelian bahan baku resin di menu **Pembelian & Tagihan**. Tagihan yang belum dibayar akan langsung saya ingatkan tanggal jatuh temponya di sini.`;
      }
      const list = financialSummary.unpaidBills
        .slice(0, 10)
        .map(b => `- **${b.vendor}** (${b.poNo}): ${formatRupiah(b.amount)} ${b.dueDate ? `· Jatuh Tempo: ${formatDate(b.dueDate)}` : ''}`)
        .join('\n');
      return `**Daftar Utang Usaha ke Pemasok/Vendor:**\n\nTotal Utang Belum Lunas: **${formatRupiah(financialSummary.totalUtang)}** (${financialSummary.unpaidBills.length} Tagihan Pending)\n\nRincian Tagihan:\n${list}\n\n💡 *Pastikan alokasi saldo kas mencukupi sebelum tanggal jatuh tempo supplier bahan baku.*`;
    }

    // 9. Biaya & Pengeluaran / Expenses
    if (q.includes('biaya') || q.includes('pengeluaran') || q.includes('beban') || q.includes('expenses')) {
      if (financialSummary.totalExpenses === 0) {
        return `Saat ini **belum ada pengeluaran atau beban operasional yang dicatat (Rp 0)**.\n\n👉 Anda dapat mencatat pengeluaran operasional di menu **Budgeting & Biaya** atau mencatat PO di menu **Pembelian & Tagihan**.`;
      }
      return `**Ringkasan Pengeluaran & Beban Operasional:**\n\n- **Total Pengeluaran Real:** ${formatRupiah(financialSummary.totalExpenses)}\n- Beban operasional mencakup belanja bahan baku, logistik pengiriman pabrik, utilitas listrik, serta upah tenaga kerja.\n\n💡 *Saran AI: Pantau batas plafon anggaran di menu Budgeting & Biaya agar tidak melebihi anggaran yang telah ditetapkan.*`;
    }

    // 10. Laba Bersih / Arus Kas / Net Flow / Kesehatan Finansial
    if (q.includes('laba') || q.includes('profit') || q.includes('arus kas') || q.includes('net flow') || q.includes('kesehatan') || q.includes('keuangan')) {
      if (financialSummary.totalIncomePaid === 0 && financialSummary.totalExpenses === 0) {
        return `Saat ini **posisi arus kas masih nol (Rp 0)** karena belum ada pencatatan transaksi masuk atau keluar.\n\n👉 Begitu Anda mulai mencatat faktur penjualan yang lunas dan pengeluaran operasional, saya akan menghitung laba bersih tunai, margin laba, dan rasio likuiditas secara otomatis!`;
      }
      const statusFlow = financialSummary.netFlow >= 0 ? 'Surplus (Positif)' : 'Defisit (Negatif)';
      return `**Analisis Kesehatan Arus Kas (Cash Flow Health):**\n\n- **Pemasukan Kas (Lunas):** ${formatRupiah(financialSummary.totalIncomePaid)}\n- **Total Pengeluaran Real:** ${formatRupiah(financialSummary.totalExpenses)}\n- **Net Cash Flow (Laba Bersih Tunai):** **${financialSummary.netFlow >= 0 ? '+' : ''}${formatRupiah(financialSummary.netFlow)}** (${statusFlow})\n\n**Rasio Likuiditas:** Saldo Kas saat ini **${formatRupiah(financialSummary.totalCash)}** berbanding utang supplier **${formatRupiah(financialSummary.totalUtang)}**.\n\n*Kesimpulan AI: ${financialSummary.totalCash >= financialSummary.totalUtang ? 'Kondisi likuiditas aman untuk memenuhi seluruh kewajiban lancar.' : 'Perlu percepatan penagihan piutang pelanggan untuk menutup kewajiban yang akan datang.'}*`;
    }

    // 11. Inventori / Gudang
    if (q.includes('stok') || q.includes('inventori') || q.includes('gudang') || q.includes('produk') || q.includes('barang')) {
      return `**Status Gudang & Inventori Asia Plastik:**\n\n- Total Produk Terdaftar: **${financialSummary.productsCount} Item**\n- Mitra Vendor Aktif: **${financialSummary.vendorsCount} Pemasok**\n\n*Anda dapat mengelola stok biji plastik HDPE/PP dan proses work order produksi di modul **Inventori & Gudang**.*`;
    }

    // 12. Default Respon Ramah & Cerdas
    return `Saya memahami Anda menanyakan perihal *"${query}"*.\n\nSebagai AI Asisten Finansial terintegrasi, saya siap membantu Anda menganalisis seluruh pembukuan Asia Plastik.\n\n**Data Ringkas Saat Ini:**\n- 💰 **Kas & Bank:** ${formatRupiah(financialSummary.totalCash)}\n- 📈 **Penjualan Lunas:** ${formatRupiah(financialSummary.totalIncomePaid)}\n- ⏳ **Piutang Berjalan:** ${formatRupiah(financialSummary.totalPiutang)}\n- 📋 **Utang Supplier:** ${formatRupiah(financialSummary.totalUtang)}\n\n💡 *Anda bisa mencoba mengklik salah satu tombol cepat di atas (seperti **Arus Kas & Laba**, **Piutang Belum Lunas**, atau **Cek Saldo Bank**). Jika Anda ingin berdiskusi bebas atau tanya jawab strategis kompleks layaknya ChatGPT, Anda juga bisa memasukkan Google Gemini API Key di tombol pojok kanan atas!*`;
  };

  // Google Gemini API Caller (Multi-Turn Generative AI)
  const callGeminiApi = async (userPrompt) => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return generateLocalAnswer(userPrompt);
    }

    const systemPrompt = `Anda adalah CFO Virtual dan AI Asisten Finansial Senior untuk PT Asia Plastik Indonesia (pabrik manufaktur plastik dan kemasan packaging).
Anda terhubung langsung ke data operasional riil terkini perusahaan:
${JSON.stringify(financialSummary, null, 2)}

Petunjuk Menjawab:
1. Jawab selalu dalam Bahasa Indonesia yang ramah, profesional, cerdas, dan interaktif seperti ChatGPT/Gemini.
2. Jawab pertanyaan pengguna secara kontekstual. Jika menyapa (halo/hai), balas dengan hangat dan tanyakan hal spesifik yang ingin dibahas.
3. Gunakan data finansial di atas jika relevan dengan format Rupiah (contoh: Rp 15.000.000). Jika data masih Rp 0, jelaskan dengan ramah bahwa pembukuan baru dimulai.
4. Anda dapat membantu pembuatan draf surat penagihan invoice, analisis efisiensi biaya pabrik, kalkulasi laba rugi, simulasi kas, hingga konsultasi strategi bisnis.
5. Gunakan format markdown tebal (bold) dan poin-poin agar nyaman dibaca.`;

    // Multi-turn history
    const pastTurns = messages.slice(-6).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const contents = [
      ...pastTurns,
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ];

    const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    let lastError = null;

    for (const modelName of models) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`,
          {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200
              }
            })
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData?.error?.message || response.statusText;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err.name === 'AbortError' ? 'Waktu request habis (timeout)' : err.message;
      }
    }

    console.warn('[Gemini Call Failed]', lastError);
    return `${generateLocalAnswer(userPrompt)}\n\n*(Catatan: Panggilan Google Gemini API gagal: ${lastError || 'Kendala koneksi'}. Pastikan API Key dibuat di Google AI Studio (aistudio.google.com/app/apikey). Jawaban di atas dijawab oleh AI Finansial bawaan).*`;
  };

  // Submit Handler
  const handleSend = async (textToSend) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isThinking) return;

    setInput('');
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const replyText = await callGeminiApi(prompt);
      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      const errMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: generateLocalAnswer(prompt),
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    notify('Jawaban disalin ke clipboard.');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        text: 'Riwayat percakapan telah dibersihkan. Silakan tanyakan hal lain terkait laporan finansial Asia Plastik!',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    sessionStorage.removeItem('ap_ai_chat_history');
    notify('Percakapan telah di-reset.');
  };

  const handleSaveApiKey = async () => {
    const clean = tempApiKey.trim();
    if (!clean) {
      setApiKey('');
      localStorage.removeItem('asia_plastic_gemini_key');
      setIsSettingsOpen(false);
      setTestKeyError('');
      notify('API Key dihapus. Beralih ke AI Finansial bawaan.');
      return;
    }

    setIsTestingKey(true);
    setTestKeyError('');
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${clean}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Kode respon Google: ${res.statusText}`);
      }
      setApiKey(clean);
      localStorage.setItem('asia_plastic_gemini_key', clean);
      setIsSettingsOpen(false);
      notify('Gemini API Key valid & aktif! Mode Generatif interaktif siap digunakan.');
    } catch (err) {
      setTestKeyError(`Koneksi key gagal: ${err.message}. Pastikan key dibuat melalui Google AI Studio (aistudio.google.com/app/apikey).`);
    } finally {
      setIsTestingKey(false);
    }
  };

  // Quick prompt chips
  const quickPrompts = [
    { label: '📊 Arus Kas & Laba', prompt: 'Bagaimana analisis arus kas dan posisi laba bersih perusahaan saat ini?' },
    { label: '💳 Piutang Belum Lunas', prompt: 'Berapa total piutang dan siapa saja pelanggan yang belum melunasi faktur?' },
    { label: '🏢 Tagihan Vendor', prompt: 'Apakah ada tagihan utang supplier atau PO yang belum dibayar?' },
    { label: '💰 Cek Saldo Bank', prompt: 'Berapa total saldo kas & rekening bank saat ini?' },
    { label: '💡 Saran Efisiensi Biaya', prompt: 'Berikan saran efisiensi dan penghematan biaya operasional pabrik berdasarkan data terkini.' },
    { label: '❓ Cara Buat Faktur', prompt: 'Bagaimana cara membuat faktur penjualan baru di aplikasi ini?' }
  ];

  return (
    <div className="space-y-5 pb-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">AI Asisten Finansial</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              apiKey ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <Sparkles className="h-3 w-3" />
              <span>{apiKey ? 'Gemini 3.5 Flash-Lite (Super Cepat)' : 'AI Finansial Aktif'}</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            CFO Virtual terhubung langsung ke data kas, penjualan, utang, dan pengeluaran Asia Plastik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Key className="h-3.5 w-3.5 text-blue-600" />
            <span>{apiKey ? 'Ubah Gemini Key' : 'Pasang Gemini API Key'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Bersihkan Percakapan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Banner Rekomendasi Mode AI Interaktif */}
      {!apiKey && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Aktifkan AI Generatif Interaktif (Google Gemini 1.5 / 2.0 Flash)
              </p>
              <p className="text-[11px] text-slate-500">
                Hubungkan API Key gratis dari Google AI Studio untuk percakapan bebas tanpa batas, analisis strategi, dan draf surat resmi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <Key className="h-3.5 w-3.5" />
            <span>Pasang Key Gratis</span>
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm flex flex-col h-[640px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id || idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isUser && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shrink-0 mt-0.5">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div className={`group relative max-w-2xl rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-blue-600 text-white font-medium rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
                }`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  <div className={`mt-2 flex items-center justify-between text-[10px] pt-1 border-t ${
                    isUser ? 'border-blue-500/50 text-blue-100' : 'border-slate-100 text-slate-400'
                  }`}>
                    <span>{m.timestamp || 'Hari ini'}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.text, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-blue-600 text-[10px] font-semibold cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedIndex === idx ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-sm shrink-0 mt-0.5 text-xs font-bold">
                    {(user?.displayName || 'User')[0].toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex gap-3 justify-start items-center animate-fade-in">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                <span>AI sedang menganalisis data finansial...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" /> Cepat:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isThinking}
              onClick={() => handleSend(qp.prompt)}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Bottom Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2.5">
          <input
            type="text"
            value={input}
            disabled={isThinking}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu ke AI (misal: 'halo', 'bagaimana cara buat faktur?', atau cek kas)..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all shadow-md shadow-blue-500/25 shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Modal / Dialog: Pengaturan API Key */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Koneksi Google Gemini API</h3>
                  <p className="text-[10px] text-slate-400">Aktifkan Generative AI penuh untuk tanya jawab bebas</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
            </div>

            <div className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda dapat menghubungkan <strong>Google Gemini API Key</strong> (gratis dari Google AI Studio) agar AI dapat diajak berdiskusi tentang analisis strategi, draf surat penagihan, simulasi laba rugi, dan pertanyaan bebas lainnya.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => {
                    setTempApiKey(e.target.value);
                    setTestKeyError('');
                  }}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    <span>Dapatkan Key Gratis di Google AI Studio</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {testKeyError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{testKeyError}</span>
                </div>
              )}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800 leading-relaxed">
                ℹ️ <strong>Tanpa API Key:</strong> AI tetap berfungsi menggunakan <strong>AI Finansial bawaan</strong> untuk menjawab panduan alur, serta menghitung saldo, piutang, utang, omset, dan laba rugi.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isTestingKey}
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isTestingKey}
                  onClick={handleSaveApiKey}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isTestingKey ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menguji Key...</span>
                    </>
                  ) : (
                    <span>Uji &amp; Simpan Key</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
