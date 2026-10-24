# Architecture and Project Structure Constraints

This document defines the structural and architectural boundaries for the Nuxt 4 boilerplate. All AI agents and developers modifying or extending this codebase must adhere strictly to these rules.

---

## 1. Tri-Directory Nuxt 4 Architecture

The application is strictly partitioned into three root boundaries:

```
├── app/       # Client-side presentation layer (Vue 3, Pinia, Tailwind 4)
├── server/    # Backend-For-Frontend (BFF) layer (Nitro engine)
└── shared/    # Isomorphic contracts, types, and pure domain utilities
```

### Boundary Isolation Rules:

1. **`app/` may never import from `server/` directly**:
    - Client code must communicate with `server/` exclusively over HTTP via `app/lib/api/client.ts` (`/api/*`).
    - Server-only packages (`node:*`, encryption libraries, backend credentials) must never leak into `app/`.
2. **`server/` may never import from `app/`**:
    - Nitro server handlers run in a distinct execution context. No Vue reactivity (`ref`, `reactive`), Pinia stores, or client composables may be imported into `server/`.
3. **`shared/` must remain isomorphic and pure**:
    - Contains only TypeScript type definitions (`*.types.ts`), enums, and pure functional domain helpers (e.g. `sortUsers()`, `isSuperAdminUser()`).
    - Must NOT contain side effects, UI frameworks, or HTTP clients.

---

## 2. Feature-Driven Pragmatic Architecture (ADR 0001)

Per **ADR 0001**, this project explicitly **rejects Full Clean Architecture / OOP Entity-Repository patterns** on the frontend. The backend (Go Chi) owns core business rules, database transactions, and authorization; the frontend owns presentation, user experience, and client-side validation.

### Feature Structure (`app/features/<feature-name>/`)

Every distinct domain capability (e.g., `users`, `auth`) must be encapsulated within a feature directory:

```
app/features/<feature>/
├── components/    # Feature-specific Vue components (dialogs, tables, cards)
├── schemas/       # Zod validation schemas and payload transformation mappers
└── services/      # Pure, stateless async functions executing HTTP calls to BFF
```

### Layer Responsibilities & Rules:

| Layer                 | Location                             | Permitted Responsibilities                                                 | Prohibited Actions                                        |
| --------------------- | ------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| **View / Page**       | `app/pages/**`                       | Route layout binding, page title/meta, orchestration of store calls.       | Direct raw HTTP calls; form validation logic.             |
| **Feature Component** | `app/features/<feature>/components/` | UI rendering, user interaction, dialog state, calling store actions.       | Direct raw HTTP calls; bypassing feature store.           |
| **Zod Schema**        | `app/features/<feature>/schemas/`    | Input validation, error messages, payload mappers (`toCreate*Payload`).    | Side effects, reactive state, API calls.                  |
| **Pinia Store**       | `app/stores/<feature>.store.ts`      | Single source of truth: reactive state, caching, pagination, filter state. | Direct DOM access; raw Nitro server imports.              |
| **Feature Service**   | `app/features/<feature>/services/`   | Pure stateless HTTP wrapper around `apiClient`.                            | Storing internal state; Vue `ref` or reactive properties. |
| **Shared Primitives** | `app/components/ui/`                 | shadcn-vue base components (Buttons, Inputs, Dialogs, Tables).             | Feature-specific business logic or API imports.           |

---

## 3. Directory Inventory & Placement Rules

When creating new files, follow this strict placement matrix:

- **New domain feature (e.g., `products`)**:
    - `app/features/products/components/` -> Feature components.
    - `app/features/products/schemas/product.schema.ts` -> Zod validation.
    - `app/features/products/services/products.service.ts` -> HTTP service.
    - `app/stores/products.store.ts` -> Pinia store.
    - `shared/types/product.types.ts` -> DTOs, interfaces, and enums.
    - `server/api/products/` -> Nitro BFF proxy endpoints.
- **New reusable UI primitive**:
    - Add to `app/components/ui/<component-name>/` following Radix Vue + shadcn conventions.
- **New global shared UI element (e.g., navbar, stats banner)**:
    - Add to `app/components/shared/`.
- **New layout**:
    - Add to `app/layouts/` (e.g., `default.vue`, `auth.vue`, `dashboard.vue`).

---

## 4. Architectural Anti-Patterns (Enforced)

The following patterns are strictly forbidden:

- ❌ **No Class-Based Entities or Repository Interfaces**: Do not create OOP classes (e.g., `class UserRepository`). Use functional services and TypeScript interfaces.
- ❌ **No Component-Level HTTP Calls**: Components must never call `apiClient` or `ofetch` directly. Always invoke a Pinia store action or a feature service.
- ❌ **No In-Component Validation Rules**: Do not write ad-hoc regex or string validations inside `<template>` or `<script setup>`. Centralize them in `schemas/<feature>.schema.ts`.
- ❌ **No Cross-Feature Direct Component Coupling**: `feature-a/components` must not import private subcomponents from `feature-b/components`. If a component is shared, elevate it to `app/components/shared/` or `app/components/ui/`.
