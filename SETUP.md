# Luo Music — Setup

A Next.js 14 + Convex music app: streaming player, email/anonymous auth, real-time chat, comments, likes, follows, profile uploads.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure Convex

This repo is already linked to a Convex deployment (`.env.local` holds
`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, and
`CONVEX_DEPLOYMENT`). If you're starting fresh on your own account:

```bash
npx convex dev          # log in, create project, push schema + functions
```

After the first push you can keep `npx convex dev` running in one terminal to
auto-deploy changes, or use `npx convex dev --once` for a one-shot push.

## 3. Seed the catalog (one time)

The 19 sample tracks under `public/audio/*.mp3` and posters under
`public/img/*.jpg` are wired up via a seed mutation:

```bash
npx convex run songs:seedCatalog
```

This is idempotent — if the `songs` table already has rows it is a no-op.

## 4. Run the app

```bash
npm run dev             # http://localhost:3000
```

## 5. Auth providers

Configured out of the box (no extra setup):

- **Email + password** — sign up / sign in via `/auth`
- **Anonymous (Guest)** — one-tap, no credentials

OAuth (Google, GitHub, Apple, …) can be added later by:

1. Adding the provider import in `convex/auth.ts`
2. Setting `AUTH_<PROVIDER>_ID` / `AUTH_<PROVIDER>_SECRET` in the Convex
   dashboard under Settings > Environment Variables
3. The OAuth callbacks are already served from `convex/http.ts`
   (`auth.addHttpRoutes(http)`).

## 6. Deploy to production

```bash
npx convex deploy       # pushes backend to your prod deployment
npx convex run songs:seedCatalog --prod   # one time, if catalog is empty
```

Then deploy the Next.js app on **Vercel** with these **Production** environment
variables (must match prod, not dev):

| Variable | Example (your prod) |
|----------|---------------------|
| `CONVEX_DEPLOYMENT` | `prod:peaceful-platypus-862` |
| `NEXT_PUBLIC_CONVEX_URL` | `https://peaceful-platypus-862.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://peaceful-platypus-862.convex.site` |

Also add **`CONVEX_DEPLOY_KEY`** from Convex Dashboard → Settings → Deploy Key
(so Vercel can run `npx convex deploy` during build).

### Troubleshooting: “empty site” or auth errors

Your `.env.local` must point at the **same** deployment you seeded:

- Seeded **prod** (`peaceful-platypus-862`) → use prod URLs in `.env.local` and Vercel
- Seeded **dev** (`kindhearted-yak-653`) → use dev URLs and run `npx convex run songs:seedCatalog` (no `--prod`)

Sign in via **Continue as Guest** or email on `/auth` — the player only loads after login.

## Project layout

```
app/                       Next.js App Router pages (home / auth / chat / profile)
  ConvexClientProvider.tsx Wraps the tree in ConvexAuthProvider + online tracker
  layout.tsx, globals.css  Root layout and Tailwind base
convex/
  schema.ts                Tables: users, songs, comments, likes, conversations,
                           messages, follows, plus authTables
  auth.ts                  convexAuth({ providers: [Password, Anonymous] })
  auth.config.ts           JWT provider config for Convex Auth
  http.ts                  Mounts auth.addHttpRoutes for OAuth callbacks
  songs.ts                 list / get / listByUser / upload / incrementPlays /
                           seedCatalog
  users.ts                 current / get / updateProfile / setOnline/Offline /
                           search / list / generateUploadUrl
  chat.ts, comments.ts, likes.ts, follows.ts
public/
  audio/*.mp3              19 seed tracks served as static assets
  img/*.jpg                Cover art for the seed tracks
  uploads/                 (Reserved; user uploads go through Convex storage)
legacy/                    Original PHP/HTML prototype, kept for reference only
```

## Free tier reminders (Convex Hobby)

- 1M function calls / month
- 1 GB DB storage, 1 GB file storage, 1 GB bandwidth / month
- Unlimited team members
