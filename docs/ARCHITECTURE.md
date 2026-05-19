# PromptForge System Architecture

## Overview

PromptForge is a multi-platform AI prompt optimization platform built as a Turborepo monorepo. Three client applications (web, extension, desktop) share core types and UI components, all backed by a serverless Convex database with OpenAI integration for prompt processing.

## System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
├─────────────────────────────────────────────────────────┤
│ Web (Next.js 14)    Extension (Plasmo)   Desktop (Tauri)|
│ - Dashboard         - Popup + Options    - Native App   │
│ - Subscription      - Content Script     - Offline Mode │
│ - Analytics         - Context Menu       - Auto-update  │
└────────────────────┬────────────────────┬───────────────┘
                     │                    │
                ┌────▼────────────────────▼────┐
                │   Shared Layer (@promptforge)  │
                ├───────────────────────────────┤
                │ - Core types & schemas        │
                │ - UI components               │
                │ - System prompts              │
                └────┬────────────────────┬─────┘
                     │                    │
        ┌────────────▼────┐      ┌────────▼──────────┐
        │  Authentication │      │  API Endpoints    │
        │  (Clerk)        │      │  (Convex)         │
        │  - OAuth        │      │  - /optimize      │
        │  - SAML         │      │  - /templates     │
        │  - Email        │      │  - /history       │
        └────────┬────────┘      │  - /usage         │
                 │               └────────┬──────────┘
                 │                        │
        ┌────────▼────────────────────────▼────────────┐
        │        Convex Backend (Serverless)            │
        ├────────────────────────────────────────────────┤
        │ - Real-time DB (users, prompts, templates)    │
        │ - Actions (optimize, validate)                │
        │ - Storage (history, analytics)                │
        │ - Webhooks (Stripe, Razorpay)                 │
        └────────┬───────────────────────┬──────────────┘
                 │                       │
        ┌────────▼────────┐   ┌──────────▼──────────┐
        │  Payments       │   │  AI Integration     │
        │  - Stripe       │   │  - OpenAI gpt-4o    │
        │  - Razorpay     │   │  - gpt-4o-mini      │
        │  - Subscriptions│   │  - Token counting   │
        └─────────────────┘   └─────────────────────┘
```

## Core Components

### 1. Web Application (Next.js 14)

**Purpose:** Main dashboard and user account management.

**Structure:**
- `apps/web/app/` — App Router pages (layout, dashboard, auth, settings)
- `apps/web/app/api/` — API routes for webhooks and internal endpoints
- `apps/web/lib/` — Utility functions, API clients, hooks
- `apps/web/components/` — React components (not shared)

**Key Features:**
- Dashboard showing usage stats and prompt history
- Template management and creation
- Subscription management with Stripe integration
- Settings for API keys and preferences
- Analytics and insights

**Dependencies:** Next.js, Convex, Clerk, Stripe, Tailwind CSS, @promptforge/core, @promptforge/ui

### 2. Browser Extension (Plasmo)

**Purpose:** In-browser prompt optimization accessible from any website.

**Structure:**
- `apps/extension/popup.tsx` — Quick access UI (mode buttons, input)
- `apps/extension/options.tsx` — Settings and configuration
- `apps/extension/content.ts` — Content script for page interaction
- `apps/extension/background.ts` — Service worker for cross-site messaging

**Key Features:**
- Popup for quick prompt optimization
- Context menu integration for selected text
- Settings panel for API keys and model selection
- Real-time usage tracking
- Works on Chrome, Firefox, Edge

**Dependencies:** Plasmo, React, @promptforge/core, @promptforge/ui

### 3. Desktop Application (Tauri v2)

**Purpose:** Native desktop app with offline capability and local persistence.

**Structure:**
- `apps/desktop/src/` — React frontend (components, hooks, state)
- `apps/desktop/src-tauri/src/` — Rust backend (commands, window management, file I/O)
- `apps/desktop/src-tauri/tauri.conf.json` — Configuration (updater, window, bundle)

**Key Features:**
- Rich UI with split panes (input/output)
- Offline mode (local cache, deferred sync)
- Auto-update mechanism
- Settings persistence in localStorage
- Responsive grid layout
- Built-in history and templates

**Dependencies:** Tauri v2, React, Vite, @promptforge/core, @promptforge/ui, Rust std library

### 4. Shared Packages

**@promptforge/core**
- TypeScript interfaces for domains (User, Prompt, Template, Workspace)
- API request/response types
- System prompts for each optimization mode
- Constants (plan tiers, rate limits, token windows)

**@promptforge/ui**
- Reusable React components
  - `UsageBar` — Visual quota display
  - `PlanBadge` — Plan indicator
  - `ModeButton` — Mode selector
  - `PromptDiff` — Highlight changes
  - `TemplateCard` — Template preview
  - `TokenSavings` — Token reduction meter
- Tailwind-based styling
- Responsive design system

### 5. Backend (Convex Serverless)

**Purpose:** Centralized data layer, API, real-time sync, and webhooks.

**Schema:**
```
users: { id, clerkId, email, plan, usage { used, limit, reset } }
prompts: { id, userId, text, optimized, mode, tokens { input, output }, createdAt }
templates: { id, userId, name, prompt, tags }
workspaces: { id, name, members }
```

**Actions:**
- `optimize` — Call OpenAI, count tokens, update usage, return optimized text
- `getUsage` — Return current usage and limits
- `createPrompt` — Save optimization to history
- `listTemplates` — Fetch user's templates

**Real-time Sync:** Convex subscriptions for usage updates and history changes.

**Webhooks:** Stripe and Razorpay payment events → update plan in users table.

## Data Flow

### Optimization Flow
1. User enters prompt in any client (web, extension, desktop)
2. Client validates input and calls `/api/optimize` with JWT
3. Convex action `optimize` executes:
   - Check user quota (usage < limit)
   - Call OpenAI API with system prompt + user input
   - Count tokens (input + output)
   - Deduct from user.usage.used
   - Save to prompts table (history)
   - Return optimized text + token counts
4. Client displays result, optionally saves to templates

### Authentication Flow
1. Client redirects to Clerk sign-up/login
2. Clerk issues JWT and stores in httpOnly cookie
3. Client includes JWT in API requests (Authorization header)
4. Convex validates JWT via Clerk integration
5. On logout, JWT invalidated, user session cleared

### Payment Flow
1. User selects plan on web app
2. Client creates Stripe Checkout session
3. Stripe webhook sent to Convex on payment success
4. Convex updates user.plan and resets usage.limit
5. Web app notifies user, redirects to dashboard

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  Production Stack                         │
├──────────────────────────────────────────────────────────┤
│ Vercel (Web)     Convex (Backend)  Web Store (Extension) │
│ - Next.js SSR    - Real-time DB   - Chrome Web Store    │
│ - Edge Functions - Actions        - Firefox Add-ons     │
│ - Middleware     - Auth           - Edge Add-ons        │
│ - Webhooks       - Webhooks       - Auto-update         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│            GitHub Actions CI/CD                           │
├──────────────────────────────────────────────────────────┤
│ On push to main:     On version tag (v*.*.*):           │
│ - Lint & type-check  - Build desktop binaries           │
│ - Unit tests         - Sign with private key            │
│ - Build web          - Upload to GitHub Releases        │
│ - Deploy to Vercel   - Trigger auto-update delivery     │
└──────────────────────────────────────────────────────────┘
```

