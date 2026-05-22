# Luo Music

Music streaming for the Luo community — Next.js + Convex.

**GitHub:** https://github.com/Anei2017/luo-music  
**Convex prod:** `peaceful-platypus-862`

## Vercel deploy

1. Import **Anei2017/luo-music** (branch `main`) — not `luo-music-` or empty repos.
2. **Environment variables** (Production):
   - `NEXT_PUBLIC_CONVEX_URL` = `https://peaceful-platypus-862.convex.cloud`
   - `NEXT_PUBLIC_CONVEX_SITE_URL` = `https://peaceful-platypus-862.convex.site`
3. **Build command:** leave default (`next build`) — do **not** use `npx convex deploy`.
4. Deploy → Sign In → Continue as Guest.

Backend updates: run `npx convex deploy` from your Mac.
