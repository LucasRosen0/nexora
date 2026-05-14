/**
 * Nexora wordmark + symbol.
 * Inline SVG, no external deps. Inherits text color via currentColor.
 */
export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Nexora"
    >
      <defs>
        <linearGradient id="nx-mark-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--nx-primary))" />
          <stop offset="1" stopColor="rgb(var(--nx-accent))" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14"
            fill="rgb(var(--nx-bg-soft))" stroke="rgb(var(--nx-line) / 0.5)" />
      <path
        d="M16 46 V18 h6 l20 22 V18 h6 v28 h-6 L22 24 v22 z"
        fill="url(#nx-mark-grad)"
      />
    </svg>
  );
}

export function Logo({ size = 'md', className = '' }) {
  const dims = size === 'lg' ? { mark: 40, font: 'text-2xl' }
            : size === 'sm' ? { mark: 22, font: 'text-base' }
            : { mark: 30, font: 'text-xl' };
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={dims.mark} />
      <span className={`font-extrabold tracking-tight ${dims.font}`}
            style={{ color: 'rgb(var(--nx-text))', letterSpacing: '-0.02em' }}>
        Nexora
      </span>
    </div>
  );
}
