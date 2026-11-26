import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { rtdb } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

const AppContext = createContext();

// Primary Realtime Database node path in user's Firebase project
const DB_PREFIX = 'finance_data';

export const DEFAULT_FULFILLMENTS = [];
export const DEFAULT_BANK_ACCOUNTS = [];
export const DEFAULT_COA_ACCOUNTS = [];

const DB_VERSION = 'v3_scratch_clean';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('asia_plastic_db_ver') !== DB_VERSION) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('asia_plastic_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('asia_plastic_db_ver', DB_VERSION);
    }
  } catch (e) {
    console.warn('[Cache clear warning]', e);
  }
}

const loadLocal = (key, fallback) => {
  try {
    const item = localStorage.getItem(`asia_plastic_${key}`);
    if (item !== null) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.warn(`[Local load error] ${key}:`, e);
  }
  return fallback;
};

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

  // Clean data initialized empty for user to input from scratch
  const [bankAccounts, setBankAccounts] = useState(() => loadLocal('bank_accounts', DEFAULT_BANK_ACCOUNTS));
  const [salesDocs, setSalesDocs] = useState(() => loadLocal('sales_docs', []));
  const [purchaseDocs, setPurchaseDocs] = useState(() => loadLocal('purchase_docs', []));
  const [expenses, setExpenses] = useState(() => loadLocal('expenses', []));
  const [bankMutations, setBankMutations] = useState(() => loadLocal('bank_mutations', []));
  const [budgetRows, setBudgetRows] = useState(() => loadLocal('budget_rows', []));
  const [products, setProducts] = useState(() => loadLocal('products', []));
  const [vendors, setVendors] = useState(() => loadLocal('vendors', []));
  const [workOrders, setWorkOrders] = useState(() => loadLocal('work_orders', []));
  const [taxRecords, setTaxRecords] = useState(() => loadLocal('tax_records', []));
  const [coaAccounts, setCoaAccounts] = useState(() => loadLocal('coa_accounts', DEFAULT_COA_ACCOUNTS));
  const [personalNotes, setPersonalNotes] = useState(() => loadLocal('personal_notes', []));
  const [bankRules, setBankRules] = useState(() => loadLocal('bank_rules', []));
  const [giroDocs, setGiroDocs] = useState(() => loadLocal('giro_docs', []));
  const [journalEntries, setJournalEntries] = useState(() => loadLocal('journal_entries', []));
  const [fixedAssets, setFixedAssets] = useState(() => loadLocal('fixed_assets', []));
  const [closingHistory, setClosingHistory] = useState(() => loadLocal('closing_history', []));
  const [auditLogs, setAuditLogs] = useState(() => loadLocal('audit_logs', []));
  const [customPopups, setCustomPopups] = useState(() => loadLocal('custom_popups', []));
  const [fulfillments, setFulfillments] = useState(() => loadLocal('fulfillments', DEFAULT_FULFILLMENTS));

  // Helper to persist collection changes locally and to isolated RTDB path
  const syncToStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(`asia_plastic_${key}`, JSON.stringify(data));
      if (rtdb) {
        const targetRef = ref(rtdb, `${DB_PREFIX}/${key}`);
        const payload = Array.isArray(data) && data.length === 0 ? { __empty__: true } : data;
        set(targetRef, payload).catch(() => {});
      }
    } catch (e) {
      console.warn(`[Storage sync error] ${key}:`, e);
    }
  }, []);

  // Setters wrapped with persistence
  const updateBankAccounts = useCallback((val) => {
    setBankAccounts((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('bank_accounts', next);
      return next;
    });
  }, [syncToStorage]);

  const updateSalesDocs = useCallback((val) => {
    setSalesDocs((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('sales_docs', next);
      return next;
    });
  }, [syncToStorage]);

  const updatePurchaseDocs = useCallback((val) => {
    setPurchaseDocs((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('purchase_docs', next);
      return next;
    });
  }, [syncToStorage]);

  const updateExpenses = useCallback((val) => {
    setExpenses((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('expenses', next);
      return next;
    });
  }, [syncToStorage]);

  const updateBankMutations = useCallback((val) => {
    setBankMutations((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('bank_mutations', next);
      return next;
    });
  }, [syncToStorage]);

  const updateBudgetRows = useCallback((val) => {
    setBudgetRows((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('budget_rows', next);
      return next;
    });
  }, [syncToStorage]);

  const updateProducts = useCallback((val) => {
    setProducts((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('products', next);
      return next;
    });
  }, [syncToStorage]);

  const updateVendors = useCallback((val) => {
    setVendors((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('vendors', next);
      return next;
    });
  }, [syncToStorage]);

  const updateWorkOrders = useCallback((val) => {
    setWorkOrders((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('work_orders', next);
      return next;
    });
  }, [syncToStorage]);

  const updateTaxRecords = useCallback((val) => {
    setTaxRecords((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('tax_records', next);
      return next;
    });
  }, [syncToStorage]);

  const updateCoaAccounts = useCallback((val) => {
    setCoaAccounts((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('coa_accounts', next);
      return next;
    });
  }, [syncToStorage]);

  const updatePersonalNotes = useCallback((val) => {
    setPersonalNotes((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('personal_notes', next);
      return next;
    });
  }, [syncToStorage]);

  const updateBankRules = useCallback((val) => {
    setBankRules((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('bank_rules', next);
      return next;
    });
  }, [syncToStorage]);

  const updateGiroDocs = useCallback((val) => {
    setGiroDocs((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('giro_docs', next);
      return next;
    });
  }, [syncToStorage]);

  const updateAuditLogs = useCallback((val) => {
    setAuditLogs((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('audit_logs', next);
      return next;
    });
  }, [syncToStorage]);

  const updateJournalEntries = useCallback((val) => {
    setJournalEntries((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('journal_entries', next);
      return next;
    });
  }, [syncToStorage]);

  const updateFixedAssets = useCallback((val) => {
    setFixedAssets((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('fixed_assets', next);
      return next;
    });
  }, [syncToStorage]);

  const updateClosingHistory = useCallback((val) => {
    setClosingHistory((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('closing_history', next);
      return next;
    });
  }, [syncToStorage]);

  const updateFulfillments = useCallback((val) => {
    setFulfillments((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncToStorage('fulfillments', next);
      return next;
    });
  }, [syncToStorage]);

  // Two-way listener using isolated local_workspace_data path
  useEffect(() => {
    const unsubscribers = [];

    const bindCollection = (key, setter, fallbackData) => {
      if (!rtdb) {
        setRtdbConnected(false);
        return;
      }
      try {
        const itemRef = ref(rtdb, `${DB_PREFIX}/${key}`);
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
            } else if (fallbackData !== undefined) {
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

    bindCollection('bank_accounts', setBankAccounts, []);
    bindCollection('sales_docs', setSalesDocs, []);
    bindCollection('purchase_docs', setPurchaseDocs, []);
    bindCollection('expenses', setExpenses, []);
    bindCollection('bank_mutations', setBankMutations, []);
    bindCollection('budget_rows', setBudgetRows, []);
    bindCollection('products', setProducts, []);
    bindCollection('vendors', setVendors, []);
    bindCollection('work_orders', setWorkOrders, []);
    bindCollection('tax_records', setTaxRecords, []);
    bindCollection('coa_accounts', setCoaAccounts, []);
    bindCollection('personal_notes', setPersonalNotes, []);
    bindCollection('bank_rules', setBankRules, []);
    bindCollection('giro_docs', setGiroDocs, []);
    bindCollection('journal_entries', setJournalEntries, []);
    bindCollection('fixed_assets', setFixedAssets, []);
    bindCollection('closing_history', setClosingHistory, []);
    bindCollection('audit_logs', setAuditLogs, []);
    bindCollection('custom_popups', setCustomPopups, []);
    bindCollection('fulfillments', setFulfillments, DEFAULT_FULFILLMENTS);

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
      syncToRtdb: syncToStorage,
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
      bankRules,
      setBankRules: updateBankRules,
      giroDocs,
      setGiroDocs: updateGiroDocs,
      journalEntries,
      setJournalEntries: updateJournalEntries,
      fixedAssets,
      setFixedAssets: updateFixedAssets,
      closingHistory,
      setClosingHistory: updateClosingHistory,
      auditLogs,
      setAuditLogs: updateAuditLogs,
      fulfillments,
      setFulfillments: updateFulfillments,
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
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
