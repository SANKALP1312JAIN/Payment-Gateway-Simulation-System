# Payment Gateway Simulation System

A resilient, production-grade payment orchestrator simulation designed specifically for free-tier deployments. This system emulates real-world payment gateway behaviors (success scenarios, timeouts, hard failures, and webhook dispatching) while strictly enforcing state transitions and idempotency.

## 🚀 Architecture Highlights

To satisfy the constraint of strictly relying on free-tier services without requiring a separate 24/7 background worker, the entire architecture runs within a monolithic Express process.

- **Unified Process:** The BullMQ workers are initialized inside `server.js` alongside the Express API.
- **Idempotent Retries:** By leveraging Redis locks (`SET key NX PX`) and creating a unique index on `idempotencyKey` in MongoDB, duplicate requests are prevented.
- **State Machine Validator:** All payment state transitions (`CREATED -> PROCESSING -> SUCCESS/FAILED`) are guarded by an atomic update `findOneAndUpdate` constraint.
- **BullMQ Orchestration:** We rely strictly on BullMQ's native `attempts` and `backoff` options for retrying transactions without maintaining an in-memory or polling queue logic. When a process sleeps (e.g., Render free-tier cold starts), the remaining jobs in the Redis queue are gracefully resumed without data loss.

## 📦 Tech Stack (Free-Tier Friendly)
- **Node.js + Express** (Backend)
- **MongoDB Atlas** (Primary Database & State Store)
- **Redis via Upstash** (Message queue for BullMQ + Lightweight Locking)
- **React + Vite + TailwindCSS** (Frontend Dashboard)

## 🏁 How to Run Locally

### 1. Prerequisites
- Node.js v18+
- Local Redis running on port 6379 (or supply `REDIS_HOST` env var)
- MongoDB running locally (or Atlas connection string in `MONGO_URI`)

### 2. Start the Backend
```bash
cd backend
npm install
npm run start
# Server and Workers will start on http://localhost:5000
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
# Simulates 2000 transactions and tests concurrent handling.
```

---

## ☁️ Deployment Guide (Free Tiers)

### 1. Database (MongoDB Atlas Free Tier)
1. Sign up for MongoDB Atlas.
2. Create an **M0 Free Cluster**.
3. Under Database Access, create a user and whitelist `0.0.0.0/0` (for Render access).
4. Get your connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/payment_gateway?retryWrites=true&w=majority`).

### 2. Redis (Upstash Free Tier)
1. Sign up at [Upstash](https://upstash.com).
2. Create a Free Redis Database.
3. Copy the `REDIS_URL` or Host/Port/Password parameters.
   - For backend initialization, you need `REDIS_HOST` and potentially `REDIS_PORT` and `REDIS_PASSWORD` if connecting using the default ioredis configuration `let redis = new Redis({ host: process.env.REDIS_HOST, ... })`. You can adjust `backend/config/redis.js` to accept a full URL connection string directly (`new Redis(process.env.REDIS_URI)`).

### 3. Backend (Render Free Tier)
1. Push this repository to GitHub.
2. Sign up on [Render](https://render.com).
3. Create a **New Web Service**.
4. Set the Root Directory to `backend`.
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Set the Environment Variables:
   - `MONGO_URI`: (From Step 1)
   - `REDIS_URI`: (From Step 2, modify local code to use `REDIS_URI`)
8. Deploy!
**Note on limitations:** Render's free tier spins down after 15 minutes of inactivity (Cold Starts). Since our BullMQ queue persists jobs in Upstash Redis, no pending payments are lost when it wakes up. Any processing delays will happen simply because the queue is waiting for the worker process to awake.

### 4. Frontend (Vercel Free Tier)
1. Sign up on [Vercel](https://vercel.com).
2. Create a **New Project** and select this GitHub repository.
3. Set the Root Directory to `frontend`.
4. Add the Environment Variable:
   - `VITE_API_URL`: `https://your-render-app.onrender.com/api`
5. Deploy!

## ⛔ Production Upgrade Recommendations
For a mission-critical scale-up, these are the recommended immediate upgrades:
1. **Dedicated Worker Nodes:** Move `require('./queue/paymentWorker')` into a distinct `worker.js` file and deploy as a Render Background Worker so the API isn't competing for CPU with queue processing.
2. **Paid Redis:** Move away from serverless connection limitations on Upstash to an AWS ElastiCache / Redis Enterprise for high-throughput locking execution without connection ceilings.
3. **Database Sharding:** Shard MongoDB on `userId` to handle explosive analytics tracking and logging queries.
