# API Structure

Base URL: `/api`

## Auth

- Admin login is handled by Supabase Auth using `signInWithPassword`.
- `GET /auth/me` - current authenticated admin/user resolved from the Supabase session token.

## Properties

- `GET /properties` - paginated search with filters.
- `GET /properties/featured` - featured homepage projects.
- `GET /properties/:slug` - property details.
- `POST /properties` - create property, admin roles.
- `PATCH /properties/:id` - update property, admin roles.
- `DELETE /properties/:id` - delete property, super/admin roles.

Query filters:

- `city`
- `location`
- `minPrice`
- `maxPrice`
- `type`
- `bedrooms`
- `status`
- `amenities`
- `sort`
- `page`
- `limit`
- `q`

## Enquiries

- `POST /enquiries` - public enquiry submission.
- `GET /enquiries` - admin list.
- `PATCH /enquiries/:id/status` - update status/assignment.

## Site Visits

- `POST /site-visits` - public schedule request.
- `GET /site-visits` - admin list.
- `PATCH /site-visits/:id/status` - approve/reschedule/complete/cancel.

## Agents

- `GET /agents` - public agent list.
- `POST /agents` - create agent.
- `PATCH /agents/:id` - update agent.

## Blog

- `GET /blog` - published articles.
- `GET /blog/:slug` - article detail.
- `POST /blog` - create article.
- `PATCH /blog/:id` - update article.

## Uploads

- `POST /uploads/presign` - signed S3 upload URL.
- `DELETE /uploads` - delete S3 object.

## Analytics

- `POST /analytics/events` - conversion/event ingestion.
- `GET /analytics/dashboard` - admin dashboard metrics.
