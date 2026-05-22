# Push fix + redeploy on Vercel

Copy and run these commands in **Terminal** (one block at a time).

## 1. Fix is in vercel.json (npm run build only)

## 2. Push to GitHub

```bash
cd ~/Downloads/luo-music-main
git checkout main
git add vercel.json README.md FIX-VERCEL.md PUSH-AND-DEPLOY.md
git commit -m "Fix Vercel: npm run build only (no convex deploy on Vercel)"
git push origin main
```

**If Vercel uses `luo-music-2026` instead of `luo-music`:**

```bash
git remote add github2026 https://github.com/Anei2017/luo-music-2026.git 2>/dev/null || git remote set-url github2026 https://github.com/Anei2017/luo-music-2026.git
git push github2026 main
```

(Use the remote name that matches the repo connected in Vercel.)

## 3. Vercel environment variables

Project → **Settings** → **Environment Variables** → **Production**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://peaceful-platypus-862.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://peaceful-platypus-862.convex.site` |

Save. You do **not** need `CONVEX_DEPLOY_KEY` with this setup.

## 4. Redeploy

**Deployments** → latest → **Redeploy** → uncheck "Use existing Build Cache"

Build log should say: `Running "npm run build"` (NOT `npx convex deploy`).

## 5. Test live site

Sign In → Continue as Guest → play a track.
