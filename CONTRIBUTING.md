# Contributing to PromptForge

Thanks for your interest in contributing! This guide covers development setup, architecture, and best practices.

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/promptforge/promptforge
cd promptforge

# 2. Install dependencies
npm install

# 3. Create .env.local with keys (see README for required vars)
cp .env.example .env.local
# Edit .env.local with your Clerk, Convex, Stripe keys

# 4. Start dev environment
npm run dev
```

## Monorepo Structure

This is a **Turborepo** monorepo. Each app is independent but shares types and components:

- **packages/core** — Types, schemas, prompts (used by all apps)
- **packages/ui** — React components
- **packages/convex** — Backend schema and mutations
- **apps/web** — Next.js dashboard
- **apps/extension** — Plasmo browser extension
- **apps/desktop** — Tauri desktop app

## Code Style

- **TypeScript** — All files must be `.ts` or `.tsx`
- **React Hooks** — Prefer functional components
- **Tailwind CSS** — Styling (web and desktop) or CSS Modules (extension)
- **No prop drilling** — Use context for global state

Run linting before commit:
```bash
npm run lint
```

## Testing

- Write tests alongside features
- Use Jest for unit tests
- Use Playwright for E2E tests

```bash
npm test                 # Unit tests
npm run test:e2e        # E2E tests
```

## Making Changes

### 1. Create a feature branch
```bash
git checkout -b feature/my-feature
```

### 2. Make changes in one or more apps/packages

```bash
# Example: Adding a React component
# 1. Add to packages/ui/src/components/MyComponent.tsx
# 2. Export from packages/ui/src/index.ts
# 3. Use in app: import { MyComponent } from "@promptforge/ui"
```

### 3. Run tests
```bash
npm run lint        # Type check and lint
npm test           # Run unit tests
```

### 4. Commit with clear message
```bash
git commit -m "feat: add X feature to Y app"
```

Valid prefixes:
- **feat:** — New feature
- **fix:** — Bug fix
- **refactor:** — Code cleanup (no behavior change)
- **docs:** — Documentation update
- **test:** — Test additions/changes
- **chore:** — Build, deps, CI/CD

### 5. Push and open PR
```bash
git push origin feature/my-feature
# Then open PR on GitHub
```

## PR Review

PRs require:
- ✅ All tests pass
- ✅ Linting passes
- ✅ Code review approval
- ✅ Linked issue (if fixing a bug)

## Architecture Decisions

### Web App (Next.js)
- **Pages** — Route structure in `app/`
- **API Routes** — `app/api/` for backend calls
- **Hooks** — Custom hooks in `lib/hooks/`
- **Auth** — Clerk for authentication, `middleware.ts` for protection

### Extension (Plasmo)
- **Popup** — `popup.tsx` — Main UI (384px fixed width)
- **Options** — `options.tsx` — Settings page
- **Background** — `background.ts` — Service worker (logic, storage)
- **Content** — `contents/index.ts` — Runs on web pages (text injection, selection)
- **Messaging** — Use `chrome.runtime.sendMessage()` between scripts

### Desktop (Tauri)
- **Frontend** — React in `src/` (Vite-bundled)
- **Backend** — Rust in `src-tauri/src/` (tauri commands)
- **Invoke** — Call Rust from React: `invoke("command_name", { args })`
- **IPC** — All communication goes through Tauri's invoke bridge

### Backend (Convex)
- **Schema** — Define tables in `convex/schema.ts`
- **Queries** — Read-only functions in `convex/queries.ts`
- **Mutations** — Write functions in `convex/mutations.ts`
- **Actions** — Long-running, can call external APIs in `convex/actions.ts`

## Common Tasks

### Add a new API endpoint
```bash
# 1. Create apps/web/app/api/my-endpoint/route.ts
# 2. Export: export async function POST(req: Request) { ... }
# 3. Protect with auth middleware
# 4. Call Convex or external API
# 5. Return JSON response
```

### Add a new component
```bash
# 1. Create packages/ui/src/components/MyComponent.tsx
# 2. Export from packages/ui/src/index.ts
# 3. Use in any app: import { MyComponent } from "@promptforge/ui"
```

### Add a new Convex mutation
```bash
# 1. Add to convex/mutations.ts
# 2. Use from apps: const result = await mutate("mutationName", { args })
```

### Update database schema
```bash
# 1. Edit packages/convex/convex/schema.ts
# 2. Convex auto-migrates on deploy
# 3. Regenerate TypeScript types: npx convex dev
```

## Debugging

### Web
```bash
# Dev server includes source maps and React DevTools
npm run dev
# Open http://localhost:3000
# DevTools in browser (F12)
```

### Extension
```bash
# 1. npm run dev (watch mode)
# 2. chrome://extensions/ → Load unpacked → dist/chrome-mv3-prod/
# 3. Right-click extension → Inspect popup/background/content
# 4. Check console for logs
```

### Desktop
```bash
# 1. npm run dev
# 2. Opens app window automatically
# 3. DevTools: Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
# 4. Rust logs in console stderr
```

## Deployment

See README for deployment steps. PRs merged to `main` auto-deploy.

## Need Help?

- Check existing issues on GitHub
- Open a new issue with details
- Email: dev@promptforge.app

Thanks for contributing! 🚀
