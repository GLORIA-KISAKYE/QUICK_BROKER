# Quick-Broker — Implementation Plan

**Version:** 3.0
**Date:** 2026-09-28
**Source PRD:** `DOCX/AI QUICK BROKER.md` (v1.0)

---

## Project Summary

| | |
|---|---|
| **Product** | Quick-Broker — rental discovery platform |
| **Market** | Ishaka, Uganda (KIU students) |
| **Users** | Students only — landlords are NOT users in v1; listings are admin-managed |
| **Current Stage** | PRD complete; pre-development |
| **Goal** | Connect KIU students with verified landlords; make finding accommodation faster, clearer, and more trustworthy |

---

## Recommended Tech Stack

| Layer | Technology | Cost | Rationale |
|---|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | **FREE** | Fast dev, mobile-first responsive, PWA-capable |
| **Mobile** | PWA (Progressive Web App) | **FREE** | No app store friction; works on any phone browser; installable |
| **Backend** | Node.js + Express | **FREE** | Lightweight, fast to build, direct PostgreSQL queries |
| **Database** | PostgreSQL (self-hosted on local device) | **FREE** | Full control, no vendor lock-in, raw SQL queries |
| **Auth** | Email OTP (ZeptoMail + JWT) | **FREE** | ZeptoMail sandbox mode — no domain needed |
| **File Storage** | Cloudflare R2 (free tier: 10GB) | **FREE** | S3-compatible object storage, zero egress fees, CDN delivery |
| **ORM** | **None** — raw SQL with `pg` library | **FREE** | Direct PostgreSQL queries via node-postgres |
| **Hosting** | **Local device** (Raspberry Pi / old laptop / home PC) | **FREE** | Full control, zero monthly cost, low latency for Ishaka users |
| **Dev Environment** | Docker Compose | **FREE** | One-command local development; same env everywhere |
| **Process Manager** | PM2 | **FREE** | Production process management; auto-restart on crash |
| **Maps/Distance** | OpenStreetMap + OSRM | **FREE** | Calculate distance/time from KIU |
| **WhatsApp** | WhatsApp Deep Links (`wa.me`) | **FREE** | Opens WhatsApp with pre-filled message |
| **Calls** | `tel:` deep links | **FREE** | Native phone dialer |
| **Domain** | DuckDNS | **FREE** | Free dynamic DNS subdomain |
| **SSL** | Let's Encrypt + certbot | **FREE** | Free HTTPS certificates |

### Cost Summary

| Item | Cost |
|------|------|
| React + Vite + Tailwind | **$0** |
| Node.js + Express | **$0** |
| PostgreSQL (local device) | **$0** |
| Email OTP (ZeptoMail sandbox) | **$0** |
| Cloudflare R2 (free tier: 10GB storage, 10M requests/month) | **$0** |
| Docker (local dev) | **$0** |
| PM2 (production process manager) | **$0** |
| Local device hosting | **$0/month** |
| OpenStreetMap + OSRM | **$0** |
| DuckDNS (free subdomain) | **$0** |
| Let's Encrypt (SSL) | **$0** |
| WhatsApp / tel: deep links | **$0** |
| **Total** | **$0/month** |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client (PWA)                      │
│         React + Vite + Tailwind CSS                 │
│    Mobile-first, installable, offline-capable        │
│                                                      │
│  Uses: fetch() / axios → REST API                   │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON) over HTTPS
┌──────────────────────┴──────────────────────────────┐
│              Backend (Node.js + Express)             │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐           │
│  │  Auth    │ │ Listings │ │Inspection │           │
│  │(Email    │ │          │ │           │           │
│  │ OTP+JWT) │ │          │ │           │           │
│  └──────────┘ └──────────┘ └───────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐           │
│  │  Search  │ │  Reviews │ │  Reports  │           │
│  │  Module  │ │  Module  │ │  Module   │           │
│  └──────────┘ └──────────┘ └───────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐           │
│  │  Users   │ │  Media   │ │  Admin    │           │
│  │  Module  │ │(R2 Upload)│ │  Module   │           │
│  │          │ │          │ │           │           │
│  └──────────┘ └──────────┘ └───────────┘           │
│                                                      │
│  Auth: JWT middleware (email OTP)                    │
│  DB: pg (node-postgres) — raw SQL, no ORM            │
│  Cron: node-cron (availability confirmation)         │
│  SSL: Let's Encrypt + certbot                        │
│  Process: PM2 (auto-restart)                         │
└──────────────────────┬──────────────────────────────┘
                       │ SQL (via pg)
