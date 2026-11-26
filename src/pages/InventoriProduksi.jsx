import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/format';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Trash2,
  PenLine,
  Warehouse,
  Boxes,
  Package,
  X,
  ChevronDown,
  Factory,
  Check
} from 'lucide-react';

const DEFAULT_BOMS = [];

export default function InventoriProduksi() {
  const {
    products = [],
    setProducts,
    workOrders = [],
    setWorkOrders,
    auditLogs = [],
    setAuditLogs,
    notify,
    confirmAction
  } = useAppContext();
  const { user } = useAuth();

  // Active top tab: 'produk' | 'gudang' | 'produksi'
  const [activeTab, setActiveTab] = useState('produk');

  // Produksi Sub-tab: 'bom' | 'wo'
  const [prodSubTab, setProdSubTab] = useState('bom');
  const [boms, setBoms] = useState(DEFAULT_BOMS);
  const [showArchivedBom, setShowArchivedBom] = useState(false);
  const [searchBom, setSearchBom] = useState('');
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  // Search filters
  const [searchProduct, setSearchProduct] = useState('');
  const [searchWarehouse, setSearchWarehouse] = useState('');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCreateWoOpen, setIsCreateWoOpen] = useState(false);
  const [isCreateBomOpen, setIsCreateBomOpen] = useState(false);

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Barang Jadi');
  const [editUnit, setEditUnit] = useState('Pcs');
  const [editPrice, setEditPrice] = useState(0);
  const [editWholesalePrice, setEditWholesalePrice] = useState(0);
  const [editReorderMin, setEditReorderMin] = useState(10);
  const [editRack, setEditRack] = useState('R-01');
  const [editBatch, setEditBatch] = useState('B-2026');

  // Stock Opname Modal
  const [opnameProduct, setOpnameProduct] = useState(null);
  const [opnameJkt, setOpnameJkt] = useState(0);
  const [opnameSby, setOpnameSby] = useState(0);
  const [opnameBdg, setOpnameBdg] = useState(0);
  const [opnameReason, setOpnameReason] = useState('Hasil Stock Opname Fisik Gudang');

  // Add Product Form State
  const [addSku, setAddSku] = useState('');
  const [addName, setAddName] = useState('');
  const [addUnit, setAddUnit] = useState('Pcs');
  const [addPrice, setAddPrice] = useState(0);
  const [addWholesalePrice, setAddWholesalePrice] = useState(0);
  const [addStockJkt, setAddStockJkt] = useState(0);
  const [addReorderMin, setAddReorderMin] = useState(10);

  // Transfer Form State
  const [transferSku, setTransferSku] = useState('');
  const [transferFrom, setTransferFrom] = useState('Jkt');
  const [transferTo, setTransferTo] = useState('Sby');
  const [transferQty, setTransferQty] = useState(0);

  // Create WO Form State
  const [woProduct, setWoProduct] = useState('');
  const [woTargetQty, setWoTargetQty] = useState(100);
  const [woStdCost, setWoStdCost] = useState(0);

  // Create BOM Form State
  const [bomName, setBomName] = useState('');
  const [bomCode, setBomCode] = useState('');
  const [bomCategory, setBomCategory] = useState('Blow Film Extrusion');
  const [bomProduct, setBomProduct] = useState('');
  const [bomDesc, setBomDesc] = useState('');

  // KPI Calculations
  const totalInventoryValue = useMemo(() => {
    return (products || []).reduce(
      (acc, p) =>
        acc +
        ((p.stockJkt || 0) + (p.stockSby || 0) + (p.stockBdg || 0)) *
          (p.wholesalePrice || p.price || 0),
      0
    );
  }, [products]);

  const lowStockCount = useMemo(() => {
    return (products || []).filter(
      (p) =>
        (p.stockJkt || 0) + (p.stockSby || 0) + (p.stockBdg || 0) <= (p.reorderMin || 0)
    ).length;
  }, [products]);

  const totalFinishedQty = useMemo(() => {
    return (workOrders || []).reduce((acc, wo) => acc + (wo.qtyDone || 0), 0);
  }, [workOrders]);

  const activeWoCount = useMemo(() => {
    return (workOrders || []).filter((wo) => wo.status !== 'Selesai').length;
  }, [workOrders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!searchProduct.trim()) return list;
    const q = searchProduct.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.rack?.toLowerCase().includes(q)
    );
  }, [products, searchProduct]);

  // Filtered Warehouse list
  const filteredWarehouseProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!searchWarehouse.trim()) return list;
    const q = searchWarehouse.toLowerCase().trim();
    return list.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    );
  }, [products, searchWarehouse]);

  // Helper audit logger
  const logAudit = (action) => {
    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (setAuditLogs) {
      setAuditLogs((prev) => [
        {
          time: timeStr,
          user: user?.name || user?.email || 'Carlos Susanto',
          action,
          module: 'Inventori & Gudang'
        },
        ...(Array.isArray(prev) ? prev : [])
      ]);
    }
  };

  // Add product handler
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!addName.trim()) return;

    const newProd = {
      sku: addSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      name: addName.trim(),
      type: 'Barang Jadi',
      unit: addUnit,
      price: Number(addPrice) || 0,
      wholesalePrice: Number(addWholesalePrice) || Number(addPrice) || 0,
      stockJkt: Number(addStockJkt) || 0,
      stockSby: 0,
      stockBdg: 0,
      rack: 'R-01',
      batch: 'B-2026',
      expiry: '-',
      reorderMin: Number(addReorderMin) || 10,
      consignment: false
    };

    setProducts((prev) => [newProd, ...(prev || [])]);
    setIsAddProductOpen(false);
    setAddSku('');
    setAddName('');
    setAddPrice(0);
    setAddWholesalePrice(0);
    setAddStockJkt(0);
    logAudit(`Tambah Produk Baru: ${newProd.sku} - ${newProd.name} (Stok Awal Jkt: ${newProd.stockJkt} ${newProd.unit})`);
    notify(`Produk ${newProd.name} berhasil ditambahkan ke inventori.`);
  };

  // Edit product start
  const handleStartEditProduct = (p) => {
    setEditingProduct(p);
    setEditSku(p.sku);
    setEditName(p.name);
    setEditType(p.type || 'Barang Jadi');
    setEditUnit(p.unit || 'Pcs');
    setEditPrice(p.price || 0);
    setEditWholesalePrice(p.wholesalePrice || p.price || 0);
    setEditReorderMin(p.reorderMin || 10);
    setEditRack(p.rack || 'R-01');
    setEditBatch(p.batch || 'B-2026');
  };

  // Edit product submit
  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = {
      ...editingProduct,
      sku: editSku.trim(),
      name: editName.trim(),
      type: editType,
      unit: editUnit,
      price: Number(editPrice) || 0,
      wholesalePrice: Number(editWholesalePrice) || 0,
      reorderMin: Number(editReorderMin) || 10,
      rack: editRack.trim() || 'R-01',
      batch: editBatch.trim() || 'B-2026'
    };

    setProducts((prev) =>
      (prev || []).map((p) => (p.sku === editingProduct.sku ? updated : p))
    );
    setEditingProduct(null);
    logAudit(`Perbarui Produk: ${updated.sku} - ${updated.name}`);
    notify(`Data produk ${updated.name} berhasil diperbarui.`);
  };

  // Delete product
  const handleDeleteProduct = (p) => {
    confirmAction({
      title: 'Hapus Produk',
      message: `Hapus produk "${p.name}" (${p.sku}) dari katalog inventori?`,
      confirmText: 'Hapus Produk',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setProducts((prev) => (prev || []).filter((item) => item.sku !== p.sku));
        logAudit(`Hapus Produk: ${p.sku} - ${p.name}`);
        notify(`Produk ${p.name} berhasil dihapus.`);
      }
    });
  };

  // Transfer warehouse submit
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferSku || transferQty <= 0) return;
    if (transferFrom === transferTo) {
      notify('Gudang asal dan tujuan tidak boleh sama.', 'warning');
      return;
    }

    const targetProduct = (products || []).find((p) => p.sku === transferSku);
    if (!targetProduct) return;

    const available =
      transferFrom === 'Jkt'
        ? targetProduct.stockJkt || 0
        : transferFrom === 'Sby'
        ? targetProduct.stockSby || 0
        : targetProduct.stockBdg || 0;

    if (available < transferQty) {
      notify('Kuantitas di gudang asal tidak mencukupi untuk transfer.', 'warning');
      return;
    }

    setProducts((prev) =>
      (prev || []).map((p) => {
        if (p.sku !== transferSku) return p;
        const copy = { ...p };
        if (transferFrom === 'Jkt') copy.stockJkt = (copy.stockJkt || 0) - transferQty;
        if (transferFrom === 'Sby') copy.stockSby = (copy.stockSby || 0) - transferQty;
        if (transferFrom === 'Bdg') copy.stockBdg = (copy.stockBdg || 0) - transferQty;

        if (transferTo === 'Jkt') copy.stockJkt = (copy.stockJkt || 0) + transferQty;
        if (transferTo === 'Sby') copy.stockSby = (copy.stockSby || 0) + transferQty;
        if (transferTo === 'Bdg') copy.stockBdg = (copy.stockBdg || 0) + transferQty;
        return copy;
      })
    );

    setIsTransferOpen(false);
    setTransferQty(0);
    logAudit(`Transfer Antargudang: ${transferQty} unit ${targetProduct.name} (${targetProduct.sku}) dari Gudang ${transferFrom} ke Gudang ${transferTo}`);
    notify(`Transfer ${transferQty} unit ${targetProduct.name} antar gudang berhasil dibukukan.`);
  };

  // Stock Opname start
  const handleStartStockOpname = (p) => {
    setOpnameProduct(p);
    setOpnameJkt(p.stockJkt || 0);
    setOpnameSby(p.stockSby || 0);
    setOpnameBdg(p.stockBdg || 0);
    setOpnameReason('Hasil Stock Opname Fisik Gudang');
  };

  // Stock Opname submit
  const handleStockOpnameSubmit = (e) => {
    e.preventDefault();
    if (!opnameProduct) return;

    setProducts((prev) =>
      (prev || []).map((p) => {
        if (p.sku !== opnameProduct.sku) return p;
        return {
          ...p,
          stockJkt: Number(opnameJkt) || 0,
          stockSby: Number(opnameSby) || 0,
          stockBdg: Number(opnameBdg) || 0
        };
      })
    );

    logAudit(`Stock Opname: Penyesuaian stok fisik ${opnameProduct.name} (${opnameProduct.sku}) Jkt: ${opnameJkt}, Sby: ${opnameSby}, Bdg: ${opnameBdg}. Alasan: ${opnameReason}`);
    setOpnameProduct(null);
    notify(`Stok fisik ${opnameProduct.name} berhasil disesuaikan.`);
  };

  // Create WO submit
  const handleCreateWoSubmit = (e) => {
    e.preventDefault();
    if (!woProduct.trim() || woTargetQty <= 0) return;

    const newWo = {
      woNumber: `WO-2026-${300 + (workOrders || []).length + 1}`,
      product: woProduct.trim(),
      bomLevel: 'Multi-Level Assembly',
      qtyTarget: Number(woTargetQty),
      qtyDone: 0,
      stdCost: Number(woStdCost) || 0,
      actualCost: Number(woStdCost) || 0,
      status: 'Dalam Proses'
    };

    setWorkOrders((prev) => [newWo, ...(prev || [])]);
    setIsCreateWoOpen(false);
    setWoProduct('');
    setWoTargetQty(100);
    setWoStdCost(0);
    logAudit(`Terbitkan Work Order: ${newWo.woNumber} - ${newWo.product} (Target: ${newWo.qtyTarget} Unit)`);
    notify(`Work Order ${newWo.woNumber} berhasil diterbitkan.`);
  };

  // Advance WO status
  const handleAdvanceWo = (wo) => {
    setWorkOrders((prev) =>
      (prev || []).map((item) => {
        if (item.woNumber === wo.woNumber) {
          return {
            ...item,
            qtyDone: item.qtyTarget,
            status: 'Selesai'
          };
        }
        return item;
      })
    );
    notify(`Work Order ${wo.woNumber} telah ditandai Selesai.`);
  };

  // Create BOM submit
  const handleCreateBomSubmit = (e) => {
    e.preventDefault();
    if (!bomName.trim() || !bomCode.trim() || !bomProduct.trim()) {
      notify('Nama BOM, Kode BOM, dan Produk Jadi wajib diisi!', 'warning');
      return;
    }

    const newBom = {
      id: `bom-${Date.now()}`,
      name: bomName.trim(),
      code: bomCode.trim().toUpperCase(),
      category: bomCategory,
      costBasis: 'Biaya Standar',
      product: bomProduct.trim(),
      description: bomDesc.trim() || 'Resep formula bill of materials pabrik plastik.',
      components: [
        { name: 'Biji Plastik Murni (Resin)', qty: 1, unit: 'Kg', unitCost: 23000 },
        { name: 'Pigmen / Aditif Tambahan', qty: 0.05, unit: 'Kg', unitCost: 65000 }
      ]
    };

    setBoms((prev) => [newBom, ...(prev || DEFAULT_BOMS)]);
    setIsCreateBomOpen(false);
    setBomName('');
    setBomCode('');
    setBomProduct('');
    setBomDesc('');
    notify(`Bill of Material '${newBom.name}' (${newBom.code}) berhasil dibuat ke sistem!`);
  };

  // Delete BOM
  const handleDeleteBom = (bom) => {
    confirmAction({
      title: 'Hapus Formula BOM',
      message: `Hapus Bill of Materials ${bom.name}?`,
      confirmText: 'Hapus BOM',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        setBoms((prev) => (prev || DEFAULT_BOMS).filter((b) => b.id !== bom.id));
        notify(`BOM '${bom.name}' berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header matching live application */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Inventori, Multi-Gudang &amp; Produksi
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manajemen SKU, stok lintas gudang Jakarta/Surabaya/Bandung, reorder point, dan perintah kerja produksi (Work Order).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-sm transition-all cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
            <span>Transfer Gudang</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddProductOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Produk SKU</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Nilai Persediaan */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Total Nilai Persediaan</div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {formatRupiah(totalInventoryValue)}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">
            {products.length > 0 ? `Dari ${products.length} SKU terdaftar` : 'Belum ada produk di gudang'}
          </div>
        </div>

        {/* Card 2: Peringatan Stok Minimum */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Peringatan Stok Minimum</div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {lowStockCount} SKU
          </div>
          <div className={`text-[11px] font-medium mt-1 ${lowStockCount > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}`}>
            {lowStockCount > 0 ? 'Perlu reorder segera' : 'Stok gudang aman'}
          </div>
        </div>

        {/* Card 3: Produksi Selesai (Fulfillment) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Produksi Selesai (Fulfillment)</div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {totalFinishedQty} Unit
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Total output produk jadi
          </div>
        </div>

        {/* Card 4: Work Order Aktif (WIP) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Work Order Aktif (WIP)</div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            {activeWoCount} Perintah Kerja
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Sedang berjalan di jalur produksi
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('produk')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'produk'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Katalog Produk &amp; Harga</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'produk' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {products.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gudang')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'gudang'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Multi-Gudang (Jkt/Sby/Bdg)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('produksi')}
          className={`inline-flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'produksi'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Perintah Kerja (Work Order)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'produksi' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {workOrders.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Katalog Produk & Harga */}
      {activeTab === 'produk' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama produk, SKU, rak..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none shadow-2xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                Menampilkan <strong className="text-slate-800">{filteredProducts.length}</strong> dari{' '}
                <strong className="text-slate-800">{products.length}</strong> SKU
              </span>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Produk</span>
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8">
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-12 text-center">
                <div className="h-14 w-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Katalog produk belum terisi</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Tambahkan produk bahan baku atau barang jadi untuk mengelola stok, harga grosir, dan kontrol persediaan.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Produk Pertama</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Nama &amp; SKU</th>
                    <th className="px-6 py-3.5">Tipe &amp; Rak</th>
                    <th className="px-6 py-3.5">Satuan</th>
                    <th className="px-6 py-3.5 text-right">Harga Jual (Retail)</th>
                    <th className="px-6 py-3.5 text-right">Harga Grosir</th>
                    <th className="px-6 py-3.5 text-right">Total Stok</th>
                    <th className="px-6 py-3.5">Status Stok</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const totalStock = (p.stockJkt || 0) + (p.stockSby || 0) + (p.stockBdg || 0);
                    const isLow = totalStock <= (p.reorderMin || 0);
                    return (
                      <tr key={p.sku} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="font-mono text-[11px] text-blue-600 font-bold">{p.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          <div>{p.type || 'Barang Jadi'}</div>
                          <div className="text-[11px] text-slate-400">Rak: {p.rack || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">{p.unit}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                          {formatRupiah(p.price)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-500">
                          {formatRupiah(p.wholesalePrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {totalStock} {p.unit}
                        </td>
                        <td className="px-6 py-4">
                          {isLow ? (
                            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                              Stok Menipis
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                              Tersedia
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditProduct(p)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-2xs cursor-pointer"
                              title="Edit Detail Produk"
                            >
                              <PenLine className="h-3.5 w-3.5 text-blue-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              className="rounded-xl border border-rose-200 bg-rose-50/50 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* TAB 2: Multi-Gudang (Jkt/Sby/Bdg) */}
      {activeTab === 'gudang' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Alokasi Kuantitas per Lokasi Gudang</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Stock Opname Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sebaran stok produk di Gudang Jakarta, Surabaya, dan Bandung (Klik tombol “Edit Stok Gudang” untuk menyesuaikan stok fisik).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari SKU / nama di gudang..."
                  value={searchWarehouse}
                  onChange={(e) => setSearchWarehouse(e.target.value)}
                  className="w-56 sm:w-64 rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                />
                {searchWarehouse && (
                  <button
                    type="button"
                    onClick={() => setSearchWarehouse('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsTransferOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Transfer Antargudang</span>
              </button>
            </div>
          </div>

          {filteredWarehouseProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada produk yang dialokasikan di multi-gudang.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Produk &amp; SKU</th>
                    <th className="px-6 py-3.5 text-right">Gudang Jakarta (Jkt)</th>
                    <th className="px-6 py-3.5 text-right">Gudang Surabaya (Sby)</th>
                    <th className="px-6 py-3.5 text-right">Gudang Bandung (Bdg)</th>
                    <th className="px-6 py-3.5 text-right">Total Akumulasi</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarehouseProducts.map((p) => {
                    const total = (p.stockJkt || 0) + (p.stockSby || 0) + (p.stockBdg || 0);
                    return (
                      <tr key={p.sku} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="font-mono text-[11px] text-blue-600 font-bold">{p.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-800">
                          {p.stockJkt || 0} {p.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-800">
                          {p.stockSby || 0} {p.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-800">
                          {p.stockBdg || 0} {p.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-950">
                          {total} {p.unit}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleStartStockOpname(p)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-2xs cursor-pointer"
                            title="Sesuaikan stok fisik gudang (Stock Opname)"
                          >
                            <PenLine className="h-3.5 w-3.5 text-blue-600" />
                            <span>Edit Stok Gudang</span>
                          </button>
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

      {/* TAB 3: Perintah Kerja (Work Order) */}
      {activeTab === 'produksi' && (
        <div className="space-y-4">
          {/* Sub-nav bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-100 pb-2 sm:pb-0">
              <button
                type="button"
                onClick={() => setProdSubTab('bom')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  prodSubTab === 'bom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Daftar bill of material (BOM)
              </button>
              <button
                type="button"
                onClick={() => setProdSubTab('wo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  prodSubTab === 'wo'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Daftar perintah kerja ({workOrders.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => notify('Atur akun biaya standar telah tersinkron dengan Bagan Akun (CoA).')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Atur akun biaya &amp; biaya standar
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Tindakan</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {actionDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 z-30 animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Bill of Material
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActionDropdownOpen(false);
                        setIsCreateBomOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 text-blue-600" />
                      <span>Buat bill of material</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Perintah Kerja
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActionDropdownOpen(false);
                        setIsCreateWoOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Factory className="h-3.5 w-3.5 text-blue-600" />
                      <span>Buat perintah kerja</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Banner notification */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                <strong>Baru:</strong> Biaya standar untuk bill of material (BOM). Jika Anda ingin menerapkan biaya standar, silakan buat atau sesuaikan data komponen BOM.
              </span>
            </div>
            <button
              type="button"
              onClick={() => notify('Seluruh struktur BOM dan resep biaya telah disinkronkan ke sistem.')}
              className="text-xs font-bold text-blue-700 hover:underline shrink-0 cursor-pointer"
            >
              Sinkronkan sekarang
            </button>
          </div>

          {/* Subtab BOM */}
          {prodSubTab === 'bom' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showArchivedBom}
                      onChange={(e) => setShowArchivedBom(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Tampilkan BOM diarsipkan</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchBom}
                      onChange={(e) => setSearchBom(e.target.value)}
                      placeholder="Cari kode atau nama BOM..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {boms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 mx-auto mb-3 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Boxes className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Daftar bill of material akan muncul di sini</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Buat bill of material melalui tombol Tindakan di atas untuk mengatur formula resep produksi plastik.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreateBomOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Buat Bill of Material Pertama
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Nama BOM</th>
                        <th className="px-6 py-3.5">Kode BOM</th>
                        <th className="px-6 py-3.5">Kategori</th>
                        <th className="px-6 py-3.5">Acuan Perhitungan Biaya</th>
                        <th className="px-6 py-3.5">Produk Jadi</th>
                        <th className="px-6 py-3.5">Komponen / Formula</th>
                        <th className="px-6 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {boms
                        .filter(
                          (b) =>
                            !searchBom ||
                            b.name.toLowerCase().includes(searchBom.toLowerCase()) ||
                            b.code.toLowerCase().includes(searchBom.toLowerCase())
                        )
                        .map((bom) => (
                          <tr key={bom.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{bom.name}</td>
                            <td className="px-6 py-4 font-mono font-bold text-blue-600">{bom.code}</td>
                            <td className="px-6 py-4 text-slate-600">{bom.category}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                {bom.costBasis}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">{bom.product}</td>
                            <td className="px-6 py-4 text-slate-500">
                              {bom.components && bom.components.length > 0 ? (
                                <div className="space-y-0.5">
                                  {bom.components.map((c, idx) => (
                                    <div key={idx} className="text-[11px]">
                                      • {c.qty} {c.unit} {c.name}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span>{bom.description || '-'}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteBom(bom)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus BOM"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

          {/* Subtab WO */}
          {prodSubTab === 'wo' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Perintah Kerja Produksi (Work Orders)</h2>
                  <p className="text-xs text-slate-400">Proses perakitan dan konversi bahan baku menjadi barang jadi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateWoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Terbitkan Work Order</span>
                </button>
              </div>

              {workOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-12 text-center">
                    <Factory className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-900">Belum ada perintah kerja (WO) aktif</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Terbitkan work order produksi untuk menjadwalkan perakitan produk jadi dan melacak biaya pokok produksi.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCreateWoOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Terbitkan WO Pertama</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Nomor WO</th>
                        <th className="px-6 py-3.5">Produk Jadi</th>
                        <th className="px-6 py-3.5 text-right">Target Qty</th>
                        <th className="px-6 py-3.5 text-right">Selesai</th>
                        <th className="px-6 py-3.5 text-right">Biaya Standar</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workOrders.map((wo, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="font-mono px-6 py-4 text-xs font-bold text-blue-600">{wo.woNumber}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{wo.product}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700">{wo.qtyTarget}</td>
                          <td className="px-6 py-4 text-right font-semibold text-emerald-600">{wo.qtyDone || 0}</td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-900">
                            {formatRupiah(wo.stdCost || wo.actualCost || 0)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                              {wo.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleAdvanceWo(wo)}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <span>Proses Selesai</span>
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
        </div>
      )}

      {/* Modal Tambah Produk SKU */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Produk SKU Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftarkan SKU produk baru ke dalam katalog persediaan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kode SKU (Opsional)
                  </label>
                  <input
                    type="text"
                    value={addSku}
                    onChange={(e) => setAddSku(e.target.value)}
                    placeholder="Contoh: SKU-HD-001"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Satuan (Unit) *
                  </label>
                  <select
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Roll">Roll</option>
                    <option value="Kg">Kg</option>
                    <option value="Lembar">Lembar</option>
                    <option value="Box">Box</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Produk / Bahan Baku *
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Kantong Plastik HDPE Roll 40x60 Transparan"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Harga Jual (Retail / Box)
                  </label>
                  <input
                    type="number"
                    value={addPrice || ''}
                    onChange={(e) => setAddPrice(Number(e.target.value))}
                    placeholder="175000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Harga Grosir (Wholesale)
                  </label>
                  <input
                    type="number"
                    value={addWholesalePrice || ''}
                    onChange={(e) => setAddWholesalePrice(Number(e.target.value))}
                    placeholder="145000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Stok Awal di Gudang Jakarta
                  </label>
                  <input
                    type="number"
                    value={addStockJkt || ''}
                    onChange={(e) => setAddStockJkt(Number(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Peringatan Stok Minimum (Reorder Point)
                  </label>
                  <input
                    type="number"
                    value={addReorderMin || ''}
                    onChange={(e) => setAddReorderMin(Number(e.target.value))}
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Produk SKU */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Data Produk: {editingProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui spesifikasi, harga jual, dan reorder point</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kode SKU</label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tipe Produk</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Barang Jadi">Barang Jadi</option>
                    <option value="Bahan Baku">Bahan Baku</option>
                    <option value="Kemasan & Packaging">Kemasan &amp; Packaging</option>
                    <option value="Sparepart">Sparepart</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Reorder Point Min</label>
                  <input
                    type="number"
                    value={editReorderMin || ''}
                    onChange={(e) => setEditReorderMin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Harga Jual (Retail)</label>
                  <input
                    type="number"
                    value={editPrice || ''}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Harga Grosir</label>
                  <input
                    type="number"
                    value={editWholesalePrice || ''}
                    onChange={(e) => setEditWholesalePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Lokasi Rak</label>
                  <input
                    type="text"
                    value={editRack}
                    onChange={(e) => setEditRack(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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

      {/* Modal Transfer Antargudang */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transfer Stok Antargudang</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pindahkan stok fisik antar lokasi gudang Jakarta, Surabaya, dan Bandung</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Pilih Produk SKU *</label>
                <select
                  value={transferSku}
                  onChange={(e) => setTransferSku(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Pilih Produk yang akan Ditransfer --</option>
                  {(products || []).map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) - Jkt: {p.stockJkt || 0}, Sby: {p.stockSby || 0}, Bdg: {p.stockBdg || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Gudang Asal *</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Jkt">Gudang Jakarta (Jkt)</option>
                    <option value="Sby">Gudang Surabaya (Sby)</option>
                    <option value="Bdg">Gudang Bandung (Bdg)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Gudang Tujuan *</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Jkt">Gudang Jakarta (Jkt)</option>
                    <option value="Sby">Gudang Surabaya (Sby)</option>
                    <option value="Bdg">Gudang Bandung (Bdg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Jumlah Kuantitas Transfer *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferQty || ''}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  placeholder="Contoh: 50"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Proses Transfer Antargudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Stok Gudang (Stock Opname) */}
      {opnameProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stock Opname: {opnameProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesuaikan kuantitas stok fisik riil di masing-masing lokasi gudang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpnameProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStockOpnameSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Gudang Jakarta ({opnameProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={opnameJkt}
                    onChange={(e) => setOpnameJkt(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Gudang Surabaya ({opnameProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={opnameSby}
                    onChange={(e) => setOpnameSby(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Gudang Bandung ({opnameProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={opnameBdg}
                    onChange={(e) => setOpnameBdg(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alasan / Keterangan Penyesuaian
                </label>
                <input
                  type="text"
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value)}
                  placeholder="Contoh: Hasil Stock Opname Fisik Akhir Bulan"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpnameProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Simpan Penyesuaian Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Terbitkan Work Order */}
      {isCreateWoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Terbitkan Perintah Kerja Produksi (WO)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Jadwalkan konversi dan perakitan produk jadi di lini pabrik</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateWoOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWoSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Produk Jadi / Target Produksi *
                </label>
                <input
                  type="text"
                  required
                  value={woProduct}
                  onChange={(e) => setWoProduct(e.target.value)}
                  placeholder="Contoh: Kantong Plastik Roll HDPE 40x60 Transparan"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Kuantitas *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={woTargetQty || ''}
                    onChange={(e) => setWoTargetQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Estimasi Biaya Pokok (IDR)
                  </label>
                  <input
                    type="number"
                    value={woStdCost || ''}
                    onChange={(e) => setWoStdCost(Number(e.target.value))}
                    placeholder="25000000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateWoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Terbitkan WO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat BOM */}
      {isCreateBomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Buat Bill of Material (BOM) Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">Definisikan formula resep dan kebutuhan bahan baku konversi produksi</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateBomOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBomSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nama BOM *</label>
                  <input
                    type="text"
                    required
                    value={bomName}
                    onChange={(e) => setBomName(e.target.value)}
                    placeholder="Contoh: BOM Kantong HDPE 50x75"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kode BOM *</label>
                  <input
                    type="text"
                    required
                    value={bomCode}
                    onChange={(e) => setBomCode(e.target.value)}
                    placeholder="BOM-HDPE-5075"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori BOM</label>
                  <select
                    value={bomCategory}
                    onChange={(e) => setBomCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Blow Film Extrusion">Blow Film Extrusion</option>
                    <option value="Cast PP Sheet">Cast PP Sheet</option>
                    <option value="Injection Molding">Injection Molding</option>
                    <option value="Bag Making / Cutting">Bag Making / Cutting</option>
                    <option value="Packaging & Assembly">Packaging &amp; Assembly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Produk Jadi Terkait *</label>
                  <input
                    type="text"
                    required
                    value={bomProduct}
                    onChange={(e) => setBomProduct(e.target.value)}
                    placeholder="Contoh: Kantong Sampah HDPE Hitam Roll"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Keterangan / Catatan Formulasi</label>
                <textarea
                  rows={2}
                  value={bomDesc}
                  onChange={(e) => setBomDesc(e.target.value)}
                  placeholder="Catatan formulasi temperatur mesin, rasio bahan baku, dan target output..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <span className="font-semibold block mb-1 text-slate-800">Komponen Bahan Baku Bawaan:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Biji Plastik Murni (Resin): 1.00 Kg (@ Rp 23.000)</li>
                  <li>Pigmen / Aditif Tambahan: 0.05 Kg (@ Rp 65.000)</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBomOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  Simpan Bill of Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
