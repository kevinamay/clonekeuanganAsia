import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckSquare, CheckCircle2 } from 'lucide-react';

export default function Tugas() {
  const { personalNotes, setPersonalNotes, notify } = useAppContext();

  const toggleTask = (id) => {
    setPersonalNotes(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    notify('Status tugas diperbarui.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">Tugas &amp; Catatan Finansial</h1>
        <p className="mt-1 text-xs text-slate-500">Manajemen tugas operasional, otorisasi &amp; memo manajemen</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        {personalNotes.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
              <div>
                <div className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </div>
                <div className="text-xs text-slate-600 mt-1">{task.content}</div>
                <div className="text-[11px] text-slate-400 mt-2">Dibuat oleh: {task.author} • {task.createdAt}</div>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              task.severity === 'Tinggi' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700'
            }`}>
              {task.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
