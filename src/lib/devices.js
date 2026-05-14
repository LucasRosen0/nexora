/**
 * Normalization layer over the raw mock-data shape.
 * Produces a canonical Device object used everywhere in the UI.
 */

const UNIT_LABELS = {
  ALP: 'Alpha', BET: 'Beta', GAM: 'Gamma',
  DEL: 'Delta', EPS: 'Epsilon', ZET: 'Zeta'
};

function detectOsFamily(raw) {
  const text = String(raw || '').toLowerCase();
  if (text.includes('windows 11')) return { family: 'Windows', version: 'Windows 11' };
  if (text.includes('windows 10')) return { family: 'Windows', version: 'Windows 10' };
  if (text.includes('windows')) return { family: 'Windows', version: 'Windows (legacy)' };
  if (text.includes('mac') || text.includes('darwin')) return { family: 'macOS', version: raw || 'macOS' };
  if (text.includes('ubuntu') || text.includes('debian') || text.includes('linux') || text.includes('fedora')) {
    return { family: 'Linux', version: raw || 'Linux' };
  }
  return { family: 'Other', version: raw || 'Unknown' };
}

function computeRisk(row, os, ramGb) {
  let risk = 18;
  // OS posture
  if (os.version === 'Windows 10') risk += 22;
  else if (os.version === 'Windows (legacy)') risk += 35;
  else if (os.family === 'Other') risk += 15;
  // RAM
  if (ramGb && ramGb < 8) risk += 18;
  else if (ramGb && ramGb < 4) risk += 28;
  // Last contact
  const last = parseDate(row.ultimo_contato);
  if (last) {
    const days = Math.floor((Date.now() - last.getTime()) / 86_400_000);
    if (days > 90) risk += 24;
    else if (days > 30) risk += 12;
  } else {
    risk += 10;
  }
  // Missing data
  if (!row.usuario_principal) risk += 4;
  if (!row.ip) risk += 4;
  return Math.min(98, Math.max(2, risk));
}

function parseDate(value) {
  if (!value) return null;
  const text = String(value).includes('T') ? value : String(value).replace(' ', 'T');
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function statusFromRisk(risk) {
  if (risk >= 65) return 'critical';
  if (risk >= 40) return 'attention';
  return 'healthy';
}

export function normalizeDevice(row) {
  const os = detectOsFamily(row.sistema_operacional);
  const ramGb = Number(row.ram_gb) || (row.ram_mb ? Math.round(Number(row.ram_mb) / 1024) : null);
  const risk = computeRisk(row, os, ramGb);
  const status = statusFromRisk(risk);
  const last = parseDate(row.ultimo_contato);

  return {
    id: row.id,
    hostname: row.computador || '—',
    user: row.usuario_principal || null,
    unit: String(row.unidade || '').toUpperCase() || 'GLOBAL',
    unitLabel: UNIT_LABELS[String(row.unidade || '').toUpperCase()] || 'Global',
    department: row.setor || '—',
    osFamily: os.family,
    osVersion: os.version,
    osRaw: row.sistema_operacional || '—',
    cpu: row.tipo_cpu || '—',
    ramGb,
    manufacturer: row.fabricante || '—',
    model: row.modelo || '—',
    serial: row.numero_serie || '—',
    asset: row.patrimonio || row.patrimonio_monitor || null,
    ip: row.ip || null,
    mac: row.endereco_mac || row.mac_address || null,
    domain: row.dominio || null,
    category: row.categoria_ativos || '—',
    biosDate: row.data_bios || null,
    lastSeen: last ? last.toISOString() : null,
    risk,
    status,
    notes: row.observacoes || ''
  };
}

export function summarize(devices) {
  const total = devices.length;
  const counts = { healthy: 0, attention: 0, critical: 0 };
  const byOs = new Map();
  const byUnit = new Map();
  const winSplit = { 'Windows 11': 0, 'Windows 10': 0, 'Windows (legacy)': 0 };
  let stale = 0;
  let win11Ready = 0;
  let totalRisk = 0;
  const now = Date.now();

  for (const d of devices) {
    counts[d.status] = (counts[d.status] || 0) + 1;
    byOs.set(d.osFamily, (byOs.get(d.osFamily) || 0) + 1);
    byUnit.set(d.unitLabel, (byUnit.get(d.unitLabel) || 0) + 1);
    if (d.osFamily === 'Windows') {
      winSplit[d.osVersion] = (winSplit[d.osVersion] || 0) + 1;
      if (d.osVersion === 'Windows 11') win11Ready += 1;
    }
    if (d.lastSeen) {
      const days = (now - new Date(d.lastSeen).getTime()) / 86_400_000;
      if (days > 30) stale += 1;
    } else {
      stale += 1;
    }
    totalRisk += d.risk;
  }

  return {
    total,
    counts,
    healthyPct: total ? Math.round((counts.healthy / total) * 100) : 0,
    osDistribution: Array.from(byOs.entries()).map(([name, value]) => ({ name, value })),
    unitDistribution: Array.from(byUnit.entries()).map(([name, value]) => ({ name, value })),
    windowsSplit: Object.entries(winSplit)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value })),
    stale,
    win11Ready,
    avgRisk: total ? Math.round(totalRisk / total) : 0
  };
}
