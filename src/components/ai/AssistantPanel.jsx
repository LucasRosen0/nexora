import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';
import { useI18n } from '../../store/I18nContext.jsx';
import { useDevices } from '../../store/DevicesContext.jsx';
import { ask, intro, suggestions } from '../../lib/ai.js';

export function AssistantPanel({ open, onClose }) {
  const { t, lang } = useI18n();
  const { devices } = useDevices();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', text: intro(devices, lang) }]);
    }
  }, [open, devices, lang, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setBusy(true);
    try {
      const reply = await ask(question, devices, lang);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l"
            style={{
              background: 'rgb(var(--nx-panel))',
              borderColor: 'rgb(var(--nx-line) / 0.4)'
            }}
          >
            <header className="flex items-center justify-between border-b px-5 py-4"
                    style={{ borderColor: 'rgb(var(--nx-line) / 0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2" style={{ background: 'rgb(var(--nx-primary) / 0.15)' }}>
                  <Sparkles size={18} style={{ color: 'rgb(var(--nx-primary))' }} />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
                    {t('ai.title')}
                  </h2>
                  <p className="text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                    {t('ai.subtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition hover:bg-white/5"
                style={{ color: 'rgb(var(--nx-muted))' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                  style={{
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, rgb(var(--nx-primary)), rgb(var(--nx-accent)))'
                      : 'rgb(var(--nx-bg-soft) / 0.7)',
                    color: m.role === 'user' ? 'white' : 'rgb(var(--nx-text))',
                    border: m.role === 'user' ? 'none' : '1px solid rgb(var(--nx-line) / 0.3)'
                  }}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="mr-auto max-w-[60%] rounded-2xl px-4 py-2.5 text-sm"
                     style={{
                       background: 'rgb(var(--nx-bg-soft) / 0.7)',
                       border: '1px solid rgb(var(--nx-line) / 0.3)',
                       color: 'rgb(var(--nx-muted))'
                     }}>
                  {t('ai.thinking')}
                </div>
              )}
            </div>

            <div className="border-t px-5 pb-3 pt-3" style={{ borderColor: 'rgb(var(--nx-line) / 0.3)' }}>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {suggestions(lang).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition hover:opacity-90"
                    style={{
                      borderColor: 'rgb(var(--nx-line) / 0.5)',
                      color: 'rgb(var(--nx-text-soft))'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={t('ai.ask')}
                  className="nx-input resize-none py-2.5"
                />
                <button
                  onClick={() => send()}
                  disabled={busy || !input.trim()}
                  className="nx-btn nx-btn-primary"
                  aria-label={t('ai.send')}
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-2 text-[10px]" style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('ai.disclaimer')}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
