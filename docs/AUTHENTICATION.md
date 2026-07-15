# Authentication Specification (AUTHENTICATION.md)

## Overview
- **Current Architecture**: Developer-focused, Header-Mocking Identity Model (using `x-user-email` requests headers)
- **Goal**: Allow effortless platform evaluation in the sandboxed preview environment while maintaining clear pathways for enterprise security migration.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Security & Access Specs (v0.9)

---

## 1. Current Authentication Flow

The current pre-production setup uses a high-speed, local **Identity Switcher** designed to simplify developer testing. Users do not need to authenticate via Google OAuth or fill passwords to test distinct user journeys:

```
                  +-----------------------------------+
                  |      Header Identity Switcher     |
                  +-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
   [ROLE: VISITOR]           [ROLE: MEMBER]            [ROLE: ADMIN]
   No email passed           Registered email          dakshchaudhary2668@gmail.com
   Read events, register     Download certificates,    Manage CMS panels,
   for hackathons.           check member details.     access terminal, seed database.
```

### Authorization Enforcement Middleware
All critical database write operations in `server.ts` use the `requireAdmin` helper:
```typescript
export async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userEmail = req.headers["x-user-email"] as string;
  if (!userEmail) {
    return res.status(401).json({ error: "Authentication required. 'x-user-email' header is missing." });
  }
  
  // Strict admin email check matching Lakshay's design identity
  if (userEmail.trim().toLowerCase() !== "dakshchaudhary2668@gmail.com") {
    return res.status(403).json({ error: "Forbidden. Admin authorization required." });
  }
  
  next();
}
```

---

## 2. Session Persistence Strategy

To preserve session states across container restarts, browser reloads, and offline drops:
1. **Local Storage Synchronization**:
   - The user’s selected role and email are serialized and saved under `localStorage.setItem("techyuva_user", ...)` on the client.
   - Upon initial hydration, `main.tsx` loads the stringified object, instantiating the TanStack Query cache headers context.
2. **Dynamic Header Injectors**:
   - The custom `cmsFetch` utility dynamically pulls the current cached state:
     ```typescript
     const headers = {
       "Content-Type": "application/json",
       "x-user-email": currentUser?.email || ""
     };
     ```

---

## 3. Production Authentication Roadmap

For staging and public production deployments, the platform has migrated to a session-based magic link OTP system backed by PostgreSQL. The use of Firebase Auth has been **permanently rejected** to avoid client-side SDK dependencies and to keep our session layer unified.

If Google OAuth or GitHub SSO is required in the future, it will be implemented via server-side flows (e.g., Passport.js) that issue standard `nanoid` based session tokens directly into our PostgreSQL database.
