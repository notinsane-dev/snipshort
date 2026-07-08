# SnipShort

[![License: MIT](https://img.shields.io/badge/License-MIT-brown.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

**SnipShort** is an open-source URL shortener with custom aliases, expiry dates, password protection, branded QR codes, click analytics, and a personal dashboard.

Self-host it, fork it, or contribute back — it's MIT licensed.

![SnipShort](./public/snipshort.webp)

---

## Features

- **Instant shortening** — paste any HTTP/HTTPS URL and get a short link in seconds
- **Custom aliases** — readable paths like `/r/my-campaign`
- **Link expiry** — 1, 7, or 30 days, or never
- **Password protection** — bcrypt-hashed passphrases, never stored in plain text
- **Branded QR codes** — downloadable PNG with logo and styled finders
- **Click analytics** — per-link stats page and dashboard overview
- **User dashboard** — save, manage, and delete links (Clerk auth + Supabase RLS)
- **Edge-fast redirects** — Redis-cached lookups with sub-10ms repeat clicks
- **Rate limiting** — Upstash-backed limits on shorten and verify endpoints
- **SEO / AEO / GEO** — sitemap, robots, JSON-LD, `llms.txt`, and `ai.txt`

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Auth | Clerk |
| Database | Supabase (Postgres + RLS) |
| Cache / rate limit | Upstash Redis |
| Styling | Tailwind CSS v4, Framer Motion, GSAP |
| Deployment | Vercel (or any Node.js host) |

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/notinsane-dev/snipshort.git
cd snipshort
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in every value. See [`.env.local.example`](./.env.local.example) for inline comments.

| Variable | Where to find it | Browser-safe? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Yes (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **No — server only** |
| `REDIS_URL` | Upstash → database → TCP/TLS | No |
| `UPSTASH_REDIS_REST_URL` | Upstash → database → REST API | No |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash → database → REST API | No |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard | Yes |
| `CLERK_SECRET_KEY` | Clerk Dashboard | **No — server only** |
| `NEXT_PUBLIC_BASE_URL` | Your domain, e.g. `https://snipshort.example.com` | Yes |

### 3. Database migrations

Run all migrations in order:

```bash
# Recommended — Supabase CLI
npx supabase login
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

Or run each file manually in the Supabase SQL Editor:

```
supabase/migrations/20260707000001_create_links_table.sql
supabase/migrations/20260707000002_increment_link_clicks_fn.sql
supabase/migrations/20260707000003_clerk_auth.sql
supabase/migrations/20260707000004_fix_clerk_uid_cast.sql
supabase/migrations/20260707000005_public_stats_fn.sql
```

**Clerk ↔ Supabase JWT:** follow the steps in `.env.local.example` to connect Clerk as a Supabase third-party auth provider.

**pg_cron (optional):** enable the `pg_cron` extension and run the cleanup schedule block in `20260707000001_create_links_table.sql` to physically delete expired rows.

### 4. Run locally

```bash
npm run dev   # http://localhost:3000
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run gen:types` | Regenerate `types/supabase.ts` from live schema |

---

## Architecture

```
Browser hits /r/my-slug
        │
        ▼
proxy.ts
  └─ Clerk session refresh for protected routes
        │
        ▼
app/r/[slug]/route.ts
  ├─ Redis cache hit  → redirect decision in ~1–5ms
  ├─ Cache miss       → Supabase lookup, then cache
  ├─ Not found        → /link-not-found
  ├─ Expired          → /expired
  ├─ Password-gated   → /verify/<slug>
  └─ Valid            → 307 redirect
        │
        ▼ (fire-and-forget)
  lib/trackClick.ts → increment_link_clicks RPC
```

### Key directories

```
app/
  page.tsx              Homepage + shorten form
  r/[slug]/route.ts     Redirect handler
  api/shorten/          Create short links
  api/verify/[slug]/    Password verification
  dashboard/            Authenticated link management
  stats/[slug]/         Public click analytics
  llms.txt/ ai.txt/     AEO / GEO manifests

lib/
  supabase/             Anon + service-role clients
  redis.ts              Slug cache (ioredis)
  ratelimit.ts          Upstash rate limiters
  seo.ts aeo.ts geo.ts  SEO, answer-engine, generative-engine content

supabase/migrations/    Versioned SQL schema + RLS policies
```

---

## Self-hosting / deploying

1. Push to GitHub (or GitLab, etc.).
2. Import into [Vercel](https://vercel.com/new) or any Node.js host that supports Next.js 16.
3. Add all environment variables from `.env.local.example`.
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain.
5. Deploy — `npm run build` runs automatically on Vercel.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

- Bug reports → [open an issue](.github/ISSUE_TEMPLATE/bug_report.md)
- Feature ideas → [open an issue](.github/ISSUE_TEMPLATE/feature_request.md)
- Security issues → see [SECURITY.md](./SECURITY.md) (do not file publicly)

---

## License

[MIT](./LICENSE) — free to use, modify, and distribute with attribution.

---

## Roadmap

- [ ] Cloudflare Turnstile on the shorten form
- [ ] Detailed click events (referrer, UA, geo)
- [ ] Custom domains per link
- [ ] Link editing from the dashboard

Want to pick something up? Check [open issues](https://github.com/notinsane-dev/snipshort/issues) or propose a new one.
