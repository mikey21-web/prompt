/**
 * Per-site adapter registry. Each adapter knows how to find the input
 * textarea on its target site, read its value, and replace it.
 *
 * Selectors break every few weeks when sites redesign. Centralizing
 * adapters here makes them quick to fix.
 */

export interface SiteAdapter {
  id: "chatgpt" | "claude" | "gemini";
  /** Pretty name for the user. */
  label: string;
  /** Hostname matchers — supports prefix matching. */
  matches: (host: string) => boolean;
  /** Convex model id we should default to for this site. */
  defaultModel: string;
  /** Find the prompt textarea or contenteditable. */
  findInput(): HTMLElement | null;
  /** Read the current input text. */
  readInput(el: HTMLElement): string;
  /** Replace the input text with a new value, dispatching events the framework expects. */
  writeInput(el: HTMLElement, value: string): void;
}

/* ---------- ChatGPT ---------- */

const chatgpt: SiteAdapter = {
  id: "chatgpt",
  label: "ChatGPT",
  matches: (h) => h === "chatgpt.com" || h === "chat.openai.com",
  defaultModel: "gpt-4o",
  findInput() {
    // ChatGPT uses a contenteditable div for new chats; sometimes a textarea
    // for legacy/edit modes. Try both.
    const editable = document.querySelector<HTMLElement>(
      'div[contenteditable="true"][id="prompt-textarea"], div[contenteditable="true"][data-testid*="prompt"], div#prompt-textarea[contenteditable="true"]'
    );
    if (editable) return editable;
    return document.querySelector<HTMLElement>(
      'textarea[data-id="root"], textarea[placeholder*="Message"], textarea[id="prompt-textarea"]'
    );
  },
  readInput(el) {
    if (el instanceof HTMLTextAreaElement) return el.value;
    return el.innerText;
  },
  writeInput(el, value) {
    if (el instanceof HTMLTextAreaElement) {
      // React-controlled: set via native setter then dispatch input
      const proto = Object.getPrototypeOf(el);
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      setter?.call(el, value);
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      return;
    }
    // contenteditable: replace innerText, then dispatch
    el.focus();
    el.innerText = value;
    el.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertReplacementText",
      })
    );
  },
};

/* ---------- Claude ---------- */

const claude: SiteAdapter = {
  id: "claude",
  label: "Claude",
  matches: (h) => h === "claude.ai" || h.endsWith(".claude.ai"),
  defaultModel: "claude-sonnet-4.5",
  findInput() {
    return document.querySelector<HTMLElement>(
      'div[contenteditable="true"][role="textbox"], div.ProseMirror[contenteditable="true"]'
    );
  },
  readInput(el) {
    return el.innerText;
  },
  writeInput(el, value) {
    el.focus();
    // ProseMirror is sensitive — write via input event, then fall back to
    // direct innerText if needed.
    el.innerText = value;
    el.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertReplacementText",
      })
    );
  },
};

/* ---------- Gemini ---------- */

const gemini: SiteAdapter = {
  id: "gemini",
  label: "Gemini",
  matches: (h) => h === "gemini.google.com" || h.endsWith(".gemini.google.com"),
  defaultModel: "gemini-2.5-pro",
  findInput() {
    return document.querySelector<HTMLElement>(
      'rich-textarea div[contenteditable="true"], div.ql-editor[contenteditable="true"], textarea[aria-label*="prompt" i]'
    );
  },
  readInput(el) {
    if (el instanceof HTMLTextAreaElement) return el.value;
    return el.innerText;
  },
  writeInput(el, value) {
    if (el instanceof HTMLTextAreaElement) {
      const proto = Object.getPrototypeOf(el);
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      setter?.call(el, value);
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      return;
    }
    el.focus();
    el.innerText = value;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  },
};

const ADAPTERS: SiteAdapter[] = [chatgpt, claude, gemini];

export function findAdapter(): SiteAdapter | null {
  return (
    ADAPTERS.find((a) => a.matches(window.location.hostname)) ?? null
  );
}
