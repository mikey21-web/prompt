import { cn } from "../lib/cn";
import type { Mode } from "@promptforge/core";

export const MODE_META: Record<
  Mode,
  { label: string; description: string; shortcut: string; emoji: string }
> = {
  compress: {
    label: "Compress",
    description: "Remove filler, save tokens",
    shortcut: "Ctrl+Shift+1",
    emoji: "⚡",
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
  mode: Mode;
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
        "border border-transparent",
        active
          ? "bg-violet-50 border-violet-200 text-violet-700"
          : "hover:bg-gray-50 hover:border-gray-200 text-gray-700",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span className="text-lg shrink-0">{meta.emoji}</span>
      {!compact && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{meta.label}</span>
            <span className="text-xs text-gray-400 font-mono shrink-0">
              {meta.shortcut}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{meta.description}</p>
        </div>
      )}
    </button>
  );
}
