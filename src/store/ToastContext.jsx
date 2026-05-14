import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const api = useMemo(() => ({
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info')
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                className="pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl"
                style={{
                  background: 'rgb(var(--nx-panel))',
                  borderColor: 'rgb(var(--nx-line) / 0.5)',
                  color: 'rgb(var(--nx-text))'
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: t.type === 'error' ? 'rgb(var(--nx-danger))'
                         : t.type === 'success' ? 'rgb(var(--nx-success))'
                         : 'rgb(var(--nx-accent))'
                  }}
                />
                <span className="max-w-md">{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="opacity-60 transition hover:opacity-100"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
