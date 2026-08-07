# Tech Yuva — Supabase BaaS Complete Migration Plan

> **Document Type:** Execution & Implementation Plan  
> **Target Audience:** AI Coding Agents / Software Engineers  
> **Estimated Duration:** 1.5 to 2.5 Weeks (10–14 Working Days / 80 Hours)  
> **Status:** Ready for Execution  

---

## Executive Summary

This document provides a step-by-step, autonomous execution blueprint for migrating the Tech Yuva platform from a monolithic Node.js/Express + Cloud SQL PostgreSQL server architecture to a fully serverless **Supabase Backend-as-a-Service (BaaS)** model.

Upon completion of this plan, the application will:
1. Use **Supabase Auth** (`supabase.auth`) for passwordless Magic Links and OAuth.
2. Use **Supabase Postgres** with **Row Level Security (RLS)** for all 17 database tables.
3. Use **Supabase Storage** (`supabase.storage`) for media, gallery assets, certificates, and avatars.
4. Use **Supabase Edge Functions** (Deno) for secure Gemini RAG AI responses and `pgvector` similarity search (`match_kb_chunks`).
5. Completely eliminate the custom Express server (`server.ts`), converting the React app into a pure static SPA deployable to any CDN.

---

## Timeline & Milestone Summary

| Phase | Milestone | Estimated Time | Key Tasks |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Setup & Database Schema | Days 1–2 (12h) | Provision Supabase project, enable `pgvector`, migrate 17 tables, sync Drizzle schema. |
| **Phase 2** | Supabase Auth & User Triggers | Days 3–4 (16h) | Configure Magic Link/OAuth, create `auth.users` $\rightarrow$ `public.users` trigger, RBAC helper functions. |
| **Phase 3** | Row Level Security (RLS) Policies | Days 5–6 (16h) | Write and apply SQL RLS policies for Public, Member, and Admin roles across all tables. |
| **Phase 4** | Supabase Storage & Client Integration | Days 7–9 (24h) | Set up Storage buckets (`media`, `events`, `certs`), replace Express fetch calls with `@supabase/supabase-js`. |
| **Phase 5** | Edge Functions & RAG AI Migration | Days 10–11 (16h) | Write `match_kb_chunks` SQL RPC, deploy `ai-chat` Edge Function for Gemini API integration. |
| **Phase 6** | Server Retirement & Bible Docs | Days 12–13 (12h) | Delete `server.ts`, test static build, update Engineering Bible documentation set. |
| **TOTAL** | **Full BaaS Migration** | **10–14 Days (80h)** | **100% Serverless BaaS Architecture on Supabase** |

---

## Engineering Bible Document Impacts

