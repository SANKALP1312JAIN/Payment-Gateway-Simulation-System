# NexusPay — Payment Orchestration Engine

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://payment-gateway-sankalp-jain.vercel.app/) [![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue)](https://github.com/SANKALP1312JAIN/Payment-Gateway-Simulation-System)

**NexusPay** is a fault-tolerant, production-grade payment orchestration engine designed to simulate real-world payment gateway behaviors — including success scenarios, timeouts, hard failures, and webhook dispatching — while strictly enforcing state transitions and idempotency at every step.

> Built to demonstrate distributed systems thinking: BullMQ-based job orchestration, atomic state machines, Redis-backed idempotency locking, and exponential backoff retry logic — all running on free-tier infrastructure.

---

## 🚀 Architecture Highlights

To satisfy the constraint of strictly relying on free-tier services without requiring a separate 24/7 background worker, the entire architecture runs within a monolithic Express process.

- **Unified Process:** BullMQ workers are initialized inside `server.js` alongside the Express API — no separate worker dyno needed.
- **Idempotent Retries:** Redis locks (`SET key NX PX`) + a unique index on `idempotencyKey` in MongoDB prevent duplicate transactions even under concurrent load.
- **State Machine Validator:** All payment state transitions (`CREATED → PROCESSING → SUCCESS/FAILED`) are guarded by atomic `findOneAndUpdate` constraints — no illegal state jumps possible.
- **BullMQ Orchestration:** Native `attempts` + `backoff` options handle retry logic with full exponential backoff. Jobs persist in Redis across cold starts — no data loss on Render sleep cycles.
- **Webhook Simulation:** A separate BullMQ `WebhookQueue` simulates downstream webhook delivery with an 80% success rate and its own retry chain.

---

## 📦 Tech Stack (Free-Tier Friendly)

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | MongoDB Atlas (M0 Free Cluster) |
| Queue & Locking | Redis via Upstash + BullMQ |
| Frontend | React + Vite + TailwindCSS |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🏁 How to Run Locally

### 1. Prerequisites
- Node.js v18+
- Local Redis on port 6379 (or supply `REDIS_URI` env var for Upstash)
- MongoDB locally or Atlas connection string in `MONGO_URI`

### 2. Start the Backend
```bash
cd backend
npm install
npm run start
# Server + BullMQ workers start on http://localhost:5000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard available on http://localhost:5173
```

### 4. Run Load Tests
```bash
node scripts/loadTest.js
# Simulates 2000 concurrent transactions to benchmark retry logic and throughput
```

---

## ☁️ Deployment Guide (Free Tiers)

### 1. Database — MongoDB Atlas
1. Create an **M0 Free Cluster** at [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a DB user and whitelist `0.0.0.0/0`.
3. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/payment_gateway?retryWrites=true&w=majority`

### 2. Redis — Upstash
1. Create a Free Redis Database at [Upstash](https://upstash.com).
2. Copy the `REDIS_URI` — use `rediss://` (with TLS) for ioredis compatibility.

### 3. Backend — Render
1. Create a **New Web Service** pointing to this repo.
2. Set Root Directory to `backend`.
3. Build Command: `npm install` | Start Command: `node server.js`
4. Add Environment Variables:
   - `MONGO_URI` → your Atlas connection string
   - `REDIS_URI` → your Upstash `rediss://` URI
   - `PORT` → `5000`

> **Note:** Render free tier sleeps after 15 min of inactivity. Use [cron-job.org](https://cron-job.org) to ping `/api/admin/metrics` every 14 minutes to keep it warm.

### 4. Frontend — Vercel
1. Create a **New Project** pointing to this repo.
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL` → `https://your-render-app.onrender.com/api`

---

## ⛔ Production Upgrade Path

| Upgrade | Reason |
|---|---|
| Dedicated Worker Nodes | Move BullMQ workers to a separate `worker.js` deployed as a Render Background Worker |
| Paid Redis | Move from Upstash serverless to AWS ElastiCache for higher-throughput locking |
| MongoDB Sharding | Shard on `userId` for high-volume analytics and logging queries |
| Horizontal Scaling | Stateless Express API behind a load balancer; workers scale independently |
