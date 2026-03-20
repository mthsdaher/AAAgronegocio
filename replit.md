# AAAgronegócio

## Overview

Production-grade SaaS + marketplace platform for farm listings in Brazil. Built with Express API backend and React+Vite frontend in a pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + wouter
- **Backend**: Express 5 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT via httpOnly cookies (access token + refresh token)
- **Build**: esbuild (CJS bundle)

## Structure

```text
/
├── artifacts/
│   ├── aaagronegocio/     # React+Vite frontend (previewPath: /)
│   └── api-server/        # Express API server (previewPath: /api)
├── lib/
│   ├── api-spec/          # OpenAPI spec + Orval codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle schema + DB connection
├── scripts/               # Utility scripts
└── pnpm-workspace.yaml
```

## Database Schema

- **users** — admin, seller, buyer roles; isPremium flag; JWT refresh token storage
- **listings** — comprehensive farm listing schema (100+ fields): location, area, infrastructure checkboxes, water resources, livestock, house details, documents, moderation workflow
- **media** — images, videos, PDFs linked to listings
- **listing_views** — analytics events for view tracking
- **interests** — buyer interest actions (info, proposal, visit)
- **favorites** — buyer saved listings

## API Routes

All routes under `/api`:

- `GET /healthz` — health check
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` — JWT auth
- `GET /auth/me`, `PUT /auth/me/profile` — user profile
- `GET /listings` — public search with filters/pagination
- `GET /listings/featured` — premium featured listings
- `GET /listings/map` — map pins (lat/lng)
- `GET /listings/:slug` — listing detail
- `POST /listings/:slug/view` — track view analytics
- `POST /listings/:slug/interest` — record buyer interest + get WhatsApp/email URLs
- `GET /seller/dashboard` — seller stats
- `GET/POST /seller/listings` — seller listing CRUD
- `GET/PUT/DELETE /seller/listings/:id` — listing management
- `POST /seller/listings/:id/submit` — submit for admin review
- `GET /seller/listings/:id/analytics` — listing analytics
- `GET /admin/dashboard` — admin overview
- `GET /admin/listings` — all listings with filters
- `POST /admin/listings/:id/approve` — approve listing
- `POST /admin/listings/:id/reject` — reject with reason
- `POST /admin/listings/:id/feature` — toggle featured
- `GET/PUT /admin/users` — user management
- `GET /admin/analytics` — platform analytics
- `GET /buyer/favorites`, `POST/DELETE /buyer/favorites/:id` — saved listings
- `GET /buyer/interests` — interest history
- `POST /ai/generate-description` — AI listing description (OpenAI GPT-4o-mini)
- `POST /ai/improve-title` — AI title suggestions
- `POST /ai/suggest-price` — price suggestion from comparables

## Frontend Pages

Public marketplace:
- `/` — Homepage with hero, search, featured listings, stats
- `/imoveis` — Search listings with sidebar filters, pagination, sort
- `/imoveis/mapa` — Map view (Google Maps placeholder)
- `/imoveis/:slug` — Farm detail with gallery, WhatsApp/email CTAs
- `/entrar` — Login
- `/cadastrar` — Register (buyer or seller role)
- `/minha-conta` — Buyer account (favorites, interests)

Seller SaaS:
- `/painel/dashboard` — Stats overview
- `/painel/anuncios` — Own listings table
- `/painel/anuncios/novo` — Create listing form
- `/painel/anuncios/:id` — Edit listing
- `/painel/anuncios/:id/analytics` — Listing analytics
- `/painel/ia` — AI tools

Admin SaaS:
- `/admin/dashboard` — Platform KPIs
- `/admin/anuncios` — Moderation queue
- `/admin/usuarios` — User management
- `/admin/analytics` — Platform analytics

## Business Logic

- Listings require admin approval before publication
- Premium sellers get featured placement, more media, AI tools
- Buyer interest generates WhatsApp redirect with predefined messages
- Analytics tracked per listing (views, source, interest type)
- JWT auth with 15-min access token + 7-day refresh token in httpOnly cookies

## Seed Credentials

All seed accounts use password: `Admin@123`

- Admin: `admin@aaagronegocio.com.br`
- Seller (premium): `joao@fazendas.com.br`
- Seller (standard): `maria@agrofazenda.com.br`
- Buyer: `carlos@comprador.com.br`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (auto-provided by Replit)
- `JWT_SECRET` — Access token secret
- `JWT_REFRESH_SECRET` — Refresh token secret
- `WHATSAPP_NUMBER` — Platform WhatsApp number for buyer redirects
- `BROKER_EMAIL` — Platform email for buyer redirects
- `OPENAI_API_KEY` — For AI features (generate-description, improve-title, suggest-price)
