# Elzayko

A personal photography portfolio and public media gallery: an editorial public site, plus a
private studio where the author uploads, organises and publishes images, video, YouTube embeds
and external links.

Built with Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, PostgreSQL +
Prisma 7, Better Auth, Zod and sharp. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the
design, data model and security decisions.

## Quick start

Requirements: Node.js ≥ 20.19 and PostgreSQL ≥ 14.

```bash
npm install                    # also generates the Prisma client
cp .env.example .env           # then fill in DATABASE_URL, BETTER_AUTH_SECRET, ADMIN_*
npm run db:deploy              # apply migrations
npm run db:seed                # admin account + sample content
npm run dev                    # http://localhost:3000  ·  studio at /admin
```

The seed downloads 16 Unsplash-licensed sample photographs from picsum.photos and credits each
photographer in the description. Without network access (or with `SEED_OFFLINE=1`) it renders
generated artwork instead. Replace the samples with your own work before launch.

To create a local database on a typical PostgreSQL install:

```bash
sudo -u postgres createuser --pwprompt elzayko
sudo -u postgres createdb -O elzayko elzayko
sudo -u postgres createdb -O elzayko elzayko_test   # for integration tests
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Develop, build and serve |
| `npm run lint` / `typecheck` / `format` | ESLint, TypeScript, Prettier |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply migrations (CI / production) |
| `npm run db:seed` | Seed admin + sample content (idempotent) |
| `npm run db:reset` | Drop, re-migrate and re-seed the development database |
| `npm test` | Unit + integration tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; run `npx playwright install chromium` once) |

Integration tests run against `TEST_DATABASE_URL` and empty it first; they refuse to run unless
the database name ends in `_test`.

## Environment variables

Every variable is documented in [.env.example](.env.example) and validated at startup by
`src/lib/env.ts`. Secrets are only read in server-only modules and never reach the browser.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `SITE_URL` | yes | Public origin; drives canonical URLs, sitemap and auth |
| `BETTER_AUTH_SECRET` | yes | ≥ 32 random characters; the dev placeholder is rejected in production |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | seed only | Creates/updates the single administrator |
| `STORAGE_DRIVER` | no | `local` (default) or `s3` |
| `S3_*` | if `s3` | Private bucket + public base URL for derivatives |
| `EMAIL_DRIVER` | no | `console` (default) or `resend` |
| `RESEND_API_KEY`, `EMAIL_FROM` | if `resend` | Sender must be on a verified domain |
| `CONTACT_RECIPIENT` | no | Overrides the contact email from Settings |
| `TRUSTED_IP_HEADERS` | no | Proxy headers trusted for client IPs |

## Integrations: status

| Integration | Status |
| --- | --- |
| Local storage, uploads, downloads, video streaming | Implemented and tested |
| S3-compatible storage (presigned PUT, signed downloads) | Implemented, **not yet tested against a real bucket**. Configure `S3_*`, add a bucket CORS rule allowing `PUT` from `SITE_URL`, and run the upload e2e test before relying on it |
| Resend email | Implemented, **not yet tested with a real API key**. Until configured, messages are stored and listed in the dashboard and logged to the console |
| YouTube | Implemented (privacy-enhanced embeds, click-to-load) |
| Other social platforms | Recognised and shown as link cards; embeds are deliberately not enabled until each platform's terms are verified |

## Deployment

1. Provision PostgreSQL and set the environment variables (with `SITE_URL` as your https origin).
2. Use `STORAGE_DRIVER=s3` on serverless or multi-instance hosts, since local disk is not shared or durable there.
3. Configure a real email provider (`EMAIL_DRIVER=resend`).
4. Build: `npm ci && npm run db:deploy && npm run build`, then run `npm start` (or deploy to a Next.js host).
   The build prerenders public pages, so the database must be reachable at build time.
5. Create the admin: run `npm run db:seed` once (it also adds sample content, which you can delete
   from the studio), or set only the `ADMIN_*` variables and remove the sample media afterwards.
6. Review the placeholder Privacy and Terms copy in **Studio → Pages** before going live.

Behind a reverse proxy, set `TRUSTED_IP_HEADERS` to the header your proxy sets (for example
`cf-connecting-ip` on Cloudflare) so rate limits key on real client addresses.
