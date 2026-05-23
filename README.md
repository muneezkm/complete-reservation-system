# Allo Inventory Reservation System

A full-stack inventory reservation and order-fulfillment platform for multi-warehouse retail and D2C brands.

## Live Demo
https://munzz-reservation.vercel.app

## GitHub
https://github.com/muneezkm/complete-reservation-system

---

# Problem

During checkout, payment processing takes time. If two users try to buy the last item simultaneously, both may complete payment and cause overselling.

## Solution

The system temporarily reserves stock for 10 minutes during checkout.

- Payment success → reservation confirmed
- Payment failed/expired → stock released automatically

This prevents race conditions and overselling.

---

# Tech Stack

- Next.js 15
- TypeScript
- Prisma 5
- PostgreSQL
- Supabase
- Tailwind CSS
- Zod
- Vercel

---

# Features

- Multi-warehouse inventory management
- 10-minute stock reservation
- Atomic reservation handling
- Automatic reservation expiry
- Real-time available stock calculation
- Checkout countdown timer
- Reservation confirmation and cancellation
- Proper error handling (409 / 410)

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/muneezkm/complete-reservation-system.git
cd complete-reservation-system
```

## Install Dependencies

```bash
npm install
```

## Create .env File

```env
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-url"
CRON_SECRET="your-secret"
```

## Push Database Schema

```bash
npx prisma db push
```

## Seed Database

```bash
npx prisma db seed
```

## Run Development Server

```bash
npm run dev
```

Open:
http://localhost:3000

---

# Concurrency Handling

The core challenge is preventing two users from reserving the same stock simultaneously.

The system uses an atomic SQL update:

```sql
UPDATE "Stock"
SET "reservedUnits" = "reservedUnits" + quantity
WHERE "productId" = productId
AND "warehouseId" = warehouseId
AND ("totalUnits" - "reservedUnits") >= quantity
```

## Why It Works

- PostgreSQL row-level locking makes the operation atomic
- Only one request can reserve the last unit
- Prevents overselling completely

If no rows are updated:
- Return 409 Conflict (insufficient stock)

---

# Reservation Expiry

## Lazy Cleanup
Before every product fetch:
- Expired reservations are released
- Stock is recalculated

## Cron Cleanup
A Vercel cron job runs daily:
```txt
GET /api/cron/expire
```

This acts as a backup cleanup mechanism.

---

# API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List products |
| GET | /api/warehouses | List warehouses |
| POST | /api/reservations | Create reservation |
| GET | /api/reservations/:id | Get reservation |
| POST | /api/reservations/:id/confirm | Confirm reservation |
| POST | /api/reservations/:id/release | Release reservation |
| GET | /api/cron/expire | Cleanup expired reservations |

---

# Database Models

## Product
- id
- name
- sku
- price

## Warehouse
- id
- name
- location

## Stock
- totalUnits
- reservedUnits

## Reservation
- quantity
- status
- expiresAt
- createdAt

Available stock:
```txt
totalUnits - reservedUnits
```

---

# Frontend Flow

## Product Page
- Shows products and warehouse stock
- Reserve button creates reservation

## Checkout Page
- Live 10-minute countdown
- Confirm Purchase button
- Cancel Reservation button

## Success Flow
- Reservation confirmed
- Stock permanently decremented

---

# Seed Data

## Warehouses
- London Hub
- Dubai Hub

## Products
- Classic White Shirt
- Slim Fit Jeans
- Running Sneakers

---

# Trade-offs & Improvements

## Current Trade-offs
- Used Prisma 5 for deployment stability
- No Redis implementation
- Daily cron due to Vercel free plan
- Focused more on backend correctness than UI polish

## Future Improvements
- Redis-based idempotency keys
- Minute-based background cleanup
- Integration and concurrency tests
- Better mobile UI and animations

---

# Key Learning Outcomes

- Database concurrency handling
- Atomic SQL operations
- Reservation system design
- Inventory consistency management
- Full-stack application architecture