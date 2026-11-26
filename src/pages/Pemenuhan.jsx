import React, { useState, useMemo } from 'react';
import { useAppContext, DEFAULT_FULFILLMENTS } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import DocumentDetailModal from '../components/DocumentDetailModal';
import {
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const STAGES = [
  { status: 'Pesanan Baru', label: 'Pesanan baru', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  { status: 'Sedang Diproses', label: 'Sedang diproses', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  { status: 'Sedang Dikirim', label: 'Sedang dikirim', tone: 'bg-purple-50 text-purple-700 border-purple-200' },
  { status: 'Selesai', label: 'Selesai', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { status: 'Dibatalkan', label: 'Dibatalkan', tone: 'bg-slate-50 text-slate-600 border-slate-200' }
];

const STATUS_PROGRESSION = ['Pesanan Baru', 'Sedang Diproses', 'Sedang Dikirim', 'Selesai'];

export default function Pemenuhan() {
  const { notify, fulfillments, setFulfillments } = useAppContext();

  const [mode, setMode] = useState('Penjualan'); // 'Penjualan' | 'Pembelian'
  const [timeFilter, setTimeFilter] = useState('7 hari terakhir');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected document detail modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [partyName, setPartyName] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [totalNominal, setTotalNominal] = useState(0);
  const [courier, setCourier] = useState('Armada Truk Internal');
  const [warehouse, setWarehouse] = useState('Gudang Cikarang');
  const [etaDate, setEtaDate] = useState('2026-11-18');

  const items = Array.isArray(fulfillments) ? fulfillments : DEFAULT_FULFILLMENTS;

  // Filter items by type and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.type !== mode) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNumber = item.orderNumber?.toLowerCase().includes(query);
        const matchParty = item.partyName?.toLowerCase().includes(query);
        const matchDesc = item.itemsDescription?.toLowerCase().includes(query);
        if (!matchNumber && !matchParty && !matchDesc) return false;
      }
      return true;
    });
  }, [items, mode, searchQuery]);

  // Handle opening document details modal
  const handleOpenDetail = (item) => {
    setSelectedDoc({
      number: item.orderNumber,
      type: item.type === 'Penjualan' ? 'Surat Jalan & Delivery Order (DO)' : 'Penerimaan Barang Pengadaan (GRN)',
      partyName: item.partyName,
      partyRole: item.type === 'Penjualan' ? 'Pelanggan' : 'Vendor / Pemasok',
      date: item.date,
      dueDate: item.eta,
      total: item.total,
      paid: item.total,
      status: item.status,
      description: `Rincian: ${item.itemsDescription}\nKurir / Ekspedisi: ${item.courier || '-'}\nNo. Resi: ${item.trackingNumber || 'Armada Sendiri'}`,
      warehouse: item.warehouse,
      source: 'Lainnya'
    });
    setIsDetailOpen(true);
  };

  // Status progression advancement and rollback
  const moveStatus = (id, direction) => {
    setFulfillments((prev) => {
      const list = prev || DEFAULT_FULFILLMENTS;
      return list.map((item) => {
        if (item.id === id) {
          const idx = STATUS_PROGRESSION.indexOf(item.status);
          if (direction === -1 && idx > 0) {
            const nextStatus = STATUS_PROGRESSION[idx - 1];
            notify(`Status ${item.orderNumber} dikembalikan ke '${nextStatus}'.`);
            return { ...item, status: nextStatus };
          }
          if (direction === 1 && idx !== -1 && idx < STATUS_PROGRESSION.length - 1) {
            const nextStatus = STATUS_PROGRESSION[idx + 1];
            notify(`Status ${item.orderNumber} dimajukan ke '${nextStatus}'.`);
            return { ...item, status: nextStatus };
          }
        }
        return item;
      });
    });
  };

  // Handle create submission
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !partyName.trim()) {
      notify('Nomor pesanan dan nama rekanan wajib diisi!', 'warning');
      return;
    }

    const newItem = {
      id: `ful-${Date.now()}`,
      orderNumber: orderNumber.trim().toUpperCase(),
      partyName: partyName.trim(),
      type: mode,
      date: new Date().toISOString().split('T')[0],
      eta: etaDate,
      courier: courier || 'Armada Truk Internal',
      total: Number(totalNominal) || 0,
      status: 'Pesanan Baru',
      itemsDescription: itemsDescription.trim() || 'Item pesanan plastik komersial',
      warehouse: warehouse
    };

    setFulfillments((prev) => [newItem, ...(prev || DEFAULT_FULFILLMENTS)]);
    setIsCreateOpen(false);
    setOrderNumber('');
    setPartyName('');
    setItemsDescription('');
    setTotalNominal(0);
    notify(`Pesanan pemenuhan ${newItem.orderNumber} berhasil dibuat.`);
  };

  return (
    <div className="space-y-6">
      {/* Header matching live application */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Pemenuhan (Fulfillment Pipeline)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Pelacakan alur pengiriman pesanan penjualan dan penerimaan barang pembelian dalam pipeline visual interaktif.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Surat Jalan / DO</span>
        </button>
      </div>

      {/* Main card container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {/* Controls and filters bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          {/* Mode toggle pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMode('Penjualan')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'Penjualan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penjualan
            </button>
            <button
              type="button"
              onClick={() => setMode('Pembelian')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'Pembelian'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pembelian
            </button>
          </div>

          {/* Right filters: Duration, Refresh, Search */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="7 hari terakhir">7 hari terakhir</option>
              <option value="30 hari terakhir">30 hari terakhir</option>
              <option value="Bulan ini">Bulan ini</option>
              <option value="Semua">Semua</option>
            </select>

            <button
              type="button"
              onClick={() => notify('Pipeline data pemenuhan berhasil dimuat ulang.')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Muat ulang</span>
            </button>

            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 5-Column Kanban Board with wrap on md screens */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 min-h-[500px] bg-slate-50/30">
          {STAGES.map((stage) => {
            const colItems = filteredItems.filter((item) => item.status === stage.status);

            return (
              <div
                key={stage.status}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 flex flex-col flex-1 shadow-2xs"
              >
                {/* Column Title Header */}
                <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border ${stage.tone} mb-3`}>
                  <span>{stage.label}</span>
                  <span className="h-5 w-5 rounded-full bg-white/80 flex items-center justify-center text-[11px] font-black">
                    {colItems.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colItems.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      Tidak ada pesanan
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all text-xs space-y-2 group"
                      >
                        {/* Order Number & Date */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="font-bold text-blue-600 group-hover:underline flex items-center gap-1 font-mono text-left cursor-pointer"
                            title="Klik untuk melihat fokus detail dokumen"
                          >
                            <span>{item.orderNumber}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </button>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>

                        {/* Customer / Party & Item Description */}
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">
                            {item.partyName}
                          </div>
                          <div
                            onClick={() => handleOpenDetail(item)}
                            className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                            title="Klik catatan untuk membaca lengkap"
                          >
                            {item.itemsDescription}
                          </div>
                        </div>

                        {/* Warehouse Location & Total Value */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400">{item.warehouse}</span>
                          <span className="font-bold text-slate-900">{formatRupiah(item.total)}</span>
                        </div>

                        {/* Stage Advancement Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          {stage.status !== 'Pesanan Baru' && stage.status !== 'Dibatalkan' ? (
                            <button
                              type="button"
                              onClick={() => moveStatus(item.id, -1)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Kembalikan status"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                          ) : (
                            <div />
                          )}

                          {stage.status !== 'Selesai' && stage.status !== 'Dibatalkan' && (
                            <button
                              type="button"
                              onClick={() => moveStatus(item.id, 1)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Lanjut</span>
                              <ChevronRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Document Modal */}
      <DocumentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        document={selectedDoc}
      />

      {/* Buat Surat Jalan / DO Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Buat Surat Jalan Pemenuhan ({mode})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftarkan pengiriman pesanan baru ke dalam pipeline pemenuhan logistik
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Surat Jalan / DO *
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="DO-2026-004"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {mode === 'Penjualan' ? 'Nama Pelanggan *' : 'Nama Vendor *'}
                  </label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="PT Mitra Plastik Sukses"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Estimasi Tiba (ETA)
                  </label>
                  <input
                    type="date"
                    value={etaDate}
                    onChange={(e) => setEtaDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Total Nilai (IDR)
                  </label>
                  <input
                    type="number"
                    value={totalNominal || ''}
                    onChange={(e) => setTotalNominal(Number(e.target.value))}
                    placeholder="50000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Gudang Asal / Tujuan
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Gudang Cikarang">Gudang Cikarang</option>
                    <option value="Gudang Surabaya">Gudang Surabaya</option>
                    <option value="Gudang Bandung">Gudang Bandung</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Armada / Kurir
                  </label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="Armada Truk Internal Asia Plastik"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Rincian Barang &amp; Catatan Pengiriman
                </label>
                <textarea
                  rows={2}
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  placeholder="Contoh: 800 Roll Kantong Plastik Roll HDPE 40x60 Transparan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Daftarkan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
