# Production Deployment Guide

Yes! The project is **100% ready for deployment**. All core features, security protocols, routing structures, database models, and file storage systems (via UploadThing) are fully integrated and verified.

This guide provides step-by-step instructions to deploy your PostgreSQL database, NestJS backend API, and Next.js frontend to production.

---

## Part 1: Provision the Database (PostgreSQL)

You can use any managed PostgreSQL provider (such as **Neon**, **Supabase**, or **Render Databases**). **Neon** is highly recommended for its ease of use.

1. Sign up at [Neon.tech](https://neon.tech/) or [Supabase.com](https://supabase.com/) and create a new project.
2. Create a new PostgreSQL database (e.g., `luxury_estate`).
3. Copy the **Connection String** (URI format):
   `postgresql://user:password@hostname:5432/dbname?sslmode=require`
4. Keep this connection string ready; you will need to add it to your NestJS backend environment as `DATABASE_URL`.

---

## Part 2: Deploy the Backend API (NestJS)

You can deploy the backend to hosting platforms like **Render**, **Railway**, or a **VPS** (e.g. DigitalOcean). 

Here is how to deploy on **Render.com**:

1. Log in to Render and click **New +** ➔ **Web Service**.
2. Connect your Git repository.
3. Configure the Web Service settings:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `node dist/main`
4. Click **Advanced** and add the following **Environment Variables**:
   * `NODE_ENV`: `production`
   * `PORT`: `4000` (or leave it to Render's default)
   * `DATABASE_URL`: *Your PostgreSQL Connection String (from Part 1)*
   * `JWT_SECRET`: *Generate a strong secret (run `openssl rand -base64 32` in terminal)*
   * `JWT_EXPIRES_IN_SECONDS`: `604800` (7 days)
   * `CORS_ORIGIN`: *Your production frontend URL (e.g., `https://yourdomain.com`)*
   * `UPLOADTHING_SECRET`: *Your UploadThing API secret key*
   * `UPLOADTHING_APP_ID`: *Your UploadThing App ID*
5. Click **Deploy Web Service**.
6. **Run Database Migrations & Seed**:
   Once the service is active, go to Render's service shell/console (or run it locally by pointing your local `.env`'s `DATABASE_URL` to your production database) and run:
   ```bash
   npx prisma db push --schema prisma/schema.prisma
   npm run seed
   ```
   *(This creates the database tables and initializes the default admin user: `admin@investoproperties.com` with password `Admin@12345`).*

---

## Part 3: Deploy the Frontend (Next.js)

The Next.js frontend should be deployed on **Vercel** for optimal performance, edge-rendering, and global CDN caching.

1. Log in to [Vercel.com](https://vercel.com/) and click **Add New** ➔ **Project**.
2. Import your Git repository.
3. Configure the Project settings:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `frontend` (Vercel will build this folder)
   * **Build Command**: `next build` (default)
   * **Output Directory**: `.next` (default)
4. Add the following **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: *Your deployed Render backend URL (e.g., `https://your-backend.onrender.com/api`)*
   * `NEXT_PUBLIC_SITE_URL`: *Your production frontend domain (e.g., `https://yourdomain.com`)*
   * `NEXT_PUBLIC_GA_MEASUREMENT_ID`: *Your Google Analytics ID (optional, e.g. `G-XXXXXXXXXX`)*
   * `UPLOADTHING_SECRET`: *Your UploadThing API secret key*
   * `UPLOADTHING_APP_ID`: *Your UploadThing App ID*
5. Click **Deploy**. Vercel will build the frontend and provide you with a production URL (e.g. `https://your-project.vercel.app`).

---

## Part 4: Post-Deployment Steps

1. **Test Login**:
   * Go to `https://yourdomain.com/login`.
   * Log in with `admin@investoproperties.com` and `Admin@12345`.
   * Go to the **Users** tab and immediately change your password or create a new Super Admin account, and disable the seed account for safety.
2. **Test File Uploads**:
   * In the admin dashboard, upload a property image or brochure.
   * Verify it saves successfully, indicating that UploadThing and your PostgreSQL database are communicating correctly.
3. **Verify Public Pages**:
   * Visit the homepage and your property detail pages. Verify that images render properly and the **"Download brochure"** button links directly to the uploaded UploadThing files.
