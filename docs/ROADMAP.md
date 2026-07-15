# Product Lifecycle Roadmap (ROADMAP.md)

## Overview
- **Development Model**: Iterative Release Train
- **Current Milestone**: Phase 1 Complete (Pre-production Core Web Applet v0.9)
- **Goal**: Transition from a single-tenant CMS into a robust student developer portal.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Strategic Roadmap (v0.9)

---

## 1. Architectural Evolution Plan

```
  +---------------------------------------------------------------------------------+
  | PHASE 1: SYSTEM FOUNDATION & PRE-PRODUCTION (Months 1-2)                       |
  | Target: Single-screen web applet with full CMS, DB and RAG AI (v0.9 - COMPLETED) |
  +---------------------------------------------------------------------------------+
                                           |
                                           v
  +---------------------------------------------------------------------------------+
  | PHASE 2: TRANSACTIONAL HARDENING & AUTHENTICATION (Months 3-4)                 |
  | Target: Complete Firebase Auth integration, JWT verification, and pgvector     |
  +---------------------------------------------------------------------------------+
                                           |
                                           v
  +---------------------------------------------------------------------------------+
  | PHASE 3: LIVE OPERATIONS & COLLABORATION (Months 5-6)                           |
  | Target: WebSockets, real-time leaderboard, and multi-user administrative panels  |
  +---------------------------------------------------------------------------------+
```

---

## 2. Granular Phased Milestones

### Phase 1: Core Portal & Dynamic CMS (COMPLETED)
- **Primary Objective**: Build a high-fidelity website integrating relational storage and a secure visual CMS.
- **Key Deliverables**:
  - Relational database schema configured with Drizzle ORM on PostgreSQL.
  - Immersive Visual Terminal UI with custom dark styles.
  - Interactive CMS panel managing 9 distinct content layouts.
  - RAG-enabled AI Technical Advisor using the server-side Gemini SDK.
  - Verification code checker validating certificate credentials on-screen.

---

### Phase 2: Staging Security & Full Authentication (Months 3-4)
- **Primary Objective**: Secure client operations with verified developer identities.
- **Key Deliverables**:
  - Establish Google and GitHub OAuth social login using **Firebase Authentication**.
  - Replace mock headers with cryptographic bearer token verify middlewares.
  - Refactor `kb_chunks` to use **pgvector** semantic similarity searching.
  - Integrate visual image crop-and-upload tools saving directly to cloud storage (e.g. AWS S3 or GCP Cloud Storage).

---

### Phase 3: Real-Time Hackathon Platform (Months 5-6)
- **Primary Objective**: Introduce interactive systems for live competition days.
- **Key Deliverables**:
  - Integrate **WebSockets (`socket.io`)** to broadcast instant seat slot deductions.
  - Build a live **Interactive Leaderboard** where admins can submit scores, updating rankings in real-time.
  - Implement a digital **Team Builder** matching solo student developers based on tech profiles.

---

### Phase 4: Decentralized Builder Ecosystem (Months 7-12)
- **Primary Objective**: Expand certifications to verified on-chain identifiers.
- **Key Deliverables**:
  - Issue certificates as verifiable, gasless non-fungible digital badges.
  - Integrate structured developer profiles displaying aggregate metrics (hackathons completed, teams led).
  - Launch an API developer sandbox letting other student clubs verify user achievements.

---

## 3. Key Performance Indicators (KPIs)

To evaluate the success of each roadmap phase, the engineering team tracks the following system performance indices:

```
+--------------------------+-----------------------+-----------------------+
| PERFORMANCE METRIC       | CURRENT BASELINE      | TARGET (PHASE 3)      |
+--------------------------+-----------------------+-----------------------+
| 1. API Response Latency  | <120ms                | <50ms (Edge Cache)    |
| 2. AI Answer Accuracy    | ~85% (Local RAG)      | >98% (pgvector + RAG) |
| 3. Registration Success  | 100% (Single User)    | >99.9% (Concurrent)   |
| 4. Security Audit Score  | Passing               | Zero high vulnerabilities|
+--------------------------+-----------------------+-----------------------+
```