┌──────────────────────┴──────────────────────────────┐
│         PostgreSQL (on local device)                 │
│                                                      │
│  profiles │ listings │ inspections │ reviews │ reports│
│  saved_houses │ compare_sessions │ availability_logs │
│  auth_otp_codes │ auth_refresh_tokens                │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           Cloudflare R2 (Image Storage)              │
│      Property photos (free tier: 10GB, no egress)    │
└─────────────────────────────────────────────────────┘
```

---

## Docker Setup (Local Development)

### Project Structure

```
quick-broker/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── index.ts
│       ├── db.ts
│       ├── config.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── admin.ts
│       │   └── rateLimit.ts
│       ├── modules/
│       │   ├── auth/
│       │   ├── listings/
│       │   ├── inspections/
│       │   ├── reviews/
│       │   ├── saved/
│       │   ├── reports/
│       │   └── admin/
│       ├── utils/
│       └── routes.ts
│   └── migrations/
│       ├── 001_create_profiles.sql
│       ├── 002_create_listings.sql
│       ├── 003_create_inspections.sql
│       ├── 004_create_reviews.sql
│       ├── 005_create_saved_houses.sql
│       ├── 006_create_compare_sessions.sql
│       ├── 007_create_reports.sql
│       ├── 008_create_availability_confirmations.sql
│       ├── 009_create_auth_tables.sql
│       └── 010_create_indexes.sql
├── web/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── utils/
└── .env.example
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: quickbroker
      POSTGRES_USER: quickbroker
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    restart: unless-stopped

  backend:
    build: ./server
    environment:
      DATABASE_URL: postgresql://quickbroker:${DB_PASSWORD}@db:5432/quickbroker
      ZEPTOMAIL_TOKEN: ${ZEPTOMAIL_TOKEN}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
      R2_BUCKET: ${R2_BUCKET}
      R2_ENDPOINT: ${R2_ENDPOINT}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      PORT: 3000
    ports:
      - '3000:3000'
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - db
    restart: unless-stopped
    command: npm run dev

  frontend:
    build: ./web
    ports:
      - '5173:5173'
    volumes:
      - ./web:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend
    restart: unless-stopped
    command: npm run dev

volumes:
  pgdata:
```

### Server Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### Web Dockerfile (dev)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

### Web Dockerfile (production)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
```

### Production Deployment (on local device)

```bash
# 1. Build frontend
cd web && npm run build

# 2. Start backend with PM2
cd ../server
pm2 start dist/index.js --name quickbroker-api

# 3. Serve frontend with nginx
sudo cp -r web/dist/* /var/www/html/
sudo systemctl restart nginx

# 4. Setup SSL
sudo certbot --nginx -d quickbroker.duckdns.org
```

---

## Database Schema

### Entity Definitions

```sql
-- Profiles (students + admins; NO landlords in v1)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null default 'STUDENT' check (role in ('STUDENT', 'ADMIN')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auth: OTP codes
create table auth_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- Auth: Refresh tokens
create table auth_refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Listings (admin-managed, no landlord_id)
create table listings (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  title text not null,
  house_type text not null check (house_type in (
    'SINGLE_ROOM', 'DOUBLE_ROOM', 'SELF_CONTAINED_SINGLE',
    'SELF_CONTAINED_DOUBLE', 'OTHER'
  )),
  rent_amount integer not null,
  area text not null,
  distance_from_kiu numeric(5,2),
  transport_time_boda integer,
  transport_time_walk integer,
  electricity text check (electricity in (
    'INCLUDED', 'SHARED_BILL', 'PERSONAL_BILL'
  )),
  water text check (water in (
    'INCLUDED', 'SHARED_PAYMENT', 'STUDENT_PAYS', 'COMMUNITY_TAP'
  )),
  kitchen text check (kitchen in ('PRESENT', 'NOT_PRESENT')),
  bathroom text check (bathroom in ('PRIVATE', 'SHARED')),
  toilet text check (toilet in ('PRIVATE', 'SHARED')),
  flooring text check (flooring in ('TILED', 'CEMENTED')),
  other_charges text,
  landlord_phone text,
  status text default 'AVAILABLE' check (status in (
    'AVAILABLE', 'INSPECTION_PENDING', 'OCCUPIED', 'SUSPENDED'
  )),
  photos jsonb default '[]',
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inspections
create table inspections (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  preferred_time timestamptz,
  proposed_time timestamptz,
  status text default 'REQUESTED' check (status in (
    'REQUESTED', 'ACCEPTED', 'DECLINED', 'RESCHEDULED',
    'COMPLETED', 'CANCELLED', 'INTERESTED', 'NOT_INTERESTED', 'RENTED'
  )),
  one_time_code_hash text,
  code_expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  inspection_id uuid references inspections(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  accuracy_rating integer check (accuracy_rating between 1 and 5),
  water_rating integer check (water_rating between 1 and 5),
  electricity_rating integer check (electricity_rating between 1 and 5),
  location_rating integer check (location_rating between 1 and 5),
  comment text,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  unique(inspection_id)
);

-- Saved Houses
create table saved_houses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(student_id, listing_id)
);

-- Compare Sessions
create table compare_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  listing_ids jsonb not null,
  created_at timestamptz default now()
);

-- Reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete cascade,
  reason text check (reason in ('INACCURATE', 'SUSPICIOUS', 'FAKE', 'OTHER')),
  details text,
  status text default 'PENDING' check (status in (
    'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'
  )),
  created_at timestamptz default now()
);

-- Availability Confirmations
create table availability_confirmations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  confirmed_available boolean,
  sent_at timestamptz default now(),
  responded_at timestamptz
);

-- Indexes
create index idx_listings_status on listings(status);
create index idx_listings_area on listings(area);
create index idx_listings_rent on listings(rent_amount);
create index idx_listings_distance on listings(distance_from_kiu);
create index idx_inspections_student on inspections(student_id);
create index idx_inspections_listing on inspections(listing_id);
create index idx_reviews_listing on reviews(listing_id);
create index idx_saved_houses_student on saved_houses(student_id);
create index idx_reports_listing on reports(listing_id);
```

