import { Menu, Languages, Palette, Sparkles, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n, SUPPORTED_LANGS } from '../../store/I18nContext.jsx';
import { useTheme, THEMES } from '../../store/ThemeContext.jsx';
import { useDevices } from '../../store/DevicesContext.jsx';

function Dropdown({ button, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="nx-btn nx-btn-ghost">
        {button}
      </button>
      {open && (
        <div
          className={`absolute z-30 mt-2 w-56 overflow-hidden rounded-xl border shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{
            borderColor: 'rgb(var(--nx-line) / 0.5)',
            background: 'rgb(var(--nx-panel))'
          }}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

export function Topbar({ onOpenSidebar, onOpenAssistant }) {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { reload, loading, health } = useDevices();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl sm:px-6"
      style={{
        background: 'rgb(var(--nx-bg) / 0.7)',
        borderColor: 'rgb(var(--nx-line) / 0.3)'
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg border p-2 lg:hidden"
          style={{ borderColor: 'rgb(var(--nx-line) / 0.5)', color: 'rgb(var(--nx-text))' }}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="hidden flex-col sm:flex">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('common.lastSync')}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
            {health?.generatedAt
              ? new Date(health.generatedAt).toLocaleString(lang)
              : t('common.loading')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={reload}
          disabled={loading}
          className="nx-btn nx-btn-ghost"
          aria-label="Refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{t('common.search')}</span>
        </button>

        <Dropdown
          button={<><Languages size={15} />{lang.toUpperCase()}</>}
        >
          <ul className="py-1">
            {SUPPORTED_LANGS.map((code) => (
              <li key={code}>
                <button
                  onClick={() => setLang(code)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-white/5"
                  style={{ color: lang === code ? 'rgb(var(--nx-text))' : 'rgb(var(--nx-muted))' }}
                >
                  <span>{code === 'pt-BR' ? 'Português (BR)' : 'English'}</span>
                  {lang === code && <span className="text-xs" style={{ color: 'rgb(var(--nx-primary))' }}>●</span>}
                </button>
              </li>
            ))}
          </ul>
        </Dropdown>

        <Dropdown
          button={<><Palette size={15} /><span className="hidden sm:inline">{t('common.theme')}</span></>}
        >
          <ul className="py-1">
            {THEMES.map((id) => (
              <li key={id}>
                <button
                  onClick={() => setTheme(id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-white/5"
                  style={{ color: theme === id ? 'rgb(var(--nx-text))' : 'rgb(var(--nx-muted))' }}
                >
                  <span>{t(`settings.themes.${id}`)}</span>
                  {theme === id && <span className="text-xs" style={{ color: 'rgb(var(--nx-primary))' }}>●</span>}
                </button>
              </li>
            ))}
          </ul>
        </Dropdown>

        <button
          onClick={onOpenAssistant}
          className="nx-btn nx-btn-primary"
        >
          <Sparkles size={15} />
          <span className="hidden sm:inline">{t('ai.title')}</span>
        </button>
      </div>
    </header>
  );
}
