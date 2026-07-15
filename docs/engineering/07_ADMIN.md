# 07 — ADMIN

> **Tech Yuva Engineering Bible** — Document 8 of 13  
> **Status:** Draft v1.0  
> **Last Updated:** 2026-07-12  
> **Owner:** Engineering  
> **Classification:** Internal — Engineering  
> **Prerequisites:** [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md), [05_CMS.md](./05_CMS.md)

---

## 1. Admin Dashboard Vision

The Admin Dashboard is the operational control center for Tech Yuva. It prioritizes **speed, utility, and data density** over aesthetics. It should feel like an internal tool built by developers, for community managers.

### Core Tenets

1. **No unnecessary animations:** Admins are working, not browsing.
2. **Keyboard navigable:** Common actions should be accessible without a mouse.
3. **Data density:** Show as many rows/metrics as readable on a single screen.
4. **Destructive actions require confirmation:** Accidental deletions must be prevented.

---

## 2. Dashboard Architecture (UI)

The admin panel is gated behind the `/admin` route (client-side) and `requireAdmin` middleware (server-side).

### Layout Structure

```
[ Top Navbar: Logo | Current Admin Name | Logout ]
---------------------------------------------------
[ Sidebar Navigation ] | [ Main Content Area ]
- Overview (Analytics) |
- Events               | (Content changes based on
- Registrations        |  active sidebar tab)
- Users                |
- CMS                  |
  - Hero               |
  - About              |
  - Gallery            |
  ...                  |
---------------------------------------------------
```

### Route Code Splitting

Currently, `AdminCMS.tsx` is loaded for all users. In the target architecture, the entire Admin suite is code-split and only downloaded if the user has the `admin` role.

```typescript
// App.tsx
const AdminDashboard = React.lazy(() => import('./admin/AdminDashboard'));

<Route path="/admin/*" element={
  <RequireAuth role="admin">
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  </RequireAuth>
} />
```

---

## 3. Core Modules

### 3.1 Overview (Analytics)

A single view summarizing the health of the community.

**Metrics Displayed:**
- **MAR (Monthly Active Registrations):** Current month vs. previous month.
- **Total Members:** Number of users with `role='member'`.
- **Event Fill Rate:** Average `(total_registrations / total_spots)` for past 3 events.
- **Recent Activity Log:** Last 10 registrations or CMS edits.

**Implementation Note:** As noted in [03_DATABASE.md](./03_DATABASE.md), avoid loading entire tables into memory. Use SQL `COUNT(*)` aggregate queries.

### 3.2 Event Management

CRUD interface for the `events` table.

- **List View:** Table showing Status, Title, Date, Spots (Filled/Total). Filterable by status (`upcoming`, `past`, `draft`).
- **Create/Edit View:** Form for event details.
- **Attendance View (for Past events):** List of registered users with a checkbox for "Attended". Includes a "Complete Event & Issue Certificates" button.

### 3.3 User Management

CRUD interface for the `users` table.

- **List View:** Table showing Name, Email, Role, Join Date, Registration Count.
- **Actions:**
  - Promote Visitor → Member (grants access to member dashboard).
  - Promote Member → Admin (grants full access).
  - Demote Admin → Member.
  - Delete User (DPDP compliance; requires double confirmation).

### 3.4 CMS

Detailed in [05_CMS.md](./05_CMS.md). The CMS is a sub-module of the Admin Dashboard.

---

## 4. API Endpoints (Admin Domain)

Most endpoints are covered in Events, Users, and CMS sections. Specific admin operational endpoints:

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/admin/analytics` | Admin | Aggregate counts for the Overview tab |
| `GET` | `/api/admin/users` | Admin | List all users (paginated, filterable by role) |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Change user role (promote/demote) |
| `DELETE`| `/api/admin/users/:id` | Admin | Delete a user and all associated data |

---

## 5. Security & Auditing

### Role Escalation Prevention

An admin cannot change their *own* role to prevent accidental lockouts, unless they are the last remaining admin (edge case). The API must enforce:
`if (req.user.id === targetUserId) return 403 Forbidden`

### Audit Trail (V2)

For V2, every admin action (create event, change CMS, change user role) must be logged in an `audit_logs` table:
`[Timestamp] Admin [Email] performed [Action] on [Resource ID]`

---

## 6. Implementation Priorities

1. **Code-split Admin UI (P1):** Remove the 109KB `AdminCMS.tsx` from the main public bundle.
2. **Implement `requireAdmin` (P0):** Ensure no admin endpoints are accessible via spoofed headers or to non-admins.
3. **Analytics Optimization (P2):** Rewrite the current in-memory analytics to use SQL aggregations.
4. **Attendance UI (P1):** Build the critical interface for marking attendance and completing events.

## Related Documents
- [04_AUTH_SYSTEM.md](./04_AUTH_SYSTEM.md) (Admin authentication and RBAC)
- [05_CMS.md](./05_CMS.md) (Content management interface)
- [06_EVENTS.md](./06_EVENTS.md) (Event lifecycle and attendance)
