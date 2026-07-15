# Tech Yuva — Where Youth Meet to Build Future Tech

![Tech Yuva Banner](https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop)

Tech Yuva is the flagship student-led innovation guild empowering developers to launch real systems securely. We transition students from tutorial hell to actual production deployments, client architectures, and high-stakes hackathons.

## 🚀 Vision
> "I observed hundreds of brilliant young developers stuck in tutorial hell, spending hours building identical generic todo apps with zero actual production launch exposure. Tech Yuva was created to smash those constraints. We don't teach. We deploy alongside you."  
> — **Lakshay Soni**, Visionary Council Lead

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4)
- **Database:** Neon Serverless Postgres
- **ORM:** Drizzle ORM
- **Authentication:** Custom Magic Link OTP + Session Tokens (nanoid)
- **Deployment:** Vercel (Frontend & Serverless Edge)

## ⚡ Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DakshChaudhary2668/tech-yuva.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and configure your Neon Postgres database:
   ```env
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/tech_yuva?sslmode=require"
   ```

4. **Database Migrations & Seeding:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The site will be running at `http://localhost:3000`.

## 📁 Architecture Overview

- `src/components/`: Modular React components (Hero, FounderVision, CMS Panels).
- `src/db/`: Drizzle ORM configurations and schema definitions.
- `server.ts`: The core Node/Express API routes serving auth and chat endpoints.

## 🔒 Security

All IDs and session tokens are generated using cryptographically secure `nanoid` logic. Database connections to Neon are strictly typed and managed via Drizzle.

## 📜 License

© 2026 Tech Yuva Guild Council. All rights secured internationally.
