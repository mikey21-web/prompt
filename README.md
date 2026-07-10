# PromptForge

> Translate plain English into the optimal prompt for any AI model — Claude, GPT, Gemini, Midjourney, Sora, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PromptForge** is a prompt engineering platform that converts plain-English descriptions into model-native prompts across 14+ models and 5 modalities. Input what you want in casual language; get back a production-ready prompt optimized for your chosen model's format, syntax, and conventions.

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+ (or npm 11+)
- Rust toolchain (for desktop app only)

### Install & Run

```bash
# Clone and install
git clone https://github.com/mikey21-web/prompt
cd prompt

# Install dependencies (npm workspaces + Turbo)
npm install

# Build all packages and apps
npm run build

# Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the web dashboard is the quickest way to try the engine. The dashboard includes the **Forge** view, **Showdown** comparison, **Reverse** engineering, and more.

---

## Architecture

PromptForge is a **Turborepo monorepo** with 5 application surfaces and 4 shared packages:

| Surface | Framework | Tier | Purpose |
|---------|-----------|------|---------|
| **Web** | Next.js 14 | Full | Dashboard, auth, billing, forge/showdown/reverse UI |
| **Browser Extension** | Plasmo | Full | Forge/reverse context menus on any page (Chrome, Firefox, Edge) |
| **Desktop** | Tauri v2 | Full | Native app with auto-updater and offline mode (Windows, macOS, Linux) |
| **VS Code Extension** | VS Code API | Full | Forge/showdown/reverse on selected code or text |
| **Discord Bot** | discord.js | Community | `/forge`, `/showdown`, `/reverse` slash commands |

### Shared Packages

| Package | Contents |
|---------|----------|
| **`@promptforge/core`** | Types, model registry, style guides, two-stage translation engine, token counting, diff utilities |
| **`@promptforge/ui`** | React components: UsageBar, PlanBadge, ModeButton, PromptDiff, TemplateCard, TokenSavings |
| **`@promptforge/convex`** | Convex schema, actions (translate, showdown, reverse, run, abCompare), mutations, queries |
| **`@promptforge/cli`** | CLI tool (`promptforge` / `pf` binary) |

### Backend

The backend is **Convex** — serverless database + functions. The Convex layer handles:

- Authentication (Clerk JWT validation)
- Database (users, prompts, templates, forgeRuns, forgeRatings, forgeShares, abVotes, promptThreads, promptVersions, customStyleGuides, workspaces, usageLogs)
- All LLM calls (OpenAI, Anthropic, Google)
- Quota enforcement (per-user daily limits)
- Observability queries (run stats, rating stats, A/B vote stats)

REST API shims in `apps/web/app/api/*` provide HTTP access for non-Convex clients (browser extension, external API consumers).

---

## Features

### Six Optimization Modes

| Mode | Description |
|------|-------------|
| **Compress** | Reduce a verbose prompt to minimal essential tokens while preserving intent |
| **Enhance** | Add clarity, specificity, context, and structure to under-specified prompts |
| **Rewrite** | Fully restructure a prompt for a different model, format, or audience |
| **Tone** | Adjust formality and voice — formal, casual, technical, creative, persuasive |
| **QA** | Convert a statement into a question or a vague ask into a structured request |
| **Template** | Generate a reusable prompt template with slots for variable substitution |

### Two-Stage Translation Engine

1. **Intent extraction** — A fast LLM (GPT-4o-mini) converts plain English into a structured `Intent` JSON object: modality, subject, action, context, audience, tone, constraints, output format, structure, visual references.
2. **Format synthesis** — The Intent is rendered into the target model's native format using a hand-tuned style guide. Each model gets its own format spec, rules, anti-patterns, and few-shot examples. For Anthropic and Google models, the synthesis is routed to their own APIs (Claude writes its own XML prompts best).

### Multi-Provider Routing

| Provider | Models | Environment variable |
|----------|--------|---------------------|
| OpenAI | GPT-4o, GPT-4o-mini, DALL·E 3 | `OPENAI_API_KEY` |
| Anthropic | Claude Sonnet 4.5, Claude Opus 4.1 | `ANTHROPIC_API_KEY` |
| Google | Gemini 2.5 Pro, Gemini 2.5 Flash, Veo 3 | `GEMINI_API_KEY` |

### 14 Supported Models

**Text (6):** Claude Sonnet 4.5, Claude Opus 4.1, GPT-4o, GPT-4o-mini, Gemini 2.5 Pro, Gemini 2.5 Flash

**Image (3):** Midjourney v7, DALL·E 3, Stable Diffusion XL

**Video (3):** Sora 2, Runway Gen-3, Veo 3

**Audio (2):** Suno v4, ElevenLabs

### A/B Showdown

Compare how different models interpret the same intent. Submit plain English once, get parallel outputs from up to 6 models. Run live inference on callable text models to compare raw vs. optimized performance. Vote on results to build an A/B eval dataset.

### 50 Built-in Library Templates

A curated starter pack across writing, code, images, video, music, productivity, research, coaching, and creative writing. Each template is a plain-English description — run it through Forge to get a model-native prompt.

---

## API Endpoints

All REST endpoints require a valid Clerk session cookie (sent automatically from the web app and extension).

### POST `/api/forge`

Translate plain English into a model-native prompt.

```json
{
  "input": "a cinematic shot of a robot waking up in a desert, golden hour",
  "target": "sora-2"
}
```

**Response:**
```json
{
  "intent": { "modality": "video", "subject": "robot waking up in desert", ... },
  "target": "sora-2",
  "optimized": "[OPENING SHOT — 4s]\nCamera: Wide shot, slow dolly forward.\n...",
  "tokensIn": 14,
  "tokensOut": 128
}
```

If `target` is omitted, the engine auto-selects a default model based on detected modality.

### POST `/api/reverse`

Reverse-engineer any complex prompt into a plain-English summary.

```json
{
  "prompt": "You are a senior writer... <task>..."
}
```

**Response:**
```json
{
  "explanation": "A detailed prompt asking Claude to write..."
}
```

### POST `/api/showdown`

Compare output across multiple models simultaneously.

```json
{
  "input": "explain quantum computing to a 10 year old",
  "targets": ["claude-sonnet-4.5", "gpt-4o", "gemini-2.5-pro"]
}
```

**Response:**
```json
{
  "intent": { "modality": "text", ... },
  "outputs": [
    { "target": "claude-sonnet-4.5", "optimized": "<role>...", "error": null },
    { "target": "gpt-4o", "optimized": "# Role\nYou are...", "error": null },
    { "target": "gemini-2.5-pro", "optimized": "## Goal\n...", "error": null }
  ]
}
```

### POST `/api/detect-modality`

Detect the likely AI modality and suggest a target model from a URL or screenshot.

```json
// URL-based detection (no API key required)
{ "url": "https://midjourney.com/showcase/..." }

// Image/screenshot via Gemini Vision
{ "imageBase64": "<base64>", "mimeType": "image/png" }
```

**Response:**
```json
{
  "modality": "image",
  "suggestedTarget": "midjourney-v7",
  "description": "Image content detected from URL."
}
```

### POST `/api/checkout`

Create a Stripe checkout session for a paid plan.

```json
{ "plan": "pro" }
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

### POST `/api/webhooks/stripe`

Stripe webhook handler. Processes `checkout.session.completed`, `invoice.payment_succeeded`, and `customer.subscription.deleted` events. Updates user plan and Stripe customer ID in Convex.

---

## Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js 14 web dashboard
│   │   └── app/
│   │       ├── api/
│   │       │   ├── forge/route.ts
│   │       │   ├── reverse/route.ts
│   │       │   ├── showdown/route.ts
│   │       │   ├── detect-modality/route.ts
│   │       │   ├── checkout/route.ts
│   │       │   └── webhooks/stripe/route.ts
│   │       ├── (dashboard)/
│   │       │   ├── forge/
│   │       │   ├── showdown/
│   │       │   ├── reverse/
│   │       │   ├── threads/
│   │       │   ├── history/
│   │       │   ├── templates/
│   │       │   ├── library/
│   │       │   ├── style-guides/
│   │       │   ├── settings/
│   │       │   ├── billing/
│   │       │   ├── dashboard/
│   │       │   ├── admin/
│   │       │   ├── eval/
│   │       │   └── observability/
│   │       ├── pricing/
│   │       ├── showcase/
│   │       ├── embed/
│   │       ├── benchmark/
│   │       ├── s/[slug]/
│   │       └── install/
│   ├── extension/              # Plasmo browser extension
│   ├── desktop/                # Tauri v2 desktop app
│   │   └── src-tauri/          # Rust backend
│   ├── vscode/                 # VS Code extension
│   └── discord-bot/            # Discord bot
├── packages/
│   ├── core/                   # Types, models, engine, style guides
│   │   └── src/
│   │       ├── types.ts
│   │       ├── models.ts       # 14-model registry
│   │       ├── style-guides.ts # Per-model format specs
│   │       ├── promptforge.ts  # Two-stage engine
│   │       ├── prompts.ts
│   │       ├── diff.ts
│   │       └── token-count.ts
│   ├── convex/                 # Convex schema + actions
│   │   └── convex/
│   │       ├── schema.ts
│   │       ├── promptforge.ts  # translate, showdown, reverse, run, abCompare
│   │       ├── users.ts
│   │       ├── prompts.ts
│   │       ├── templates.ts
│   │       ├── threads.ts
│   │       ├── styleGuides.ts
│   │       ├── workspaces.ts
│   │       ├── usageLogs.ts
│   │       ├── shares.ts
│   │       ├── observability.ts
│   │       ├── seedLibrary.ts
│   │       └── http.ts
│   ├── ui/                     # Shared React components
│   │   └── src/components/
│   │       ├── UsageBar.tsx
│   │       ├── PlanBadge.tsx
│   │       ├── ModeButton.tsx
│   │       ├── PromptDiff.tsx
│   │       ├── TemplateCard.tsx
│   │       └── TokenSavings.tsx
│   └── cli/                    # CLI tool (promptforge / pf)
├── turbo.json
└── package.json
```

---

## Development

### Web App
```bash
cd apps/web
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

### Browser Extension
```bash
cd apps/extension
npm run dev          # Hot-reload dev mode
npm run build        # Chrome build
npm run build:firefox
npm run build:edge
```

### Desktop App
```bash
cd apps/desktop
npm run dev          # Tauri dev with hot reload
npm run build        # Build installer for current platform
npm run build:all    # Windows + macOS + Linux
```

### VS Code Extension
```bash
cd apps/vscode
npm run build        # Compile to dist/
# Press F5 in VS Code to launch extension dev host
```

### Discord Bot
```bash
cd apps/discord-bot
npm run dev          # tsx watch mode
npm run register     # Register slash commands (run once)
```

### Run All Tests
```bash
npm test             # turbo test — runs tests across all packages
npm run lint         # turbo lint
```

---

## Environment Variables

Create `.env.local` in each app directory:

### Web App (`apps/web/.env.local`)
```env
# Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up

# Convex
NEXT_PUBLIC_CONVEX_URL=https://<project>.convex.cloud

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# LLM providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

### Extension (`apps/extension/.env`)
```env
PLASMO_PUBLIC_API_URL=https://<your-domain>.vercel.app
```

### Convex (`packages/convex/.env.local`)
```env
# These are set in the Convex dashboard, not .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
```

### Desktop (`apps/desktop/.env`)
```env
# Stored in app data directory at runtime
VITE_API_URL=https://<your-domain>.vercel.app
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and PR workflow.

## License

MIT
