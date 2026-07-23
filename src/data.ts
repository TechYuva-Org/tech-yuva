import { EventItem, GalleryItem, Sponsor, Testimonial } from "./types";

export const UPCOMING_EVENTS: EventItem[] = [
  {
    id: "drop-hack-26",
    title: "DROP HACK'26",
    category: "hackathon",
    date: "2026-08-29",
    rawDate: "August 29, 2026",
    time: "10 Hours",
    venue: "Partner Event (Unstop)",
    tags: ["AI", "Web3", "Cyber Security", "FinTech", "Healthcare"],
    description: "Tech Yuva is excited to announce that we're the Official Community Partner for DROP HACK'26! Compete with some of the brightest minds for a ₹50,000+ Prize Pool. Perks include Certificates, Goodies, and Merch.",
    status: "upcoming",
    externalLink: "https://unstop.com/hackathons/drophack-siec-community-1701822?lb=e14Q58g&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Manav04mahawar",
    featured: true,
    image: "/drophack-poster.png"
  }
];

export const PAST_EVENTS: EventItem[] = [];

export const GALLERY_ITEMS: GalleryItem[] = [];

export const SPONSORS: Sponsor[] = [];

export const TESTIMONIALS: Testimonial[] = [];

export const GENERAL_BLUEPRINT_DOCS = {
  uxArchitecture: {
    title: "1. UX Architecture",
    content: "The Tech Yuva system organizes developer touchpoints into a unified cognitive funnel, designed to convert passive tech enthusiasts into active, contributing open-source leaders.",
    items: [
      {
        label: "Funnel Phase 1: Interactive Epiphany (Aesthetic Attraction)",
        desc: "Captivating users through cinematic typography, high-performance scroll interactions, and reactive visual mockups (Scroll-driven WebGL look alike Terminal code loops)."
      },
      {
        label: "Funnel Phase 2: Knowledge Accumulation (Offerings)",
        desc: "Structured distribution of club values: Hackathons, hands-on Workshops, Incubation days, and networking panels styled as modular bento grid items to reduce cognitive load."
      },
      {
        label: "Funnel Phase 3: Immediate Conversion (AI Playpen & Flow)",
        desc: "Allowing users to ask questions instantly to YuvaAI without filling slow registration forms first. Registration logic is simplified using frictionless inline models."
      },
      {
        label: "The Value Loop Model",
        desc: "Learn (Workshops) ➡️ Build (Hackathons) ➡️ Pitch (Startup Accelerator Nights) ➡️ Lead & Sponsor (Networking Loops)."
      }
    ]
  },
  wireframeLayout: {
    title: "2. Visual Wireframe Map",
    content: "Visualizing layout boundaries, grid structural limits, and visual elements on Desktop and Mobile viewports.",
    codeBlock: `
[HEADER RAIL: Logo "TECH YUVA"  | Links: About, Offers, Events, Gallery, Specs | Button: JOIN CLI ]
--------------------------------------------------------------------------------------------------
[HERO ZONE]
  Left Pane: Branding & Action                        Right Pane: The Console Frame
  +--------------------------------------------+      +-------------------------------------------+
  | TAGLINE: "Where Youth Meet To Build..."    |      |  | ⬤ ⬤ ⬤  yuva-terminal:~/main.js   |  |
  |                                            |      |  +---------------------------------------+  |
  | TITLE: TECH YUVA                           |      |  | const yuva = {                         |  |
  |        [The Future, Crafted]               |      |  |   dream: "Build Future Tech",        |  |
  |                                            |      |  |   learn: true                         |  |
  | CTAs: [Explore Events]  [Architect Docs]   |      |  | };                                    |  |
  +--------------------------------------------+      +-------------------------------------------+
--------------------------------------------------------------------------------------------------
[BENTO SECTIONS] -> Community Info Cards -> What We Offer (Grid distribution)
[FOUNDER PITCH]  -> Video Overlay / Hover trigger quote / Vision of youth
[EVENTS CENTER]  -> Carousel of active registration pipelines with counter badges
[marquee sponsor rail] -> Continuous horizontal brand logo loop
[FLOATING AI ENGINE]   -> Chat widget toggled in bottom-right corner
`
  },
  designSystem: {
    title: "3. Design System Specs",
    content: "Our custom theme guidelines ensure optimal visual harmony and absolute developer affinity.",
    items: [
      { label: "Noir Canvas Bg", desc: "#0A0A0A — Purified midnight canvas maximizing component visual contrast." },
      { label: "Secondary Slate Bg", desc: "#111827 — Depth-creating backdrop for cards, borders, and sidebar rails." },
      { label: "Card Backdrop", desc: "#1F2937 (with rgba blur padding) — Sophisticated structural paneling." },
      { label: "Primary Blue Accent", desc: "#1E90FF (Dodger Blue) — Brand core, signaling professional engineering." },
      { label: "Neon Highlit Blue", desc: "#00BFFF (Deep Sky Blue) — Decorative text glow, active states, buttons." },
      { label: "Saffron Ignition", desc: "#FF7A00 — Spotting attention points, youth energy and startup drive." },
      { label: "Emerald Success Green", desc: "#22C55E — Active logs, live terminal logs, completed checkmarks." },
      { label: "Display Typography", desc: "Space Grotesk / NeuMachina emulation (Sharp wide tracking, upper-case displays)." },
      { label: "Body & Code Typography", desc: "Inter (Neutral readability) paired with JetBrains Mono (Tech-grade metrics)." }
    ]
  },
  componentTree: {
    title: "4. Component Architecture",
    content: "Our modular file architecture prevents long file limits and fosters high code portability.",
    codeBlock: `
Root Container
 ├── main.tsx (DOM bootstrap)
 ├── App.tsx (System Layout & Section Coordinates)
 ├── types.ts (Data structure guarantees)
 ├── data.ts (Shared values, metrics, & technical specs)
 ├── server.ts (Safe server architecture with lazy Gemini SDK binding)
 └── components/
      ├── ArchitectureDocs.tsx (Sliding engineering specs panel)
      ├── HeroTerminal.tsx (Cinematic loop console emulator)
      ├── TechYuvaAI.tsx (Bottom-right conversational AI module)
      ├── FounderVision.tsx (Inspiring play/hover element)
      └── EventRegisterModal.tsx (Clean user registration dialog)
`
  },
  animationPlan: {
    title: "5. Animation & Scroll Blueprint",
    content: "Animations work as cognitive guides. We keep them clean and highly performant.",
    items: [
      { label: "Hero Terminal Scroll-Execution", desc: "A simulation of real-time compiling. As user scrolls, the lines of code on the right panel are typed out, then compilation feedback is displayed inside a mock console output." },
      { label: "Micro-Hover Floating Accents", desc: "Using fine Framer Motion / Motion translations on the y-axis, simulating organic hovering state (floating laptop looks lightweight)." },
      { label: "Section Stagger entrance", desc: "Sections and cards fade-in-up with 0.15s stagger delays to keep scrolling interactive." },
      { label: "Continuous Marquee Sponsors", desc: "CSS translation loop of infinite logos with a soft hover pause state." }
    ]
  },
  nextjsConversion: {
    title: "6. Next.js + Tailwind Structure Conversion Guide",
    content: "Need to export this to a Next.js App Router setup? Follow this beautiful blueprint directory structure directly:",
    codeBlock: `
tech-yuva-nextjs/
 ├── app/
 │   ├── layout.tsx         # Global theme setup & fonts
 │   ├── page.tsx           # Home entry page (renders index sections)
 │   ├── api/
 │   │   └── chat/
 │   │       └── route.ts   # Server-side Gemini Route (Edge/Node runtime)
 │   └── register/
 │       └── page.tsx       # Standalone registration layout
 ├── components/
 │   ├── HeroTerminal.tsx   # "use client" console rendering
 │   ├── TechYuvaAI.tsx     # Client-side floating speech panel
 │   └── ArchitectureDocs.tsx # Slideshow details drawer
 ├── tailwind.config.ts     # Brand color theme injections
 ├── package.json           # Next.js 14+ / 15+ declarations
 └── public/
     └── assets/            # Static high-fidelity graphics
`
  },
  databaseSchema: {
    title: "7. Database & Schema Design",
    content: "Tech Yuva uses PostgreSQL powered by Drizzle ORM to maintain type-safe database queries. The schema is designed for speed and relational integrity.",
    items: [
      { label: "Users Table", desc: "Stores member profiles, RBAC roles (Admin/Member/Visitor), and GitHub handles." },
      { label: "Events Table", desc: "Manages cohorts, hackathons, and workshops with capacity limits and active statuses." },
      { label: "Registrations Table", desc: "Relational join table tracking which users are attending which events, with dynamic ticket QR generation." },
      { label: "CMS / Site Settings", desc: "Stores global dynamic data (hero text, featured sponsors, announcements) to avoid hardcoding." }
    ]
  },
  aiIntegration: {
    title: "8. AI Integration & RAG Engine",
    content: "The Tech Yuva AI assistant uses a robust Retrieval-Augmented Generation (RAG) pipeline powered by the Gemini SDK.",
    codeBlock: `
[ USER QUERY ] 
      │
      ▼
[ VECTOR EMBEDDING ] (Generates embedding via Gemini text-embedding model)
      │
      ▼
[ VECTOR SEARCH ] (Queries PostgreSQL pgvector extension for nearest 'kb_chunks')
      │
      ▼
[ CONTEXT ASSEMBLY ] (Injects relevant knowledge base data into the prompt)
      │
      ▼
[ GEMINI INFERENCE ] (Generates accurate, context-aware response)
      │
      ▼
[ CLIENT STREAM ] (Streams tokens back to the chat UI for real-time feel)
`
  },
  deploymentPipeline: {
    title: "9. Deployment & CI/CD Pipeline",
    content: "Tech Yuva embraces the modern serverless ecosystem to ensure zero downtime and infinite scalability.",
    items: [
      { label: "Frontend Hosting (Vercel)", desc: "The React/Vite/Next.js bundle is served via Vercel's Edge Network for global low-latency delivery." },
      { label: "Backend API (Cloud Run / Node)", desc: "Server routes are containerized and deployed to Google Cloud Run, scaling to zero when idle to save costs." },
      { label: "Database Hosting (Neon / Supabase)", desc: "Serverless PostgreSQL ensures connection pooling doesn't bottleneck during high-traffic hackathon registrations." },
      { label: "CI/CD (GitHub Actions)", desc: "Automated linting, type-checking, and preview deployments trigger on every pull request to the main branch." }
    ]
  }
};
