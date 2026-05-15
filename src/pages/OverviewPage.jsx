import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { Cpu, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Activity, ShieldCheck, RadioTower, UserX } from 'lucide-react';
import { useDevices } from '../store/DevicesContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { formatNumber, formatRelative } from '../lib/format.js';

const PIE_COLORS = ['rgb(91,108,255)', 'rgb(56,184,255)', 'rgb(120,96,255)', 'rgb(52,211,153)', 'rgb(251,191,36)', 'rgb(248,113,113)'];

const demoOverviewData = {
  managedAssets: 248,
  healthy: 214,
  warning: 27,
  critical: 7,
  compliance: 96,
  onlineNow: 183,
  averageRisk: 18,
  unassigned: 12,
  operatingSystems: [
    { name: 'Windows', value: 156 },
    { name: 'Linux', value: 42 },
    { name: 'macOS', value: 31 },
    { name: 'Android', value: 14 },
    { name: 'iOS', value: 5 }
  ],
  units: [
    { name: 'Matriz São Paulo', value: 92 },
    { name: 'Filial Rio de Janeiro', value: 48 },
    { name: 'Unidade Curitiba', value: 37 },
    { name: 'Unidade Belo Horizonte', value: 29 },
    { name: 'Remoto/Home Office', value: 42 }
  ]
};

const demoDetails = {
  managed: {
    summary: '248 ativos monitorados no ambiente de demonstração.',
    items: [
      'NB-SP-034 — Windows — Matriz São Paulo — Saudável',
      'SRV-LNX-012 — Linux — Matriz São Paulo — Em atenção',
      'MAC-MKT-021 — macOS — Remoto/Home Office — Saudável',
      'AND-VND-008 — Android — Filial Rio de Janeiro — Saudável',
      'IOS-DIR-003 — iOS — Matriz São Paulo — Crítico'
    ]
  },
  healthy: {
    summary: '214 ativos operando normalmente.',
    items: [
      'NB-SP-034 — Sem alertas',
      'MAC-MKT-021 — Sem alertas',
      'AND-VND-008 — Sem alertas'
    ]
  },
  warning: {
    summary: '27 ativos precisam de revisão.',
    items: [
      'SRV-LNX-012 — Atualização pendente',
      'NB-RJ-019 — Espaço em disco baixo',
      'DESK-BH-044 — Antivírus desatualizado'
    ]
  },
  critical: {
    summary: '7 ativos exigem ação imediata.',
    items: [
      'IOS-DIR-003 — Política de segurança violada',
      'SRV-SP-002 — Serviço essencial indisponível',
      'NB-CWB-017 — Risco elevado detectado'
    ]
  },
  compliance: {
    summary: 'Pontuação geral de compliance: 96.',
    items: [
      'Políticas atendidas: 42',
      'Políticas com alerta: 3',
      'Políticas críticas: 1'
    ]
  },
  online: {
    summary: '183 dispositivos online agora.',
    items: [
      '65 offline ou sem comunicação recente',
      'NB-SP-034 — Online',
      'SRV-LNX-012 — Online',
      'MAC-MKT-021 — Online'
    ]
  },
  risk: {
    summary: 'Risco médio atual: 18/100 (baixo).',
    items: [
      'Fatores: alertas, compliance, status e criticidade'
    ]
  },
  unassigned: {
    summary: '12 ativos sem usuário principal vinculado.',
    items: [
      'DESK-SP-088 — Matriz São Paulo',
      'NB-RJ-027 — Filial Rio de Janeiro',
      'TAB-CWB-006 — Unidade Curitiba'
    ]
  }
};

function Kpi({ icon: Icon, label, value, hint, accent, accentSoft, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="nx-card text-left w-full"
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-lg p-2"
          style={{ background: accentSoft, color: accent }}
        >
          <Icon size={16} />
        </span>
        <ArrowRight size={14} style={{ color: 'rgb(var(--nx-muted))' }} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider"
         style={{ color: 'rgb(var(--nx-muted))' }}>
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold" style={{ color: 'rgb(var(--nx-text))' }}>
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>{hint}</p>
    </motion.button>
  );
}

