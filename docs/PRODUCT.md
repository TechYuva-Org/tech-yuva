# Product Documentation (PRODUCT.md)

## Overview
- **Core Purpose**: Tech Yuva acts as an elite digital campus and open-source infrastructure accelerator for young creators.
- **Goal**: Elevate youth technical capability by providing transparent access to high-tier collaborative hackathons and digital credentials.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: Complete Product Specification (v0.9)

---

## 1. Problem Statement & Market Opportunity

### The Problem
Traditional student developer groups are locked in generic academic cycles. Student hackathons often consist of low-effort front-end mockups, presentations built on slide decks without functional backends, and simple static HTML landing pages. 
Students lack experience working with:
1. **Durable, Relational Databases**: Most student-built projects rely on transient local states.
2. **Server-Side API Proxying & Secrets**: Many expose production API keys on client repositories.
3. **Verified Digital Credentials**: Traditional physical participation certificates are easily forged and hold little weight in technical recruitment.
4. **Interactive CMS Configurations**: Changing a header copy, updating an event slot, or editing metadata requires manual code changes, PR approvals, and redeployments.

### The Opportunity
Tech Yuva creates a unified, live, data-driven web applet that solves these problems by modeling a production-grade software lifecycle. It acts as both a **public showcase** and an **internal portal** where students transition from simple static visitors to active community members holding verified learning records.

---

## 2. User Personas

```
+----------------------------------------------------------------------------------------+
|                                    1. THE VISITOR                                      |
+----------------------------------------------------------------------------------------+
| Name: Rohit Sharma                                  Role: College Sophomore (CS Major) |
| Tech Level: Beginner                                Goal: Escape text tutorials        |
| Frustration: Bored with "Todo List" exercises that never deploy. Wants real group work.  |
| Needs: Clear timelines, instant access to coding events, and secure registration.     |
+----------------------------------------------------------------------------------------+
|                                    2. THE MEMBER                                       |
+----------------------------------------------------------------------------------------+
| Name: Priya Iyer                                    Role: Active Cohort Developer      |
| Tech Level: Intermediate                            Goal: Secure a backend internship  |
| Frustration: Hard to prove actual full-stack competency to hiring teams.               |
| Needs: Verified credentials, private Discord channels, and active project feedback.    |
+----------------------------------------------------------------------------------------+
|                                    3. THE ADMINISTRATOR                                |
+----------------------------------------------------------------------------------------+
| Name: Lakshay Soni                                  Role: Community Lead & Founder     |
| Tech Level: Advanced Architect                      Goal: Seamless system management   |
| Frustration: Writing code updates and redeploying servers just to modify simple text.  |
| Needs: Dynamic CMS dashboard, terminal-based CLI commands, and instant metrics.        |
+----------------------------------------------------------------------------------------+
```

---

## 3. Product Journeys

### A. The Visitor Journey (Discover & Register)
1. **Landing Stage**: Rohit arrives at the Tech Yuva landing page. He is greeted by an interactive, glowing **Terminal Hero** that prints system status checks.
2. **Discovery**: He scrolls past the terminal to review the **Active Initiatives** (announcements) and the current **Event Board** (hackathons and bootcamps).
3. **AI Exploration**: Rohit opens the built-in **AI Technical Advisor** at the bottom right. He types *"What are the entry requirements for YuvaHack?"*
4. **Interactive Retrieval**: The AI queries its knowledge database and prints back structured information: *"YuvaHack requires intermediate JavaScript knowledge and registration closes on July 15."*
5. **Registration**: He clicks the **Register** button on the YuvaHack card. A modal slides in, prompting for name, email, and GitHub profile.
6. **Double Submission Safeguard**: Rohit submits his registration. The system checks the database, registers the record, updates the ticket slots on the card in real-time, and generates an active receipt.

---

### B. The Member Journey (Participate & Certify)
1. **Dashboard Entry**: Priya logs into her **Member Portal** by selecting her identity in the header switcher.
2. **Attendance Log**: During the live hackathon, an organizer logs her attendance via the backend database. Her status updates to "Attended".
3. **Automated Issuance**: The database automatically triggers a database hook, compiling an active credential inside the `certificates` table.
4. **Certificate Display**: Priya sees her certificate appear on her dashboard. She clicks **View Certificate**.
5. **Verification**: Priya downloads the certificate as an image or copies the unique verification code (e.g., `TY-CERT-A93B2`). She shares this code on LinkedIn.
6. **Public Verification**: A potential employer visits the public Tech Yuva site, opens the **Certificate Verification Tool**, types Priya's code, and receives a green verified block: *"This confirms Priya completed the 36-Hour Flagship Hackathon under registration ID #104."*

---

### C. The Admin Journey (CMS Content & Live Operations)
1. **Admin Control Gate**: Lakshay switches his profile to "Admin (Lakshay Soni)". 
2. **Global Analytics**: The dashboard reveals core live counts: Registered users, Event capacity, Total certificates issued, and Sponsor counts.
3. **CMS Layout Management**: Lakshay needs to update the Founder's Quote and the registration deadlines. Instead of touching code, he opens the **Admin CMS Panel**:
   - Updates the text content under *Founder Vision*.
   - Saves changes.
   - The database updates instantly, and the landing page updates for all users.
4. **Terminal CLI Operations**: Lakshay wants a quick summary of event capacity. He switches to the **Admin Terminal**:
   - He types `stats`. The screen outputs a tabular view of database slots.
   - He types `announcement New Sponsor Onboarded!`. The system instantly writes an announcement record to PostgreSQL, updating the active notifications banner.
   - He types `clear` to reset the terminal buffer.

---

## 4. Key Workflows & Rules Engine

### A. Dynamic Event Slot System
To prevent server crash situations and over-capacity bookings:
- Every event has a designated `capacity` integer (e.g., 200).
- When a registration is successfully saved inside PostgreSQL, the system subtracts `1` from the active event capacity.
- Once the capacity reaches `0`, the registration button changes from a cyan interactive element to a dull gray `SOLD OUT` block, and the form disables.

### B. Duplicate Prevention Rule
- The database enforces a `UNIQUE` constraint across the pair of `email` and `eventId`.
- If a visitor attempts to register for the same hackathon twice, the server catches the duplicate payload and rejects it: *"You are already registered for this initiative."*

### C. Certificate Cryptographic Signatures
- Certificates cannot be forged. Each issued credential contains:
  - `registrationId` mapping back to a confirmed, attended register record.
  - `verificationCode`: A secure string generated as a hash representation of the participant's email, event title, and creation time.
  - Digital signature simulation displaying Lakshay Soni's validated signature block.
