# 08 — AI ASSISTANT

> **Tech Yuva Engineering Bible** — Document 9 of 13  
> **Status:** Draft v1.0  
> **Last Updated:** 2026-07-12  
> **Owner:** Engineering  
> **Classification:** Internal — Engineering  
> **Prerequisites:** [02_ARCHITECTURE.md](./02_ARCHITECTURE.md), [03_DATABASE.md](./03_DATABASE.md)

---

## 1. Product Goal

"Tech Yuva AI" (currently implemented in `TechYuvaAI.tsx`) is a floating chat widget that answers student questions about the community, events, and registration.

It acts as a 24/7 concierge, reducing the support burden on admins and providing instant gratification to curious visitors.

### Strict Constraints
- **Scope:** It must ONLY answer questions related to Tech Yuva. It is not a general-purpose coding assistant or chatbot.
- **Hallucination Prevention:** It must say "I don't know" if the answer is not in its knowledge base.
- **Cost:** Must use `gemini-3.5-flash` for high speed and low cost.

---

## 2. Architecture: Hybrid RAG

Retrieval-Augmented Generation (RAG) is used to ground the LLM in factual community data.

```mermaid
graph TD
    subgraph Browser
        Chat["Tech Yuva AI Widget"]
    end

    subgraph Server
        API["POST /api/chat"]
        Embed["Generate Embedding"]
        Search["Hybrid Search"]
        Prompt["Build Prompt"]
        GenAI["Generate Response"]
    end

    subgraph Database
        KB["kb_chunks table<br/>(pgvector)"]
    end

    subgraph Google
        GeminiAPI["Gemini API"]
    end

    Chat -->|User Query| API
    API -->|1. Query String| Embed
    Embed -->|API Call| GeminiAPI
    GeminiAPI -->|Vector [0.1, 0.4...]| Embed
    Embed -->|2. Vector| Search
    Search -->|Cosine Similarity| KB
    Search -->|ILIKE Text Match| KB
    KB -->|Top 3 Chunks| Search
    Search -->|3. Context + Query| Prompt
    Prompt -->|System + Prompt| GenAI
    GenAI -->|API Call| GeminiAPI
    GeminiAPI -->|Response Text| GenAI
    GenAI -->|Markdown| Chat
```

---

## 3. Knowledge Base (`kb_chunks`)

The foundation of the AI is the knowledge base stored in PostgreSQL.

### Schema (Review from 03_DATABASE)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `text` | Primary Key (`kb_xxx`) |
| `title` | `text` | Descriptive title |
| `category` | `text` | Grouping (events, about, etc.) |
| `content` | `text` | The actual factual text |
| `embedding` | `vector(768)`| The vector representation for semantic search |

### Current Seeding Implementation (`rag.ts`)

Currently, `rag.ts` hardcodes `DEFAULT_KNOWLEDGE_BASE` and seeds it on startup. This is acceptable for V1, but the content must be accurate.

**Required Content Updates:**
- Update "What is Tech Yuva?" to match the new Product Vision.
- Update Event Registration steps to match the actual app flow.
- Remove references to fabricated data (Vercel sponsorships, etc.).

---

## 4. Search Implementation

The current implementation uses a **Hybrid Search** approach, which is excellent for robustness.

### 4.1 Vector Semantic Search

Uses `pgvector` to find content conceptually similar to the user's query.

```sql
SELECT id, title, content, 
       1 - (embedding <=> $1::vector) as similarity
FROM kb_chunks 
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector 
LIMIT 3;
```
*Note: `embedding <=> $1` calculates cosine distance. `1 - distance` yields cosine similarity.*

### 4.2 Keyword Fallback Search

If the Gemini API fails to generate an embedding for the user's query (e.g., rate limit, network error), the system gracefully falls back to a standard ILIKE text search.

```sql
SELECT id, title, content, 
       1.0 as similarity 
FROM kb_chunks 
WHERE content ILIKE $1 OR title ILIKE $1
LIMIT 3;
```

---

## 5. Prompt Engineering

The system prompt is the most critical piece for controlling the AI's behavior and preventing hallucinations.

### Recommended System Prompt

```text
You are the official Tech Yuva AI Assistant. Your job is to help students understand the Tech Yuva community, find events, and register.

CRITICAL RULES:
1. ONLY answer questions using the provided Context below.
2. If the answer is not in the Context, say: "I don't have the exact details on that, but you can check our Events page or email us at hello@techyuva.org."
3. NEVER make up events, dates, people, or links.
4. NEVER write code or answer general programming questions. If asked to code, politely decline and refocus on Tech Yuva.
5. Keep answers concise, friendly, and formatted in Markdown.

Context:
{context_chunks}
```

---

## 6. Dynamic Context (Future V2)

Currently, the AI only knows what is in `kb_chunks`. It does not know about *live* events stored in the `events` table unless they are duplicated into the knowledge base.

**V2 Enhancement:** 
Before calling the LLM, the server should query the `events` table for `status = 'upcoming'` and append that dynamic data to the prompt context.

```text
Dynamic Context:
Upcoming Events:
- YuvaHack 2026 (July 15, 2026) - 14 spots left.
```

---

## 7. Security & Abuse Prevention

| Risk | Mitigation | Implementation |
|------|------------|----------------|
| **Prompt Injection** | System prompt instructions | See Rule 4 in prompt above. |
| **API Cost Exhaustion**| Rate Limiting | Limit `POST /api/chat` to 10 requests / minute / IP. |
| **Key Leakage** | Server-side execution | Gemini API key is ONLY in `.env` on the server. Client never sees it. |

---

## 8. Implementation Priorities

1. **Rewrite Knowledge Base (P0):** Update `DEFAULT_KNOWLEDGE_BASE` in `rag.ts` to reflect the truthful Product Vision. Remove all placeholder/fabricated data.
2. **Implement Rate Limiting (P0):** Protect the `/api/chat` endpoint from abuse to prevent Gemini API billing spikes.
3. **Refine System Prompt (P1):** Implement the strict hallucination-prevention prompt outlined in Section 5.

## Related Documents
- [03_DATABASE.md](./03_DATABASE.md) (pgvector setup)
- [09_SECURITY.md](./09_SECURITY.md) (Rate limiting specifics)
