# TS Digital Office

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)
![Playwright](https://img.shields.io/badge/Playwright-1.57-45ba4b?logo=playwright)

Internal web application for managing office requests at Techstack. Employees open the app via QR code, sign in with their @tech-stack.io Google account and and submit requests — orders, problems, questions, or ideas. The office manager reviews and processes them through an admin panel. Full-stack TypeScript built with Next.js 16, PostgreSQL, and AWS infrastructure.

Access is restricted to `@tech-stack.io` accounts. Sign in via Google OAuth or email/password.

## How It Works

- **Employees** sign in via Google OAuth, submit requests, and track their status
- **Manager** reviews all requests, changes statuses, and leaves comments
- Requests flow through statuses: `New → In Progress → Done / Rejected`

## User Roles

| Role       | How assigned                     | Access        |
| ---------- | -------------------------------- | ------------- |
| `employee` | Default for all new users        | `/employee/*` |
| `admin`    | Manually via DB or Prisma Studio | `/admin/*`    |

To assign admin role: open Prisma Studio (`yarn db:studio`), find the user in the `User` table and set `role` to `admin`.

## Tech Stack

Next.js 16 (App Router) | shadcn/ui | Tailwind CSS v4 | PostgreSQL + Prisma | Better Auth | SST Ion (AWS) | Vitest | Playwright | Pino | Sentry

## Quick Start (Local Development)

```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env.local

# Start PostgreSQL
yarn docker:up

# Initialize database
yarn db:generate && yarn db:migrate

# Start development server
yarn dev
```

Visit http://localhost:3000/employee/signin

## Commands

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `yarn dev`        | Start development server     |
| `yarn build`      | Build for production         |
| `yarn lint`       | Lint and auto-fix code       |
| `yarn typecheck`  | TypeScript type checking     |
| `yarn test`       | Run unit tests (watch mode)  |
| `yarn test:e2e`   | Run Playwright E2E tests     |
| `yarn db:migrate` | Create and apply migrations  |
| `yarn db:studio`  | Open Prisma Studio           |
| `yarn docker:up`  | Start PostgreSQL with Docker |

## Project Structure

```
app/
├── employee/        # Employee cabinet
│   ├── (auth)/      # Sign in page
│   ├── components/  # EmployeeHeader, SideMenu, forms, BottomNavigation
│   ├── page.tsx     # Dashboard
│   ├── requests/    # Requests list + details
│   └── profile/     # Profile page
├── admin/           # Manager cabinet
│   ├── components/  # AdminHeader, SideMenu, BottomNavigation
│   ├── page.tsx     # Dashboard with stats
│   ├── requests/    # All requests + details
│   └── profile/     # Profile page
└── api/             # API endpoints
src/
├── lib/             # Prisma, auth, logger, utils
└── modules/         # Business logic (requests, comments, organizations)
prisma/
├── schema.prisma    # Database schema
└── migrations/      # Migration history
e2e/
├── fixtures/        # auth.ts, test-data.ts
├── pages/           # Page Object Models
└── tests/           # Playwright E2E tests
```

## Documentation

| Document                                             | Description                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| **[docs/PROJECT_SETUP.md](./docs/PROJECT_SETUP.md)** | Complete setup guide for new environments (AWS, GitHub, SST secrets, deployment) |
| [AGENTS.md](./AGENTS.md)                             | Architecture documentation and coding conventions                                |
| [docs/AWS_OIDC_SETUP.md](./docs/AWS_OIDC_SETUP.md)   | AWS OIDC configuration for GitHub Actions                                        |
| [docs/E2E_TESTING.md](./docs/E2E_TESTING.md)         | Playwright E2E testing documentation                                             |
