# Copilot instructions — rag-demo

This file captures repository-specific build/test/lint commands, high-level architecture, and conventions Copilot should follow when editing or generating code in this project.

---

## Build / Run / Lint (repo root)

- Install dependencies: `npm install`
- Dev (frontend + backend in parallel): `npm run dev` (runs `dev:frontend` + `dev:backend`)
  - Frontend only: `npm run dev:frontend` (runs Vite)
  - Backend only: `npm run dev:backend` (runs Convex dev)
- Predev (dashboard helper): `npm run predev` (runs `convex dev --until-success && convex dashboard`)
- Build: `npm run build` (runs `tsc -b && vite build`)
- Preview: `npm run preview` (Vite preview)
- Lint: `npm run lint` (runs `tsc` and `eslint` per repo config)

> Note: package.json scripts drive these commands; inspect `package.json` for exact commands.

---

## High-level architecture

- Frontend: React + TypeScript in `src/` (entry: `src/main.tsx`, UI in `src/App.tsx`). Built with Vite; `vite.config.ts` defines an alias `@` -> `./src` and the Tailwind Vite plugin.
- Backend: Convex backend lives in `convex/` and includes server functions (e.g., `myFunctions.ts`), `schema.ts` (DB schema), and a `_generated/` folder with Convex-generated types and helpers. Run the backend locally with `convex dev`.
- Build flow: TypeScript project references are used (`tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`); `npm run build` runs `tsc -b` then `vite build`.

---

## Key conventions (repo-specific)

- Convex function style and validators:
  - Use the new Convex function syntax (object form) with explicit `args` and `returns` validators from `convex/values` (e.g., `v.string()`, `v.null()`).
  - Always include argument and return validators; use `v.null()` when a function returns nothing.
  - Do NOT edit generated files in `convex/_generated/`.

- Function registration and calling:
  - Public APIs: use `query`, `mutation`, and `action`. Private/internal helpers: use `internalQuery`, `internalMutation`, `internalAction` and call them via the `internal` object from `_generated/api`.
  - File-based routing: a function exported from `convex/foo.ts` named `bar` is referenced as `api.foo.bar` (nested directories map into `api.<dir>.<file>.<export>`).
  - Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with FunctionReferences from `_generated/api` when calling other Convex functions.
  - When calling functions in the same file, add an explicit return type annotation to avoid TypeScript circularity issues.

- HTTP endpoints, actions, crons, and storage:
  - HTTP endpoints (if present) live under `convex/http.ts` and are registered with `httpRouter` / `httpAction`.
  - Actions that use Node.js must include `"use node"` at the top of the file and must NOT access `ctx.db` (actions do not have DB access).
  - Schedule background work using the `cronJobs()` API (`crons.interval` / `crons.cron`) and export the cron object as the default export.
  - Store large files via Convex storage (`ctx.storage`) and prefer querying `_storage` via `ctx.db.system` for metadata.

- TypeScript / tooling conventions:
  - Respect the repo's TypeScript project layout; use `tsc -b` for full builds.
  - Use the `@` import alias (configured in `vite.config.ts`) for imports from `src/`.
  - Linting enforces types + ESLint rules (`npm run lint`); the repo uses `@convex-dev/eslint-plugin`.
  - Dev runs both front and backend using `npm-run-all` in `npm run dev` (see `package.json`).

---

## AI assistant / other assistant configs found

- `.cursor/rules/convex_rules.mdc` — Convex-specific guidelines were found; they document function syntax, validators, file-based routing, cron and Action rules, and TypeScript tips. Copilot should follow those Convex rules when generating or editing code in `convex/`.

---

## Where to look for details

