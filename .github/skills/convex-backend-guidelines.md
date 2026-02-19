---
name: convex-backend-guidelines
description: Coding conventions for working with convex
applyTo: '**/convex/**'
---

# Convex Backend Guidelines

## Function Syntax & Validators

- Use object syntax for Convex functions with explicit `args` and `returns` validators from `convex/values` (e.g., `v.string()`, `v.null()`).
- Always include argument and return validators; use `v.null()` for void.
- Do NOT edit generated files in `convex/_generated/`.

## Function Registration & Calling

- Public APIs: use `query`, `mutation`, `action`.
- Internal helpers: use `internalQuery`, `internalMutation`, `internalAction` (call via `internal` from `_generated/api`).
- File-based routing: `api.<dir>.<file>.<export>` or `internal.<dir>.<file>.<export>`.
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with FunctionReferences from `_generated/api`.
- Add explicit return type annotations for same-file calls to avoid TypeScript circularity.

## HTTP Endpoints, Actions, Crons, Storage

- HTTP endpoints: define in `convex/http.ts` with `httpRouter`/`httpAction`.
- Actions: add `"use node"` at top, never access `ctx.db`.
- Crons: use `crons.interval`/`crons.cron`, export as default.
- Storage: use `ctx.storage`, query `_storage` for metadata.

## Schema & Validators

- Define schema in `convex/schema.ts` using `defineSchema` and `defineTable`.
- System fields (`_id`, `_creationTime`) are auto-added.
- Index fields must be queried in the same order as defined.
- Use correct validator for each Convex type (see `.cursor/rules/convex_rules.mdc`).
- Use `v.record()` for record types; use `v.int64()` (not `v.bigint()`).

## TypeScript & Tooling

- Use strict types, especially for document IDs (`Id<'table'>`).
- Use `as const` for discriminated unions.
- Add `@types/node` for Node.js modules.

## Query, Mutation, Pagination, Search

- Use indexes for queries, not filters.
- Use `.unique()` for single document queries.
- Use `ctx.db.replace` and `ctx.db.patch` for document updates.
- Use `paginationOptsValidator` for paginated queries.
- `.paginate()` returns `{ page, isDone, continueCursor }`.
- Use `.withSearchIndex()` for full text search.

## Examples & References

- See `.cursor/rules/convex_rules.mdc` for real-world chat-app backend and schema examples.

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
