# Tooling, Dependency, and Git Conventions

This document defines package management rules, formatting configuration, and Git workflow requirements.

---

## 1. Package Management with Bun

**Bun** is the sole authorized package manager and execution runtime for this repository.

### Mandatory Rules:

- **`bun.lock` is committed**: Always preserve the lockfile.
- **Never use alternative package managers**:
    - ❌ `npm install`
    - ❌ `yarn add`
    - ❌ `pnpm install`
    - Doing so creates foreign lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) and desynchronizes dependency trees.
- **Dependency Installation**:
    - To install dependencies cleanly: `bun install --frozen-lockfile`
    - To add a runtime dependency: `bun add <package>`
    - To add a dev dependency: `bun add -d <package>`

---

## 2. Formatting & Linting Conventions

Code formatting is enforced through **Prettier** and **ESLint with `@nuxt/eslint`**.

### Configuration Summary:

- **Prettier (`.prettierrc.json`)**:
    - Single quotes: `'` (`"singleQuote": true`)
    - Semicolons: None (`"semi": false`)
    - Indentation: 4 spaces (`"tabWidth": 4`)
    - Trailing commas: None (`"trailingComma": "none"`)
    - Arrow parens: Avoid when single arg (`"arrowParens": "avoid"`)
    - Print width: 100 characters (`"printWidth": 100`)
- **Vue SFC Rules (`eslint.config.mjs`)**:
    - Self-closing tags strictly enforced for normal and component tags (`vue/html-self-closing`).
    - No unused imports or variables.

### Formatting Commands:

```bash
# Auto-format all files
bun run format

# Verify formatting without modifying files
bun run format:check
```

---

## 3. Git Workflow & Conventional Commits

All changes, commits, and pull requests must follow structured versioning and Conventional Commits standards.

### Commit Format:

```
<type>(<scope>): <short imperative summary>

[optional body explaining why and what changed]

[optional footer(s)]
```

### Approved Types:

- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix or regression correction.
- `refactor`: Code restructuring without behavioral changes.
- `test`: Adding or modifying tests.
- `docs`: Documentation updates.
- `chore`: Build scripts, tooling updates, dependency maintenance.
- `perf`: Performance improvements.

### Examples:

- `feat(users): add optimistic concurrency conflict dialog`
- `fix(bff): deduplicate concurrent 401 token refresh calls`
- `test(auth): add unit tests for session expiration redirect`
- `refactor(ui): extract breadcrumb items into shared component`

### Atomic Commits Rule:

- Each commit must represent a single, atomic unit of change.
- Never mix formatting changes, feature implementations, and unrelated bug fixes in a single commit.
