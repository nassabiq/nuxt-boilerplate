# Testing and Code Quality Constraints

This document defines testing conventions, runner separation, type checking standards, and strict zero-suppression quality floors.

---

## 1. Test Suite Architecture & Runner Separation

The project maintains two distinct test levels:

```
tests/
├── unit/       # Vitest unit and component tests (runs in JSDOM)
└── e2e/        # Playwright end-to-end browser tests
```

### Critical Runner Isolation Rule:

- **Vitest** must ONLY run unit tests: `include: ['tests/unit/**/*.{test,spec}.ts']`.
- **Playwright** must ONLY run E2E tests: `testMatch: /.*\.spec\.ts/` under `tests/e2e/`.
- Never mix test harnesses. Do not import `@playwright/test` inside `tests/unit/`, and do not run `vitest` against `tests/e2e/`.

---

## 2. Unit & Integration Testing Standards (Vitest)

1. **Environment**:
    - Runs with `jsdom` environment and global test helpers (`describe`, `it`, `expect`, `beforeEach`, `vi`).
2. **Store Testing Discipline**:
    - Every store test must instantiate and activate a fresh Pinia instance before each test run:
        ```typescript
        import { setActivePinia, createPinia } from 'pinia'
        beforeEach(() => {
            setActivePinia(createPinia())
            resetMockStore()
        })
        ```
3. **Component Testing**:
    - Use `@vue/test-utils` (`mount`, `shallowMount`).
    - Test user interaction, prop changes, emit events, and accessibility attributes.
4. **Mock Store Reset**:
    - Tests touching server mock data must invoke `resetMockStore()` to guarantee test isolation and prevent cross-test contamination.

---

## 3. Strict TypeScript Constraints

1. **Zero Type Errors**:
    - `bun run typecheck` (`vue-tsc --noEmit`) must complete with **0 errors**.
2. **Strictness Level**:
    - Strict mode is enabled (`strict: true`).
    - Prohibit `any`. Always declare specific types, generics, or `unknown` when deserializing external payloads.
    - All shared DTOs must reside in `shared/types/*.types.ts`.
3. **Path Aliasing**:
    - Use `~` or `@` for `app/` imports (e.g. `~/components/...`).
    - Use `~~/shared` for shared contracts (e.g. `~~/shared/types/...`).
    - Use `~/server` for Nitro server utilities when writing server tests.

---

## 4. The Quality Floor (Non-Negotiable)

Any automated commit or code change by an agent must respect the Quality Floor. **This floor cannot be weakened to make a test pass.**

| Constraint                    | Rule                                                                | Verification Command                               |
| ----------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| **No Suppression Comments**   | Zero new `@ts-ignore`, `@ts-expect-error`, or `eslint-disable`.     | `git diff \| grep -E "@ts-ignore\|eslint-disable"` |
| **No Unimplemented Stubs**    | No `throw new Error("Not implemented")` or empty `catch {}` blocks. | Manual inspection & code review                    |
| **No Test Deletion/Skipping** | No `test.skip`, `describe.skip`, or deleting tests to pass CI.      | `git diff \| grep -E "\.skip\("`                   |
| **Lint Cleanliness**          | Zero lint errors or warnings.                                       | `bun run lint`                                     |
| **Formatting**                | Must conform to project Prettier rules.                             | `bun run format:check`                             |

---

## 5. Pre-Completion Verification Checklist

Before reporting any task complete, an agent must execute and confirm the full verification suite:

```bash
# 1. Type validation
bun run typecheck

# 2. Linting
bun run lint

# 3. Unit test suite
bun run test

# 4. Code formatting check
bun run format:check
```

If any command fails, the agent must diagnose and resolve the issue before declaring completion.
