# PromptForge — Full Platform Design Spec
**Date:** 2026-05-19  
**Status:** Approved  
**Competitor:** Tokavy.com + AIPRM + PromptPerfect + PromptBetter + PromptLayer

---

## 1. Product Overview

All-in-one AI prompt optimization platform. Beats every competitor on reach (cross-platform vs Tokavy's Windows-only), features (10 modes vs 2), and limits (500/day Pro vs 100/day).

### 10 Core Features
| # | Feature | Source inspiration |
|---|---|---|
| 1 | **Compress** | Strip filler, 30–55% token reduction | Tokavy |
| 2 | **Enhance** | Add role context, structure, output format | Tokavy |
| 3 | **Rewrite** | Full rewrite for clarity + precision | Original |
| 4 | **Tone-shift** | Formal / casual / technical / creative / persuasive | AIPRM |
| 5 | **Q&A Optimize** | Answer 3 smart questions → perfect prompt | PromptBetter |
| 6 | **Template Library** | 500+ community templates + private templates | AIPRM |
| 7 | **Multi-model target** | Optimize for GPT-4o / Claude / Gemini / Midjourney | PromptPerfect |
| 8 | **Prompt History + Versioning** | Save, compare, reuse all past prompts | PromptLayer |
| 9 | **Team Workspace** | Shared library, usage analytics, admin controls | PromptLayer |
| 10 | **Developer API** | REST endpoint + API key for programmatic access | PromptPerfect |

### Delivery Surfaces
- **Browser extension** (Plasmo — Chrome, Firefox, Edge) — inline replace on any website
- **Desktop app** (Tauri v2) — global hotkey, works in VS Code, Notion, Obsidian, Terminal
- **Web dashboard** (Next.js 14) — library, history, team management, billing, API docs

---

## 2. Architecture

### Monorepo Structure (Turborepo)
```
apps/
  web/          ← Next.js 14 App Router dashboard + landing page
  extension/    ← Plasmo browser extension (React)
  desktop/      ← Tauri v2 desktop app (React frontend, Rust core)
packages/
  ui/           ← shared React components (shadcn/ui + Tailwind)
  convex/       ← shared Convex schema, queries, mutations, actions
  core/         ← shared prompt processing types + utilities
```

### Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Monorepo | Turborepo | shared UI + Convex across all 3 apps |
| Dashboard | Next.js 14 App Router | SSR, best DX, shares `packages/ui` |
| Extension | Plasmo | Chrome+Firefox+Edge auto-build, React, hot reload |
| Desktop | Tauri v2 + React | 10MB binary, global hotkey OS API, shares `packages/ui` |
| Backend/DB | Convex | realtime sync across extension+desktop+web, serverless actions call AI APIs |
| Auth | Clerk | Google + email/password, native Convex integration |
| AI | OpenAI gpt-4o-mini (compress/tone/rewrite) + gpt-4o (enhance/Q&A) | cost-efficient split |
| Payments | Stripe (global) + Razorpay (India, detect via IP geolocation) | covers India market |
| Styling | Tailwind CSS + shadcn/ui | shared across web dashboard + extension popup |

### Data Flow
```
User selects text
  → Extension content script OR Desktop global hotkey captures selection
  → Calls Convex action (optimizePrompt)
  → Convex checks plan limits (daily usage)
  → Convex action calls OpenAI API
  → Returns optimized text
  → Extension/Desktop replaces selected text inline
  → Convex mutation logs usage (usageLogs table)
  → Realtime subscription updates usage bar in extension popup + web dashboard
```

---

## 3. Data Model (Convex Schema)

```typescript
// users
{
  clerkId: string,          // unique
  email: string,
  plan: "free" | "pro" | "team",
  workspaceId?: Id<"workspaces">,
  dailyUsage: number,
  dailyReset: number,       // timestamp — reset at midnight UTC
  apiKey?: string,          // hashed, Pro+ only
  createdAt: number,
}

// prompts (history)
{
  userId: Id<"users">,
  original: string,
  optimized: string,
  mode: "compress" | "enhance" | "rewrite" | "tone" | "qa" | "template" | "api",
  targetModel: "gpt4o" | "claude" | "gemini" | "midjourney" | "auto",
  tokensIn: number,
  tokensOut: number,
  savedTokens: number,
  source: "extension" | "desktop" | "web" | "api",
  createdAt: number,
}

// templates
{
  authorId: Id<"users">,
  workspaceId?: Id<"workspaces">,  // null = public community template
  title: string,
  description: string,
  content: string,          // the template prompt body
  tags: string[],
  targetModel: string,
  isPublic: boolean,
  votes: number,
  usageCount: number,
  createdAt: number,
}

// templateVotes (prevent double-voting)
{
  templateId: Id<"templates">,
  userId: Id<"users">,
}

// workspaces
{
  name: string,
  ownerId: Id<"users">,
  plan: "team",
  seats: number,
  createdAt: number,
}

// workspaceMembers
{
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
  role: "owner" | "admin" | "member",
}

// usageLogs (analytics)
{
  userId: Id<"users">,
  mode: string,
  tokensIn: number,
  tokensOut: number,
  savedTokens: number,
  source: "extension" | "desktop" | "web" | "api",
  createdAt: number,
}
```

### Plan Limits (enforced in Convex before calling AI)
| Limit | Free | Pro | Team |
|---|---|---|---|
| Requests/day | 25 | 500 | 500/seat |
| Optimization modes | Compress, Enhance, Rewrite, Tone, Q&A, Template | All 6 modes | All 6 modes |
| Developer API access | No | Yes (API key) | Yes (API key) |
| Team workspace | No | No | Yes |
| Private templates | 5 | 100 | Unlimited |
| History retention | 7 days | 90 days | 1 year |

---

## 4. Components & UI

### Extension Popup
- Usage bar (today's requests / limit)
- Plan badge (Free / Pro / Team)
- 6 mode buttons with keyboard shortcut hints
- Recent history (last 3 prompts)
- "Select text then press shortcut" empty state

### Extension Content Script (injected into all pages)
- Detects text selection in inputs, textareas, contenteditable elements
- Floating pill button appears on selection (like Grammarly) — shows 6 mode icons
- Keyboard shortcuts: Ctrl+Shift+1 (Compress) through Ctrl+Shift+6 (Template)
- Inline replace: optimized text replaces selected text without page refresh

### Desktop App (Tauri)
- System tray icon — always running in background
- Global hotkeys work in any OS application
- Small floating overlay shows before/after diff before confirming replace
- Settings: hotkey config, default mode, default target model, account, plan
- Auto-updates via Tauri updater

### Web Dashboard Pages
```
/                    ← landing page (marketing, pricing, download links)
/dashboard           ← usage stats, token savings counter, recent history
/library             ← community templates (browse, search, filter, vote, fork)
/library/mine        ← private templates (create, edit, organize)
/history             ← all past optimizations, search, filter by mode, re-run
/team                ← workspace members, invite, role management, shared library
/team/analytics      ← usage by member, most-used modes, token savings over time
/api                 ← API key management, interactive docs, usage stats
/settings            ← account, billing, hotkey config, plan upgrade
/pricing             ← plan comparison table, Stripe/Razorpay checkout
```

### Shared `packages/ui` Components
- `ModeButton` — icon + label + hotkey hint, active/disabled states
- `UsageBar` — daily usage progress with color (green → yellow → red)
- `PlanBadge` — Free / Pro / Team chip with color
- `PromptDiff` — before/after side-by-side with token delta
- `TemplateCard` — title, tags, votes, targetModel badge, "Use" button
- `TokenSavings` — animated counter (tokens saved, estimated $ saved)
- `ModeSelector` — dropdown with 6 modes + descriptions

---

## 5. Pricing

| Plan | Price | Limits | Target |
|---|---|---|---|
| **Free** | $0 | 25 req/day, modes 1–5, 5 private templates, 7-day history | Individual users |
| **Pro** | $9/mo or $79/yr | 500 req/day, all 10 features, API key, 100 templates, 90-day history | Power users |
| **Team** | $25/seat/mo | 500 req/seat/day, workspace, shared library, analytics, 1-year history | Teams |

Payment: Stripe for global. Razorpay auto-selected when IP resolves to India.  
Refund: 7-day satisfaction guarantee on first charge (matching Tokavy).

---

## 6. AI Processing Logic

### Mode → Model mapping
| Mode | Model | Avg tokens out | Notes |
|---|---|---|---|
| Compress | gpt-4o-mini | ~60% of input | Fastest, cheapest |
| Enhance | gpt-4o | ~150% of input | Needs reasoning |
| Rewrite | gpt-4o-mini | ~100% of input | |
| Tone-shift | gpt-4o-mini | ~100% of input | Tone param passed in system prompt |
| Q&A Optimize | gpt-4o | ~200% of input | Multi-turn: 3 questions then optimize |
| Template | gpt-4o-mini | Variable | Template fills slots then optimizes |

### System prompts (stored in Convex, editable by admin)
Each mode has a versioned system prompt in Convex. Changing a system prompt creates a new version — all future requests use new version, history references version at time of request.

### Multi-model targeting
User selects target model (GPT-4o, Claude 3, Gemini 1.5, Midjourney). System prompt instructs optimizer to format output specifically for that model's strengths (e.g., Midjourney = short, visual, comma-separated descriptors; Claude = XML tags for structure).

---

## 7. Developer API

Base URL: `https://api.[domain].com/v1`

```
POST /optimize
  Authorization: Bearer {apiKey}
  Body: { prompt, mode, targetModel }
  Response: { optimized, tokensIn, tokensOut, savedTokens }

GET /history
  Authorization: Bearer {apiKey}
  Query: ?limit=50&mode=compress
  Response: { prompts: [...] }

GET /usage
  Authorization: Bearer {apiKey}
  Response: { today: { used, limit }, plan }
```

Rate limits enforced same as dashboard (500/day Pro). API key generated in dashboard, hashed in Convex.

---

## 8. Extension Store Distribution

- Chrome Web Store (primary)
- Firefox Add-ons (AMO)
- Edge Add-ons (auto-approved for Chrome extensions)
- Plasmo handles all 3 build targets from one codebase

Desktop:
- Windows: `.msi` installer + auto-update
- macOS: `.dmg` + notarization
- Linux: `.AppImage` + `.deb`
- All distributed via GitHub Releases + Tauri updater

---

## 9. Competitive Advantages Summary

| Feature | Us | Tokavy | AIPRM | PromptPerfect |
|---|---|---|---|---|
| Browser extension | ✅ Chrome+FF+Edge | ❌ | ✅ Chrome only | ❌ |
| Desktop app | ✅ Win+Mac+Linux | ✅ Win only | ❌ | ❌ |
| Inline replace | ✅ | ✅ | ❌ | ❌ |
| Modes | 10 | 2 | Template library | 3 |
| Free tier | 25/day | 10/day | Limited | Limited |
| Pro tier | 500/day $9 | 100/day | $33/mo | Unknown |
| Multi-model | ✅ | ❌ | ❌ | ✅ |
| Template library | ✅ | ❌ | ✅ 4000+ | ❌ |
| Team features | ✅ | ❌ | ✅ | ❌ |
| Developer API | ✅ | ❌ | ❌ | ✅ |
| Privacy (no storage) | ✅ | ✅ | ❌ | ❌ |
