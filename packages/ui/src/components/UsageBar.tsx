import { cn } from "../lib/cn";

interface UsageBarProps {
  used: number;
  limit: number;
  className?: string;
}

export function UsageBar({ used, limit, className }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
        <span>{used} used</span>
        <span>{limit}/day</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-hover)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
