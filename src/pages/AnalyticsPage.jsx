import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useDevices } from '../store/DevicesContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';
import { formatNumber } from '../lib/format.js';

const COLORS = [
  'rgb(91,108,255)', 'rgb(56,184,255)', 'rgb(120,96,255)',
  'rgb(52,211,153)', 'rgb(251,191,36)', 'rgb(248,113,113)',
  'rgb(168,85,247)', 'rgb(14,165,233)'
];

const TOOLTIP_STYLE = {
  background: 'rgb(var(--nx-panel))',
  border: '1px solid rgb(var(--nx-line) / 0.4)',
  borderRadius: 12,
  color: 'rgb(var(--nx-text))'
};

export function AnalyticsPage() {
  const { devices } = useDevices();
  const { t, lang } = useI18n();

  const riskByUnit = useMemo(() => {
    const map = new Map();
    devices.forEach((d) => {
      const key = d.unitLabel || 'Global';
      const cur = map.get(key) || { name: key, total: 0, sum: 0 };
      cur.total += 1;
      cur.sum += d.risk;
      map.set(key, cur);
    });
    return Array.from(map.values())
      .map((u) => ({ name: u.name, value: Math.round(u.sum / u.total) }))
      .sort((a, b) => b.value - a.value);
  }, [devices]);

  const osMix = useMemo(() => {
    const map = new Map();
    devices.forEach((d) => {
      const key = d.osVersion || 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [devices]);

  const topManufacturers = useMemo(() => {
    const map = new Map();
    devices.forEach((d) => {
      const key = d.manufacturer || 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [devices]);

  const ramHistogram = useMemo(() => {
    const buckets = [
      { name: '< 4 GB', min: 0, max: 3.99, value: 0 },
      { name: '4 GB', min: 4, max: 4.99, value: 0 },
      { name: '8 GB', min: 5, max: 8.99, value: 0 },
      { name: '16 GB', min: 9, max: 16.99, value: 0 },
      { name: '32 GB+', min: 17, max: Infinity, value: 0 }
    ];
    devices.forEach((d) => {
      if (!d.ramGb) return;
      const b = buckets.find((x) => d.ramGb >= x.min && d.ramGb <= x.max);
      if (b) b.value += 1;
    });
    return buckets;
  }, [devices]);

  const contactTrend = useMemo(() => {
    const buckets = [
      { name: lang === 'pt-BR' ? 'Hoje' : 'Today', min: 0, max: 1, value: 0 },
      { name: '1-7d', min: 1, max: 7, value: 0 },
      { name: '8-30d', min: 8, max: 30, value: 0 },
      { name: '31-90d', min: 31, max: 90, value: 0 },
      { name: '> 90d', min: 91, max: Infinity, value: 0 }
    ];
    const now = Date.now();
    devices.forEach((d) => {
      if (!d.lastSeen) {
        buckets[buckets.length - 1].value += 1;
        return;
      }
      const days = Math.floor((now - new Date(d.lastSeen).getTime()) / 86400000);
      const b = buckets.find((x) => days >= x.min && days <= x.max);
      if (b) b.value += 1;
    });
    return buckets;
  }, [devices, lang]);

  return (
    <section>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>
          {t('analytics.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('analytics.subtitle')}
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title={t('analytics.riskByUnit')}>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={riskByUnit}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--nx-line) / 0.25)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgb(var(--nx-line) / 0.1)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="rgb(var(--nx-accent))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('analytics.osMix')}>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={osMix} dataKey="value" nameKey="name" innerRadius={48} outerRadius={92} paddingAngle={2} stroke="none">
                  {osMix.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: 'rgb(var(--nx-muted))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('analytics.topManufacturers')}>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={topManufacturers} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--nx-line) / 0.25)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'rgb(var(--nx-text-soft))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgb(var(--nx-line) / 0.1)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="rgb(var(--nx-primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title={lang === 'pt-BR' ? 'Memória RAM (GB)' : 'RAM distribution (GB)'}
        >
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={ramHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--nx-line) / 0.25)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgb(var(--nx-line) / 0.1)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="rgb(var(--nx-glow))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title={lang === 'pt-BR' ? 'Janela de último contato' : 'Last-contact window'}
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={contactTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--nx-line) / 0.25)" />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(var(--nx-accent))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'rgb(var(--nx-primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
            {lang === 'pt-BR'
              ? `Total analisado: ${formatNumber(devices.length, lang)} dispositivos.`
              : `Analyzed: ${formatNumber(devices.length, lang)} devices.`}
          </p>
        </Panel>
      </div>
    </section>
  );
}

function Panel({ title, children, className = '' }) {
  return (
    <article className={`nx-panel p-5 ${className}`}>
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </article>
  );
}
