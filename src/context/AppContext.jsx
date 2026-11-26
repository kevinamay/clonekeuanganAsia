import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import seedData from '../data/seed_data.json';
import { rtdb } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [entityId, setEntityId] = useState('utama');
  const [period, setPeriod] = useState('Nov 2026');
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [rtdbConnected, setRtdbConnected] = useState(true);

  // Entities list matching target:
  const entities = [
    { id: 'utama', name: 'Asia Plastik (Pabrik Cikarang)', code: 'AP-CKR', city: 'Cikarang, Jawa Barat' },
    { id: 'surabaya', name: 'Asia Plastik Cabang Surabaya', code: 'AP-SBY', city: 'Surabaya, Jawa Timur' },
    { id: 'holding', name: 'Asia Plastik Konsolidasi (Holding)', code: 'AP-HLD', city: 'Jakarta' }
  ];

  // Master Data initialized from extracted seed data
  const [bankAccounts, setBankAccounts] = useState(() => seedData.Y || []);
  const [salesDocs, setSalesDocs] = useState(() => seedData.q || []);
  const [purchaseDocs, setPurchaseDocs] = useState(() => seedData.$ || []);
  const [expenses, setExpenses] = useState(() => seedData.x || []);
  const [bankMutations, setBankMutations] = useState(() => seedData.M || []);
  const [budgetRows, setBudgetRows] = useState(() => seedData.r || []);
  const [products, setProducts] = useState(() => seedData.w || []);
  const [vendors, setVendors] = useState(() => seedData._ || []);
  const [workOrders, setWorkOrders] = useState(() => seedData.t || []);
  const [taxRecords, setTaxRecords] = useState(() => seedData.s || []);
  const [coaAccounts, setCoaAccounts] = useState(() => seedData.j || []);
  const [personalNotes, setPersonalNotes] = useState(() => seedData.H || []);
  const [journalEntries, setJournalEntries] = useState([]);
  const [fixedAssets, setFixedAssets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [customPopups, setCustomPopups] = useState([]);

  // Helper to persist collection changes to Firebase RTDB finance_data/
  const syncToRtdb = useCallback((key, data) => {
    try {
      const targetRef = ref(rtdb, `finance_data/${key}`);
      const payload = Array.isArray(data) && data.length === 0 ? { __empty__: true } : data;
      set(targetRef, payload).catch((err) => {
        console.warn(`[RTDB Sync Error] ${key}:`, err);
      });
    } catch (e) {
      console.warn(`[RTDB Write Failed] ${key}:`, e);
    }
  }, []);

  // Setters wrapped with live RTDB synchronization
  const updateBankAccounts = useCallback((val) => {
    setBankAccounts((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('bank_accounts', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateSalesDocs = useCallback((val) => {
    setSalesDocs((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('sales_docs', next);
      return next;
    });
  }, [syncToRtdb]);

  const updatePurchaseDocs = useCallback((val) => {
    setPurchaseDocs((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('purchase_docs', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateExpenses = useCallback((val) => {
    setExpenses((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('expenses', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateBankMutations = useCallback((val) => {
    setBankMutations((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('bank_mutations', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateBudgetRows = useCallback((val) => {
    setBudgetRows((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('budget_rows', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateProducts = useCallback((val) => {
    setProducts((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('products', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateVendors = useCallback((val) => {
    setVendors((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('vendors', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateWorkOrders = useCallback((val) => {
    setWorkOrders((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('work_orders', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateTaxRecords = useCallback((val) => {
    setTaxRecords((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('tax_records', next);
      return next;
    });
  }, [syncToRtdb]);

  const updateCoaAccounts = useCallback((val) => {
    setCoaAccounts((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('coa_accounts', next);
      return next;
    });
  }, [syncToRtdb]);

  const updatePersonalNotes = useCallback((val) => {
    setPersonalNotes((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToRtdb('personal_notes', next);
      return next;
    });
  }, [syncToRtdb]);

  // Two-way Realtime Database Listener for all finance_data collections
  useEffect(() => {
    const unsubscribers = [];

    const bindCollection = (key, setter, fallbackData) => {
      try {
        const itemRef = ref(rtdb, `finance_data/${key}`);
        const unsub = onValue(
          itemRef,
          (snapshot) => {
            setRtdbConnected(true);
            if (snapshot.exists()) {
              const val = snapshot.val();
              if (val && typeof val === 'object' && val.__empty__) {
                setter([]);
              } else if (Array.isArray(val)) {
                setter(val);
              } else if (val && typeof val === 'object') {
                setter(Object.values(val));
              }
            } else if (fallbackData) {
              setter(fallbackData);
            }
          },
          (err) => {
            console.warn(`[RTDB subscribe error] ${key}:`, err);
            setRtdbConnected(false);
          }
        );
        unsubscribers.push(unsub);
      } catch (err) {
        console.warn(`[RTDB bind error] ${key}:`, err);
      }
    };

    // Attach listeners matching live database architecture
    bindCollection('bank_accounts', setBankAccounts, seedData.Y);
    bindCollection('sales_docs', setSalesDocs, seedData.q);
    bindCollection('purchase_docs', setPurchaseDocs, seedData.$);
    bindCollection('expenses', setExpenses, seedData.x);
    bindCollection('bank_mutations', setBankMutations, seedData.M);
    bindCollection('budget_rows', setBudgetRows, seedData.r);
    bindCollection('products', setProducts, seedData.w);
    bindCollection('vendors', setVendors, seedData._);
    bindCollection('work_orders', setWorkOrders, seedData.t);
    bindCollection('tax_records', setTaxRecords, seedData.s);
    bindCollection('coa_accounts', setCoaAccounts, seedData.j);
    bindCollection('personal_notes', setPersonalNotes, seedData.H);
    bindCollection('journal_entries', setJournalEntries, []);
    bindCollection('fixed_assets', setFixedAssets, []);
    bindCollection('audit_logs', setAuditLogs, []);
    bindCollection('custom_popups', setCustomPopups, []);

    return () => {
      unsubscribers.forEach((unsub) => {
        try {
          if (typeof unsub === 'function') unsub();
        } catch {
          // ignore cleanup errors
        }
      });
    };
  }, []);

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
      rtdbConnected,
      syncToRtdb,
      bankAccounts,
      setBankAccounts: updateBankAccounts,
      salesDocs,
      setSalesDocs: updateSalesDocs,
      purchaseDocs,
      setPurchaseDocs: updatePurchaseDocs,
      expenses,
      setExpenses: updateExpenses,
      bankMutations,
      setBankMutations: updateBankMutations,
      budgetRows,
      setBudgetRows: updateBudgetRows,
      products,
      setProducts: updateProducts,
      vendors,
      setVendors: updateVendors,
      workOrders,
      setWorkOrders: updateWorkOrders,
      taxRecords,
      setTaxRecords: updateTaxRecords,
      coaAccounts,
      setCoaAccounts: updateCoaAccounts,
      personalNotes,
      setPersonalNotes: updatePersonalNotes,
      journalEntries,
      fixedAssets,
      auditLogs,
      customPopups
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
