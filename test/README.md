# API Test Suite

This directory contains smoke tests for the Household HQ API using **Vitest**, Nuxt's recommended test framework.

## Setup

Test dependencies are installed via npm:

- `vitest` - Test runner (recommended by Nuxt)
- `@nuxt/test-utils` - Nuxt testing utilities

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run only API tests
npm run test:api
```

## Test Structure

### `test/api/login.test.ts`

Validates the **Login API** (`POST /api/login`) request schema:

- ✓ Accepts valid username + password credentials
- ✓ Rejects requests missing required fields
- ✓ Rejects empty/incomplete payloads

**Covered by:** `LoginSchema` from `types/auth`

### `test/api/schemas.test.ts`

Comprehensive Zod schema validation tests for all API request types:

#### Projects

- Create/edit project payloads
- Schema coercion (estimate as number)

#### Sources

- Create/edit source payloads
- Source type enum validation (ACCOUNT, CASH, SAVINGS, DEBT, INVESTMENT, OUT)
- Position field integer coercion

#### Tags

- Create/edit tag payloads
- Optional description and color fields

#### Transactions

- Create transaction payloads (description, amount, sourceId, targetId)
- Month/year filters with numeric coercion
- Boolean coercion for important flag ("true"/"false" → true/false, "1"/"0" → true/false)
- Category ID filtering

## Test Coverage

Currently testing **request schema validation** (500+ LOC across 20+ schemas):

- Required vs optional fields
- Type coercion (strings → numbers, booleans)
- Enum validation
- Zod transformations (comma-separated tags, date parsing)

**Not yet covered:**

- Full end-to-end HTTP handler tests (can be added with `vitest` + test server)
- Database integration tests
- Authentication/authorization logic
- Response payload validation

## Adding New Tests

1. Create a new file: `test/api/your-feature.test.ts`
2. Import Zod schemas from `types/`
3. Test happy path, edge cases, and validation errors:

```typescript
import { describe, expect, it } from "vitest";
import { YourSchema } from "~/types/your-module";

describe("Your Feature API", () => {
  it("validates correct payload", () => {
    const result = YourSchema.safeParse({
      /* valid data */
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid payload", () => {
    const result = YourSchema.safeParse({
      /* invalid data */
    });
    expect(result.success).toBe(false);
  });
});
```

## CI Integration

Add to your CI pipeline:

```yaml
- name: Run API tests
  run: npm run test:run
```

Tests will fail if any schema validation changes break expectations, catching API contract violations early.
