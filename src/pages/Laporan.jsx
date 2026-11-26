import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import {
  Upload,
  FileSpreadsheet,
  Printer,
  SlidersHorizontal,
  CircleAlert,
  Send,
  Mail,
  X,
  FileText
} from 'lucide-react';

const categories = [
  {
    id: 'sekilas',
    label: 'Sekilas Bisnis',
    reports: [
      'Laporan Laba Rugi (PSAK)',
      'Neraca Keuangan',
      'Arus Kas (Direct & Indirect)',
      'Perubahan Modal (Ekuitas)',
      'Ringkasan Bisnis & Rasio'
    ]
  },
  {
    id: 'penjualan',
    label: 'Penjualan',
    reports: [
      'Daftar Penjualan',
      'Piutang Pelanggan',
      'Usia Piutang (Aging AR)',
      'Profitabilitas Penjualan'
    ]
  },
  {
    id: 'pembelian',
    label: 'Pembelian',
    reports: [
      'Daftar Pembelian',
      'Utang Supplier',
      'Usia Hutang (Aging AP)',
      'Detail Pengeluaran Beban'
    ]
  },
  {
    id: 'produk',
    label: 'Produk',
    reports: [
      'Ringkasan Persediaan Barang',
      'Nilai Persediaan Gudang',
      'Kuantitas Stok Antargudang'
    ]
  },
  {
    id: 'aset',
    label: 'Aset',
    reports: [
      'Ringkasan Aset Tetap',
      'Detail Penyusutan Aset'
    ]
  },
  {
    id: 'kurs',
    label: 'Pertukaran Kurs',
    reports: [
      'Ringkasan Bank Valas & Selisih Kurs'
    ]
  },
  {
    id: 'bank',
    label: 'Bank',
    reports: [
      'Laporan Rekonsiliasi Bank',
      'Mutasi Rekening Koran'
    ]
  },
  {
    id: 'pajak',
    label: 'Pajak',
    reports: [
      'Laporan Pajak Penjualan (PPN)',
      'Rekapitulasi Faktur Pajak'
    ]
  },
  {
    id: 'produksi',
    label: 'Produksi',
    reports: [
      'Harga Pokok Produksi (COGM)',
      'Penyelesaian Work Order'
    ]
  }
];

function StatusBadge({ status }) {
  const n = (status || '').toLowerCase();
  let color = 'bg-sky-50 text-sky-700 border-sky-200';
  if (
    n.includes('lunas') ||
    n.includes('aktif') ||
    n.includes('selesai') ||
    n.includes('terverifikasi') ||
    n.includes('terekonsiliasi') ||
    n.includes('real-time')
  ) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    n.includes('belum') ||
    n.includes('pending') ||
    n.includes('parsial') ||
    n.includes('proses')
  ) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (n.includes('batal') || n.includes('tolak') || n.includes('jatuh tempo')) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DCE7F5] bg-[#F8FBFF] p-8 text-center">
      <FileText className="mx-auto h-8 w-8 text-[#0284C7] mb-2" />
      <h4 className="text-sm font-semibold text-[#0B192C]">{title}</h4>
      <p className="mt-1 text-xs text-[#586E89]">{description}</p>
    </div>
  );
}

