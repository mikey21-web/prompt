# Deployment Guide

PromptForge deployment across multiple platforms.

## Web App (Next.js + Vercel)

### Prerequisites
- Vercel account
- GitHub repo linked to Vercel

### Step 1: Environment Variables

In Vercel dashboard, add:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2: Deploy

```bash
# Automatic on merge to main
git push origin main

# Or manual deploy
vercel deploy --prod
```

### Step 3: Configure Domain

In Vercel:
1. Settings → Domains
2. Add custom domain
3. Update DNS records

### Monitoring
- Vercel Analytics (auto-enabled)
- Check logs: `vercel logs`
- Performance: Speed Insights

---

## Browser Extension

### Chrome Web Store

1. **Build**: `npm run build:chrome`
2. **Create package**:
   ```bash
   cd build/chrome-mv3-prod
   zip -r promptforge-chrome.zip *
   ```
3. **Upload**:
   - Chrome Web Store console
   - Upload zip file
   - Add screenshots, description
   - Submit for review (~24-48 hours)

### Firefox Add-ons

1. **Build**: `npm run build:firefox`
2. **Create package**:
   ```bash
   cd build/firefox-mv2
   zip -r promptforge-firefox.zip *
   ```
3. **Upload**:
   - addons.mozilla.org console
   - Upload zip
   - Submit for review (~3-5 days)

### Edge Add-ons

1. **Build**: `npm run build:edge`
2. **Create package**:
   ```bash
   cd build/edge-mv3
   zip -r promptforge-edge.zip *
   ```
3. **Upload**:
   - partner.microsoft.com console
   - Upload zip
   - Submit for review (~1 week)

### Post-Launch Updates

All stores support auto-update via manifest version bump:
```json
{
  "version": "1.0.1"
}
```

Apps check for updates every 30 minutes.

---

## Desktop App (Tauri)

### Build Installers

```bash
cd apps/desktop

# Windows (requires MSVC toolchain)
npm run build:windows
# Output: src-tauri/target/release/bundle/msi/PromptForge_1.0.0_x64_en-US.msi

# macOS (requires Apple Developer certificate)
npm run build:macos
# Output: src-tauri/target/release/bundle/macos/PromptForge.app

# Linux
npm run build:linux
# Output: src-tauri/target/release/promptforge (binary)
```

### Code Signing (macOS)

1. Get Apple Developer certificate
2. Add to keychain
3. Set env vars:
   ```bash
   export APPLE_CERTIFICATE="path/to/cert.p12"
   export APPLE_CERTIFICATE_PASSWORD="password"
   export APPLE_SIGNING_IDENTITY="Developer ID Application: ..."
   ```
4. Build: `npm run build:macos`

### Code Signing (Windows)

1. Get code signing certificate from DigiCert/Sectigo
2. Save to `cert.pfx`
3. Set env vars:
   ```bash
   export WINDOWS_CERTIFICATE_PATH="path/to/cert.pfx"
   export WINDOWS_CERTIFICATE_PASSWORD="password"
   ```
4. Build: `npm run build:windows`

### Distribution

**Option 1: GitHub Releases**
```bash
# Create GitHub release with installers
# Users download .msi, .dmg, or .AppImage
```

**Option 2: Auto-Update Server**
- Host releases on S3
- Update server endpoint in tauri.conf.json
- App checks on startup

```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://releases.promptforge.app/latest"],
    "dialog": true
  }
}
```

---

## Backend (Convex)

### Deploy from CLI

```bash
npm install -g convex

# Login
convex auth

# Deploy from packages/convex
cd packages/convex
convex deploy

# Verify
convex logs
```

### Production URL

After deploy, update web/desktop:
```env
NEXT_PUBLIC_CONVEX_URL=https://xyz-prod.convex.cloud
```

### Database Backups

Convex auto-backs up daily. Access via console:
1. convex.dev dashboard
2. Project → Backups
3. Restore if needed

---

## Custom Domain Setup

### DNS Records

For `promptforge.app`:

```
A         @           93.184.216.34          (Vercel IP)
CNAME     www         cname.vercel-dns.com
CNAME     api         cname.vercel-dns.com
```

### SSL Certificate

- Vercel auto-issues Let's Encrypt certificate
- No manual config needed
- Renews automatically

---

## Monitoring & Logging

### Web App
```bash
# Tail logs
vercel logs --tail

# Performance
vercel speed-insights

# Analytics
vercel analytics
```

### Desktop
Logs stored in app data directory:
- **Windows**: `%APPDATA%/PromptForge/logs/`
- **macOS**: `~/Library/Application Support/PromptForge/logs/`
- **Linux**: `~/.config/PromptForge/logs/`

### Backend
```bash
# View Convex logs
convex logs --project=promptforge

# Query production data (read-only)
convex run queries/getStats
```

---

## Rollback

### Web App
```bash
# Vercel auto-keeps previous versions
# Dashboard → Deployments → Previous → Promote to Production
```

### Desktop
- Users must manually downgrade (download old installer)
- Or auto-update reverts if new version fails health check

### Backend
```bash
# Convex keeps 30-day backup history
convex restore --backup-id=...
```

---

## CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g convex
      - run: cd packages/convex && convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

---

## Troubleshooting

### Vercel Build Fails
```bash
# Check logs
vercel logs --tail

# Test locally
npm run build
npm run preview
```

### Desktop Build Fails
```bash
# Check Rust errors
cargo build --release

# Windows: Install MSVC build tools
# macOS: Install Xcode command line tools
# Linux: Install build-essential

sudo apt-get install build-essential libssl-dev
```

### Extension Won't Load
- Check console for errors (DevTools)
- Verify manifest.json is valid
- Clear extension data and reload

---

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] API keys rotated monthly
- [ ] Database backups tested
- [ ] Secrets not in version control
- [ ] Rate limiting configured
- [ ] CORS policy restricted
- [ ] CSP headers set
- [ ] Code signing enabled for desktop
