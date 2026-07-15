# Architectural Design Decisions (DESIGN_DECISIONS.md)

## Overview
- **Document Focus**: Conceptual Justification Logs (ADRs)
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Design Records (v0.9)

---

## ADR 1: Why React with Vite?

### Decision
The platform frontend is constructed entirely as a React 18 Single-Page Application (SPA) compiled via Vite.

### Rationale
- **Performance**: Vite offers near-instant compilation times in development by using Native ES Modules. In production, it builds extremely optimized, minified bundles using Rollup.
- **Dynamic Client States**: A student community platform requires instantaneous client response states (modal drawers, terminal inputs, live certificates). React's virtual DOM reconciliation minimizes page redraw delays compared to traditional multi-page systems.
- **Developer Ecosystem**: Rich community libraries (like `lucide-react`, `motion/react`, and `recharts`) allow our student engineers to focus on product features instead of rewriting complex UI blocks from scratch.

---

## ADR 2: Why PostgreSQL & Drizzle ORM?

### Decision
To use Google Cloud SQL PostgreSQL paired with Drizzle ORM for schema and data operations.

### Rationale
- **Relational Integrity**: Managing events, registrations, users, and certificates is a highly relational problem. A relational engine like PostgreSQL enforces structural constraints (e.g. `UNIQUE` indices, cascading foreign keys) to prevent orphaned registrations or double-bookings.
- **Type-Safe Queries**: Traditional ORMs like Prisma or raw SQL strings introduce compile-time blind spots. Drizzle ORM allows us to write query builders in pure, native TypeScript:
  ```typescript
  const result = await db.select().from(events).where(eq(events.id, targetId));
  ```
  If an engineer renames the `capacity` column in schema configs, compilation fails immediately, preventing production deployment of broken database references.

---

## ADR 3: Why a Full-Stack Express Server instead of Serverless?

### Decision
Deploy the system as a monolithic, self-contained full-stack Express server container on Cloud Run.

### Rationale
- **Simplicity of Dev Sandbox**: Managing a single repository with one build command (`npm run build`) allows developers and evaluators to run and audit the entire system with zero external infrastructure setup.
- **Bypassing Serverless Cold-Starts**: Serverless functions can introduce lag on database connections. Hosting an active Express process ensures immediate connection pooling, lowering endpoint response times to sub-100 milliseconds.

---

## ADR 4: Why RAG over Fine-Tuning?

### Decision
Implement Retrieval-Augmented Generation (RAG) using server-side Gemini 3.5 instead of fine-tuning or training custom models.

### Rationale
- **Factuality**: Fine-tuned models suffer from hallucinations and are expensive to retrain when event schedules or leadership details change.
- **Agility**: With RAG, updating the system’s knowledge is as simple as inserting a new row into the `kb_chunks` table via the CMS. The AI instantly reads the updated database row on its next query round-trip.

---

## ADR 5: Why Monochromatic Dark Theme & Terminal Aesthetics?

### Decision
Strict monochromatic dark-noir UI (`#0B0F19`) accented with crisp monospace elements and cyan Highlights.

### Rationale
- **Target Audience Alignment**: Student developers, hackers, and software architects associate terminal layouts and monospace codes with high-quality, professional hacker spaces.
- **Low Fatigue**: Dark themes reduce eye strain during extended hackathons and development sessions.
- **Zero Clutter**: Solid dark canvases draw focus directly to content elements (active initiatives, registration states, certificates), avoiding unnecessary visual noise.
- **Premium Executive Feel**: High-contrast borders (`border-white/10`) and glassmorphic panels establish a premium, polished dashboard vibe.