export function OverviewPage() {
  const { devices, summary, loading } = useDevices();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null); // { title, subtitle, items, isDemoText }

  const isDemoEmpty = !devices || devices.length === 0;
  const overviewData = isDemoEmpty ? {
    total: demoOverviewData.managedAssets,
    healthy: demoOverviewData.healthy,
    warning: demoOverviewData.warning,
    critical: demoOverviewData.critical,
    compliance: demoOverviewData.compliance,
    online: demoOverviewData.onlineNow,
    avgRisk: demoOverviewData.averageRisk,
    missingOwner: demoOverviewData.unassigned,
    osDistribution: demoOverviewData.operatingSystems,
    unitDistribution: demoOverviewData.units
  } : {
    total: summary.total,
    healthy: summary.counts.healthy,
    warning: summary.counts.attention,
    critical: summary.counts.critical,
    compliance: summary.complianceScore || 0,
    online: summary.online || 0,
    avgRisk: summary.avgRisk || 0,
    missingOwner: summary.missingOwner || 0,
    osDistribution: summary.osDistribution,
    unitDistribution: summary.unitDistribution
  };
  const normalizeChartData = (data) => {
    if (!Array.isArray(data)) return [];

    return data
      .filter((row) => row && row.name && Number(row.value) > 0)
      .map((row) => ({
        name: row.name,
        value: Number(row.value)
      }));
  };

  const buildDistribution = (items, getter) => {
    const grouped = {};

    (items || []).forEach((item) => {
      const name = getter(item) || 'Não informado';
      grouped[name] = (grouped[name] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getDeviceOs = (device) => {
    return (
      device.osFamily ||
      device.os ||
      device.osVersion ||
      device.sistema_operacional ||
      device.operatingSystem ||
      device.operating_system ||
      device.platform ||
      'Não informado'
    );
  };

  const getDeviceUnit = (device) => {
    return (
      device.unitLabel ||
      device.unit ||
      device.unidade ||
      device.department ||
      device.setor ||
      device.location ||
      device.site ||
      'Não informado'
    );
  };

  const summaryOsData = normalizeChartData(overviewData.osDistribution);
  const summaryUnitData = normalizeChartData(overviewData.unitDistribution);

  const osChartData = summaryOsData.length > 0
    ? summaryOsData
    : buildDistribution(devices, getDeviceOs);

  const unitChartData = summaryUnitData.length > 0
    ? summaryUnitData
    : buildDistribution(devices, getDeviceUnit);
  const openDemoDetail = (title, key) => {
    const detail = demoDetails[key];
    setDrill({
      title,
      subtitle: key === 'managed' ? '5 de 248 ativos' : detail.summary,
      items: detail.items,
      isDemoText: true
    });
  };

  const recent = useMemo(() => {
    return [...devices]
      .filter((d) => d.lastSeen)
      .sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''))
      .slice(0, 6);
  }, [devices]);

  const openByStatus = (status, label) => {
    setDrill({
      title: label,
      items: devices.filter((d) => (status === 'all' ? true : d.status === status))
    });
  };

  if (loading && devices.length === 0) {
    return (
      <section>
        <PageHeader title={t('overview.title')} subtitle={t('overview.subtitle')} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader title={t('overview.title')} subtitle={t('overview.subtitle')} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Cpu}
          accent="rgb(var(--nx-primary))"
          accentSoft="rgb(var(--nx-primary) / 0.14)"
          label={lang === 'pt-BR' ? 'Ativos gerenciados' : t('overview.kpiTotal')} value={overviewData.total}
          hint={t('overview.kpiHint')}
          onClick={() => openDemoDetail(lang === 'pt-BR' ? 'Ativos gerenciados' : t('overview.kpiTotal'), 'managed')}
        />
        <Kpi
          icon={CheckCircle2}
          accent="rgb(var(--nx-success))"
          accentSoft="rgb(var(--nx-success) / 0.14)"
          label={t('overview.kpiHealthy')} value={summary.counts.healthy}
          hint={`${summary.healthyPct}%`}
          onClick={() => openByStatus('healthy', t('overview.kpiHealthy'))}
        />
        <Kpi
          icon={AlertTriangle}
          accent="rgb(var(--nx-warning))"
          accentSoft="rgb(var(--nx-warning) / 0.14)"
          label={t('overview.kpiAttention')} value={summary.counts.attention}
          hint={t('overview.kpiHint')}
          onClick={() => openByStatus('attention', t('overview.kpiAttention'))}
        />
        <Kpi
          icon={ShieldAlert}
          accent="rgb(var(--nx-danger))"
          accentSoft="rgb(var(--nx-danger) / 0.14)"
          label={t('overview.kpiCritical')} value={summary.counts.critical}
          hint={t('overview.kpiHint')}
          onClick={() => openByStatus('critical', t('overview.kpiCritical'))}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={ShieldCheck}
          accent="rgb(var(--nx-success))"
          accentSoft="rgb(var(--nx-success) / 0.14)"
          label={lang === 'pt-BR' ? 'Compliance' : 'Compliance'}
          value={summary.complianceScore || 0}
          hint={lang === 'pt-BR' ? 'Pontuação geral de conformidade' : 'Overall compliance posture'}
        />
        <Kpi
          icon={RadioTower}
          accent="rgb(var(--nx-accent))"
          accentSoft="rgb(var(--nx-accent) / 0.14)"
          label={lang === 'pt-BR' ? 'Online agora' : 'Online now'}
          value={summary.online || 0}
          hint={`${summary.total ? Math.round(((summary.online || 0) / summary.total) * 100) : 0}%`}
        />
        <Kpi
          icon={Activity}
          accent="rgb(var(--nx-primary))"
          accentSoft="rgb(var(--nx-primary) / 0.14)"
          label={lang === 'pt-BR' ? 'Risco médio' : 'Avg. risk'}
          value={summary.avgRisk || 0}
          hint={lang === 'pt-BR' ? 'Escala 0-100' : 'Scale 0-100'}
        />
        <Kpi
          icon={UserX}
          accent="rgb(var(--nx-warning))"
          accentSoft="rgb(var(--nx-warning) / 0.14)"
          label={lang === 'pt-BR' ? 'Sem responsável' : 'Unassigned owner'}
          value={summary.missingOwner || 0}
          hint={lang === 'pt-BR' ? 'Ativos sem usuário principal' : 'Assets without owner'}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="nx-panel p-5 lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wider"
              style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('overview.osTitle')}
          </h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={osChartData}
                  dataKey="value" nameKey="name"
                  innerRadius={48} outerRadius={86}
                  paddingAngle={2} stroke="none"
                >
                  {osChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--nx-panel))',
                    border: '1px solid rgb(var(--nx-line) / 0.4)',
                    borderRadius: 12
                  }}
                  labelStyle={{ color: 'rgb(var(--nx-text))' }}
                  itemStyle={{ color: 'rgb(var(--nx-text))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {osChartData.map((row, i) => (
              <li key={row.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2" style={{ color: 'rgb(var(--nx-text-soft))' }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {row.name}
                </span>
                <span className="font-mono" style={{ color: 'rgb(var(--nx-muted))' }}>
                  {formatNumber(row.value, lang)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="nx-panel p-5 lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider"
              style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('overview.unitsTitle')}
          </h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              <BarChart data={unitChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--nx-line) / 0.25)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgb(var(--nx-line) / 0.1)' }}
                  contentStyle={{
                    background: 'rgb(var(--nx-panel))',
                    border: '1px solid rgb(var(--nx-line) / 0.4)',
                    borderRadius: 12
                  }}
                  labelStyle={{ color: 'rgb(var(--nx-text))' }}
                  itemStyle={{ color: 'rgb(var(--nx-text))' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="rgb(var(--nx-primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="nx-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider"
                style={{ color: 'rgb(var(--nx-muted))' }}>
              {t('overview.recent')}
            </h3>
            <button
              onClick={() => navigate('/devices')}
              className="text-xs font-semibold transition hover:opacity-80"
              style={{ color: 'rgb(var(--nx-primary))' }}
            >
              {t('overview.viewDevices')} →
            </button>
          </div>
          <ul className="mt-3 divide-y" style={{ borderColor: 'rgb(var(--nx-line) / 0.2)' }}>
            {recent.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                    {d.hostname}
                  </p>
                  <p className="truncate text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                    {d.user || '—'} · {d.unitLabel} · {d.osVersion}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-3">
                  <span className="hidden text-xs sm:block" style={{ color: 'rgb(var(--nx-muted))' }}>
                    {formatRelative(d.lastSeen, lang)}
                  </span>
                  <StatusBadge status={d.status} />
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-6 text-center text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('common.empty')}
              </li>
            )}
          </ul>
        </article>

        <article className="nx-panel p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider"
              style={{ color: 'rgb(var(--nx-muted))' }}>
            {t('overview.winTitle')}
          </h3>
          <div className="mt-4 space-y-3">
            {summary.windowsSplit.map((row) => {
              const pct = summary.total ? Math.round((row.value / summary.total) * 100) : 0;
              return (
                <div key={row.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgb(var(--nx-text-soft))' }}>{row.name}</span>
                    <span className="font-mono" style={{ color: 'rgb(var(--nx-muted))' }}>
                      {formatNumber(row.value, lang)} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full"
                       style={{ background: 'rgb(var(--nx-line) / 0.25)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, rgb(var(--nx-primary)), rgb(var(--nx-accent)))'
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {summary.windowsSplit.length === 0 && (
              <p className="py-4 text-center text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('common.empty')}
              </p>
            )}
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="nx-panel p-5 lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
            {lang === 'pt-BR' ? 'Tendência de atividade' : 'Activity trend'}
          </h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              <LineChart data={summary.activityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--nx-line) / 0.25)" />
                <XAxis dataKey="label" tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--nx-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--nx-panel))',
                    border: '1px solid rgb(var(--nx-line) / 0.4)',
                    borderRadius: 12
                  }}
                  labelStyle={{ color: 'rgb(var(--nx-text))' }}
                  itemStyle={{ color: 'rgb(var(--nx-text))' }}
                />
                <Line type="monotone" dataKey="value" stroke="rgb(var(--nx-accent))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="nx-panel p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
            {lang === 'pt-BR' ? 'Feed de atividade' : 'Activity feed'}
          </h3>
          <ul className="mt-3 space-y-2">
            {(summary.activityFeed || []).slice(0, 6).map((item) => (
              <li key={item.id} className="rounded-xl border p-3" style={{ borderColor: 'rgb(var(--nx-line) / 0.3)' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--nx-text))' }}>{item.hostname}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>{item.title}</p>
                <p className="mt-1 text-xs" style={{ color: 'rgb(var(--nx-text-soft))' }}>
                  {item.unitLabel} · {item.department}
                </p>
              </li>
            ))}
            {(summary.activityFeed || []).length === 0 && (
              <li className="py-4 text-sm text-center" style={{ color: 'rgb(var(--nx-muted))' }}>
                {t('common.empty')}
              </li>
            )}
          </ul>
        </article>
      </div>

      <Modal
        open={!!drill}
        onClose={() => setDrill(null)}
        title={drill?.title || ''}
        subtitle={drill?.subtitle || `${drill?.items.length || 0} ${t('common.of').toLowerCase()} ${formatNumber(summary.total, lang)}`}
        size="lg"
      >
        <ul className="divide-y" style={{ borderColor: 'rgb(var(--nx-line) / 0.2)' }}>
          {(drill?.items || []).slice(0, 50).map((d, index) => (
            drill?.isDemoText ? (
              <li key={`demo-${index}`} className="py-2.5">
                <p className="text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                  {d}
                </p>
              </li>
            ) : (
              <li key={d.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                    {d.hostname || '—'}
                  </p>
                  <p className="truncate text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                    {(d.user || '—')} · {(d.osVersion || '—')} · {(d.unitLabel || '—')}
                  </p>
                </div>
                {d.status ? <StatusBadge status={d.status} /> : null}
              </li>
            )
          ))}
        </ul>
        {(drill?.items.length || 0) > 50 && (
          <p className="mt-3 text-center text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
            +{(drill?.items.length || 0) - 50} {t('common.viewAll').toLowerCase()} →{' '}
            <button
              onClick={() => { navigate('/devices'); setDrill(null); }}
              className="font-semibold underline"
              style={{ color: 'rgb(var(--nx-primary))' }}
            >
              {t('overview.viewDevices')}
            </button>
          </p>
        )}
      </Modal>
    </section>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <header>
      <h1 className="text-3xl font-extrabold tracking-tight"
          style={{ color: 'rgb(var(--nx-text))' }}>{title}</h1>
      <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>{subtitle}</p>
    </header>
  );
}
