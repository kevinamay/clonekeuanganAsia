import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle2, Megaphone, X, ChevronRight } from 'lucide-react';
import { rtdb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

const DEFAULT_POPUPS = [
  {
    id: 'popup-dev-note',
    title: 'Data yang masuk belum 100%',
    message: 'Tolong buat task/note jika ada data yang hilang.\n- dev',
    iconTone: 'warning',
    badgeText: 'Perhatian',
    targetPage: '/',
    buttonText: 'Saya Mengerti',
    active: true,
    order: 1
  }
];

const TONES = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    ring: 'ring-amber-500/20',
    icon: AlertTriangle,
    badgeBg: 'bg-amber-100 text-amber-800',
    defaultBadge: 'Perhatian'
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    ring: 'ring-sky-500/20',
    icon: Info,
    badgeBg: 'bg-sky-100 text-sky-800',
    defaultBadge: 'Informasi Sistem'
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/20',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-100 text-emerald-800',
    defaultBadge: 'Pengumuman'
  },
  announcement: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    ring: 'ring-purple-500/20',
    icon: Megaphone,
    badgeBg: 'bg-purple-100 text-purple-800',
    defaultBadge: 'Kabar Terbaru'
  }
};

export default function AnnouncementModal() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [popups, setPopups] = useState(DEFAULT_POPUPS);
  const [activePopups, setActivePopups] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  // Sync with Firebase RTDB custom_popups if configured
  useEffect(() => {
    try {
      const popupsRef = ref(rtdb, 'custom_popups');
      const unsub = onValue(popupsRef, (snap) => {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const list = Array.isArray(val) ? val : Object.values(val);
          if (list.length > 0) {
            setPopups(list);
            return;
          }
        }
        setPopups(DEFAULT_POPUPS);
      }, () => {
        setPopups(DEFAULT_POPUPS);
      });
      return () => unsub();
    } catch {
      setPopups(DEFAULT_POPUPS);
    }
  }, []);

  // Filter and show popup according to current page
  useEffect(() => {
    const list = Array.isArray(popups) ? popups : [];
    const matched = list
      .filter((p) => p && p.active && (p.targetPage === 'all' || p.targetPage === currentPath || (currentPath === '/' && p.targetPage === '/')))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (matched.length === 0) {
      setActivePopups([]);
      setCurrentIndex(null);
      return;
    }

    setActivePopups(matched);
    setCurrentIndex(0);
  }, [currentPath, popups]);

  if (currentIndex === null || !activePopups[currentIndex]) {
    return null;
  }

  const popup = activePopups[currentIndex];
  const total = activePopups.length;
  const isLast = currentIndex === total - 1;
  const tone = TONES[popup.iconTone || 'warning'] || TONES.warning;
  const ToneIcon = tone.icon;

  const handleClose = () => {
    setCurrentIndex(null);
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl transition-all animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tone.badgeBg}`}>
              {popup.badgeText || tone.defaultBadge}
            </span>
            {total > 1 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                Urutan {currentIndex + 1} dari {total}
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              {popup.targetPage === 'all' ? 'Semua Halaman' : `Target: ${popup.targetPage}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Tutup Popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.bg} ${tone.text} ${tone.border} ring-4 ${tone.ring} shadow-xs`}
          >
            <ToneIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {popup.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {popup.message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            {total > 1 && (
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Lewati Semua ({total})
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLast ? (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                {popup.buttonText || 'Saya Mengerti'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                <span>Lanjut ke #{currentIndex + 2}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
