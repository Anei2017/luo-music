# Deploy Luo Music to Vercel

Your app works locally. Follow **Option A** (easiest) or **Option B** (CLI script).

---

## Before you start

You need:

1. A [GitHub](https://github.com) account (free)
2. A [Vercel](https://vercel.com) account (free) — sign in with GitHub
3. **Convex Deploy Key** from [Convex Dashboard](https://dashboard.convex.dev) → **luo-music** → **Settings** → **Deploy Key** → Generate

---

## Option A — Vercel website (recommended)

### Step 1 — Push code to GitHub

Open **Terminal** on your Mac and run:

```bash
cd ~/Downloads/luo-music-main
git init
git branch -M main
git add .
git commit -m "Luo Music: deploy to Vercel"
```

1. Go to https://github.com/new  
2. Name: `luo-music` → **Public** → **Create repository** (no README)  
3. Run (replace `YOUR_USERNAME`):

```bash
git remote add origin https://github.com/YOUR_USERNAME/luo-music.git
git push -u origin main
```

> First push may take a few minutes (~130 MB of audio in `public/`).

### Step 2 — Import on Vercel

1. Go to https://vercel.com/new  
2. **Import** your `luo-music` GitHub repo  
3. Framework: **Next.js** (auto-detected)  
4. **Environment Variables** → add these for **Production**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://peaceful-platypus-862.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://peaceful-platypus-862.convex.site` |
| `CONVEX_DEPLOYMENT` | `prod:peaceful-platypus-862` |
| `CONVEX_DEPLOY_KEY` | *(paste from Convex dashboard)* |

5. Click **Deploy**

### Step 3 — Test live site

1. Open your `https://….vercel.app` URL  
2. **Sign In** → **Continue as Guest**  
3. Play a track  

---

## Option B — One script (Terminal)

```bash
cd ~/Downloads/luo-music-main
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

Follow the prompts (GitHub username, Vercel login, Convex deploy key).

---

## If the build fails

| Error | Fix |
|-------|-----|
| `CONVEX_DEPLOY_KEY` missing | Add it in Vercel env vars (see above) |
| `NEXT_PUBLIC_CONVEX_URL` not set | Add all 4 env vars, then **Redeploy** |
| Build timeout (large `public/audio`) | Normal on first deploy; retry deploy |
| Auth fails on live site | `NEXT_PUBLIC_CONVEX_SITE_URL` must be `https://peaceful-platypus-862.convex.site` |

---

## Convex + Vercel integration (optional)

In Vercel: **Integrations** → search **Convex** → connect your Convex project.  
It can set env vars automatically; you still need `CONVEX_DEPLOY_KEY` for the build command in `vercel.json`.

---

## Your production URLs

| Service | URL |
|---------|-----|
| Convex API | `https://peaceful-platypus-862.convex.cloud` |
| Convex Auth | `https://peaceful-platypus-862.convex.site` |
| Website | `https://YOUR-PROJECT.vercel.app` *(after deploy)* |