The following documents in `docs/engineering/` must be updated during and after execution:
- [00_PROJECT_CONTEXT.md](file:///Users/aksh/tech-yuva/docs/engineering/00_PROJECT_CONTEXT.md): Topology diagram updated to Supabase BaaS + Static SPA.
- [02_ARCHITECTURE.md](file:///Users/aksh/tech-yuva/docs/engineering/02_ARCHITECTURE.md): PostgREST API + Edge Functions replacing Express REST endpoints.
- [03_DATABASE.md](file:///Users/aksh/tech-yuva/docs/engineering/03_DATABASE.md): Supabase Postgres instance details, RLS policies, triggers, and RPC functions.
- [04_AUTH_SYSTEM.md](file:///Users/aksh/tech-yuva/docs/engineering/04_AUTH_SYSTEM.md): Native Supabase Auth replacing custom session/OTP tables.
- [05_CMS.md](file:///Users/aksh/tech-yuva/docs/engineering/05_CMS.md): Direct PostgREST CMS updates guarded by `is_admin()` policy.
- [08_AI_ASSISTANT.md](file:///Users/aksh/tech-yuva/docs/engineering/08_AI_ASSISTANT.md): Edge Function RAG pipeline and `match_kb_chunks` vector RPC.

---

## Detailed Phase-by-Phase Implementation Steps

### Phase 1: Supabase Initialization & Database Migration (Days 1–2)

#### Step 1.1: Install & Link Supabase CLI
```bash
npx supabase init
npx supabase link --project-ref <YOUR_SUPABASE_PROJECT_REF>
```

#### Step 1.2: Database Migration SQL File
Create `supabase/migrations/20260804000000_initial_schema.sql`:

```sql
-- Enable vector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('visitor', 'member', 'admin')),
  github TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Community Members
CREATE TABLE IF NOT EXISTS public.community_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  github TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Events
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hackathon', 'workshop', 'talk', 'bootcamp', 'startup', 'other')),
  date DATE NOT NULL,
  raw_date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past', 'draft', 'completed', 'cancelled')),
  external_link TEXT,
  image TEXT,
  spots_total INT NOT NULL DEFAULT 50,
  spots_left INT NOT NULL DEFAULT 50,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  github TEXT NOT NULL,
  team_size INT NOT NULL DEFAULT 1,
  tech_focus TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  attended BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  event_title TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  verification_code TEXT NOT NULL UNIQUE
);

-- 6. RAG Knowledge Base Chunks
CREATE TABLE IF NOT EXISTS public.kb_chunks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768)
);

-- 7. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  community_name TEXT NOT NULL,
  logo TEXT NOT NULL,
  theme_colors JSONB NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  social_links JSONB NOT NULL,
  footer_text TEXT NOT NULL,
  registration_toggle BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. SEO Settings
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  og_image TEXT NOT NULL,
  keywords TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  json_ld TEXT
);

-- 9. Hero Content
CREATE TABLE IF NOT EXISTS public.hero_content (
  id TEXT PRIMARY KEY DEFAULT 'global',
  badge TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_button1_text TEXT NOT NULL,
  cta_button1_link TEXT NOT NULL,
  cta_button2_text TEXT NOT NULL,
  cta_button2_link TEXT NOT NULL,
  announcement_banner TEXT,
  stats JSONB NOT NULL,
  media_url TEXT,
  terminal_code TEXT NOT NULL
);

-- 10. Founder Content
CREATE TABLE IF NOT EXISTS public.founder_content (
  id TEXT PRIMARY KEY DEFAULT 'global',
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo TEXT NOT NULL,
  intro_video TEXT,
  quote TEXT NOT NULL,
  biography TEXT NOT NULL
);

-- 11. Homepage Settings
CREATE TABLE IF NOT EXISTS public.homepage_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  hero_content_id TEXT REFERENCES public.hero_content(id) ON DELETE SET NULL,
  founder_content_id TEXT REFERENCES public.founder_content(id) ON DELETE SET NULL,
  seo_settings_id TEXT REFERENCES public.seo_settings(id) ON DELETE SET NULL,
  site_settings_id TEXT REFERENCES public.site_settings(id) ON DELETE SET NULL
);

-- 12. About Cards
CREATE TABLE IF NOT EXISTS public.about_cards (
  id TEXT PRIMARY KEY,
  heading TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  image TEXT
);

-- 13. Offerings
CREATE TABLE IF NOT EXISTS public.offerings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- 14. Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  category TEXT NOT NULL,
  stat_label TEXT NOT NULL,
  stat_value TEXT NOT NULL,
  highlight_text TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 15. Sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  website TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'partner' CHECK (tier IN ('platinum', 'gold', 'silver', 'partner')),
  display_order INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status_text TEXT NOT NULL,
  contribution TEXT NOT NULL,
  domain TEXT NOT NULL
);

-- 16. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  avatar TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'urgent')),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

Apply migration:
```bash
npx supabase db push
```

---

### Phase 2: Supabase Auth & Triggers (Days 3–4)

#### Step 2.1: Automatic User Profile Creation Trigger
Create `supabase/migrations/20260804000001_auth_triggers.sql`:

```sql
-- Function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RBAC helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Phase 3: Row Level Security (RLS) Policies (Days 5–6)

Create `supabase/migrations/20260804000002_rls_policies.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Landing Page Content
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read SEO Settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Hero Content" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Public Read Founder Content" ON public.founder_content FOR SELECT USING (true);
CREATE POLICY "Public Read Homepage Settings" ON public.homepage_settings FOR SELECT USING (true);
CREATE POLICY "Public Read About Cards" ON public.about_cards FOR SELECT USING (true);
CREATE POLICY "Public Read Offerings" ON public.offerings FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);

-- 2. Member Policies
CREATE POLICY "Read Own Profile" ON public.users FOR SELECT USING (id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Update Own Profile" ON public.users FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "Read Own Registrations" ON public.registrations FOR SELECT USING (user_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Create Own Registration" ON public.registrations FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Read Own Certificates" ON public.certificates FOR SELECT USING (user_id = auth.uid()::text OR public.is_admin());

-- 3. Admin Full Management Policies
CREATE POLICY "Admin All Users" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Events" ON public.events FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Registrations" ON public.registrations FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Certificates" ON public.certificates FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Site Settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All SEO Settings" ON public.seo_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Hero Content" ON public.hero_content FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Founder Content" ON public.founder_content FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Gallery" ON public.gallery FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Sponsors" ON public.sponsors FOR ALL USING (public.is_admin());
```

---

### Phase 4: Supabase Storage & Client Integration (Days 7–9)

#### Step 4.1: Storage Buckets & Policies
Provision storage buckets: `media`, `certificates`, `avatars`.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Public Access Media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin Upload Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());
```

#### Step 4.2: Frontend Client Initialization (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### Step 4.3: Refactor Authentication in `MemberDashboard.tsx`
Replace custom API fetch calls:
```typescript
// Login with Magic Link
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: `${window.location.origin}/dashboard` }
});

// Auth state listener
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}, []);
```

#### Step 4.4: Refactor File Upload in `AdminCMS.tsx`
```typescript
const handleFileUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

