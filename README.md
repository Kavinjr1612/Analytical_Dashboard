# 📊 Analytical Dashboard

A full-stack, self-service **Business Intelligence (BI) platform** that transforms any CSV dataset into a rich, interactive analytics experience — with dynamic charts, KPI cards, forecasting, anomaly detection, and AI-style narrative insights. No hardcoded data. No assumptions. Just upload your data and the dashboard figures the rest out.

---

## 🎯 What We Set Out to Build

The goal was to build a **generalized, data-driven analytics platform** — the kind used by professional data analysts — but accessible through a simple drag-and-drop CSV upload. The platform had to:

- Work with **any tabular dataset**, not just sales data
- **Automatically detect** what each column represents (date, category, region, numeric, status, identifier)
- Generate **meaningful visualizations and insights** dynamically, based solely on what's in the data
- Deliver a **premium, production-quality UI** — dark mode, smooth animations, glassmorphism, responsive layouts
- Provide an **end-to-end analytics workflow**: ingest → explore → trend → forecast → export

---

## ✨ Key Accomplishments

| Feature | Description |
|---------|-------------|
| **Dataset Intelligence Engine** | Automatically profiles any CSV — detects column types, maps schema, infers currency/percentage/number formatting |
| **Dynamic KPIs** | 4 KPI cards that adapt their labels, values, and formats to the uploaded dataset |
| **Executive Narrative** | Auto-generated text summary describing trends, dominant categories, and key insights |
| **Trend Analysis** | Linear regression, rolling moving averages, standard deviation bands, and anomaly detection |
| **Forecasting** | Predictive projection with confidence cone based on historical regression |
| **Cohort Retention** | Groups records by time period and tracks frequency/decay of unique identifiers |
| **Risk Classification** | Auto-classifies status column values into Critical / Warning / Resolved groups |
| **Custom Chart Tooltips** | Pie, treemap, and bar tooltips show category/product names at the top with exact values |
| **Low-density Data Fix** | Dynamic chart domains and conditional point anchors for sparse datasets |
| **Multi-dataset Support** | Upload, switch, combine, and delete multiple datasets independently |
| **Persistent State** | Active dataset selection and theme preference survive browser refresh |
| **Paginated Data Ledger** | Raw data table with sorting, search, pagination, and CSV export |
| **Dark / Light Theme** | Full theme toggle with localStorage persistence |

---

## 🏗️ Tech Stack

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| **Next.js** | 16.2.9 | React framework with App Router and server-side rendering |
| **React** | 19.2.4 | UI component library |
| **TypeScript** | ^5 | Full type safety across the client |
| **Tailwind CSS** | ^4 | Utility-first responsive styling |
| **Recharts** | ^3.9.0 | All charts — line, bar, pie, radar, treemap, area |
| **@tanstack/react-table** | ^8.21.3 | Paginated, sortable, and searchable data table |
| **lucide-react** | ^1.22.0 | Icon set used throughout the UI |
| **xlsx** | ^0.18.5 | CSV and Excel file parsing on upload |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| **Express.js** | ^4.19.2 | REST API server |
| **TypeScript** | ^5.4.5 | Type-safe server-side code |
| **Prisma** | ^5.14.0 | ORM for type-safe PostgreSQL queries |
| **@prisma/client** | ^5.14.0 | Auto-generated database client |
| **cors** | ^2.8.5 | Cross-origin request handling |
| **dotenv** | ^16.4.5 | Environment variable loading |
| **nodemon** | ^3.1.0 | Auto-restart during development |
| **tsx** | ^4.10.3 | Run TypeScript files directly |
| **@faker-js/faker** | ^8.4.1 | Seed script for generating test data |

### Database & Infrastructure

| Tool | Purpose |
|------|---------|
| **PostgreSQL** | Relational database engine |
| **Supabase** | Cloud-hosted PostgreSQL with free tier |
| **Prisma Migrations** | Version-controlled schema evolution |

---

## 📁 Project Structure

