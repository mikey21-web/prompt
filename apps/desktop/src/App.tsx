import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { UsageBar, ModeButton, PromptDiff } from "@promptforge/ui";

export default function App() {
  const [mode, setMode] = useState<"compress" | "enhance" | "rewrite">(
    "compress"
  );
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5000 });
  const [history, setHistory] = useState<Array<{ prompt: string; optimized: string; mode: string; timestamp: number }>>([]);

  useEffect(() => {
    // Load usage and history from localStorage
    const stored = localStorage.getItem("promptforge");
    if (stored) {
      const data = JSON.parse(stored);
      setUsage(data.usage || usage);
      setHistory(data.history || []);
    }
  }, []);

  const handleOptimize = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const result: string = await invoke("optimize_prompt", {
        prompt: input,
        mode,
        apiKey: localStorage.getItem("PROMPTFORGE_API_KEY") || "",
      });

      setOutput(result);

      // Add to history
      const newEntry = {
        prompt: input,
        optimized: result,
        mode,
        timestamp: Date.now(),
      };
      const newHistory = [newEntry, ...history].slice(0, 50);
      setHistory(newHistory);

      // Update usage
      const newUsage = {
        used: usage.used + input.length,
        limit: usage.limit,
      };
      setUsage(newUsage);

      // Save to localStorage
      localStorage.setItem(
        "promptforge",
        JSON.stringify({
          usage: newUsage,
          history: newHistory,
        })
      );
    } catch (error) {
      console.error("Optimization error:", error);
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await invoke("set_clipboard", { text: output });
      // Show feedback
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">PromptForge</h1>
          <p className="text-sm text-gray-600">Optimize your AI prompts locally</p>
          <UsageBar used={usage.used} limit={usage.limit} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Mode Selection */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium mb-3">Optimization Mode</label>
            <div className="flex gap-3">
              <ModeButton
                mode="compress"
                isActive={mode === "compress"}
                onClick={() => setMode("compress")}
              />
              <ModeButton
                mode="enhance"
                isActive={mode === "enhance"}
                onClick={() => setMode("enhance")}
              />
              <ModeButton
                mode="rewrite"
                isActive={mode === "rewrite"}
                onClick={() => setMode("rewrite")}
              />
            </div>
          </div>

          {/* Editor Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Input */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium mb-2">Input Prompt</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter or paste your prompt..."
                className="w-full h-48 border border-gray-300 rounded p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleOptimize}
                disabled={loading || !input.trim()}
                className="w-full mt-3 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Optimizing..." : "Optimize"}
              </button>
            </div>

            {/* Output */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium mb-2">Optimized Output</label>
              <textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                className="w-full h-48 border border-gray-300 rounded p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
              />
              {output && (
                <button
                  onClick={handleCopy}
                  className="w-full mt-3 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition"
                >
                  Copy to Clipboard
                </button>
              )}
            </div>
          </div>

          {/* Comparison */}
          {output && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3">Comparison</h3>
              <PromptDiff original={input} optimized={output} />
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3">Recent Optimizations ({history.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 5).map((entry, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded p-2 text-xs cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setInput(entry.prompt);
                      setOutput(entry.optimized);
                      setMode(entry.mode as any);
                    }}
                  >
                    <div className="font-medium">{entry.mode}</div>
                    <div className="text-gray-600 truncate">{entry.prompt}</div>
                    <div className="text-gray-400">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
