export function formatNumber(value, locale = 'pt-BR') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale).format(n);
}

export function formatPercent(value, locale = 'pt-BR', digits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(n / 100);
}

export function formatDate(value, locale = 'pt-BR') {
  if (!value) return '—';
  const text = String(value).includes('T') ? value : String(value).replace(' ', 'T');
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRelative(value, locale = 'pt-BR') {
  if (!value) return '—';
  const text = String(value).includes('T') ? value : String(value).replace(' ', 'T');
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return '—';
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return locale.startsWith('pt') ? 'Hoje' : 'Today';
  if (days === 1) return locale.startsWith('pt') ? '1 dia' : '1 day';
  if (days < 30) return locale.startsWith('pt') ? `${days} dias` : `${days} days`;
  if (days < 365) {
    const m = Math.floor(days / 30);
    return locale.startsWith('pt') ? `${m} ${m === 1 ? 'mês' : 'meses'}` : `${m} mo`;
  }
  const y = Math.floor(days / 365);
  return locale.startsWith('pt') ? `${y} ${y === 1 ? 'ano' : 'anos'}` : `${y} y`;
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}
