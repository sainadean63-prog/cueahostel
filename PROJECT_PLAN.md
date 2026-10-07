# CUEA Gaba Campus — Hostel Management System
## Project Plan & Technical Specification

**Institution:** Catholic University of Eastern Africa (CUEA), Gaba Campus  
**Submitted by:** Dean Saina  
**Date:** June 2026  
**Theme Reference:** [https://cuea.edu](https://cuea.edu)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Goals & Scope](#2-system-goals--scope)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Feature Breakdown](#4-feature-breakdown)
5. [Technical Architecture](#5-technical-architecture)
6. [Database Design](#6-database-design)
7. [API Design](#7-api-design)
8. [M-PESA Integration](#8-m-pesa-integration)
9. [UI/UX & Branding](#9-uiux--branding)
10. [Folder Structure](#10-folder-structure)
11. [Development Phases & Timeline](#11-development-phases--timeline)
12. [Security Considerations](#12-security-considerations)
13. [Deployment Plan](#13-deployment-plan)

---

## 1. Project Overview

The **CUEA Gaba Hostel Management System** is a full-stack web application that digitalises hostel booking and management for students at CUEA Gaba Campus. Students can view available rooms, make bookings, and pay via **M-PESA STK Push** — all without visiting the accommodation office. Administrators manage hostels, bed inventory, pricing, and have a real-time dashboard of occupancy and payments.

---

## 2. System Goals & Scope

| Goal | Details |
|------|---------|
| Online booking | Students book beds from any device |
| M-PESA payments | Safaricom Daraja STK Push integration |
| Real-time availability | Live bed count per hostel/room |
| Admin control | Manage hostels, rooms, pricing, view reports |
| Role-based access | Public, Student, Admin — each with its own portal |
| CUEA-branded UI | Matches [cuea.edu](https://cuea.edu) colour scheme and typography |

**Out of scope (v1):**  
- Mobile native apps  
- Multi-campus support  
- Meal plan management  

---

## 3. User Roles & Permissions

### 3.1 Public (Unauthenticated)
- View the landing page with hostel listings and availability
- See hostel photos, amenities, and pricing
- Register or login

### 3.2 Student (Authenticated)
- Complete profile (name, student ID, course, year)
- Search and filter available beds
- Book a bed (single or per semester)
- Pay via M-PESA STK Push
- View booking history and payment status
- Download booking confirmation (PDF)
- Cancel booking (within cancellation window)

### 3.3 Admin (Authenticated)
- Dashboard: occupancy rates, revenue summary, pending payments
- Add / edit / deactivate hostels
- Add rooms and beds per hostel, set bed types (single, double)
- Set and update pricing (per night, per semester)
- View all bookings with filters (by hostel, date, payment status)
- Confirm or reject bookings manually
- Export reports (CSV/PDF)
- Manage user accounts (approve student accounts, deactivate users)

---

## 4. Feature Breakdown

### 4.1 Public Landing Page
- Hero section with CUEA Gaba hostel imagery
- "Check Availability" search bar (dates + hostel filter)
- Hostel cards: photo, name, amenities, price, bed availability badge
- Footer with CUEA contacts and campus map link

### 4.2 Authentication Flow
```
Public Page → Login/Register
  Student register → Email verification → Profile completion → Student dashboard
  Admin login → Admin dashboard
```

### 4.3 Hostel Listing & Booking Flow
```
Browse hostels → Select hostel → View rooms → Select bed →
Fill booking details → Review & confirm →
M-PESA STK Push → Payment callback → Booking confirmed → Confirmation email/PDF
```

### 4.4 Admin Management Flow
```
Admin login → Dashboard →
  Hostels tab: add/edit hostel → add rooms → add beds → set price
  Bookings tab: view all bookings → approve/reject → mark payment received
  Reports tab: export CSV
```

### 4.5 M-PESA Payment Flow
```
Student clicks "Pay Now" →
Backend initiates STK Push (Daraja API) →
Student receives prompt on phone →
Student enters M-PESA PIN →
Daraja sends callback to backend →
Backend updates booking status → Student sees confirmation
```

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 + TypeScript | Component model, type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accessibility, theming |
| State / Data fetching | TanStack Query (React Query) | Server-state caching, mutations |
| Routing | React Router v6 | Client-side routing |
| Forms | React Hook Form + Zod | Validation, type-safe schemas |
| Backend | NestJS + TypeScript | Structured, decorator-based REST API |
| ORM | Prisma | Type-safe DB queries, migrations |
| Database | PostgreSQL | Relational data, ACID transactions |
| Auth | JWT + Passport.js | Stateless, role-based guards |
| Payments | Safaricom Daraja API | M-PESA STK Push |
| File uploads | Cloudinary | Hostel images |
| Email | Nodemailer (Gmail SMTP / SendGrid) | Booking confirmations |
| PDF generation | `@react-pdf/renderer` | Booking receipts |
| Testing | Jest + Supertest (BE) / Vitest (FE) | Unit & integration tests |

### 5.2 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser (React SPA)             │
│  Public Pages │ Student Portal │ Admin Portal    │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────┐
│              NestJS API Server                   │
│  Auth Module │ Hostel Module │ Booking Module    │
│  Payment Module │ User Module │ Report Module    │
└──────┬─────────────────────────┬────────────────┘
       │                         │
┌──────▼──────┐         ┌────────▼────────┐
│ PostgreSQL  │         │  Daraja API     │
│ (Prisma)    │         │  (Safaricom)    │
└─────────────┘         └─────────────────┘
```

### 5.3 Auth Strategy

- **JWT Access Token** (15 min expiry) + **Refresh Token** (7 days, httpOnly cookie)
- Roles encoded in JWT payload: `STUDENT` | `ADMIN`
- NestJS Guards (`@Roles()` decorator) protect all routes
- Password hashing: `bcrypt` (12 rounds)

---

## 6. Database Design

### Entity Relationship Summary

```
User (1) ────< Booking (many)
Hostel (1) ──< Room (many)
Room (1) ────< Bed (many)
Bed (1) ─────< Booking (many — over time, one at a time)
Booking (1) ─< Payment (many — can retry failed payment)
```

### 6.1 Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  REJECTED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

enum BedType {
  SINGLE
  DOUBLE
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String
  role         Role      @default(STUDENT)
  firstName    String
  lastName     String
  studentId    String?   @unique
  phone        String
  course       String?
  yearOfStudy  Int?
  isVerified   Boolean   @default(false)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  bookings     Booking[]
}

model Hostel {
  id          String   @id @default(uuid())
  name        String
  description String?
  address     String
  gender      String   // "MALE" | "FEMALE" | "MIXED"
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  rooms       Room[]
}

model Room {
  id        String   @id @default(uuid())
  hostelId  String
  hostel    Hostel   @relation(fields: [hostelId], references: [id])
  roomNumber String
  floor     Int      @default(1)
  isActive  Boolean  @default(true)
  beds      Bed[]
}

model Bed {
  id         String    @id @default(uuid())
  roomId     String
  room       Room      @relation(fields: [roomId], references: [id])
  bedNumber  String
  type       BedType   @default(SINGLE)
  pricePerSemester Decimal @db.Decimal(10, 2)
  isAvailable Boolean  @default(true)
  bookings   Booking[]
}

model Booking {
  id          String        @id @default(uuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  bedId       String
  bed         Bed           @relation(fields: [bedId], references: [id])
  checkIn     DateTime
  checkOut    DateTime
  semester    String        // e.g. "Semester 1 2026"
  status      BookingStatus @default(PENDING)
  totalAmount Decimal       @db.Decimal(10, 2)
  createdAt   DateTime      @default(now())
  payments    Payment[]
}

model Payment {
  id              String        @id @default(uuid())
  bookingId       String
  booking         Booking       @relation(fields: [bookingId], references: [id])
  amount          Decimal       @db.Decimal(10, 2)
  mpesaCheckoutId String?       @unique
  mpesaReceiptNo  String?
  phoneNumber     String
  status          PaymentStatus @default(PENDING)
  paidAt          DateTime?
  createdAt       DateTime      @default(now())
}
```

---

## 7. API Design

Base URL: `/api/v1`

### 7.1 Auth Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register student |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Auth | Invalidate refresh token |
| GET | `/auth/verify-email?token=` | Public | Email verification |

### 7.2 Hostel Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/hostels` | Public | List all active hostels |
| GET | `/hostels/:id` | Public | Hostel detail + rooms |
| GET | `/hostels/:id/availability` | Public | Available beds |
| POST | `/hostels` | Admin | Create hostel |
| PATCH | `/hostels/:id` | Admin | Update hostel |
| DELETE | `/hostels/:id` | Admin | Deactivate hostel |
| POST | `/hostels/:id/rooms` | Admin | Add room to hostel |
| POST | `/rooms/:id/beds` | Admin | Add bed to room |
| PATCH | `/beds/:id` | Admin | Update bed / price |

### 7.3 Booking Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/bookings` | Student | Create booking |
| GET | `/bookings/my` | Student | Student's bookings |
| GET | `/bookings/:id` | Student/Admin | Booking detail |
| DELETE | `/bookings/:id` | Student | Cancel booking |
| GET | `/bookings` | Admin | All bookings (filterable) |
| PATCH | `/bookings/:id/status` | Admin | Confirm/reject booking |

### 7.4 Payment Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payments/mpesa/stkpush` | Student | Initiate M-PESA payment |
| POST | `/payments/mpesa/callback` | Public (Daraja) | M-PESA callback webhook |
| GET | `/payments/booking/:bookingId` | Student/Admin | Payment history |

### 7.5 User & Report Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users/me` | Auth | Current user profile |
| PATCH | `/users/me` | Auth | Update profile |
| GET | `/users` | Admin | All users |
| GET | `/admin/dashboard` | Admin | Stats: occupancy, revenue |
| GET | `/admin/reports` | Admin | Export CSV |

---

## 8. M-PESA Integration

### 8.1 Daraja API (Safaricom)

Uses the **M-PESA Express (STK Push)** API — Lipa Na M-PESA Online.

**Credentials needed:**
- Business Short Code (Paybill or Till)
- Passkey (from Daraja developer portal)
- Consumer Key & Secret (OAuth 2.0)
- Callback URL (must be publicly accessible HTTPS)

### 8.2 STK Push Flow

```typescript
// NestJS MpesaService

async stkPush(phone: string, amount: number, bookingId: string) {
  const token = await this.getAccessToken();
  const timestamp = format(new Date(), 'yyyyMMddHHmmss');
  const password = Buffer.from(
    `${shortCode}${passkey}${timestamp}`
  ).toString('base64');

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,          // student phone e.g. 2547XXXXXXXX
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.BASE_URL}/api/v1/payments/mpesa/callback`,
      AccountReference: bookingId,
      TransactionDesc: 'CUEA Gaba Hostel Booking',
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data; // contains CheckoutRequestID
}
```

### 8.3 Callback Handler

```typescript
@Post('mpesa/callback')
async handleCallback(@Body() body: MpesaCallbackDto) {
  const result = body.Body.stkCallback;
  const payment = await this.paymentService.findByCheckoutId(
    result.CheckoutRequestID
  );

  if (result.ResultCode === 0) {
    // Success — extract M-PESA receipt number
    const receiptItem = result.CallbackMetadata.Item.find(
      i => i.Name === 'MpesaReceiptNumber'
    );
    await this.paymentService.markSuccess(payment.id, receiptItem.Value);
    await this.bookingService.confirm(payment.bookingId);
    // Send confirmation email
  } else {
    await this.paymentService.markFailed(payment.id);
  }
}
```

### 8.4 Testing (Sandbox)
- Use Safaricom Daraja sandbox: `https://sandbox.safaricom.co.ke`
- Test phone: `254708374149` (sandbox number)
- Switch to production URLs before deployment

---

## 9. UI/UX & Branding

### 9.1 CUEA Brand Tokens

```css
/* Extracted from cuea.edu stylesheet */
:root {
  --cuea-primary: #A0002A;   /* Deep crimson */
  --cuea-gold:    #F6961C;   /* Gold / amber */
  --cuea-white:   #FFFFFF;
  --cuea-dark:    #1a1a2e;   /* Dark navy for text */
}
```

**Tailwind config extension:**
```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'cuea-primary': '#A0002A',
      'cuea-gold':    '#F6961C',
    },
  },
}
```

### 9.2 Typography
- Headings: `Inter` or `Lato` (sans-serif, similar to CUEA site)
- Body: `Inter` 400/500
- Accent text: `--cuea-gold`

### 9.3 Page Layout Map

```
/                          Public landing page
/login                     Login (student + admin)
/register                  Student registration
/hostels                   Hostel listings (public)
/hostels/:id               Hostel detail + room grid

/student/dashboard         Booking overview, payment status
/student/bookings          All bookings list
/student/bookings/:id      Booking detail + pay button
/student/profile           Edit profile

/admin/dashboard           Stats, occupancy chart, revenue
/admin/hostels             Hostel list + CRUD
/admin/hostels/:id         Rooms & beds management
/admin/bookings            All bookings, filter/search
/admin/users               User management
/admin/reports             Export reports
```

### 9.4 Key UI Components

| Component | Description |
|-----------|-------------|
| `<HeroSection>` | Full-width hero with CUEA crimson overlay + search bar |
| `<HostelCard>` | Image, name, gender tag, price badge, availability indicator |
| `<BedGrid>` | Visual grid of beds: green (available) / red (booked) |
| `<BookingWizard>` | Multi-step: Select → Details → Confirm → Pay |
| `<MpesaPayButton>` | Triggers STK push, shows countdown spinner |
| `<AdminStats>` | KPI cards: Total bookings, occupancy %, revenue |
| `<OccupancyChart>` | Recharts bar chart per hostel |
| `<StatusBadge>` | Colour-coded: PENDING/CONFIRMED/CANCELLED |

---

## 10. Folder Structure

```
gaba-hostel-management-system/
│
├── frontend/                          # React app
│   ├── public/
│   ├── src/
│   │   ├── assets/                    # Logos, images
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui primitives
│   │   │   ├── layout/                # Navbar, Footer, Sidebar
│   │   │   ├── hostel/                # HostelCard, BedGrid, RoomCard
│   │   │   ├── booking/               # BookingWizard, BookingCard
│   │   │   └── admin/                 # AdminStats, OccupancyChart
│   │   ├── pages/
│   │   │   ├── public/                # Landing, Hostels, Login, Register
│   │   │   ├── student/               # Dashboard, Bookings, Profile
│   │   │   └── admin/                 # Dashboard, Hostels, Bookings, Users
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── services/                  # Axios API calls
│   │   ├── store/                     # Auth context / Zustand
│   │   ├── types/                     # TypeScript interfaces
│   │   ├── lib/                       # Zod schemas, utilities
│   │   └── router/                    # Route guards, route config
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                           # NestJS app
│   ├── src/
│   │   ├── auth/                      # JWT, Passport, Guards
│   │   ├── users/                     # User CRUD, profile
│   │   ├── hostels/                   # Hostel, Room, Bed modules
│   │   ├── bookings/                  # Booking logic, availability
│   │   ├── payments/                  # Daraja STK Push, callback
│   │   ├── reports/                   # CSV export, dashboard stats
│   │   ├── mail/                      # Email templates (Nodemailer)
│   │   ├── common/                    # Decorators, pipes, interceptors
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts                    # Seed admin user + sample hostels
│   ├── .env.example
│   └── package.json
│
└── PROJECT_PLAN.md                    # This document
```

---

## 11. Development Phases & Timeline

Assuming a **6-week** delivery window:

### Phase 1 — Foundation (Week 1)

**Backend:**
- [ ] NestJS project scaffold + Prisma setup
- [ ] PostgreSQL local + Docker Compose
- [ ] Auth module: register, login, JWT, email verification
- [ ] User module: profile CRUD

**Frontend:**
- [ ] React + Vite scaffold + Tailwind + shadcn/ui
- [ ] CUEA theme tokens configured
- [ ] Routing structure (public / student / admin guards)
- [ ] Login & Registration pages

**Deliverable:** Auth working end-to-end (register → verify → login → role redirect)

---

### Phase 2 — Hostel Management (Week 2)

**Backend:**
- [ ] Hostel, Room, Bed modules
- [ ] CRUD endpoints with admin guards
- [ ] Availability query (beds not booked for given semester)
- [ ] Cloudinary image upload for hostels

**Frontend:**
- [ ] Public landing page (hero, hostel listing)
- [ ] Hostel detail page + BedGrid component
- [ ] Admin: Hostel CRUD + room/bed management UI

**Deliverable:** Admin can add hostels/rooms/beds; public can browse

---

### Phase 3 — Booking System (Week 3)

**Backend:**
- [ ] Booking module: create, cancel, status update
- [ ] Conflict check (prevent double-booking a bed)
- [ ] Admin booking management endpoints

**Frontend:**
- [ ] Multi-step BookingWizard component
- [ ] Student dashboard: booking list, status badges
- [ ] Admin bookings table with filters

**Deliverable:** Students can initiate and view bookings

---

### Phase 4 — M-PESA Payments (Week 4)

**Backend:**
- [ ] Daraja OAuth token service (cached)
- [ ] STK Push endpoint
- [ ] Callback webhook handler
- [ ] Payment retry logic
- [ ] Email confirmation on successful payment (Nodemailer)

**Frontend:**
- [ ] MpesaPayButton with real-time status polling
- [ ] Payment history page
- [ ] Booking confirmation page + PDF download

**Deliverable:** Full end-to-end booking + payment flow

---

### Phase 5 — Admin Dashboard & Reports (Week 5)

**Backend:**
- [ ] Dashboard stats endpoint (occupancy %, revenue, recent bookings)
- [ ] CSV export (all bookings, payments)
- [ ] User management (activate/deactivate)

**Frontend:**
- [ ] Admin dashboard with KPI cards + Recharts charts
- [ ] Reports page with date-range filters + CSV download
- [ ] User management table

**Deliverable:** Admin has full visibility and control

---

### Phase 6 — Testing, Polish & Deployment (Week 6)

- [ ] NestJS unit & integration tests (Jest + Supertest)
- [ ] Frontend component tests (Vitest + Testing Library)
- [ ] M-PESA sandbox end-to-end test
- [ ] Responsive design audit (mobile-first)
- [ ] Security audit (CORS, helmet, rate-limiting, input validation)
- [ ] Docker Compose for production
- [ ] Deploy backend to Render / Railway
- [ ] Deploy frontend to Vercel / Netlify
- [ ] Configure environment variables for production Daraja credentials
- [ ] Seed production DB with admin account

**Deliverable:** Live, deployed system

---

## 12. Security Considerations

| Risk | Mitigation |
|------|-----------|
| Unauthorised booking | JWT + Role guard on all booking endpoints |
| Double booking | DB-level unique constraint on `(bedId, semester)` for CONFIRMED bookings + transaction lock |
| M-PESA callback spoofing | Validate callback against stored `CheckoutRequestID`; whitelist Safaricom IPs |
| SQL Injection | Prisma parameterised queries — no raw SQL |
| XSS | React escapes by default; sanitise any admin HTML inputs with DOMPurify |
| CSRF | SameSite=Strict on refresh token cookie; CSRF token on state-changing forms |
| Brute force | Rate-limit `/auth/login` (e.g. 5 attempts / 15 min via `@nestjs/throttler`) |
| Insecure passwords | Zod min-length 8, bcrypt 12 rounds |
| Exposed secrets | All credentials in `.env`, never committed; `.env.example` checked in instead |

---

## 13. Deployment Plan

### Environment Variables (`.env.example`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cuea_hostel

# JWT
JWT_SECRET=change_me_to_a_long_random_string
JWT_REFRESH_SECRET=another_long_random_string

# App
BASE_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# M-PESA Daraja
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_ENVIRONMENT=production   # real charges; use sandbox when testing
MPESA_CALLBACK_URL=https://deansaina.kevinkoech.com/api/v1/payments/mpesa/callback

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Production M-PESA payments require active Daraja production credentials, the correct
PayBill shortcode/passkey, and the public HTTPS callback URL above. Never commit
credentials. The live app sends an STK prompt to the entered phone number and can
charge the account when the customer authorizes it with their M-PESA PIN.

### Docker Compose (dev)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: cuea
      POSTGRES_PASSWORD: cuea_dev
      POSTGRES_DB: cuea_hostel
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  pgdata:
```

### Recommended Hosting (Free Tier)

| Service | Use |
|---------|-----|
| [Railway](https://railway.app) | NestJS backend + PostgreSQL |
| [Vercel](https://vercel.com) | React frontend |
| [Cloudinary](https://cloudinary.com) | Image storage |
| [Mailtrap](https://mailtrap.io) | Email testing (dev) |

---

## Summary

The CUEA Gaba Hostel Management System is a structured, three-role web platform built with **React + NestJS + PostgreSQL**, secured with **JWT auth**, and integrated with **Safaricom Daraja M-PESA** for mobile payments. The UI follows CUEA's brand colours (`#A0002A` crimson, `#F6961C` gold) using Tailwind CSS and shadcn/ui. A six-week phased delivery schedule ensures each milestone is independently testable and deliverable.
