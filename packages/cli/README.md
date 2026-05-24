# PromptForge CLI

> Translate plain English into the optimal prompt for any AI model.

```bash
npm install -g @promptforge/cli
# or use npx without installing:
npx @promptforge/cli "explain transactions to a 5 year old"
```

## Quick start

```bash
# Auth: get a key at https://promptforge.dev/settings
export PROMPTFORGE_API_KEY=pf_xxxxxxxxxxxx

# Auto-detect model from your text
pf "a guy walks into a dark hallway, sees a cat. cinematic horror, sora"

# Force a target
pf -t claude-sonnet-4.5 "review this code for bugs"
pf -t midjourney-v7   "moody sci-fi city at sunset"

# Side-by-side output for all 4 flagship text models
pf --showdown "explain transactions to a 5 year old"

# Reverse: paste a prompt, get the plain-English version
pf --reverse "<role>You are a senior copywriter</role>..."

# Pipe stdin (works for any mode)
cat my_prompt.txt | pf --reverse
```

## Flags

| flag | description |
|---|---|
| `-t, --target <model>` | claude-sonnet-4.5, gpt-4o, gemini-2.5-pro, midjourney-v7, sora-2, suno-v4, etc. |
| `-s, --showdown` | All 4 flagship text models side by side |
| `-r, --reverse` | Reverse: prompt → plain English |
| `-c, --copy` | Copy output to clipboard |
| `--json` | Emit raw JSON |
| `--api <url>` | Override API base URL |

## Why

Different AI models want prompts written differently. Claude wants XML tags. Midjourney wants comma-separated tokens with `--ar 16:9`. Sora wants shot-by-shot screenplay format.

PromptForge takes plain English and outputs the format each model actually wants.

## License

MIT
