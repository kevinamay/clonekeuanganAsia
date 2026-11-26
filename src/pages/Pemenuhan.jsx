import React from 'react';
import { Truck } from 'lucide-react';

export default function Pemenuhan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Pemenuhan &amp; Logistik</h1>
        <p className="mt-1 text-xs text-slate-500">Surat Jalan (SJ), Delivery Order &amp; pelacakan pengiriman produk plastik</p>
      </div>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 flex justify-between items-center">
            <div>
              <div className="font-mono font-bold text-blue-600">SJ-2026-001</div>
              <div className="font-bold text-slate-900 mt-1">PT Surya Kencana Packindo (Surabaya)</div>
              <div className="text-slate-400">1.000 Roll Kantong Plastik HDPE 40x60</div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">Terkirim</span>
          </div>
        </div>
      </div>
    </div>
  );
}
