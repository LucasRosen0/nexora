import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, MapPin, BarChart3, FileText, Settings as SettingsIcon, LogOut, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../brand/Logo.jsx';
import { useI18n } from '../../store/I18nContext.jsx';
import { useAuth } from '../../store/AuthContext.jsx';
import { classNames } from '../../lib/format.js';

const ITEMS = [
  { to: '/overview', icon: LayoutDashboard, key: 'overview' },
  { to: '/devices', icon: Cpu, key: 'devices' },
  { to: '/locations', icon: MapPin, key: 'locations' },
  { to: '/analytics', icon: BarChart3, key: 'analytics' },
  { to: '/reports', icon: FileText, key: 'reports' },
  { to: '/settings', icon: SettingsIcon, key: 'settings' }
];

export function Sidebar({ open, onClose }) {
  const { t } = useI18n();
  const { signOut, session } = useAuth();

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r p-5 transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'rgb(var(--nx-panel) / 0.85)',
          borderColor: 'rgb(var(--nx-line) / 0.3)',
          backdropFilter: 'blur(18px)'
        }}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="rounded-lg p-2 lg:hidden"
            style={{ color: 'rgb(var(--nx-muted))' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-1 text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('brand.tagline')}
        </p>

        <nav className="mt-7 flex-1 space-y-1">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                  isActive ? 'shadow-sm' : 'hover:bg-white/5'
                )
              }
              style={({ isActive }) => ({
                color: isActive ? 'rgb(var(--nx-text))' : 'rgb(var(--nx-muted))',
                background: isActive
                  ? 'linear-gradient(135deg, rgb(var(--nx-primary) / 0.18), rgb(var(--nx-accent) / 0.12))'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgb(var(--nx-primary) / 0.35)'
                  : '1px solid transparent'
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full"
                      style={{ background: 'rgb(var(--nx-primary))' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon size={17} />
                  {t(`nav.${item.key}`)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-xl border p-3"
             style={{ borderColor: 'rgb(var(--nx-line) / 0.3)', background: 'rgb(var(--nx-bg-soft) / 0.6)' }}>
          <p className="text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
            {session?.role || 'Operator'}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
            {session?.email}
          </p>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition hover:opacity-90"
            style={{
              borderColor: 'rgb(var(--nx-line) / 0.5)',
              color: 'rgb(var(--nx-text-soft))'
            }}
          >
            <LogOut size={14} /> {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