- Project README: `README.md`
- Convex backend README: `convex/README.md`
- Schema: `convex/schema.ts`
- Generated Convex APIs & types: `convex/_generated/`
- Tooling & aliases: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`

---

## Tests

- Unit/component tests: Run with `npm test` (headless) or `npm run test:ui` (interactive UI, Vitest). Sample test: `src/sample.test.ts`.
- E2E/browser tests: Run with `npm run test:e2e` (Playwright). Sample test: `tests/sample.spec.ts`. First time, run `npx playwright install` to install browsers.
- Config files: `vitest.config.ts`, `playwright.config.ts` at repo root.

### Testing Guidelines

- **Boundary Testing:** Prefer boundary and outcome-based tests over implementation details. Test for the presence of elements, API call success/failure, or observable behaviors—not specific values or messages.
- **Non-value Based Tests:** Avoid assertions on exact values, error messages, or internal state. For example, when testing REST API failures, assert that the call failed, not the specific error message.
- **Refactor-friendly Tests:** Write tests that allow for internal refactoring without breaking. Focus on concrete outcomes and user-visible effects.

> These guidelines ensure tests remain robust, maintainable, and do not hinder refactoring or evolution of the codebase.

---

## Architectural Conventions

- **Folder Structure:**
  - Frontend code in `src/`, backend in `convex/`, tests in `src/` (unit) and `tests/e2e` (E2E).
  - Generated code lives in `convex/_generated/` (never edit directly).
- **Modularity:**
  - Keep functions, components, and utilities small and focused.
  - Use file-based routing for Convex functions; maintain clear separation between public APIs and internal helpers.
- **Dependency Boundaries:**
  - Avoid cross-layer imports (e.g., backend logic in frontend).
  - Use the `@` alias for frontend imports; backend should only import from `convex/`.

## Editing Guidelines

- **Naming:**
  - Use descriptive, consistent names for files, functions, and variables.
  - Prefer camelCase for variables/functions, PascalCase for components/classes.
- **File Organization:**
  - Group related code by feature or domain.
  - Keep test files close to the code they test, except E2E tests (in `tests/e2e`).
- **Code Style:**
  - Follow TypeScript and ESLint rules enforced by `npm run lint`.
  - Prefer explicit types and minimal inline comments.

## Expanded Testing Guidelines

- **Boundary Testing:**
  - Test observable outcomes, not implementation details or exact values/messages.
  - Assert on element presence, API call success/failure, or user-visible effects.
- **Edge Cases & Error Handling:**
  - Include tests for edge cases, invalid inputs, and error scenarios.
  - When testing REST API failures, assert the call failed, not the specific error message.
- **Mocking Strategies:**
  - Use mocks/stubs for external dependencies and network calls.
  - Prefer mocking at the boundary, not internal implementation.
- **Refactor-friendly Tests:**
  - Write tests that allow for internal refactoring without breaking.
  - Focus on concrete outcomes and user-visible effects.
- **Sample Test Example:**
  - E2E: `await expect(page.locator('header')).toBeVisible();` (checks header exists, not its text)
  - API: `expect(response.status).toBe(400);` (checks failure, not error message)

> These guidelines maximize maintainability, developer confidence, and allow for safe refactoring.

---

## Convex Backend Guidelines

- **Function Syntax:**
  - Always use the new object syntax for Convex functions with explicit `args` and `returns` validators from `convex/values`.
  - Use `v.null()` for functions that return nothing.
- **Function Registration:**
  - Public APIs: use `query`, `mutation`, `action`.
  - Internal helpers: use `internalQuery`, `internalMutation`, `internalAction` (call via `internal` from `_generated/api`).
  - Always include argument and return validators.
- **Function Calling:**
  - Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with FunctionReferences from `_generated/api`.
  - When calling functions in the same file, add explicit return type annotations to avoid TypeScript circularity.
- **File-based Routing:**
  - Functions are referenced as `api.<dir>.<file>.<export>` or `internal.<dir>.<file>.<export>`.
- **Validators:**
  - Use the correct validator for each Convex type (see table in `.cursor/rules/convex_rules.mdc`).
  - Use `v.record()` for record types; `v.bigint()` is deprecated, use `v.int64()`.
- **Schema:**
  - Always define schema in `convex/schema.ts` using `defineSchema` and `defineTable`.
  - System fields (`_id`, `_creationTime`) are auto-added.
  - Index fields must be queried in the same order as defined.
- **HTTP Endpoints:**
  - Define in `convex/http.ts` using `httpRouter` and `httpAction`.
  - Endpoints are registered at the exact path specified.
- **Actions:**
  - Add `"use node"` to files using Node.js built-ins.
  - Actions must not access `ctx.db`.
- **Crons:**
  - Use `crons.interval` or `crons.cron` for scheduling.
  - Export the cron object as default.
- **File Storage:**
  - Use `ctx.storage.getUrl()` for signed URLs.
  - Query `_storage` system table for metadata.
- **TypeScript:**
  - Use strict types, especially for document IDs (`Id<'table'>`).
  - Use `as const` for discriminated unions.
  - Add `@types/node` for Node.js modules.
- **Query & Mutation:**
  - Use indexes for queries, not filters.
  - Use `.unique()` for single document queries.
  - Use `ctx.db.replace` and `ctx.db.patch` for document updates.
- **Pagination:**
  - Use `paginationOptsValidator` for paginated queries.
  - `.paginate()` returns `{ page, isDone, continueCursor }`.
- **Full Text Search:**
  - Use `.withSearchIndex()` for search queries.
- **Examples:**
  - See `.cursor/rules/convex_rules.mdc` for real-world chat-app backend and schema examples.

---

Keep this file focused on repository-specific, actionable instructions for Copilot sessions: commands to run, where to find types and generated code, and Convex-specific patterns to preserve.
