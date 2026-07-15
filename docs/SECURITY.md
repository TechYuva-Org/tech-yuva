# Security Specification & Risk Register (SECURITY.md)

## Overview
- **Core Security Stance**: Decoupled full-stack architecture keeping database connections and LLM API keys hidden from the client.
- **Vulnerability Defense**: Structured Drizzle ORM parametrizations, input sanitation buffers, role-based API authorization, and secure mock evaluation gates.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Security Specification (v0.9)

---

## 1. Threat Modeling & Risk Register

The following matrix represents identified security vectors across the platform, their severities, and mitigating platform architecture:

```
+-------------------+----------+------------------------------------------+--------------------------------------------+
| THREAT VECTOR     | SEVERITY | ROOT CAUSE                               | PRODUCTION MITIGATION                      |
+-------------------+----------+------------------------------------------+--------------------------------------------+
| 1. SQL Injection  | P0       | Raw SQL query string concatenation       | Parameterized queries via Drizzle ORM      |
| 2. Secrets Leak   | P0       | Bundling credentials in client assets     | Strict server-side storage of variables    |
| 3. XSS Injections | P1       | Rendering unescaped user inputs in DOM   | React default escaping & text-only inputs  |
| 4. Capacity Spoof | P1       | Race conditions on slot allocations      | Atomic db checks inside transactions       |
| 5. AI Jailbreaks  | P2       | Malicious prompt injection to LLM        | Server-side instruction filters & limits   |
+-------------------+----------+------------------------------------------+--------------------------------------------+
```

---

## 2. In-Depth Mitigation Analyses

### A. SQL Injection (SQLi)
- **Problem**: Traditional student registration forms are vulnerable to inputs like `' OR '1'='1`.
- **Defense**: Tech Yuva uses Drizzle ORM. Drizzle compiles all interactions into parameterized queries automatically.
  ```typescript
  // SECURE: Automatically compiled to SELECT * FROM registrations WHERE email = ?
  await db.select().from(registrations).where(eq(registrations.email, userEmail));
  ```
  Even when executing manual SQL queries (e.g. inside RAG or seed modules), the schema forces parameterized placeholders:
  ```typescript
  // SECURE: Dynamic inputs are parameterized
  await db.execute(sql`SELECT * FROM kb_chunks WHERE content ILIKE ${'%' + keyword + '%'}`);
  ```

---

### B. Cross-Site Scripting (XSS)
- **Problem**: Attackers submitting HTML tags or script blocks in the Name or GitHub fields to execute malicious JavaScript in other users' browsers.
- **Defense**:
  - React's standard text interpolation (`{user.name}`) automatically escapes HTML tags before rendering.
  - Form validation on the client and server employs a strict regex pattern permitting only alphanumeric characters, spaces, and hyphens:
    ```typescript
    const cleanName = name.replace(/[^a-zA-Z0-9\s-]/g, "");
    ```
  - Direct rendering blocks (such as `dangerouslySetInnerHTML`) are banned from the codebase.

---

### C. Race Conditions & Ticket Double-Booking
- **Problem**: If two users register for a single remaining hackathon slot at the exact same millisecond, both might register, pushing the event past its capacity.
- **Defense**:
  - The server wraps slot calculation and seat insertion inside a single atomic database transaction:
    ```typescript
    await db.transaction(async (tx) => {
      const [event] = await tx.select().from(events).where(eq(events.id, eventId)).limit(1);
      
      const currentRegistrationsCount = await tx
        .select({ count: count() })
        .from(registrations)
        .where(eq(registrations.eventId, eventId));

      if (currentRegistrationsCount[0].count >= event.capacity) {
        throw new Error("Event is fully booked!");
      }

      await tx.insert(registrations).values({ ...payload });
    });
    ```

---

## 3. API Hardening Checklist

To prepare Tech Yuva for enterprise scale:
1. **Session OTP Checks**: Transition from simple header mocking (`x-user-email`) to verifying cryptographically secure sessions backed by PostgreSQL and Magic Links.
2. **Rate Limiting (DDoS Protection)**:
   - Integrate `express-rate-limit` to restrict client IP requests to a maximum of `100` calls per 15 minutes:
     ```typescript
     import rateLimit from "express-rate-limit";
     const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
     app.use("/api/", apiLimiter);
     ```
3. **HTTP Security Headers**:
   - Integrate `helmet` to automatically inject protection headers (CSP, HSTS, X-Frame-Options to prevent Clickjacking, etc.).
