import { Languages, Palette, Database, ShieldOff, Check, Lock } from 'lucide-react';
import { useI18n, SUPPORTED_LANGS } from '../store/I18nContext.jsx';
import { useTheme, THEMES } from '../store/ThemeContext.jsx';
import { useDevices } from '../store/DevicesContext.jsx';
import { useNotes } from '../store/NotesContext.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import { LogoMark } from '../components/brand/Logo.jsx';

const THEME_PALETTES = {
  'nexora-dark': ['#0a0c1c', '#5b6cff', '#38b8ff'],
  'light-clean': ['#f4f6fc', '#4f46e5', '#0e74c4'],
  'midnight-blue': ['#030a1c', '#408eff', '#60daff'],
  'purple-neon': ['#0e0620', '#bc56ff', '#7c84ff'],
  cyberpunk: ['#0a0416', '#ff38ca', '#20e8f8']
};

const LANG_LABELS = {
  'pt-BR': 'Português (Brasil)',
  en: 'English'
};

export function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { clearLocal } = useDevices();
  const notes = useNotes();
  const { signOut, session } = useAuth();
  const toast = useToast();

  const wipe = () => {
    notes.clearAll();
    clearLocal();
    toast.success(t('settings.clearLocalDone'));
    setTimeout(signOut, 600);
  };

  return (
    <section>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('settings.subtitle')}
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Language */}
        <article className="nx-panel p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg p-2" style={{ background: 'rgb(var(--nx-primary) / 0.14)', color: 'rgb(var(--nx-primary))' }}>
              <Languages size={16} />
            </span>
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
              {t('common.language')}
            </h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('settings.languageHint')}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SUPPORTED_LANGS.map((code) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className="flex items-center justify-between rounded-xl border p-3 text-left transition hover:opacity-95"
                  style={{
                    borderColor: active ? 'rgb(var(--nx-primary) / 0.5)' : 'rgb(var(--nx-line) / 0.4)',
                    background: active ? 'rgb(var(--nx-primary) / 0.10)' : 'rgb(var(--nx-bg-soft) / 0.4)'
                  }}
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
                      {LANG_LABELS[code]}
                    </p>
                    <p className="text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                      {code.toUpperCase()}
                    </p>
                  </div>
                  {active && <Check size={16} style={{ color: 'rgb(var(--nx-primary))' }} />}
                </button>
              );
            })}
          </div>
        </article>

        {/* Theme */}
        <article className="nx-panel p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg p-2" style={{ background: 'rgb(var(--nx-accent) / 0.14)', color: 'rgb(var(--nx-accent))' }}>
              <Palette size={16} />
            </span>
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
              {t('common.theme')}
            </h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('settings.themeHint')}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {THEMES.map((id) => {
              const active = theme === id;
              const palette = THEME_PALETTES[id] || ['#444', '#888', '#bbb'];
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition hover:opacity-95"
                  style={{
                    borderColor: active ? 'rgb(var(--nx-primary) / 0.5)' : 'rgb(var(--nx-line) / 0.4)',
                    background: active ? 'rgb(var(--nx-primary) / 0.08)' : 'rgb(var(--nx-bg-soft) / 0.4)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {palette.map((c, i) => (
                        <span
                          key={i}
                          className="h-6 w-6 rounded-full ring-2"
                          style={{ background: c, '--tw-ring-color': 'rgb(var(--nx-panel))' }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
                      {t(`settings.themes.${id}`)}
                    </p>
                  </div>
                  {active && <Check size={16} style={{ color: 'rgb(var(--nx-primary))' }} />}
                </button>
              );
            })}
          </div>
        </article>

        {/* Data source */}
        <article className="nx-panel p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="rounded-lg p-2" style={{ background: 'rgb(var(--nx-success) / 0.14)', color: 'rgb(var(--nx-success))' }}>
              <Database size={16} />
            </span>
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
              {t('settings.datasource')}
            </h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'rgb(var(--nx-success) / 0.45)',
                background: 'rgb(var(--nx-success) / 0.06)'
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
                  {t('settings.datasourceLocal')}
                </p>
                <span className="nx-chip" style={{ background: 'rgb(var(--nx-success) / 0.15)', color: 'rgb(var(--nx-success))' }}>
                  {t('common.online')}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('settings.datasourceLocalHint')}
              </p>
            </div>

            <div
              className="relative cursor-not-allowed rounded-xl border p-4 opacity-80"
              style={{
                borderColor: 'rgb(var(--nx-line) / 0.5)',
                background: 'rgb(var(--nx-bg-soft) / 0.4)'
              }}
              title={t('settings.datasourceMysqlHint')}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: 'rgb(var(--nx-text-soft))' }}>
                  <Lock size={13} /> {t('settings.datasourceMysql')}
                </p>
                <span className="nx-chip" style={{ background: 'rgb(var(--nx-line) / 0.4)', color: 'rgb(var(--nx-muted))' }}>
                  {lang === 'pt-BR' ? 'Em breve' : 'Coming soon'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('settings.datasourceMysqlHint')}
              </p>
            </div>
          </div>
        </article>

        {/* Account / About */}
        <article className="nx-panel p-5">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <div>
              <p className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
                Nexora
              </p>
              <p className="text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                v1.0.0 · {t('brand.tagline')}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row label={lang === 'pt-BR' ? 'Conta' : 'Account'} value={session?.email || '—'} />
            <Row label={lang === 'pt-BR' ? 'Perfil' : 'Role'} value={session?.role || '—'} />
            <Row
              label={lang === 'pt-BR' ? 'Sessão expira' : 'Session expires'}
              value={session?.expiresAt ? new Date(session.expiresAt).toLocaleString(lang) : '—'}
            />
          </div>
        </article>

        {/* Security snapshot */}
        <article className="nx-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
              {lang === 'pt-BR' ? 'Segurança e sessão' : 'Security & session'}
            </h2>
            <span className="nx-chip" style={{ background: 'rgb(var(--nx-success) / 0.14)', color: 'rgb(var(--nx-success))' }}>
              {lang === 'pt-BR' ? 'Proteções ativas' : 'Protections active'}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--nx-line) / 0.35)' }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
                {lang === 'pt-BR' ? 'Sessão' : 'Session'}
              </p>
              <p className="mt-2 text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                {session?.email || '—'}
              </p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--nx-line) / 0.35)' }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
                {lang === 'pt-BR' ? 'Perfil' : 'Role'}
              </p>
              <p className="mt-2 text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                {session?.role || '—'}
              </p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--nx-line) / 0.35)' }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
                {lang === 'pt-BR' ? 'Expiração' : 'Expiration'}
              </p>
              <p className="mt-2 text-sm font-semibold truncate" style={{ color: 'rgb(var(--nx-text))' }}>
                {session?.expiresAt ? new Date(session.expiresAt).toLocaleString(lang) : '—'}
              </p>
            </div>
          </div>
        </article>

        {/* Danger zone */}
        <article
          className="nx-panel p-5"
          style={{ borderColor: 'rgb(var(--nx-danger) / 0.4)' }}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-lg p-2" style={{ background: 'rgb(var(--nx-danger) / 0.14)', color: 'rgb(var(--nx-danger))' }}>
              <ShieldOff size={16} />
            </span>
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
              {t('settings.danger')}
            </h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('settings.clearLocalHint')}
          </p>
          <button
            onClick={wipe}
            className="nx-btn mt-4 w-full"
            style={{
              background: 'rgb(var(--nx-danger) / 0.15)',
              color: 'rgb(var(--nx-danger))',
              border: '1px solid rgb(var(--nx-danger) / 0.4)'
            }}
          >
            {t('settings.clearLocal')}
          </button>
        </article>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-t pt-2"
         style={{ borderColor: 'rgb(var(--nx-line) / 0.25)' }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
        {label}
      </span>
      <span className="font-mono text-xs" style={{ color: 'rgb(var(--nx-text))' }}>{value}</span>
    </div>
  );
}
