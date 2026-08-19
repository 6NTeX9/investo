# Luxury Real Estate Platform

Production-ready monorepo for a premium real estate marketplace inspired by the UX quality of AX Capital: a public property discovery site, secure admin CMS, NestJS REST API, PostgreSQL/Prisma data layer, AWS S3 media flow, and Google Analytics tracking.

## Stack

- `frontend`: Next.js App Router, React, Tailwind CSS, TanStack Query-ready service layer, Zod-friendly forms, Lucide icons, SEO routes.
- `backend`: NestJS, Prisma, PostgreSQL, JWT auth, RBAC, DTO validation, Swagger, Helmet, CORS, rate limiting, S3 signed uploads.
- `docs`: architecture, API, deployment, and roadmap references.

## Quick Start

```bash
cp .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Live link: `https://www.bricksnbeyond.in`

## Apps

- Public website: homepage, property search, property details, project categories, blog, contact CTAs.
- Admin dashboard: analytics overview, property/enquiry management shells, role-aware API foundation.
- API modules: auth, users, properties, enquiries, site visits, agents, blogs, uploads, analytics.

See [Architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [Deployment](docs/DEPLOYMENT.md), and [Roadmap](docs/ROADMAP.md).
