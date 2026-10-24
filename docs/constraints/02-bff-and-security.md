# BFF and Security Constraints

This document defines the security architecture and Backend-For-Frontend (BFF) boundary requirements. All agents must enforce these constraints to protect authentication tokens, prevent cross-site scripting (XSS), cross-site request forgery (CSRF), and avoid session leakage.

---

## 1. BFF Boundary & Token Isolation

The Nuxt Nitro server (`server/`) serves as the strict security boundary between client browsers and the upstream Go Chi REST API.

### Absolute Token Secrecy Rule:

- **NEVER return `access_token` or `refresh_token` to the browser.**
- **NEVER store tokens in `localStorage`, `sessionStorage`, `IndexedDB`, or JavaScript-accessible cookies.**
- Upstream backend tokens exist **strictly inside the encrypted server session (`bff_session`)**.

```
Browser (Vue 3 Client)
   │
   │  HttpOnly Sealed Cookie ('bff_session') + Header ('x-csrf-token')
   ▼
Nuxt Nitro BFF Layer ('server/api/*')
   │  Decodes session, extracts accessToken, signs upstream request
   ▼
Go Chi REST Backend ('http://localhost:8080')
```

---

## 2. Server Session Storage (`server/utils/session.ts`)

- **Session Implementation**: Managed via Nitro's `useSession<BffSessionData>(event, config)`.
- **Cookie Settings**:
    - `name`: `'bff_session'`
    - `httpOnly`: `true` (unreadable via `document.cookie`)
    - `secure`: `true` in production (`process.env.NODE_ENV === 'production'`)
    - `sameSite`: `'lax'`
    - `maxAge`: `60 * 60 * 24 * 7` (7 days)
    - `password`: Enforces secret key with at least 32 characters (`NUXT_SESSION_PASSWORD`).

---

## 3. Mutex-Coordinated Token Refresh (`server/utils/bff-proxy.ts`)

Upstream access tokens expire periodically. The BFF layer transparently refreshes them without disrupting concurrent client requests.

### Concurrency Rules:

1. **Deduplication via Mutex Lock**:
    - `refreshLocks` Map caches in-flight refresh promises keyed by `refreshToken`.
    - When multiple concurrent requests encounter an HTTP 401, only **one** call is dispatched to `${apiBaseUrl}/auth/refresh`.
    - All other concurrent requests wait on the same Promise.
2. **Post-Refresh Replay**:
    - Once a new access token is received, the original request is replayed with the new token.
    - If the refresh token is revoked or expired, the session is cleared (`session.clear()`) and HTTP 401 is bubbled to the client.

---

## 4. CSRF Protection Standard (`server/middleware/csrf.ts` & `app/lib/api/client.ts`)

State-modifying requests (`POST`, `PUT`, `DELETE`, `PATCH`) must be protected against Cross-Site Request Forgery.

### Constraints:

1. **Double-Submit Cookie Pattern**:
    - Nitro middleware generates a cryptographically secure random token (`csrf_token` cookie, readable by client JS).
    - Client API client (`app/lib/api/client.ts`) automatically extracts the cookie and attaches it as `x-csrf-token` header on all mutation requests.
2. **Middleware Verification**:
    - Every mutating request to `/api/*` (except public endpoints like `/api/auth/login`) is verified in `server/middleware/csrf.ts`.
    - If `x-csrf-token` header does not match the `csrf_token` cookie, Nitro immediately aborts with `403 Forbidden` (`code: 'E_CSRF_INVALID'`).
3. **Agent Action Rule**:
    - Never disable the CSRF middleware to "fix" a failing request.
    - Any new HTTP mutation method must include the `x-csrf-token` header.

---

## 5. Offline Mock API Mode (`server/utils/mock-data.ts`)

To allow offline development, preview environments, and rapid testing without running a live Go Chi backend:

1. **Toggle Control**:
    - Enabled when `runtimeConfig.mockApi` is `true` (or `NUXT_MOCK_API=true`).
2. **Behavioral Parity**:
    - Mock data store (`server/utils/mock-data.ts`) must adhere to identical schemas, status codes, and latency characteristics as the real Go Chi backend.
    - When `isMockApi(event)` is `true`, endpoints return from the mock store; when `false`, they proxy via `forwardToBackend(event, path, options)`.
3. **Data Integrity in Tests**:
    - Tests modifying mock state must call `resetMockStore()` in `beforeEach()` or `afterEach()`.

---

## 6. Unified Error Handling Envelope (`app/lib/api/errors.ts`)

All API endpoints must return errors conforming to the normalized JSON envelope:

```json
{
  "code": "E_VALIDATION_FAILED",
  "message": "Human readable error description",
  "details": { ... }
}
```

### Standard Error Hierarchy:

- `ValidationError` (`400 Bad Request` or code `E_VALIDATION_*`)
- `UnauthorizedError` (`401 Unauthorized` or code `E_AUTH_*`)
- `ForbiddenError` (`403 Forbidden` or code `E_FORBIDDEN_*` / `E_CSRF_INVALID`)
- `NotFoundError` (`404 Not Found` or code `E_NOT_FOUND_*`)
- `ConflictError` (`409 Conflict` or code `E_CONFLICT_*`)
- `RateLimitError` (`429 Too Many Requests` or code `E_RATE_LIMIT_*`)
- `ApiError` (Fallback base class for any non-specific status codes)

On `401 Unauthorized`, `app/lib/api/client.ts` automatically resets the authentication store and redirects to `/login?redirect=...&expired=true`.
