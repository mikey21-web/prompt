import * as vscode from "vscode";

const EXT = "promptforge";

// ─── helpers ────────────────────────────────────────────────────────────────

function cfg<T>(key: string): T {
  return vscode.workspace.getConfiguration(EXT).get<T>(key) as T;
}

function apiUrl(): string {
  return cfg<string>("apiUrl") || "https://promptforge.dev";
}

function apiKey(): string {
  return cfg<string>("apiKey") || "";
}

async function callApi(
  path: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const key = apiKey();
  if (!key) {
    const action = await vscode.window.showErrorMessage(
      "PromptForge: No API key set. Get one at promptforge.dev/settings",
      "Set API key"
    );
    if (action === "Set API key") {
      await vscode.commands.executeCommand(`${EXT}.setApiKey`);
    }
    return null;
  }

  const res = await fetch(`${apiUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    vscode.window.showErrorMessage(
      "PromptForge: Invalid API key. Update it in Settings → PromptForge."
    );
    return null;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    vscode.window.showErrorMessage(
      `PromptForge error: ${(err as { error?: string }).error ?? res.status}`
    );
    return null;
  }
  return res.json();
}

function getSelection(editor: vscode.TextEditor): string {
  const sel = editor.selection;
  if (!sel.isEmpty) return editor.document.getText(sel);
  // No selection: use the whole current line
  return editor.document.lineAt(sel.active.line).text;
}

async function insertResult(
  editor: vscode.TextEditor,
  original: string,
  result: string
): Promise<void> {
  const mode = cfg<string>("insertMode");
  await editor.edit((eb) => {
    const sel = editor.selection;
    if (mode === "replace") {
      if (!sel.isEmpty) {
        eb.replace(sel, result);
      } else {
        const line = editor.document.lineAt(sel.active.line);
        eb.replace(line.range, result);
      }
    } else if (mode === "below") {
      const line = editor.document.lineAt(
        sel.isEmpty ? sel.active.line : sel.end.line
      );
      eb.insert(line.range.end, "\n" + result);
    }
  });
  if (mode === "clipboard") {
    await vscode.env.clipboard.writeText(result);
    vscode.window.showInformationMessage("PromptForge: Copied to clipboard.");
  }
}

// ─── commands ───────────────────────────────────────────────────────────────

async function cmdForge(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const input = getSelection(editor);
  if (!input.trim()) {
    vscode.window.showWarningMessage("PromptForge: Select some text first.");
    return;
  }

  const target = cfg<string>("defaultTarget");

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "PromptForge: Forging…",
      cancellable: false,
    },
    async () => {
      const data = (await callApi("/api/forge", {
        input,
        target: target === "auto" ? undefined : target,
      })) as { optimized: string; target: string } | null;
      if (!data) return;
      await insertResult(editor, input, data.optimized);
      vscode.window.setStatusBarMessage(
        `⚒ Forged for ${data.target}`,
        4000
      );
    }
  );
}

async function cmdShowdown(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const input = getSelection(editor);
  if (!input.trim()) {
    vscode.window.showWarningMessage("PromptForge: Select some text first.");
    return;
  }

  const data = (await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "PromptForge: Running showdown…",
      cancellable: false,
    },
    () =>
      callApi("/api/showdown", {
        input,
        targets: [
          "claude-sonnet-4.5",
          "gpt-4o",
          "gemini-2.5-pro",
          "midjourney-v7",
        ],
      })
  )) as {
    outputs: { target: string; optimized: string; error: string | null }[];
  } | null;
  if (!data) return;

  // Show results in a new untitled document
  const lines: string[] = [`# PromptForge Showdown\n\nInput: "${input}"\n`];
  for (const out of data.outputs) {
    lines.push(`## ${out.target}\n`);
    lines.push(out.error ? `> Error: ${out.error}` : out.optimized);
    lines.push("");
  }
  const doc = await vscode.workspace.openTextDocument({
    content: lines.join("\n"),
    language: "markdown",
  });
  await vscode.window.showTextDocument(doc, { preview: true });
}

async function cmdReverse(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const prompt = getSelection(editor);
  if (!prompt.trim()) {
    vscode.window.showWarningMessage("PromptForge: Select a prompt first.");
    return;
  }

  const data = (await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "PromptForge: Reversing…",
      cancellable: false,
    },
    () => callApi("/api/reverse", { prompt })
  )) as { explanation: string } | null;
  if (!data) return;

  const doc = await vscode.workspace.openTextDocument({
    content: `# PromptForge: Reverse\n\n${data.explanation}`,
    language: "markdown",
  });
  await vscode.window.showTextDocument(doc, { preview: true });
}

async function cmdSetApiKey(): Promise<void> {
  const key = await vscode.window.showInputBox({
    prompt: "Paste your PromptForge API key (pf_...)",
    password: true,
    placeHolder: "pf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    validateInput: (v) =>
      v.startsWith("pf_") ? null : "Key must start with pf_",
  });
  if (!key) return;
  await vscode.workspace
    .getConfiguration(EXT)
    .update("apiKey", key, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage("PromptForge: API key saved.");
}

// ─── activation ─────────────────────────────────────────────────────────────

export function activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    vscode.commands.registerCommand(`${EXT}.forge`, cmdForge),
    vscode.commands.registerCommand(`${EXT}.showdown`, cmdShowdown),
    vscode.commands.registerCommand(`${EXT}.reverse`, cmdReverse),
    vscode.commands.registerCommand(`${EXT}.setApiKey`, cmdSetApiKey)
  );

  // Status bar item
  const bar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  bar.text = "$(wand) Forge";
  bar.tooltip = "PromptForge: Forge selection";
  bar.command = `${EXT}.forge`;
  bar.show();
  ctx.subscriptions.push(bar);
}

export function deactivate(): void {
  /* nothing */
}
