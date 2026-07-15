# Project Context (CONTEXT.md)

## Overview
- **Product Name**: Tech Yuva
- **Tagline**: Where Youth Meet To Build Future Tech
- **Core Vision**: To bypass low-effort academic coding tasks and expose student builders directly to production-grade product designs, real-time databases, scalable backend systems, and AI-enabled software architectures.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Stable v0.9 (Pre-Production Preview)

---

## 1. Project Vision, Mission & Goals

### Vision
Tech Yuva envisions a decentralized, student-first platform that replaces dry textbooks and passive video tutorials with high-intensity, hands-on architectural experience. The platform serves as a modern ecosystem for young engineers, designers, and innovators to form teams, build genuine database-driven applications, deploy them to live environments, and receive direct startup funding and mentorship.

### Mission
To bridge the gap between academic theory and industry reality by establishing an immersive, highly technical development environment. Tech Yuva provides physical 36-hour hackathons, cohort-based advanced bootcamps, and direct developer micro-grants.

### Long Term Goal
To scale into an open, self-sustaining youth-led technical operating system (OS)—integrating live tournament platforms, automated digital certificate credentials verified on-chain, AI-guided system design advisors, and modular content management pipelines.

### Target Audience
- **Student Developers**: High school and college students looking to escape basic tutorials and build real full-stack systems.
- **Young UI/UX Designers**: Emerging creatives wanting to master Figma-to-code principles, typography hierarchies, and motion-backed user experiences.
- **Startup Founders / Micro-Sponsors**: Mentors, tech founders, and angel investors seeking to scout high-potential junior talent directly through live hackathons.

---

## 2. Product Philosophy & Design Language
Tech Yuva adheres to a high-information-density, premium executive terminal aesthetic:
1. **Dark Mode Monolithic Aesthetic**: Deep slate backdrops (`#0B0F19`), grid alignments, and neon highlights (cyan/blue/emerald) that mimic advanced developer terminals.
2. **Zero Clutter, Maximum Readability**: Strict visual boundaries, clean structural borders (`border-white/10`), and ample negative space.
3. **No Decorative "AI Slop"**: No placeholder text or fake statistics. Real database values, real registration states, real terminal logs, and live certificates.
4. **Micro-interactions & Physics**: Staggered motion entries, physical state transitions, and responsive hover feedback via `motion/react` to establish an immersive experience.

---

## 3. Tech Stack
The platform is built using a modern, robust full-stack architecture:

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Tailwind CSS | Modular component framework, utility styling, strong typing |
| **State & Fetch** | TanStack Query (React Query) v5 | Robust server state caching, auto-refetches, and loading boundaries |
| **Animations** | Motion (from `motion/react`) | Fluid card entries, terminal lines, and modal physics |
| **Backend API** | Node.js, Express | Custom REST server serving CMS, registrations, certificates, and RAG chat |
| **Database** | Cloud SQL (PostgreSQL) | Fully relational, persistent engine handling transactional operations |
| **ORM** | Drizzle ORM | Compile-safe TypeScript-first query builder and migrations |
| **AI Integration** | `@google/genai` (Gemini API) | Server-side LLM processing with RAG (Retrieval-Augmented Generation) |

---

## 4. Repository Folder Structure

```
/
├── .env.example              # Sample environment variables config
├── .gitignore                # Production artifact and log exclusions
├── firebase-applet-config.json # Firebase applet linkage config
├── index.html                # Frontend entry anchor
├── metadata.json             # App name, description, frame permissions
├── package.json              # App dependencies, scripts, and runtime engines
├── server.ts                 # Full-stack Express server entry point (API, Static Serve, RAG)
├── tsconfig.json             # TypeScript compiler constraints
├── vite.config.ts            # Vite asset pipeline configuration
├── docs/                     # Comprehensive Architecture & Product Knowledge Base
│   ├── CONTEXT.md
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   └── ... (additional documentation modules)
└── src/                      # Client-Side Application Code
    ├── main.tsx              # Main hydration entry
    ├── App.tsx               # Primary single-page coordinator (Global state, routers)
    ├── index.css             # Tailwind @import directives and global CSS theme variables
    ├── data.ts               # Local static configurations and fallback models
    ├── types.ts              # Global TypeScript interfaces, schemas, and enums
    ├── db/                   # Database & Schema Core
    │   ├── index.ts          # PostgreSQL pool connection
    │   ├── schema.ts         # Relational tables, columns, and relations
    │   ├── drizzle.config.ts # Drizzle developer schema pipeline configuration
    │   ├── seedCMS.ts        # Database seeder (CMS records, demo registrations)
    │   └── rag.ts            # Local vector/knowledge chunk indexing & retrievers
    └── components/           # Modular Functional UI Components
        ├── AdminCMS.tsx      # Comprehensive site administration dashboard
        ├── AdminTerminal.tsx # Command-line based live event manager
        ├── TechYuvaAI.tsx    # RAG-powered AI technical advisor panel
        ├── CertificateViewer.tsx # Custom layout for credential render & download
        ├── ... (other presentation and interaction helpers)
```

