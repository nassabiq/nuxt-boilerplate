# State Management and Data Flow Constraints

This document defines the constraints governing state management, reactive data flow, form validation, and optimistic concurrency control across the application.

---

## 1. Single Directional Data Flow

Data in this application follows a strict single-direction pipeline:

```
User Event (Click, Input, Submit)
   │
   ▼
Vue Component (`app/features/<feature>/components/*`)
   │
   ▼
Zod Validation (`app/features/<feature>/schemas/*`)
   │  Ensures inputs match schema before making network requests
   ▼
Pinia Store Action (`app/stores/<feature>.store.ts`)
   │  Sets loading state, orchestrates calls
   ▼
Feature Service (`app/features/<feature>/services/*`)
   │  Executes typed HTTP call via `apiClient`
   ▼
Nitro BFF (`server/api/*`) -> Upstream Backend (Go Chi)
   │
   ▼
Pinia Store State Updates (`users.value = ...`)
   │
   ▼
Computed Getters update -> UI Re-renders automatically
```

---

## 2. Pinia Store Constraints (`app/stores/`)

### Setup Store Syntax:

All Pinia stores must use the **Composition API setup syntax** (`defineStore('name', () => { ... })`). Do not use Options API (`state`, `getters`, `actions` objects).

### Mandatory Store Anatomy:

```typescript
export const useExampleStore = defineStore('example', () => {
    // 1. Primitive reactive state
    const items = ref<Item[]>([])
    const isLoading = ref(false)
    const errorMessage = ref<string | null>(null)
    const isHydrated = ref(false)

    // 2. Computed derived state
    const activeItems = computed(() => items.value.filter(i => i.isActive))

    // 3. Actions (asynchronous operations & mutations)
    async function fetchItems(): Promise<void> {
        isLoading.value = true
        errorMessage.value = null
        try {
            items.value = await listItems()
            isHydrated.value = true
        } catch (err: unknown) {
            errorMessage.value = (err as Error).message || 'Failed to load items'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // 4. Return exposed state, getters, and actions
    return { items, isLoading, errorMessage, isHydrated, activeItems, fetchItems }
})
```

### Store Constraints:

- **No Direct Mutation outside Store**: Components should call actions (`createUser`, `updateUser`, `deleteUser`) rather than directly modifying store `ref` arrays.
- **Hydration Flag**: Stores loading data for SSR/client transitions must expose an `isHydrated` ref to prevent redundant fetches.
- **Error Propagation**: Store actions should set `errorMessage` for UI binding AND re-throw the typed error (`throw err`) so calling components can handle user notifications or dialogs.

---

## 3. Feature Service Constraints (`app/features/<feature>/services/`)

1. **Stateless Functions**:
    - Feature services must consist strictly of exported pure async functions (e.g., `listUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser`).
    - Do NOT declare module-level `ref()`, `reactive()`, or cache maps inside services.
2. **Type Signatures**:
    - Every service function must explicitly declare its parameter types and return type (e.g., `Promise<User>`, `Promise<UserListResponse>`).
    - Types must be imported from `~~/shared/types/*.types`.
3. **HTTP Client Standard**:
    - All network calls must pass through `apiClient` (`app/lib/api/client.ts`), ensuring automatic CSRF injection, timeout handling, and typed error parsing.

---

## 4. Input Validation & Form Schemas (`app/features/<feature>/schemas/`)

### Zod as Single Source of Validation Truth:

- Every user input form must be paired with a corresponding Zod schema (e.g., `createUserSchema`, `updateUserSchema`).
- Schema types must be exported via `z.infer<typeof schema>` (e.g., `CreateUserFormValues`).

### Transformation Mappers:

- Every schema file must export explicit payload conversion helpers:
    - `toCreate*Payload(values)`
    - `toUpdate*Payload(values, fallbackVersion)`
- Transformation helpers trim string inputs, normalize emails to lowercase, cast status IDs, and attach concurrency `version` numbers.

### Password Complexity Baseline (OWASP Standard):

For any user authentication or creation schemas, passwords must enforce:

- Minimum length of 8 characters, maximum of 72 characters.
- At least one uppercase letter (`/[A-Z]/`).
- At least one lowercase letter (`/[a-z]/`).
- At least one number (`/[0-9]/`).
- At least one special symbol (`/[^A-Za-z0-9]/`).

---

## 5. Optimistic Concurrency & Versioning (`409 Conflict`)

To prevent data overwrite conflicts in multi-user environments:

1. **Version Field Requirement**:
    - Every mutable resource entity has a `version: number` field.
    - Every `update*` payload must submit the current `version`.
2. **Handling `409 Conflict` (`ConflictError`)**:
    - When an update fails with status 409, the server indicates another user has modified the record concurrently.
    - The UI must catch `ConflictError` and trigger either:
      a) A reload of the latest record from the server.
      b) A user conflict dialog prompting them to review the newer version.
    - **Never blindly retry with an incremented version number** without user awareness.
