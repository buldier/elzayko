# Elzayko — Architecture

Personal portfolio and public media gallery. One administrator publishes images,
videos, YouTube embeds and external links; visitors browse without an account.

## Stack (verified versions)

| Concern            | Choice                                   | Why |
| ------------------ | ---------------------------------------- | --- |
| Framework          | Next.js 16.4 (App Router, Turbopack)     | Cache Components + Partial Prefetching enabled (16.x defaults) |
| Language           | TypeScript (strict)                      | |
| Styling            | Tailwind CSS 4 (CSS-first `@theme`)       | Design tokens live in `src/app/globals.css` |
| UI primitives      | Hand-built accessible components in `src/components/ui` | Native `<dialog>`, `<details>` and form controls; no runtime UI dependency. shadcn/ui-compatible API shape (`cn`, `cva`) |
| Icons              | lucide-react                             | |
| Database           | PostgreSQL + Prisma ORM 7.10 (`@prisma/adapter-pg`) | Prisma 7 stable; 8.x is still RC |
| Auth               | Better Auth 1.7 (email + password, sign-up disabled) | Supports Next 16 / Prisma 7; Auth.js v5 is still beta and its maintainers point new projects to Better Auth |
| Validation         | Zod 4                                     | All untrusted input, env vars |
| Forms              | React Hook Form + `@hookform/resolvers`   | Admin metadata form; simple forms use `useActionState` |
| Media processing   | sharp (derivatives, EXIF stripping), file-type (magic-byte sniffing) | |
| Storage            | `StorageProvider` interface: `local` (dev) and `s3` (S3/R2/MinIO) | Presigned PUT for direct-to-storage uploads |
| Email              | `EmailProvider` interface: `console` (dev) and `resend` (HTTP API) | |
| Tests              | Vitest (unit + integration against Postgres), Playwright (e2e) | |

## Request flow and boundaries

```
Browser ──► proxy.ts (optimistic: /admin without session cookie → /login)
        ──► Server Components (public pages: 'use cache' + cacheTag reads)
        ──► Server Actions (admin mutations: requireAdmin() → service → updateTag())
        ──► Route Handlers (/api/*: uploads, downloads, video stream, contact, auth)
                 │
                 ▼
        features/*/services   (use cases, authorization-aware)
                 │
                 ▼
        features/*/repositories (Prisma only)     lib/storage   lib/email   lib/rate-limit
```

* The proxy is a UX convenience only. **Every** admin page, Server Action and
  protected Route Handler calls `requireAdmin()` which re-validates the session
  against the database and checks `role === "admin"`.
* Public reads go through `features/media/queries.ts`, which only ever selects
  `status = PUBLISHED` rows and never selects storage keys of originals.

## Caching

* Public data functions use `'use cache'` with `cacheLife('hours')` and tags:
  `media`, `taxonomy`, `pages`, `settings`.
* Admin Server Actions call `updateTag(tag)` (read-your-own-writes); Route
  Handlers that mutate use `revalidateTag(tag, 'max')`.
* Admin routes read the session at request time behind `loading.tsx`
  Suspense boundaries; nothing session-dependent enters a shared cache.

## Media model

`Media` is normalized across four kinds:

| mediaType | sourceType | Stored                                               | Rendered as |
| --------- | ---------- | ---------------------------------------------------- | ----------- |
| IMAGE     | UPLOAD     | original (private) + `display`/`thumb` WebP derivatives | `next/image` |
| VIDEO     | UPLOAD     | original (private) + optional poster derivatives      | `<video>` via `/api/media/:id/stream` |
| VIDEO     | EXTERNAL   | provider + provider id (e.g. YouTube)                 | `youtube-nocookie.com/embed/:id` iframe |
| LINK      | EXTERNAL   | sanitized URL + detected platform                     | Preview card + outbound link |

External providers implement `ExternalMediaProvider` (`features/media/providers`).
YouTube is embeddable. Instagram, TikTok, X, Facebook, Vimeo, Behance, etc. are
recognised for labelling but rendered as link cards until their embed terms are
verified — no arbitrary iframe HTML is ever accepted.

Database CHECK constraints (see the initial migration) enforce:
uploads have a storage key, externals have a URL, published rows have
`publishedAt`, and downloads can only be enabled on uploaded images.

### Upload pipeline

1. Admin picks a file → client pre-checks type/size.
2. `POST /api/uploads` (admin, rate-limited) validates declared type/size, mints
   a key `uploads/<uuid>.<ext>` and returns an upload target:
   * `s3`: presigned PUT (content type + length are signed).
   * `local`: `PUT /api/uploads/local?token=…` with an HMAC token bound to key,
     type, size and expiry.
3. Browser uploads directly with progress (XHR).
4. Server Action `createMedia` re-validates: key pattern, object size, **magic
   bytes** via `file-type`, decodes images with sharp, strips metadata, writes
   derivatives, computes a blur placeholder. Invalid objects are deleted.

### Downloads

`GET /api/media/:id/download` serves only `IMAGE + UPLOAD + PUBLISHED +
allowDownload`. Everything else is 404. Local storage streams the file;
S3 redirects to a 60-second signed URL with `Content-Disposition: attachment`.
Originals are never linked from pages; pages use derivatives.

## Security checklist

* No public registration (`emailAndPassword.disableSignUp`); admin is seeded.
* Login and Better Auth endpoints rate-limited (database-backed).
* Contact form: Zod, honeypot, minimum fill time, per-IP rate limit, IP stored as
  salted hash only.
* Secrets only read in `server-only` modules through `lib/env.ts`.
* Security headers (CSP, frame-ancestors, nosniff, referrer policy) in `next.config.ts`.
* Admin pages are `noindex` and never cached publicly.

## Directory map

```
prisma/              schema, migrations, seed (+ procedurally generated art fixtures)
src/app/(public)     home, gallery, gallery/[slug], about, contact, privacy, terms
src/app/(auth)       login
src/app/admin        dashboard, media, categories, collections, pages, settings
src/app/api          auth, uploads, media, contact
src/app/files        local-storage derivative server (dev / single-node)
src/components       ui, layout, gallery, media, feedback, admin
src/features         media, categories, collections, pages, settings, contact, auth
src/lib              env, db, auth, storage, email, rate-limit, utils
src/config           site, navigation, media limits
tests                unit, integration, e2e
```

## Phases

1. Setup: Next 16, Tailwind tokens, lint/format, route skeleton.
2. Public UI with fixtures.
3. Prisma schema, migrations, seed, repositories/services.
4. Auth + admin dashboard, uploads, publishing.
5. YouTube/link providers, storage + downloads, contact email, spam protection.
6. SEO, error states, tests, docs, production build verification.
