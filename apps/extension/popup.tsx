import { useEffect, useState } from "react";
import { UsageBar, ModeButton, PromptDiff } from "@promptforge/ui";
import "./style.css";

const MODES = ["auto", "compress", "enhance"] as const;

export default function Popup() {
  const [mode, setMode] = useState<"auto" | "compress" | "enhance">("auto");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 1000 });
  const [diagnosis, setDiagnosis] = useState<{ strategy: string; reason: string } | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "getSelected" }, (resp) => {
        if (resp?.selected) setInput(resp.selected);
      });
    });

    chrome.storage.local.get("usage", (data) => {
      if (data.usage) setUsage(data.usage);
    });
  }, []);

  const handleOptimize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setDiagnosis(null);

    try {
      const apiUrl = "https://tokavy-competetior.vercel.app/api/forge";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input, mode }),
      });

      if (!response.ok) throw new Error("Optimization failed");

      const data = await response.json();
      setOutput(data.optimized ?? data.text ?? "");
      if (data.diagnosis) setDiagnosis(data.diagnosis);

      const newUsage = {
        used: usage.used + input.length,
        limit: usage.limit,
      };
      setUsage(newUsage);
      chrome.storage.local.set({ usage: newUsage });
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "showToast", message: "Copied!" });
    });
  };

  const handleInsert = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "insertText", text: output });
    });
  };

  return (
    <div style={{ width: 384, backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold"
            style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            PF
          </span>
          <span className="text-sm font-semibold">PromptForge</span>
        </div>
        <UsageBar used={usage.used} limit={usage.limit} className="w-28" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5">
        {/* Mode selector */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Mode
          </label>
          <div className="flex gap-1.5">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 rounded-lg py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: mode === m ? 'var(--accent-dim)' : 'transparent',
                  color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                  border: mode === m ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                }}
              >
                {m === 'auto' ? 'Auto' : m === 'compress' ? 'Compress' : 'Enhance'}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Input prompt
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or select your prompt..."
            className="w-full rounded-lg p-3 text-sm outline-none resize-none transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              minHeight: 80,
            }}
          />
        </div>

        {/* Optimize button */}
        <button
          onClick={handleOptimize}
          disabled={loading || !input.trim()}
          className="w-full rounded-lg py-2 text-sm font-semibold transition-all"
          style={{
            backgroundColor: loading ? 'var(--accent-dim)' : 'var(--accent)',
            color: loading ? 'var(--accent)' : '#0b0b0e',
          }}
        >
          {loading ? "Optimizing..." : "Optimize"}
        </button>

        {/* Output */}
        {output && (
          <div className="space-y-3" style={{ animation: 'fade-up 0.3s ease' }}>
            {diagnosis && mode === "auto" && (
              <div
                className="rounded-lg border px-3 py-2 text-xs"
                style={{
                  borderColor: 'var(--accent-border)',
                  backgroundColor: 'var(--accent-dim)',
                  color: 'var(--accent)',
                }}
              >
                <span className="font-medium">
                  {diagnosis.strategy === "compress" ? "Compress" : "Enhance"}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {" "}— {diagnosis.reason}
                </span>
              </div>
            )}
            <PromptDiff
              original={input}
              optimized={output}
              tokensIn={Math.ceil(input.length / 4)}
              tokensOut={Math.ceil(output.length / 4)}
              savedTokens={Math.max(0, Math.ceil((input.length - output.length) / 4))}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 rounded-lg py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Copy
              </button>
              <button
                onClick={handleInsert}
                className="flex-1 rounded-lg py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'var(--green-dim)',
                  color: 'var(--green)',
                  border: '1px solid rgba(74,222,128,0.2)',
                }}
              >
                Insert
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
