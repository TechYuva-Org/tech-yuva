# 06 — EVENTS

> **Tech Yuva Engineering Bible** — Document 7 of 13  
> **Status:** Active v1.1  
> **Last Updated:** 2026-09-19  
> **Owner:** Engineering  
> **Classification:** Internal — Engineering  
> **Prerequisites:** [03_DATABASE.md](./03_DATABASE.md), [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md)

---

## 1. Event Lifecycle

An event in Tech Yuva moves through five strict states.

```mermaid
stateDiagram-v2
    [*] --> Draft: Admin creates
    Draft --> Upcoming: Admin publishes
    Upcoming --> Past: System (date passed)
    Past --> Completed: Admin marks attendance
    Completed --> [*]: Certificates issued
    
    Upcoming --> Cancelled: Admin cancels
    Cancelled --> [*]
```

| State | Visibility | Registration | Actions Available |
|-------|------------|--------------|-------------------|
| `draft` | Admin only | Closed | Edit details, Publish, Delete |
| `upcoming` | Public | Open (if spots > 0) | Edit details, Cancel, View registrations |
| `past` | Public | Closed | Mark attendance, Complete |
| `completed`| Public | Closed | View certificates, View analytics |
| `cancelled`| Public (marked) | Closed | None (terminal state) |

### State Transitions

- **Upcoming → Past:** Auto-transition when `event_date < CURRENT_DATE`. Handled by a daily cron or lazily checked on `GET /api/events`.
- **Past → Completed:** Manual admin action. Triggers certificate generation for all attended users. This is a one-way operation.

---

## 2. Event Registration Flow

The registration flow is the core conversion funnel of the platform.

### Requirements

1. **Frictionless:** Users should not need to "create an account" first. Registration *is* the account creation.
2. **Duplicate Prevention:** A user cannot register twice for the same event.
3. **Capacity Enforcement:** Registration must fail if `spots_left == 0`.
4. **Race Condition Safety:** Concurrent registrations must not overallocate spots.

### Technical Implementation

```mermaid
sequenceDiagram
    participant U as User
    participant API as /api/registrations
    participant DB as PostgreSQL

    U->>API: POST { eventId, name, email, github, ... }
    
    %% Capacity Check
    API->>DB: Check event capacity (SELECT spots_left)
    alt spots_left <= 0
        API-->>U: 422 Unprocessable Entity (Capacity Exceeded)
    end
    
    %% Duplicate Check
    API->>DB: Check for existing registration (SELECT id WHERE event_id = ? AND email = ?)
    alt exists
        API-->>U: 409 Conflict (Already Registered)
    end
    
    %% User Upsert
    API->>DB: Upsert user (INSERT ON CONFLICT UPDATE email)
    DB-->>API: user_id
    
    %% Transaction Start
    API->>DB: BEGIN
    
    %% Spot Decrement (Atomic)
    API->>DB: UPDATE events SET spots_left = spots_left - 1 WHERE id = ? AND spots_left > 0 RETURNING spots_left
    alt rows affected == 0
        API->>DB: ROLLBACK
        API-->>U: 422 Unprocessable Entity (Capacity Exceeded)
    end
    
    %% Registration Insert
    API->>DB: INSERT INTO registrations (event_id, user_id, ...)
    
    API->>DB: COMMIT
    
    %% Async Actions
    API-)Email: Send confirmation email async
    
    API-->>U: 201 Created { registrationId, ... }
```

### Critical Concurrency Fix

Currently, `spotsLeft` is checked in memory and updated non-atomically. The SQL transaction above (specifically the `UPDATE ... WHERE spots_left > 0 RETURNING`) is mandatory to prevent negative capacity under load.

---

## 3. Attendance & Certificates

Tech Yuva automates credential issuance. When an admin verifies attendance, the system issues verifiable certificates.

### Attendance Flow

1. Admin opens the event dashboard (must be in `past` state).
2. Admin sees the list of registered users.
3. Admin toggles attendance (true/false) for each user.
   - API: `PATCH /api/registrations/:id/attend { attended: true }`
4. When finished, Admin clicks "Complete Event".
   - API: `POST /api/events/:id/complete`

### Certificate Generation Flow

The `Complete Event` action triggers the generation.

```mermaid
sequenceDiagram
    participant Admin
    participant API as /api/events/:id/complete
    participant DB as PostgreSQL
    participant Worker as Background Task

    Admin->>API: POST /api/events/evt_123/complete
    
    API->>DB: BEGIN
    API->>DB: UPDATE events SET status = 'completed' WHERE id = 'evt_123'
    API->>DB: COMMIT
    
    API-->>Admin: 200 OK (Event completed, generating certificates)
    
    API-)Worker: Start certificate generation for evt_123
    
    Note over Worker,DB: Async Process
    
    Worker->>DB: SELECT * FROM registrations WHERE event_id = 'evt_123' AND attended = true
    loop For each attendee
        Worker->>Worker: Generate verification_code (e.g. TY-26-8A3B9C)
        Worker->>DB: INSERT INTO certificates (...)
        Worker-)Email: Send email with certificate link
    end
```

### Certificate Verification

