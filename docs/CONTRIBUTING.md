# Developer Contribution Guidelines (CONTRIBUTING.md)

## Overview
- **Development Model**: Open-Source Student-Led Core
- **Target Branch**: `main` (Production), `dev` (Staging/Integration)
- **Primary Standard**: Conventional Commits, Strict Linting, Compile-Safe Builds
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Contributor Manual (v0.9)

---

## 1. Local Project Setup & Environment Configurations

To start developing on Tech Yuva:

### A. Clone & Install Dependencies
1. Clone the repository to your local system:
   ```bash
   git clone https://github.com/techyuva/platform.git
   cd platform
   ```
2. Install the required Node packages:
   ```bash
   npm install
   ```

### B. Environment Configurations (`.env`)
Create a local `.env` file at the root. Do NOT commit actual production keys.
```env
# Database Credentials
DATABASE_URL=postgres://admin:password@localhost:5432/techyuva

# Server Variables (Production bindings)
PORT=3000
NODE_ENV=development

# Gemini API Key for Server-side RAG Advisor
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 2. Command Pipeline Reference

Run the following commands during feature implementation to ensure build validity:

- **Run Dev Server**:
  ```bash
  npm run dev
  ```
  Starts both the Vite asset compiler and the Express server in dual development mode.
- **Run Code Linter**:
  ```bash
  npm run lint
  ```
  Runs `tsc --noEmit` and style validators to block syntactic regression.
- **Compile Production Bundle**:
  ```bash
  npm run build
  ```
  Compiles client assets to `dist/` and bundles `server.ts` into a self-contained CommonJS target (`dist/server.cjs`) using `esbuild`.
- **Start Compiled Target**:
  ```bash
  npm run start
  ```
  Launches the production-ready compiled backend server.

---

## 3. Git Workflow & Conventional Commits

Tech Yuva strictly enforces **Conventional Commits** to auto-generate changelogs and maintain clarity:

### Format
`type(scope): succinct description of modification`

### Categories
- `feat`: A new user-facing capability (e.g. `feat(cms): add drag-and-drop file upload progress`).
- `fix`: Resolving a bug (e.g. `fix(db): wrap slot deduction in transaction`).
- `docs`: Modifying system documentation files (e.g. `docs(security): specify threat model details`).
- `style`: Changes that do not affect the meaning of the code (whitespace, formatting, semicolons).
- `refactor`: Rewriting code without changing user-facing capabilities.

### Sample Commit History
```
feat(ai): integrate Gemini 3.5 secure chat streaming
fix(auth): correct requireAdmin authorization email comparison
docs(db): describe unique constraints on registrations
```

---

## 4. Pull Request (PR) Requirements Checklist

Before submitting a PR to the integration branch:
1. **Sync Database Schema**: Ensure Drizzle schemas (`src/db/schema.ts`) match local databases.
2. **Build Verification**: Run `npm run lint` and `npm run build` locally. The PR must build green.
3. **No Dead Code**: Remove all unused debug statements (`console.log`, `debugger`, commented-out blocks).
4. **Documentation**: If your feature introduces a new API endpoint, update `/docs/API.md` and `/docs/COMPONENTS.md` before merging.
