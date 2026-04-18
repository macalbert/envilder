# Testing Stack: TypeScript (Frontend & IaC)

Libraries and tools for testing Next.js frontend and AWS CDK infrastructure code.

## Libraries

| Category | Library | Purpose |
| -------- | ------- | ------- |
| **Framework** | Jest | Test runner and assertions |
| **Component testing** | @testing-library/react | React component testing |
| **DOM testing** | @testing-library/dom | DOM queries and utilities |
| **DOM matchers** | @testing-library/jest-dom | Custom DOM matchers (`toBeInTheDocument`) |
| **E2E** | Playwright | End-to-end browser tests |
| **Linter** | Biome | Linter and formatter (replaces ESLint + Prettier) |

## Test Types

| Type | Tools | Context |
| ---- | ----- | ------- |
| Unit (frontend) | Jest + @testing-library/react | Components, hooks, stores |
| Unit (IaC) | Jest (snapshot) | CDK stack assertions |
| E2E | Playwright | Full Docker Compose stack |

## Jest Assertions

```typescript
expect(actual).toBe(expected);
expect(actual).toEqual(expected);
expect(actual).toBeTruthy();
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
expect(mockFn).toHaveBeenCalledTimes(1);
expect(() => action()).toThrow(Error);
await expect(asyncAction()).rejects.toThrow("message");
```

## @testing-library/react

```typescript
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// Query by role (preferred)
const button = screen.getByRole("button", { name: /submit/i });
const input = screen.getByRole("textbox", { name: /email/i });
const checkbox = screen.getByRole("checkbox", { name: /remember/i });

// Query by text
const heading = screen.getByText(/welcome/i);

// Interactions
fireEvent.click(button);

// Async state updates (Chakra UI / zag-js)
await act(async () => {
    fireEvent.click(checkbox);
});

// Wait for async results
await waitFor(() => {
    expect(screen.getByText("Success")).toBeInTheDocument();
});
```

## Jest Mocks

```typescript
// Module mock
jest.mock("@/hooks/use-auth.hook", () => ({
    useAuth: jest.fn(),
}));

// Mock return value
const mockLogin = jest.fn();
(useAuth as jest.Mock).mockReturnValue({
    login: mockLogin,
    isAuthenticated: false,
});

// Verify
expect(mockLogin).toHaveBeenCalledWith("Google", true);
expect(mockLogin).toHaveBeenCalledTimes(1);
```

## Playwright (E2E)

```typescript
import { test, expect } from "@playwright/test";

test("Should_RedirectToItems_When_LoginCompletes", async ({ page }) => {
    // Arrange
    await page.goto("http://localhost");
    await page.waitForLoadState("networkidle");

    // Act
    const button = page.getByRole("button", { name: /continuar con google/i });
    await button.click();

    // Assert
    await expect(page).toHaveURL(/\/items/);
});
```

## IaC Snapshot Testing (CDK)

```typescript
describe("AppStack", () => {
    it("Should_MatchSnapshot_When_StackSynthesized", () => {
        // Arrange
        const app = new cdk.App();
        const stack = new AppStack(app, "TestStack");

        // Act
        const actual = Template.fromStack(stack);

        // Assert
        expect(actual.toJSON()).toMatchSnapshot();
    });
});
```

## Biome (Linter + Formatter)

```bash
# Lint
pnpx biome lint ./src

# Format
pnpx biome format ./src

# Format and write
pnpx biome format --write ./src
```

Configuration in `biome.json` at project root. Enforces:

- 4 spaces indent, double quotes, semicolons, trailing commas
- `noExplicitAny: "error"` — **`any` is FORBIDDEN**
- a11y rules enabled

## TypeScript Strict Rules

- **`any` is FORBIDDEN** — Biome enforces `noExplicitAny: "error"`. Always use
  proper types. For mock component props in `jest.mock`, define explicit prop
  interfaces or use the library's exported types.
- `unknown` is NOT the default replacement for `any` — it is only acceptable when
  the type genuinely cannot be known (e.g., an untyped third-party library with no
  `@types` package). In all other cases, use the correct concrete type.
- Use `import type` for type-only imports.
- TypeScript strict mode is enabled — respect all strict checks.
- Always run `pnpx biome check --write .` after modifying TypeScript files.

## Test Cleanup — No `try/catch/finally` in Tests

**NEVER** use `try/catch`, `try/finally`, `if`, or any control flow inside test functions.
Use framework teardown mechanisms instead:

| Scenario | Mechanism |
| -------- | --------- |
| Env var restore | `beforeEach` / `afterEach` |
| Temp file cleanup | `afterEach` / `afterAll` |
| Vitest spy cleanup | `vi.restoreAllMocks()` in `afterEach` |

```typescript
// GOOD — cleanup via afterEach
describe('resolve', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, AWS_ENDPOINT_URL: 'http://localhost:4566' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('Should_ResolveSecret_When_EnvConfigured', async () => {
    // Act
    const actual = await resolve('map.json');

    // Assert
    expect(actual['DB_URL']).toBe(expected);
  });
});

// BAD — try/finally in test body
it('Should_ResolveSecret_When_EnvConfigured', async () => {
  const original = process.env.AWS_ENDPOINT_URL;
  try {
    process.env.AWS_ENDPOINT_URL = 'http://localhost:4566';
    const actual = await resolve('map.json');
    expect(actual['DB_URL']).toBe(expected);
  } finally {
    process.env.AWS_ENDPOINT_URL = original;
  }
});
```
