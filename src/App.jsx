import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import KasBank from './pages/KasBank';
import Penjualan from './pages/Penjualan';
import Pembelian from './pages/Pembelian';
import Rekonsiliasi from './pages/Rekonsiliasi';
import Vendor from './pages/Vendor';
import BiayaAnggaran from './pages/BiayaAnggaran';
import InventoriProduksi from './pages/InventoriProduksi';
import Perpajakan from './pages/Perpajakan';
import Akuntansi from './pages/Akuntansi';
import Laporan from './pages/Laporan';
import Tugas from './pages/Tugas';
import AiAsisten from './pages/AiAsisten';
import Pemenuhan from './pages/Pemenuhan';
import Pengguna from './pages/Pengguna';
import Pengaturan from './pages/Pengaturan';
import Dokumentasi from './pages/Dokumentasi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border-2 border-rose-200 rounded-3xl text-rose-900 font-sans shadow-lg">
          <div className="flex items-center gap-3 text-rose-700 font-bold text-lg mb-2">
            <span>⚠️ Terjadi Masalah Saat Memuat Halaman</span>
          </div>
          <div className="text-sm font-semibold text-rose-950 mb-3">{this.state.error?.message}</div>
          <pre className="p-4 bg-white/80 rounded-2xl border border-rose-100 text-xs overflow-auto font-mono text-rose-800 leading-relaxed max-h-96 whitespace-pre-wrap">
            {this.state.error?.stack}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="ai" element={<AiAsisten />} />
                <Route path="tugas" element={<Tugas />} />
                <Route path="kas-bank" element={<KasBank />} />
                <Route path="rekonsiliasi" element={<Rekonsiliasi />} />
                <Route path="biaya-anggaran" element={<BiayaAnggaran />} />
                <Route path="laporan" element={<Laporan />} />
                <Route path="penjualan" element={<Penjualan />} />
                <Route path="pembelian" element={<Pembelian />} />
                <Route path="pemenuhan" element={<Pemenuhan />} />
                <Route path="vendor" element={<Vendor />} />
                <Route path="inventori-produksi" element={<InventoriProduksi />} />
                <Route path="perpajakan" element={<Perpajakan />} />
                <Route path="pengguna" element={<Pengguna />} />
                <Route path="akuntansi" element={<Akuntansi />} />
                <Route path="pengaturan" element={<Pengaturan />} />
                <Route path="dokumentasi" element={<Dokumentasi />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
