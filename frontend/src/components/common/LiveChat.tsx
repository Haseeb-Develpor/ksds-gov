import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: 'agent', text: 'Hello! 👋 How can we help you today?' }]);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: 'me', text }]);
    const reply = text;
    setText('');
    setTimeout(() => setMsgs((m) => [...m, { from: 'agent', text: `Thanks for your message. Our team will respond shortly regarding: "${reply}".` }]), 800);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-glass dark:border-white/10 dark:bg-[#0a2018]">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-800 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">KSA Support</p>
              <p className="text-[11px] text-white/70">Typically replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="h-64 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.from === 'me' ? 'ml-auto bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 p-2 dark:border-white/10">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message…" className="input py-2" />
            <button onClick={send} className="btn-primary px-3 py-2"><Send size={16} /></button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-gold transition hover:scale-110">
        {open ? <X /> : <MessageCircle />}
      </button>
    </>
  );
}
