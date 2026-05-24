/**
 * The actual injector. Watches for the prompt input on the host site to
 * appear (it's often rendered after navigation), then attaches a small
 * "Forge" button next to it.
 *
 * Click → reads the current input text → calls our optimize endpoint →
 * replaces the text. All on one click, never leaves the page.
 *
 * Token model: we send the user's Clerk session cookie if they're logged
 * into our web app (cookies are first-party for promptforge.dev). If they
 * aren't, the optimize call fails with 401 and we open the popup so they
 * can sign in.
 */

import { findAdapter, type SiteAdapter } from "./sites";

const FORGE_BTN_ID = "promptforge-btn";
const FORGE_API =
  process.env.PLASMO_PUBLIC_API_URL ??
  "https://web-5whel6dwa-udaya-kirans-projects-3bf705e5.vercel.app";

let observer: MutationObserver | null = null;

function ensureButton(adapter: SiteAdapter, input: HTMLElement) {
  if (document.getElementById(FORGE_BTN_ID)) return;
  const btn = document.createElement("button");
  btn.id = FORGE_BTN_ID;
  btn.type = "button";
  btn.textContent = "✨ Forge";
  btn.title = "Optimize this prompt with PromptForge";
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    padding: 8px 14px;
    background: #7c3aed;
    color: white;
    border: none;
    border-radius: 999px;
    font: 600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    cursor: pointer;
    transition: background 120ms ease, transform 120ms ease;
  `;
  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#6d28d9";
    btn.style.transform = "translateY(-1px)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "#7c3aed";
    btn.style.transform = "translateY(0)";
  });
  btn.addEventListener("click", () => onClick(adapter, input));
  document.body.appendChild(btn);
}

async function onClick(adapter: SiteAdapter, input: HTMLElement) {
  const text = adapter.readInput(input).trim();
  if (!text) {
    toast("Nothing to optimize — type a prompt first.", "err");
    return;
  }
  const btn = document.getElementById(FORGE_BTN_ID) as HTMLButtonElement | null;
  if (!btn) return;
  const original = btn.textContent;
  btn.textContent = "Forging…";
  btn.disabled = true;
  try {
    const res = await fetch(`${FORGE_API}/api/forge`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, target: adapter.defaultModel }),
    });
    if (res.status === 401) {
      toast("Sign in to PromptForge first.", "err");
      window.open(`${FORGE_API}/sign-in?redirect=/forge`, "_blank");
      return;
    }
    if (!res.ok) {
      const err = await safeJson(res);
      toast(err?.error ?? `PromptForge error (${res.status})`, "err");
      return;
    }
    const data = (await res.json()) as { optimized: string };
    adapter.writeInput(input, data.optimized);
    toast("Forged.", "ok");
  } catch (e) {
    toast(`Network error: ${e instanceof Error ? e.message : "unknown"}`, "err");
  } finally {
    if (btn) {
      btn.textContent = original;
      btn.disabled = false;
    }
  }
}

async function safeJson(res: Response): Promise<{ error?: string } | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toast(msg: string, kind: "ok" | "err") {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    z-index: 999999;
    padding: 10px 14px;
    background: ${kind === "ok" ? "#10b981" : "#ef4444"};
    color: white;
    border-radius: 8px;
    font: 500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function tick() {
  const adapter = findAdapter();
  if (!adapter) return;
  const input = adapter.findInput();
  if (input) {
    ensureButton(adapter, input);
  } else {
    document.getElementById(FORGE_BTN_ID)?.remove();
  }
}

function start() {
  tick();
  observer = new MutationObserver(() => tick());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

window.addEventListener("beforeunload", () => observer?.disconnect());
