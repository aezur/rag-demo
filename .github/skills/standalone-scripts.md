---
name: standalone-scripts
description: Instructions for standalone node scripts located in our scripts folder.
applyTo: '**/scripts/**'
---

# Node Scripts

## Environment

- Node v22.17.0
- Run with `npx tsx` command
- All scripts are standalone.
- All scripts are command-line-runnable.
- Scripts do not import from outside the parent folder.

## Testing

- All scripts require a `*.test.ts` file.
- Robust. Should be test exact implementation details.
  - Example: When testing a function failure, test against the function failing, not the output of the failure.
- Test files use `vitest`.

## Error-handling

- Errors should be logged to the project root at `{{PROJECT_ROOT}}/logs/errors.txt`.
  - Note for implementers: `PROJECT_ROOT` is typically the current working directory returned by `process.cwd()`. Use `path.join(process.cwd(), 'logs/errors.txt')` to construct the log path for consistent logging behavior across scripts.
- Use `try/catch` and graceful fallback patterns.
