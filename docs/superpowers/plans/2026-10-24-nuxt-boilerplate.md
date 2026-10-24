# Reusable Nuxt 4 Frontend Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, reusable Nuxt 4 frontend boilerplate with Tailwind CSS 4, shadcn-vue, BFF session authentication, and Users CRUD integrated with a Go Chi REST API.

**Architecture:** Client calls Nuxt BFF routes (`/api/*`) with an HttpOnly sealed session cookie and CSRF token. The Nuxt server handles session decryption, transparent mutex token rotation, and proxies upstream to Go Chi (`NUXT_API_BASE_URL`) or falls back to an in-memory mock store when `NUXT_MOCK_API=true`.

**Tech Stack:** Nuxt 4 (`^4.6.2`), Vue 3, TypeScript, Bun, Tailwind CSS 4 (`@tailwindcss/vite`), Radix Vue / shadcn-vue, Lucide icons, Pinia, ofetch, VeeValidate + Zod, Vitest, Playwright, Docker.

**Spec:** [docs/superpowers/specs/2026-10-24-nuxt-boilerplate-design.md](file:///Users/nassabiq/Documents/code/nuxt-boilerplate/docs/superpowers/specs/2026-10-24-nuxt-boilerplate-design.md)

## Global Constraints

- Nuxt 4 directory conventions: `app/`, `server/`, `shared/`.
- Bun is the sole package manager: maintain `bun.lock`, never mix lockfiles.
- Tailwind CSS 4 via `@tailwindcss/vite` without `@nuxtjs/tailwindcss` v3 module.
- shadcn-vue primitives in `app/components/ui/` with CSS design tokens; zero Nuxt UI.
- All errors normalized to `{ code: string, message: string }`.
- Route rules: `/` is prerendered SSG, `/login` and `/dashboard/**` are CSR (`ssr: false`).
- Zero changes to Go Chi backend repository.

## Review Focus

1. **Concurrent 401 token refresh storm**: Multiple simultaneous client API calls receive 401; verify only one refresh request fires upstream and all callers retry successfully.
2. **Optimistic locking conflict on update**: User submits update with stale `version`; verify 409 Conflict triggers user-facing reload prompt without crashing form.
3. **CSRF protection on mutations**: State-modifying requests without matching `x-csrf-token` header are rejected with 403 Forbidden by BFF middleware.
4. **Offline / Mock mode switching**: Setting `NUXT_MOCK_API=true` allows full login and Users CRUD without a running Go Chi backend.
5. **No token leakage**: Inspect client network and storage; verify raw JWT access and refresh tokens never appear in localStorage, sessionStorage, or unsealed cookies.

---

### Task 1: Dependencies, Styling & Nuxt 4 Configuration

**Files:**

- Modify: `package.json`
- Modify: `nuxt.config.ts`
- Create: `app/assets/css/main.css`
- Create: `shared/types/api.types.ts`
- Create: `shared/types/auth.types.ts`
- Create: `shared/types/user.types.ts`

**Interfaces:**

- Produces: Tailwind 4 styling, global shared DTOs (`User`, `UserListResponse`, `ApiErrorResponse`, `SessionData`).

- [ ] **Step 1: Update package.json dependencies and scripts**
      Remove `@nuxtjs/tailwindcss`. Add `@tailwindcss/vite`, `tailwindcss` (v4), `radix-vue`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-vue-next`, `vee-validate`, `@vee-validate/zod`, `zod`, `vitest`, `@vue/test-utils`, `@nuxt/test-utils`. Add scripts: `typecheck: "nuxt typecheck"`, `test: "vitest run"`.
- [ ] **Step 2: Run bun install to update bun.lock**
      Run: `bun install`
      Expected: Clean install with updated `bun.lock`.
- [ ] **Step 3: Configure nuxt.config.ts**
      Configure Vite `@tailwindcss/vite` plugin, route rules (`/`: prerender, `/dashboard/**`: ssr: false), Pinia, fonts, icons, and runtimeConfig.
- [ ] **Step 4: Create app/assets/css/main.css**
      Import `@import "tailwindcss";` and define CSS custom properties for neutral light/dark themes and border radius.
- [ ] **Step 5: Define shared contracts in shared/types/**
      Define `api.types.ts` (`ApiErrorResponse`, `ListMeta`), `auth.types.ts` (`AuthTokens`, `LoginPayload`, `SessionInfo`), and `user.types.ts` (`User`, `UserStatus`, `CreateUserPayload`, `UpdateUserPayload`, `UserListResponse`).
- [ ] **Step 6: Verify build and typecheck**
      Run: `bun run build`
      Expected: Successful Nitro and Vite production build.
- [ ] **Step 7: Commit foundation**
    ```bash
    git add package.json bun.lock nuxt.config.ts app/assets/ shared/
    git commit -m "chore: setup Nuxt 4 foundation, Tailwind CSS 4, and shared types"
    ```

---

### Task 2: API Client & Error Handling

**Files:**

- Create: `app/lib/api/errors.ts`
- Create: `app/lib/api/client.ts`
- Create: `tests/unit/api-client.test.ts`

**Interfaces:**

- Consumes: `ApiErrorResponse` from `shared/types/api.types.ts`
- Produces: `apiClient` ofetch instance, `ApiError`, `ValidationError`, `UnauthorizedError`, `ConflictError`, `ForbiddenError`, `RateLimitError`.

- [ ] **Step 1: Write failing test in tests/unit/api-client.test.ts**
      Test error classification: 400/422 as ValidationError, 401 as UnauthorizedError, 409 as ConflictError, 429 as RateLimitError with correct codes and messages.
- [ ] **Step 2: Run test to verify it fails**
      Run: `bun test tests/unit/api-client.test.ts`
      Expected: FAIL (modules not found).
- [ ] **Step 3: Implement app/lib/api/errors.ts**
      Export `ApiError` extending `Error` with `status`, `code`, and custom subclasses (`ConflictError`, `ValidationError`, etc.).
- [ ] **Step 4: Implement app/lib/api/client.ts**
      Create centralized ofetch instance with baseURL `/api`, default headers, CSRF token attachment from `useCookie('csrf_token')`, and `onResponseError` mapping to `ApiError`.
- [ ] **Step 5: Run tests to verify they pass**
      Run: `bun test tests/unit/api-client.test.ts`
      Expected: PASS.
- [ ] **Step 6: Commit API client**
    ```bash
    git add app/lib/api/ tests/unit/api-client.test.ts
    git commit -m "feat(api): implement centralized ofetch client and normalized error classes"
    ```

---

### Task 3: Server BFF, Session Management & Upstream Go Chi Proxy

**Files:**

- Create: `server/utils/session.ts`
- Create: `server/utils/bff-proxy.ts`
- Create: `server/utils/mock-data.ts`
- Create: `server/middleware/csrf.ts`
- Create: `server/api/auth/login.post.ts`
- Create: `server/api/auth/logout.post.ts`
- Create: `server/api/auth/me.get.ts`
- Create: `server/api/auth/refresh.post.ts`
- Create: `server/api/auth/sessions.get.ts`
- Create: `tests/unit/bff-auth.test.ts`

**Interfaces:**

- Consumes: Go Chi endpoints (`/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/logout`)
- Produces: Secure `/api/auth/*` BFF routes, HttpOnly `bff_session` cookie, `csrf_token` cookie.

- [ ] **Step 1: Write failing test in tests/unit/bff-auth.test.ts**
      Test mock authentication flow: login returns user profile, session is established, logout revokes session.
- [ ] **Step 2: Run test to verify it fails**
      Run: `bun test tests/unit/bff-auth.test.ts`
      Expected: FAIL.
- [ ] **Step 3: Implement server/utils/session.ts**
      Use H3 `useSession` with encrypted password from `runtimeConfig.sessionPassword` to manage `accessToken`, `refreshToken`, and `userId`.
- [ ] **Step 4: Implement server/utils/mock-data.ts**
      Provide in-memory store of mock users and sessions conforming to Go Chi schema for offline/mock development.
- [ ] **Step 5: Implement server/utils/bff-proxy.ts**
      Proxy upstream requests with `Authorization: Bearer <accessToken>` and mutex token rotation when upstream responds with 401. If `NUXT_MOCK_API=true`, route directly to mock data handlers.
- [ ] **Step 6: Implement server/middleware/csrf.ts**
      Validate `x-csrf-token` against `csrf_token` cookie for mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`).
- [ ] _*Step 7: Implement server/api/auth/* endpoints_*
      Login (fetches tokens + profile, sets session), logout (clears session), me (returns current user profile), refresh (token rotation), sessions (active session list).
- [ ] **Step 8: Run tests to verify they pass**
      Run: `bun test tests/unit/bff-auth.test.ts`
      Expected: PASS.
- [ ] **Step 9: Commit BFF foundation**
    ```bash
    git add server/ tests/unit/bff-auth.test.ts
    git commit -m "feat(bff): add session management, CSRF middleware, and auth proxy"
    ```

---

### Task 4: UI Design System & shadcn-vue Primitives

**Files:**

- Create: `app/lib/utils.ts`
- Create: `app/components/ui/button/Button.vue` & `index.ts`
- Create: `app/components/ui/input/Input.vue` & `index.ts`
- Create: `app/components/ui/label/Label.vue` & `index.ts`
- Create: `app/components/ui/dialog/` (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter)
- Create: `app/components/ui/dropdown-menu/` (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem)
- Create: `app/components/ui/table/` (Table, TableHeader, TableBody, TableHead, TableRow, TableCell)
- Create: `app/components/ui/badge/Badge.vue` & `index.ts`
- Create: `app/components/ui/card/Card.vue` & `index.ts`
- Create: `app/components/ui/pagination/` (Pagination, PaginationList, PaginationItem, etc.)
- Create: `app/components/ui/select/` (Select, SelectTrigger, SelectValue, SelectContent, SelectItem)
- Create: `app/components/ui/toast/` (Toast, Toaster, useToast)
- Create: `tests/unit/ui-components.test.ts`

**Interfaces:**

- Produces: Reusable shadcn-vue UI components with full TypeScript prop contracts.

- [ ] **Step 1: Implement app/lib/utils.ts**
      Export `cn(...inputs: ClassValue[])` using `clsx` and `twMerge`.
- [ ] **Step 2: Scaffold shadcn-vue components**
      Implement Button (with variants default, secondary, destructive, outline, ghost, link), Input, Label, Dialog, DropdownMenu, Table, Badge, Card, Pagination, Select, Toast.
- [ ] **Step 3: Write component unit test in tests/unit/ui-components.test.ts**
      Verify Button, Badge, and Table render proper classes and handle event triggers.
- [ ] **Step 4: Run tests to verify they pass**
      Run: `bun test tests/unit/ui-components.test.ts`
      Expected: PASS.
- [ ] **Step 5: Commit UI primitives**
    ```bash
    git add app/components/ui/ app/lib/utils.ts tests/unit/ui-components.test.ts
    git commit -m "feat(ui): implement shadcn-vue core design system primitives"
    ```

---

### Task 5: Auth State, Layouts & Navigation

**Files:**

- Create: `app/stores/auth.store.ts`
- Create: `app/middleware/auth.ts`
- Create: `app/middleware/guest.ts`
- Create: `app/layouts/default.vue`
- Create: `app/layouts/auth.vue`
- Create: `app/layouts/dashboard.vue`
- Create: `app/components/shared/Breadcrumbs.vue`
- Create: `app/components/shared/ThemeToggle.vue`
- Create: `app/pages/index.vue`
- Create: `app/pages/login.vue`
- Modify: `app/app.vue`
- Create: `tests/unit/auth-store.test.ts`

**Interfaces:**

- Consumes: `/api/auth/*` BFF routes, UI components
- Produces: `useAuthStore()`, protected navigation guards, responsive dashboard layout with sidebar.

- [ ] **Step 1: Write failing test in tests/unit/auth-store.test.ts**
      Test `authStore.login`, `authStore.logout`, and state hydration.
- [ ] **Step 2: Run test to verify it fails**
      Run: `bun test tests/unit/auth-store.test.ts`
      Expected: FAIL.
- [ ] **Step 3: Implement app/stores/auth.store.ts**
      Pinia store holding `user`, `isAuthenticated`, `isLoading`. Methods: `login(email, password)`, `logout()`, `fetchMe()`.
- [ ] **Step 4: Implement navigation middleware**
      `app/middleware/auth.ts`: Redirects unauthenticated users to `/login?redirect=...`.
      `app/middleware/guest.ts`: Redirects authenticated users to `/dashboard`.
- [ ] **Step 5: Implement layouts and components**
    - `default.vue`: Public landing header, navigation links, theme toggle, and footer.
    - `auth.vue`: Centered card with clean background.
    - `dashboard.vue`: Responsive collapsible sidebar, topbar, breadcrumbs, user avatar dropdown, and theme toggle.
- [ ] **Step 6: Implement app/pages/index.vue and login.vue**
    - `index.vue`: Hero section, feature overview, CTA buttons.
    - `login.vue`: Form using VeeValidate + Zod, displaying server errors on invalid credentials (`E_AUTH_1`).
- [ ] **Step 7: Run tests to verify they pass**
      Run: `bun test tests/unit/auth-store.test.ts`
      Expected: PASS.
- [ ] **Step 8: Commit auth state and layouts**
    ```bash
    git add app/stores/ app/middleware/ app/layouts/ app/components/shared/ app/pages/ app/app.vue tests/unit/auth-store.test.ts
    git commit -m "feat(auth): add Pinia auth store, navigation guards, and dashboard layout"
    ```

---

### Task 6: Users Management CRUD Feature

**Files:**

- Create: `app/features/users/schemas/user.schema.ts`
- Create: `app/features/users/services/users.service.ts`
- Create: `app/features/users/components/UserTable.vue`
- Create: `app/features/users/components/UserFormDialog.vue`
- Create: `app/features/users/components/UserDeleteDialog.vue`
- Create: `server/api/users/index.get.ts`
- Create: `server/api/users/index.post.ts`
- Create: `server/api/users/[id].get.ts`
- Create: `server/api/users/[id].put.ts`
- Create: `server/api/users/[id].delete.ts`
- Create: `app/pages/dashboard/index.vue`
- Create: `app/pages/dashboard/users.vue`
- Create: `tests/unit/users-crud.test.ts`

**Interfaces:**

- Consumes: Go Chi `/users` contract, `shared/types/user.types.ts`
- Produces: Complete Users CRUD UI with pagination, optimistic concurrency conflict handling, validation, loading/empty states.

- [ ] **Step 1: Write failing test in tests/unit/users-crud.test.ts**
      Test validation schema for create user (`name`, `email`, `password`) and edit user (`name`, `email`, `status_id`, `version`). Test optimistic locking conflict detection.
- [ ] **Step 2: Run test to verify it fails**
      Run: `bun test tests/unit/users-crud.test.ts`
      Expected: FAIL.
- [ ] _*Step 3: Implement server/api/users/* BFF routes_*
      Implement handlers proxying `/users` with `skip`, `limit`, `total` pagination and forwarding PUT with `version`. In mock mode, update in-memory user list and check version mismatch.
- [ ] **Step 4: Implement users service and schemas**
    - `user.schema.ts`: Zod schema for `CreateUserPayload` and `UpdateUserPayload`.
    - `users.service.ts`: Methods `list(skip, limit, search)`, `create(payload)`, `update(id, payload)`, `remove(id)`.
- [ ] **Step 5: Implement Users UI components**
    - `UserTable.vue`: Table with status badges, pagination controls, sort/search, edit/delete action triggers.
    - `UserFormDialog.vue`: Dialog for create & edit with VeeValidate form inputs and optimistic lock conflict banner on 409 error.
    - `UserDeleteDialog.vue`: Confirmation dialog for soft deletion.
- [ ] **Step 6: Implement dashboard pages**
    - `app/pages/dashboard/index.vue`: Overview metrics cards, system status, quick navigation.
    - `app/pages/dashboard/users.vue`: Main users management view wiring table, dialogs, pagination, error, and empty states.
- [ ] **Step 7: Run tests to verify they pass**
      Run: `bun test tests/unit/users-crud.test.ts`
      Expected: PASS.
- [ ] **Step 8: Commit Users CRUD feature**
    ```bash
    git add app/features/users/ server/api/users/ app/pages/dashboard/ tests/unit/users-crud.test.ts
    git commit -m "feat(users): implement Users CRUD with pagination and optimistic lock handling"
    ```

---

### Task 7: E2E Testing, Dockerfile, Configuration & Documentation

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/e2e/auth-and-users.spec.ts`
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**

- Produces: Production container build, E2E test suite, comprehensive integration documentation.

- [ ] **Step 1: Configure Playwright and write E2E test**
      Setup `playwright.config.ts`. Write `tests/e2e/auth-and-users.spec.ts` verifying: landing page load, login with credentials, navigation to users dashboard, opening add user modal.
- [ ] **Step 2: Create Dockerfile and .dockerignore**
      Multi-stage Dockerfile: Stage 1 Bun builder (`bun install --frozen-lockfile`, `bun run build`); Stage 2 Node.js runtime (`node .output/server/index.mjs`) exposing port 3000.
- [ ] **Step 3: Create .env.example**
      Document: `NUXT_API_BASE_URL`, `NUXT_MOCK_API`, `NUXT_SESSION_PASSWORD`, `NUXT_BACKEND_BASIC_AUTH_USERNAME`, `NUXT_BACKEND_BASIC_AUTH_PASSWORD`.
- [ ] **Step 4: Update README.md**
      Document: Architecture, Go Chi REST API integration, authentication lifecycle, mock mode toggle, scripts (`dev`, `build`, `test`, `typecheck`, `lint`), Docker build and run commands.
- [ ] **Step 5: Run full verification suite**
      Run:
    - `bun run typecheck`
    - `bun run lint`
    - `bun test`
    - `bun run build`
      Expected: All checks pass without errors.
- [ ] **Step 6: Commit deliverable**
    ```bash
    git add playwright.config.ts tests/e2e/ Dockerfile .dockerignore .env.example README.md
    git commit -m "chore: add E2E tests, Dockerfile, environment docs, and README"
    ```
