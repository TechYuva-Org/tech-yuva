# Component Specifications (COMPONENTS.md)

## Overview
- **Framework**: React 18 with TypeScript functional components.
- **Styling**: Tailwind CSS utility classes with micro-interactions from `motion/react`.
- **Directory**: `/src/components/`
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Codebase Manifest (v0.9)

---

## 1. Primary Components Directory

| Component Name | File Path | Primary Responsibility |
|---|---|---|
| **AdminCMS** | `/src/components/AdminCMS.tsx` | Dashboard panel for managing site settings, SEO, content lists, metrics, and uploading mock media assets. |
| **AdminTerminal** | `/src/components/AdminTerminal.tsx` | Command-line interface mimicking a developer shell to manage database events, announcements, and metrics. |
| **ArchitectureDocs** | `/src/components/ArchitectureDocs.tsx` | Immersive full-screen system design guide containing API routes and table entity documentation. |
| **BlurredImage** | `/src/components/BlurredImage.tsx` | Optimized media component displaying a CSS-blurred fallback while lazy loading the source asset. |
| **CertificateViewer** | `/src/components/CertificateViewer.tsx` | Displays a printable, verified visual certificate complete with signature simulations and hashes. |
| **EventRegisterModal** | `/src/components/EventRegisterModal.tsx` | Modal overlay managing student registrations, capacity checks, and form validation states. |
| **FounderVision** | `/src/components/FounderVision.tsx` | Renders Lakshay Soni's founding quote, biography, and interactive developer work video stream. |
| **HeroTerminal** | `/src/components/HeroTerminal.tsx` | Home page greeting element simulating compilation audits and system status metrics. |
| **IdentitySwitcher** | `/src/components/IdentitySwitcher.tsx` | Role picker header widget facilitating rapid switches between visitor, member, and admin roles. |
| **MemberDashboard** | `/src/components/MemberDashboard.tsx` | Secure member area displaying registered tickets, status checks, and certificates. |
| **TechYuvaAI** | `/src/components/TechYuvaAI.tsx` | Interactive RAG chatbot assisting users with system questions using Gemini. |
| **TechYuvaLogo** | `/src/components/TechYuvaLogo.tsx` | Customizable SVG logo element styled with custom branding glows. |

---

## 2. In-Depth Component Specifications

### A. Component: `AdminCMS`
- **Purpose**: Provides a tabbed administration panel managing the full CMS lifecycle.
- **Props**: None (Mounts directly inside the admin router view).
- **Hooks Used**:
  - `useQuery` / `useMutation`: Syncs CMS records and refetches site parameters.
  - `useState`: Manages local edit buffers for tables.
- **API Interactions**:
  - `PATCH /api/cms/hero`, `PATCH /api/cms/founder`, `PATCH /api/cms/site`, `PATCH /api/cms/seo`
  - `POST`, `PATCH`, `DELETE` over `/api/cms/about`, `/api/cms/offerings`, `/api/cms/gallery`, `/api/cms/sponsors`, `/api/cms/testimonials`
- **Performance Notes**:
  - Employs form level debounce to prevent excessive database calls during input typing.
  - Inputs are segmented by tab blocks to prevent component re-render loops.

---

### B. Component: `AdminTerminal`
- **Purpose**: A command-line based live database management tool.
- **Props**:
  - `currentUser`: Identifies the current administrator email.
  - `onLoginAsAdmin`: Fallback callback if visitor profile accesses terminal commands.
- **Supported Shell Commands**:
  - `help`: Prints available command listings.
  - `stats`: Compiles a tabular grid of registered counts, capacities, and certificate issuance indices.
  - `events`: Retrieves live tickets.
  - `announcement [text]`: Creates an interactive system-wide alert.
  - `clear`: Triggers buffer flush.
- **Performance Notes**:
  - Uses a lightweight array buffer (`useState<string[]>([])`) representing terminal outputs. Limits terminal lines to a maximum of `100` elements to conserve browser memory.

---

### C. Component: `CertificateViewer`
- **Purpose**: Renders an elegant participation or completion card with unique security verification codes.
- **Props**:
  - `certificate`: The active `Certificate` record object (with recipient name, event name, verification hash).
  - `onClose`: Closes the lightbox preview modal.
- **Key Interactivity**:
  - Incorporates an automatic `Print` button triggering browser layout adjustments:
    ```css
    @media print {
      body * { display: none; }
      #certificate-card { display: block; width: 100%; }
    }
    ```
- **Performance Notes**:
  - Uses CSS filters to simulate handwritten fountain signatures. Bypasses third-party canvas libraries to minimize production bundle size.

---

### D. Component: `TechYuvaAI`
- **Purpose**: An AI technical advisor chat widget.
- **Props**:
  - `currentUser`: Optional user context to customize greetings (e.g. *"Hello Priya!"*).
- **Hooks Used**:
  - `useMutation` (via Axios / Fetch): Posts queries to the server's RAG controller.
  - `useRef`: Standard scroll tracking keeping the active message in viewport focus.
- **Performance Notes**:
  - Chat bubbles employ staggered slide fade-in entries (`motion/react`) for a polished natural language typing flow.
