#!/bin/bash
# Run from project root in Terminal.app (not inside Cursor sandbox):
#   cd ~/Downloads/luo-music-main && chmod +x scripts/deploy-vercel.sh && ./scripts/deploy-vercel.sh

set -e
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

echo "=== Luo Music → Vercel deploy ==="
echo "Project: $PROJECT_DIR"
echo ""

# --- 1. Git (required for GitHub + Vercel import) ---
if [ ! -d .git ]; then
  echo "→ Initializing git..."
  git init
  git branch -M main
fi

if ! git rev-parse HEAD >/dev/null 2>&1; then
  echo "→ Creating first commit..."
  git add .
  git commit -m "Luo Music: deploy to Vercel with Convex prod"
fi

echo ""
echo "=== GitHub (do this once) ==="
echo "1. Open https://github.com/new"
echo "2. Repository name: luo-music (Public)"
echo "3. Do NOT add README or .gitignore"
echo "4. Click Create repository"
echo ""
read -r -p "Enter your GitHub username: " GH_USER
if [ -n "$GH_USER" ]; then
  REMOTE="https://github.com/${GH_USER}/luo-music.git"
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$REMOTE"
  else
    git remote add origin "$REMOTE"
  fi
  echo "→ Pushing to $REMOTE ..."
  git push -u origin main
  echo "✓ Pushed to GitHub"
fi

echo ""
echo "=== Vercel CLI ==="
if ! command -v vercel >/dev/null 2>&1; then
  echo "→ Installing Vercel CLI globally (one time)..."
  npm install -g vercel
fi

echo "→ Log in to Vercel (browser will open)..."
vercel login

echo ""
echo "=== Convex deploy key (required for build) ==="
echo "Get it from: https://dashboard.convex.dev → your project → Settings → Deploy Key"
read -r -p "Paste CONVEX_DEPLOY_KEY (or press Enter to skip and add in Vercel dashboard later): " DEPLOY_KEY

echo "→ Linking project to Vercel..."
vercel link --yes 2>/dev/null || vercel link

set_env() {
  local name="$1"
  local value="$2"
  echo "$value" | vercel env add "$name" production --yes 2>/dev/null || \
    echo "$value" | vercel env add "$name" production
}

echo "→ Setting production environment variables..."
set_env "NEXT_PUBLIC_CONVEX_URL" "https://peaceful-platypus-862.convex.cloud"
set_env "NEXT_PUBLIC_CONVEX_SITE_URL" "https://peaceful-platypus-862.convex.site"
set_env "CONVEX_DEPLOYMENT" "prod:peaceful-platypus-862"

if [ -n "$DEPLOY_KEY" ]; then
  set_env "CONVEX_DEPLOY_KEY" "$DEPLOY_KEY"
else
  echo "⚠ Add CONVEX_DEPLOY_KEY in Vercel → Settings → Environment Variables before deploy succeeds."
fi

echo ""
echo "→ Deploying to production..."
vercel --prod

echo ""
echo "=== Done ==="
echo "Your site URL is shown above (e.g. https://luo-music.vercel.app)"
echo "Test: Sign In → Continue as Guest → play a track"