### Database Functions

```sql
-- Accept inspection and generate one-time code
create or replace function accept_inspection(p_inspection_id uuid)
returns text language plpgsql security definer as $$
declare
  new_code text;
begin
  new_code := lpad(floor(random() * 1000000)::text, 6, '0');
  update inspections
  set status = 'ACCEPTED',
      one_time_code_hash = crypt(new_code, gen_salt('bf')),
      code_expires_at = now() + interval '24 hours'
  where id = p_inspection_id;
  return new_code;
end;
$$;

-- Verify inspection code
create or replace function verify_inspection_code(p_inspection_id uuid, p_code text)
returns boolean language plpgsql security definer as $$
begin
  update inspections
  set status = 'COMPLETED', verified_at = now()
  where id = p_inspection_id
    and one_time_code_hash = crypt(p_code, one_time_code_hash)
    and code_expires_at > now();
  return found;
end;
$$;

-- Average ratings view
create view listing_ratings as
select
  listing_id,
  avg(rating) as avg_rating,
  avg(accuracy_rating) as avg_accuracy,
  avg(water_rating) as avg_water,
  avg(electricity_rating) as avg_electricity,
  avg(location_rating) as avg_location,
  count(*) as review_count
from reviews
where is_hidden = false
group by listing_id;
```

---

## API Endpoints

