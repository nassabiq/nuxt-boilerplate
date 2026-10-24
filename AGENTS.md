# AI Agent Guidelines & Operating Manual

Welcome to **nuxt-boilerplate**. This repository is a production-grade, reusable frontend boilerplate built with **Nuxt 4**, **Tailwind CSS 4**, **shadcn-vue**, and **Bun**, designed for enterprise dashboards and SaaS platforms integrated with a **Go Chi REST API**.

All AI agents (Cursor, Claude Code, Antigravity, GitHub Copilot, Codex) working on this codebase must read and strictly adhere to the instructions and constraints detailed below.

---

## 1. Golden Rules (Non-Negotiable)

1. **Read [CONSTRAINTS.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/CONSTRAINTS.md) First**:
    - Never weaken the Quality Floor to make code pass. Zero suppression comments (`@ts-ignore`, `eslint-disable`), zero fake stubs, zero skipped tests.
2. **Never Bypass the BFF Layer**:
    - Client code in `app/` must NEVER make direct network calls to the upstream Go Chi backend. All external API traffic must pass through Nitro endpoints in `server/api/*`.
3. **Zero Token Storage in Browser**:
    - Access tokens and refresh tokens must never be sent to or stored in client-accessible storage (`localStorage`, `sessionStorage`, `document.cookie`). Tokens remain strictly inside the encrypted server session (`bff_session`).
4. **Follow Feature-Driven Pragmatic Architecture (ADR 0001)**:
    - Do NOT implement Clean Architecture / OOP entities / repositories on the frontend. Use feature folders (`app/features/<feature>/`) containing UI components, Zod schemas, and pure stateless HTTP service functions coordinated by Pinia stores.
5. **Always Use Bun**:
    - Bun is the sole package manager. Never invoke `npm`, `yarn`, or `pnpm`. `bun.lock` must remain consistent.
6. **Execute Verification Protocol Before Completion**:
    - Every agent task must verify types, linting, tests, and formatting before completion.

---

## 2. Technology Stack & Key Libraries

| Capability              | Tool / Library                                       | Version / Integration                 |
| ----------------------- | ---------------------------------------------------- | ------------------------------------- |
| **Framework**           | Nuxt 4 (`app/`, `server/`, `shared/`)                | `^4.6.2`                              |
| **UI Framework**        | Vue 3 + Composition API (`<script setup lang="ts">`) | `^3.5.44`                             |
| **CSS & Design Tokens** | Tailwind CSS 4 via `@tailwindcss/vite`               | `^4.0.0` (Native CSS, HSL tokens)     |
| **UI Primitives**       | shadcn-vue on Radix Vue (`radix-vue`)                | `^1.9.15`                             |
| **Iconography**         | Lucide Icons (`lucide-vue-next`)                     | `^0.475.0`                            |
| **State Management**    | Pinia (Setup store syntax)                           | `^4.1.0` / `@pinia/nuxt`              |
| **Form Validation**     | Zod (`zod`) + Vee-Validate                           | `^3.24.2`                             |
| **Testing**             | Vitest (JSDOM) + Playwright (E2E)                    | Vitest `^3.0.5`, Playwright `^1.64.1` |
| **Package Runtime**     | Bun                                                  | `v1.1+`                               |

---

## 3. Directory Layout Mental Map

```
├── app/                             # Client-side Vue application
│   ├── assets/css/main.css          # Tailwind CSS 4 theme & CSS variable tokens
│   ├── components/
│   │   ├── shared/                  # Cross-feature components (Breadcrumbs, ThemeToggle)
│   │   └── ui/                      # shadcn-vue base primitives (button, dialog, table, etc.)
│   ├── composables/                 # Reusable reactive composables
│   ├── features/                    # Feature modules (users, auth, etc.)
│   │   └── <feature>/
│   │       ├── components/          # Feature presentation components
│   │       ├── schemas/             # Zod validation schemas & payload mappers
│   │       └── services/            # Pure stateless HTTP service calls
│   ├── layouts/                     # Page layouts (default, auth, dashboard)
│   ├── lib/
│   │   ├── api/                     # Centralized ofetch client & error mapping
│   │   └── utils.ts                 # cn() class utility (clsx + tailwind-merge)
│   ├── middleware/                  # Route guards (auth.ts, guest.ts)
│   ├── pages/                       # File-based routes
│   └── stores/                      # Pinia state stores (*.store.ts)
├── server/                          # Nitro Backend-For-Frontend (BFF)
│   ├── api/                         # BFF endpoints forwarding to Go Chi or Mock
│   ├── middleware/                  # Server-side CSRF validation middleware
│   └── utils/                       # BFF proxy forwarder, session helpers, mock store
├── shared/                          # Isomorphic contracts & types
│   └── types/                       # Shared DTOs, interfaces, and enums
├── docs/
│   ├── adr/                         # Architecture Decision Records
│   └── constraints/                 # Granular AI constraint documentation
├── tests/
│   ├── unit/                        # Vitest unit & component tests
│   └── e2e/                         # Playwright E2E tests
├── CONSTRAINTS.md                   # Core quality contract & gate numbers
└── nuxt.config.ts                   # Nuxt configuration & runtime rules
```

---

## 4. Separated AI Constraint Documentation

Detailed architecture rules, implementation constraints, and security standards are partitioned into dedicated guides:

| Document                                                                                                                                     | Domain                 | Key Constraints Covered                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| [01-architecture-and-structure.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/01-architecture-and-structure.md) | **Architecture**       | Tri-directory isolation, ADR 0001 Feature-Driven structure, forbidden OOP patterns.                         |
| [02-bff-and-security.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/02-bff-and-security.md)                     | **Security & BFF**     | HttpOnly sealed session cookie, mutex token rotation, CSRF token header check, normalized error envelope.   |
| [03-state-and-data-flow.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/03-state-and-data-flow.md)               | **State & Data Flow**  | Pinia setup stores, single source of truth, Zod form validation, optimistic concurrency (409 Conflict).     |
| [04-ui-ux-and-styling.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/04-ui-ux-and-styling.md)                   | **UI & Design System** | Tailwind 4 CSS tokens, dark mode variant, shadcn-vue primitives, `cn()` utility, WCAG 2.1 AA accessibility. |
| [05-testing-and-quality.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/05-testing-and-quality.md)               | **Testing & Quality**  | Vitest vs Playwright separation, Pinia test setup, strict TypeScript, zero-suppression quality floor.       |
| [06-tooling-and-conventions.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/constraints/06-tooling-and-conventions.md)       | **Tooling & Git**      | Bun lockfile rules, Prettier formatting specifications, Conventional Commits standard.                      |

---

## 5. Standard Operational Commands

Always use the following commands when building, testing, or verifying:

```bash
# Start local development server (default mock mode)
bun run dev

# Run TypeScript typecheck (vue-tsc)
bun run typecheck

# Run ESLint linter
bun run lint

# Run unit and component test suites (Vitest)
bun run test

# Check code formatting (Prettier)
bun run format:check

# Auto-format codebase
bun run format

# Run Playwright E2E tests
bun x playwright test

# Build for production
bun run build
```

---

## 6. Pre-Completion Protocol for AI Agents

Before declaring any implementation, bugfix, or refactoring task complete, every agent must execute this verification sequence and ensure zero failures:

1. **`bun run typecheck`**: Zero TypeScript errors.
2. **`bun run lint`**: Zero ESLint warnings or errors.
3. **`bun run test`**: 100% of unit tests pass.
4. **`bun run format:check`**: Code adheres strictly to formatting rules.
