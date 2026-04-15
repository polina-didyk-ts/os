# TypeScript Web Application

[![CI - Checks](https://github.com/tech-stack-dev/ts-web-starter/actions/workflows/ci-checks.yml/badge.svg)](https://github.com/tech-stack-dev/ts-web-starter/actions/workflows/ci-checks.yml)
[![CI - E2E](https://github.com/tech-stack-dev/ts-web-starter/actions/workflows/ci-e2e.yml/badge.svg)](https://github.com/tech-stack-dev/ts-web-starter/actions/workflows/ci-e2e.yml)
[![CD](https://github.com/tech-stack-dev/ts-web-starter/actions/workflows/cd.yml/badge.svg)](https://github.com/tech-stack-dev/ts-web-starter/actions/workflows/cd.yml)

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)
![Playwright](https://img.shields.io/badge/Playwright-1.57-45ba4b?logo=playwright)

Full-stack TypeScript web application built with Next.js 16, PostgreSQL, and AWS infrastructure.

## Tech Stack

Next.js 16 (App Router) | shadcn/ui | Tailwind CSS v4 | PostgreSQL + Prisma | Better Auth | SST Ion (AWS) | Vitest | Playwright | Pino | Sentry

## Quick Start (Local Development)

```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env

# Start PostgreSQL
yarn docker:up

# Initialize database
yarn db:generate && yarn db:migrate

# Start development server
yarn dev
```

Visit http://localhost:3000

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
app/                  # Next.js app directory
├── (public)/        # Public pages
├── (auth)/          # Auth pages
├── app/             # Protected pages
├── api/             # API endpoints
└── components/      # React components

src/
├── lib/             # Shared utilities
└── modules/         # Feature modules

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Migration history

e2e/
├── tests/           # Playwright E2E tests
└── pages/           # Page Object Models
```

## Documentation

| Document                                             | Description                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| **[docs/PROJECT_SETUP.md](./docs/PROJECT_SETUP.md)** | Complete setup guide for new environments (AWS, GitHub, SST secrets, deployment) |
| [AGENTS.md](./AGENTS.md)                             | Architecture documentation and coding conventions                                |
| [docs/AWS_OIDC_SETUP.md](./docs/AWS_OIDC_SETUP.md)   | AWS OIDC configuration for GitHub Actions                                        |
| [docs/E2E_TESTING.md](./docs/E2E_TESTING.md)         | Playwright E2E testing documentation                                             |
