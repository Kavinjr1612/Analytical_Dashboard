# Sales Analytics Dashboard

A high-performance, full-stack Sales Analytics Dashboard designed to visualize transaction insights and efficiently process large datasets (>= 10,000 transaction records) without UI latency.

Built with **Next.js (App Router)**, **Node.js/Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## Technical Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts (Visualizations), TanStack Table (Data grid), Lucide Icons
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL

---

## Project Structure

```
sales-dashboard/
├── client/                 # Next.js App
│   ├── app/                # Page layouts, globals, routing
│   ├── components/         # Reusable UI widgets (FilterBar, Table, Charts, ErrorBoundary)
│   ├── hooks/              # Custom React hooks (useDashboard state, debouncing)
│   ├── services/           # API fetch wrappers
│   └── types/              # TypeScript typings
└── server/                 # Express.js Server
    ├── prisma/             # Schema configuration and database seed scripts
    ├── src/
    │   ├── controllers/    # Controller request handlers
    │   ├── routes/         # Express router configuration
    │   ├── utils/          # Database client
    │   └── server.ts       # Server entrypoint
    └── tsconfig.json       # TypeScript configuration
```

---

## Database Design & Optimizations

The relational database is configured with PostgreSQL and Prisma.

### Schema: `Transaction`
- **id (UUID):** Primary Key
- **customer_name (string):** Customer Full Name
- **product_name (string):** Product Name
- **category (string):** Electronics, Clothing, Grocery, Furniture, Beauty
- **region (string):** North, South, East, West
- **amount (decimal):** Total transaction cost
- **status (string):** Completed, Pending, Cancelled
- **transaction_date (timestamp):** Date of record creation

### Indexes Added for Performance
To optimize filtering, query times, and backend speed, indexes are created on:
1. `category`
2. `region`
3. `transaction_date`
4. `status`

---

## Seeding Script

The database seeding script generates **exactly 10,000 transaction records** using `@faker-js/faker`.
- **Date Distribution:** Distributed uniformly across the last 12 months. This ensures that date range filters and time trend charts render data continuously and accurately.
- **Bulk Insertion:** Inserted in optimized chunk batches of **2,000 records** using Prisma's `createMany` API to minimize database write overhead.
- **Price Distribution:** Standardized range per category (e.g. higher min/max for Electronics/Furniture and lower for Grocery/Beauty) to provide realistic financial metrics.

---

## Performance Engineering Rules Followed

1. **Server-Side Pagination:** Uses PostgreSQL `LIMIT` and `OFFSET` in SQL queries. Never loads all 10,000 records on the client.
2. **Database-Level Aggregation:** Calculations for summaries (Sums, Counts, Averages) and chart metrics are aggregated on the PostgreSQL engine, avoiding large-array processes in Node memory or the client.
3. **Debounced Search:** Includes a **500ms debounce** on text searches to prevent database search storms on keypresses.
4. **Parallel Promise Resolvers:** Backend API routes execute independent aggregation queries concurrently using `Promise.all`, minimizing response latency.
5. **CSV Stream Exporter:** Streams records chunk-by-chunk to the client rather than buffering the entire 10k array in backend RAM.

---

## Installation & Local Execution

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL running locally or in the cloud

### Step 1: Clone and Configure Environment Variables
Inside the `sales-dashboard/server` folder, copy `.env.example` to `.env` and configure your database URL:
```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

Inside the `sales-dashboard/client` folder, copy `.env.example` to `.env`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### Step 2: Initialize Database and Seed Data
Navigate to the `sales-dashboard/server` directory and run:
```bash
# 1. Run migrations to create the database schema and indexes
npx prisma migrate dev --name init

# 2. Seed 10,000 mock records
npm run prisma:seed
```

### Step 3: Start the Backend Server
From the `sales-dashboard/server` directory, run:
```bash
npm run dev
```
The server will run on [http://localhost:5000](http://localhost:5000).

### Step 4: Start the Next.js Frontend
Navigate to the `sales-dashboard/client` directory and run:
```bash
# Install packages
npm install

# Start the dev environment
npm run dev
```
The application will be running on [http://localhost:3000](http://localhost:3000).

---

## API Documentation

### 1. Dashboard Summary
- **Endpoint:** `GET /api/dashboard/summary`
- **Description:** Returns total revenue, order counts, average order values, customer counts, top categories, and best performing regions. Fully interactive with active filters.
- **Query Parameters:**
  - `startDate` (ISO Date string, optional)
  - `endDate` (ISO Date string, optional)
  - `category` (string, optional)
  - `region` (string, optional)
  - `search` (string, optional)
- **Response Format:**
```json
{
  "totalRevenue": 4729120.45,
  "totalOrders": 10000,
  "averageOrderValue": 472.91,
  "totalCustomers": 9482,
  "topSellingCategory": "Electronics",
  "bestPerformingRegion": "North"
}
```

### 2. Dashboard Visualizations
- **Endpoint:** `GET /api/dashboard/charts`
- **Description:** Fetches datasets for line trends (auto-grouped by Month or Day depending on date filter span), categories, regions, and statuses.
- **Query Parameters:** Same filters as above.
- **Response Format:**
```json
{
  "revenueTrend": [
    { "date": "2025-06", "revenue": 395102.50 },
    { "date": "2025-07", "revenue": 412030.00 }
  ],
  "salesByCategory": [
    { "category": "Electronics", "value": 1829100.40 },
    { "category": "Furniture", "value": 1290340.00 }
  ],
  "salesByRegion": [
    { "region": "North", "value": 1420100.80 },
    { "region": "South", "value": 1109040.50 }
  ],
  "orderStatusDistribution": [
    { "status": "Completed", "count": 7530 },
    { "status": "Pending", "count": 1475 },
    { "status": "Cancelled", "count": 995 }
  ]
}
```

### 3. Transactions List
- **Endpoint:** `GET /api/transactions`
- **Description:** Fetches a paginated, sortable, and searchable list of transactions.
- **Query Parameters:**
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `sortBy` (string, default: `"transactionDate"`)
  - `sortOrder` (string, default: `"desc"`)
  - Filters: `startDate`, `endDate`, `category`, `region`, `search`
- **Response Format:**
```json
{
  "transactions": [
    {
      "id": "18c89b7b-2ba7-4258-a461-8ff62df133db",
      "customerName": "John Doe",
      "productName": "Laptop Pro",
      "category": "Electronics",
      "region": "North",
      "amount": "1299.99",
      "status": "Completed",
      "transactionDate": "2026-06-29T10:00:00.000Z"
    }
  ],
  "totalCount": 10000,
  "page": 1,
  "limit": 10,
  "totalPages": 1000
}
```

### 4. Transactions CSV Export
- **Endpoint:** `GET /api/transactions/export`
- **Description:** Streams currently filtered transaction records as a CSV download.
- **Query Parameters:** Same filters as list endpoint (does not paginate).
- **Response Header:**
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="transactions_export.csv"`
