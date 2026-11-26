import React from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';

export default function Dokumentasi() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Dokumentasi &amp; Panduan Operasional</h1>
        <p className="mt-1 text-xs text-slate-500">SOP akuntansi, panduan alur bisnis Asia Plastik &amp; referensi API MCP</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4 text-xs leading-relaxed text-slate-600">
        <h3 className="text-sm font-bold text-slate-900">Alur Standar Pembukuan Finansial:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Pembelian (Procurement):</strong> Penerbitan PO ke vendor bahan baku resin -&gt; Penerimaan Barang -&gt; Pencatatan Utang Usaha (AP).</li>
          <li><strong>Penjualan (Sales):</strong> Penerbitan Faktur Penjualan (INV) -&gt; Pengiriman Logistik via Surat Jalan -&gt; Pelunasan Piutang Usaha (AR).</li>
          <li><strong>Kas &amp; Bank:</strong> Rekonsiliasi mutasi harian BCA &amp; Mandiri -&gt; Pencocokan otomatis mutasi kas.</li>
          <li><strong>Perpajakan:</strong> Penerbitan Faktur Pajak PPN 11% Keluaran &amp; Masukan via integrasi Coretax.</li>
        </ol>
      </div>
    </div>
  );
}
