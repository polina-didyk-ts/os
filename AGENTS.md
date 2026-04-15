# AI Agent Instructions

## Architecture Stack

| Layer            | Technology            | Location                   |
| ---------------- | --------------------- | -------------------------- |
| Frontend         | Next.js 16 App Router | `app/`                     |
| UI Components    | shadcn/ui + Radix UI  | `app/components/ui/`       |
| Styling          | Tailwind CSS v4       | `app/globals.css`          |
| API              | Route Handlers (BFF)  | `app/api/**/route.ts`      |
| Business Logic   | Modular Monolith      | `src/modules/**`           |
| Lambda Functions | AWS Lambda + SST      | `functions/**`             |
| Database         | PostgreSQL + Prisma   | `prisma/schema.prisma`     |
| Auth             | Better Auth           | `src/lib/server/auth.ts`   |
| Infrastructure   | SST Ion (AWS)         | `sst.config.ts`            |
| Logging          | Pino                  | `src/lib/server/logger.ts` |
| Monitoring       | Sentry                | `src/lib/sentry.ts`        |
| Unit Testing     | Vitest                | `**/*.test.ts`             |
| E2E Testing      | Playwright            | `e2e/tests/**`             |
| Package Manager  | Yarn 4                | `yarn.lock`                |

## Constraints

- Route Handlers are thin controllers; business logic lives in services
- No direct Prisma calls from React components
- Use shadcn/ui components for all UI elements
- File names: kebab-case (e.g., `user-profile.dto.ts`)
- Exports: PascalCase for components/types, UPPER_SNAKE_CASE for constants

## Project Structure

```
app/
├── (public)/           # Public pages
├── (auth)/             # Auth pages
├── app/                # Protected pages (/app/*)
├── api/                # API endpoints
└── components/ui/      # shadcn/ui components

src/
├── lib/
│   ├── server/         # Server utilities (prisma, logger, auth, errors, rate-limit, api-handler)
│   └── client/         # Client utilities (auth, analytics, utils)
└── modules/<domain>/   # Feature modules (.service.ts, .dto.ts, .types.ts)

functions/<name>/       # Lambda functions (handler.ts)
e2e/                    # Playwright tests (tests/, pages/, fixtures/)
prisma/                 # Schema and migrations
```

## Route Handlers

Use `apiHandler` wrapper. Return data directly or `NextResponse` for custom status.

```typescript
import { apiHandler, requireSession } from "@/src/lib/server";

export const GET = apiHandler(async () => {
  const session = await requireSession();
  return await service.list(session.user.id);
});

export const POST = apiHandler(async (req) => {
  const session = await requireSession();
  const data = createSchema.parse(await req.json());
  return NextResponse.json(await service.create(data), { status: 201 });
});
```

**Rules:** No Prisma access, no business logic, no inline validation, no try/catch.

## Services & DTOs

```typescript
// src/modules/<domain>/<domain>.service.ts
import { prisma, logger, Errors } from "@/src/lib/server";
const log = logger.child({ module: "<domain>.service" });

export const service = {
  async create(userId: string, data: CreateDto) {
    return prisma.resource.create({ data: { ...data, userId } });
  },
};

// src/modules/<domain>/<domain>.dto.ts
export const createSchema = z.object({ name: z.string().min(1).max(255) });
export type CreateDto = z.infer<typeof createSchema>;
```

**Layering:** `app/**` → `src/modules/**` → `src/lib/**` (no reverse imports)

## Error Handling

```typescript
throw Errors.notFound("Resource");
throw Errors.forbidden("Access denied");
throw Errors.limitReached("resources", 100);
```

## Logging

```typescript
import { logger } from "@/src/lib/server";
const log = logger.child({ module: "mymodule" });
log.info({ userId, action: "delete" }, "Resource deleted");
```

Levels: `error` (failures), `warn` (handled issues), `info` (business events), `debug` (diagnostics)

## Authentication

```typescript
// Server
import { requireSession, getOrganizationContext, requireRole } from "@/src/lib/server";
const session = await requireSession();
const { user, organization, role } = await getOrganizationContext();

// Client
import { useSession, signIn, signOut } from "@/src/lib/client";
```

## Database

Access via `prisma` from `@/src/lib/server`. Use transactions for multi-step operations:

```typescript
return prisma.$transaction(async (tx) => {
  const resource = await tx.resource.create({ data });
  return resource;
});
```

## Testing

**Unit tests:** Colocate as `*.test.ts`, mock Prisma via `vi.mock("@/src/lib/server")`

**E2E tests:** `e2e/tests/**/*.spec.ts` with Page Object Models in `e2e/pages/`

```bash
yarn test:e2e           # Run all
yarn test:e2e:ui        # Debug mode
```

## UI Components

```bash
npx shadcn@latest add <component-name>
```

## Infrastructure

- `sst.aws.Nextjs` for deployment
- `sst.aws.Vpc` with `nat: "ec2"`
- `sst.aws.Postgres` linked to app
- `sst.aws.Function` for background tasks
- Secrets via SST linking, never hardcoded

## Feature Development Workflow

1. **Module:** Create `src/modules/<domain>/`
2. **DTO:** Define schemas in `<domain>.dto.ts`
3. **Service:** Implement in `<domain>.service.ts` with structured logging
4. **Schema:** Add Prisma models, run `yarn prisma migrate dev`
5. **API:** Create Route Handler in `app/api/<domain>/route.ts`
6. **UI:** Build pages:
   - Public: `app/(public)/<page>/page.tsx`
   - Auth: `app/(auth)/<page>/page.tsx`
   - Protected: `app/(app)/<page>/page.tsx` → `/app/<page>`
7. **Components:** Add shadcn/ui as needed
8. **E2E Tests:** Write Playwright tests for critical user flows
   - Add `data-testid` attributes to UI components
   - Create Page Object Models in `e2e/pages/`
   - Write tests in `e2e/tests/<domain>/<feature>.spec.ts`
9. **Validation:** Run all checks before considering the feature complete

## Quality Checklist

**IMPORTANT:** Every feature implementation or refactoring must end with passing the full quality checklist. AI agents must run these checks and fix any issues before considering work complete.

```bash
yarn lint && yarn format && yarn typecheck
yarn test:e2e
```

All checks must pass. If any check fails, fix the errors before finishing the task.
