import { cn } from "../lib/cn";
import type { Plan } from "@promptforge/core";

const STYLES: Record<Plan, string> = {
  free: "text-[var(--text-muted)]",
  pro: "text-[var(--accent)]",
  team: "text-[var(--green)]",
};

const LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border",
        STYLES[plan]
      )}
      style={{
        backgroundColor: plan === "free"
          ? "var(--surface-hover)"
          : plan === "pro"
            ? "var(--accent-dim)"
            : "var(--green-dim)",
        borderColor: plan === "free"
          ? "var(--border)"
          : plan === "pro"
            ? "var(--accent-border)"
            : "rgba(74,222,128,0.2)",
      }}
    >
      {LABELS[plan]}
    </span>
  );
}
