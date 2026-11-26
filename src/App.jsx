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

export default function App() {
  return (
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
  );
}
