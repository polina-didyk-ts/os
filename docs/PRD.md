# TS Digital Office — Product Requirements Document

> **Version:** 1.0 | **Updated:** 2026-09-30 | **Status:** Active Testing
>
> Live artifact: https://claude.ai/code/artifact/b1547d6a-c192-4c01-89a8-539222e0d198

---

## 1. Product Overview

TS Digital Office is an internal web application for Techstack employees. Employees submit office requests and read company content; office managers process those requests through an admin panel.

- **Live URL:** https://digital-office-eta.vercel.app
- **Access:** Restricted to `@tech-stack.io` Google accounts
- **Status:** Active testing — Wrocław (Polina as admin) + Lviv onboarding

---

## 2. User Roles

| Role | Assignment | Access | Key Capability |
|------|-----------|--------|----------------|
| `employee` | Default for all new users | `/employee/*` | Submit requests, read articles, receive announcements |
| `admin` | Manual via DB / Prisma Studio | `/admin/*` | Process all requests, publish articles, send announcements |

Current admins: `os@tech-stack.io`, `olha.kokoshka@tech-stack.io`

To assign admin:
```sql
UPDATE "users" SET role = 'admin' WHERE email = 'user@tech-stack.io';
```

---

## 3. Authentication

- Provider: Better Auth + Google OAuth
- Domain restriction: `@tech-stack.io` only
- Callback routing: `/auth/callback` → admin → `/admin`, employee → `/employee`
- Google Cloud Console: add `{APP_URL}/api/auth/callback/google` as redirect URI when changing domain

---

## 4. Employee Portal (`/employee`)

### 4.1 Dashboard

- Personalized greeting (first name + Stacky mascot)
- **Portal Highlights** — latest articles widget with "View all" link
- **Quick Actions** — 4 request type cards linking to `/employee/requests/new?type=...`
- Bottom navigation + collapsible sidebar (desktop)

### 4.2 Request Submission (`/employee/requests/new`)

4 request types, each with its own form:

| Type | Required Fields | Optional Fields |
|------|----------------|-----------------|
| Order | what, quantity (1–100) | comment (500 ch) |
| Problem | what | description (1000 ch), comment (500 ch) |
| Question | question (1000 ch) | — |
| Idea / Feedback | idea (500 ch) | — |

All forms:
- Priority selector: Low / Medium / High (glass capsule buttons, color-coded selected ring)
- Inline validation + shake animation on error
- Success screen with generated ticket number (format: `YYYY-NNN`, e.g. `2026-001`)
- Ticket numbers generated with `pg_advisory_xact_lock` to prevent race conditions

### 4.3 My Requests (`/employee/requests`)

- Lists only the logged-in employee's requests
- Filtering + sorting
- Detail view at `/employee/requests/[id]`: metadata, admin comments, status history
- Employee notified by email on status change or admin comment

**Status lifecycle:** `New → In Progress → Done` or `New → In Progress → Rejected`

### 4.4 Articles Blog (`/employee/articles`)

- Category filter chips: All / News / Guides / Office Life / Events
- Featured article renders as full-width hero card
- Regular cards: cover image, excerpt, publication date
- Skeleton loading state
- Article detail at `/employee/articles/[slug]`:
  - TipTap WYSIWYG content (inline images with float, person-quote blocks)
  - Cover image, title, author name, publication date, read time in header
  - Like button (glass pill, heart icon + count, persisted per user)
  - Comments (visible to all employees, count shown in header)

### 4.5 Announcements (`/employee/announcements`)

- List of announcements from admin
- Unread count badge in bottom navigation
- Mark all as read action

### 4.6 Profile (`/employee/profile`)

- Name, email, avatar (from Google)
- Editable bio field

---

## 5. Admin Panel (`/admin`)

### 5.1 Dashboard

- 4 stat tiles: New / In Progress / Done / Rejected counts
- Recent requests list with direct links

### 5.2 Requests Management (`/admin/requests`)

- ALL requests across all employees
- Filter by type, status, priority; sortable
- Detail at `/admin/requests/[id]`:
  - Change status at any point
  - Leave admin comments (visible to employee)
  - Email notification sent to employee on each change

### 5.3 Articles Management (`/admin/articles`)

- List: published + draft articles
- Editor at `/admin/articles/new` and `/admin/articles/[id]`:
  - TipTap WYSIWYG (bold, italic, headings, lists, links)
  - Inline image insertion with float positioning (none / left / right) via hover toolbar
  - Custom person-quote block
  - Metadata: title, slug, excerpt, cover image upload, category, tags, author name, read time
  - Publish / Draft toggle, Featured flag, published date on first publish

### 5.4 Announcements (`/admin/announcements`)

- Subject + plain-text message body
- Recipient picker (multi-select: all employees or custom subset)
- Each recipient gets an individual email (not CC/BCC)
- ⚠️ Gmail SMTP limit: ~500 emails/day — no in-app rate limiting

### 5.5 Profile (`/admin/profile`)

