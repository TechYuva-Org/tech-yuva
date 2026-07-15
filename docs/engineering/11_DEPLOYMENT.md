# 11 — DEPLOYMENT

> **Tech Yuva Engineering Bible** — Document 12 of 13  
> **Status:** Draft v1.0  
> **Last Updated:** 2026-07-12  
> **Owner:** Engineering  
> **Classification:** Internal — Engineering  
> **Prerequisites:** [02_ARCHITECTURE.md](./02_ARCHITECTURE.md), [03_DATABASE.md](./03_DATABASE.md)

---

## 1. Hosting Strategy

Tech Yuva is a monolithic Node.js application deployed as a stateless container on Google Cloud Platform.

| Component | GCP Service | Rationale |
|-----------|-------------|-----------|
| **Application Server** | Cloud Run | Serverless, scales to zero, automated HTTPS, zero infrastructure management. |
| **Database** | Cloud SQL (PostgreSQL) | Managed backups, automated failover, pgvector support. |
| **Secrets** | Secret Manager | Secure storage of API keys, injected into Cloud Run at runtime. |
| **Container Registry** | Artifact Registry | Secure storage for Docker images. |

---

## 2. Environment Configuration

### Required Environments

| Environment | Purpose | URL | DB Instance |
|-------------|---------|-----|-------------|
| **Local** | Developer testing | `http://localhost:3000` | Local Docker PG |
| **Staging** | Pre-launch QA | `https://staging.techyuva.org` | `techyuva-staging-db` |
| **Production** | Live site | `https://techyuva.org` | `techyuva-prod-db` |

### Environment Variables

Must be provided via Secret Manager in production.

```env
# Infrastructure
NODE_ENV="production"
PORT="8080"
APP_URL="https://techyuva.org"

# Database
DATABASE_URL="postgres://user:pass@host:5432/db"

# Auth & Security
SESSION_SECRET="generate-64-byte-secure-string"
ADMIN_EMAILS="founder@techyuva.org,tech@techyuva.org"

# External APIs
GEMINI_API_KEY="AIzaSy..."

# Email (Resend/Postmark)
SMTP_HOST="smtp.resend.com"
SMTP_USER="resend"
SMTP_PASS="re_..."
```

---

## 3. Build & Containerization

### Dockerfile Specification

The application requires a multi-stage Dockerfile to minimize production image size.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build the Vite frontend
RUN npm run build:client
# Build the Express backend (esbuild)
RUN npm run build:server

# Stage 2: Production Runtime
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build
# Copy migrations
COPY --from=builder /app/drizzle ./drizzle

ENV NODE_ENV=production
EXPOSE 8080
# Run migrations before starting the server
CMD ["sh", "-c", "npx drizzle-kit migrate && node build/server.js"]
```

---

## 4. CI/CD Pipeline (GitHub Actions)

Deployments should be fully automated upon push to specific branches.

### Workflow: Deploy to Staging (on push to `main`)

1. **Lint & Typecheck:** `npm run typecheck`
2. **Test:** `npm run test`
3. **Build:** Docker build
4. **Push:** Push to Google Artifact Registry
5. **Deploy:** `gcloud run deploy techyuva-staging --image ...`

### Workflow: Deploy to Production (on GitHub Release creation)

Identical to staging, but targets the `techyuva-prod` Cloud Run service and runs the production database migrations.

---

## 5. Database Migration Execution

Database schema changes are the highest risk component of any deployment.

**Strategy:** Run migrations automatically during the container startup sequence before the Express server listens for traffic.

```json
// package.json script
"start": "drizzle-kit migrate && node build/server.js"
```

**Why this works for Cloud Run:**
During a deployment, Cloud Run starts the new container instance. It runs the migration. If the migration fails, the container crashes, Cloud Run detects the failure, and the deployment is aborted. Traffic remains on the old, working revision.

---

## 6. Observability & Monitoring

### Google Cloud Logging

All `console.log` and `console.error` output from Cloud Run is automatically aggregated in Cloud Logging.

- Ensure logs are formatted as JSON so GCP can parse severity levels.
- Add an `error` listener to the Express app to catch unhandled promise rejections.

### Uptime Monitoring

Configure Google Cloud Monitoring (or a third-party like Better Uptime) to hit `GET /api/health` every 1 minute.
Alert the team via Slack/Discord if the endpoint fails to return `200 OK` for 3 consecutive minutes.

## Related Documents
- [02_ARCHITECTURE.md](./02_ARCHITECTURE.md) (System architecture)
- [03_DATABASE.md](./03_DATABASE.md) (Database backup strategies)
