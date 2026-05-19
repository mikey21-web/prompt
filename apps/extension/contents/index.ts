// Content script: runs in the context of the web page

interface Message {
  action: string;
  text?: string;
  message?: string;
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.action === "getSelected") {
    const selected = window.getSelection()?.toString() || "";
    sendResponse({ selected });
  }

  if (message.action === "insertText" && message.text) {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA") {
      // Insert at cursor position
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const before = activeElement.value.substring(0, start);
      const after = activeElement.value.substring(end);
      activeElement.value = before + message.text + after;
      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
      activeElement.selectionStart = activeElement.selectionEnd = start + message.text.length;
    }
  }

  if (message.action === "showToast" && message.message) {
    showToast(message.message);
  }
});

// Show toast notification
function showToast(msg: string) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Listen for hotkey
document.addEventListener("keydown", (e) => {
  chrome.storage.sync.get("settings", (data) => {
    const hotkey = data.settings?.hotkey || "Ctrl+Shift+O";
    if (
      (hotkey.includes("Ctrl") && e.ctrlKey && e.key === "O" && e.shiftKey) ||
      (hotkey.includes("Cmd") && e.metaKey && e.key === "o" && e.shiftKey)
    ) {
      e.preventDefault();
      chrome.runtime.sendMessage({ action: "openPopup" });
    }
  });
});
