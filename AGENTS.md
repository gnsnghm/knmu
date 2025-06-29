# AGENTS.md — Mono-repo (React backend & Next.js frontend)

<!-- ─────────────────────────────────────── -->

## 0. Scope

This file applies to the entire repository.
Codex MUST obey deeper-nested AGENTS.md files if they exist.

## 1. Project Layout

- `backend/` : React based API layer.
- `frontend/` : Next.js based UI layer.
- `db/` : Database schema and migrations.

## 2. Coding Guidelines

- **Language**: Use TypeScript for both backend and frontend.
- **Linting**: Use ESLint with TypeScript support.
- **Formatting**: Use Prettier for code formatting.
- **Testing**: Use Jest for unit tests and integration tests.
- **Imports**: Use absolute imports for better readability.
- **Env**: Use `.env` files for environment variables, and ensure they are not committed to the repository.

<!-- ─────────────────────────────────────── -->

## 3. Build & Test Commands

### Backend

```bash
pnpm --filter backend dev        # local dev server
pnpm --filter backend build      # tsc && node build/
```

### frontend

```bash
npm --filter frontend dev        # local dev server
npm --filter frontend build      # next build
```

<!-- ─────────────────────────────────────── -->

## 4. Pull-request Guidelines

- Title: `[feature|bugfix|chore] (<scope>): <subject>`
- Body sections:
  1. Why - background / linked issues
  2. What - summary of changes
  3. How tested - commands & screenshots
- Auto-close related issues via keywords in the body:
  - `Fixes #123`
  - `Closes #456`

## 5. Build

- To lanuch local dev, rund:`docker compose up --build`

## 6. Fobidden Actions

- Do **NOT** modify the root `package.json` or `pnpm-workspace.yaml` files.
- Do **NOT** commit generated files (e.g., `build/`, `dist/`, etc.).
- Network access is sandboxed. Do **NOT** attempt to access external APIs or databases directly.
