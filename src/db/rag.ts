import { db } from "./index.ts";
import { kbChunks } from "./schema.ts";
import { sql } from "drizzle-orm";

export interface KnowledgeChunk {
  id: string;
  title: string;
  category: string;
  content: string;
}

// Comprehensive initial knowledge base content for Tech Yuva
export const DEFAULT_KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "kb-about-1",
    title: "About Tech Yuva Community",
    category: "about",
    content: "Tech Yuva is an elite, high-quality technology community and accelerator led entirely by young developers and students.\nTagline: 'Where Youth Meet To Build Future Tech'.\nActive Builders: 500+ active youth software engineers, researchers, and product designers.\nEcosystem Accomplishments: 20+ premium tech sprints, hackathons, and physical bootcamps executed.\nTotal Impact: 1000+ student developers equipped with actual production deployment credentials.\nCore Niches: Hackathons, interactive software-craft workshops, competitive algorithms, artificial intelligence agent systems, Web3 infrastructure, and startup incubators."
  },
  {
    id: "kb-vision-1",
    title: "Founder Vision & Leadership Council",
    category: "vision",
    content: "Tech Yuva is led by a visionary council of students and young innovators.\nFounder & Visionary Council Lead: Lakshay Soni guides the community vision, cohort curation, and mission direction.\nTechnical Head & Site Architect: Daksh Chaudhary coordinates the overall technology infrastructure, aesthetic design language, and platform engineering, bringing Silicon Valley product quality to youth tech hubs.\nThe Founder Vision is to bypass low-effort academic coding tasks and expose student builders to actual startup-grade product design, vector databases, and scalable serverless patterns (using the Vercel/Linear quality model)."
  },
  {
    id: "kb-event-yuvahack",
    title: "Upcoming Event: YuvaHack 2026",
    category: "events",
    content: "YuvaHack 2026 is Tech Yuva's flagship physical 36-hour hackathon happening from July 15-17, 2026.\nTeams of 1 to 4 developers will compete to build elite product prototypes.\nFocus tracks include Custom SaaS dev, generative AI prompt pipelines, Web3 infrastructure, and robotics.\nFeatures active 24/7 mentoring from startup CTOs, high-end visual slide-deck reviews, and offline high-speed network desks. Free physical registration is open via the Upcoming Events panel in the application dashboard."
  },
  {
    id: "kb-event-bootcamp",
    title: "Upcoming Event: AI Builders Bootcamp",
    category: "events",
    content: "The AI Builders Bootcamp is a hands-on, highly intensive full-day workshop happening on July 30, 2026.\nAttendees will write server-side LLM secure proxies, build pgvector-based RAG workflows, and design clean micro-interaction interfaces using React and Tailwind CSS.\nCapacity: Limited to 150 student builders.\nCredentials: Complete physically during the build hours to receive an instantly verifiable holographic digital certificate of performance."
  },
  {
    id: "kb-event-pitchcraft",
    title: "Upcoming Event: PitchCraft Startup Incubation",
    category: "events",
    content: "PitchCraft is Tech Yuva's elite presentation and incubation night on August 12, 2026.\nIt connects student founders and youth developers with active regional venture funds, angel networks, and serial entrepreneurs.\nTeams present their product pitch slides to compete for cloud hosting credits, dedicated incubator desk spaces, and direct seed-funding opportunities."
  },
  {
    id: "kb-past-codesprints",
    title: "Past Legendary event: CodeSprints 2025",
    category: "events",
    content: "CodeSprints 2025 was Tech Yuva's premier regional algorithmic competition.\nOver 200 developers solved high-complexity Data Structures and Algorithms obstacles in a competitive arena.\nSponsored by leading computational startups, it successfully transitioned 5 high-performing participants into active backend engineering roles."
  },
  {
    id: "kb-past-devcon",
    title: "Past landmark event: DevCon 2025",
    category: "events",
    content: "DevCon 2025 was Tech Yuva's cornerstone developer summit, bringing together 400+ attendees.\nKeynote sessions covered highly scalable serverless architectures, custom vector caches, and UI interactive physics. It established Tech Yuva as the fastest-growing youth tech cell in the territory."
  },
  {
    id: "kb-past-web3zero",
    title: "Past sprint: Web3 Zero Blockchain Bootcamp",
    category: "events",
    content: "Web3 Zero was an intensive blockchain developer bootcamp.\nBuilders deployed testnet decentralized applications, audited smart contracts, and constructed frontend integrations. It trained over 80 developers who successfully built decentralized governance mechanisms."
  },
  {
    id: "kb-sponsors-list",
    title: "Ecosystem Corporate Sponsors",
    category: "sponsors",
    content: "Tech Yuva's modern workspace and premium events are thoroughly backed by world-class technology sponsors.\nLead Corporate Sponsors: Vercel, Linear, Supabase, Cloudflare, GitHub, and DigitalOcean.\nSponsor Commitment: These sponsors provide student builders with full-year SaaS credits, hardware gear, physical servers, API keys, and incubator rooms. This ensures all workshops, sprints, and amenities are 100% free and fully inclusive."
  },
  {
    id: "kb-registration-proc",
    title: "Direct Registration Pass & Certificate Verification System",
    category: "registration",
    content: "How the Tech Yuva Event Passport and Certificate verification work:\n1. Direct registrations are completed dynamically via the Upcoming Events panel in our dashboard (requires Name, Email, GitHub, and Technology Focus).\n2. Registrants receive an active Ticket ID to access sprints physically.\n3. Community Admins check attendance checkboxes using DB-backed panels.\n4. Marking attended automatically triggers our server-side canvas to compile a cryptographically signed Certificate of Completion.\n5. Earned certificates are allocated to user IDs and verifiable from the certificates panel or globally via the URL signature structure: `/api/certificates/verify/:code`."
  }
];

