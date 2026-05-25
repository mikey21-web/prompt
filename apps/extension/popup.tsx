import { useEffect, useState } from "react";
import { UsageBar, ModeButton, PromptDiff } from "@promptforge/ui";

export default function Popup() {
  const [mode, setMode] = useState<"compress" | "enhance" | "rewrite">(
    "compress"
  );
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 1000 });

  useEffect(() => {
    // Get selected text from active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "getSelected" }, (resp) => {
        if (resp?.selected) setInput(resp.selected);
      });
    });

    // Load usage stats
    chrome.storage.local.get("usage", (data) => {
      if (data.usage) setUsage(data.usage);
    });
  }, []);

  const handleOptimize = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const apiUrl = "https://tokavy-competetior.vercel.app/api/forge";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ input, mode }),
      });

      if (!response.ok) throw new Error("Optimization failed");

      const data = await response.json();
      setOutput(data.optimized ?? data.text ?? "");

      // Update usage
      const newUsage = {
        used: usage.used + input.length,
        limit: usage.limit,
      };
      setUsage(newUsage);
      chrome.storage.local.set({ usage: newUsage });
    } catch (error) {
      console.error("Optimization error:", error);
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    // Show toast or feedback
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
    <div className="w-96 bg-white text-gray-900">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-lg font-bold">PromptForge</h1>
        <UsageBar used={usage.used} limit={usage.limit} />
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mode</label>
          <div className="flex gap-2">
            <ModeButton
              mode="compress"
              active={mode === "compress"}
              onClick={() => setMode("compress")}
            />
            <ModeButton
              mode="enhance"
              active={mode === "enhance"}
              onClick={() => setMode("enhance")}
            />
            <ModeButton
              mode="rewrite"
              active={mode === "rewrite"}
              onClick={() => setMode("rewrite")}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Input Prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or select your prompt..."
            className="w-full border border-gray-300 rounded p-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading || !input.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Optimizing..." : "Optimize"}
        </button>

        {output && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
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
                className="flex-1 bg-gray-100 text-gray-900 py-2 rounded font-medium hover:bg-gray-200"
              >
                Copy
              </button>
              <button
                onClick={handleInsert}
                className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700"
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