---

### Phase 5: Edge Functions & Vector AI Migration (Days 10–11)

#### Step 5.1: Vector Match Function RPC
Create `supabase/migrations/20260804000003_vector_search.sql`:

```sql
CREATE OR REPLACE FUNCTION match_kb_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  title text,
  category text,
  content text,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    title,
    category,
    content,
    1 - (kb_chunks.embedding <=> query_embedding) AS similarity
  FROM kb_chunks
  WHERE 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

#### Step 5.2: Create Edge Function `supabase/functions/ai-chat/index.ts`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const { prompt } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Generate query embedding via Gemini API
  const embedRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: prompt }] }
      })
    }
  );
  const embedData = await embedRes.json();
  const embedding = embedData.embedding.values;

  // 2. Vector search in Postgres
  const { data: chunks } = await supabase.rpc("match_kb_chunks", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 3
  });

  const context = chunks?.map((c: any) => c.content).join("\n\n") || "";

  // 3. Generate answer from Gemini
  const chatRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Context:\n${context}\n\nUser Question: ${prompt}` }]
        }]
      })
    }
  );
  const chatData = await chatRes.json();
  const answer = chatData.candidates[0].content.parts[0].text;

  return new Response(JSON.stringify({ answer }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

Deploy Edge Function:
```bash
npx supabase secrets set GEMINI_API_KEY=<YOUR_KEY>
npx supabase functions deploy ai-chat
```

---

### Phase 6: Server Retirement & Final Verification (Days 12–13)

1. Delete `server.ts` from the root workspace directory.
2. Remove backend server packages (`express`, `@types/express`, `pg`, `@types/pg`) from `package.json`.
3. Update `vite.config.ts` to output standard static assets for Vercel/Netlify/Cloudflare Pages.
4. Run `npm run build` and `npx tsc --noEmit` to verify type safety.
5. Update Engineering Bible docs in `docs/engineering/`.

---

## Verification & Testing Strategy

1. **Auth & RBAC Test:** Sign up a test user $\rightarrow$ check `auth.users` and `public.users` table sync $\rightarrow$ verify user cannot perform admin updates on CMS tables.
2. **CMS Mutations:** Log in as admin $\rightarrow$ modify hero text $\rightarrow$ verify database update and live frontend rerender.
3. **Storage Upload:** Upload hero media asset $\rightarrow$ verify public URL generated and accessible in browser.
4. **AI Assistant RAG:** Submit test query in `TechYuvaAI.tsx` widget $\rightarrow$ check response against embedded knowledge base.
