# PromptForge

AI Prompt Optimizer Platform — Compress, enhance, and rewrite prompts across web, desktop, and browser extension.

## Quick Start

### Prerequisites
- Node.js 18+
- Rust toolchain (for desktop app)
- Git

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development
npm run dev
```

## Architecture

PromptForge is a **Turborepo monorepo** with four main applications:

| App | Framework | Purpose |
|-----|-----------|---------|
| **web** | Next.js 14 | Dashboard, user auth, subscription management |
| **extension** | Plasmo | Browser extension (Chrome, Firefox, Edge) |
| **desktop** | Tauri v2 | Native desktop application (Windows, macOS, Linux) |
| **backend** | Convex | Serverless API, database, authentication |

### Shared Packages

- **@promptforge/core** — Core types, API schemas, system prompts
- **@promptforge/ui** — React components (UsageBar, ModeButton, PromptDiff, etc.)

## Features

### Modes
- **Compress** — Reduce prompt length while preserving intent
- **Enhance** — Add clarity, context, and specificity
- **Rewrite** — Completely rewrite for different tone or style

### Integrations
- **Authentication** — Clerk (email, OAuth, SAML)
- **Payments** — Stripe + Razorpay subscriptions
- **AI Models** — OpenAI gpt-4o-mini (default), gpt-4o (premium)
- **Storage** — Convex database with real-time sync

## Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js web dashboard
│   ├── extension/              # Plasmo browser extension
│   ├── desktop/                # Tauri desktop app
│   └── desktop/src-tauri/      # Rust backend for desktop
├── packages/
│   ├── core/                   # Shared types and prompts
│   ├── ui/                     # React UI components
│   └── convex/                 # Convex schema and functions
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # Workspace definition
└── package.json                # Root dependencies
```

## Development

### Web App
```bash
cd apps/web
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Extension
```bash
cd apps/extension
npm run dev          # Start dev (hot reload)
npm run build        # Build for Chrome (build/)
npm run build:firefox # Build for Firefox
npm run build:edge   # Build for Edge
```

### Desktop App
```bash
cd apps/desktop
npm run dev          # Start dev with hot reload
npm run build        # Build installer/app
npm run build:windows
npm run build:macos
npm run build:linux
```

## API Endpoints

All endpoints require authentication via Clerk JWT.

```
POST /api/optimize
  - prompt: string
  - mode: "compress" | "enhance" | "rewrite"
  - model?: "gpt-4o-mini" | "gpt-4o"
  → { optimized: string, tokens: { input, output } }

GET /api/usage
  → { used: number, limit: number, reset_date: ISO8601 }

POST /api/templates
  - name: string
  - prompt: string
  → { id, name, prompt, created_at }

GET /api/history?limit=50&offset=0
  → [{ prompt, optimized, mode, timestamp }]
```

## Testing

```bash
# Unit tests (web)
cd apps/web && npm test

# E2E tests (Playwright) - TODO
npm run test:e2e

# Linting
npm run lint

# Type check
npm run type-check
```

## Deployment

### Web (Vercel)
```bash
vercel deploy
```

### Extension (Chrome Web Store)
1. Build: `npm run build`
2. Upload to Chrome Web Store

### Desktop (Self-hosted)
- Windows: `.msi` installer in `src-tauri/target/release/bundle/msi/`
- macOS: `.app` in `src-tauri/target/release/bundle/macos/`
- Linux: Binary in `src-tauri/target/release/`

## Environment Variables

Create `.env.local` in each app with:

### Web App
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Extension
```env
PLASMO_PUBLIC_API_URL=https://promptforge.app
```

### Desktop
```env
# Stored in app data directory
- api_key (OpenAI)
- mode (default optimization mode)
```

## Performance

- **Web**: Optimized with Next.js image optimization, Code splitting, Edge caching
- **Extension**: ~500KB total (gzipped), uses message passing for isolation
- **Desktop**: ~50MB installer, native performance via Tauri

## Monitoring

- Web analytics via Vercel Analytics
- Extension usage via Convex logs
- Desktop telemetry (opt-in)

## License

MIT

## Support

- Issues: GitHub Issues
- Email: support@promptforge.app
- Docs: https://promptforge.app/docs

---

Built with ❤️ on Turborepo, Next.js, Tauri, Plasmo, and Convex.