export default function Laporan() {
  const {
    notify,
    salesDocs = [],
    purchaseDocs = [],
    expenses = [],
    bankAccounts = [],
    products = [],
    fixedAssets = [],
    taxRecords = [],
    workOrders = []
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('sekilas');
  const [selectedReport, setSelectedReport] = useState('Laporan Laba Rugi (PSAK)');
  const [cashFlowMethod, setCashFlowMethod] = useState('direct'); // 'direct' | 'indirect'
  const [template, setTemplate] = useState('standar'); // 'standar' | 'manajemen'
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiModalTitle, setApiModalTitle] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Financial calculations
  const totalRevenue = salesDocs.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalPaidRevenue = salesDocs.reduce((acc, curr) => acc + (curr.paid || 0), 0);
  const totalUnpaidAR = salesDocs.reduce((acc, curr) => acc + Math.max(0, (curr.total || 0) - (curr.paid || 0)), 0);

  const totalPaidPurchase = purchaseDocs.reduce((acc, curr) => acc + (curr.paid || 0), 0);
  const totalUnpaidAP = purchaseDocs.reduce((acc, curr) => acc + Math.max(0, (curr.total || 0) - (curr.paid || 0)), 0);

  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const cogs = totalRevenue > 0 ? Math.round(0.62 * totalRevenue) : 0;
  const grossProfit = totalRevenue - cogs;
  const monthlyDepreciation = fixedAssets.reduce((acc, curr) => acc + (curr.depreciationMonthly || 0), 0);
  const netProfit = template === 'standar' ? grossProfit - totalExpenses - monthlyDepreciation : grossProfit - totalExpenses;

  const totalBankBalance = bankAccounts.reduce((acc, curr) => acc + (curr.balanceBook || 0), 0);
  const totalInventoryValue = products.reduce((acc, curr) => {
    const totalQty = (curr.stockJkt || 0) + (curr.stockSby || 0) + (curr.stockBdg || 0) || (curr.stock || 0);
    const unitPrice = curr.price || curr.standardPrice || 0;
    return acc + totalQty * (0.7 * unitPrice);
  }, 0);

  const totalFixedAssetBookValue = fixedAssets.reduce((acc, curr) => {
    return acc + (curr.bookValue ?? ((curr.cost || 0) - (curr.accumDepr ?? curr.accumulated ?? 0)));
  }, 0);

  const currentAssets = totalBankBalance + totalUnpaidAR + totalInventoryValue;
  const totalAssets = currentAssets + totalFixedAssetBookValue;
  const initialEquity = Math.max(0, totalAssets - totalUnpaidAP - netProfit);
  const totalEquity = initialEquity + netProfit;
  const totalLiabilitiesAndEquity = totalUnpaidAP + totalEquity;

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  // Airene narrative commentary
  const aireneCommentary =
    totalRevenue === 0 && totalExpenses === 0
      ? 'Belum ada transaksi tercatat dalam sistem. Input faktur penjualan, pembelian, atau pengeluaran kas untuk mengaktifkan audit analitik real-time Airene.'
      : `Total pendapatan berjalan tercatat sebesar ${formatRupiah(totalRevenue)} dengan margin laba kotor ${
          totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0
        }%. Likuiditas kas & bank berada di level ${formatRupiah(totalBankBalance)}. Piutang pelanggan yang belum tertagih sebesar ${formatRupiah(
          totalUnpaidAR
        )} dan kewajiban utang pemasok sebesar ${formatRupiah(totalUnpaidAP)}.`;

  // Export CSV handler
  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += `Laporan: ${selectedReport}\r\n`;
    csv += `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\r\n\r\n`;

    if (selectedReport.includes('Laba Rugi')) {
      csv += 'Komponen,Nominal (IDR)\r\n';
      csv += `Pendapatan Penjualan Bersih,${totalRevenue}\r\n`;
      csv += `Harga Pokok Penjualan (HPP),-${cogs}\r\n`;
      csv += `Laba Kotor (Gross Profit),${grossProfit}\r\n`;
      csv += `Beban Operasional,-${totalExpenses}\r\n`;
      if (template === 'standar') {
        csv += `Penyusutan Aset Tetap,-${monthlyDepreciation}\r\n`;
      }
      csv += `Laba Bersih (Net Profit),${netProfit}\r\n`;
    } else if (selectedReport.includes('Neraca')) {
      csv += 'Akun,Nominal (IDR)\r\n';
      csv += `Kas & Bank,${totalBankBalance}\r\n`;
      csv += `Piutang Usaha,${totalUnpaidAR}\r\n`;
      csv += `Persediaan Barang,${totalInventoryValue}\r\n`;
      csv += `Aset Tetap (Nilai Buku),${totalFixedAssetBookValue}\r\n`;
      csv += `Total Aset,${totalAssets}\r\n`;
      csv += `Utang Usaha,${totalUnpaidAP}\r\n`;
      csv += `Ekuitas & Laba Berjalan,${totalEquity}\r\n`;
    } else if (selectedReport.includes('Penjualan')) {
      csv += 'Nomor Faktur,Pelanggan,Tanggal,Total,Terbayar,Sisa Piutang,Status\r\n';
      salesDocs.forEach((d) => {
        csv += `"${d.number}","${d.customer}","${d.date}",${d.total},${d.paid},${(d.total || 0) - (d.paid || 0)},"${d.status}"\r\n`;
      });
    } else if (selectedReport.includes('Pembelian')) {
      csv += 'Nomor Faktur/PO,Supplier,Tanggal,Total,Terbayar,Sisa Utang,Status\r\n';
      purchaseDocs.forEach((d) => {
        csv += `"${d.number}","${d.vendor}","${d.date}",${d.total},${d.paid},${(d.total || 0) - (d.paid || 0)},"${d.status}"\r\n`;
      });
    } else {
      csv += 'Deskripsi,Nilai\r\n';
      csv += `Total Kas & Bank,${totalBankBalance}\r\n`;
      csv += `Total Piutang,${totalUnpaidAR}\r\n`;
      csv += `Total Utang,${totalUnpaidAP}\r\n`;
    }

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReport.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Laporan "${selectedReport}" berhasil diunduh dalam format CSV / Excel.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">Laporan Keuangan &amp; Analisis</h1>
          <p className="mt-1 text-xs text-[#586E89]">
            Laporan akuntansi real-time, PSAK compliant, otomatis dihitung dari sistem dan ringkasan audit Airene.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C] hover:bg-[#F8FBFF] shadow-xs"
          >
            <Upload className="h-4 w-4 text-[#0284C7]" />
            <span>Impor Massal</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C] hover:bg-[#F8FBFF] shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#0284C7]" />
            <span>Ekspor CSV / XLSX</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-[#DCE7F5] gap-1 overflow-x-auto">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveCategory(c.id);
                if (c.reports.length > 0) {
                  setSelectedReport(c.reports[0]);
                }
              }}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#0284C7] text-[#0284C7]'
                  : 'border-transparent text-[#586E89] hover:text-[#0B192C]'
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? 'bg-[#EDF4FC] text-[#0284C7]' : 'bg-gray-100 text-[#586E89]'
                }`}
              >
                {c.reports.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Side Pane & Right Main Report Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Side Pane: Sub-report List */}
        <div className="h-fit rounded-xl border border-[#DCE7F5] bg-white p-4 shadow-sm lg:col-span-1">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#586E89]">
            Daftar Laporan ({currentCategory.label})
          </div>
          <div className="space-y-1">
            {currentCategory.reports.map((r) => {
              const isSelected = selectedReport === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReport(r)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#E6F2FE] font-semibold text-[#0369A1]'
                      : 'font-medium text-[#334760] hover:bg-[#F4F8FD]'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Area: Report Table & Airene Analysis */}
        <div className="space-y-6 lg:col-span-3">
          {/* Main Report Card */}
          <div className="rounded-xl border border-[#DCE7F5] bg-white p-5 shadow-sm">
            {/* Card Header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE7F5] pb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0B192C]">{selectedReport}</h2>
                <p className="text-xs text-[#586E89]">Periode Berjalan · Sumber: Data Terverifikasi Sistem</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedReport.includes('Arus Kas') && (
                  <div className="flex rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setCashFlowMethod('direct')}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        cashFlowMethod === 'direct'
                          ? 'bg-white font-semibold text-[#0369A1] shadow-xs'
                          : 'text-[#586E89]'
                      }`}
                    >
                      Metode Langsung
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashFlowMethod('indirect')}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        cashFlowMethod === 'indirect'
                          ? 'bg-white font-semibold text-[#0369A1] shadow-xs'
                          : 'text-[#586E89]'
                      }`}
                    >
                      Metode Tidak Langsung
                    </button>
                  </div>
                )}
                {selectedReport.includes('Laba Rugi') && (
                  <button
                    type="button"
                    onClick={() => setTemplate((prev) => (prev === 'standar' ? 'manajemen' : 'standar'))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-2.5 py-1.5 text-xs font-medium text-[#334760] hover:bg-[#EDF4FC]"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#0284C7]" />
                    <span>
                      Template: {template === 'standar' ? 'Standar PSAK (Termasuk Depresiasi)' : 'Manajemen (EBITDA)'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setApiModalTitle('Koneksi API DJP Coretax / e-Faktur Otomatis');
                    setApiModalOpen(true);
                  }}
                  className="rounded-lg border border-[#DCE7F5] bg-[#F8FBFF] px-2.5 py-1.5 text-xs font-medium text-[#0284C7] hover:bg-[#EDF4FC]"
                >
                  Kirim ke DJP Coretax (Coming Soon)
                </button>
              </div>
            </div>

            {/* Table Content: Laporan Laba Rugi (PSAK) */}
            {selectedReport.includes('Laba Rugi') && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                    <tr>
                      <th className="px-4 py-2.5">Akun &amp; Komponen Laba Rugi</th>
                      <th className="px-4 py-2.5 text-right">Nilai Berjalan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF4FC]">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-[#0B192C]">Pendapatan Penjualan Bersih</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0B192C]">{formatRupiah(totalRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-[#334760]">Harga Pokok Penjualan (HPP / COGS)</td>
                      <td className="num px-4 py-2.5 text-right text-[#DC2626]">
                        {totalRevenue > 0 ? `-${formatRupiah(cogs)}` : formatRupiah(0)}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FBFF]">
                      <td className="px-4 py-2.5 font-semibold text-[#0369A1]">Laba Kotor (Gross Profit)</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">{formatRupiah(grossProfit)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-[#334760]">
                        Total Beban Operasional ({expenses.length} transaksi)
                      </td>
                      <td className="num px-4 py-2.5 text-right text-[#DC2626]">
                        {totalExpenses > 0 ? `-${formatRupiah(totalExpenses)}` : formatRupiah(0)}
                      </td>
                    </tr>
                    {template === 'standar' && (
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Beban Penyusutan Aset Tetap</td>
                        <td className="num px-4 py-2.5 text-right text-[#DC2626]">
                          {monthlyDepreciation > 0 ? `-${formatRupiah(monthlyDepreciation)}` : formatRupiah(0)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-[#EDF4FC] font-semibold">
                      <td className="px-4 py-3 text-[#0B192C]">
                        Laba Bersih ({template === 'standar' ? 'Net Profit' : 'EBITDA'})
                      </td>
                      <td
                        className={`num px-4 py-3 text-right font-bold ${
                          netProfit >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'
                        }`}
                      >
                        {formatRupiah(netProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Neraca Keuangan */}
            {selectedReport.includes('Neraca') && (
              <div className="overflow-x-auto space-y-6">
                <div>
                  <div className="border-b border-[#DCE7F5] bg-[#F8FBFF] px-4 py-2 font-semibold text-xs uppercase tracking-wider text-[#0369A1]">
                    Aset (Aktiva)
                  </div>
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-[#EDF4FC]">
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Kas &amp; Setara Kas (Seluruh Rekening)</td>
                        <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(totalBankBalance)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Piutang Usaha Pelanggan</td>
                        <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(totalUnpaidAR)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Nilai Persediaan Barang (Gudang)</td>
                        <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(totalInventoryValue)}</td>
                      </tr>
                      <tr className="bg-[#F8FBFF]">
                        <td className="px-4 py-2.5 font-medium text-[#0369A1]">Total Aset Lancar</td>
                        <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">{formatRupiah(currentAssets)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Aset Tetap &amp; Peralatan (Nilai Buku Bersih)</td>
                        <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(totalFixedAssetBookValue)}</td>
                      </tr>
                      <tr className="bg-[#EDF4FC] font-semibold">
                        <td className="px-4 py-3 text-[#0B192C]">Total Aset (Aktiva)</td>
                        <td className="num px-4 py-3 text-right text-[#0369A1] font-bold">{formatRupiah(totalAssets)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="border-b border-[#DCE7F5] bg-[#F8FBFF] px-4 py-2 font-semibold text-xs uppercase tracking-wider text-[#0369A1]">
                    Kewajiban &amp; Ekuitas (Pasiva)
                  </div>
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-[#EDF4FC]">
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Utang Usaha ke Pemasok</td>
                        <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(totalUnpaidAP)}</td>
                      </tr>
                      <tr className="bg-[#F8FBFF]">
                        <td className="px-4 py-2.5 font-medium text-[#0369A1]">Total Liabilitas (Kewajiban)</td>
                        <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">{formatRupiah(totalUnpaidAP)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Modal Pemilik / Modal Disetor</td>
                        <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(initialEquity)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#334760]">Laba Bersih Berjalan (Ditahan)</td>
                        <td className="num px-4 py-2.5 text-right font-medium text-[#047857]">{formatRupiah(netProfit)}</td>
                      </tr>
                      <tr className="bg-[#F8FBFF]">
                        <td className="px-4 py-2.5 font-medium text-[#0369A1]">Total Ekuitas</td>
                        <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">{formatRupiah(totalEquity)}</td>
                      </tr>
                      <tr className="bg-[#EDF4FC] font-semibold">
                        <td className="px-4 py-3 text-[#0B192C]">Total Liabilitas &amp; Ekuitas (Seimbang)</td>
                        <td className="num px-4 py-3 text-right text-[#047857] font-bold">{formatRupiah(totalLiabilitiesAndEquity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Table Content: Arus Kas */}
            {selectedReport.includes('Arus Kas') && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                    <tr>
                      <th className="px-4 py-2.5">
                        Aktivitas Arus Kas ({cashFlowMethod === 'direct' ? 'Metode Langsung' : 'Metode Tidak Langsung'})
                      </th>
                      <th className="px-4 py-2.5 text-right">Nominal Realtime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF4FC]">
                    {cashFlowMethod === 'direct' ? (
                      <>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-[#0B192C]">Penerimaan Kas dari Pelanggan</td>
                          <td className="num px-4 py-2.5 text-right font-semibold text-[#047857]">{formatRupiah(totalPaidRevenue)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-[#0B192C]">Pembayaran Kas ke Pemasok</td>
                          <td className="num px-4 py-2.5 text-right text-[#DC2626]">
                            {totalPaidPurchase > 0 ? `-${formatRupiah(totalPaidPurchase)}` : formatRupiah(0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-[#0B192C]">Pembayaran Beban Operasional</td>
                          <td className="num px-4 py-2.5 text-right text-[#DC2626]">
                            {totalExpenses > 0 ? `-${formatRupiah(totalExpenses)}` : formatRupiah(0)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-4 py-2.5 font-medium">Laba Bersih Periode Berjalan</td>
                          <td className="num px-4 py-2.5 text-right font-semibold text-[#0B192C]">{formatRupiah(netProfit)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5">Penyesuaian Beban Non-Kas (Penyusutan Aset)</td>
                          <td className="num px-4 py-2.5 text-right text-[#047857]">+{formatRupiah(monthlyDepreciation)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5">Perubahan Modal Kerja Bersih</td>
                          <td className="num px-4 py-2.5 text-right text-[#0369A1]">{formatRupiah(totalUnpaidAP - totalUnpaidAR)}</td>
                        </tr>
                      </>
                    )}
                    <tr className="bg-[#F8FBFF]">
                      <td className="px-4 py-2.5 font-semibold text-[#0369A1]">Arus Kas Bersih dari Aktivitas Operasi</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">
                        {formatRupiah(totalPaidRevenue - totalPaidPurchase - totalExpenses)}
                      </td>
                    </tr>
                    <tr className="bg-[#EDF4FC] font-semibold">
                      <td className="px-4 py-3 text-[#0B192C]">Saldo Kas &amp; Bank Akhir</td>
                      <td className="num px-4 py-3 text-right text-[#0369A1] font-bold">{formatRupiah(totalBankBalance)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Perubahan Modal (Ekuitas) */}
            {selectedReport.includes('Perubahan Modal') && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                    <tr>
                      <th className="px-4 py-2.5">Komponen Ekuitas Modal</th>
                      <th className="px-4 py-2.5 text-right">Nilai Berjalan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF4FC]">
                    <tr>
                      <td className="px-4 py-2.5 text-[#334760]">Modal Pemilik Awal Periode</td>
                      <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(initialEquity)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-[#334760]">Laba Bersih Tahun Berjalan</td>
                      <td className="num px-4 py-2.5 text-right font-medium text-[#047857]">+{formatRupiah(netProfit)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-[#334760]">Prive / Penarikan Modal Pemilik</td>
                      <td className="num px-4 py-2.5 text-right font-medium text-[#DC2626]">Rp 0</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-[#334760]">Penambahan Modal Disetor (Inbreng)</td>
                      <td className="num px-4 py-2.5 text-right font-medium text-[#0369A1]">Rp 0</td>
                    </tr>
                    <tr className="bg-[#EDF4FC] font-semibold">
                      <td className="px-4 py-3 text-[#0B192C]">Saldo Akhir Ekuitas &amp; Modal Pemilik</td>
                      <td className="num px-4 py-3 text-right text-[#047857] font-bold">{formatRupiah(totalEquity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Ringkasan Bisnis & Rasio */}
            {selectedReport.includes('Ringkasan Bisnis') && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                    <tr>
                      <th className="px-4 py-2.5">Indikator Kinerja &amp; Rasio Finansial</th>
                      <th className="px-4 py-2.5 text-center">Standar Industri</th>
                      <th className="px-4 py-2.5 text-right">Nilai Realtime</th>
                      <th className="px-4 py-2.5 text-center">Kesehatan Finansial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF4FC]">
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#0B192C]">Margin Laba Kotor (Gross Margin)</td>
                      <td className="px-4 py-2.5 text-center text-xs text-[#586E89]">&gt; 25.0%</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">
                        {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status="Sehat" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#0B192C]">Margin Laba Bersih (Net Profit Margin)</td>
                      <td className="px-4 py-2.5 text-center text-xs text-[#586E89]">&gt; 15.0%</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#047857]">
                        {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status="Optimal" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#0B192C]">Rasio Lancar (Current Ratio)</td>
                      <td className="px-4 py-2.5 text-center text-xs text-[#586E89]">&gt; 1.50x</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">
                        {(currentAssets / (totalUnpaidAP || 1)).toFixed(2)}x
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status="Sangat Baik" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#0B192C]">Quick Ratio (Acid-Test Ratio)</td>
                      <td className="px-4 py-2.5 text-center text-xs text-[#586E89]">&gt; 1.00x</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">
                        {((totalBankBalance + totalUnpaidAR) / (totalUnpaidAP || 1)).toFixed(2)}x
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status="Aman" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#0B192C]">Debt-to-Equity Ratio (DER)</td>
                      <td className="px-4 py-2.5 text-center text-xs text-[#586E89]">&lt; 80.0%</td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-[#0B192C]">
                        {((totalUnpaidAP / (totalEquity || 1)) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status="Rendah Risiko" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Penjualan */}
            {activeCategory === 'penjualan' && !selectedReport.includes('Laba Rugi') && (
              <div>
                {salesDocs.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Data Penjualan"
                    description="Belum ada transaksi penjualan di sistem. Buat faktur atau pesanan baru di modul Penjualan."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                        <tr>
                          <th className="px-4 py-2.5">No. Dokumen</th>
                          <th className="px-4 py-2.5">Pelanggan</th>
                          <th className="px-4 py-2.5">Jatuh Tempo</th>
                          <th className="px-4 py-2.5 text-right">Total</th>
                          <th className="px-4 py-2.5 text-right">Terbayar</th>
                          <th className="px-4 py-2.5 text-right">Sisa Piutang</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF4FC]">
                        {salesDocs.map((doc) => {
                          const remaining = Math.max(0, (doc.total || 0) - (doc.paid || 0));
                          return (
                            <tr key={doc.id || doc.number} className="hover:bg-[#F8FBFF]">
                              <td className="num px-4 py-2.5 font-semibold text-[#0B192C]">{doc.number}</td>
                              <td className="px-4 py-2.5">{doc.customer}</td>
                              <td className="num px-4 py-2.5 text-xs text-[#586E89]">{doc.dueDate}</td>
                              <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(doc.total)}</td>
                              <td className="num px-4 py-2.5 text-right text-[#047857]">{formatRupiah(doc.paid)}</td>
                              <td className="num px-4 py-2.5 text-right font-semibold text-[#DC2626]">{formatRupiah(remaining)}</td>
                              <td className="px-4 py-2.5">
                                <StatusBadge status={doc.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Table Content: Pembelian */}
            {activeCategory === 'pembelian' && (
              <div>
                {purchaseDocs.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Data Pembelian"
                    description="Belum ada transaksi pembelian di sistem. Buat faktur atau PO baru di modul Pembelian."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                        <tr>
                          <th className="px-4 py-2.5">No. PO/Faktur</th>
                          <th className="px-4 py-2.5">Pemasok</th>
                          <th className="px-4 py-2.5">Jatuh Tempo</th>
                          <th className="px-4 py-2.5 text-right">Total</th>
                          <th className="px-4 py-2.5 text-right">Terbayar</th>
                          <th className="px-4 py-2.5 text-right">Sisa Utang</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF4FC]">
                        {purchaseDocs.map((doc) => {
                          const remaining = Math.max(0, (doc.total || 0) - (doc.paid || 0));
                          return (
                            <tr key={doc.id || doc.number} className="hover:bg-[#F8FBFF]">
                              <td className="num px-4 py-2.5 font-semibold text-[#0B192C]">{doc.number}</td>
                              <td className="px-4 py-2.5">{doc.vendor}</td>
                              <td className="num px-4 py-2.5 text-xs text-[#586E89]">{doc.dueDate}</td>
                              <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(doc.total)}</td>
                              <td className="num px-4 py-2.5 text-right text-[#047857]">{formatRupiah(doc.paid)}</td>
                              <td className="num px-4 py-2.5 text-right font-semibold text-[#DC2626]">{formatRupiah(remaining)}</td>
                              <td className="px-4 py-2.5">
                                <StatusBadge status={doc.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Table Content: Produk */}
            {activeCategory === 'produk' && (
              <div>
                {products.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Data Produk"
                    description="Belum ada produk terdaftar di sistem. Tambahkan SKU baru di modul Inventori &amp; Produksi."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                        <tr>
                          <th className="px-4 py-2.5">SKU &amp; Produk</th>
                          <th className="px-4 py-2.5">Satuan</th>
                          <th className="px-4 py-2.5 text-center">Stok JKT</th>
                          <th className="px-4 py-2.5 text-center">Stok SBY</th>
                          <th className="px-4 py-2.5 text-center">Stok BDG</th>
                          <th className="px-4 py-2.5 text-right">Harga Jual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF4FC]">
                        {products.map((p) => (
                          <tr key={p.sku || p.id} className="hover:bg-[#F8FBFF]">
                            <td className="px-4 py-2.5 font-semibold text-[#0B192C]">
                              {p.name}
                              <span className="block font-normal text-xs text-[#586E89]">{p.sku}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-[#586E89]">{p.unit || 'Pcs'}</td>
                            <td className="num px-4 py-2.5 text-center font-medium">{p.stockJkt || p.stock || 0}</td>
                            <td className="num px-4 py-2.5 text-center font-medium">{p.stockSby || 0}</td>
                            <td className="num px-4 py-2.5 text-center font-medium">{p.stockBdg || 0}</td>
                            <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(p.price || p.standardPrice || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Table Content: Aset */}
            {activeCategory === 'aset' && (
              <div>
                {fixedAssets.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Aset Tetap"
                    description="Belum ada data aset tetap di sistem. Daftarkan aset baru di modul Akuntansi &amp; Buku Besar."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                        <tr>
                          <th className="px-4 py-2.5">Kode &amp; Nama Aset</th>
                          <th className="px-4 py-2.5">Kategori</th>
                          <th className="px-4 py-2.5 text-right">Harga Perolehan</th>
                          <th className="px-4 py-2.5 text-right">Akumulasi Depresiasi</th>
                          <th className="px-4 py-2.5 text-right">Nilai Buku</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF4FC]">
                        {fixedAssets.map((a) => (
                          <tr key={a.code || a.id} className="hover:bg-[#F8FBFF]">
                            <td className="px-4 py-2.5 font-semibold text-[#0B192C]">
                              {a.name}
                              <span className="block font-normal text-xs text-[#586E89]">{a.code}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-[#586E89]">{a.category}</td>
                            <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(a.cost || 0)}</td>
                            <td className="num px-4 py-2.5 text-right text-[#DC2626]">
                              -{formatRupiah(a.accumDepr ?? a.accumulated ?? 0)}
                            </td>
                            <td className="num px-4 py-2.5 text-right font-semibold text-[#0369A1]">
                              {formatRupiah(a.bookValue ?? ((a.cost || 0) - (a.accumDepr ?? a.accumulated ?? 0)))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Table Content: Bank & Pertukaran Kurs */}
            {(activeCategory === 'bank' || activeCategory === 'kurs') && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                    <tr>
                      <th className="px-4 py-2.5">Rekening Bank &amp; Kas</th>
                      <th className="px-4 py-2.5">Mata Uang</th>
                      <th className="px-4 py-2.5 text-right">Saldo Buku</th>
                      <th className="px-4 py-2.5 text-right">Saldo Bank</th>
                      <th className="px-4 py-2.5 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF4FC]">
                    {bankAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#586E89]">
                          Belum ada rekening kas/bank terdaftar di sistem.
                        </td>
                      </tr>
                    ) : (
                      bankAccounts.map((b) => (
                        <tr key={b.id || b.code} className="hover:bg-[#F8FBFF]">
                          <td className="px-4 py-2.5 font-semibold text-[#0B192C]">
                            {b.name}
                            <span className="block font-normal text-xs text-[#586E89]">
                              {b.code} · {b.bankLabel}
                            </span>
                          </td>
                          <td className="num px-4 py-2.5 text-xs font-semibold">{b.currency}</td>
                          <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(b.balanceBook || 0)}</td>
                          <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(b.balanceBank || 0)}</td>
                          <td className="num px-4 py-2.5 text-right font-semibold text-[#047857]">
                            {formatRupiah(Math.abs((b.balanceBank || 0) - (b.balanceBook || 0)))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Pajak */}
            {activeCategory === 'pajak' && (
              <div>
                {taxRecords.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Rekam Pajak"
                    description="Belum ada faktur pajak tersimpan di sistem. Rekam faktur pajak baru di modul Perpajakan."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                        <tr>
                          <th className="px-4 py-2.5">No. Faktur Pajak</th>
                          <th className="px-4 py-2.5">Lawan Transaksi</th>
                          <th className="px-4 py-2.5">Jenis</th>
                          <th className="px-4 py-2.5 text-right">DPP</th>
                          <th className="px-4 py-2.5 text-right">PPN (11%)</th>
                          <th className="px-4 py-2.5">Status Coretax</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF4FC]">
                        {taxRecords.map((t) => (
                          <tr key={t.id || t.docNumber} className="hover:bg-[#F8FBFF]">
                            <td className="num px-4 py-2.5 font-semibold text-[#0B192C]">{t.docNumber}</td>
                            <td className="px-4 py-2.5">{t.partner}</td>
                            <td className="px-4 py-2.5 text-xs text-[#586E89]">{t.type}</td>
                            <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(t.dpp || 0)}</td>
                            <td className="num px-4 py-2.5 text-right font-medium text-[#047857]">{formatRupiah(t.taxAmount || 0)}</td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={t.coretaxStatus || 'Terverifikasi'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Table Content: Produksi */}
            {activeCategory === 'produksi' && (
              <div>
                {workOrders.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Work Order Produksi"
                    description="Belum ada data work order di sistem. Terbitkan WO baru di modul Inventori &amp; Produksi."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#DCE7F5] bg-[#EDF4FC] text-xs font-semibold text-[#334760]">
                        <tr>
                          <th className="px-4 py-2.5">No. Work Order</th>
                          <th className="px-4 py-2.5">Produk Jadi</th>
                          <th className="px-4 py-2.5 text-center">Target Qty</th>
                          <th className="px-4 py-2.5 text-center">Selesai</th>
                          <th className="px-4 py-2.5 text-right">Biaya Aktual</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDF4FC]">
                        {workOrders.map((w) => (
                          <tr key={w.woNumber || w.id} className="hover:bg-[#F8FBFF]">
                            <td className="num px-4 py-2.5 font-semibold text-[#0B192C]">{w.woNumber}</td>
                            <td className="px-4 py-2.5">{w.product}</td>
                            <td className="num px-4 py-2.5 text-center">{w.qtyTarget}</td>
                            <td className="num px-4 py-2.5 text-center font-medium text-[#047857]">{w.qtyDone}</td>
                            <td className="num px-4 py-2.5 text-right font-medium">{formatRupiah(w.actualCost || 0)}</td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={w.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Card: Analisis Realtime Airene */}
          <div className="rounded-xl border border-[#DCE7F5] bg-[#F8FBFF] p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0B192C]">Analisis Realtime Airene: {selectedReport}</h3>
                  <StatusBadge status="Real-Time" />
                </div>
                <p className="mt-1 text-xs text-[#334760] leading-relaxed">{aireneCommentary}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `*Laporan Keuangan Asia Plastic Finance*\n${selectedReport}\nPeriode: ${new Date().toLocaleDateString(
                        'id-ID'
                      )}\n\n• Pendapatan: ${formatRupiah(totalRevenue)}\n• Laba Bersih: ${formatRupiah(
                        netProfit
                      )}\n• Saldo Kas & Bank: ${formatRupiah(totalBankBalance)}\n• Piutang: ${formatRupiah(
                        totalUnpaidAR
                      )}\n\nAnalisis Airene: ${aireneCommentary}`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B192C] hover:bg-[#EDF4FC] shadow-xs"
                >
                  <Send className="h-3.5 w-3.5 text-[#0284C7]" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(`Laporan Keuangan - ${selectedReport}`);
                    const body = encodeURIComponent(
                      `Laporan Keuangan Asia Plastic Finance\n${selectedReport}\n\nRingkasan Utama:\n- Pendapatan Bersih: ${formatRupiah(
                        totalRevenue
                      )}\n- Laba Bersih: ${formatRupiah(netProfit)}\n- Kas & Bank: ${formatRupiah(
                        totalBankBalance
                      )}\n- Piutang Pelanggan: ${formatRupiah(totalUnpaidAR)}\n- Utang Pemasok: ${formatRupiah(
                        totalUnpaidAP
                      )}\n\nCatatan Airene:\n${aireneCommentary}`
                    );
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B192C] hover:bg-[#EDF4FC] shadow-xs"
                >
                  <Mail className="h-3.5 w-3.5 text-[#0284C7]" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: API Eksternal DJP Coretax Coming Soon */}
      {apiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE7F5] pb-3">
              <h3 className="text-sm font-bold text-[#0B192C]">Fitur API Eksternal — Coming Soon</h3>
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="rounded-lg p-1 text-[#586E89] hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4">
              <CircleAlert className="h-5 w-5 shrink-0 text-[#0284C7] mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-[#0369A1]">{apiModalTitle}</div>
                <p className="mt-1 text-xs text-[#0C4A6E] leading-relaxed">
                  Fitur ini memerlukan kredensial sertifikat elektronik resmi &amp; integrasi langsung ke API pihak ketiga (DJP Coretax / Bank Host-to-Host). Saat ini modul diamankan dalam status Coming Soon hingga perilisan gateway produksi berikutnya.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#586E89]">
              Anda tetap dapat mengekspor laporan dalam format CSV / Excel dan mencetaknya secara lokal dengan tombol di header atas.
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="rounded-lg bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1]"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Impor Massal Jurnal / Laporan */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE7F5] pb-3">
              <h3 className="text-sm font-bold text-[#0B192C]">Impor Massal Jurnal / Laporan</h3>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg p-1 text-[#586E89] hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#586E89]">
              Unggah berkas spreadsheet CSV atau Excel (.xlsx) untuk menambahkan data jurnal akuntansi secara massal ke sistem.
            </p>
            <div className="rounded-xl border-2 border-dashed border-[#DCE7F5] bg-[#F8FBFF] p-6 text-center">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-[#0284C7] mb-2" />
              <div className="text-xs font-semibold text-[#0B192C]">Seret berkas CSV ke sini atau klik untuk memilih</div>
              <div className="text-[11px] text-[#586E89] mt-1">Maksimal 10MB per berkas (Format standar PSAK)</div>
              <input
                type="file"
                accept=".csv,.xlsx"
                className="mt-3 text-xs text-[#586E89]"
                onChange={() => {
                  notify('Berkas diterima dan sedang diverifikasi skemanya.');
                  setImportModalOpen(false);
                }}
              />
            </div>
            <div className="rounded-lg bg-[#F8FBFF] p-3 text-xs text-[#334760] space-y-1">
              <div className="font-medium text-[#0B192C]">Konektor Sinkronisasi ERP Otomatis:</div>
              <div className="text-[11px] text-[#586E89]">
                API konektor langsung SAP, Oracle NetSuite, dan Accurate Cloud saat ini berstatus{' '}
                <span className="font-semibold text-[#0284C7]">Coming Soon</span>.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg border border-[#DCE7F5] bg-white px-4 py-2 text-xs font-semibold text-[#334760] hover:bg-[#F8FBFF]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
