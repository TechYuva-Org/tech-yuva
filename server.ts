import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";
import { nanoid } from "nanoid";

// Cloud SQL Drizzle ORM Imports (strictly utilizing full extensions for ESM)
import { db } from "./src/db/index.ts";
import { 
  users, events, registrations, certificates,
  siteSettings, seoSettings, heroContent, founderContent, homepageSettings,
  aboutCards, offerings, gallery, sponsors, testimonials, announcements,
  mediaLibrary, analyticsSnapshots, sessions, communityMembers
} from "./src/db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { seedKnowledgeBase, searchKnowledgeBase } from "./src/db/rag.ts";
import { seedCMSDatabase } from "./src/db/seedCMS.ts";



dotenv.config();

const ROOT_DIR = process.cwd();
const PORT = 3000;


// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Ground and seed Tech Yuva vector knowledge base
  try {
    const ai = getGeminiClient();
    await seedKnowledgeBase(ai);
  } catch (err) {
    console.error("Failed to bootstrap key RAG seeder:", err);
  }

  // Seed CMS homepage settings
  try {
    await seedCMSDatabase();
  } catch (err) {
    console.error("Failed to bootstrap key CMS seeder:", err);
  }

  // Log incoming requests for debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ==================== AUTH MIDDLEWARE ====================
  const requireAuth = async (req: any, res: any, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "UNAUTHENTICATED" });
    }
    const token = authHeader.split(" ")[1];
    
    // Hash token to compare with DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    const activeSessions = await db.select().from(sessions).where(eq(sessions.token, tokenHash)).limit(1);
    if (activeSessions.length === 0 || new Date(activeSessions[0].expiresAt) < new Date()) {
      return res.status(401).json({ error: "UNAUTHENTICATED" });
    }
    
    const userResult = await db.select().from(users).where(eq(users.id, activeSessions[0].userId)).limit(1);
    if (userResult.length === 0) {
      return res.status(401).json({ error: "UNAUTHENTICATED" });
    }
    
    req.user = userResult[0];
    next();
  };

  const requireAdmin = async (req: any, res: any, next: NextFunction) => {
    requireAuth(req, res, async () => {
      // Bootstrapping admin logic
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      
      let isExplicitAdmin = adminEmails.includes(req.user.email.toLowerCase());
      
      if (isExplicitAdmin && req.user.role !== "admin") {
        await db.update(users).set({ role: "admin" }).where(eq(users.id, req.user.id));
        req.user.role = "admin";
      }

      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "FORBIDDEN" });
      }
      next();
    });
  };

  // ==================== EVENTS MANAGEMENT API ROUTES ====================

  // 1. AUTH ROUTES
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      // Query database for matching user
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      let user = existingUsers[0];

      // If user does not exist, we automatically register them as a visitor for elite onboarding flow
      if (!user) {
        const emailParts = email.split("@");
        const guessName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);

        let initialRole: "visitor" | "member" | "admin" = "visitor";
        if (email.toLowerCase().includes("admin") || email.toLowerCase() === "dakshchaudhary2668@gmail.com") {
          initialRole = "admin";
        } else if (email.toLowerCase().includes("member") || email.toLowerCase().includes("techyuva")) {
          initialRole = "member";
        }

        const [newUser] = await db
          .insert(users)
          .values({
            id: `u-${Date.now()}`,
            name: guessName,
            email: email.trim().toLowerCase(),
            role: initialRole,
            github: emailParts[0]
          })
          .returning();

        user = newUser;
        console.log(`Auto-registered new developer in Cloud SQL: ${user.name} (${user.role})`);
      }

      return res.json({ success: true, user });
    } catch (error: any) {
      console.error("Auth login failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required." });
      }

      // Hardcoded dev mode OTP
      if (otp !== "123456") {
        return res.status(401).json({ error: "Invalid OTP code." });
      }

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      const user = existingUsers[0];
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const token = nanoid(64);
      
      await db.insert(sessions).values({
        id: `sess-${Date.now()}`,
        userId: user.id,
        token: token,
        type: "session",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      return res.json({ user, token });
    } catch (error: any) {
      console.error("Auth verify failure:", error);
      return res.status(500).json({ error: "Server error during verification." });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, role, github } = req.body;
      if (!name || !email || !github) {
        return res.status(400).json({ error: "Name, email, and github details are required." });
      }

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "User already exists with this email address." });
      }

      const [user] = await db
        .insert(users)
        .values({
          id: `u-${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role || "visitor",
          github: github.trim()
        })
        .returning();

      return res.status(201).json({ success: true, user });
    } catch (error: any) {
      console.error("Auth register failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      return res.json(allUsers);
    } catch (error: any) {
      console.error("Fetch users failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  // 2. EVENTS ENDPOINTS
  app.get("/api/events", async (req, res) => {
    try {
      const allEvents = await db.select().from(events);
      return res.json(allEvents);
    } catch (error: any) {
      console.error("Fetch events failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  app.post("/api/events", requireAdmin, async (req, res) => {
    try {
      const { title, category, rawDate, date, time, venue, description, tags, status, spotsLeft, featured } = req.body;
      if (!title || !category || !rawDate || !date || !time || !venue || !description) {
        return res.status(400).json({ error: "Essential event fields are missing." });
      }

      const [newEvent] = await db
        .insert(events)
        .values({
          id: `e-${Date.now()}`,
          title,
          category,
          rawDate,
          date,
          time,
          venue,
          description,
          tags: tags || [],
          status: status || "upcoming",
          spotsLeft: spotsLeft !== undefined ? Number(spotsLeft) : 50,
          featured: !!featured
        })
        .returning();

      return res.status(201).json({ success: true, event: newEvent });
    } catch (error: any) {
      console.error("Create event failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  app.put("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const getEvent = await db.select().from(events).where(eq(events.id, id)).limit(1);
      
      if (getEvent.length === 0) {
        return res.status(404).json({ error: "Event not found." });
      }

      const oldEvent = getEvent[0];
      const updatedData = {
        title: req.body.title !== undefined ? req.body.title : oldEvent.title,
        category: req.body.category !== undefined ? req.body.category : oldEvent.category,
        rawDate: req.body.rawDate !== undefined ? req.body.rawDate : oldEvent.rawDate,
        date: req.body.date !== undefined ? req.body.date : oldEvent.date,
        time: req.body.time !== undefined ? req.body.time : oldEvent.time,
        venue: req.body.venue !== undefined ? req.body.venue : oldEvent.venue,
        description: req.body.description !== undefined ? req.body.description : oldEvent.description,
        tags: req.body.tags !== undefined ? req.body.tags : oldEvent.tags,
        status: req.body.status !== undefined ? req.body.status : oldEvent.status,
        spotsLeft: req.body.spotsLeft !== undefined ? Number(req.body.spotsLeft) : oldEvent.spotsLeft,
        featured: req.body.featured !== undefined ? !!req.body.featured : oldEvent.featured
      };

      const [updatedEvent] = await db
        .update(events)
        .set(updatedData)
        .where(eq(events.id, id))
        .returning();

      // Auto-issue certificates if event transitions to "completed" / "past"!
      const transitionedToComplete = 
        (req.body.status === "completed" || req.body.status === "past") && 
        (oldEvent.status === "upcoming" || oldEvent.status === "draft");

      if (transitionedToComplete) {
        // Automatically find all registrations for this event to verify attendance
        const relatedRegistrations = await db
          .select()
          .from(registrations)
          .where(and(eq(registrations.eventId, id), eq(registrations.attended, true)));

        for (const reg of relatedRegistrations) {
          const existingCerts = await db
            .select()
            .from(certificates)
            .where(eq(certificates.registrationId, reg.id))
            .limit(1);

          if (existingCerts.length === 0) {
            const certCode = `TY-${categoryCode(updatedEvent.category)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await db
              .insert(certificates)
              .values({
                id: `cert-${Date.now()}-${Math.floor(Math.random() * 900)}`,
                registrationId: reg.id,
                eventId: id,
                userId: reg.userId,
                recipientName: reg.name,
                eventTitle: updatedEvent.title,
                verificationCode: certCode
              })
              .onConflictDoNothing();
          }
        }
      }

      return res.json({ success: true, event: updatedEvent });
    } catch (error: any) {
      console.error("Update event failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cascade-delete dependencies or Drizzle CASCADE configurations handle this
      await db.delete(events).where(eq(events.id, id));
      
      return res.json({ success: true, message: "Event structure deleted successfully." });
    } catch (error: any) {
      console.error("Delete event failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  // 3. REGISTRATIONS ENDPOINTS
  app.get("/api/registrations", requireAdmin, async (req, res) => {
    try {
      const { email, userId } = req.query;
      
      let filtered;
      if (email) {
        filtered = await db
          .select()
          .from(registrations)
          .where(eq(registrations.email, (email as string).toLowerCase().trim()));
      } else if (userId) {
        filtered = await db
          .select()
          .from(registrations)
          .where(eq(registrations.userId, userId as string));
      } else {
        filtered = await db.select().from(registrations);
      }
      return res.json(filtered);
    } catch (error: any) {
      console.error("Fetch registrations failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const { eventId, userId, name, email, github, teamSize, techFocus } = req.body;
      if (!eventId || !email || !name || !github) {
        return res.status(400).json({ error: "Missing essential registration metadata params." });
      }

      // Check duplicate registration
      const duplicates = await db
        .select()
        .from(registrations)
        .where(
          and(
            eq(registrations.eventId, eventId),
            eq(registrations.email, email.trim().toLowerCase())
          )
        )
        .limit(1);

      if (duplicates.length > 0) {
        return res.status(400).json({ error: "You are already registered for this innovation sprint!" });
      }

      // Atomic Spot Decrement
      const updatedEvents = await db
        .update(events)
        .set({ spotsLeft: sql`${events.spotsLeft} - 1` })
        .where(and(eq(events.id, eventId), sql`${events.spotsLeft} > 0`))
        .returning();

      if (updatedEvents.length === 0) {
        // Event doesn't exist or is full
        const getEvent = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
        if (getEvent.length === 0) return res.status(404).json({ error: "Target event does not exist." });
        return res.status(400).json({ error: "This event has reached maximum capacity limits." });
      }

      // Allocate or link User ID
      let resolvedUserId = userId;
      if (!resolvedUserId) {
        const lookupUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, email.trim().toLowerCase()))
          .limit(1);

        if (lookupUsers.length > 0) {
          resolvedUserId = lookupUsers[0].id;
        } else {
          // Auto create user structure
          const [newUser] = await db
            .insert(users)
            .values({
              id: `u-${nanoid(15)}`,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              role: "visitor",
              github: github.trim()
            })
            .returning();
          resolvedUserId = newUser.id;
        }
      }

      const [newRegistration] = await db
        .insert(registrations)
        .values({
          id: `r-${nanoid(15)}`,
          eventId,
          userId: resolvedUserId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          github: github.trim(),
          teamSize: Number(teamSize) || 1,
          techFocus: techFocus || "General Fullstack",
          attended: false
        })
        .returning();

      return res.status(201).json({ success: true, registration: newRegistration });
    } catch (error: any) {
      console.error("Register developer failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  // 4. ATTENDANCE TRACKING & ATTENDEE MARKING
  app.post("/api/registrations/:id/attend", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { attended } = req.body; // true or false

      const [registration] = await db
        .update(registrations)
        .set({ attended: !!attended })
        .where(eq(registrations.id, id))
        .returning();

      if (!registration) {
        return res.status(404).json({ error: "Registration not found." });
      }

      // Auto generate certificate if attended is marked as true AND the event is completed/past
      const matchingEvents = await db.select().from(events).where(eq(events.id, registration.eventId)).limit(1);
      const event = matchingEvents[0];

      if (event && (event.status === "completed" || event.status === "past") && attended) {
        const existingCerts = await db
          .select()
          .from(certificates)
          .where(eq(certificates.registrationId, id))
          .limit(1);

        if (existingCerts.length === 0) {
          const certCode = `TY-${categoryCode(event.category)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          await db
            .insert(certificates)
            .values({
              id: `cert-${Date.now()}`,
              registrationId: id,
              eventId: event.id,
              userId: registration.userId,
              recipientName: registration.name,
              eventTitle: event.title,
              verificationCode: certCode
            })
            .onConflictDoNothing();
        }
      } else if (!attended) {
        // Remove certificate if marked as not attended
        await db.delete(certificates).where(eq(certificates.registrationId, id));
      }

      return res.json({ success: true, registration });
    } catch (error: any) {
      console.error("Set attendance failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  // 5. CERTIFICATES ENDPOINTS
  app.get("/api/certificates", async (req, res) => {
    try {
      const { userId } = req.query;
      let results;
      if (userId) {
        results = await db.select().from(certificates).where(eq(certificates.userId, userId as string));
      } else {
        results = await db.select().from(certificates);
      }
      return res.json(results);
    } catch (error: any) {
      console.error("Fetch certificates failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  // Verify certificate endpoint
  app.get("/api/certificates/verify/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const lookupCerts = await db
        .select()
        .from(certificates)
        .where(eq(certificates.verificationCode, code.toUpperCase().trim()))
        .limit(1);

      const cert = lookupCerts[0];
      if (!cert) {
        return res.status(404).json({ verified: false, error: "Invalid certificate verification signature." });
      }

      return res.json({ verified: true, certificate: cert });
    } catch (error: any) {
      console.error("Verify certificate failure:", error);
      return res.status(500).json({ error: "Database query failed. Please try again later." });
    }
  });

  function categoryCode(category: string): string {
    switch (category) {
      case "hackathon": return "HACK";
      case "workshop": return "WKSH";
      case "bootcamp": return "BTCP";
      case "startup": return "STRT";
      default: return "TALK";
    }
  }

  // ==================== END EVENTS ENDPOINTS ====================

  // Knowledge base for Tech Yuva community to train the assistant
  const SYSTEM_INSTRUCTION = `You are "YuvaAI", the premium virtual advisor for Tech Yuva, a student-led technology community.
Your tone is futuristic, elite, highly knowledgeable, developer-centric, dark-mode styling, startup-grade, and friendly (like Vercel/Linear).
Use brief, crisp sentences, with developer-friendly terms and occasional markdown code blocks.

TECH YUVA INFORMATION:
- Tagline: "Where Youth Meet To Build Future Tech"
- Focus areas: Hackathons, Interactive Workshops, Coding Competitions, AI & Web Dev, Startup Culture, and Elite Networking.
- Mission: Empowering students and youth developers to learn, build, network, and scale.
- Founders: Led by a visionary council of students and young innovators (e.g., Daksh Chaudhary, Creative Director & Architect, or Lakshay Soni).
- Core Statistics: 500+ active developers, 20+ grand events, 1000+ students impacted.
- Key upcoming events:
  1. "YuvaHack 2026" - 36-hour elite hackathon. Register at /register, July 15-17.
  2. "AI Builders Bootcamp" - Hands-on GenAI workshop, July 30.
  3. "PitchCraft" - Student startup deck presentation & incubation night, August 12.
- Frequently Asked Questions:
  - Is it free? Yes, Tech Yuva is a community-first club, and all normal workshops are fully sponsored.
  - Can beginners join? Absolutely. Tech Yuva is the bridge from hello-world to custom deployment.
  - How do I register? Direct participants can use the Join form in the applet or type "/register" to register instantly via chat.

If asked about registrations or events, encourage them and provide rich details. If the user registration looks like they want to register for a specific event, output a JSON block or a clear interactive link.
Never break character as YuvaAI representation.`;

  // API Route for Tech Yuva AI Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      console.log(`Processing AI request. Message: "${message.substring(0, 60)}..."`);
      const ai = getGeminiClient();

      // Retrieve high-fidelity grounding chunks using our RAG hybrid engine (Vector DB and Keywords)
      const matchedChunks = await searchKnowledgeBase(message, ai);
      const groundingGroundedData = matchedChunks.length > 0
        ? "\n\nFACTUAL KNOWLEDGE BASE MATCHES FROM CLOUD SQL (pgvector):\n" +
          matchedChunks.map((chunk, idx) => `[Document ${idx + 1}: ${chunk.title}] (Category: ${chunk.category})\n${chunk.content}`).join("\n\n") +
          "\n\nInstructions: Synthesize a highly customized and intelligent answer using the factual records above. Do not hallucinate. Mention specific details: dates, leadership names (such as Daksh Chaudhary, Lakshay Soni), and sponsor names (such as Vercel, Linear, Supabase) if relevant!"
        : "";

      if (!ai) {
        console.warn("GEMINI_API_KEY is not defined. Using smart local RAG data search.");
        if (matchedChunks.length > 0) {
          const best = matchedChunks[0];
          const matchesList = matchedChunks.map(c => `- **${c.title}** (${c.category})`).join("\n");
          const reply = `🤖 **YuvaAI RAG Core**: Query successfully matched locally! Here is the factual knowledge extracted from our PostgreSQL vector store:\n\n${best.content}\n\n---\n*Also matched additional database files:\n${matchesList}*`;
          return res.json({ text: reply, isMock: true });
        } else {
          return res.json({
            text: "Hello! Welcome to **Tech Yuva AI**. Currently, your **GEMINI_API_KEY** is pending setup. Feel free to type questions regarding **YuvaHack 2026**, the **Founders**, **AI Bootcamp**, or **Sponsors** to trigger our local database RAG resolver!",
            isMock: true
          });
        }
      }

      const promptText = `
System Instruction:
${SYSTEM_INSTRUCTION}${groundingGroundedData}

User message: ${message}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          temperature: 0.7
        }
      });

      const reply = response.text || "I was unable to synthesize a proper response. Let's try again!";
      return res.json({ text: reply, isMock: false, groundedHits: matchedChunks.length });

    } catch (err: any) {
      console.error("Error in Gemini API call:", err);
      return res.status(500).json({
        error: "Internal Server Error in Tech Yuva AI engine.",
        details: err.message || err
      });
    }
  });

  // =========================================================================
  // TECH YUVA CMS SYSTEM ENDPOINTS (FEATURE 1 - FEATURE 8)
  // =========================================================================


  // PUBLIC: Fetch all homepage dynamic settings
  app.get("/api/cms/homepage", async (req, res) => {
    try {
      const [site] = await db.select().from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
      const [seo] = await db.select().from(seoSettings).where(eq(seoSettings.id, "global")).limit(1);
      const [hero] = await db.select().from(heroContent).where(eq(heroContent.id, "global")).limit(1);
      const [founder] = await db.select().from(founderContent).where(eq(founderContent.id, "global")).limit(1);
      
      const about = await db.select().from(aboutCards).orderBy(aboutCards.displayOrder);
      const offers = await db.select().from(offerings).orderBy(offerings.displayOrder);
      const gal = await db.select().from(gallery).orderBy(gallery.createdAt);
      const sps = await db.select().from(sponsors).orderBy(sponsors.displayOrder);
      const tes = await db.select().from(testimonials).orderBy(testimonials.displayOrder);
      const anns = await db.select().from(announcements).orderBy(announcements.createdAt);

      return res.json({
        siteSettings: site || null,
        seoSettings: seo || null,
        heroContent: hero || null,
        founderContent: founder || null,
        aboutCards: about,
        offerings: offers,
        gallery: gal,
        sponsors: sps,
        testimonials: tes,
        announcements: anns
      });
    } catch (err: any) {
      console.error("Fetch homepage settings failed:", err);
      return res.status(500).json({ error: "Failed to read homepage dynamic components." });
    }
  });

  // ADMIN: Update Hero Section
  app.patch("/api/cms/hero", requireAdmin, async (req, res) => {
    try {
      const [existing] = await db.select().from(heroContent).where(eq(heroContent.id, "global")).limit(1);
      const updated = {
        badge: req.body.badge !== undefined ? req.body.badge : (existing?.badge || ""),
        title: req.body.title !== undefined ? req.body.title : (existing?.title || ""),
        subtitle: req.body.subtitle !== undefined ? req.body.subtitle : (existing?.subtitle || ""),
        description: req.body.description !== undefined ? req.body.description : (existing?.description || ""),
        ctaButton1Text: req.body.ctaButton1Text !== undefined ? req.body.ctaButton1Text : (existing?.ctaButton1Text || ""),
        ctaButton1Link: req.body.ctaButton1Link !== undefined ? req.body.ctaButton1Link : (existing?.ctaButton1Link || ""),
        ctaButton2Text: req.body.ctaButton2Text !== undefined ? req.body.ctaButton2Text : (existing?.ctaButton2Text || ""),
        ctaButton2Link: req.body.ctaButton2Link !== undefined ? req.body.ctaButton2Link : (existing?.ctaButton2Link || ""),
        announcementBanner: req.body.announcementBanner !== undefined ? req.body.announcementBanner : (existing?.announcementBanner || null),
        stats: req.body.stats !== undefined ? (typeof req.body.stats === 'string' ? req.body.stats : JSON.stringify(req.body.stats)) : (existing?.stats || "[]"),
        mediaUrl: req.body.mediaUrl !== undefined ? req.body.mediaUrl : (existing?.mediaUrl || null),
        terminalCode: req.body.terminalCode !== undefined ? req.body.terminalCode : (existing?.terminalCode || "")
      };

      const [resRow] = await db
        .insert(heroContent)
        .values({ id: "global", ...updated })
        .onConflictDoUpdate({
          target: heroContent.id,
          set: updated
        })
        .returning();

      return res.json({ success: true, heroContent: resRow });
    } catch (err: any) {
      console.error("Update hero failure:", err);
      return res.status(500).json({ error: "Failed to compile hero updates." });
    }
  });

  // ADMIN: Update Founder Section
  app.patch("/api/cms/founder", requireAdmin, async (req, res) => {
    try {
      const [existing] = await db.select().from(founderContent).where(eq(founderContent.id, "global")).limit(1);
      const updated = {
        name: req.body.name !== undefined ? req.body.name : (existing?.name || ""),
        role: req.body.role !== undefined ? req.body.role : (existing?.role || ""),
        photo: req.body.photo !== undefined ? req.body.photo : (existing?.photo || ""),
        introVideo: req.body.introVideo !== undefined ? req.body.introVideo : (existing?.introVideo || null),
        quote: req.body.quote !== undefined ? req.body.quote : (existing?.quote || ""),
        biography: req.body.biography !== undefined ? req.body.biography : (existing?.biography || "")
      };

      const [resRow] = await db
        .insert(founderContent)
        .values({ id: "global", ...updated })
        .onConflictDoUpdate({
          target: founderContent.id,
          set: updated
        })
        .returning();

      return res.json({ success: true, founderContent: resRow });
    } catch (err) {
      console.error("Update founder failure:", err);
      return res.status(500).json({ error: "Failed to compile founder vision updates." });
    }
  });

  // ADMIN: Update SEO Settings
  app.patch("/api/cms/seo", requireAdmin, async (req, res) => {
    try {
      const [existing] = await db.select().from(seoSettings).where(eq(seoSettings.id, "global")).limit(1);
      const updated = {
        metaTitle: req.body.metaTitle !== undefined ? req.body.metaTitle : (existing?.metaTitle || ""),
        metaDescription: req.body.metaDescription !== undefined ? req.body.metaDescription : (existing?.metaDescription || ""),
        ogImage: req.body.ogImage !== undefined ? req.body.ogImage : (existing?.ogImage || ""),
        keywords: req.body.keywords !== undefined ? req.body.keywords : (existing?.keywords || ""),
        canonicalUrl: req.body.canonicalUrl !== undefined ? req.body.canonicalUrl : (existing?.canonicalUrl || ""),
        jsonLd: req.body.jsonLd !== undefined ? req.body.jsonLd : (existing?.jsonLd || "{}")
      };

      const [resRow] = await db
        .insert(seoSettings)
        .values({ id: "global", ...updated })
        .onConflictDoUpdate({
          target: seoSettings.id,
          set: updated
        })
        .returning();

      return res.json({ success: true, seoSettings: resRow });
    } catch (err) {
      console.error("Update SEO failure:", err);
      return res.status(500).json({ error: "Failed to sync SEO controls." });
    }
  });

  // ADMIN: Update Global Site Settings
  app.patch("/api/cms/site", requireAdmin, async (req, res) => {
    try {
      const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
      const updated = {
        communityName: req.body.communityName !== undefined ? req.body.communityName : (existing?.communityName || ""),
        logo: req.body.logo !== undefined ? req.body.logo : (existing?.logo || ""),
        themeColors: req.body.themeColors !== undefined ? (typeof req.body.themeColors === 'string' ? req.body.themeColors : JSON.stringify(req.body.themeColors)) : (existing?.themeColors || "{}"),
        contactEmail: req.body.contactEmail !== undefined ? req.body.contactEmail : (existing?.contactEmail || ""),
        contactPhone: req.body.contactPhone !== undefined ? req.body.contactPhone : (existing?.contactPhone || ""),
        contactAddress: req.body.contactAddress !== undefined ? req.body.contactAddress : (existing?.contactAddress || ""),
        socialLinks: req.body.socialLinks !== undefined ? (typeof req.body.socialLinks === 'string' ? req.body.socialLinks : JSON.stringify(req.body.socialLinks)) : (existing?.socialLinks || "{}"),
        footerText: req.body.footerText !== undefined ? req.body.footerText : (existing?.footerText || ""),
        registrationToggle: req.body.registrationToggle !== undefined ? !!req.body.registrationToggle : (existing?.registrationToggle ?? true),
        maintenanceMode: req.body.maintenanceMode !== undefined ? !!req.body.maintenanceMode : (existing?.maintenanceMode ?? false)
      };

      const [resRow] = await db
        .insert(siteSettings)
        .values({ id: "global", ...updated })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: updated
        })
        .returning();

      return res.json({ success: true, siteSettings: resRow });
    } catch (err) {
      console.error("Update site settings failure:", err);
      return res.status(500).json({ error: "Failed to compile site config." });
    }
  });

  // ABOUT CARDS CRUD
  app.post("/api/cms/about", requireAdmin, async (req, res) => {
    try {
      const { heading, description, icon, displayOrder, image } = req.body;
      const [newCard] = await db
        .insert(aboutCards)
        .values({
          id: `a-${Date.now()}`,
          heading,
          description,
          icon: icon || "cpu",
          displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
          image: image || null
        })
        .returning();
      return res.status(201).json({ success: true, aboutCard: newCard });
    } catch (err) {
      return res.status(500).json({ error: "Failed to craft about item." });
    }
  });

  app.patch("/api/cms/about/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [match] = await db.select().from(aboutCards).where(eq(aboutCards.id, id)).limit(1);
      if (!match) return res.status(404).json({ error: "Card not found." });

      const updated = {
        heading: req.body.heading !== undefined ? req.body.heading : match.heading,
        description: req.body.description !== undefined ? req.body.description : match.description,
        icon: req.body.icon !== undefined ? req.body.icon : match.icon,
        displayOrder: req.body.displayOrder !== undefined ? Number(req.body.displayOrder) : match.displayOrder,
        image: req.body.image !== undefined ? req.body.image : match.image
      };

      const [resRow] = await db.update(aboutCards).set(updated).where(eq(aboutCards.id, id)).returning();
      return res.json({ success: true, aboutCard: resRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to edit about item." });
    }
  });

  app.delete("/api/cms/about/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(aboutCards).where(eq(aboutCards.id, req.params.id));
      return res.json({ success: true, message: "About card deleted." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to wipe about card." });
    }
  });

  // OFFERINGS CRUD
  app.post("/api/cms/offerings", requireAdmin, async (req, res) => {
    try {
      const { title, description, icon, displayOrder, status } = req.body;
      const [newRow] = await db
        .insert(offerings)
        .values({
          id: `off-${Date.now()}`,
          title,
          description,
          icon: icon || "code",
          displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
          status: status || "active"
        })
        .returning();
      return res.status(201).json({ success: true, offering: newRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to construct offering." });
    }
  });

  app.patch("/api/cms/offerings/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [match] = await db.select().from(offerings).where(eq(offerings.id, id)).limit(1);
      if (!match) return res.status(404).json({ error: "Offering not found." });

      const updated = {
        title: req.body.title !== undefined ? req.body.title : match.title,
        description: req.body.description !== undefined ? req.body.description : match.description,
        icon: req.body.icon !== undefined ? req.body.icon : match.icon,
        displayOrder: req.body.displayOrder !== undefined ? Number(req.body.displayOrder) : match.displayOrder,
        status: req.body.status !== undefined ? req.body.status : match.status
      };

      const [resRow] = await db.update(offerings).set(updated).where(eq(offerings.id, id)).returning();
      return res.json({ success: true, offering: resRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to modify offering." });
    }
  });

  app.delete("/api/cms/offerings/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(offerings).where(eq(offerings.id, req.params.id));
      return res.json({ success: true, message: "Offering deleted." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to wipe offering." });
    }
  });

  // GALLERY CRUD
  app.post("/api/cms/gallery", requireAdmin, async (req, res) => {
    try {
      const { title, mediaUrl, mediaType, category, statLabel, statValue, highlightText, featured } = req.body;
      const [newRow] = await db
        .insert(gallery)
        .values({
          id: `gal-${Date.now()}`,
          title,
          mediaUrl,
          mediaType: mediaType || "image",
          category,
          statLabel,
          statValue,
          highlightText,
          featured: !!featured
        })
        .returning();
      return res.status(201).json({ success: true, galleryItem: newRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to host gallery element." });
    }
  });

  app.patch("/api/cms/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [match] = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
      if (!match) return res.status(404).json({ error: "Gallery item not found." });

      const updated = {
        title: req.body.title !== undefined ? req.body.title : match.title,
        mediaUrl: req.body.mediaUrl !== undefined ? req.body.mediaUrl : match.mediaUrl,
        mediaType: req.body.mediaType !== undefined ? req.body.mediaType : match.mediaType,
        category: req.body.category !== undefined ? req.body.category : match.category,
        statLabel: req.body.statLabel !== undefined ? req.body.statLabel : match.statLabel,
        statValue: req.body.statValue !== undefined ? req.body.statValue : match.statValue,
        highlightText: req.body.highlightText !== undefined ? req.body.highlightText : match.highlightText,
        featured: req.body.featured !== undefined ? !!req.body.featured : match.featured
      };

      const [resRow] = await db.update(gallery).set(updated).where(eq(gallery.id, id)).returning();
      return res.json({ success: true, galleryItem: resRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to edit gallery snapshot." });
    }
  });

  app.delete("/api/cms/gallery/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(gallery).where(eq(gallery.id, req.params.id));
      return res.json({ success: true, message: "Gallery item deleted." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to erase gallery snapshot." });
    }
  });

  // SPONSORS CRUD
  app.post("/api/cms/sponsors", requireAdmin, async (req, res) => {
    try {
      const { name, logo, website, tier, displayOrder, featured, statusText, contribution, domain } = req.body;
      const [newRow] = await db
        .insert(sponsors)
        .values({
          id: `sps-${Date.now()}`,
          name,
          logo,
          website,
          tier: tier || "partner",
          displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
          featured: !!featured,
          statusText: statusText || "Partner",
          contribution: contribution || "Ecosystem integration",
          domain: domain || "techyuva.org"
        })
        .returning();
      return res.status(201).json({ success: true, sponsor: newRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to incorporate partner." });
    }
  });

  app.patch("/api/cms/sponsors/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [match] = await db.select().from(sponsors).where(eq(sponsors.id, id)).limit(1);
      if (!match) return res.status(404).json({ error: "Partner not found." });

      const updated = {
        name: req.body.name !== undefined ? req.body.name : match.name,
        logo: req.body.logo !== undefined ? req.body.logo : match.logo,
        website: req.body.website !== undefined ? req.body.website : match.website,
        tier: req.body.tier !== undefined ? req.body.tier : match.tier,
        displayOrder: req.body.displayOrder !== undefined ? Number(req.body.displayOrder) : match.displayOrder,
        featured: req.body.featured !== undefined ? !!req.body.featured : match.featured,
        statusText: req.body.statusText !== undefined ? req.body.statusText : match.statusText,
        contribution: req.body.contribution !== undefined ? req.body.contribution : match.contribution,
        domain: req.body.domain !== undefined ? req.body.domain : match.domain
      };

      const [resRow] = await db.update(sponsors).set(updated).where(eq(sponsors.id, id)).returning();
      return res.json({ success: true, sponsor: resRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to modify partner." });
    }
  });

  app.delete("/api/cms/sponsors/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(sponsors).where(eq(sponsors.id, req.params.id));
      return res.json({ success: true, message: "Sponsor deleted." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to revoke partner." });
    }
  });

  // TESTIMONIALS CRUD
  app.post("/api/cms/testimonials", requireAdmin, async (req, res) => {
    try {
      const { name, role, organization, rating, quote, avatar, approved, displayOrder } = req.body;
      const [newRow] = await db
        .insert(testimonials)
        .values({
          id: `tes-${Date.now()}`,
          name,
          role,
          organization,
          rating: rating !== undefined ? Number(rating) : 5,
          quote,
          avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
          approved: approved !== undefined ? !!approved : true,
          displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0
        })
        .returning();
      return res.status(201).json({ success: true, testimonial: newRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to upload feedback." });
    }
  });

  app.patch("/api/cms/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [match] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
      if (!match) return res.status(404).json({ error: "Testimonial not found." });

      const updated = {
        name: req.body.name !== undefined ? req.body.name : match.name,
        role: req.body.role !== undefined ? req.body.role : match.role,
        organization: req.body.organization !== undefined ? req.body.organization : match.organization,
        rating: req.body.rating !== undefined ? Number(req.body.rating) : match.rating,
        quote: req.body.quote !== undefined ? req.body.quote : match.quote,
        avatar: req.body.avatar !== undefined ? req.body.avatar : match.avatar,
        approved: req.body.approved !== undefined ? !!req.body.approved : match.approved,
        displayOrder: req.body.displayOrder !== undefined ? Number(req.body.displayOrder) : match.displayOrder
      };

      const [resRow] = await db.update(testimonials).set(updated).where(eq(testimonials.id, id)).returning();
      return res.json({ success: true, testimonial: resRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to edit feedback." });
    }
  });

  app.delete("/api/cms/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(testimonials).where(eq(testimonials.id, req.params.id));
      return res.json({ success: true, message: "Testimonial deleted." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to purge feedback." });
    }
  });

  // ANNOUNCEMENTS CRUD
  app.post("/api/cms/announcements", requireAdmin, async (req, res) => {
    try {
      const { title, message, enabled, type, scheduledStart, scheduledEnd } = req.body;
      const [newRow] = await db
        .insert(announcements)
        .values({
          id: `ann-${Date.now()}`,
          title,
          message,
          enabled: enabled !== undefined ? !!enabled : true,
          type: type || "info",
          scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
          scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null
        })
        .returning();
      return res.status(201).json({ success: true, announcement: newRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to sound announcement." });
    }
  });

  app.patch("/api/cms/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [match] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
      if (!match) return res.status(404).json({ error: "Announcement not found." });

      const updated = {
        title: req.body.title !== undefined ? req.body.title : match.title,
        message: req.body.message !== undefined ? req.body.message : match.message,
        enabled: req.body.enabled !== undefined ? !!req.body.enabled : match.enabled,
        type: req.body.type !== undefined ? req.body.type : match.type,
        scheduledStart: req.body.scheduledStart !== undefined ? (req.body.scheduledStart ? new Date(req.body.scheduledStart) : null) : match.scheduledStart,
        scheduledEnd: req.body.scheduledEnd !== undefined ? (req.body.scheduledEnd ? new Date(req.body.scheduledEnd) : null) : match.scheduledEnd
      };

      const [resRow] = await db.update(announcements).set(updated).where(eq(announcements.id, id)).returning();
      return res.json({ success: true, announcement: resRow });
    } catch (err) {
      return res.status(500).json({ error: "Failed to shift announcement parameters." });
    }
  });

  app.delete("/api/cms/announcements/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(announcements).where(eq(announcements.id, req.params.id));
      return res.json({ success: true, message: "Announcement silenced." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to erase announcement." });
    }
  });

  // MEDIA LIBRARY CRUD
  app.get("/api/cms/media", requireAdmin, async (req, res) => {
    try {
      const items = await db.select().from(mediaLibrary).orderBy(mediaLibrary.createdAt);
      return res.json(items);
    } catch (err) {
      return res.status(500).json({ error: "Failed to read media library." });
    }
  });

  app.post("/api/cms/media", requireAdmin, async (req, res) => {
    try {
      const { fileName, fileUrl, fileType, fileSize } = req.body;
      if (!fileName || !fileUrl) {
        return res.status(400).json({ error: "File name and url references are required." });
      }

      // Generate simulation thumbnails
      let thumb = fileUrl;
      if (fileType && !fileType.startsWith("image")) {
        thumb = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=150&auto=format&fit=crop";
      }

      const [newFile] = await db
        .insert(mediaLibrary)
        .values({
          id: `med-${Date.now()}`,
          fileName,
          fileUrl,
          fileType: fileType || "image/jpeg",
          fileSize: fileSize !== undefined ? Number(fileSize) : 124000,
          thumbnailUrl: thumb
        })
        .returning();

      return res.status(201).json({ success: true, media: newFile });
    } catch (err) {
      console.error("Upload mock failure:", err);
      return res.status(500).json({ error: "Failed to allocate media parameters." });
    }
  });

  app.delete("/api/cms/media/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(mediaLibrary).where(eq(mediaLibrary.id, req.params.id));
      return res.json({ success: true, message: "Media resource unallocated." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to purge media resource." });
    }
  });

  // ANALYTICS & STATS REALTIME RESOLVER
  app.get("/api/cms/analytics", requireAdmin, async (req, res) => {
    try {
      // 1. Live statistics from the live db rows
      const dbUsers = await db.select().from(users);
      const dbEvents = await db.select().from(events);
      const dbRegs = await db.select().from(registrations);
      const dbCerts = await db.select().from(certificates);
      const dbSponsors = await db.select().from(sponsors);

      const activeMembersCount = dbUsers.filter(u => u.role === "member" || u.role === "admin").length;
      const eventsCount = dbEvents.length;
      const registrationsCount = dbRegs.length;
      const certificatesCount = dbCerts.length;
      const sponsorsCount = dbSponsors.length;
      
      // Calculate active mock visitors
      const visitorsCount = 740; // stable dynamic reference

      // 2. Fetch analytics growth history snapshots
      const snapshots = await db.select().from(analyticsSnapshots).orderBy(analyticsSnapshots.date);

      // 3. Assemble recent activity details
      const recentRegs = [...dbRegs]
        .sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime())
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          github: r.github,
          registeredAt: r.registeredAt,
          eventTitle: dbEvents.find(e => e.id === r.eventId)?.title || "Ecosystem Sprint"
        }));

      return res.json({
        counters: {
          visitors: visitorsCount,
          registrations: registrationsCount,
          activeMembers: activeMembersCount,
          events: eventsCount,
          certificates: certificatesCount,
          sponsors: sponsorsCount
        },
        snapshots,
        recentActivity: recentRegs
      });
    } catch (err) {
      console.error("Fetch analytics data failed:", err);
      return res.status(500).json({ error: "Failed to compile live server metrics." });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving built files...");
    const distPath = path.join(ROOT_DIR, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Tech Yuva] Node Server listening on port ${PORT} (http://localhost:${PORT})`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
