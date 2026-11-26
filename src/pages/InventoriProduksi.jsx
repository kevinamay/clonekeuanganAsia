import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { Boxes, Factory } from 'lucide-react';

export default function InventoriProduksi() {
  const { products, workOrders } = useAppContext();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Inventori &amp; Gudang</h1>
        <p className="mt-1 text-xs text-slate-500">Stok biji plastik resin, additive masterbatch &amp; Perintah Kerja (WO)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Katalog Bahan Baku &amp; Stok</h3>
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="text-slate-400">{p.category} • {p.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-blue-700">{p.stock?.toLocaleString()} {p.unit}</div>
                  <div className="text-[10px] text-slate-500">@ {formatRupiah(p.standardPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Work Orders (WO) Produksi</h3>
          <div className="space-y-3">
            {workOrders.map((wo, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-600">{wo.woNumber}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{wo.status}</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">{wo.product}</div>
                <div className="mt-2 text-slate-500 flex justify-between">
                  <span>Progres: {wo.qtyDone} / {wo.qtyTarget}</span>
                  <span>Biaya Aktual: {formatRupiah(wo.actualCost)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
