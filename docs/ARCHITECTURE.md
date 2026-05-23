# Architecture

## Monorepo Layout

```text
apps/
  web/                 Next.js App Router application
  api/                 NestJS REST API and Prisma schema
docs/                  Delivery, API, and roadmap documentation
docker-compose.yml     Local PostgreSQL
```

## Frontend Architecture

- `app/`: public routes, admin routes, SEO metadata, sitemap, robots.
- `components/`: layout, homepage sections, property UI, admin dashboard widgets, reusable UI primitives.
- `services/`: API clients and server-safe fetch wrappers.
- `lib/`: analytics, constants, utilities, demo data.
- `types/`: shared frontend contracts.

The web app is designed for server-rendered discovery pages and client-side interaction where it matters: filters, forms, dashboards, media galleries, dark mode, and future saved-property flows.

## Backend Architecture

The API uses feature modules:

- `AuthModule`: login, JWT issuance, password hashing, guards.
- `UsersModule`: admin/user lifecycle and role management.
- `PropertiesModule`: search, filtering, CRUD, media relations.
- `EnquiriesModule`: contact/callback/property interest submissions.
- `SiteVisitsModule`: scheduled visit requests.
- `AgentsModule`: sales representative management.
- `BlogModule`: market insights and SEO articles.
- `UploadsModule`: S3 signed upload/delete flow.
- `AnalyticsModule`: event ingestion and admin aggregates.

Common cross-cutting concerns live under `src/common`: role decorators, guards, exception filters, and interceptors.

## Authentication Flow

1. Admin signs in with email/password.
2. API validates bcrypt password hash.
3. API returns a JWT with `sub`, `email`, and `role`.
4. Frontend stores the token in an HTTP-only cookie in production or a secure session adapter.
5. Protected API endpoints require `JwtAuthGuard` and `RolesGuard`.

Roles: `SUPER_ADMIN`, `ADMIN`, `SALES_MANAGER`, `SALES_AGENT`.

## AWS S3 Upload Flow

1. Admin requests a signed upload URL from `POST /api/uploads/presign`.
2. API validates file type, role, size intent, and target folder.
3. API returns a short-lived PUT URL and final public/CDN URL.
4. Frontend uploads directly to S3.
5. Frontend persists the returned media URL on property/blog records.
6. Deletes call `DELETE /api/uploads` to remove from S3 and clean database references.

Suggested S3 folder layout:

```text
properties/{propertyId}/gallery/
properties/{propertyId}/floor-plans/
properties/{propertyId}/brochures/
projects/{projectId}/videos/
blogs/{blogId}/covers/
```

## Analytics

Google Analytics is initialized in `apps/web/lib/analytics.tsx`. Public interactions call GA events for page views, property views, searches, enquiries, site visits, brochure downloads, and WhatsApp clicks. Backend analytics endpoints are available for internal conversion aggregation and CRM forwarding.
