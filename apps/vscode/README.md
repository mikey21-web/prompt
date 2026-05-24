# PromptForge for VS Code / Cursor

> Translate plain English into the optimal prompt for any AI model — right from your editor.

## Install

Search **PromptForge** in the VS Code Extensions panel, or:

```
ext install promptforge.promptforge
```

## Setup

1. Get an API key at [promptforge.dev/settings](https://promptforge.dev/settings)
2. Open Command Palette → **PromptForge: Set API key**
3. Paste your key

## Usage

| Action | How |
|---|---|
| **Forge** | Select text → right-click → *PromptForge: Forge selection* |
| **Showdown** | Select text → right-click → *PromptForge: Showdown (all models)* |
| **Reverse** | Select a prompt → right-click → *PromptForge: Reverse* |

Showdown and Reverse open results in a new Markdown document.

## Settings

| Setting | Default | Description |
|---|---|---|
| `promptforge.apiKey` | — | Your API key |
| `promptforge.defaultTarget` | `auto` | Default model for Forge |
| `promptforge.insertMode` | `replace` | `replace` / `below` / `clipboard` |
| `promptforge.apiUrl` | `https://promptforge.dev` | Override for self-hosted |
