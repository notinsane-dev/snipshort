# Contributing to SnipShort

Thank you for your interest in contributing! SnipShort is open source and community contributions are welcome.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.local.example .env.local`
4. Set up [Supabase](https://supabase.com), [Upstash Redis](https://upstash.com), and [Clerk](https://clerk.com) (see README).
5. Apply migrations: `supabase db push` (or run SQL files manually).
6. Start the dev server: `npm run dev`

## Development workflow

- Create a feature branch from `main`: `git checkout -b feat/your-feature`
- Keep changes focused — one logical change per pull request.
- Run `npm run lint` and `npm run build` before opening a PR.
- Match existing code style: TypeScript, Tailwind utility classes, minimal scope.

## Pull requests

1. Update README or inline docs if your change affects setup, env vars, or architecture.
2. Describe **what** changed and **why** in the PR description.
3. Link any related issues (`Fixes #123`).
4. Ensure no secrets, `.env` files, or API keys are included.

## Reporting bugs

Open a [bug report](.github/ISSUE_TEMPLATE/bug_report.md) with:

- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, browser if relevant)

## Feature requests

Open a [feature request](.github/ISSUE_TEMPLATE/feature_request.md) and explain the use case. Not every request will be accepted — we prioritize features that fit the core URL shortener scope.

## Security issues

Do **not** open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md).

## Code of conduct

Be respectful and constructive. Harassment, spam, and bad-faith contributions will not be tolerated.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
