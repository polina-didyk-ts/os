# Digital Office — Project Context

## Product
Internal corporate portal for Techstack. Employees submit requests to the office manager, admin processes them and communicates with the team.

## Live
- URL: https://digital-office-eta.vercel.app
- Deploy: Vercel
- Repository: github.com/tech-stack-dev/ts-digital-office
- Personal mirror: github.com/polinadidyk/os

## Access

| Role | Sign-in | URL |
|------|---------|-----|
| Employee | Google OAuth (@tech-stack.io) | /employee/signin |
| Admin | Google OAuth | /employee/signin → auto-redirect to /admin |

Admins: os@tech-stack.io, olha.kokoshka@tech-stack.io

## Auth Callback Routing
`/auth/callback` is the intermediate page after Google OAuth:
- `admin` role → redirects to `/admin`
- other roles → redirects to `/employee`

Useful to know when debugging auth issues.

## Employee Features (/employee)
- Submit 4 types of requests: Order, Problem, Question, Idea/Feedback
- Each request has priority (Low / Medium / High) and unique ticket number (e.g. 2026-001)
- View own requests with filtering and sorting
- Email notifications on status change or admin comment (subject, type, priority, date, full request info)
- Request statuses: New → In Progress → Done / Rejected

## Admin Features (/admin)
- Dashboard — statistics by status (New / In Progress / Done / Rejected), recent requests (clickable)
- Requests — list of all requests with filtering, status changes, admin comments
- Announcements — mass email broadcasts: select recipients from multiselect or enter manually, subject + plain text message
- Email notifications on every new request from employee (sent to both admin emails) with View button linking directly to the request

## Email Flows
Three separate email scenarios:
1. **To employee** — on status change or admin comment on their request
2. **To admins** — on every new request from employee (sent to all addresses in `ADMIN_EMAIL`)
3. **Announcements** — sent individually to each recipient (not CC/BCC)

All emails use the same visual style: dark header, yellow accent (#FFC600), Digital Office branding.

> **Gmail SMTP limit:** ~500 emails/day. For Announcements with large recipient lists this can be hit quickly. No rate-limiting is implemented in the app currently.

## Request Metadata Schema
Each request type stores different fields in JSON `metadata`:
- `order` → `{ what, quantity, comment }`
- `problem` → `{ what, description, comment }`
- `question` → `{ question }`
- `idea` → `{ idea }`

## Tech Stack
- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- Backend: Route Handlers (BFF), PostgreSQL + Prisma 7
- Auth: Better Auth + Google OAuth (restricted to @tech-stack.io)
- Email: Gmail SMTP via Nodemailer
- Testing: Playwright (e2e, 5/5 passing), Vitest (unit)
- Monitoring: Pino logger, Sentry configured but not active
- Package manager: Yarn 4

## Environment Variables
Required in `.env.local` (local dev) and Vercel dashboard (production):

```
DATABASE_URL
BETTER_AUTH_SECRET
NEXT_PUBLIC_BETTER_AUTH_URL
BETTER_AUTH_TRUSTED_ORIGINS
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
ADMIN_EMAIL
```

Notes:
- `ADMIN_EMAIL` is a comma-separated string for multiple admin addresses (e.g. `os@tech-stack.io,olha.kokoshka@tech-stack.io`)
- `NEXT_PUBLIC_BETTER_AUTH_URL` is embedded at build time — after changing it in Vercel, a redeploy is required (saving the variable alone is not enough)

## Gmail App Password — Operational Note
The Gmail App Password used for SMTP can be revoked by Google without warning.
If email sending breaks:
1. Go to Google Account → Security → 2-Step Verification → App passwords
2. Generate a new App Password
3. Update `GMAIL_APP_PASSWORD` in both Vercel environment variables and local `.env.local`
4. Redeploy with `vercel --prod`

## Google Cloud Console
When changing the domain or adding a new URL — add redirect URI in Google Cloud Console:
```
{APP_URL}/api/auth/callback/google
```

## Database

Local dev:
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ts_digital_office_dev`
- Docker container: ts-digital-office, port 5433

Production (corporate RDS):
- Host: ts-engineering-db.czy8g0oocyvj.eu-central-1.rds.amazonaws.com
- Database: ts_engineering_db
- Schema: ts_digital_office

## Role Management
There is no UI for granting or revoking admin access. Do it directly via the database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'user@tech-stack.io';
```

Or via Prisma Studio: `yarn db:studio`

## Key Business Rules
- Admin sees ALL requests (intentional single-tenant design)
- Admin can leave comments at any status
- Comments from admin visible to the requesting employee
- Ticket numbers generated with pg_advisory_xact_lock to prevent race conditions
- Role checks always via `requireRole()` — never raw `session.user.role`
- IDOR protection: `getByIdForUser(userId, id)` for employees, `getByIdForAdmin(id)` for admins
- Login restricted to @tech-stack.io Google accounts

## Workflow Rule
Always test locally first (`yarn dev`), then deploy to Vercel (`vercel --prod`).
Never deploy untested changes directly to production.

## Current Status
Active testing phase:
- Wrocław office — testing in progress (Polina as admin)
- Lviv office — onboarding for testing
- Collecting feedback iteratively, fixing bugs as they come

## Planned UX Improvements
- Office/Location filtering for multi-office support
- Location field on request form (Office / Remote)

## Important Commands
```bash
yarn docker:up          # start PostgreSQL
yarn db:migrate         # apply migrations (dev)
yarn prisma migrate deploy  # apply migrations (prod, no shadow DB)
yarn db:studio          # open Prisma Studio
yarn dev                # local development
yarn build              # production build
yarn test:e2e           # run Playwright tests
vercel --prod           # deploy to production
```
