# 🚀 Quick Setup Guide — Analytical Dashboard

---

## ⚠️ IMPORTANT: Supabase Reminder

> If the dashboard shows empty charts, upload failures, or "Failed to load" errors —
> your Supabase project may be PAUSED (free tier pauses after 1 week of no activity).
>
> Fix it in 30 seconds:
> 1. Go to https://supabase.com and log in
> 2. Open your project
> 3. Click the green "Resume Project" button
> 4. Wait ~30 seconds for it to wake up
> 5. Restart the backend server (see Step 2 below)

---

## Step 1 — Install Dependencies (First Time Only)

Open a terminal and run:

```
cd sales-dashboard/server
npm install

cd ../client
npm install
```

---

## Step 2 — Start the Backend Server

Open Terminal 1 and run:

```
cd sales-dashboard/server
npm run dev
```

You should see:
```
Server running in production-ready mode on port 5000
```

---

## Step 3 — Start the Frontend

Open Terminal 2 and run:

```
cd sales-dashboard/client
npm run dev
```

You should see:
```
Local: http://localhost:3000
```

---

## Step 4 — Open the App

Open your browser and go to:

```
http://localhost:3000
```

---

## Quick Health Check

To verify the backend is connected to the database, visit:

```
http://localhost:5000/health
```

Expected response: `{"status":"ok"}`

If you see an error here — check Supabase is resumed (see top of this guide).

---

## Common Issues

| Problem                        | Fix                                                    |
|--------------------------------|--------------------------------------------------------|
| Charts are empty               | Resume Supabase project, then restart the server       |
| "Failed to load" on any page   | Resume Supabase project, then restart the server       |
| Port 5000 already in use       | Run: netstat -ano | findstr :5000 then taskkill /PID X /F |
| Port 3000 already in use       | Run: netstat -ano | findstr :3000 then taskkill /PID X /F |
| npm install fails              | Delete node_modules folder and run npm install again   |

---

## Environment Files (Do Not Delete)

```
sales-dashboard/server/.env    <- Contains DATABASE_URL for Supabase
sales-dashboard/client/.env    <- Contains API URL (http://127.0.0.1:5000/api)
```

---

GitHub: https://github.com/Kavinjr1612/Analytical_Dashboard
