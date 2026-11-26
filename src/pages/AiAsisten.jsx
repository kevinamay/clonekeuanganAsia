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
  ArrowRight
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

  // Gemini API Key state
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('asia_plastic_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
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
        text: `Halo ${user?.displayName || 'Rekan Finansial'}! Saya AI Asisten Finansial Asia Plastik. Saya terhubung langsung secara real-time dengan rekening bank, faktur penjualan, tagihan pembelian, dan pengeluaran Anda.\n\nAda yang ingin Anda tanyakan atau analisis mengenai posisi finansial hari ini?`,
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

  // Local Smart Financial Analysis Engine (Zero-Config / Fallback)
  const generateLocalAnswer = (query) => {
    const q = query.toLowerCase();

    // 1. Saldo / Kas & Bank
    if (q.includes('saldo') || q.includes('kas') || q.includes('rekening') || q.includes('bank')) {
      if (financialSummary.bankAccounts.length === 0) {
        return `Saat ini **belum ada rekening bank atau saldo kas yang tercatat** di sistem.\n\nAnda dapat menambahkan rekening operasional (seperti BCA, Mandiri, atau Kas Kecil) di menu **Kas & Bank** agar mutasi kas dapat terlacak secara otomatis.`;
      }
      const list = financialSummary.bankAccounts
        .map(a => `- **${a.name}** (${a.number}): ${formatRupiah(a.balance)}`)
        .join('\n');
      return `**Ringkasan Saldo Kas & Bank Asia Plastik:**\n\nTotal Likuiditas: **${formatRupiah(financialSummary.totalCash)}**\n\nRincian Rekening:\n${list}\n\n*Status: Dana siap digunakan untuk operasional dan pembayaran supplier.*`;
    }

    // 2. Piutang / Invoice Belum Lunas / Customer
    if (q.includes('piutang') || q.includes('belum lunas') || q.includes('tagihan pelanggan') || q.includes('invoice')) {
      if (financialSummary.unpaidInvoices.length === 0) {
        return `Kabar baik! Saat ini **tidak ada piutang penjualan yang tertunggak** (Total Piutang: **Rp 0**).\n\nSemua transaksi penjualan telah lunas atau belum ada faktur penjualan baru yang diterbitkan.`;
      }
      const list = financialSummary.unpaidInvoices
        .slice(0, 10)
        .map(i => `- **${i.customer}** (${i.invoiceNo}): ${formatRupiah(i.amount)} ${i.dueDate ? `· Jatuh Tempo: ${formatDate(i.dueDate)}` : ''}`)
        .join('\n');
      return `**Laporan Piutang Usaha (Trade Receivables):**\n\nTotal Piutang Aktif: **${formatRupiah(financialSummary.totalPiutang)}** (${financialSummary.unpaidInvoices.length} Faktur Berjalan)\n\nDaftar Pelanggan Belum Lunas:\n${list}\n\n💡 *Saran AI: Lakukan penagihan berkala sebelum tanggal jatuh tempo untuk menjaga kelancaran cashflow pabrik.*`;
    }

    // 3. Omset / Penjualan / Revenue
    if (q.includes('omset') || q.includes('penjualan') || q.includes('pendapatan') || q.includes('income')) {
      const totalOmset = financialSummary.totalIncomePaid + financialSummary.totalPiutang;
      return `**Laporan Kinerja Penjualan (Revenue):**\n\n- **Total Omset Bruto:** ${formatRupiah(totalOmset)}\n- **Kas Diterima (Sudah Lunas):** ${formatRupiah(financialSummary.totalIncomePaid)}\n- **Piutang Berjalan:** ${formatRupiah(financialSummary.totalPiutang)}\n\nRealisasi penerimaan kas penjualan berada pada rasio **${totalOmset > 0 ? Math.round((financialSummary.totalIncomePaid / totalOmset) * 100) : 0}%**.`;
    }

    // 4. Utang / Tagihan Supplier / Vendor
    if (q.includes('utang') || q.includes('hutang') || q.includes('supplier') || q.includes('vendor') || q.includes('po')) {
      if (financialSummary.unpaidBills.length === 0) {
        return `Saat ini **tidak ada kewajiban/utang supplier yang belum dibayar** (Total Utang Usaha: **Rp 0**).\n\nPerusahaan tidak memiliki tagihan pembelian bahan baku yang tertunggak.`;
      }
      const list = financialSummary.unpaidBills
        .slice(0, 10)
        .map(b => `- **${b.vendor}** (${b.poNo}): ${formatRupiah(b.amount)} ${b.dueDate ? `· Jatuh Tempo: ${formatDate(b.dueDate)}` : ''}`)
        .join('\n');
      return `**Daftar Utang Usaha ke Pemasok/Vendor:**\n\nTotal Utang Belum Lunas: **${formatRupiah(financialSummary.totalUtang)}** (${financialSummary.unpaidBills.length} Tagihan Pending)\n\nRincian Tagihan:\n${list}\n\n💡 *Pastikan alokasi saldo kas mencukupi sebelum tanggal jatuh tempo supplier bahan baku.*`;
    }

    // 5. Biaya & Pengeluaran / Expenses
    if (q.includes('biaya') || q.includes('pengeluaran') || q.includes('beban') || q.includes('expenses')) {
      return `**Ringkasan Pengeluaran & Beban Operasional:**\n\n- **Total Pengeluaran:** ${formatRupiah(financialSummary.totalExpenses)}\n- Beban operasional mencakup belanja bahan baku, logistik pengiriman pabrik, utilitas listrik, serta upah tenaga kerja.\n\n💡 *Saran AI: Selalu pantau plafon anggaran di menu Budgeting & Biaya agar tidak terjadi over-budget di akhir periode.*`;
    }

    // 6. Laba Bersih / Arus Kas / Net Flow
    if (q.includes('laba') || q.includes('profit') || q.includes('arus kas') || q.includes('net flow') || q.includes('kesehatan')) {
      const statusFlow = financialSummary.netFlow >= 0 ? 'Surplus (Positif)' : 'Defisit (Negatif)';
      return `**Analisis Kesehatan Arus Kas (Cash Flow Health):**\n\n- **Pemasukan Kas (Lunas):** ${formatRupiah(financialSummary.totalIncomePaid)}\n- **Total Pengeluaran Real:** ${formatRupiah(financialSummary.totalExpenses)}\n- **Net Cash Flow (Laba Bersih Tunai):** **${financialSummary.netFlow >= 0 ? '+' : ''}${formatRupiah(financialSummary.netFlow)}** (${statusFlow})\n\n**Rasio Likuiditas:** Saldo Kas saat ini **${formatRupiah(financialSummary.totalCash)}** berbanding utang supplier **${formatRupiah(financialSummary.totalUtang)}**.\n\n*Kesimpulan AI: ${financialSummary.totalCash >= financialSummary.totalUtang ? 'Kondisi likuiditas sangat aman untuk memenuhi seluruh kewajiban lancar.' : 'Perlu percepatan penagihan piutang pelanggan untuk menutup kewajiban yang akan datang.'}*`;
    }

    // 7. Inventori / Gudang
    if (q.includes('stok') || q.includes('inventori') || q.includes('gudang') || q.includes('produk')) {
      return `**Status Gudang & Inventori Asia Plastik:**\n\n- Total Produk Terdaftar: **${financialSummary.productsCount} Item**\n- Mitra Vendor Aktif: **${financialSummary.vendorsCount} Pemasok**\n\n*Anda dapat memantau pergerakan stok biji plastik HDPE/PP dan proses work order di modul **Inventori & Gudang**.*`;
    }

    // 8. Default Executive Summary
    return `**Ringkasan Eksekutif Finansial Asia Plastik:**\n\n- 💰 **Total Kas & Bank:** ${formatRupiah(financialSummary.totalCash)}\n- 📈 **Penjualan Diterima:** ${formatRupiah(financialSummary.totalIncomePaid)}\n- ⏳ **Piutang Belum Lunas:** ${formatRupiah(financialSummary.totalPiutang)}\n- 📋 **Utang Supplier Pending:** ${formatRupiah(financialSummary.totalUtang)}\n- 📊 **Net Cash Flow:** ${financialSummary.netFlow >= 0 ? '+' : ''}${formatRupiah(financialSummary.netFlow)}\n\nAda aspek khusus yang ingin Anda pelajari lebih detail? Anda bisa tanyakan tentang **saldo rekening**, **daftar piutang**, **utang vendor**, atau **proyeksi laba rugi**.`;
  };

  // Google Gemini API Caller
  const callGeminiApi = async (userPrompt) => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return generateLocalAnswer(userPrompt);
    }

    const systemPrompt = `Anda adalah CFO Virtual dan AI Asisten Finansial Senior untuk PT Asia Plastik Indonesia (manufaktur biji plastik dan packaging).
Anda memiliki akses data finansial riil perusahaan terkini:
${JSON.stringify(financialSummary, null, 2)}

Petunjuk Menjawab:
1. Jawab selalu dalam Bahasa Indonesia yang profesional, ramah, dan solutif.
2. Gunakan angka riil dari data di atas jika relevan, format dalam format Rupiah (misal Rp 15.000.000).
3. Berikan saran bisnis/akuntansi yang strategis, efisien, dan dapat langsung dieksekusi.
4. Gunakan poin-poin tebal (bold) untuk kemudahan membaca.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nPertanyaan Pengguna: ${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.warn('[Gemini API Error]', errJson);
        // Fallback gracefully to smart local engine if key is invalid
        return `${generateLocalAnswer(userPrompt)}\n\n*(Catatan: Panggilan Gemini API mengalami kendala: ${errJson?.error?.message || response.statusText}. Respon di atas dihasilkan otomatis oleh Smart Financial Engine lokal).*`;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
      return generateLocalAnswer(userPrompt);
    } catch (err) {
      console.warn('[Gemini fetch error]', err);
      return generateLocalAnswer(userPrompt);
    }
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

  const handleSaveApiKey = () => {
    const clean = tempApiKey.trim();
    setApiKey(clean);
    localStorage.setItem('asia_plastic_gemini_key', clean);
    setIsSettingsOpen(false);
    notify(clean ? 'Gemini API Key berhasil disimpan! AI Generatif aktif.' : 'API Key dihapus. Beralih ke Smart Financial Engine lokal.');
  };

  // Quick prompt chips
  const quickPrompts = [
    { label: '📊 Arus Kas & Laba', prompt: 'Bagaimana analisis arus kas dan posisi laba bersih perusahaan saat ini?' },
    { label: '💳 Piutang Belum Lunas', prompt: 'Berapa total piutang dan siapa saja pelanggan yang belum melunasi faktur?' },
    { label: '🏢 Tagihan Vendor', prompt: 'Apakah ada tagihan utang supplier atau PO yang belum dibayar?' },
    { label: '💰 Cek Saldo Bank', prompt: 'Berapa total saldo kas & rekening bank saat ini?' },
    { label: '💡 Saran Efisiensi Biaya', prompt: 'Berikan saran efisiensi dan penghematan biaya operasional pabrik berdasarkan data terkini.' }
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
              <span>{apiKey ? 'Gemini 1.5 Flash Aktif' : 'Smart Financial Engine'}</span>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Key className="h-3.5 w-3.5 text-blue-600" />
            <span>{apiKey ? 'Ubah API Key' : 'Pasang Gemini API Key'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
            title="Bersihkan Percakapan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

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
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-blue-600 text-[10px] font-semibold"
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
            placeholder="Tanyakan analisis keuangan, saldo, piutang, atau prediksi kas..."
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
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>

            <div className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda dapat menggunakan <strong>Google Gemini API Key</strong> (gratis dari Google AI Studio) agar AI dapat diajak berdiskusi tentang analisis strategi, draf surat penagihan, simulasi laba rugi, dan pertanyaan kompleks lainnya.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Belum punya key? Dapatkan gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google AI Studio ↗</a>.
                </span>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800 leading-relaxed">
                ℹ️ <strong>Tanpa API Key:</strong> AI tetap dapat digunakan 100% menggunakan <strong>Smart Financial Engine bawaan</strong> untuk menjawab pertanyaan saldo, piutang, utang, omset, dan laporan laba rugi.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
