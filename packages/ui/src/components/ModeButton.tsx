import { cn } from "../lib/cn";
import type { Mode } from "@promptforge/core";

export const MODE_META: Record<
  string,
  { label: string; description: string; shortcut: string; emoji: string }
> = {
  auto: {
    label: "Auto",
    description: "Let AI decide compress or enhance",
    shortcut: "",
    emoji: "⚡",
  },
  compress: {
    label: "Compress",
    description: "Remove filler, save tokens",
    shortcut: "Ctrl+Shift+1",
    emoji: "📏",
  },
  enhance: {
    label: "Enhance",
    description: "Add structure & context",
    shortcut: "Ctrl+Shift+2",
    emoji: "✨",
  },
  rewrite: {
    label: "Rewrite",
    description: "Clarity & precision",
    shortcut: "Ctrl+Shift+3",
    emoji: "✏️",
  },
  tone: {
    label: "Tone",
    description: "Adjust writing style",
    shortcut: "Ctrl+Shift+4",
    emoji: "🎭",
  },
  qa: {
    label: "Q&A",
    description: "Answer questions → perfect prompt",
    shortcut: "Ctrl+Shift+5",
    emoji: "💬",
  },
  template: {
    label: "Template",
    description: "Use a prompt template",
    shortcut: "Ctrl+Shift+6",
    emoji: "📋",
  },
};

interface ModeButtonProps {
  mode: Mode | "auto";
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  compact?: boolean;
}

export function ModeButton({
  mode,
  onClick,
  disabled,
  active,
  compact,
}: ModeButtonProps) {
  const meta = MODE_META[mode];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all w-full",
        "border",
        active
          ? "border-[var(--accent-border)] text-[var(--accent)]"
          : "border-transparent text-[var(--text-secondary)]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      style={{
        backgroundColor: active ? "var(--accent-dim)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
          e.currentTarget.style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
    >
      <span className="text-lg shrink-0">{meta.emoji}</span>
      {!compact && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{meta.label}</span>
            <span className="text-xs font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
              {meta.shortcut}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {meta.description}
          </p>
        </div>
      )}
    </button>
  );
}
