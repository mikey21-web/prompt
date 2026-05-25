// Background service worker: runs in the background

interface Settings {
  apiKey: string;
  model: "gpt-4o-mini" | "gpt-4o";
  contextMenuEnabled: boolean;
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Open options page on first install
    chrome.runtime.openOptionsPage();

    // Initialize settings
    await chrome.storage.sync.set({
      settings: {
        apiKey: "",
        model: "gpt-4o-mini",
        contextMenuEnabled: true,
        hotkey: "Ctrl+Shift+O",
      },
    });

    // Initialize usage tracking
    await chrome.storage.local.set({
      usage: {
        used: 0,
        limit: 1000,
      },
    });
  }
});

// Handle popup open from hotkey
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPopup") {
    chrome.action.openPopup();
    sendResponse({ opened: true });
  }
});

// Create context menu
chrome.storage.sync.get("settings", (data) => {
  const settings = data.settings as Settings;
  if (settings?.contextMenuEnabled) {
    chrome.contextMenus.removeAll(createContextMenu);
  }
});

function createContextMenu() {
  chrome.contextMenus.create({
    id: "promptforge-optimize",
    title: "Optimize with PromptForge",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "promptforge-compress",
    parentId: "promptforge-optimize",
    title: "Compress",
  });

  chrome.contextMenus.create({
    id: "promptforge-enhance",
    parentId: "promptforge-optimize",
    title: "Enhance",
  });

  chrome.contextMenus.create({
    id: "promptforge-rewrite",
    parentId: "promptforge-optimize",
    title: "Rewrite",
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  const itemId = String(info.menuItemId);
  const mode = itemId.replace("promptforge-", "") as "compress" | "enhance" | "rewrite";
  if (!mode) return;

  // Send to popup with selected text
  await chrome.storage.local.set({
    contextMenuData: {
      text: info.selectionText,
      mode,
    },
  });

  // Open popup
  chrome.action.openPopup();
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.settings) {
    const newSettings = changes.settings.newValue as Settings;
    if (newSettings.contextMenuEnabled) {
      createContextMenu();
    } else {
      chrome.contextMenus.removeAll();
    }
  }
});
