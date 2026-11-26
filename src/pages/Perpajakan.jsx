import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import {
  Plus,
  Lock,
  FileCheck2,
  Trash2,
  X,
  FileText
} from 'lucide-react';

export default function Perpajakan() {
  const {
    taxRecords = [],
    setTaxRecords,
    salesDocs = [],
    purchaseDocs = [],
    notify,
    confirmAction
  } = useAppContext();

  // Active top tab: 'efaktur' | 'ebupot' | 'ebilling'
  const [activeTab, setActiveTab] = useState('efaktur');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coretaxNotice, setCoretaxNotice] = useState(null);

  // Form state
  const [docNumber, setDocNumber] = useState('');
  const [partner, setPartner] = useState('');
  const [dppAmount, setDppAmount] = useState(0);
  const [taxType, setTaxType] = useState('PPN Keluaran');

  // Calculations matching live application
  const records = Array.isArray(taxRecords) ? taxRecords : [];
  const sales = Array.isArray(salesDocs) ? salesDocs : [];
  const purchases = Array.isArray(purchaseDocs) ? purchaseDocs : [];

  const totalPpnKeluaran = useMemo(() => {
    return sales.reduce((acc, s) => acc + (s.ppn || Math.round(0.11 * (s.subtotal || s.total || 0)) || 0), 0);
  }, [sales]);

  const totalPpnMasukan = useMemo(() => {
    return purchases.reduce((acc, p) => acc + Math.round(0.11 * (p.total || 0)), 0);
  }, [purchases]);

  const diffPpn = totalPpnKeluaran - totalPpnMasukan;

  const totalWithholding = useMemo(() => {
    return sales.reduce((acc, s) => acc + (s.withholding || 0), 0);
  }, [sales]);

  // Form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!partner.trim() || dppAmount <= 0) return;

    const taxAmount = Math.round(0.11 * dppAmount);
    const newRecord = {
      id: `tax-${Date.now()}`,
      docNumber: docNumber.trim() || `010.002-26.${Date.now().toString().slice(-8)}`,
      type: taxType,
      partner: partner.trim(),
      date: new Date().toISOString().split('T')[0],
      dpp: Number(dppAmount),
      taxAmount: taxAmount,
      coretaxStatus: 'Siap Dilaporkan'
    };

    setTaxRecords((prev) => [newRecord, ...(Array.isArray(prev) ? prev : [])]);
    setIsModalOpen(false);
    setDocNumber('');
    setPartner('');
    setDppAmount(0);
    notify(`Faktur pajak ${newRecord.docNumber} berhasil dicatat.`);
  };

  // Toggle status
  const toggleStatus = (id) => {
    setTaxRecords((prev) =>
      (Array.isArray(prev) ? prev : []).map((t) => {
        if (t.id === id) {
          const next = t.coretaxStatus === 'Dilaporkan' ? 'Siap Dilaporkan' : 'Dilaporkan';
          return { ...t, coretaxStatus: next };
        }
        return t;
      })
    );
    notify('Status pelaporan faktur pajak diperbarui.');
  };

  // Delete tax record
  const handleDelete = (t) => {
    confirmAction({
      title: 'Hapus Faktur Pajak',
      message: `Hapus faktur pajak "${t.docNumber}" dari rekaman perpajakan?`,
      confirmText: 'Hapus Faktur Pajak',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setTaxRecords((prev) => (Array.isArray(prev) ? prev : []).filter((item) => item.id !== t.id));
        notify(`Faktur pajak ${t.docNumber} berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header matching live application */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Perpajakan &amp; Coretax
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Kalkulasi PPN Keluaran, PPN Masukan, rekonsiliasi e-Faktur Coretax, dan bukti potong PPh unifikasi.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Rekam Pajak</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setCoretaxNotice(
                'Pengiriman otomatis ke DJP Coretax Live API memerlukan Sertifikat Elektronik Pajak dan integrasi resmi dengan PJAP Mitra DJP. Fitur API langsung ini segera hadir.'
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>Kirim ke Coretax DJP API</span>
            <span className="rounded-md bg-white/20 text-[10px] font-bold px-1.5 py-0.5">
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: PPN Keluaran */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">PPN Keluaran (Dari Penjualan)</div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {formatRupiah(totalPpnKeluaran)}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">
            {sales.length > 0 ? `Dari ${sales.length} faktur penjualan` : 'Belum ada faktur terbit'}
          </div>
        </div>

        {/* Card 2: PPN Masukan */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">PPN Masukan (Dari Pembelian)</div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {formatRupiah(totalPpnMasukan)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {purchases.length > 0
              ? `Dapat dikreditkan dari ${purchases.length} tagihan`
              : 'Belum ada faktur pembelian'}
          </div>
        </div>

        {/* Card 3: Estimasi PPN Kurang / (Lebih) Bayar */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">
            Estimasi PPN Kurang / (Lebih) Bayar
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {formatRupiah(diffPpn)}
          </div>
          <div
            className={`text-[11px] font-medium mt-1 ${
              diffPpn > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600'
            }`}
          >
            {diffPpn > 0 ? 'Kewajiban setor ke kas negara' : 'Lebih bayar PPN'}
          </div>
        </div>

        {/* Card 4: PPh Pemotongan (Withholding) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">
            PPh Pemotongan (Withholding)
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {formatRupiah(totalWithholding)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Potongan PPh 21 / 23 terakumulasi
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('efaktur')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'efaktur'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>e-Faktur &amp; Coretax</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'efaktur' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {records.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ebupot')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'ebupot'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>e-Bupot Unifikasi (PPh)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ebilling')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'ebilling'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>e-Billing &amp; e-Filing</span>
        </button>
      </div>

      {/* TAB 1: e-Faktur & Coretax */}
      {activeTab === 'efaktur' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Faktur Pajak Terintegrasi
              </h2>
              <p className="text-xs text-slate-400">
                Pencatatan faktur pajak PPN keluaran dan masukan
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Faktur Pajak</span>
            </button>
          </div>

          {records.length === 0 ? (
            <div className="p-8">
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-12 text-center">
                <FileCheck2 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">
                  Belum ada rekam faktur pajak
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Faktur pajak dihitung otomatis dari transaksi penjualan dan pembelian, atau dapat diinput secara manual.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Rekam Faktur Pajak Pertama</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Nomor Faktur Pajak</th>
                    <th className="px-6 py-3.5">Nama Lawan Transaksi</th>
                    <th className="px-6 py-3.5">Jenis Pajak</th>
                    <th className="px-6 py-3.5 text-right">DPP (Dasar Pengenaan)</th>
                    <th className="px-6 py-3.5 text-right">Nilai PPN (11%)</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="font-mono px-6 py-4 text-xs font-bold text-blue-600">
                        {t.docNumber}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{t.partner}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{t.type}</td>
                      <td className="font-mono px-6 py-4 text-right font-medium text-slate-700">
                        {formatRupiah(t.dpp)}
                      </td>
                      <td className="font-mono px-6 py-4 text-right font-bold text-slate-900">
                        {formatRupiah(t.taxAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleStatus(t.id)}
                          className="cursor-pointer text-left"
                          title="Klik untuk ubah status pelaporan"
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              t.coretaxStatus === 'Dilaporkan'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                t.coretaxStatus === 'Dilaporkan' ? 'bg-blue-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{t.coretaxStatus}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(t)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Hapus faktur pajak"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: e-Bupot Unifikasi (PPh) */}
      {activeTab === 'ebupot' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xs">
          <div className="text-center py-8 space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              e-Bupot Unifikasi PPh Pasal 21, 23 &amp; 4 Ayat (2)
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Total pemotongan pajak withholding dari faktur penjualan terakumulasi sebesar{' '}
              <b className="text-slate-900">{formatRupiah(totalWithholding)}</b>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: e-Billing & e-Filing */}
      {activeTab === 'ebilling' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xs">
          <div className="max-w-md mx-auto py-6 space-y-4 text-center">
            <h2 className="text-base font-bold text-slate-900">Buat Kode Billing DJP</h2>
            <p className="text-xs text-slate-500">
              Estimasi PPN Kurang Bayar Masa Pajak:{' '}
              <b className="text-rose-600">{formatRupiah(Math.max(0, diffPpn))}</b>
            </p>
            <button
              type="button"
              onClick={() =>
                notify(
                  `Kode Billing 0192837482910 berhasil digenerate untuk PPN ${formatRupiah(
                    Math.max(0, diffPpn)
                  )}.`
                )
              }
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Generate ID Billing DJP
            </button>
          </div>
        </div>
      )}

      {/* Modal Rekam Faktur Pajak Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rekam Faktur Pajak Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">Simpan data faktur pajak ke sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jenis Pajak
                  </label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="PPN Keluaran">PPN Keluaran (Penjualan)</option>
                    <option value="PPN Masukan">PPN Masukan (Pembelian)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Faktur Pajak
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="010.002-26.12345678"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Lawan Transaksi (NPWP/Nama) *
                </label>
                <input
                  type="text"
                  required
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="PT Graha Konstruksi Utama"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nilai DPP (Dasar Pengenaan Pajak) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={dppAmount || ''}
                  onChange={(e) => setDppAmount(Number(e.target.value))}
                  placeholder="50000000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Simpan Faktur Pajak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Integrasi DJP Coretax API Notice */}
      {coretaxNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Integrasi DJP Coretax API</h3>
                <p className="text-xs text-slate-500 mt-0.5">Status Persyaratan Sistem Pajak</p>
              </div>
              <button
                type="button"
                onClick={() => setCoretaxNotice(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-3">
                <Lock className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-bold">Fitur Terkunci (Coming Soon)</div>
                  <div className="mt-1 text-slate-600">{coretaxNotice}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCoretaxNotice(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
