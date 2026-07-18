#!/usr/bin/env bash
#
# Runbook: start the my-supply-hub app locally.
# Starts the Convex backend and the Vite dev server together.
# Stop everything with Ctrl+C.
#
# Usage:
#   ./run.sh
#
set -euo pipefail
cd "$(dirname "$0")"

# 1. Install dependencies if they're missing.
if [ ! -d node_modules ]; then
  echo "==> Installing dependencies (first run)..."
  npm install
fi

# 2. Start the Convex backend in the background.
echo "==> Starting Convex backend..."
npm run convex:dev &
CONVEX_PID=$!

# Make sure Convex is killed when this script exits.
cleanup() {
  echo ""
  echo "==> Shutting down..."
  kill "$CONVEX_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Give Convex a moment to write VITE_CONVEX_URL into .env.local.
sleep 4

# 3. Start the Vite dev server in the foreground (opens http://localhost:8080).
echo "==> Starting Vite dev server on http://localhost:8080 ..."
npm run dev
