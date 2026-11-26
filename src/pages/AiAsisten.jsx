import React, { useState } from 'react';
import { Bot, Sparkles, Send } from 'lucide-react';

export default function AiAsisten() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Halo Carlos! Saya AI Asisten Finansial Asia Plastik. Ada yang bisa saya bantu terkait analisis arus kas, audit transaksi, atau proyeksi laba rugi hari ini?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Berdasarkan analisis data finansial per November 2026: Arus kas operasional surplus Rp 42.500.000 dengan rasio likuiditas 2.85x. Piutang usaha PT Surya Kencana Packindo dan CV Makmur Plastik berjalan lancar.` }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">AI Asisten Finansial</h1>
        <p className="mt-1 text-xs text-slate-500">Asisten cerdas terintegrasi untuk forecasting finansial &amp; deteksi anomali mutasi</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs h-[520px] flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user' ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-800'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tanyakan analisis keuangan, prediksi kas, atau audit vendor..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
