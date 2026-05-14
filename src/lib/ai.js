/**
 * Nexora AI — Local intent engine.
 *
 * Runs entirely in the browser. It analyses the current device state and
 * answers natural-language questions in pt-BR or en using deterministic
 * heuristics. No external API key required.
 *
 * To plug a real LLM later, replace `runLocalEngine` with a fetch to your
 * provider (OpenAI, Claude, Azure OpenAI, etc.) and pass the device summary
 * as system context.
 */

import { summarize } from './devices.js';

const I = {
  'pt-BR': {
    empty: 'Nenhum dispositivo carregado ainda — assim que a sincronização terminar eu posso resumir a frota.',
    intro: (n) => `Sua frota tem ${n} ativos sincronizados. Pergunte sobre risco, ciclo de vida, unidades ou Windows 11.`,
    summary: (s) =>
      `Frota com ${s.total} ativos: ${s.counts.healthy} saudáveis, ${s.counts.attention} em atenção e ${s.counts.critical} críticos. Risco médio ${s.avgRisk}/100. ${s.win11Ready} já estão em Windows 11 (${pct(s.win11Ready, s.total)}%) e ${s.stale} têm sincronização atrasada.`,
    risk: (s, top) =>
      `Existem ${s.counts.critical} dispositivos críticos e ${s.counts.attention} em atenção. Os mais urgentes: ${formatList(top)}. Recomendo revisar ciclo de vida e sincronização.`,
    win: (s, w11, w10, legacy) =>
      `Ambiente Windows: ${w11} em Windows 11, ${w10} em Windows 10 e ${legacy} em versões legadas. Cobertura Win11: ${pct(w11, s.total)}%.`,
    units: (top) =>
      `Maior concentração de ativos por unidade: ${formatList(top.map((u) => `${u.name} (${u.value})`))}.`,
    stale: (n, list) =>
      `${n} dispositivo(s) sem sincronização recente. Priorize: ${formatList(list)}.`,
    notFound: 'Posso ajudar com: resumo da frota, dispositivos críticos, prontidão para Windows 11, unidades com mais ativos ou sincronizações atrasadas.',
    suggest: ['Resumir minha frota', 'Quais ativos críticos?', 'Prontidão para Windows 11', 'Sincronizações atrasadas']
  },
  en: {
    empty: 'No devices loaded yet — once the sync completes I can summarize the fleet.',
    intro: (n) => `Your fleet has ${n} synced assets. Ask about risk, lifecycle, units, or Windows 11 readiness.`,
    summary: (s) =>
      `Fleet of ${s.total} devices: ${s.counts.healthy} healthy, ${s.counts.attention} attention, ${s.counts.critical} critical. Average risk ${s.avgRisk}/100. ${s.win11Ready} are on Windows 11 (${pct(s.win11Ready, s.total)}%) and ${s.stale} have stale sync.`,
    risk: (s, top) =>
      `There are ${s.counts.critical} critical and ${s.counts.attention} attention devices. Top priority: ${formatList(top)}. Review their lifecycle and last sync.`,
    win: (s, w11, w10, legacy) =>
      `Windows estate: ${w11} on Windows 11, ${w10} on Windows 10, ${legacy} on legacy versions. Win11 coverage: ${pct(w11, s.total)}%.`,
    units: (top) =>
      `Top units by device count: ${formatList(top.map((u) => `${u.name} (${u.value})`))}.`,
    stale: (n, list) =>
      `${n} device(s) without recent sync. Prioritize: ${formatList(list)}.`,
    notFound: 'I can help with: fleet summary, critical devices, Windows 11 readiness, busiest units, or stale sync signals.',
    suggest: ['Summarize my fleet', 'Which devices are critical?', 'Windows 11 readiness', 'Stale sync signals']
  }
};

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatList(items) {
  if (!items || items.length === 0) return '—';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' & ' + items.at(-1);
}

function classifyIntent(text) {
  const t = String(text || '').toLowerCase();
  if (!t.trim()) return 'summary';
  if (/(resumo|resumir|summary|summarize|overview)/.test(t)) return 'summary';
  if (/(crítico|critico|critical|risco|risk)/.test(t)) return 'risk';
  if (/(windows ?11|win11|migra|upgrade|atualiz)/.test(t)) return 'windows';
  if (/(unidad|unit|escritório|office|setor|department)/.test(t)) return 'units';
  if (/(stale|sync|sincroniz|atrasad|sem contato)/.test(t)) return 'stale';
  return 'unknown';
}

export function suggestions(lang) {
  return (I[lang] || I['pt-BR']).suggest;
}

export function intro(devices, lang) {
  const dict = I[lang] || I['pt-BR'];
  if (!devices || devices.length === 0) return dict.empty;
  return dict.intro(devices.length);
}

/**
 * Public entry point used by the UI.
 * Returns a Promise<string> so it stays compatible if you swap with a remote LLM.
 */
export async function ask(question, devices, lang = 'pt-BR') {
  return runLocalEngine(question, devices, lang);
}

function runLocalEngine(question, devices, lang) {
  const dict = I[lang] || I['pt-BR'];
  if (!devices || devices.length === 0) return dict.empty;

  const s = summarize(devices);
  const intent = classifyIntent(question);

  switch (intent) {
    case 'summary':
      return dict.summary(s);
    case 'risk': {
      const top = [...devices]
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 5)
        .map((d) => `${d.hostname} (${d.risk}%)`);
      return dict.risk(s, top);
    }
    case 'windows': {
      const w11 = devices.filter((d) => d.osVersion === 'Windows 11').length;
      const w10 = devices.filter((d) => d.osVersion === 'Windows 10').length;
      const legacy = devices.filter((d) => d.osVersion === 'Windows (legacy)').length;
      return dict.win(s, w11, w10, legacy);
    }
    case 'units': {
      const top = [...s.unitDistribution]
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      return dict.units(top);
    }
    case 'stale': {
      const cutoff = Date.now() - 30 * 86_400_000;
      const stale = devices
        .filter((d) => !d.lastSeen || new Date(d.lastSeen).getTime() < cutoff)
        .sort((a, b) => (a.lastSeen || '').localeCompare(b.lastSeen || ''))
        .slice(0, 5)
        .map((d) => d.hostname);
      return dict.stale(s.stale, stale);
    }
    default:
      return dict.notFound;
  }
}