Certificates must be publicly verifiable by anyone (e.g., a recruiter clicking a link on a student's LinkedIn profile).

- **URL:** `https://techyuva.org/verify/:code`
- **API:** `GET /api/certificates/verify/:code`
- **Response:**
  ```json
  {
    "valid": true,
    "certificate": {
      "recipientName": "Daksh Chaudhary",
      "eventTitle": "YuvaHack 2026",
      "issueDate": "2026-07-15T12:00:00Z",
      "verificationCode": "TY-26-8A3B9C"
    }
  }
  ```

---

## 4. API Endpoints (Events Domain)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/events` | None | List upcoming/past events (paginated) |
| `GET` | `/api/events/:id` | None | Get specific event details |
| `POST` | `/api/events` | Admin | Create a new event |
| `PATCH`| `/api/events/:id` | Admin | Update event details (supports `image`, `externalLink`, `metadata`) |
| `DELETE`| `/api/events/:id`| Admin | Delete event (cascades) |
| `GET` | `/api/events/:id/registrations` | Admin | List attendees for an event |
| `POST` | `/api/events/:id/complete` | Admin | Lock event, issue certs |
| `POST` | `/api/registrations` | None | Register for an event |
| `PATCH`| `/api/registrations/:id/attend` | Admin | Mark user as attended |
| `GET` | `/api/registrations/mine` | Auth | Get current user's registrations |
| `GET` | `/api/certificates/mine` | Auth | Get current user's certificates |
| `GET` | `/api/certificates/verify/:code` | None | Verify a certificate |

---

## 5. Waitlist Strategy (V2)

Currently, when `spots_left == 0`, registration fails. In V2, we implement a waitlist.

1. When `spots_left == 0`, users can still register, but `status` is set to `waitlisted`.
2. If an existing attendee cancels (`DELETE /api/registrations/:id`), a trigger or application logic checks the waitlist.
3. The first waitlisted user is promoted to `confirmed`, and an email is sent.

**Database changes needed (V2):**
- Add `status` enum to `registrations` (`confirmed`, `waitlisted`, `cancelled`).

---

## 6. Implementation Priorities

1. **Fix atomic spot decrement (P0):** Implement the SQL-level check to prevent negative capacity.
2. **User upsert on registration (P0):** Ensure registration creates a proper user account linked to auth.
3. **Event Date type fix (P1):** Migrate text dates to actual `date` types for sorting and auto-archival.
4. **Attendance UI (P1):** Build the admin view to toggle attendance efficiently.
5. **Auto-archival (P2):** Implement the logic to move past events out of the "upcoming" view automatically.

## Related Documents
- [03_DATABASE.md](./03_DATABASE.md) (ERD and indexing for events)
- [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md) (Auth required for event management)
- [07_ADMIN.md](./07_ADMIN.md) (Admin UI for managing the event lifecycle)

---

## 7. Event `metadata` Field (JSONB)

The `events` table carries a nullable `metadata JSONB` column for rich content that does not belong in the flat schema. This is the canonical location for all non-core event data — speaker bios, slugs, highlights, registration state, etc.

**Never** store rich-content exclusively in `src/data.ts`. `src/data.ts` is a **read-only fallback** for when the database is unreachable.

### Schema (TypeScript: `EventMetadata`)

```typescript
interface EventSpeaker {
  name: string;
  designation: string[];  // ordered list of roles
  photo?: string;         // absolute public path e.g. "/vikas-kumar.jpg"
}

interface EventMetadata {
  slug?: string;              // URL segment: /events/<slug>
  tagline?: string;           // Short tagline shown on card & detail page
  speaker?: EventSpeaker;
  highlights?: string[];      // Key agenda items / session highlights
  closingMessage?: string;
  registrationOpen?: boolean; // EXPLICIT flag. false = show 'VIEW DETAILS', true = show 'SECURE PASS'
  registrationMessage?: string; // Displayed when registrationOpen is false
}
```

> [!IMPORTANT]
> `registrationOpen` must be **explicitly set**. The frontend never infers registration status from dates or spotsLeft. If omitted, fallback assumes registration is open.

### Slug Routing

Client-side routing resolves event detail pages via `window.history.pushState` in `src/App.tsx`. No additional router dependency is required.

- Card CTA `VIEW DETAILS` button → `/events/<slug>`
- Full detail page rendered by `src/components/EventDetailPage.tsx`
- SPA catch-all in `server.ts` (`app.get("*", ...)`) ensures browser refresh works in production.

### Seeding rich events

All canonical events — including rich metadata — are seeded via `seedDefaultEvents()` in `src/db/seedCMS.ts` using `onConflictDoUpdate`. This runs on every server start (before the CMS idempotency check), keeping the database in sync.

```typescript
await db.insert(events).values(cyberEvent).onConflictDoUpdate({
  target: events.id,
  set: { title, category, date, rawDate, time, venue, tags, description, status, image, metadata, featured }
});
```

---

## 8. Implemented Events Reference

| ID | Title | Date | Status | Has Metadata |
|----|-------|------|--------|--------------|
| `cyber-intelligence-digital-defense` | Cyber Intelligence & Digital Defense | 23 Sep 2026 | `upcoming` | ✅ Speaker, Highlights, Slug |
| `9IsWSVoO-DLaVO7EdP0Rq` | DROP HACK'26 | 29 Aug 2026 | `past` | ❌ (community partner event) |
