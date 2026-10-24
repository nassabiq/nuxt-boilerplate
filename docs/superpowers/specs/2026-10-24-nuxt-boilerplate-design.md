# Design Document: Reusable Nuxt 4 Frontend Boilerplate

## 1. Intent & Context

Build a production-grade, reusable frontend boilerplate using Nuxt 4, Vue 3, Tailwind CSS 4, shadcn-vue, and Bun. The boilerplate serves as the standard frontend architecture for SaaS platforms and enterprise admin dashboards communicating with a Go Chi REST API backend (as specified in `/Users/nassabiq/Documents/code/go-chi-boilerplate/docs`).

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals

- **Nuxt 4 Architecture**: Enforce standard directory structure (`app/`, `server/`, `shared/`).
- **Secure BFF Session Layer**: Keep JWT `access_token` and `refresh_token` entirely out of browser storage via an encrypted, HttpOnly, SameSite session cookie with CSRF mitigation.
- **Contract Fidelity**: Align with the Go Chi OpenAPI contract:
    - Auth: `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/logout`, `/auth/sessions`.
    - Users CRUD: `/users`, `/users/{id}` supporting pagination (`skip`, `limit`, `total`) and optimistic concurrency (`version` field conflict resolution on 409).
    - Error envelope: `{ "code": string, "message": string }`.
- **Modern Minimal UI**: Implement shadcn-vue design system using Tailwind CSS 4, Lucide icons, responsive sidebar, topbar, breadcrumbs, toasts, and dark/light mode.
- **Developer Experience**: 100% Bun package manager workflow, strict TypeScript, ESLint, Vitest unit/component tests, Playwright E2E tests, and Docker deployment.
- **Offline / Mock Mode**: Configurable mock adapter (`NUXT_MOCK_API=true`) allowing standalone frontend development and CI testing without requiring a live Go Chi backend instance.

### Non-Goals

- Modifying or refactoring any code in the Go Chi backend.
- Adding unrelated third-party feature integrations (e.g. Stripe billing, WebSockets, multi-tenant subdomains).
- Introducing secondary UI component libraries (Nuxt UI is strictly prohibited).

### Anti-Goals

- Exposing raw JWT access or refresh tokens to client JavaScript (`localStorage`, `sessionStorage`, or accessible cookies).
- Hardcoding backend mock responses inside the client-side API layer (mocking must be isolated to server/BFF adapters).
- Mixing package manager lockfiles (no `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`).

---

## 3. Constraints

