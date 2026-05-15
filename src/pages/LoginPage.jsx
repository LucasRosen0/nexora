import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Sparkles, BarChart3, ChevronRight, Loader2 } from 'lucide-react';
import { Logo, LogoMark } from '../components/brand/Logo.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';
import { SUPPORTED_LANGS } from '../store/I18nContext.jsx';

export function LoginPage() {
  const { isAuthenticated, signIn, demo } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/overview" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) {
      const code = res.code || 'invalid';
      const map = { required: 'errorRequired', email: 'errorEmail', invalid: 'errorInvalid' };
      setError(t(`auth.${map[code]}`));
      return;
    }
    navigate('/overview', { replace: true });
  };

  const fillDemo = () => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left brand panel */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{
          background:
            'linear-gradient(155deg, rgb(var(--nx-bg-soft)) 0%, rgb(var(--nx-panel)) 60%, rgb(var(--nx-panel-2)) 100%)',
          borderRight: '1px solid rgb(var(--nx-line) / 0.3)'
        }}
      >
        <div className="absolute inset-0 nx-grid-bg opacity-50" />
        <div
          className="absolute -left-32 top-10 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'rgb(var(--nx-primary) / 0.25)' }}
        />
        <div
          className="absolute -bottom-32 right-0 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'rgb(var(--nx-accent) / 0.18)' }}
        />

        <div className="relative">
          <Logo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative max-w-md"
        >
          <span className="nx-chip"
                style={{ background: 'rgb(var(--nx-primary) / 0.15)', color: 'rgb(var(--nx-primary))' }}>
            <ShieldCheck size={12} /> Workspace
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight"
              style={{ color: 'rgb(var(--nx-text))', letterSpacing: '-0.02em' }}>
            {t('auth.subtitle')}
          </h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgb(var(--nx-text-soft))' }}>
            {t('auth.intro')}
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: BarChart3, key: 'auth.feature1' },
              { icon: Sparkles, key: 'auth.feature3' },
              { icon: ShieldCheck, key: 'auth.feature2' }
            ].map((f) => (
              <li key={f.key} className="flex items-start gap-3 text-sm" style={{ color: 'rgb(var(--nx-text-soft))' }}>
                <span className="mt-0.5 rounded-md p-1.5"
                      style={{ background: 'rgb(var(--nx-primary) / 0.14)', color: 'rgb(var(--nx-primary))' }}>
                  <f.icon size={14} />
                </span>
                {t(f.key)}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('auth.footer')}
        </p>
      </aside>

      {/* Right form panel */}
      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
          </div>

          <div className="mb-3 flex justify-end">
            <div className="inline-flex rounded-lg border p-1"
                 style={{ borderColor: 'rgb(var(--nx-line) / 0.5)' }}>
              {SUPPORTED_LANGS.map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className="rounded-md px-2.5 py-1 text-xs font-semibold transition"
                  style={{
                    background: lang === code ? 'rgb(var(--nx-primary) / 0.18)' : 'transparent',
                    color: lang === code ? 'rgb(var(--nx-text))' : 'rgb(var(--nx-muted))'
                  }}
                >
                  {code === 'pt-BR' ? 'PT-BR' : 'EN'}
                </button>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>
              {t('auth.title')}
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
              {t('brand.tagline')}
            </p>
          </motion.div>

          <form onSubmit={submit} className="mt-7 space-y-4" autoComplete="on">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                     style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                autoComplete="username"
                required
                className="nx-input"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                     style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="nx-input pr-12"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition hover:bg-white/5"
                  style={{ color: 'rgb(var(--nx-muted))' }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border px-3 py-2 text-sm"
                   style={{
                     borderColor: 'rgb(var(--nx-danger) / 0.4)',
                     background: 'rgb(var(--nx-danger) / 0.08)',
                     color: 'rgb(var(--nx-danger))'
                   }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="nx-btn nx-btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {t('auth.signingIn')}</>
              ) : (
                <>{t('auth.signIn')} <ChevronRight size={16} /></>
              )}
            </button>

            <button
              type="button"
              onClick={fillDemo}
              className="nx-btn nx-btn-ghost w-full"
            >
              {t('auth.useDemo')}
            </button>

            <div className="rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
                 style={{
                   borderColor: 'rgb(var(--nx-line) / 0.4)',
                   background: 'rgb(var(--nx-bg-soft) / 0.5)',
                   color: 'rgb(var(--nx-muted))'
                 }}>
              <span className="mr-1 font-semibold" style={{ color: 'rgb(var(--nx-text-soft))' }}>
                <LogoMark size={12} className="mb-0.5 mr-1 inline" /> Nexora:
              </span>
              {t('auth.demoNote')}
            </div>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="font-semibold transition hover:opacity-80"
              style={{ color: 'rgb(var(--nx-primary))' }}
            >
              Criar uma conta
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
