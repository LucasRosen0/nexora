import { useI18n } from '../../store/I18nContext.jsx';

const STYLES = {
  healthy: { color: 'rgb(var(--nx-success))', bg: 'rgb(var(--nx-success) / 0.12)', dot: 'rgb(var(--nx-success))' },
  attention: { color: 'rgb(var(--nx-warning))', bg: 'rgb(var(--nx-warning) / 0.12)', dot: 'rgb(var(--nx-warning))' },
  critical: { color: 'rgb(var(--nx-danger))', bg: 'rgb(var(--nx-danger) / 0.12)', dot: 'rgb(var(--nx-danger))' }
};

export function StatusBadge({ status }) {
  const { t } = useI18n();
  const style = STYLES[status] || STYLES.healthy;
  return (
    <span
      className="nx-chip"
      style={{ background: style.bg, color: style.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: style.dot, boxShadow: `0 0 10px ${style.dot}` }}
      />
      {t(`status.${status}`)}
    </span>
  );
}
