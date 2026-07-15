# Database Documentation (DATABASE.md)

## Overview
- **Database Engine**: Cloud SQL (PostgreSQL - Developer Edition)
- **Object-Relational Mapper (ORM)**: Drizzle ORM
- **Key Characteristics**: Strict foreign key integrity, capacity locking constraints, index-accelerated retrieval, auto-increment keys.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Database Specification (v0.9)

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users {
        text id PK
        text email UNIQUE
        text name
        text role
        timestamp createdAt
    }
    events {
        text id PK
        text title
        text description
        text date
        text time
        text location
        text track
        integer capacity
        text status
        timestamp createdAt
    }
    registrations {
        text id PK
        text eventId FK "refers to events.id"
        text userId FK "refers to users.id"
        text name
        text email
        text github
        text attendanceStatus
        timestamp createdAt
    }
    certificates {
        text id PK
        text registrationId FK "refers to registrations.id"
        text userId FK "refers to users.id"
        text eventTitle
        text recipientName
        text recipientEmail
        text verificationCode UNIQUE
        timestamp issuedAt
    }
    site_settings {
        text id PK "constant 'global'"
        text siteName
        text supportEmail
        text discordUrl
        text githubUrl
        text hostingServerPack
        timestamp updatedAt
    }
    hero_content {
        text id PK "constant 'global'"
        text title
        text subtitle
        text stats "JSON Stringified array"
    }
    founder_content {
        text id PK "constant 'global'"
        text name
        text role
        text photo
        text introVideo
        text quote
        text biography
    }
    about_cards {
        text id PK
        text iconName
        text title
        text text
    }
    kb_chunks {
        text id PK
        text title
        text category
        text content
    }
```

---

## 2. Table Schemas & Specifications

### A. Table: `users`
Stores user records and credentials role-mapping.
- **Purpose**: Authenticates identities and maps system roles (visitor, member, admin).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PRIMARY KEY` | Unique ID of the user |
| `email` | `text` | `UNIQUE`, `NOT NULL` | Registered email address |
| `name` | `text` | `NOT NULL` | Participant name |
| `role` | `text` | `DEFAULT 'visitor'` | User permission: `visitor`, `member`, `admin` |
| `createdAt` | `timestamp`| `DEFAULT now()` | Date of account creation |

---

### B. Table: `events`
Hosts physical and virtual initiatives organized by Tech Yuva.
- **Purpose**: Serves event board layout listings and enforces capacity limits.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PRIMARY KEY` | Unique ID |
| `title` | `text` | `NOT NULL` | Event title (e.g. "YuvaHack 2026") |
| `description`| `text` | `NOT NULL` | Detailed explanation of track and rules |
| `date` | `text` | `NOT NULL` | Date string |
| `time` | `text` | `NOT NULL` | Operational time |
| `location` | `text` | `NOT NULL` | Venue or remote link |
| `track` | `text` | `NOT NULL` | Tech track: "FLAGSHIP TRACK", "BOOTCAMP" |
| `capacity` | `integer`| `NOT NULL`, `DEFAULT 100` | Max attendee threshold |
| `status` | `text` | `DEFAULT 'upcoming'`| Status: `upcoming`, `ongoing`, `past` |
| `createdAt` | `timestamp`| `DEFAULT now()` | Record created timestamp |

---

### C. Table: `registrations`
Transactional junction table tracking ticket bookings.
- **Purpose**: Connects users to events and controls attendance lists.
- **Constraints**: Composite Unique index on `(email, eventId)` prevents double registration.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PRIMARY KEY` | Unique ID |
| `eventId` | `text` | `FOREIGN KEY` (refers `events.id`) | Maps registration to event |
| `userId` | `text` | `FOREIGN KEY` (refers `users.id`) | Maps registration to user account |
| `name` | `text` | `NOT NULL` | Registrant developer name |
| `email` | `text` | `NOT NULL` | Registrant target email |
| `github` | `text` | `NOT NULL` | Developer GitHub username |
| `attendanceStatus` | `text` | `DEFAULT 'registered'` | Status: `registered`, `attended`, `absent` |
| `createdAt` | `timestamp`| `DEFAULT now()` | Booking timestamp |

---

### D. Table: `certificates`
Dynamic credentials automatically generated upon event completion.
- **Purpose**: Secure credential retrieval and public third-party verification.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PRIMARY KEY` | Unique ID |
| `registrationId`| `text` | `FOREIGN KEY` (refers `registrations.id`) | Link to validation record |
| `userId` | `text` | `FOREIGN KEY` (refers `users.id`) | Recipient member account ID |
| `eventTitle` | `text` | `NOT NULL` | Event descriptor copy |
| `recipientName`| `text` | `NOT NULL` | Display name on the card |
| `recipientEmail`| `text` | `NOT NULL` | Email verification mapping |
| `verificationCode`| `text`| `UNIQUE`, `NOT NULL` | Non-clashing hash (e.g., `TY-CERT-A93B2`) |
| `issuedAt` | `timestamp`| `DEFAULT now()` | Issuing timestamp |

---

### E. Table: `site_settings`
Provides visual configuration hooks for the static elements.
- **Purpose**: Centralized dashboard management of social targets and server metrics.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PRIMARY KEY` (Constant 'global') | Singleton ID lock |
| `siteName` | `text` | `DEFAULT 'Tech Yuva'` | Header/Footer Branding text |
| `supportEmail`| `text` | `DEFAULT 'support@techyuva.org'` | Help desk target email |
| `discordUrl` | `text` | `NOT NULL` | Invite URL for HQ Discord server |
| `githubUrl` | `text` | `NOT NULL` | Community organization repository |
| `hostingServerPack`| `text` | `DEFAULT 'AWS'` | Active hosting engine label |
| `updatedAt` | `timestamp`| `DEFAULT now()` | Tracking last configuration |

---

### F. Table: `founder_content`
Stores core biography metrics for Lakshay Soni.
- **Purpose**: Renders the Founder Vision section and biography video asset links.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `text` | `PRIMARY KEY` (Constant 'global') | Singleton ID lock |
| `name` | `text` | `DEFAULT 'Lakshay Soni'` | Display founder name |
| `role` | `text` | `DEFAULT 'Founder'` | Leadership role title |
| `photo` | `text` | `NOT NULL` | URL to professional avatar |
| `introVideo` | `text` | `NOT NULL` | Introduction MP4 video stream link |
| `quote` | `text` | `NOT NULL` | Primary developer statement block |
| `biography` | `text` | `NOT NULL` | Bulleted or paragraph summary text |

---

## 3. Indexes & Constraints

1. **Unique Email Constraint**:
   ```sql
   ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
   ```
2. **Dynamic Composite Index (Duplicate Protection)**:
   ```sql
   CREATE UNIQUE INDEX registrations_event_email_idx ON registrations (event_id, email);
   ```
   *Why*: This enforces at the database database engine layer that a user with an active email address cannot occupy more than one seat at a single hackathon event.
3. **Foreign Keys cascade rules**:
   - `registrations.eventId` links to `events.id` with `ON DELETE CASCADE`. If an event is canceled and purged by an admin, all active seat bookings are automatically purged.
   - `certificates.registrationId` links to `registrations.id` with `ON DELETE CASCADE`. If a registration is retracted, the credential invalidates instantly.
