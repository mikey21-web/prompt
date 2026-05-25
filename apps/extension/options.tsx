import { useEffect, useState } from "react";
import "./style.css";

interface Settings {
  apiKey: string;
  model: "gpt-4o-mini" | "gpt-4o";
  contextMenuEnabled: boolean;
  hotkey: string;
}

export default function Options() {
  const [settings, setSettings] = useState<Settings>({
    apiKey: "",
    model: "gpt-4o-mini",
    contextMenuEnabled: true,
    hotkey: "Ctrl+Shift+O",
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get("settings", (data) => {
      if (data.settings) {
        setSettings(data.settings);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof Settings, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">PromptForge Settings</h1>
        <p className="text-gray-600">Configure your prompt optimization preferences</p>
      </div>

      <div className="space-y-6">
        {/* API Configuration */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">API Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => handleChange("apiKey", e.target.value)}
                placeholder="sk-... (required to use the extension)"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenAI
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={settings.model}
                onChange={(e) => handleChange("model", e.target.value as "gpt-4o-mini" | "gpt-4o")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (faster, cheaper)</option>
                <option value="gpt-4o">GPT-4o (more capable)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Features</h2>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.contextMenuEnabled}
              onChange={(e) => handleChange("contextMenuEnabled", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Enable context menu (right-click)</span>
          </label>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Keyboard Shortcut</label>
            <input
              type="text"
              value={settings.hotkey}
              onChange={(e) => handleChange("hotkey", e.target.value)}
              placeholder="e.g., Ctrl+Shift+O"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Open popup with keyboard shortcut (requires extension reload)
            </p>
          </div>
        </div>

        {/* Account */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Account</h2>

          <button
            onClick={() =>
              chrome.tabs.create({
                url: "https://app.promptforge.ai/dashboard",
              })
            }
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 mb-2"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() =>
              chrome.tabs.create({
                url: "https://app.promptforge.ai/settings",
              })
            }
            className="w-full bg-gray-100 text-gray-900 py-2 rounded font-medium hover:bg-gray-200"
          >
            Manage Subscription
          </button>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700"
          >
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