```
Analytical_Dashboard/
├── SETUP.md                        ← Quick run guide + Supabase reminder
├── WALKTHROUGH.md                  ← Full feature walkthrough
│
├── sales-dashboard/
│   ├── client/                     ← Next.js Frontend
│   │   ├── app/
│   │   │   ├── page.tsx            ← Home: Dataset Intake & Upload
│   │   │   ├── overview/           ← Executive KPIs & Narrative
│   │   │   ├── revenue/            ← Trend, Regression & Anomalies
│   │   │   ├── markets/            ← Category & Product Breakdown
│   │   │   ├── regions/            ← Geographic Distribution
│   │   │   ├── customers/          ← Cohort Retention & Frequency
│   │   │   ├── risk/               ← Status Classification & Risk
│   │   │   ├── ledger/             ← Raw Paginated Data Table
│   │   │   ├── forecast/           ← Predictive Projections
│   │   │   └── settings/           ← Theme & Preferences
│   │   │
│   │   ├── components/
│   │   │   ├── AppShell.tsx        ← Main layout + top navigation bar
│   │   │   ├── NavigationRail.tsx  ← Dynamic sidebar (labels adapt to dataset)
│   │   │   ├── AnalyticsCharts.tsx ← All reusable chart components
│   │   │   ├── SummaryCards.tsx    ← KPI card components
│   │   │   ├── FilterBar.tsx       ← Global filter controls
│   │   │   ├── TransactionsTable.tsx ← Data ledger table
│   │   │   ├── TopPerformersPanel.tsx ← Rankings panel
│   │   │   ├── DrilldownDrawer.tsx ← Detail slide-over panel
│   │   │   ├── GlossaryDrawer.tsx  ← Metric definitions panel
│   │   │   ├── EmptyState.tsx      ← No-data placeholder
│   │   │   └── ErrorBoundary.tsx   ← React error boundary
│   │   │
│   │   ├── context/
│   │   │   └── DashboardContext.tsx ← Global state provider
│   │   │
│   │   ├── hooks/
│   │   │   └── useDashboard.ts     ← Core data, filters, schema logic
│   │   │
│   │   ├── services/
│   │   │   └── api.ts              ← All backend API calls
│   │   │
│   │   └── types/
│   │       └── index.ts            ← Shared TypeScript types
│   │
│   └── server/                     ← Express.js Backend
│       ├── src/
│       │   ├── server.ts           ← App entry point
│       │   ├── routes/index.ts     ← API route definitions
│       │   ├── controllers/
│       │   │   └── transactionController.ts ← All business logic
│       │   └── utils/
│       │       └── db.ts           ← Prisma client singleton
│       │
│       └── prisma/
│           ├── schema.prisma       ← Database models
│           ├── migrations/         ← SQL migration history
│           └── seed.ts             ← Sample data seeder
```

---

## 🗄️ Database Schema

```
datasets
├── id            UUID (primary key)
├── name          String
├── imported_at   DateTime
└── row_count     Int

transactions
├── id                UUID (primary key)
├── customer_name     String
├── product_name      String
├── category          String
├── region            String
├── amount            Decimal(10,2)
├── status            String
├── transaction_date  DateTime
└── dataset_id        UUID → datasets.id (CASCADE DELETE)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/datasets` | List all uploaded datasets |
| POST | `/api/datasets/import` | Upload CSV rows into a new dataset |
| DELETE | `/api/datasets/:id` | Delete a dataset and all its records |
| GET | `/api/dashboard/summary` | KPI statistics for the active dataset |
| GET | `/api/dashboard/charts` | Chart data series for all visualizations |
| GET | `/api/transactions` | Paginated, filtered, and sorted records |
| GET | `/api/transactions/export` | Download filtered records as CSV |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A Supabase account (free tier works) → [supabase.com](https://supabase.com)

### 1. Clone the repository

```bash
git clone https://github.com/Kavinjr1612/Analytical_Dashboard.git
cd Analytical_Dashboard
```

### 2. Configure environment variables

**Backend** — edit `sales-dashboard/server/.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

**Frontend** — edit `sales-dashboard/client/.env`:
```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:5000/api"
```

### 3. Install dependencies

```bash
# Backend
cd sales-dashboard/server
npm install

# Frontend
cd ../client
npm install
```

### 4. Run database migration

```bash
cd sales-dashboard/server
npx prisma migrate dev
```

### 5. Start the application

**Terminal 1 — Backend:**
```bash
cd sales-dashboard/server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd sales-dashboard/client
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ⚠️ Supabase Free Tier Note

Supabase pauses projects after **1 week of inactivity** on the free tier.

If you see empty charts or connection errors:
1. Go to [supabase.com](https://supabase.com) → open your project
2. Click **"Resume Project"** and wait ~30 seconds
3. Restart the backend server

---

## 📖 Documentation

| File | Description |
|------|-------------|
| [SETUP.md](./SETUP.md) | Quick-start commands and Supabase reminder |
| [WALKTHROUGH.md](./WALKTHROUGH.md) | Full feature walkthrough — every page explained |

---

## 📸 Pages at a Glance

| Route | Page Name | What It Shows |
|-------|-----------|----------------|
| `/` | Dataset Intake | Upload CSV, manage datasets |
| `/overview` | Overview | KPI cards, executive narrative, trend + distribution charts |
| `/revenue` | Trend Analysis | Line trend, regression, moving average, anomaly feed |
| `/markets` | Markets | Treemap, pie chart, category rankings, product heatmap |
| `/regions` | Regions | Radar chart, bar rankings, region summary cards |
| `/customers` | Customer Retention | Cohort table, frequency histogram, top identifiers |
| `/risk` | Risk & Anomalies | Status breakdown, error rate gauge, anomaly alerts |
| `/ledger` | Data Ledger | Full paginated table, search, sort, CSV export |
| `/forecast` | Forecast | Regression projection, confidence cone, prediction table |
| `/settings` | Settings | Theme toggle (dark / light) |

---

## 🔄 Data Flow

```
Browser (CSV Upload)
      │
      ▼
POST /api/datasets/import
      │
      ▼
Express Server (validates + inserts rows via Prisma)
      │
      ▼
Supabase PostgreSQL (datasets + transactions tables)
      │
      ▼ (on page load)
GET /api/dashboard/summary + /api/dashboard/charts
      │
      ▼
React (Recharts renders dynamic visualizations)
      │
      ▼
User sees charts, KPIs, insights — all adapted to their data
```

---

## 📝 License

This project was built as a portfolio and demonstration project.

---

*Built with Next.js · Express · Prisma · Supabase · Recharts · TypeScript*