### Auth
```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Users
```
GET    /api/users/me
PATCH  /api/users/me
```

### Listings
```
GET    /api/listings              # Public preview
GET    /api/listings?full=true    # Authenticated full details
GET    /api/listings/:id          # Single listing
POST   /api/listings              # Admin: create
PATCH  /api/listings/:id          # Admin: update
DELETE /api/listings/:id          # Admin: delete
POST   /api/listings/:id/photos   # Admin: upload photo
PATCH  /api/listings/:id/photos   # Admin: reorder photos
DELETE /api/listings/:id/photos/:photoId
PATCH  /api/listings/:id/status   # Admin: change status
POST   /api/listings/:id/confirm-availability
```

### Inspections
```
POST   /api/inspections
GET    /api/inspections           # Admin: all
GET    /api/my-inspections        # Student: own
GET    /api/inspections/:id
PATCH  /api/inspections/:id/accept
PATCH  /api/inspections/:id/decline
PATCH  /api/inspections/:id/reschedule
GET    /api/inspections/:id/code
POST   /api/inspections/:id/verify
POST   /api/inspections/:id/interested
POST   /api/inspections/:id/not-interested
POST   /api/inspections/:id/rented
```

### Saved & Compare
```
POST   /api/saved
DELETE /api/saved/:listingId
GET    /api/saved
POST   /api/compare
GET    /api/compare/:sessionId
```

### Reviews
```
POST   /api/reviews
GET    /api/listings/:id/reviews
PATCH  /api/admin/reviews/:id/hide
```

### Reports
```
POST   /api/reports
GET    /api/admin/reports
PATCH  /api/admin/reports/:id
PATCH  /api/admin/listings/:id/suspend
```

### Contact
```
GET    /api/listings/:id/contact  # Authenticated only
```

---

## Phase 0: Project Foundation & Setup

**Duration:** 1–2 days
**Goal:** Repo structure, Docker setup, tooling

### Tasks

| # | Task | Details |
|---|------|---------|
| 0.1 | Initialize monorepo | `server/` (Express) + `web/` (React) |
| 0.2 | Set up Git branching | `main` ← `develop` ← feature branches |
| 0.3 | Configure ESLint + Prettier | For both server and web |
| 0.4 | Set up environment variables | `.env.example` for all secrets; `.env` gitignored |
| 0.5 | Set up Docker Compose | PostgreSQL + backend + frontend containers |
| 0.6 | Set up PM2 | Process manager for production |
| 0.7 | Set up DuckDNS | Free dynamic DNS subdomain |
| 0.8 | Set up port forwarding | Router config: port 80/443 → local device |
| 0.9 | Set up Let's Encrypt | Free SSL certificates via certbot |
| 0.10 | CI pipeline (GitHub Actions) | Lint + type-check + test on PR |

### Deliverables
- [ ] Monorepo with server + web
- [ ] Docker Compose running locally
- [ ] PM2 process manager configured
- [ ] DuckDNS subdomain pointing to local device
- [ ] SSL certificate installed (HTTPS)
- [ ] CI pipeline running on PRs

---

## Phase 1: Database Schema & Migrations

**Duration:** 1–2 days
**Goal:** All tables created, indexes, functions, seed data

### Tasks

| # | Task | Details |
|---|------|---------|
| 1.1 | Write SQL migrations | All tables from schema above |
| 1.2 | Apply migrations | Run via Docker or directly on PostgreSQL |
| 1.3 | Create indexes | Indexes on frequently queried columns |
| 1.4 | Create DB functions | accept_inspection, verify_inspection_code |
| 1.5 | Create views | listing_ratings view |
| 1.6 | Seed script | Sample listings, admin account |

### Deliverables
- [ ] All 10 tables created with proper constraints
- [ ] Indexes on search/filter columns
- [ ] DB functions working
- [ ] Seed data loaded (admin user, 20 sample listings)

---

## Phase 2: Authentication & User Management

**Duration:** 2–3 days
**Goal:** Email OTP auth (ZeptoMail + JWT), student profiles only

### Tasks

| # | Task | Details |
|---|------|---------|
| 2.1 | ZeptoMail setup | Create account, get API key, configure sandbox mode |
| 2.2 | Send OTP endpoint | `POST /api/auth/send-otp` — generates code, emails via ZeptoMail |
| 2.3 | Verify OTP endpoint | `POST /api/auth/verify-otp` — returns JWT access + refresh tokens |
| 2.4 | JWT middleware | Verify access token on protected routes |
| 2.5 | Profile creation | On first signup, insert into `profiles` table |
| 2.6 | Get profile endpoint | `GET /api/users/me` |
| 2.7 | Update profile endpoint | `PATCH /api/users/me` |
| 2.8 | Refresh token endpoint | `POST /api/auth/refresh` |
| 2.9 | Logout endpoint | `POST /api/auth/logout` — invalidate refresh token |
| 2.10 | Auth state management | React context, protected routes |

### Email OTP Flow

```
Student enters email
        ↓
POST /api/auth/send-otp { email }
        ↓
Server generates 6-digit code → stores hashed in DB (expires 10 min)
        ↓
ZeptoMail sends email with code
        ↓
Student enters code
        ↓
POST /api/auth/verify-otp { email, code }
        ↓
Server verifies → returns { accessToken, refreshToken }
        ↓
Student logged in → JWT stored in httpOnly cookie
```

### Key Dependencies

```json
{
  "express": "^4.18.0",
  "pg": "^8.11.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^7.0.0",
  "node-cron": "^3.0.0",
  "zod": "^3.22.0",
  "multer": "^1.4.5",
  "@aws-sdk/client-s3": "^3.600.0"
}
```

### Deliverables
- [ ] Email OTP sign in/sign up working (ZeptoMail)
- [ ] JWT auth with refresh tokens
- [ ] Profile created on first signup
- [ ] Protected routes (redirect to login if not authenticated)
- [ ] Resend OTP functionality
- [ ] Rate limiting on auth endpoints

---

## Phase 3: Listing Management (Admin)

**Duration:** 3–4 days
**Goal:** Full CRUD for listings (admin-managed), R2 photo upload, availability

### Tasks

| # | Task | Details |
|---|------|---------|
| 3.1 | Create listing endpoint | `POST /api/listings` (admin only) |
| 3.2 | Get listing by ID | `GET /api/listings/:id` |
| 3.3 | Update listing | `PATCH /api/listings/:id` (admin only) |
| 3.4 | Delete listing | `DELETE /api/listings/:id` (admin only) |
| 3.5 | List all listings | `GET /api/listings?admin=true` (admin only) |
| 3.6 | Photo upload | `POST /api/listings/:id/photos` → Cloudflare R2 |
| 3.7 | Photo management | Reorder (update JSONB array), delete from R2 |
| 3.8 | Mark as occupied | `PATCH /api/listings/:id/status` → OCCUPIED |
| 3.9 | Mark as available | Same → AVAILABLE |
| 3.10 | Availability confirmation | node-cron: periodic email prompt |
| 3.11 | Location geocoding | Convert area name → lat/lng for distance calc |
| 3.12 | Distance/time calculation | Compute km + boda time from KIU coordinates |

### Listing Data Model

```typescript
// Create listing payload (admin only)
{
  title: string;
  houseType: 'SINGLE_ROOM' | 'DOUBLE_ROOM' | 'SELF_CONTAINED_SINGLE' | 'SELF_CONTAINED_DOUBLE' | 'OTHER';
  rentAmount: number;
  area: string;
  electricity: 'INCLUDED' | 'SHARED_BILL' | 'PERSONAL_BILL';
  water: 'INCLUDED' | 'SHARED_PAYMENT' | 'STUDENT_PAYS' | 'COMMUNITY_TAP';
  kitchen: 'PRESENT' | 'NOT_PRESENT';
  bathroom: 'PRIVATE' | 'SHARED';
  toilet: 'PRIVATE' | 'SHARED';
  flooring: 'TILED' | 'CEMENTED';
  otherCharges?: string;
  landlordPhone: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}
