import { cn } from "../lib/cn";
import type { Plan } from "@promptforge/core";

const STYLES: Record<Plan, string> = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  pro: "bg-violet-100 text-violet-700 border-violet-200",
  team: "bg-blue-100 text-blue-700 border-blue-200",
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
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border",
        STYLES[plan]
      )}
    >
      {LABELS[plan]}
    </span>
  );
}
