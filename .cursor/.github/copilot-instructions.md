# Copilot Instructions

## Repository overview
- Nx monorepo with JavaScript/TypeScript and Python.
- Frontend: `apps/web` (React 19 + Vite).
- Backend: `apps/api` (FastAPI + Supabase/Postgres).
- E2E: `apps/web-e2e` (Playwright).

## How to run
- Frontend dev: `npx nx serve web`
- Frontend build: `npx nx build web`
- Frontend tests: `npx nx test web`
- Frontend lint: `npx nx lint web`
- E2E tests: `npx nx e2e web-e2e`
- API local dev:
  - `cd apps/api`
  - `pip install -r requirements.txt`
  - `python -m uvicorn main:app --reload`

## Conventions
- Prefer Nx targets for JS/TS tasks; avoid ad-hoc scripts.
- Keep React components functional and colocate styles with the feature.
- Keep FastAPI changes in `apps/api/main.py` unless you are splitting into modules.
- Use `.env.example` and existing `.env` files for required variables; never commit secrets.
- Update `package.json` and `package-lock.json` together when changing JS deps.
