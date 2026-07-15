# 09 — SECURITY

> **Tech Yuva Engineering Bible** — Document 10 of 13  
> **Status:** Draft v1.0  
> **Last Updated:** 2026-07-12  
> **Owner:** Engineering  
> **Classification:** Internal — Engineering  
> **Prerequisites:** [02_ARCHITECTURE.md](./02_ARCHITECTURE.md), [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md)

---

## 1. Threat Model

This outlines the primary vectors of attack against the Tech Yuva platform and how they are mitigated.

| Threat | Description | Mitigation Strategy |
|--------|-------------|---------------------|
| **Impersonation** | Gaining admin access to alter events or delete users. | Session-based auth with server-side validation. Hardcoded client emails removed. |
| **Data Scraping** | Extracting all user emails from public APIs. | Auth-gating `/api/users` and `/api/registrations`. Pagination and rate limiting. |
| **LLM Abuse** | Spamming the chat API to run up Gemini API bills. | Strict rate limiting per IP on `/api/chat`. |
| **Ticket Scalping / Spam** | Automating fake registrations to fill up event capacity. | Rate limiting per IP. Unique email constraint. Recaptcha V3 (V2 roadmap). |
| **Cross-Site Scripting (XSS)**| Injecting malicious scripts into CMS fields. | React auto-escapes by default. Zod validation strips HTML tags. Strict CSP. |
| **SQL Injection** | Manipulating input to execute arbitrary DB commands. | Drizzle ORM uses parameterized queries exclusively. |

---

## 2. P0 Security Fixes Required Before Launch

As identified in the product audit, the current codebase has severe security flaws that MUST be resolved before a public domain points to this application.

1. **Remove `IdentitySwitcher.tsx` from production.**
   - Current state: Always rendered. Anyone can click "Become Admin".
   - Fix: Wrap in `if (import.meta.env.DEV)` or remove entirely.

2. **Remove hardcoded admin email.**
   - Current state: `const ADMIN_EMAIL = 'dakshchaudhary2668@gmail.com'` is in `App.tsx`.
   - Fix: Use server-side `ADMIN_EMAILS` environment variable (see [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md)).

3. **Secure the `/api/users` and `/api/registrations` endpoints.**
   - Current state: Publicly accessible without auth.
   - Fix: Apply `requireAdmin` middleware.

---

## 3. Rate Limiting

Implement using `express-rate-limit`.

| Endpoint Group | Limit | Window | Purpose |
|----------------|-------|--------|---------|
| `/api/auth/verify` | 5 | 15 mins | Prevent OTP brute forcing. |
| `/api/auth/*` (other) | 20 | 15 mins | Prevent login spam. |
| `/api/chat` | 10 | 1 min | Protect Gemini API quota. |
| `/api/registrations` (POST) | 5 | 1 min | Prevent automated spot-stealing. |
| `/api/cms/*` (Mutations) | 30 | 1 min | Prevent accidental rapid-fire saves by admin. |
| **Global API** | 100 | 1 min | Basic DDoS protection. |

---

## 4. Content Security Policy (CSP)

A strict CSP prevents XSS attacks by restricting where scripts and assets can be loaded from.

**Recommended Header:**
```http
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https://images.unsplash.com; 
  connect-src 'self' https://generativelanguage.googleapis.com;
  font-src 'self' data:;
```
*(Note: 'unsafe-inline' for scripts may be needed for Vite's HMR in dev, but should ideally be removed in prod if possible, relying only on bundled JS. The `img-src` must include any external domains used by the CMS).*

---

## 5. Input Validation

All incoming data must be validated against a strict schema before processing.

**Tool:** `zod`

**Example:**
```typescript
const registerSchema = z.object({
  eventId: z.string().startsWith('evt_'),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  github: z.string().url().optional().or(z.literal('')),
});

// Middleware
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: "VALIDATION_ERROR", details: err.errors });
  }
};
```

---

## 6. DPDP Act Compliance (India)

The Digital Personal Data Protection (DPDP) Act of 2023 requires specific handling of user data for Indian citizens.

1. **Purpose Limitation:** Data collected during registration (Name, Email, GitHub) is used *only* for event operations and certificates. It must not be sold or shared.
2. **Right to Erasure:** A user can request account deletion.
   - Implementation: `DELETE FROM users WHERE id = ?` (cascades to all personal data).
3. **Data Localization:** While not strictly required for this class of non-sensitive data, hosting in `asia-south1` (Mumbai) aligns with best practices and reduces latency.

## Related Documents
- [02_ARCHITECTURE.md](./02_ARCHITECTURE.md) (Architecture boundaries)
- [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md) (Authentication flow and session security)
