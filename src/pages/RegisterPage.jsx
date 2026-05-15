import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Logo } from '../components/brand/Logo.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  if (isAuthenticated) return <Navigate to="/overview" replace />;

  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{
          background:
            'linear-gradient(155deg, rgb(var(--nx-bg-soft)) 0%, rgb(var(--nx-panel)) 60%, rgb(var(--nx-panel-2)) 100%)',
          borderRight: '1px solid rgb(var(--nx-line) / 0.3)'
        }}
      >
        <div className="absolute inset-0 nx-grid-bg opacity-50" />
        <div className="relative">
          <Logo size="lg" />
        </div>
        <div className="relative max-w-md">
          <span
            className="nx-chip"
            style={{ background: 'rgb(var(--nx-primary) / 0.15)', color: 'rgb(var(--nx-primary))' }}
          >
            <UserPlus size={12} /> Cadastro
          </span>
          <h1
            className="mt-5 text-4xl font-extrabold leading-tight"
            style={{ color: 'rgb(var(--nx-text))', letterSpacing: '-0.02em' }}
          >
            Criar sua conta
          </h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgb(var(--nx-text-soft))' }}>
            Formulário visual simples. Sem autenticação real por enquanto.
          </p>
        </div>
        <p className="relative text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('auth.footer')}
        </p>
      </aside>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>
              Criar conta
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
              Preencha os campos abaixo
            </p>
          </motion.div>

          <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgb(var(--nx-muted))' }}
              >
                Nome
              </label>
              <input type="text" className="nx-input" placeholder="Seu nome" />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgb(var(--nx-muted))' }}
              >
                Email
              </label>
              <input type="email" className="nx-input" placeholder="voce@empresa.com" />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgb(var(--nx-muted))' }}
              >
                Senha
              </label>
              <input type="password" className="nx-input" placeholder="••••••••" />
            </div>

            <button type="button" className="nx-btn nx-btn-primary w-full py-3 text-base" disabled>
              Criar conta (em breve)
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="font-semibold transition hover:opacity-80"
              style={{ color: 'rgb(var(--nx-primary))' }}
            >
              Voltar para login
            </Link>
          </p>

          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition hover:opacity-80"
            style={{ color: 'rgb(var(--nx-primary))' }}
          >
            <ChevronLeft size={14} />
            Voltar
          </Link>
        </div>
      </section>
    </div>
  );
}