```

### Deliverables
- [ ] Admin can create complete listings
- [ ] Photo upload working (multiple photos, Cloudflare R2)
- [ ] Availability status management
- [ ] Distance from KIU auto-calculated
- [ ] Periodic availability confirmation (node-cron)

---

## Phase 4: Search & Discovery (Student)

**Duration:** 3–4 days
**Goal:** Browse, search, filter, sort listings; listing detail view

### Tasks

| # | Task | Details |
|---|------|---------|
| 4.1 | Public listing preview | `GET /api/listings` — limited fields (no contact info) |
| 4.2 | Authenticated full listing | `GET /api/listings` — full details for logged-in students |
| 4.3 | Search by area | Query param `?area=Kakoba` |
| 4.4 | Filter by budget range | `?minRent=150000&maxRent=300000` |
| 4.5 | Filter by house type | `?houseType=SINGLE_ROOM` |
| 4.6 | Filter by distance from KIU | `?maxDistance=2` (km) |
| 4.7 | Filter by facilities | `?kitchen=PRESENT&bathroom=PRIVATE` |
| 4.8 | Filter by electricity | `?electricity=INCLUDED` |
| 4.9 | Filter by water | `?water=INCLUDED` |
| 4.10 | Sort options | `?sort=rent_asc` / `rent_desc` / `distance_asc` / `newest` |
| 4.11 | Listing detail page | `GET /api/listings/:id` — full info + landlord phone (authenticated) |
| 4.12 | Pagination | Offset-based, 20 per page |

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `area` | string | Neighbourhood name |
| `minRent` | number | Min rent (UGX) |
| `maxRent` | number | Max rent (UGX) |
| `houseType` | enum | Filter by type |
| `maxDistance` | number | Max km from KIU |
| `kitchen` | enum | PRESENT / NOT_PRESENT |
| `bathroom` | enum | PRIVATE / SHARED |
| `toilet` | enum | PRIVATE / SHARED |
| `electricity` | enum | INCLUDED / SHARED_BILL / PERSONAL_BILL |
| `water` | enum | INCLUDED / SHARED_PAYMENT / STUDENT_PAYS / COMMUNITY_TAP |
| `sort` | string | rent_asc, rent_desc, distance_asc, newest |
| `page` | number | Page number (default 1) |
| `limit` | number | Page size (default 20) |

### Deliverables
- [ ] Students can browse listings (preview without account)
- [ ] Full search with all filters
- [ ] Sorting by rent, distance, newest
- [ ] Listing detail page with all information
- [ ] Pagination working

---

## Phase 5: Save & Compare

**Duration:** 1–2 days
**Goal:** Save houses, view saved list, side-by-side comparison

### Tasks

| # | Task | Details |
|---|------|---------|
| 5.1 | Save a house | `POST /api/saved` — body: `{ listingId }` |
| 5.2 | Unsave a house | `DELETE /api/saved/:listingId` |
| 5.3 | List saved houses | `GET /api/saved` — with full listing data |
| 5.4 | Check if saved | Include `isSaved` in listing responses |
| 5.5 | Compare UI | Client-side comparison using already-fetched listing data (max 3) |

### Deliverables
- [ ] Students can save/unsave houses
- [ ] "My Saved Houses" page
- [ ] Side-by-side comparison (up to 3 houses)
- [ ] Comparison shows all key attributes from PRD Section 10

---

## Phase 6: Inspection System

**Duration:** 3–4 days
**Goal:** Request, accept/decline, reschedule, one-time code verification

### Tasks

| # | Task | Details |
|---|------|---------|
| 6.1 | Request inspection | `POST /api/inspections` — `{ listingId, preferredTime }` |
| 6.2 | Admin receives request | `GET /api/inspections` (admin only) |
| 6.3 | Accept inspection | `PATCH /api/inspections/:id/accept` — generates one-time code |
| 6.4 | Decline inspection | `PATCH /api/inspections/:id/decline` |
| 6.5 | Propose new time | `PATCH /api/inspections/:id/reschedule` — `{ proposedTime }` |
| 6.6 | One-time code | PostgreSQL function generates + hashes code, sets expiry |
| 6.7 | Student views code | `GET /api/inspections/:id/code` — only for student |
| 6.8 | Admin confirms code | `POST /api/inspections/:id/verify` — `{ code }` |
| 6.9 | Inspection verified | Function sets `verified_at`, status → COMPLETED |
| 6.10 | Inspection history | Student: `GET /api/my-inspections` |

### One-Time Code Flow

```
Student requests inspection
        ↓
