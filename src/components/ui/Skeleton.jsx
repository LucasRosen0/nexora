export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="nx-card">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-4 h-3 w-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-3 w-1/5" />
      <Skeleton className="h-3 w-1/6" />
      <Skeleton className="h-3 w-1/5" />
      <Skeleton className="h-3 w-1/6" />
    </div>
  );
}
