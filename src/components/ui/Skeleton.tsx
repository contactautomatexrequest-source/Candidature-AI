export function Skeleton({ className = "", lines = 1 }: { className?: string; lines?: number }) {
  if (lines === 1) {
    return <div className={`skeleton rounded ${className}`} />;
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton rounded ${i === lines - 1 ? "w-3/4" : "w-full"} ${className}`} />
      ))}
    </div>
  );
}