- Admin user info

---

## 6. Email Notifications

Transport: Gmail SMTP via Nodemailer. Template: dark header `#141414`, yellow accent `#FFC600`.

| Trigger | Recipients | Content |
|---------|-----------|---------|
| New request submitted | All `ADMIN_EMAIL` addresses | Type, priority, ticket number, direct link |
| Status change or admin comment | Request author | New status, comment text |
| Announcement | Selected recipients | Subject + message body |

**Gmail App Password recovery:** Google Account → Security → 2-Step Verification → App passwords → generate new → update `GMAIL_APP_PASSWORD` in Vercel env → redeploy.

---

## 7. Data Model

| Model | Key Fields | Notes |
|-------|-----------|-------|
| User | id, email, name, role, image, bio | role defaults to `"user"` |
| Request | ticketNumber, type, priority, status, metadata (JSON) | metadata shape differs per type |
| Comment | requestId, authorId, text | Admin ↔ employee thread on requests |
| Article | title, slug, content (JSON), coverImage, category, tags[], readTime, featured, published, authorName | content is TipTap JSON |
| ArticleLike | articleId, userId | unique per pair |
| ArticleComment | articleId, authorId, content | employee comments on articles |
| Announcement | subject, message | created by admin |
| AnnouncementRecipient | announcementId, userId, readAt | readAt null = unread |

---

## 8. Design System

### Fonts

| Variable | File | Coverage | Usage |
|----------|------|----------|-------|
| `font-grotesk` | NHaasGroteskDSPro-65Md | Latin only | Headings, labels, UI |
| `font-techstack` | Techstack-55Roman | Cyrillic only | Body, Ukrainian copy |

⚠️ **Font gap:** No Regular weight for NHaasGroteskDSPro — English in titles appears bolder than Ukrainian. Fix requires `NHaasGroteskDSPro-55Rg.otf`.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Foreground | `#141414` | Text, icons, avatar bg |
| Background | `#F2F2F2` | Page background |
| Accent | `#FFC600` | Highlights, focus rings |
| CTA Orange | `#F97316` | Submit buttons, active states |
| Success | `#10B981` | Done status, positive states |
| Destructive | `#EF4444` | Errors, delete, reject |

### Key Patterns

- **Glass card:** `bg-white/28 backdrop-blur-xl border border-white/15` + shadow
- **Glass pill button:** Multi-layer inset box-shadows (white top highlight, dark bottom, outer dark ring 0.5px)
- **Orange CTA:** `linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)` with hover lift + glow
- **Icons:** Lucide React — `w-3.5 h-3.5` for nav, `w-4 h-4` for actions; no unicode arrow characters
- **Priority rings:** green `rgba(74,222,128)`, amber `rgba(251,191,36)`, red `rgba(239,68,68)`

---

## 9. Infrastructure

| Layer | Technology |
|-------|-----------|
| Hosting | Vercel (digital-office-eta.vercel.app) |
| DB (prod) | AWS RDS PostgreSQL — ts-engineering-db.czy8g0oocyvj.eu-central-1.rds.amazonaws.com, schema: ts_digital_office |
| DB (local) | Docker on port 5433 (`yarn docker:up`) |
| Auth | Better Auth + Google OAuth |
| Email | Gmail SMTP via Nodemailer |
| ORM | Prisma 7 WASM + PrismaPg adapter (output: prisma/generated/) |
| Framework | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 |
| Git remotes | `work` → tech-stack-dev/ts-digital-office; `vercel-repo` → polina-didyk-ts/os |

### Deploy Workflow

```
git push work feature/articles-portal   # push to team repo
# test locally
git push vercel-repo feature/articles-portal:main   # deploy to prod
```

⚠️ **Never** use `vercel --prod`. Use Dashboard Redeploy or `vercel promote` to fix env vars.

### Required Env Vars

```
DATABASE_URL
BETTER_AUTH_SECRET
NEXT_PUBLIC_BETTER_AUTH_URL      # embedded at build time — redeploy required after change
BETTER_AUTH_TRUSTED_ORIGINS
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
ADMIN_EMAIL                       # comma-separated list
```

### Database Migrations

- Dev: `yarn db:migrate`
- Prod: `prisma migrate deploy` (no shadow DB)
- Drift fix: `prisma migrate resolve --applied <migration-name>`
- **Never create tables manually in prod**

---

## 10. Known Limitations & Roadmap

### Known Limitations

| Issue | Details |
|-------|---------|
| Email rate limit | Gmail ~500/day; no in-app throttling for announcements |
| Font coverage gap | No Regular weight for NHaasGroteskDSPro (English in titles looks bolder) |
| Admin role management | No UI — requires direct DB access |
| Single-office design | No per-office filtering |

### Planned Features

- Threaded replies on article comments (parentId on ArticleComment)
- Office / Location filtering for multi-office support
- Location field on request forms (Office / Remote)
- Admin role management UI
- Email rate limiting for large announcement batches
