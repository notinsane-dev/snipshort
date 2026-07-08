# Security Policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

## Reporting a vulnerability

If you discover a security issue, please **do not** open a public GitHub issue.

Instead, email **security@snipshort.app** with:

- A description of the vulnerability
- Steps to reproduce
- Impact assessment (if known)

We aim to acknowledge reports within 48 hours and will work with you on a fix before any public disclosure.

## Scope

In scope:

- Authentication and authorization bypass
- SQL injection or RLS policy flaws
- Secret exposure in client bundles or logs
- Redirect/open-redirect abuse
- Rate-limit bypass enabling abuse

Out of scope:

- Denial-of-service at the infrastructure level
- Social engineering
- Issues in third-party services (Supabase, Clerk, Upstash, Vercel)

## Best practices for self-hosters

- Never commit `.env` files or expose `SUPABASE_SERVICE_ROLE_KEY` / `CLERK_SECRET_KEY`
- Rotate keys if you suspect a leak
- Keep dependencies updated: `npm audit`
