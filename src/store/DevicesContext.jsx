import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchHealth, fetchMachines } from '../lib/api.js';
import { normalizeDevice, statusFromRisk, summarize } from '../lib/devices.js';

const CUSTOM_KEY = 'nexora.devices.custom.v1';
const DELETED_KEY = 'nexora.devices.deleted.v1';

const DevicesContext = createContext(null);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {/* ignore */}
}

export function DevicesProvider({ children }) {
  const [remote, setRemote] = useState([]);
  const [custom, setCustom] = useState(() => readJSON(CUSTOM_KEY, []));
  const [deleted, setDeleted] = useState(() => readJSON(DELETED_KEY, []));
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState({ ok: false, generatedAt: null });
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthPayload, machinesPayload] = await Promise.all([
        fetchHealth().catch(() => ({ ok: false })),
        fetchMachines({ limit: 5000 })
      ]);
      setHealth({
        ok: !!healthPayload.ok,
        generatedAt: healthPayload.generatedAt || null
      });
      const list = (machinesPayload.data || []).map(normalizeDevice);
      setRemote(list);
    } catch (err) {
      console.error('[devices] load failed', err);
      setError(err.message || 'load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Persist user-side data
  useEffect(() => { writeJSON(CUSTOM_KEY, custom); }, [custom]);
  useEffect(() => { writeJSON(DELETED_KEY, deleted); }, [deleted]);

  const devices = useMemo(() => {
    const deletedSet = new Set(deleted);
    const merged = [...remote.filter((d) => !deletedSet.has(d.id)), ...custom];
    return merged;
  }, [remote, custom, deleted]);

  const summary = useMemo(() => summarize(devices), [devices]);

  const addDevice = useCallback((partial) => {
    const id = `nx-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`;
    const ramGb = Number(partial.ramGb) || null;
    const risk = Number(partial.risk) || 25;
    const next = {
      id,
      hostname: partial.hostname || 'NEW-DEVICE',
      user: partial.user || null,
      unit: (partial.unit || 'GLOBAL').toUpperCase(),
      unitLabel: partial.unitLabel || partial.unit || 'Global',
      department: partial.department || '—',
      osFamily: partial.osFamily || 'Windows',
      osVersion: partial.osVersion || 'Windows 11',
      osRaw: partial.osVersion || 'Windows 11',
      cpu: partial.cpu || '—',
      ramGb,
      manufacturer: partial.manufacturer || '—',
      model: partial.model || '—',
      serial: partial.serial || '—',
      asset: partial.asset || null,
      ip: partial.ip || null,
      mac: partial.mac || null,
      domain: partial.domain || null,
      category: partial.category || 'Workstation',
      biosDate: partial.biosDate || null,
      lastSeen: new Date().toISOString(),
      risk,
      status: statusFromRisk(risk),
      notes: partial.notes || ''
    };
    setCustom((prev) => [next, ...prev]);
    return next;
  }, []);

  const updateDevice = useCallback((id, patch) => {
    setCustom((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    // Remote ones can't be patched on the server; we keep an override map in custom too
    setRemote((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      const merged = { ...d, ...patch };
      const ramGb = Number(merged.ramGb) || null;
      const risk = Number(merged.risk) || d.risk;
      return { ...merged, ramGb, risk, status: statusFromRisk(risk) };
    }));
  }, []);

  const removeDevice = useCallback((id) => {
    setCustom((prev) => prev.filter((d) => d.id !== id));
    setDeleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const importDevices = useCallback((rows) => {
    if (!Array.isArray(rows)) return 0;
    let added = 0;
    rows.forEach((r) => {
      if (!r || typeof r !== 'object') return;
      addDevice({
        hostname: r.hostname || r.computador || r.Hostname,
        user: r.user || r.usuario_principal || r.User,
        unit: r.unit || r.unidade || r.Unit,
        department: r.department || r.setor || r.Department,
        osVersion: r.osVersion || r.os || r.sistema_operacional,
        cpu: r.cpu || r.tipo_cpu,
        ramGb: r.ramGb || r.ram_gb || r.RAM,
        manufacturer: r.manufacturer || r.fabricante,
        model: r.model || r.modelo,
        serial: r.serial || r.numero_serie,
        ip: r.ip || r.IP,
        notes: r.notes || r.observacoes
      });
      added += 1;
    });
    return added;
  }, [addDevice]);

  const clearLocal = useCallback(() => {
    setCustom([]);
    setDeleted([]);
    localStorage.removeItem(CUSTOM_KEY);
    localStorage.removeItem(DELETED_KEY);
  }, []);

  const value = useMemo(
    () => ({
      devices,
      summary,
      loading,
      error,
      health,
      reload: load,
      addDevice,
      updateDevice,
      removeDevice,
      importDevices,
      clearLocal
    }),
    [devices, summary, loading, error, health, load, addDevice, updateDevice, removeDevice, importDevices, clearLocal]
  );

  return <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>;
}

export function useDevices() {
  const ctx = useContext(DevicesContext);
  if (!ctx) throw new Error('useDevices must be used within DevicesProvider');
  return ctx;
}
