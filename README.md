# Reusable Nuxt 4 Frontend Boilerplate

A production-grade, reusable frontend boilerplate built with **Nuxt 4**, **Tailwind CSS 4**, **shadcn-vue**, and **Bun**, designed for administrative dashboards, SaaS platforms, and enterprise public applications integrated with a **Go Chi REST API**.

---

## Features

- **Nuxt 4 Architecture**: Organized cleanly across `app/`, `server/`, and `shared/` directories.
- **Secure BFF Session Layer**: Server-side session management using encrypted HttpOnly cookies via Nitro. Access and refresh JWT tokens are kept strictly out of browser storage.
- **Transparent Token Rotation**: Mutex-coordinated token refresh that deduplicates concurrent 401s without race conditions or token reuse triggers.
- **CSRF Protection**: Integrated `x-csrf-token` header and SameSite cookie validation for state-modifying endpoints.
- **Go Chi API Contract Fidelity**:
    - Auth: `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/logout`, `/auth/sessions`.
    - Concurrency: Optimistic locking support with `version` field conflict resolution on `409 Conflict`.
    - Pagination: Standard `skip`, `limit`, and `total` metadata.
    - Normalized Error Handling: Unified `{ code: string, message: string }` envelope mapping to type-safe error classes (`ValidationError`, `UnauthorizedError`, `ConflictError`, `RateLimitError`).
- **Tailwind CSS 4 + shadcn-vue**:
    - Integrated via `@tailwindcss/vite` and CSS custom property design tokens.
    - Reusable accessible components: Button, Input, Label, Dialog, DropdownMenu, Table, Badge, Card, Select, Pagination, Toast.
    - Light and Dark mode with persistence and auto-detection.
- **Standalone Offline / Mock Mode**: Toggleable `NUXT_MOCK_API=true` allowing full frontend development and CI testing without requiring a live Go Chi backend instance.
- **Developer Experience & Tooling**:
    - Bun as the sole package manager (`bun.lock` committed).
    - TypeScript strict mode.
    - Unit and component testing via **Vitest** + **Vue Test Utils**.
    - E2E testing via **Playwright**.
    - Production containerization via multi-stage **Dockerfile** (Bun builder + Node.js runtime).

---

## Directory Structure

```
├── app/
│   ├── app.vue                     # Root layout wrapper & route announcer
│   ├── assets/css/main.css         # Tailwind CSS 4 theme tokens & styles
│   ├── components/
│   │   ├── shared/                 # Breadcrumbs, ThemeToggle
│   │   └── ui/                     # shadcn-vue primitives (button, dialog, table, toast, etc.)
│   ├── composables/                # Shared reactive composables
│   ├── features/
│   │   └── users/                  # Users CRUD feature (components, schemas, services)
│   ├── layouts/
│   │   ├── default.vue             # Public landing layout
│   │   ├── auth.vue                # Minimal centered card layout
│   │   └── dashboard.vue           # Collapsible sidebar, header, breadcrumbs, user dropdown
│   ├── lib/
│   │   ├── api/                    # Centralized ofetch client and error mapping
│   │   └── utils.ts                # cn utility (clsx + tailwind-merge)
│   ├── middleware/
│   │   ├── auth.ts                 # Session requirement guard
│   │   └── guest.ts                # Guest-only guard (redirects to /dashboard)
│   ├── pages/
│   │   ├── index.vue               # Landing page (prerendered SSG)
│   │   ├── login.vue               # Interactive sign-in page
│   │   └── dashboard/
│   │       ├── index.vue           # Overview metrics & quick links
│   │       └── users.vue           # Users CRUD management view
│   └── stores/
│       └── auth.store.ts           # Pinia user & authentication store
├── server/
│   ├── api/
│   │   ├── auth/                   # BFF authentication endpoints
│   │   └── users/                  # BFF users CRUD endpoints
│   ├── middleware/
│   │   └── csrf.ts                 # Server-side mutation CSRF validation
│   └── utils/
│       ├── bff-proxy.ts            # Proxy forwarder with mutex token rotation
│       ├── mock-data.ts            # In-memory mock store for standalone dev
│       └── session.ts              # Nitro session sealed cookie helpers
├── shared/
│   └── types/                      # Shared DTOs, enums, and API interfaces
├── tests/
│   ├── unit/                       # Vitest unit & component tests
│   └── e2e/                        # Playwright E2E tests
├── Dockerfile                      # Multi-stage Bun build + Node production runtime
├── nuxt.config.ts                  # Nuxt 4 configuration & route rules
└── package.json
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+)
- Node.js (v20+ or v22+ if running production builds locally)

### Installation

```bash
bun install --frozen-lockfile
```

### Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

| Variable                           | Default                 | Description                                                         |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| `NUXT_API_BASE_URL`                | `http://localhost:8080` | URL of the upstream Go Chi backend REST API                         |
| `NUXT_MOCK_API`                    | `true`                  | When `true`, uses the in-memory mock store (zero backend needed)    |
| `NUXT_SESSION_PASSWORD`            | `<secret>`              | Secret key for encrypting the HttpOnly session cookie (>= 32 chars) |
| `NUXT_BACKEND_BASIC_AUTH_USERNAME` | `""`                    | Optional Basic Auth username for Go Chi public auth endpoints       |
| `NUXT_BACKEND_BASIC_AUTH_PASSWORD` | `""`                    | Optional Basic Auth password for Go Chi public auth endpoints       |

---

## Development & Available Scripts

```bash
# Start local development server (http://localhost:3000)
bun run dev

# Run TypeScript type check
bun run typecheck

# Run ESLint check
bun run lint

# Run unit and component test suites (Vitest)
bun run test

# Build for production
bun run build

# Preview production build locally
bun run preview

# Run E2E tests (Playwright)
bun x playwright test
```

---

## Demo Credentials (Mock Mode)

When `NUXT_MOCK_API=true` (default):

- **Email**: `admin@example.com`
- **Password**: `password123`

---

## Docker Deployment

### Build Container

```bash
docker build -t nuxt-boilerplate .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NUXT_API_BASE_URL=http://backend:8080 \
  -e NUXT_MOCK_API=false \
  -e NUXT_SESSION_PASSWORD=production-super-secret-key-at-least-32-chars! \
  nuxt-boilerplate
```
