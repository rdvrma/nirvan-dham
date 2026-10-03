#!/usr/bin/env bash
# Idempotent: rebuilds the tools a fresh or resumed session needs (Node dependencies, Playwright's Chromium). Safe to run any number of times.
#   bash scripts/cloud-bootstrap.sh          (also run by the committed SessionStart hook in .claude/settings.json)
# It never reads or writes secrets, never touches a database and never calls a paid API.
set -u
cd "$(dirname "$0")/.."
say() { printf '[bootstrap] %s\n' "$*"; }

if ! command -v node >/dev/null 2>&1; then say "node is missing: install Node 20+ first"; exit 1; fi
say "node $(node -v), npm $(npm -v)"

# 1. Node dependencies: install only when node_modules is missing or older than the lockfile
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  say "installing Node dependencies (npm ci)"
  npm ci --no-audit --no-fund --loglevel=error || npm install --no-audit --no-fund --loglevel=error
else
  say "node_modules is up to date"
fi

# 2. Playwright browser (Chromium only, used by the e2e tests): install only when the cache lacks it
if [ -d node_modules/@playwright/test ]; then
  if npx --no-install playwright install --dry-run chromium 2>/dev/null | grep -q "browser: chromium.*is already installed\|Install location" && [ -n "$(ls -d "${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"/chromium-* "$LOCALAPPDATA"/ms-playwright/chromium-* 2>/dev/null | head -1)" ]; then
    say "Playwright Chromium is installed"
  else
    say "installing Playwright Chromium"
    npx --no-install playwright install chromium || say "Playwright browser install failed (run it manually: npx playwright install chromium)"
  fi
fi
say "done"
