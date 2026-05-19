import { cn } from "../lib/cn";

interface UsageBarProps {
  used: number;
  limit: number;
  className?: string;
}

export function UsageBar({ used, limit, className }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const color =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
        ? "bg-yellow-500"
        : "bg-emerald-500";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{used} used</span>
        <span>{limit}/day</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