Admin accepts → PostgreSQL function generates 6-digit code
        ↓
Code stored as hash, expires in 24 hours
        ↓
Student visits property, shows code to landlord
        ↓
Landlord tells admin → Admin enters code in app
        ↓
System verifies → inspection.verifiedAt = now
        ↓
Student becomes eligible to review this listing
```

### Deliverables
- [ ] Students can request inspections with preferred time
- [ ] Admin can accept, decline, or propose new time
- [ ] One-time code generation and verification
- [ ] Inspection history for students

---

## Phase 7: Contact & Communication

**Duration:** 1–2 days
**Goal:** Call landlord, WhatsApp landlord, post-inspection status

### Tasks

| # | Task | Details |
|---|------|---------|
| 7.1 | Reveal phone number | `GET /api/listings/:id/contact` — returns landlord phone (authenticated only) |
| 7.2 | Call deep link | `tel:+256XXXXXXXXX` — client-side only |
| 7.3 | WhatsApp deep link | `https://wa.me/256XXXXXXXXX?text=...` — client-side only |
| 7.4 | Post-inspection: Interested | `POST /api/inspections/:id/interested` |
| 7.5 | Post-inspection: Not interested | `POST /api/inspections/:id/not-interested` |
| 7.6 | Post-inspection: Rented | `POST /api/inspections/:id/rented` |

### Deliverables
- [ ] Phone number reveal (authenticated only)
- [ ] Call and WhatsApp deep links working
- [ ] Post-inspection status tracking

---

## Phase 8: Trust & Safety

**Duration:** 1–2 days
**Goal:** Reporting, admin review queue, listing moderation

### Tasks

| # | Task | Details |
|---|------|---------|
| 8.1 | Report a listing | `POST /api/reports` — `{ listingId, reason, details }` |
| 8.2 | Admin report queue | `GET /api/admin/reports` |
| 8.3 | Admin resolve report | `PATCH /api/admin/reports/:id` |
| 8.4 | Admin suspend listing | `PATCH /api/admin/listings/:id/suspend` |

### Deliverables
- [ ] Students can report listings
- [ ] Admin report review queue
- [ ] Listing suspension capability

---

## Phase 9: Reviews

**Duration:** 2–3 days
**Goal:** Verified-inspection-only reviews, rating display

### Tasks

| # | Task | Details |
|---|------|---------|
| 9.1 | Submit review | `POST /api/reviews` — `{ listingId, inspectionId, ratings, comment }` |
| 9.2 | Eligibility check | Must have verified inspection for that listing |
| 9.3 | One review per inspection | DB constraint: `unique(inspection_id)` |
| 9.4 | Get reviews for listing | `GET /api/listings/:id/reviews` |
| 9.5 | Average rating | Computed via listing_ratings view |
| 9.6 | Review moderation | Admin can hide inappropriate reviews |

### Deliverables
- [ ] Verified-inspection-only review submission
- [ ] Category ratings (accuracy, water, electricity, location)
- [ ] Review display on listing pages
- [ ] Average ratings computed
- [ ] Admin moderation for reviews

---

## Phase 10: Frontend — Core UI

**Duration:** 5–7 days
**Goal:** All student-facing screens, responsive mobile-first design

### Screens

