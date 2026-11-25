# Tufte General Trading — warehouse catalog

Public catalog + admin panel for Tufte General Trading Works PLC (importer of metals and sanitary materials, warehouse in Ashewa Meda).

- **Public site:** home, products (search + category filter), product page with Telegram / WhatsApp / Call order buttons, about, contact + map.
- **Admin (`/admin`):** dashboard (low / out of stock, recent changes), products with quick **+ Arrived / − Sold** stock buttons, photo upload, categories, settings, team.
- **Open business decisions are settings**, not code: show prices or "Call for price", show exact stock / status only / nothing, low-stock threshold, hide out-of-stock items, which contact buttons appear.

## Stack

Next.js 16 (App Router, Cache Components) · Tailwind v4 · Drizzle ORM + `pg` on Neon Postgres · Neon Auth (managed Better Auth) · Neon Object Storage (`product-images`, public_read) · Vercel.

| Where | What |
| --- | --- |
| `src/db/schema.ts` | Tables: settings (single row), categories, products, product_images, stock_movements, admins |
| `src/lib/display.ts` | The one place that decides what the public sees for price and stock |
| `src/lib/queries.ts` | Cached public reads (`"use cache"` + tags `catalog` / `settings`) |
| `src/app/admin/actions.ts` | All admin mutations. Each calls `requireAdmin()`, then `updateTag()` |
| `src/lib/admin.ts` | Owners = `ADMIN_OWNER_EMAILS`; staff = `admins` table |
| `src/proxy.ts` | Neon Auth middleware, on `/admin/*` only |
| `src/lib/storage.ts` | S3 SigV4 upload/delete via `aws4fetch` |

Stock only changes through `adjustStock`, which updates the quantity and writes a `stock_movements` row (who, when, why) in one transaction.

## Local development

```bash
neon checkout dev          # dev branch; pulls DATABASE_URL, auth and storage vars into .env.local
npm run db:migrate
npm run db:seed            # business info + placeholder products (safe to re-run)
npm run dev                # or: npm run dev:webpack (machines without native SWC)
```

App-only env vars go in `.env.local` too (see `.env.example`): `NEON_AUTH_COOKIE_SECRET`, `ADMIN_OWNER_EMAILS`.

Admin login: go to `/auth/sign-in` → "First time here? Create your password" with an owner or team email.

Schema change: edit `schema.ts` → `npm run db:generate` → `npm run db:migrate` (uses the direct, non-pooled URL).

## Deploying to Vercel

1. `neon checkout production`, then `npm run db:migrate` (and `npm run db:seed` once for the business settings).
2. In Vercel, set env vars from the production branch's `.env.local`. **Vercel reserves `AWS_*` names**, so map the storage vars:
   `AWS_ACCESS_KEY_ID → STORAGE_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY → STORAGE_SECRET_ACCESS_KEY`,
   `AWS_ENDPOINT_URL_S3 → STORAGE_ENDPOINT_URL`, `AWS_REGION → STORAGE_REGION`.
   Also set `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `ADMIN_OWNER_EMAILS`.
3. Trust the domain for auth: `neon neon-auth domain add https://<your-domain>`.
4. Production auth emails (password reset) need custom SMTP: https://neon.com/docs/auth/production-checklist.md
