# Deployment Strategy

## Frontend: Vercel

1. Create a Vercel project from the repository.
2. Set root directory to `apps/web`.
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy with the default Next.js build command.

## Backend: Railway or Render

1. Create a Node.js service with root directory `apps/api`.
2. Set build command: `npm install && npm run prisma:generate && npm run build`.
3. Set start command: `npm run start:prod`.
4. Add environment variables from `.env.example`.
5. Run migrations during release: `npx prisma migrate deploy`.

## Database

Use managed PostgreSQL. Enable backups, connection pooling, and a private network where supported.

## Storage

Use AWS S3 with CloudFront in production. Keep the bucket private and serve public media through signed uploads plus CDN URLs.

## CI/CD

The included GitHub Actions workflow installs dependencies, generates Prisma client, lints, and builds both apps.
