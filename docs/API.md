# API Documentation (API.md)

## Overview
- **Protocol**: HTTP/1.1 REST JSON API
- **Endpoint Prefix**: `/api`
- **General Security**: Header-based authentication and role enforcement mapping client profile roles.
- **Author**: Lakshay Soni (Lead Architect & Founder)
- **Last Updated**: July 2026
- **Status**: API Reference Draft (v0.9)

---

## 1. Authentication & Middleware Guardrails

To access restricted endpoints (e.g. modifying CMS panels, managing attendees), client requests must pass active user identity mappings in headers:

- **Header Name**: `x-user-email`
- **Validation**:
  - Unauthenticated visitors present `x-user-email: ""` or omit the header (Role: `visitor`).
  - Members present a registered email (Role: `member`).
  - Administrators present `x-user-email: dakshchaudhary2668@gmail.com` (Role: `admin`).

---

## 2. API Endpoint Catalog

### A. Events Subsystem

#### 1. Fetch Event Board
- **Method**: `GET`
- **Route**: `/api/events`
- **Purpose**: Retrieves all organized initiatives (including capacity, tracks, dates, and live remaining slots).
- **Authentication**: None (Public)
- **Response Payload (`200 OK`)**:
  ```json
  [
    {
      "id": "yuvahack-2026",
      "title": "YuvaHack 36-Hour National Sprint",
      "description": "Form teams of up to 4 student developers to build modern database-driven applications under high pressure.",
      "date": "August 14-16, 2026",
      "time": "09:00 AM (IST) onwards",
      "location": "Flagship Campus Hall, Delhi",
      "track": "FLAGSHIP TRACK",
      "capacity": 150,
      "status": "upcoming",
      "createdAt": "2026-07-10T08:00:00.000Z"
    }
  ]
  ```

#### 2. Create Event Card
- **Method**: `POST`
- **Route**: `/api/events`
- **Purpose**: Instantly injects an upcoming technical initiative onto the home slider.
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "title": "Backend API Bootcamp",
    "description": "Learn Express, Drizzle ORM, and secure environment configuration.",
    "date": "September 05, 2026",
    "time": "11:00 AM (IST)",
    "location": "Virtual Discord HQ",
    "track": "BOOTCAMP",
    "capacity": 200
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "event": {
      "id": "generated-uuid-slug",
      "title": "Backend API Bootcamp",
      "capacity": 200,
      "status": "upcoming"
    }
  }
  ```
- **Error Codes**:
  - `401 Unauthorized`: "x-user-email is missing or not authorized as admin."
  - `400 Bad Request`: "Title and Capacity are required parameters."

---

### B. Registrations Subsystem

#### 1. Submit Initiative Registration
- **Method**: `POST`
- **Route**: `/api/registrations`
- **Purpose**: Books a seat, checking constraints and deducting available capacity slots.
- **Authentication**: None (Public - registration requires email form)
- **Request Body**:
  ```json
  {
    "eventId": "yuvahack-2026",
    "name": "Priya Iyer",
    "email": "priya.iyer@example.com",
    "github": "priya-iyer"
  }
  ```
- **Response Payload (`200 OK` / `201 Created`)**:
  ```json
  {
    "success": true,
    "registration": {
      "id": "reg-uuid-104",
      "eventId": "yuvahack-2026",
      "name": "Priya Iyer",
      "email": "priya.iyer@example.com",
      "attendanceStatus": "registered"
    }
  }
  ```
- **Error Codes**:
  - `400 Bad Request`: "Event is already sold out! No remaining slots."
  - `409 Conflict`: "You are already registered for this initiative."

#### 2. Mark Attendance (Admin Operations)
- **Method**: `POST`
- **Route**: `/api/registrations/:id/attend`
- **Purpose**: Marks an attendee present, triggering a database hook to issue a certificate.
- **Authentication**: Required (Admin only)
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "registration": {
      "id": "reg-uuid-104",
      "attendanceStatus": "attended"
    },
    "certificateIssued": {
      "id": "cert-uuid-201",
      "verificationCode": "TY-CERT-YV9A"
    }
  }
  ```

---

### C. Certificates Subsystem

#### 1. Public Certificate Verification
- **Method**: `GET`
- **Route**: `/api/certificates/verify/:code`
- **Purpose**: Verifies validity of a certificate code.
- **Authentication**: None (Public)
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "verified": true,
    "certificate": {
      "recipientName": "Priya Iyer",
      "eventTitle": "YuvaHack 36-Hour National Sprint",
      "issuedAt": "2026-07-10T08:15:00.000Z",
      "verificationCode": "TY-CERT-YV9A"
    }
  }
  ```
- **Error Codes**:
  - `404 Not Found`: "Certificate verification code is invalid or does not exist."

---

### D. AI Integration (RAG Engine)

#### 1. RAG Advisor Chat
- **Method**: `POST`
- **Route**: `/api/chat`
- **Purpose**: Answers platform technical/organizational queries using context matching and the Gemini API.
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "message": "Who is the Lead Architect of Tech Yuva and how do I join?"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "response": "💡 Tech Yuva was founded by Lakshay Soni, who serves as the Lead Architect. You can easily register for events and apply for active membership by scrolling down to the 'Join Community' section on our home page!"
  }
  ```
- **Error Codes**:
  - `500 Internal Server Error`: "Gemini API key is not configured on server host environment."
