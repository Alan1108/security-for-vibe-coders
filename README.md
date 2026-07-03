# BookMe — Calendar Booking Workshop App

A Turborepo monorepo with a Next.js frontend and Express API for sharing availability and accepting public appointment bookings.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

## Quick start

```bash
# Install dependencies
pnpm install

# Set up the database and seed demo data
pnpm run db:push
pnpm run db:seed

# Start frontend (port 3000) and API (port 4004)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo account

After seeding, you can log in with:

| Field | Value |
|-------|-------|
| Email | `owner@workshop.local` |
| Password | `password123` |
| Public booking link | [http://localhost:3000/book/demo](http://localhost:3000/book/demo) |

## Project structure

```
apps/
  web/          Next.js frontend — booking pages & owner dashboard
  api/          Express REST API — auth, availability, appointments
packages/
  shared/       Shared TypeScript types and Zod schemas
  typescript-config/
  eslint-config/
```

## Environment variables

Copy the example env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env   # if present
```

Root `.env.example` documents shared variables. The API reads from `apps/api/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `JWT_SECRET` | — | Secret for signing auth tokens |
| `PORT` | `4004` | API server port |

The web app uses `apps/web/.env.local`:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4004` | API base URL |

## Available scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm run db:push` | Push Prisma schema to SQLite |
| `pnpm run db:seed` | Seed demo owner and availability |

## Features

- **Owner registration & login** — create an account and manage your calendar
- **Weekly availability** — set recurring hours and slot duration
- **Public booking page** — share `/book/your-slug` for self-service scheduling
- **Dashboard** — view, search, and cancel upcoming appointments

## Tech stack

- [Turborepo](https://turbo.build/) — monorepo orchestration
- [Next.js 15](https://nextjs.org/) — React frontend (App Router)
- [Express 5](https://expressjs.com/) — REST API
- [Prisma](https://www.prisma.io/) + SQLite — persistence
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Zod](https://zod.dev/) — shared validation schemas

## License

MIT — for workshop and educational use.