---

## 5. Application Flow

```mermaid
graph TD
    User[Visitor / Student] -->|Access App| App[Vite React Client]
    App -->|Reads Dynamic CMS Data| API_GetCMS[/api/cms/*]
    API_GetCMS --> DB[(PostgreSQL Database)]
    
    User -->|Identity Switcher| Roles{Select Role}
    Roles -->|Visitor| EventReg[Register for Events]
    Roles -->|Member| Dashboard[Member Dashboard & Certificate Download]
    Roles -->|Admin| AdminPanels[Admin CMS Panels / Admin Terminal]
    
    EventReg -->|Submit Form| API_Reg[/api/registrations]
    API_Reg --> DB
    
    Dashboard -->|Verify Code| API_CertVerify[/api/certificates/verify/:code]
    API_CertVerify --> DB
    
    AdminPanels -->|Modify Content| API_CMSPatch[/api/cms/*]
    API_CMSPatch --> DB
    
    User -->|Query TechYuva AI| AI_Chat[AI Terminal Panel]
    AI_Chat -->|Search Knowledge Base| API_RAG[/api/chat]
    API_RAG --> Gemini[Gemini API - Server-side]
    Gemini --> User
```

---

## 6. Core Subsystems & Platforms
1. **Interactive Event Registration Engine**: Dynamic capacity enforcement, automated duplicate prevention, real-time ticket slot deduction, and draft/past statuses.
2. **Secured CMS Engine**: Visual dashboard managing site settings, SEO metadata, hero copy, about modules, gallery grids, testimonials, and sponsor lists.
3. **Automated Certificate Issuer**: Live credential generation featuring unique verification hash generation, visual browser layout printability, and validation routing.
4. **Yuva RAG AI Advisor**: Natural language terminal reading from structured knowledge chunks on leadership structure, event timelines, and tech requirements.
5. **Admin Dev Terminal**: Direct command-line interaction panel simulating a server terminal where admins can type commands (`help`, `stats`, `events`, `announcements`) to manage live infrastructure.

---

## 7. Known Limitations & Roadmap

### Limitations (v0.9)
- **Local Cache Auth**: Current session and identity management rely on user header mocking (`x-user-email`) via the client `IdentitySwitcher` to bypass heavy login walls for evaluator convenience.
- **Sync Image Storage**: Media uploads are mocked with pre-approved high-quality Unsplash hashes as there is no active S3/Cloud Storage object engine integrated.
- **Client-Side PDF Generation**: Certificate download triggers standard browser print dialogs rather than full server-side binary buffer compilation.

### Strategic Roadmap
- **Phase 1**: Transition to complete client-side Firebase Authentication (Google/GitHub Provider Integration).
- **Phase 2**: Add PostgreSQL Vector database extensions (`pgvector`) for live unstructured content indexing inside the RAG sub-agent.
- **Phase 3**: Implement WebSockets for live ticket slot deduction notifications and real-time interactive hackathon leaderboards.

---

## 8. Development & Coding Rules
- **Strict TypeScript**: Never use `any` unless absolutely forced by runtime library definitions.
- **Surgical Edits**: Follow the Read-Modify-Write pattern before modifying existing state files.
- **Tailwind-Only**: Inline style declarations are strictly banned. Use semantic classes.
- **Modular Refactoring**: Do not bloat `App.tsx` with heavy components. Create clean exports in `src/components/`.
- **Accessible Color Contrasts**: Use sharp text colors against dark backdrops (minimum contrast ratio 4.5:1).
