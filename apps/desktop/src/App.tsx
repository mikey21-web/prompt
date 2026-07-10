import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { UsageBar, ModeButton, PromptDiff } from "@promptforge/ui";
import type { Mode } from "@promptforge/core";

const ALL_MODES: Mode[] = ["compress", "enhance", "rewrite", "tone", "qa", "template"];

export default function App() {
  const [mode, setMode] = useState<Mode>("compress");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5000 });
  const [history, setHistory] = useState<
    Array<{ prompt: string; optimized: string; mode: string; timestamp: number }>
  >([]);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("promptforge");
    if (stored) {
      const data = JSON.parse(stored);
      setUsage(data.usage || usage);
      setHistory(data.history || []);
    }
    const key = localStorage.getItem("PROMPTFORGE_API_KEY");
    if (key) setApiKey(key);
  }, []);

  const handleOptimize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result: string = await invoke("optimize_prompt", {
        prompt: input,
        mode,
        apiKey,
      });
      setOutput(result);
      const newEntry = { prompt: input, optimized: result, mode, timestamp: Date.now() };
      const newHistory = [newEntry, ...history].slice(0, 50);
      setHistory(newHistory);
      const newUsage = { used: usage.used + input.length, limit: usage.limit };
      setUsage(newUsage);
      localStorage.setItem(
        "promptforge",
        JSON.stringify({ usage: newUsage, history: newHistory })
      );
    } catch (error) {
      console.error("Optimization error:", error);
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await invoke("set_clipboard", { text: output });
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem("PROMPTFORGE_API_KEY", apiKey);
    setShowSettings(false);
  };

  const tokensIn = Math.ceil(input.length / 4);
  const tokensOut = Math.ceil(output.length / 4);
  const savedTokens = Math.max(0, tokensIn - tokensOut);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PromptForge</h1>
            <p className="text-sm text-gray-600">
              Optimize your AI prompts locally
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showSettings ? "Done" : "Settings"}
          </button>
        </div>
        <div className="max-w-6xl mx-auto mt-2">
          <UsageBar used={usage.used} limit={usage.limit} />
        </div>
      </div>

      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              API Configuration
            </h2>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveApiKey}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              API key stored locally. Never shared.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium mb-3">
              Optimization Mode
            </label>
            <div className="flex flex-wrap gap-3">
              {ALL_MODES.map((m) => (
                <div key={m} className="flex-1 min-w-[140px]">
                  <ModeButton
                    mode={m}
                    active={mode === m}
                    onClick={() => setMode(m)}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium mb-2">
                Input Prompt
              </label>
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

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium mb-2">
                Optimized Output
              </label>
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

          {output && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3">Comparison</h3>
              <PromptDiff
                original={input}
                optimized={output}
                tokensIn={tokensIn}
                tokensOut={tokensOut}
                savedTokens={savedTokens}
              />
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3">
                Recent Optimizations ({history.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 5).map((entry, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded p-2 text-xs cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setInput(entry.prompt);
                      setOutput(entry.optimized);
                      setMode(entry.mode as Mode);
                    }}
                  >
                    <div className="font-medium capitalize">{entry.mode}</div>
                    <div className="text-gray-600 truncate">
                      {entry.prompt}
                    </div>
                    <div className="text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
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
