import React, { createContext, useContext, useState, useEffect } from 'react';
import seedData from '../data/seed_data.json';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [entityId, setEntityId] = useState('utama');
  const [period, setPeriod] = useState('Nov 2026');
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Entities list matching target:
  const entities = [
    { id: 'utama', name: 'Asia Plastik (Pabrik Cikarang)', code: 'AP-CKR', city: 'Cikarang, Jawa Barat' },
    { id: 'surabaya', name: 'Asia Plastik Cabang Surabaya', code: 'AP-SBY', city: 'Surabaya, Jawa Timur' },
    { id: 'holding', name: 'Asia Plastik Konsolidasi (Holding)', code: 'AP-HLD', city: 'Jakarta' }
  ];

  // Master Data initialized from extracted seed data
  const [bankAccounts, setBankAccounts] = useState(() => {
    return seedData.Y || [];
  });

  const [salesDocs, setSalesDocs] = useState(() => {
    return seedData.q || [];
  });

  const [purchaseDocs, setPurchaseDocs] = useState(() => {
    return seedData.$ || [];
  });

  const [expenses, setExpenses] = useState(() => {
    return seedData.x || [];
  });

  const [bankMutations, setBankMutations] = useState(() => {
    return seedData.M || [];
  });

  const [budgetRows, setBudgetRows] = useState(() => {
    return seedData.r || [];
  });

  const [products, setProducts] = useState(() => {
    return seedData.w || [];
  });

  const [vendors, setVendors] = useState(() => {
    return seedData._ || [];
  });

  const [workOrders, setWorkOrders] = useState(() => {
    return seedData.t || [];
  });

  const [taxRecords, setTaxRecords] = useState(() => {
    return seedData.s || [];
  });

  const [coaAccounts, setCoaAccounts] = useState(() => {
    return seedData.j || [];
  });

  const [personalNotes, setPersonalNotes] = useState(() => {
    return seedData.H || [];
  });

  const notify = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => prev && prev.msg === msg ? null : prev);
    }, 3200);
  };

  const confirmAction = ({ title, message, confirmText = 'Lanjutkan', cancelText = 'Batal', isDanger = true, onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for command palette search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider value={{
      entityId,
      setEntityId,
      period,
      setPeriod,
      entities,
      searchOpen,
      setSearchOpen,
      notify,
      confirmAction,
      bankAccounts,
      setBankAccounts,
      salesDocs,
      setSalesDocs,
      purchaseDocs,
      setPurchaseDocs,
      expenses,
      setExpenses,
      bankMutations,
      setBankMutations,
      budgetRows,
      setBudgetRows,
      products,
      setProducts,
      vendors,
      setVendors,
      workOrders,
      setWorkOrders,
      taxRecords,
      setTaxRecords,
      coaAccounts,
      setCoaAccounts,
      personalNotes,
      setPersonalNotes
    }}>
      {children}

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 px-4 py-3 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-slate-700 animate-slide-up">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Global Confirm Dialog */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm ${
                  confirmDialog.isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