// Helper to safely generate vector embeddings using Gemini
export async function generateEmbedding(text: string, aiClient: any): Promise<number[] | null> {
  if (!aiClient) return null;
  try {
    const res = await aiClient.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: text
    });
    return res.embedding?.values || null;
  } catch (err) {
    console.error(`[RAG] Error generating embedding with Gemini:`, err);
    return null;
  }
}

// Database Seeder for Knowledge Base
export async function seedKnowledgeBase(aiClient: any) {
  try {
    const existingCountResult = await db.execute(sql`SELECT count(*) FROM kb_chunks`);
    const count = Number(existingCountResult.rows[0]?.count || 0);

    if (count > 0) {
      console.log(`[RAG] Knowledge Base already initialized with ${count} chunks in Cloud SQL.`);
      return;
    }

    console.log(`[RAG] Empty Knowledge Base detected. Seeding developer corpus...`);

    for (const chunk of DEFAULT_KNOWLEDGE_BASE) {
      let embeddingVec: number[] | null = null;
      if (aiClient) {
        console.log(`[RAG] Embedding chunk: "${chunk.title}"`);
        embeddingVec = await generateEmbedding(chunk.content, aiClient);
      } else {
        console.warn(`[RAG] No active Gemini client. Chunk seeded with null embedding (will fallback to keyword search).`);
      }

      await db.insert(kbChunks)
        .values({
          id: chunk.id,
          title: chunk.title,
          category: chunk.category,
          content: chunk.content,
          embedding: embeddingVec
        })
        .onConflictDoNothing();
    }

    console.log(`[RAG] Knowledge base seeded successfully inside Cloud SQL.`);
  } catch (err) {
    console.error(`[RAG] Seeding failure:`, err);
  }
}

// Optimized Search Query supporting Semantic Matching and Keyword fallback
export async function searchKnowledgeBase(
  query: string,
  aiClient: any
): Promise<{ title: string; category: string; content: string; similarity: number }[]> {
  try {
    const queryEmbedding = await generateEmbedding(query, aiClient);

    if (queryEmbedding && queryEmbedding.length === 768) {
      // Execute fast physical cosine distance vector search
      // (1 - (embedding <=> :vector)) computes cosine similarity
      // We pass embedding array serialized as JSON
      const serializedVector = JSON.stringify(queryEmbedding);
      const querySql = sql`
        SELECT title, category, content,
               (1 - (embedding <=> ${serializedVector}::vector)) AS similarity
        FROM kb_chunks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${serializedVector}::vector
        LIMIT 3
      `;

      const results = await db.execute(querySql);
      
      const searchHits = results.rows.map((row: any) => ({
        title: String(row.title),
        category: String(row.category),
        content: String(row.content),
        similarity: parseFloat(row.similarity ?? "0")
      }));

      // Only return hits with decent similarity, or mix with keywords
      if (searchHits.length > 0 && searchHits[0].similarity > 0.45) {
        console.log(`[RAG] Vector search found matches. Best score: ${searchHits[0].similarity}`);
        return searchHits;
      }
    }

    // Keyword & substring-based fallback logic (when offline/without key or similarity is low)
    console.log(`[RAG] Falling back to high-fidelity keyword filtering.`);
    const allChunks = await db.execute(sql`SELECT title, category, content FROM kb_chunks`);
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    if (keywords.length === 0) {
      // Simple generic response
      return allChunks.rows.slice(0, 3).map((row: any) => ({
        title: String(row.title),
        category: String(row.category),
        content: String(row.content),
        similarity: 0.5
      }));
    }

    const matches = allChunks.rows.map((row: any) => {
      let score = 0;
      const titleLower = String(row.title).toLowerCase();
      const contentLower = String(row.content).toLowerCase();

      for (const word of keywords) {
        if (titleLower.includes(word)) score += 3;
        if (contentLower.includes(word)) score += 1;
      }

      return {
        title: String(row.title),
        category: String(row.category),
        content: String(row.content),
        similarity: score > 0 ? 0.4 + (score * 0.05) : 0.0
      };
    })
    .filter(item => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

    return matches;
  } catch (err) {
    console.error(`[RAG] Search failure:`, err);
    return [];
  }
}
