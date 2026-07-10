import { useEffect } from "react";
import type { Mode } from "@promptforge/core";
import { MODE_META } from "@promptforge/ui";

const SHORTCUT_MAP = Object.fromEntries(
  Object.entries(MODE_META).map(([mode, meta]) => {
    const parts = meta.shortcut.split("+");
    const key = parts[parts.length - 1]!;
    const ctrl = parts.some((p) => p.toLowerCase() === "ctrl");
    const shift = parts.some((p) => p.toLowerCase() === "shift");
    return [mode, { key: key.toLowerCase(), ctrl, shift }];
  })
) as Record<Mode, { key: string; ctrl: boolean; shift: boolean }>;

export function useKeyboardShortcuts(handlers: Record<Mode, () => void>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (const [mode, binding] of Object.entries(SHORTCUT_MAP)) {
        if (
          e.key.toLowerCase() === binding.key &&
          e.ctrlKey === binding.ctrl &&
          e.shiftKey === binding.shift
        ) {
          e.preventDefault();
          handlers[mode as Mode]();
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
