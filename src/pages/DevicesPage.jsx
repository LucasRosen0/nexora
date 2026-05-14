import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Plus, Upload, Download, StickyNote, Trash2, ChevronLeft, ChevronRight, Edit3
} from 'lucide-react';
import { useDevices } from '../store/DevicesContext.jsx';
import { useNotes } from '../store/NotesContext.jsx';
import { useI18n } from '../store/I18nContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { exportToCsv, importFromCsv } from '../lib/csv.js';
import { formatNumber, formatRelative, classNames } from '../lib/format.js';

const PAGE_SIZE = 12;

function PageHeader({ title, subtitle, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--nx-text))' }}>{title}</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--nx-muted))' }}>{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </header>
  );
}

export function DevicesPage() {
  const { devices, addDevice, updateDevice, removeDevice, importDevices } = useDevices();
  const notes = useNotes();
  const { t, lang } = useI18n();
  const toast = useToast();
  const fileRef = useRef(null);

  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState('all');
  const [status, setStatus] = useState('all');
  const [os, setOs] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // device | { __new: true }
  const [noting, setNoting] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const units = useMemo(() => Array.from(new Set(devices.map((d) => d.unitLabel))).sort(), [devices]);
  const oss = useMemo(() => Array.from(new Set(devices.map((d) => d.osVersion))).sort(), [devices]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return devices.filter((d) => {
      if (status !== 'all' && d.status !== status) return false;
      if (unit !== 'all' && d.unitLabel !== unit) return false;
      if (os !== 'all' && d.osVersion !== os) return false;
      if (!term) return true;
      const blob = [d.hostname, d.user, d.unitLabel, d.department, d.ip, d.model, d.manufacturer, d.osVersion]
        .filter(Boolean).join(' ').toLowerCase();
      return blob.includes(term);
    });
  }, [devices, search, status, unit, os]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onExport = () => {
    const ok = exportToCsv(`nexora-devices-${new Date().toISOString().slice(0, 10)}`, filtered.map((d) => ({
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
      risk: d.risk,
      status: d.status,
      lastSeen: d.lastSeen || '',
      notes: notes.get(d.id) || d.notes || ''
    })));
    if (ok) toast.success(t('devices.exportSuccess'));
    else toast.error(t('common.empty'));
  };

  const onImportClick = () => fileRef.current?.click();
  const onImportChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const rows = await importFromCsv(file);
      const count = importDevices(rows);
      toast.success(t('devices.importSuccess', { count }));
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  return (
    <section>
      <PageHeader title={t('devices.title')} subtitle={t('devices.subtitle')}>
        <input
          ref={fileRef} type="file" accept=".csv,text/csv"
          className="hidden" onChange={onImportChange}
        />
        <button onClick={onImportClick} className="nx-btn nx-btn-ghost">
          <Upload size={15} /> {t('common.importCsv')}
        </button>
        <button onClick={onExport} className="nx-btn nx-btn-ghost">
          <Download size={15} /> {t('common.exportCsv')}
        </button>
        <button onClick={() => setEditing({ __new: true })} className="nx-btn nx-btn-primary">
          <Plus size={15} /> {t('common.addDevice')}
        </button>
      </PageHeader>

      <div className="nx-panel mt-5 grid gap-3 p-4 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="relative">
          <Search size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgb(var(--nx-muted))' }} />
          <input
            className="nx-input pl-9"
            placeholder={t('devices.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select label={t('devices.filterUnit')} value={unit} onChange={(v) => { setUnit(v); setPage(1); }}
                options={[{ v: 'all', l: t('common.all') }, ...units.map((u) => ({ v: u, l: u }))]} />
        <Select label={t('devices.filterStatus')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
                options={[
                  { v: 'all', l: t('common.all') },
                  { v: 'healthy', l: t('status.healthy') },
                  { v: 'attention', l: t('status.attention') },
                  { v: 'critical', l: t('status.critical') }
                ]} />
        <Select label={t('devices.filterOs')} value={os} onChange={(v) => { setOs(v); setPage(1); }}
                options={[{ v: 'all', l: t('common.all') }, ...oss.map((o) => ({ v: o, l: o }))]} />
      </div>

      <div className="nx-panel mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'rgb(var(--nx-muted))', background: 'rgb(var(--nx-bg-soft) / 0.5)' }}>
                <Th>{t('devices.columns.hostname')}</Th>
                <Th>{t('devices.columns.user')}</Th>
                <Th>{t('devices.columns.unit')}</Th>
                <Th>{t('devices.columns.os')}</Th>
                <Th right>{t('devices.columns.ram')}</Th>
                <Th right>{t('devices.columns.risk')}</Th>
                <Th>{t('devices.columns.status')}</Th>
                <Th>{t('devices.columns.lastSeen')}</Th>
                <Th right>{t('devices.columns.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {view.map((d) => (
                <tr key={d.id} className="border-t transition hover:bg-white/[0.02]"
                    style={{ borderColor: 'rgb(var(--nx-line) / 0.2)' }}>
                  <Td>
                    <div className="font-semibold" style={{ color: 'rgb(var(--nx-text))' }}>
                      {d.hostname}
                    </div>
                    <div className="text-xs" style={{ color: 'rgb(var(--nx-muted))' }}>
                      {d.manufacturer} · {d.model}
                    </div>
                  </Td>
                  <Td>{d.user || <Muted>—</Muted>}</Td>
                  <Td>{d.unitLabel}</Td>
                  <Td>{d.osVersion}</Td>
                  <Td right>{d.ramGb ? `${d.ramGb} GB` : <Muted>—</Muted>}</Td>
                  <Td right>
                    <span className="font-mono"
                          style={{
                            color: d.risk >= 65 ? 'rgb(var(--nx-danger))'
                                 : d.risk >= 40 ? 'rgb(var(--nx-warning))'
                                 : 'rgb(var(--nx-success))'
                          }}>
                      {d.risk}
                    </span>
                  </Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td>
                    <span style={{ color: 'rgb(var(--nx-text-soft))' }}>
                      {formatRelative(d.lastSeen, lang)}
                    </span>
                  </Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title={t('common.notes')} onClick={() => setNoting(d)}>
                        <StickyNote size={14} />
                      </IconBtn>
                      <IconBtn title={t('common.edit')} onClick={() => setEditing(d)}>
                        <Edit3 size={14} />
                      </IconBtn>
                      <IconBtn title={t('common.delete')} onClick={() => setConfirming(d)} danger>
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </Td>
                </tr>
              ))}
              {view.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm"
                      style={{ color: 'rgb(var(--nx-muted))' }}>
                    {t('devices.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-xs"
             style={{ borderColor: 'rgb(var(--nx-line) / 0.3)', color: 'rgb(var(--nx-muted))' }}>
          <span>
            {formatNumber(filtered.length, lang)} {lang === 'pt-BR' ? 'registros' : 'records'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md border p-1.5 disabled:opacity-40"
              style={{ borderColor: 'rgb(var(--nx-line) / 0.5)' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ color: 'rgb(var(--nx-text))' }}>
              {t('common.page')} {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-md border p-1.5 disabled:opacity-40"
              style={{ borderColor: 'rgb(var(--nx-line) / 0.5)' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <DeviceFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        device={editing && !editing.__new ? editing : null}
        onSubmit={(payload) => {
          if (editing?.__new) {
            addDevice(payload);
            toast.success(t('devices.added'));
          } else {
            updateDevice(editing.id, payload);
            toast.success(t('devices.updated'));
          }
          setEditing(null);
        }}
      />

      <NotesModal
        open={!!noting}
        onClose={() => setNoting(null)}
        device={noting}
        getNote={notes.get}
        setNote={(id, text) => { notes.set(id, text); }}
      />

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={t('common.delete')}
        subtitle={confirming?.hostname}
        footer={
          <>
            <button className="nx-btn nx-btn-ghost" onClick={() => setConfirming(null)}>
              {t('common.cancel')}
            </button>
            <button
              className="nx-btn nx-btn-primary"
              style={{ background: 'linear-gradient(135deg, rgb(var(--nx-danger)), rgb(248,113,113))' }}
              onClick={() => {
                removeDevice(confirming.id);
                toast.success(t('devices.deleted'));
                setConfirming(null);
              }}
            >
              {t('common.delete')}
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: 'rgb(var(--nx-text-soft))' }}>
          {t('devices.confirmDelete')}
        </p>
      </Modal>
    </section>
  );
}

function Th({ children, right }) {
  return <th className={classNames('px-4 py-3', right && 'text-right')}>{children}</th>;
}
function Td({ children, right }) {
  return <td className={classNames('px-4 py-3 align-middle', right && 'text-right')}
             style={{ color: 'rgb(var(--nx-text-soft))' }}>{children}</td>;
}
function Muted({ children }) {
  return <span style={{ color: 'rgb(var(--nx-muted))' }}>{children}</span>;
}
function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-md border p-1.5 transition hover:opacity-90"
      style={{
        borderColor: danger ? 'rgb(var(--nx-danger) / 0.4)' : 'rgb(var(--nx-line) / 0.5)',
        color: danger ? 'rgb(var(--nx-danger))' : 'rgb(var(--nx-text-soft))',
        background: 'rgb(var(--nx-bg-soft) / 0.4)'
      }}
    >
      {children}
    </button>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'rgb(var(--nx-muted))' }}>
        {label}
      </span>
      <select
        className="nx-input py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v} style={{ background: 'rgb(var(--nx-panel))' }}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function DeviceFormModal({ open, onClose, device, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState(() => emptyForm(device));

  // Reset form whenever the modal is (re)opened or the device prop changes
  useEffect(() => {
    if (open) setForm(emptyForm(device));
  }, [open, device]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={device ? t('devices.editTitle') : t('devices.addTitle')}
      subtitle={device?.hostname}
      size="lg"
      footer={
        <>
          <button className="nx-btn nx-btn-ghost" onClick={onClose}>{t('common.cancel')}</button>
          <button
            className="nx-btn nx-btn-primary"
            onClick={() => onSubmit(form)}
            disabled={!form.hostname.trim()}
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <DeviceFormBody form={form} setForm={setForm} />
    </Modal>
  );
}

function emptyForm(device) {
  if (device) {
    return {
      hostname: device.hostname || '',
      user: device.user || '',
      unit: device.unit || 'GLOBAL',
      unitLabel: device.unitLabel || 'Global',
      department: device.department || '',
      osVersion: device.osVersion || 'Windows 11',
      cpu: device.cpu || '',
      ramGb: device.ramGb || '',
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      ip: device.ip || '',
      risk: device.risk || 25
    };
  }
  return {
    hostname: '', user: '', unit: 'ALP', unitLabel: 'Alpha', department: '',
    osVersion: 'Windows 11', cpu: '', ramGb: 8, manufacturer: '', model: '',
    ip: '', risk: 22
  };
}

function DeviceFormBody({ form, setForm }) {
  const { t } = useI18n();
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={t('devices.columns.hostname')} required>
        <input className="nx-input" value={form.hostname} onChange={(e) => set('hostname', e.target.value)} />
      </Field>
      <Field label={t('devices.columns.user')}>
        <input className="nx-input" value={form.user} onChange={(e) => set('user', e.target.value)} />
      </Field>
      <Field label={t('devices.columns.unit')}>
        <input className="nx-input" value={form.unitLabel} onChange={(e) => set('unitLabel', e.target.value)} />
      </Field>
      <Field label="Department">
        <input className="nx-input" value={form.department} onChange={(e) => set('department', e.target.value)} />
      </Field>
      <Field label={t('devices.columns.os')}>
        <input className="nx-input" value={form.osVersion} onChange={(e) => set('osVersion', e.target.value)} />
      </Field>
      <Field label="CPU">
        <input className="nx-input" value={form.cpu} onChange={(e) => set('cpu', e.target.value)} />
      </Field>
      <Field label={`${t('devices.columns.ram')} (GB)`}>
        <input className="nx-input" type="number" min="0" value={form.ramGb}
               onChange={(e) => set('ramGb', e.target.value === '' ? '' : Number(e.target.value))} />
      </Field>
      <Field label="Manufacturer">
        <input className="nx-input" value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} />
      </Field>
      <Field label="Model">
        <input className="nx-input" value={form.model} onChange={(e) => set('model', e.target.value)} />
      </Field>
      <Field label="IP">
        <input className="nx-input" value={form.ip} onChange={(e) => set('ip', e.target.value)} />
      </Field>
      <Field label={`${t('devices.columns.risk')} (0-100)`}>
        <input className="nx-input" type="number" min="0" max="100" value={form.risk}
               onChange={(e) => set('risk', Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
      </Field>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'rgb(var(--nx-muted))' }}>
        {label}{required && ' *'}
      </span>
      {children}
    </label>
  );
}

function NotesModal({ open, onClose, device, getNote, setNote }) {
  const { t } = useI18n();
  const [text, setText] = useState('');

  useEffect(() => {
    if (open && device) setText(getNote(device.id) || '');
  }, [open, device, getNote]);

  if (!device) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('devices.notesTitle')}
      subtitle={device.hostname}
      footer={
        <>
          <button className="nx-btn nx-btn-ghost" onClick={onClose}>{t('common.close')}</button>
          <button className="nx-btn nx-btn-primary"
                  onClick={() => { setNote(device.id, text); onClose(); }}>
            {t('common.save')}
          </button>
        </>
      }
    >
      <textarea
        className="nx-input min-h-[180px] resize-y"
        placeholder={t('devices.notesPlaceholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </Modal>
  );
}
