import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { useDevices } from '../store/DevicesContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { formatNumber } from '../lib/format.js';

export function LocationsPage() {
  const { devices } = useDevices();
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState(null);

  const groups = useMemo(() => {
    const map = new Map();
    devices.forEach((d) => {
      const key = d.unitLabel || 'Global';
      if (!map.has(key)) {
        map.set(key, { name: key, code: d.unit, items: [] });
      }
      map.get(key).items.push(d);
    });
    return Array.from(map.values())
      .map((g) => {
        const total = g.items.length;
        const critical = g.items.filter((d) => d.status === 'critical').length;
        const attention = g.items.filter((d) => d.status === 'attention').length;
        const avgRisk = total
          ? Math.round(g.items.reduce((s, d) => s + d.risk, 0) / total)
          : 0;
        return { ...g, total, critical, attention, avgRisk };
      })
      .sort((a, b) => b.total - a.total);
  }, [devices]);

  return (
    <section>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>
          {t('locations.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('locations.subtitle')}
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g, i) => (
          <motion.button
            key={g.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            onClick={() => setSelected(g)}
            className="nx-card group text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="rounded-lg p-2"
                  style={{
                    background: 'rgb(var(--nx-primary) / 0.14)',
                    color: 'rgb(var(--nx-primary))'
                  }}
                >
                  <MapPin size={16} />
                </span>
                <div>
                  <p className="text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
                    {g.name}
                  </p>
                  <p className="text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                    {g.code}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="transition group-hover:translate-x-0.5"
                style={{ color: 'rgb(var(--nx-muted))' }}
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <Stat label={t('locations.deviceCount')} value={formatNumber(g.total, lang)} />
              <Stat label={t('locations.avgRisk')} value={`${g.avgRisk}`} accent="warning" />
              <Stat label={t('locations.critical')} value={formatNumber(g.critical, lang)} accent="danger" />
            </div>
          </motion.button>
        ))}
        {groups.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('common.empty')}
          </p>
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || ''}
        subtitle={`${selected?.total || 0} ${t('locations.deviceCount').toLowerCase()}`}
        size="lg"
      >
        <ul className="divide-y" style={{ borderColor: 'rgb(var(--nx-line) / 0.2)' }}>
          {(selected?.items || []).slice(0, 60).map((d) => (
            <li key={d.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                  {d.hostname}
                </p>
                <p className="truncate text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                  {d.user || '—'} · {d.osVersion}
                </p>
              </div>
              <StatusBadge status={d.status} />
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
}

function Stat({ label, value, accent }) {
  const color =
    accent === 'danger'
      ? 'rgb(var(--nx-danger))'
      : accent === 'warning'
      ? 'rgb(var(--nx-warning))'
      : 'rgb(var(--nx-text))';
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