## API Contracts

All endpoints require `Authorization: Bearer {jwt}`.

**POST /api/optimize**
- Input: `{ prompt: string, mode: "compress"|"enhance"|"rewrite", model?: string }`
- Output: `{ optimized: string, tokens: { input: number, output: number } }`
- Errors: 401 (no auth), 403 (quota exceeded), 400 (invalid mode)

**GET /api/usage**
- Output: `{ used: number, limit: number, reset_date: ISO8601 }`

**GET /api/history?limit=50&offset=0**
- Output: `[{ id, prompt, optimized, mode, tokens, createdAt }]`

**POST /api/templates**
- Input: `{ name: string, prompt: string }`
- Output: `{ id, name, prompt, createdAt }`

**GET /api/templates**
- Output: `[{ id, name, prompt, tags, createdAt }]`

## Security Model

- **Authentication:** Clerk JWT, verified server-side
- **Authorization:** User can only access own data (prompts, templates, usage)
- **Rate Limiting:** Per-user quota (hard limit from plan)
- **API Keys:** Sensitive keys (OpenAI, Stripe) stored in Convex env, never exposed
- **CORS:** Configured per environment (localhost dev, production domain)
- **CSP:** Content Security Policy in Tauri (null for desktop) and Next.js headers
- **Data Privacy:** All user data encrypted at rest in Convex

## Performance Considerations

- **Web:** Next.js image optimization, code splitting, ISR for static content
- **Extension:** Minimal bundle (~500KB gzipped), message passing for isolation
- **Desktop:** Native performance via Tauri, no Electron overhead
- **Backend:** Real-time subscriptions instead of polling, connection pooling
- **Caching:** Client-side (localStorage, sessionStorage), server-side (Convex cache)

## Testing Strategy

- **Unit Tests:** @promptforge/core schemas, utility functions
- **Integration Tests:** Convex actions with real DB
- **E2E Tests:** Playwright for web/extension/desktop UIs
- **Load Tests:** Monitor token usage under concurrent load

## Monitoring

- **Web:** Vercel Analytics for page performance
- **Extension:** Error tracking via Sentry
- **Desktop:** Tauri telemetry (opt-in)
- **Backend:** Convex logs and function metrics
- **Payments:** Stripe dashboard for transaction history
