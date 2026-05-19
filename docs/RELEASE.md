# Release Guide

How to release PromptForge across all platforms.

## Pre-Release Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Changelog updated
- [ ] Version bumped (major.minor.patch)
- [ ] Documentation updated
- [ ] Review and merge to `main`

## Versioning

Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes
- **MINOR** — New features (backward compatible)
- **PATCH** — Bug fixes

Example: v1.2.3 → v1.3.0 (new feature)

## Release Process

### 1. Update Version Numbers

```bash
# Update all package.json files
npm version minor

# This updates:
# - package.json (root)
# - apps/web/package.json
# - apps/extension/package.json
# - apps/desktop/package.json
# - apps/desktop/src-tauri/Cargo.toml
```

### 2. Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [1.3.0] - 2026-05-20

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix A
- Bug fix B

### Changed
- Breaking change C
```

### 3. Create Git Tag

```bash
git tag -a v1.3.0 -m "Release v1.3.0"
git push origin main --tags
```

This triggers GitHub Actions workflows:
- Build desktop installers (Windows, macOS, Linux)
- Upload to GitHub Releases

### 4. Web App (Automatic)

Pushing to `main` triggers Vercel deployment.
Web app automatically goes live.

### 5. Browser Extensions (Manual)

After GitHub Actions builds:

#### Chrome Web Store

```bash
# 1. Download Chrome build
# 2. Zip the extension
# 3. In Chrome Web Store console:
#    - Existing items → PromptForge
#    - Upload updated package
#    - Change version to 1.3.0
#    - Publish
```

#### Firefox Add-ons

```bash
# 1. Download Firefox build
# 2. Zip the extension
# 3. In addons.mozilla.org console:
#    - Manage my submissions
#    - Version history → New version
#    - Upload zip
#    - Complete listing form
#    - Submit
```

#### Edge Add-ons

```bash
# 1. Download Edge build
# 2. In partner.microsoft.com:
#    - Edge extensions
#    - Update listing
#    - Upload zip
#    - Complete metadata
#    - Publish
```

### 6. Desktop App (Automatic)

GitHub Actions automatically:
- Builds .msi (Windows)
- Builds .dmg (macOS)
- Builds .AppImage (Linux)
- Signs binaries
- Uploads to GitHub Releases
- Updates endpoint with release info

Users get auto-update notification within 30 minutes.

### 7. Verify Release

```bash
# Check GitHub Releases
gh release view v1.3.0

# Check web deployment
https://promptforge.app (should show new version)

# Check desktop auto-update
# Open desktop app → should prompt for update

# Check extension stores
# Chrome Web Store
# Firefox Add-ons
# Edge Add-ons
```

## Hotfix Release

For urgent production bugs:

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the bug
# ... make changes ...

# 3. Test thoroughly
npm test

# 4. Bump patch version
npm version patch  # e.g., 1.2.3 → 1.2.4

# 5. Create tag and push
git push origin hotfix/critical-bug
git tag -a v1.2.4 -m "Hotfix: critical bug"
git push origin v1.2.4

# 6. Merge back to main
git checkout main
git merge hotfix/critical-bug
git push origin main
```

## Rollback

If released version has critical issues:

### Web App (Vercel)

```bash
# Vercel dashboard → Deployments → Previous → Promote to Production
```

### Desktop

Users can manually downgrade by downloading previous installer from GitHub Releases.

No automatic rollback (users already have new version).

### Extensions

- **Chrome**: Instant remove from store + rollback to previous version
- **Firefox**: Remove listing, users keep installed version
- **Edge**: Remove from store, users keep version

## Release Notes Template

```markdown
# PromptForge v1.3.0

## 🎉 New Features

- **Multi-model support** - Switch between GPT-4o and GPT-4o-mini per request
- **Prompt templates** - Save and reuse common prompt patterns
- **Team workspaces** - Collaborate with team members (Premium)

## 🐛 Bug Fixes

- Fixed extension not loading on some Firefox versions
- Fixed desktop app crash on Windows with special characters
- Fixed history not syncing across devices

## 📊 Performance

- 30% faster API response times
- Reduced extension memory usage by 25%
- Improved desktop app startup time

## 🔐 Security

- Updated dependencies with security patches
- Added rate limiting to prevent abuse
- Improved token handling in extension

## 📚 Documentation

- Added team workspace guide
- Updated API reference
- New troubleshooting FAQ

## 🙏 Thanks

Special thanks to all contributors and users who reported issues!

---

**Download:**
- [Windows Installer](https://github.com/promptforge/promptforge/releases/download/v1.3.0/PromptForge_1.3.0_x64_en-US.msi)
- [macOS App](https://github.com/promptforge/promptforge/releases/download/v1.3.0/PromptForge.app.tar.gz)
- [Linux Binary](https://github.com/promptforge/promptforge/releases/download/v1.3.0/promptforge)

**Browser Extensions:**
- [Chrome](https://chromewebstore.google.com/detail/promptforge/...)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/promptforge/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/promptforge/...)
```

## Monitoring Post-Release

After release, monitor:

```bash
# Check error rates
# - Vercel Analytics
# - Extension error logs
# - Desktop crash reports

# Monitor user feedback
# - GitHub issues
# - Support email
# - Community Slack

# Track metrics
# - Daily active users
# - Optimization usage
# - Error rates by platform
```

## Communication

Notify users of new release:

- [ ] Twitter/X announcement
- [ ] Blog post (major releases)
- [ ] Email to newsletter
- [ ] GitHub Releases
- [ ] Discord/Slack community

---

## Troubleshooting

### Desktop build fails in CI
```bash
# Check logs
gh run view --log latest

# Common issues:
# - Rust toolchain: cargo --version
# - macOS signing: requires Apple cert
# - Windows signing: requires code signing cert
```

### Extension won't upload to store
- Check manifest version matches
- Verify zip structure (no parent folders)
- Check file sizes (Chrome 160MB max)

### Web app doesn't update
- Check Vercel deployment status
- Clear browser cache (Ctrl+Shift+Delete)
- Check DNS propagation

See `DEPLOYMENT.md` for platform-specific troubleshooting.