- **Nuxt Version**: Nuxt 4 (`^4.6.2`) with Vue 3 (`^3.5.44`).
- **Package Manager**: Bun only (`bun.lock` committed).
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` (replaces legacy `@nuxtjs/tailwindcss` v3 module) with CSS custom properties matching shadcn design tokens.
- **Icons**: Lucide icons (`lucide-vue-next`).
- **Validation**: VeeValidate + Zod.
- **State**: Pinia (`@pinia/nuxt`).
- **HTTP Client**: ofetch with centralized request/response interceptors.
- **Production Container**: Multi-stage Dockerfile utilizing Bun for build and Node.js for stable SSR runtime.

---

## 4. Architectural Approach: Unified BFF Session Proxy

```
Browser Client (Vue 3 / ofetch)
       │
       │  HTTP Requests to Nuxt BFF (/api/*)
       │  Cookie: bff_session (HttpOnly, Secure, SameSite=Lax)
       │  Header: x-csrf-token
       ▼
Nuxt Nitro Server (server/api/*)
       ├── CSRF Validation & Session Decryption
       ├── Mutex Token Refresh Coordinator (deduplicates concurrent 401s)
       ├── Optional Mock Adapter (if NUXT_MOCK_API=true)
       │
       │  Upstream Requests to Go Chi (NUXT_API_BASE_URL, default http://localhost:8080)
       │  Header: Authorization: Bearer <access_token>
       │  Header: Authorization: Basic <base64> (if configured for public auth routes)
       ▼
Go Chi REST API Backend
```

### 4.1 Token & Session Lifecycle

1. **Login Flow & Profile Hydration**:
    - Client calls `POST /api/auth/login` with `{ email, password }`.
    - BFF attaches optional Basic Auth (`NUXT_BACKEND_BASIC_AUTH_USERNAME` / `PASSWORD`) and forwards credentials to Go Chi `POST /auth/login`.
    - Go Chi returns `{ access_token, refresh_token, expires_in, token_type }`.
    - BFF calls Go Chi `GET /auth/me` with `Bearer <access_token>` to fetch user profile.
    - BFF seals tokens into encrypted HttpOnly `bff_session` cookie and sets a readable `csrf_token` cookie.
    - BFF responds to client with `{ user: dto.User }`.
2. **Authenticated Proxied Requests**:
    - Client calls `/api/users`.
    - BFF decrypts `bff_session`, attaches `Authorization: Bearer <access_token>`, and proxies request to Go Chi backend.
3. **Transparent Token Rotation**:
    - If Go Chi returns 401:
        - BFF enters a promise-based mutex lock.
        - First request calls Go Chi `POST /auth/refresh` using `refresh_token`.
        - On success, updates `bff_session` with new token pair and retries original request.
        - Queued concurrent requests await refreshed token and retry without duplicate refresh calls.
        - If refresh fails (e.g. token reuse detected or expired), BFF destroys `bff_session` and returns 401 to client, triggering navigation to `/login`.
4. **Logout**:
    - Client calls `POST /api/auth/logout`.
    - BFF calls Go Chi `POST /auth/logout` with Bearer token, destroys `bff_session` cookie, and returns 204.

---

## 5. Detailed Component & Directory Structure

```
├── app/
│   ├── app.vue                     # App root, Toaster provider, Config provider
│   ├── components/
│   │   ├── shared/                 # Breadcrumbs, PageHeader, EmptyState, DataTable
│   │   └── ui/                     # shadcn-vue primitives (button, input, dialog, table, etc.)
│   ├── composables/                # useAuth, useUsers, useToast, useCsrf
│   ├── features/
│   │   └── users/
│   │       ├── components/         # UserTable, UserFormDialog, UserDeleteDialog
│   │       ├── schemas/            # user.schema.ts (Zod)
│   │       ├── services/           # users.service.ts (calls /api/users)
│   │       └── types/              # user.types.ts
│   ├── layouts/
│   │   ├── default.vue             # Public navbar and footer
│   │   ├── auth.vue                # Centered card layout for login
│   │   └── dashboard.vue           # Collapsible sidebar, header, breadcrumbs, user dropdown
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts           # Configured ofetch instance with error mapping
│   │   │   └── errors.ts           # Normalized ApiError class (401, 403, 409, 422, 429, 5xx)
│   │   └── utils.ts                # cn helper (clsx + tailwind-merge)
│   ├── middleware/
│   │   ├── auth.ts                 # Enforces authenticated session for protected routes
│   │   └── guest.ts                # Redirects authenticated users away from /login
│   ├── pages/
│   │   ├── index.vue               # Landing page (prerendered SSG)
│   │   ├── login.vue               # Login page (auth layout, CSR)
│   │   └── dashboard/
│   │       ├── index.vue           # Overview metrics & quick links
│   │       └── users.vue           # Users CRUD management
│   └── stores/
│       └── auth.store.ts           # Pinia user & auth status store
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   ├── logout.post.ts
│   │   │   ├── me.get.ts
│   │   │   ├── refresh.post.ts
│   │   │   └── sessions.get.ts     # List active sessions
│   │   └── users/
│   │       ├── index.get.ts        # List with skip/limit/total
│   │       ├── index.post.ts       # Create user (email, name, password)
│   │       ├── [id].get.ts         # Get user
│   │       ├── [id].put.ts         # Update with optimistic lock version
│   │       └── [id].delete.ts      # Delete user
│   ├── middleware/
│   │   └── csrf.ts                 # Server-side CSRF validation for mutating endpoints
│   └── utils/
│       ├── bff-proxy.ts            # Proxy handler with mutex token refresh & Basic Auth
│       ├── mock-data.ts            # In-memory mock store for standalone dev
│       └── session.ts              # Nitro session encryption / sealed cookie helpers
├── shared/
│   └── types/
│       ├── api.types.ts            # Standard API error and pagination interfaces
│       ├── auth.types.ts           # Auth & Session DTOs
│       └── user.types.ts           # User and status enums matching Go Chi
├── tests/
│   ├── unit/                       # Vitest component & utility tests
│   └── e2e/                        # Playwright authentication & navigation tests
├── Dockerfile                      # Multi-stage Bun build + Node runtime
├── nuxt.config.ts                  # Route rules, Tailwind 4 Vite plugin, modules
└── package.json
```

---

## 6. Rendering Strategy & Route Rules

In `nuxt.config.ts`:

- `/`: `{ prerender: true }` (Static SSG for landing page).
- `/login`: `{ ssr: false }` (CSR for interactive auth).
- `/dashboard/**`: `{ ssr: false }` (CSR for administrative application).
- `/api/**`: Server endpoints handled by Nitro runtime.

---

## 7. Go Chi Data Contracts & Schemas

### 7.1 User Model & Payloads (`shared/types/user.types.ts`)

```typescript
export enum UserStatus {
    PENDING = 1,
    ACTIVE = 2,
    INACTIVE = 3,
    SUSPENDED = 4,
    BLOCKED = 5
}

export interface User {
    id: number
    name: string
    email: string
    status_id: UserStatus
    avatar_url?: string
    version: number
    created_at: string
    updated_at: string
}

export interface CreateUserPayload {
    name: string
    email: string
    password: string
}

export interface UpdateUserPayload {
    name: string
    email: string
    status_id: UserStatus
    version: number
}

export interface UserListMetadata {
    skip: number
    limit: number
    total: number
}

export interface UserListResponse {
    items: User[]
    meta: UserListMetadata
}
```

### 7.2 Error Handling & Schema

All Go Chi backend error responses follow:

```typescript
export interface ApiErrorResponse {
    code: string
    message: string
}
```

Normalized error mappings:

- `400` / `422`: Form validation failure -> Displays error alert or field error.
- `401`: Unauthorized / session expired -> Clears auth state, redirects to `/login`.
- `403`: Forbidden / inactive status -> Shows permission or account status banner.
- `409`: Conflict (`E_CONFLICT`) -> Optimistic concurrency version mismatch; prompts user to reload latest data.
- `429`: Too many requests / throttled (`E_AUTH_7`) -> Displays rate limit warning toast.
- `5xx`: Internal error -> Displays generic server error toast.

---

## 8. What's Left to the Builder

- Scaffolding shadcn-vue UI components using Radix Vue primitives and Tailwind 4 utility classes.
- Implementing dark mode toggle via CSS `.dark` class state.
- Writing test suites:
    - Unit tests: API client error mapping, form validation schema tests, user store tests.
    - Component tests: UserTable, UserFormDialog.
    - E2E tests: Login flow, dashboard navigation, user creation.
- Environment configuration (`.env.example`, `runtimeConfig`).
