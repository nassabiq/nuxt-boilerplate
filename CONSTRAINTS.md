# Project Quality Constraints

Last reviewed: 2026-10-26

All AI agents, automated loops, and developers must respect the quality constraints recorded here. **This contract cannot be weakened to make a build or test pass.**

---

## 1. The Quality Floor (Always Enforced)

- **No Suppression Comments**: No new `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, or `@eslint-disable-next-line`.
- **No Unimplemented Stubs**: No `throw new Error("Not implemented")`, empty `catch {}` blocks, or fake return values.
- **No Skipped or Deleted Tests**: No `test.skip`, `describe.skip`, or test deletions without documented rationale.
- **No Secret Leaks**: No tokens, JWTs, or passwords in client code (`app/`), localStorage, or git history.
- **No Direct Backend Bypass**: Client code in `app/` must never bypass the Nitro BFF to contact upstream APIs directly.
- **This File Does Not Get Weakened**: Rules and thresholds here may not be edited down to turn CI green.

---

## 2. Enforced Quantitative Gates

Every row names the exact command producing the pass/fail verdict. Any metric without a command is an aspiration, not a constraint.

| Dimension           | Rule / Threshold                                 | Checked By                               | Runs At    |
| ------------------- | ------------------------------------------------ | ---------------------------------------- | ---------- |
| **Types**           | Zero TypeScript / Vue SFC errors                 | `bun run typecheck` (`vue-tsc --noEmit`) | Every task |
| **Lint**            | Zero ESLint errors or warnings                   | `bun run lint`                           | Every task |
| **Formatting**      | 100% adherence to Prettier config                | `bun run format:check`                   | Every task |
| **Unit Tests**      | 100% test pass rate across unit suite            | `bun run test` (`vitest run`)            | Every task |
| **CSRF & Auth**     | Double-submit CSRF cookie + HttpOnly BFF session | `tests/unit/bff-auth.test.ts`            | Every task |
| **Package Tooling** | Bun as sole package manager (`bun.lock`)         | Manual & CI script check                 | Every task |

---

## 3. Modular Constraint Documentation

Detailed technical constraints and architecture standards are separated into domain-specific guides:

- [01-architecture-and-structure.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/01-architecture-and-structure.md) — Tri-directory model, Feature-Driven Architecture, file placement matrix.
- [02-bff-and-security.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/02-bff-and-security.md) — BFF layer, HttpOnly cookie sessions, mutex token rotation, CSRF protection, Go Chi error envelope.
- [03-state-and-data-flow.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/03-state-and-data-flow.md) — Single-direction data flow, Pinia setup stores, Zod validation schemas, optimistic locking (409 Conflict).
- [04-ui-ux-and-styling.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/04-ui-ux-and-styling.md) — Tailwind CSS 4, CSS variables design tokens, shadcn-vue primitives, Radix Vue, dark mode, WCAG 2.1 AA.
- [05-testing-and-quality.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/05-testing-and-quality.md) — Vitest & Playwright runner separation, test isolation, mock store reset, quality floor.
- [06-tooling-and-conventions.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/06-tooling-and-conventions.md) — Bun workflow, Prettier formatting rules, Conventional Commits format.

---

## 4. Exceptions Ledger

Any temporary bypass must have an explicit reason, owner, and expiration date:

| ID   | Rule Suppressed | Path | Reason | Owner | Expires |
| ---- | --------------- | ---- | ------ | ----- | ------- |
| None | None            | None | None   | None  | None    |
