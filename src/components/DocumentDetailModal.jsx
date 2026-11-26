import React from 'react';
import { formatRupiah } from '../utils/format';
import { useAppContext } from '../context/AppContext';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Building,
  Copy,
  Printer,
  ExternalLink,
  Package
} from 'lucide-react';

export default function DocumentDetailModal({ isOpen, onClose, document: doc, onActionClick }) {
  const { notify } = useAppContext();

  if (!isOpen || !doc) return null;

  const paid = doc.paid ?? 0;
  const remaining = Math.max(0, (doc.total || 0) - paid);
  const progressPercent = doc.total > 0 ? Math.min(100, Math.round((paid / doc.total) * 100)) : 100;

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      notify(`${label} berhasil disalin ke clipboard!`);
    }
  };

  const statusLower = (doc.status || '').toLowerCase();
  let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  let StatusIcon = Clock;

  if (statusLower.includes('lunas') || statusLower.includes('selesai') || statusLower.includes('cair')) {
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    StatusIcon = CheckCircle2;
  } else if (statusLower.includes('approval') || statusLower.includes('pending') || statusLower.includes('proses')) {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    StatusIcon = Clock;
  } else if (statusLower.includes('tolak') || statusLower.includes('batal') || statusLower.includes('lewat')) {
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{doc.number}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{doc.status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {doc.type} • Sumber: {doc.source || 'Sistem Keuangan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Financial summary card */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Total Nilai Transaksi</span>
                <span className="text-lg font-black text-slate-900">{formatRupiah(doc.total)}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Telah Dibayar</span>
                <span className="text-base font-bold text-emerald-600">{formatRupiah(paid)}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Sisa Pembayaran / Tagihan</span>
                <span className="text-base font-bold text-rose-600">{formatRupiah(remaining)}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                <span>Progress Pelunasan</span>
                <span>{progressPercent}% ({formatRupiah(paid)} / {formatRupiah(doc.total)})</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details 2-col info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <Building className="h-4 w-4 text-blue-600" />
                <span>{doc.partyRole || 'Rekanan Transaksi'}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 pl-6">{doc.partyName || '-'}</div>
              {doc.warehouse && (
                <div className="text-slate-500 pl-6 text-[11px]">
                  Lokasi Gudang: <span className="font-semibold text-slate-700">{doc.warehouse}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-semibold text-slate-800">{doc.date || '-'}</span>
              </div>
              {doc.dueDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Jatuh Tempo:</span>
                  <span className="font-semibold text-slate-800">{doc.dueDate}</span>
                </div>
              )}
              {doc.paymentTerm && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Termin Bayar:</span>
                  <span className="font-semibold text-blue-700">{doc.paymentTerm}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description / Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>Catatan &amp; Keterangan Lengkap Dokumen</span>
              </h4>
              {doc.description && (
                <button
                  type="button"
                  onClick={() => handleCopy(doc.description || '', 'Catatan dokumen')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin Catatan</span>
                </button>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {doc.description ? doc.description : 'Tidak ada catatan tambahan untuk dokumen ini.'}
            </div>
          </div>

          {/* Items breakdown if present */}
          {doc.items && doc.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-blue-600" />
                <span>Rincian Barang / Komposisi ({doc.items.length} item)</span>
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Nama Item / Deskripsi</th>
                      <th className="px-4 py-2.5 text-right">Kuantitas</th>
                      {doc.items.some(e => e.price) && <th className="px-4 py-2.5 text-right">Harga Satuan</th>}
                      {doc.items.some(e => e.subtotal) && <th className="px-4 py-2.5 text-right">Subtotal</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doc.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2 font-medium text-slate-800">{item.name}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-700">
                          {item.qty?.toLocaleString('id-ID')} {item.unit || 'unit'}
                        </td>
                        {doc.items.some(e => e.price) && (
                          <td className="px-4 py-2 text-right text-slate-600">
                            {item.price ? formatRupiah(item.price) : '-'}
                          </td>
                        )}
                        {doc.items.some(e => e.subtotal) && (
                          <td className="px-4 py-2 text-right font-bold text-slate-900">
                            {item.subtotal ? formatRupiah(item.subtotal) : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(doc.number, 'Nomor Dokumen')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>Salin No. Dokumen</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Cetak Detail</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/tugas?doc=${encodeURIComponent(doc.number)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              title="Buka catatan dokumen ini di dedicated page penuh tanpa pop up"
            >
              <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
              <span>Buka di Dedicated Page Catatan</span>
            </a>
            {doc.moduleLink && (
              <a
                href={doc.moduleLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Buka di Halaman Modul</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
