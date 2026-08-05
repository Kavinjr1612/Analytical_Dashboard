# 📊 Analytical Dashboard — Complete Walkthrough Guide

A self-service Business Intelligence (BI) platform that automatically analyzes any CSV dataset
and generates dynamic charts, KPIs, trends, forecasts, and natural language insights.

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [First-Time Setup](#3-first-time-setup)
4. [Starting the Application](#4-starting-the-application)
5. [Using the Dashboard](#5-using-the-dashboard)
6. [CSV Format Requirements](#6-csv-format-requirements)
7. [Filters and Search](#7-filters-and-search)
8. [Managing Multiple Datasets](#8-managing-multiple-datasets)
9. [Settings and Theme](#9-settings-and-theme)
10. [Architecture Overview](#10-architecture-overview)
11. [Environment Variables](#11-environment-variables)
12. [Troubleshooting](#12-troubleshooting)
13. [Tech Stack](#13-tech-stack)

---

## 1. Prerequisites

Make sure the following tools are installed on your machine before starting:

| Tool         | Minimum Version | Download Link                        |
|--------------|----------------|--------------------------------------|
| Node.js      | v18+           | https://nodejs.org                   |
| npm          | v9+            | Comes with Node.js                   |
| Git          | Any            | https://git-scm.com                  |
| Supabase Acc | Free tier ok   | https://supabase.com                 |

> NOTE: The application requires a PostgreSQL database (hosted on Supabase or locally).
> Without a database connection, data upload and chart features will not function.

---

## 2. Project Structure

```
Task2/
├── WALKTHROUGH.md               <- You are reading this
├── sales-dashboard/
│   ├── client/                  <- Next.js Frontend (React)
│   │   ├── app/
│   │   │   ├── page.tsx         <- Home / Dataset Intake Page
│   │   │   ├── overview/        <- Executive Summary and KPIs
│   │   │   ├── revenue/         <- Trend Analysis and Anomalies
│   │   │   ├── markets/         <- Category and Product Breakdown
│   │   │   ├── regions/         <- Geographic Distribution
│   │   │   ├── customers/       <- Retention and Cohort Analysis
│   │   │   ├── risk/            <- Anomaly Detection and Risk
│   │   │   ├── ledger/          <- Raw Data Table (Paginated)
│   │   │   ├── forecast/        <- Predictive Projections
│   │   │   └── settings/        <- App Settings and Theme
│   │   ├── components/
│   │   │   ├── AppShell.tsx     <- Main layout shell with sidebar
│   │   │   ├── NavigationRail.tsx <- Dynamic sidebar navigation
│   │   │   └── EmptyState.tsx   <- Empty/error state display
│   │   ├── context/
│   │   │   └── DashboardContext.tsx <- Global state context
│   │   ├── hooks/
│   │   │   └── useDashboard.ts  <- Core data and filter logic
│   │   ├── services/
│   │   │   └── api.ts           <- Backend API client
│   │   └── types/               <- TypeScript type definitions
│   │
│   └── server/                  <- Express.js Backend (TypeScript)
│       ├── src/
│       │   ├── server.ts        <- Express app entry point
│       │   ├── routes/          <- API route definitions
│       │   ├── controllers/     <- Business logic handlers
│       │   └── utils/
│       │       └── db.ts        <- Prisma database client
│       └── prisma/
│           └── schema.prisma    <- Database schema definition
```

---

## 3. First-Time Setup

### Clone the Repository

```bash
git clone https://github.com/Kavinjr1612/Analytical_Dashboard.git
cd Analytical_Dashboard
```

### Install Server Dependencies

```bash
cd sales-dashboard/server
npm install
```

### Install Client Dependencies

```bash
cd sales-dashboard/client
npm install
```

### Configure Server Environment

Navigate to `sales-dashboard/server/` and create or edit the `.env` file:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

Replace the DATABASE_URL with your actual Supabase connection string.
You can find this in: Supabase Dashboard -> Project Settings -> Database -> Connection String (URI).

### Configure Client Environment

Navigate to `sales-dashboard/client/` and create or edit the `.env` file:

```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:5000/api"
```

### Run Database Migration

```bash
cd sales-dashboard/server
npx prisma migrate dev
```

This creates the `datasets` and `transactions` tables in your Supabase database.

---

## 4. Starting the Application

You need TWO terminal windows running at the same time.

### Terminal 1 — Start the Backend Server

```bash
cd sales-dashboard/server
npm run dev
```

Expected output:
```
Server running in production-ready mode on port 5000
```

### Terminal 2 — Start the Frontend Client

```bash
cd sales-dashboard/client
npm run dev
```

Expected output:
```
  Next.js 16.x.x
- Local: http://localhost:3000
```

### Open the App

Open your browser and visit: http://localhost:3000

---

## 5. Using the Dashboard

### Step A: Upload a Dataset

1. Open http://localhost:3000 — you will see the Intake Page.
2. Click the "Upload CSV" button (or drag and drop a CSV file onto the page).
3. Give your dataset a name (e.g., "Q1 Sales 2024").
4. The Dataset Intelligence Engine will automatically:
   - Detect column types (Date, Category, Region, Numeric, Status, etc.)
   - Map your CSV columns to the dashboard schema
   - Save the column profile to your browser's local storage
5. Click "Import Dataset" to store the data in the database.
6. The dashboard automatically switches to show analytics for your new dataset.

> TIP: You can upload multiple datasets and switch between them using the
> dataset selector dropdown in the top navigation bar.

---

### Step B: Overview Page (http://localhost:3000/overview)

The Overview page shows:

- 4 KPI Cards — Total records, total metric value, average value, and top category count.
  All values use the correct format for your data (currency $, percentage %, or plain numbers).
- Executive Narrative — A dynamically generated text summary describing what the data shows
  (e.g., growth trends, dominant categories, regional concentrations).
- Time Series Chart — A line graph showing your main metric across time.
- Distribution Chart — A bar chart showing breakdown across categories or regions.

---

### Step C: Revenue and Trends (http://localhost:3000/revenue)

This page contains:

- Trend Line — Your main numeric metric plotted over time.
- Linear Regression — An auto-calculated trendline showing overall growth or decline direction.
- Rolling Moving Average — A smoothed 7-period average that filters out noise.
- Standard Deviation Bands — Upper and lower bounds showing the normal expected range.
- Anomaly Feed — A list of data points that fall outside the normal range, flagged as outliers.

---

### Step D: Markets and Categories (http://localhost:3000/markets)

This page shows:

- Treemap Chart — Visual blocks sized by contribution of each category.
  Hover over a block to see the category name and its exact value at the top of the tooltip.
- Pie Chart — Percentage share of each category.
  Hovering shows the product/category name and amount in the tooltip.
- Category Rankings — A ranked table of categories from highest to lowest contribution.
- Product Heatmap — A grid showing product performance across different categories.

---

### Step E: Regions and Geography (http://localhost:3000/regions)

This page shows:

- Radar Chart — A multi-axis chart showing metric spread across all detected regions.
- Bar Rankings — Horizontal bars ranking each region by total metric value.
- Region Cards — Summary cards for each region showing value, count, and average.

---

### Step F: Customer Retention (http://localhost:3000/customers)

This page shows:

- Cohort Retention Table — Groups records by time period and tracks how many records
  appear in subsequent periods (decay curve analysis).
- Frequency Distribution — A histogram showing how often unique identifiers appear
  (e.g., 1 time, 2 times, 3 or more times).
- Top Customers List — Ranked list of the most frequent unique identifiers.
- Loyalty Score — A calculated metric based on repeat frequency across the dataset.

---

### Step G: Risk and Anomalies (http://localhost:3000/risk)

This page shows:

- Status Breakdown — Automatically classifies your Status column values into:
    CRITICAL  (keywords: Failed, Cancelled, Error, Rejected)
    WARNING   (keywords: Pending, Processing, On Hold)
    RESOLVED  (keywords: Completed, Success, Delivered)
- Error Rate Gauge — Percentage of records currently in a critical state.
- Trend Risk Monitor — Detects whether critical events are increasing over time.
- Anomaly Alert Feed — Individual records flagged as statistically unusual based on value deviation.

---

### Step H: Ledger / Raw Data Table (http://localhost:3000/ledger)

This page shows:

- Paginated Data Table — All raw records from your dataset, 10 per page by default.
- Dynamic Columns — Table headers automatically match your CSV column names exactly.
- Search Bar — Type any name or keyword to search across identifier and name columns.
- Column Sorting — Click any column header to sort ascending or descending.
- Page Controls — Navigate through pages or change rows-per-page (10, 25, 50, 100).
- Export Button — Download the filtered data view as a CSV file.

---

### Step I: Forecast and Projections (http://localhost:3000/forecast)

This page shows:

- Historical Actuals — Your real metric data plotted over time.
- Regression Projection — An extended trendline predicting future values based on
  the historical rate of change.
- Confidence Cone — Upper and lower bounds showing the uncertainty range of the forecast.
- Moving Average Projection — A smoothed forward projection based on recent period averages.
- Projection Table — A table of predicted values for upcoming time periods.

---

## 6. CSV Format Requirements

The dashboard can accept any CSV file. For best results, your CSV should contain:

| Column Type    | Examples                                  | Detected As       |
|----------------|-------------------------------------------|-------------------|
| Date column    | 2024-01-15, 01/15/2024, January 15 2024   | Transaction Date  |
| Numeric column | 1500.00, 2500, 99.5                       | Amount / Metric   |
| Text column    | Electronics, North, Completed             | Category / Status |
| ID / Name col  | John Smith, CUST-001, user@email.com      | Customer Name     |
| Location col   | East, Mumbai, Region A                    | Region            |

### Example Minimal CSV Structure:

```csv
date,customer,product,category,region,amount,status
2024-01-01,Alice,Widget A,Electronics,North,1500.00,Completed
2024-01-02,Bob,Widget B,Clothing,South,250.00,Pending
2024-01-03,Charlie,Widget C,Electronics,East,3200.00,Completed
2024-01-04,Alice,Widget A,Electronics,North,1800.00,Completed
2024-01-05,Dave,Widget D,Furniture,West,950.00,Failed
```

> NOTE: Column names do not have to match exactly. The intelligence engine detects
> the purpose of each column based on the data values it contains, not just the header name.

---

## 7. Filters and Search

The top navigation bar contains global filters that apply to ALL pages simultaneously:

| Filter      | How to use                                            |
|-------------|-------------------------------------------------------|
| Dataset     | Dropdown to switch between uploaded datasets          |
| Date Range  | Click the date picker to set a start and end date     |
| Search      | Type to search by name / identifier (500ms debounce)  |
| Category    | Filter to show only one category at a time            |
| Region      | Filter to show only one region at a time              |
| Status      | Filter by status value (Completed, Pending, etc.)     |
| Reset       | Click "Reset Filters" to clear all active filters     |

> TIP: All filters persist within your browser session. Refreshing the page retains
> your selected dataset, but resets date / category / region filters.

---

## 8. Managing Multiple Datasets

You can upload and manage several datasets independently:

1. Upload a new dataset — Click the upload button on the home page and import another CSV.

2. Switch datasets — Use the dataset selector dropdown in the top navigation bar.
   All charts and metrics instantly update to reflect the selected dataset.

3. View all datasets combined — Select "All Datasets" in the dropdown to see
   aggregated analytics across every uploaded CSV at once.

4. Delete a dataset — Click the delete icon next to a dataset name in the
   dataset list on the home page. This permanently removes all its records from the database.

> NOTE: Dataset column schemas are stored per-dataset in your browser's localStorage.
> Clearing browser storage will reset column label customizations, but the data remains in the database.

---

## 9. Settings and Theme

Navigate to: http://localhost:3000/settings

Available options:
- Dark / Light Mode — Toggle between dark and light themes.
  Your preference is saved in localStorage and persists across browser sessions.

The theme toggle button is also available in the top navigation bar on every page.

---

## 10. Architecture Overview

```
  BROWSER (User)  —  http://localhost:3000 (Next.js)
        |
        | REST API calls (fetch)
        v
  EXPRESS BACKEND  —  http://localhost:5000/api
  |
  |  GET  /api/dashboard/summary   -> KPI statistics
  |  GET  /api/dashboard/charts    -> Chart data points
  |  GET  /api/transactions        -> Paginated raw data
  |  POST /api/datasets/import     -> Upload CSV rows
  |  GET  /api/datasets            -> List all datasets
  |  DELETE /api/datasets/:id      -> Remove a dataset
  |  GET  /api/transactions/export -> Download as CSV
        |
        | Prisma ORM queries
        v
  SUPABASE POSTGRESQL  (Cloud)
  |
  |  Table: datasets      -> id, name, imported_at, row_count
  |  Table: transactions  -> id, customer_name, product_name,
                             category, region, amount,
                             status, transaction_date, dataset_id
```

---

## 11. Environment Variables

### Backend (sales-dashboard/server/.env)

| Variable      | Description                         | Example                                  |
|---------------|-------------------------------------|------------------------------------------|
| DATABASE_URL  | PostgreSQL connection string        | postgresql://user:pass@host:5432/db      |
| PORT          | Port for the Express server         | 5000                                     |
| CLIENT_URL    | Allowed origin for CORS             | http://localhost:3000                    |

### Frontend (sales-dashboard/client/.env)

| Variable              | Description                       | Example                       |
|-----------------------|-----------------------------------|-------------------------------|
| NEXT_PUBLIC_API_URL   | Backend API base URL              | http://127.0.0.1:5000/api     |

---

## 12. Troubleshooting

### Problem: Dashboard shows empty charts or "Failed to load" error
Cause:  Backend server is not running, or database connection failed.
Fix:
  1. Make sure the backend server is running: npm run dev in sales-dashboard/server/
  2. Check your DATABASE_URL in server/.env is correct.
  3. Visit http://localhost:5000/health — it should return {"status":"ok"}.

---

### Problem: "Route not found" errors on API calls
Cause:  The frontend is trying to call the wrong API URL.
Fix:    Check sales-dashboard/client/.env contains:
        NEXT_PUBLIC_API_URL="http://127.0.0.1:5000/api"

---

### Problem: CSV upload succeeds but charts remain empty
Cause:  The CSV may have unrecognized column formats.
Fix:    Make sure your CSV has at least one date column, one numeric column,
        and one text column. Refer to Section 6 — CSV Format Requirements.

---

### Problem: Supabase database connection refused
Cause:  Incorrect password, wrong host, or Supabase project is paused (free tier pauses
        after 1 week of inactivity).
Fix:
  1. Log in to https://supabase.com
  2. Go to your project and click "Resume Project" if it is paused.
  3. Verify the connection string in Project Settings -> Database -> Connection String.

---

### Problem: "prisma generate" error on first run
Fix:    Run these commands before starting the server:
        cd sales-dashboard/server
        npx prisma generate
        npx prisma migrate dev

---

### Problem: Port 5000 or 3000 is already in use (Windows)

```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 13. Tech Stack

| Layer          | Technology                     | Purpose                                    |
|----------------|--------------------------------|--------------------------------------------|
| Frontend UI    | Next.js 16 + React 19          | Page rendering and routing                 |
| Styling        | Tailwind CSS v4                | Utility-first responsive design            |
| Charts         | Recharts v3                    | All data visualizations                    |
| Data Table     | TanStack Table v8              | Paginated and sortable data grid           |
| CSV Parsing    | XLSX library                   | Reads and parses uploaded CSV/Excel files  |
| Icons          | Lucide React                   | UI icon set                                |
| Backend        | Express.js + TypeScript        | REST API server                            |
| ORM            | Prisma v5                      | Type-safe database queries                 |
| Database       | PostgreSQL via Supabase         | Cloud-hosted relational database           |
| Language       | TypeScript (full stack)        | Type-safe across client and server         |
| Version Control| Git + GitHub                   | Source code management                     |

---

## GitHub Repository

https://github.com/Kavinjr1612/Analytical_Dashboard

---

Last Updated: August 2026
