# E2E Testing with Playwright

End-to-end tests for the application using Playwright. Tests are located in `e2e/` directory.

## Quick Start

```bash
# Ensure Docker Compose database is running
yarn docker:up

# Run all E2E tests
yarn test:e2e

# Run tests with UI (debug mode)
yarn test:e2e:ui

# Run tests with visible browser
yarn test:e2e:headed

# Run specific test file
yarn test:e2e tests/auth/signup

# Run tests matching pattern
yarn test:e2e --grep "create note"
```

## Architecture

### Database Strategy

- **Shared Schema**: All workers use the same PostgreSQL schema (public)
- **Test Isolation**: Tests create unique users via timestamps + random IDs
- **Parallel Execution**: Tests run in parallel without conflicts (4 workers by default)
- **Simple Setup**: No per-worker schema management needed
- **Uses Existing Infrastructure**: Leverages Docker Compose database (port 5433)

### Test Structure

```
e2e/
├── fixtures/          # Reusable test utilities
│   ├── database.ts    # Simple test/expect re-export
│   ├── auth.ts        # Authentication helpers
│   └── test-data.ts   # Test data factories (unique users/notes)
├── pages/             # Page Object Models (POM)
│   ├── auth/          # Auth pages
│   ├── app/           # Protected pages
│   └── components/    # Shared components
└── tests/             # Actual test files
    ├── auth/          # Authentication tests
    └── app/           # Application tests
```

## Writing Tests

### Basic Test Pattern

```typescript
import { test, expect } from "../../fixtures/database";
import { createAuthenticatedUser } from "../../fixtures/auth";
import { MyPage } from "../../pages/my-page";
import { createTestUser } from "../../fixtures/test-data";

test.describe("My Feature", () => {
  test("should do something", async ({ page }) => {
    // Create authenticated user with unique email
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // Use Page Object Model
    const myPage = new MyPage(page);
    await myPage.goto();
    await myPage.doSomething();

    // Assert
    await expect(page.getByText("Success")).toBeVisible();
  });
});
```

### Authentication

**For tests requiring authentication:**

```typescript
import { createAuthenticatedUser } from "../../fixtures/auth";
import { createTestUser } from "../../fixtures/test-data";

test("authenticated test", async ({ page }) => {
  const user = createTestUser(Date.now());
  await createAuthenticatedUser(page, user);

  // Now page is authenticated, can access protected routes
  await page.goto("/app/notes");
});
```

**For tests testing authentication itself:**

```typescript
import { signUp, signIn, signOut } from "../../fixtures/auth";

test("sign up flow", async ({ page }) => {
  const user = createTestUser(Date.now());
  await signUp(page, user);
  // User is now signed up and logged in
});
```

### Page Object Models

Use POMs to encapsulate UI interactions:

```typescript
// e2e/pages/my-feature.page.ts
import { Page, Locator } from "@playwright/test";

export class MyFeaturePage {
  readonly page: Page;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByTestId("submit-button");
  }

  async goto() {
    await this.page.goto("/my-feature");
  }

  async submit() {
    await this.submitButton.click();
  }
}

// In test
const myPage = new MyFeaturePage(page);
await myPage.goto();
await myPage.submit();
```

### Test Data

Use factories for consistent test data:

```typescript
import { createTestUser, createTestNote } from "../../fixtures/test-data";

// Creates unique user with timestamp-based email
const user = createTestUser(Date.now());
// user = { name: "Test User 1234567890", email: "test.user.1234567890@example.com", password: "TestPassword123!" }

// Creates test note
const note = createTestNote(1);
// note = { title: "Test Note 1", content: "This is test note content 1..." }
```

### Selectors

**Prefer data-testid attributes:**

```typescript
// Good - stable
await page.getByTestId("submit-button").click();

// Avoid - brittle
await page.locator("button.btn-primary").click();
await page.getByText("Submit").click(); // Can break with text changes
```

## Test Organization

### File Naming

- `*.spec.ts` - Test files
- `*.page.ts` - Page Object Models
- `*.ts` - Fixtures and utilities

### Test Grouping

```typescript
test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test("should do X", async ({ page }) => {
    // Test X
  });

  test("should do Y", async ({ page }) => {
    // Test Y
  });
});
```

## Performance Tips

### Keep Tests Fast

1. **Minimal Navigation**: Test multiple things on same page load
2. **Use POMs**: Encapsulate complex interactions
3. **Parallel Workers**: Tests run in parallel by default
4. **Avoid Waits**: Use Playwright's auto-waiting instead of fixed waits

### Database Performance

- All workers share the same schema (simple setup)
- Test isolation via unique user emails (timestamp + random)
- Minimal seed data (create only what you need)

## Debugging

### Debug Single Test

```bash
# Run with debugger
yarn test:e2e:debug

# Run specific test with UI
yarn test:e2e:ui tests/auth/signup.spec.ts
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Playwright Debug",
  "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
  "args": ["test", "${file}", "--debug"],
  "console": "integratedTerminal"
}
```

### Common Issues

**Database connection errors:**

- Ensure Docker Compose is running: `yarn docker:up`
- Check database is accessible: `psql -h localhost -p 5433 -U postgres -d ts_web_starter_dev`

**Tests failing randomly:**

- Check for race conditions
- Verify test isolation (no shared state between tests)
- Ensure proper waits (use Playwright's auto-waiting)

**Slow tests:**

- Check for unnecessary `page.waitForTimeout()` calls
- Use parallel execution (`fullyParallel: true`)
- Optimize database operations

## CI/CD

Tests run automatically in GitHub Actions on:

- Pull requests
- Pushes to main branch

See `.github/workflows/ci-e2e.yml` for configuration.

## Best Practices

### DO

✅ Use `data-testid` attributes for selectors
✅ Use Page Object Models for complex interactions
✅ Create unique test data per test
✅ Keep tests independent (no shared state)
✅ Use factories for test data
✅ Test user flows, not implementation details

### DON'T

❌ Hard-code test data (use factories)
❌ Share state between tests
❌ Use brittle selectors (CSS classes, text)
❌ Make tests depend on execution order
❌ Test implementation details
❌ Use fixed waits (`page.waitForTimeout`)

## Adding Tests for New Features

When adding a new feature, follow this pattern:

1. **Add test IDs** to UI components (`data-testid`)
2. **Create Page Object** in `e2e/pages/`
3. **Write test factories** in `e2e/fixtures/test-data.ts` if needed
4. **Write tests** in `e2e/tests/`
5. **Run tests** to verify: `yarn test:e2e`

Example:

```typescript
// 1. Add test ID to component
<button data-testid="delete-button">Delete</button>

// 2. Create Page Object
export class MyPage {
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.deleteButton = page.getByTestId("delete-button");
  }

  async delete() {
    await this.deleteButton.click();
  }
}

// 3. Write test
test("should delete item", async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.delete();
  await expect(page.getByText("Deleted")).toBeVisible();
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Debugging Tests](https://playwright.dev/docs/debug)
