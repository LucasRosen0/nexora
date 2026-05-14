import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const widthClass = size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`nx-panel relative w-full ${widthClass} max-h-[88vh] overflow-hidden`}
          >
            <header className="flex items-start justify-between border-b px-6 py-4"
                    style={{ borderColor: 'rgb(var(--nx-line) / 0.3)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--nx-text))' }}>{title}</h2>
                {subtitle && (
                  <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 rounded-lg p-2 transition hover:bg-white/5"
                style={{ color: 'rgb(var(--nx-muted))' }}
              >
                <X size={18} />
              </button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {children}
            </div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t px-6 py-4"
                      style={{ borderColor: 'rgb(var(--nx-line) / 0.3)' }}>
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
