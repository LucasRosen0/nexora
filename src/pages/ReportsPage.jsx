import { useRef, useState } from 'react';
import { Download, Upload, FileJson, FileText } from 'lucide-react';
import { useDevices } from '../store/DevicesContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import { useNotes } from '../store/NotesContext.jsx';
import { exportToCsv, importFromCsv } from '../lib/csv.js';
import { Modal } from '../components/ui/Modal.jsx';
import { formatDate, formatNumber } from '../lib/format.js';

export function ReportsPage() {
  const { devices, summary, importDevices } = useDevices();
  const notes = useNotes();
  const { t, lang } = useI18n();
  const toast = useToast();
  const csvRef = useRef(null);
  const jsonRef = useRef(null);
  const [preview, setPreview] = useState(null); // { rows, count }

  const buildOperationalCsv = () => {
    const rows = devices.map((d) => ({
      hostname: d.hostname,
      user: d.user || '',
      unit: d.unitLabel,
      department: d.department,
      os: d.osVersion,
      cpu: d.cpu,
      ram_gb: d.ramGb || '',
      manufacturer: d.manufacturer,
      model: d.model,
      ip: d.ip || '',
      mac: d.mac || '',
      risk: d.risk,
      status: d.status,
      lastSeen: d.lastSeen || '',
      notes: notes.get(d.id) || d.notes || ''
    }));
    const ok = exportToCsv(`nexora-operational-${new Date().toISOString().slice(0, 10)}`, rows);
    if (ok) toast.success(t('devices.exportSuccess'));
  };

  const buildSummaryJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      total: summary.total,
      counts: summary.counts,
      avgRisk: summary.avgRisk,
      win11Ready: summary.win11Ready,
      stale: summary.stale,
      osDistribution: summary.osDistribution,
      unitDistribution: summary.unitDistribution
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-summary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('reports.summaryReady'));
  };

  const onCsvSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const rows = await importFromCsv(file);
      setPreview({ rows, count: rows.length, kind: 'csv' });
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  const onJsonSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rows = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.machines)
        ? parsed.machines
        : Array.isArray(parsed.devices)
        ? parsed.devices
        : [];
      setPreview({ rows, count: rows.length, kind: 'json' });
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  const confirmImport = () => {
    if (!preview) return;
    const added = importDevices(preview.rows);
    toast.success(t('devices.importSuccess', { count: added }));
    setPreview(null);
  };

  const sampleColumns = preview?.rows[0] ? Object.keys(preview.rows[0]).slice(0, 6) : [];

  return (
    <section>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>
          {t('reports.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>
          {t('reports.subtitle')}
        </p>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card
          icon={Download}
          title={t('reports.buildCsv')}
          description={
            lang === 'pt-BR'
              ? 'Inventário consolidado com observações para auditoria, ITAM e compliance.'
              : 'Consolidated inventory with notes for audit, ITAM and compliance.'
          }
          action={t('common.exportCsv')}
          onAction={buildOperationalCsv}
          accent="rgb(var(--nx-primary))"
          accentSoft="rgb(var(--nx-primary) / 0.14)"
        />
        <Card
          icon={FileJson}
          title={t('reports.buildSummary')}
          description={
            lang === 'pt-BR'
              ? 'Resumo executivo (JSON) com KPIs, distribuições e prontidão Windows 11.'
              : 'Executive summary (JSON) with KPIs, distributions and Windows 11 readiness.'
          }
          action="Export JSON"
          onAction={buildSummaryJson}
          accent="rgb(var(--nx-accent))"
          accentSoft="rgb(var(--nx-accent) / 0.14)"
        />
        <Card
          icon={Upload}
          title={t('common.importCsv')}
          description={
            lang === 'pt-BR'
              ? 'Importe um CSV exportado anteriormente ou planilha com cabeçalhos compatíveis.'
              : 'Import a previously exported CSV or any spreadsheet with compatible headers.'
          }
          action={t('common.importCsv')}
          onAction={() => csvRef.current?.click()}
          accent="rgb(var(--nx-glow))"
          accentSoft="rgb(var(--nx-glow) / 0.14)"
        />
        <Card
          icon={FileText}
          title={lang === 'pt-BR' ? 'Importar JSON' : 'Import JSON'}
          description={
            lang === 'pt-BR'
              ? 'Aceita o formato sintético da própria plataforma ou listas { machines: [...] }.'
              : 'Accepts the platform synthetic format or arbitrary { machines: [...] } payloads.'
          }
          action={lang === 'pt-BR' ? 'Importar JSON' : 'Import JSON'}
          onAction={() => jsonRef.current?.click()}
          accent="rgb(var(--nx-success))"
          accentSoft="rgb(var(--nx-success) / 0.14)"
        />
      </div>

      <input ref={csvRef} type="file" accept=".csv,text/csv" hidden onChange={onCsvSelect} />
      <input ref={jsonRef} type="file" accept=".json,application/json" hidden onChange={onJsonSelect} />

      <div className="nx-panel mt-6 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
          {lang === 'pt-BR' ? 'Snapshot atual' : 'Current snapshot'}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Snap label={lang === 'pt-BR' ? 'Ativos' : 'Assets'} value={formatNumber(summary.total, lang)} />
          <Snap label={lang === 'pt-BR' ? 'Saudáveis' : 'Healthy'} value={formatNumber(summary.counts.healthy, lang)} />
          <Snap label={lang === 'pt-BR' ? 'Atenção' : 'Attention'} value={formatNumber(summary.counts.attention, lang)} />
          <Snap label={lang === 'pt-BR' ? 'Críticos' : 'Critical'} value={formatNumber(summary.counts.critical, lang)} />
        </div>
        <p className="mt-3 text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
          {lang === 'pt-BR' ? 'Geração:' : 'Generated:'} {formatDate(new Date().toISOString(), lang)}
        </p>
      </div>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={lang === 'pt-BR' ? 'Pré-visualização da importação' : 'Import preview'}
        subtitle={preview ? `${preview.count} ${lang === 'pt-BR' ? 'linhas' : 'rows'}` : ''}
        size="lg"
        footer={
          <>
            <button className="nx-btn nx-btn-ghost" onClick={() => setPreview(null)}>
              {t('common.cancel')}
            </button>
            <button className="nx-btn nx-btn-primary" onClick={confirmImport}>
              {t('common.apply')}
            </button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
                {sampleColumns.map((c) => (
                  <th key={c} className="px-3 py-2">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(preview?.rows || []).slice(0, 8).map((row, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'rgb(var(--nx-line) / 0.25)' }}>
                  {sampleColumns.map((c) => (
                    <td key={c} className="px-3 py-2" style={{ color: 'rgb(var(--nx-text-soft))' }}>
                      {String(row[c] ?? '—').slice(0, 60)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </section>
  );
}

function Card({ icon: Icon, title, description, action, onAction, accent, accentSoft }) {
  return (
    <article className="nx-card flex flex-col">
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: accentSoft, color: accent }}
      >
        <Icon size={18} />
      </span>
      <h3 className="mt-4 text-base font-bold" style={{ color: 'rgb(var(--nx-text))' }}>
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgb(var(--nx-muted))' }}>
        {description}
      </p>
      <div className="mt-4">
        <button onClick={onAction} className="nx-btn nx-btn-primary">
          {action}
        </button>
      </div>
    </article>
  );
}

function Snap({ label, value }) {
  return (
    <div className="rounded-xl border p-3"
         style={{ borderColor: 'rgb(var(--nx-line) / 0.3)', background: 'rgb(var(--nx-bg-soft) / 0.5)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--nx-muted))' }}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold" style={{ color: 'rgb(var(--nx-text))' }}>
        {value}
      </p>
    </div>
  );
}