| # | Screen | Route |
|---|--------|-------|
| 10.1 | Landing / Preview | `/` |
| 10.2 | Email OTP Login | `/auth/login` |
| 10.3 | OTP Verification | `/auth/verify` |
| 10.4 | Student Home / Search | `/home` |
| 10.5 | Listing Detail | `/listing/:id` |
| 10.6 | Saved Houses | `/saved` |
| 10.7 | Compare Houses | `/compare` |
| 10.8 | Inspection Request | `/listing/:id/inspect` |
| 10.9 | My Inspections | `/inspections` |
| 10.10 | Inspection Code Display | `/inspections/:id/code` |
| 10.11 | Post-Inspection Status | `/inspections/:id/status` |
| 10.12 | Leave Review | `/inspections/:id/review` |
| 10.13 | Admin Dashboard | `/admin` |
| 10.14 | Admin Create Listing | `/admin/listings/new` |
| 10.15 | Admin Edit Listing | `/admin/listings/:id/edit` |
| 10.16 | Admin Inspections | `/admin/inspections` |
| 10.17 | Admin Reports | `/admin/reports` |

### UI/UX Principles
- **Mobile-first** — design for 320px width first
- **Thumb-friendly** — primary actions in bottom 2/3 of screen
- **Fast** — skeleton loaders, optimistic UI
- **Clear** — standardized listing cards (PRD Section 5 format)
- **Trust signals** — verified badge, inspection status, review count visible at all times

### Deliverables
- [ ] All student screens implemented
- [ ] All admin screens implemented
- [ ] Mobile-first responsive design
- [ ] Loading states, error states, empty states
- [ ] PWA manifest + service worker (installable)

---

## Phase 11: Frontend — Polish & PWA

**Duration:** 2–3 days
**Goal:** PWA features, animations, accessibility, performance

### Tasks

| # | Task | Details |
|---|------|---------|
| 11.1 | PWA manifest | App icon, name, theme color, splash screen |
| 11.2 | Service worker | Offline shell, cache listings |
| 11.3 | Install prompt | "Add to Home Screen" prompt |
| 11.4 | Animations | Page transitions, micro-interactions |
| 11.5 | Accessibility | ARIA labels, contrast, screen reader support |
| 11.6 | Performance | Image lazy loading, code splitting, bundle optimization |
| 11.7 | Error boundaries | Graceful error recovery |
| 11.8 | Toast notifications | Success/error feedback |

### Deliverables
- [ ] PWA installable on Android/iOS
- [ ] Offline shell works
- [ ] Smooth animations
- [ ] Accessibility audit passed
- [ ] Lighthouse score > 80

---

## Phase 12: Testing & QA

**Duration:** 3–5 days
**Goal:** Comprehensive testing, bug fixing, edge cases

### Testing Layers

| Layer | Tool | Coverage |
|-------|------|----------|
| **Unit tests** | Vitest (frontend), Jest (backend) | Utils, validators, calculations |
| **Integration tests** | Supertest (backend) | API endpoints, auth flows |
| **E2E tests** | Playwright | Critical user journeys |
| **Manual QA** | Checklist | All screens, all flows |

### Critical User Journeys to Test

1. **Student:** Register → Search → View listing → Save → Compare → Request inspection → Receive code → Get verified → Leave review
2. **Admin:** Create listing → Receive inspection request → Accept → Confirm code → Mark occupied → Review reports

### Deliverables
- [ ] Unit test coverage > 60%
- [ ] All API endpoints integration tested
- [ ] E2E tests for critical journeys
- [ ] Manual QA checklist completed
- [ ] All critical bugs fixed

---

## Phase 13: Deployment & Launch

**Duration:** 3–5 days
**Goal:** Local server deployment, monitoring, launch readiness

### Tasks

| # | Task | Details |
|---|------|---------|
| 13.1 | Production local server | Dedicated device (Raspberry Pi 4 / old laptop) running 24/7 |
| 13.2 | PostgreSQL production | Separate database from dev; automated backups |
| 13.3 | Deploy backend | PM2 process manager; auto-restart on crash |
| 13.4 | Deploy frontend | Serve static files via nginx |
| 13.5 | SSL/HTTPS | Let's Encrypt + certbot with auto-renewal |
| 13.6 | DuckDNS | Dynamic DNS for changing home IP |
| 13.7 | Database backups | Daily automated backups to external drive or cloud |
| 13.8 | Monitoring | UptimeRobot (free) + PM2 monitoring |
| 13.9 | Security audit | OWASP Top 10 check; firewall config |
| 13.10 | Terms of Service + Privacy Policy | Legal pages |
| 13.11 | Power backup | UPS or power bank for outages (critical in Uganda) |

### Deliverables
- [ ] Local server running 24/7 with PM2
- [ ] PostgreSQL with automated daily backups
- [ ] HTTPS enabled (Let's Encrypt)
- [ ] DuckDNS subdomain working
- [ ] Monitoring and alerting active
- [ ] Security audit completed
- [ ] Power backup solution in place
- [ ] Legal pages published

---

## Phase 14: Post-Launch & Iteration

**Duration:** Ongoing
**Goal:** Monitor, gather feedback, iterate

### Tasks

| # | Task | Details |
|---|------|---------|
| 14.1 | User feedback | In-app feedback form, WhatsApp feedback line |
| 14.2 | Analytics review | Track key metrics (DAU, listings created, inspections requested) |
| 14.3 | Bug triage | Prioritize and fix reported bugs |
| 14.4 | Performance monitoring | Server response times, error rates |
| 14.5 | Feature prioritization | Based on user feedback and data |

### Key Metrics to Track

| Metric | Target (Month 1) |
|--------|-----------------|
| Registered students | 100 |
| Active listings | 50 |
| Inspections requested | 30 |
| Inspections verified | 15 |
| Reviews submitted | 10 |

---

## Feature Priority Matrix

| Feature | Priority | Phase | PRD Section |
|---------|----------|-------|-------------|
| Email OTP Auth | P0 | 2 | 4 |
| Create/Edit Listings (admin) | P0 | 3 | 6, 12 |
| Photo Upload (R2) | P0 | 3 | 6 |
| Search & Filters | P0 | 4 | 5, 7, 8 |
| Listing Detail View | P0 | 4 | 5, 6 |
| Save Houses | P1 | 5 | 9 |
| Compare Houses | P1 | 5 | 10 |
| Inspection Request/Accept | P0 | 6 | 15 |
| One-Time Code Verification | P0 | 6 | 16 |
| Call/WhatsApp Landlord | P1 | 7 | 17 |
| Post-Inspection Status | P1 | 7 | 18 |
| Reviews | P1 | 9 | 19 |
| Report Listing | P1 | 8 | 12 |
| Availability Confirmation | P1 | 3 | 14 |
| Mark as Occupied | P0 | 3 | 13 |
| Admin Dashboard | P1 | 8 | — |
| PWA / Installable | P2 | 11 | — |
| Featured Listings (paid) | P3 | Post-launch | 20 |
| Promotional Listings (paid) | P3 | Post-launch | 20 |

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Foundation + Docker | 1–2 days | Day 2 |
| Phase 1: Database Schema | 1–2 days | Day 4 |
| Phase 2: Auth (Email OTP) | 2–3 days | Day 7 |
| Phase 3: Listings (Admin) | 3–4 days | Day 11 |
| Phase 4: Search & Discovery | 3–4 days | Day 15 |
| Phase 5: Save & Compare | 1–2 days | Day 17 |
| Phase 6: Inspections | 3–4 days | Day 21 |
| Phase 7: Contact & Communication | 1–2 days | Day 23 |
| Phase 8: Trust & Safety | 1–2 days | Day 25 |
| Phase 9: Reviews | 2–3 days | Day 28 |
| Phase 10: Frontend Core UI | 5–7 days | Day 35 |
| Phase 11: Polish & PWA | 2–3 days | Day 38 |
| Phase 12: Testing & QA | 3–5 days | Day 43 |
| Phase 13: Deployment & Launch | 3–5 days | Day 48 |
| **Total** | **~7–8 weeks** | |

> **Note:** This assumes a single developer. The timeline is 7–8 weeks because we are building a custom Express backend with raw SQL queries.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Local server downtime | Medium | High | UPS for power backup; PM2 auto-restart; UptimeRobot alerts |
| Home IP changes | Low | Medium | DuckDNS auto-update client |
| Low landlord adoption | High | High | Manual outreach to Ishaka landlords before launch; seed with 20+ listings |
| Students don't register | Medium | High | Start with unregistered preview; require auth only for contact/inspection |
| Photo upload failures | Medium | Medium | Compress images client-side; R2 with Cloudflare CDN for fast delivery |
| Distance calculation inaccurate | Low | Medium | Use OpenStreetMap + OSRM; allow admin to confirm distance |
| Scope creep | High | Medium | Strictly follow PRD v1.0; defer non-P0 features to post-launch |
| Email deliverability | Medium | Medium | ZeptoMail sandbox for dev; verify domain for production |
| Security (local server exposed) | Medium | High | Firewall; Helmet headers; rate limiting; input validation |

---

## Open Questions for Stakeholders

1. **Branding:** Do you have a logo, color scheme, or brand guidelines?
2. **Language:** English only, or should we support Runyankole/Rukiga?
3. **Team:** Is this a solo project, or will there be additional developers/designers?
4. **Launch Date:** Is there a target launch date (e.g., start of semester)?
5. **Hardware:** Do you have a dedicated device for hosting (Raspberry Pi, old laptop)?

---

*This plan is a living document. Update it as decisions are made and the project evolves.*
