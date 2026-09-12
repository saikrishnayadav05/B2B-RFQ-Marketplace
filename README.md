# B2B RFQ Marketplace

A mini B2B Request for Quotation (RFQ) marketplace where **buyers** post business requirements and **suppliers** discover those requirements and submit quotations.

## Live Demo

| Link | URL |
|------|-----|
| **Live application** | [https://b2-b-rfq-marketplace.vercel.app](https://b2-b-rfq-marketplace.vercel.app) |
| **GitHub repository** | [https://github.com/saikrishnayadav05/B2B-RFQ-Marketplace](https://github.com/saikrishnayadav05/B2B-RFQ-Marketplace) |
| **API health check** | [https://b2b-rfq-marketplace-production.up.railway.app/health](https://b2b-rfq-marketplace-production.up.railway.app/health) |
| **API docs (Swagger)** | [https://b2b-rfq-marketplace-production.up.railway.app/docs](https://b2b-rfq-marketplace-production.up.railway.app/docs) |

## How It Works

```text
Buyer creates RFQ
      ↓
Suppliers browse open RFQs and submit one quote each
      ↓
Buyer reviews all quotations
      ↓
Buyer clicks Finalize on the winning quote
      ↓
RFQ closes · winning supplier sees "Won" · others see "Not selected"
```

### Key business rules

| Rule | Details |
|------|---------|
| Buyer visibility | Each buyer sees **only their own** RFQs |
| Supplier visibility | Suppliers browse **all open** RFQs from all buyers |
| Quotes per RFQ | **One quotation per supplier** per RFQ |
| Accepting a quote | Buyer **Finalize** = award supplier and close RFQ |
| Payment / chat | Not in scope — handled offline after award |

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router |
| Backend | FastAPI, Python 3.11+, Pydantic, SQLAlchemy 2.0 |
| Database | PostgreSQL |
| Auth | JWT + bcrypt password hashing |
| Migrations | Alembic |
| Deployment | Vercel (frontend) + Railway (API) + Neon (PostgreSQL) |

## Architecture

```text
React UI  -->  FastAPI REST API  -->  PostgreSQL
              JWT + RBAC guards
              Routers -> Services -> Repositories
```

### Backend layers

1. **Routers** — HTTP endpoints (`/api/v1/auth`, `/api/v1/rfqs`, `/api/v1/quotations`)
2. **Services** — business rules (ownership checks, RFQ expiry, one quote per supplier)
3. **Repositories** — database access
4. **Models** — SQLAlchemy tables (`users`, `rfqs`, `quotations`)

### Roles

- **Buyer** — create/edit/delete RFQs, view received quotations, finalize a winning quote
- **Supplier** — browse/search/filter RFQs, submit quotations, view submitted quotes

## Features

### Buyer
- Register/login securely (password show/hide toggle)
- Create and manage RFQs (product name, description, quantity, delivery location, deadline)
- Date/time picker with calendar button for deadlines
- View submitted RFQs and quotation counts
- View all quotations received for each RFQ
- **Finalize** a winning quotation (custom confirmation modal)
- See awarded supplier banner after closing an RFQ

### Supplier
- Register/login securely
- Browse open RFQs with search and filters (product, location, deadline)
- Flexible location search (e.g. `hyd`, `hyderabad`, partial matches)
- View full RFQ details
- Submit quotation (price, delivery time, notes)
- View submitted quotations with **Won**, **Pending**, or **Not selected** status

### Cross-cutting
- Input validation (Pydantic backend + form validation frontend)
- Role-based authorization (JWT)
- Loading, empty, and error UI states
- Responsive dark UI

## Project Structure

```text
B2B-RFQ-Marketplace/
├── frontend/          # React + Vite app
├── backend/           # FastAPI app
├── docker-compose.yml # Optional: quick local PostgreSQL via Docker
└── README.md
```

## Free Cloud Database (Recommended for Live Demo)

**Best approach:** use one free cloud PostgreSQL database for **both local development and your live demo**. No Docker, no local PostgreSQL install — and your demo data stays online for reviewers.

```text
Your laptop (local backend)  ──┐
                               ├──>  Free Cloud PostgreSQL  (Neon / Railway / Supabase)
Live demo (Railway backend)  ──┘
```

### Recommended: Neon (free, easy, works everywhere)

1. Go to [https://neon.tech](https://neon.tech) and sign up (free).
2. Create a new project (e.g. `b2b-rfq-marketplace`).
3. Open **Connection details** and copy the **PostgreSQL connection string**.
4. Paste it into `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=change-this-to-a-long-random-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

5. Run migrations once (creates tables in the cloud):

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
```

Your tables now live in the cloud. Local app and live demo can share the same database.

> **Tip:** Neon free tier includes ~0.5 GB storage — more than enough for this assignment.

### Alternative: Railway PostgreSQL (good if deploying backend to Railway)

1. Go to [https://railway.app](https://railway.app) and create a project.
2. Click **+ New** → **Database** → **PostgreSQL**.
3. Open the PostgreSQL service → **Variables** → copy `DATABASE_URL`.
4. Paste into `backend/.env` for local dev, and into Railway backend service variables for deployment.

Railway gives you $5/month free credits — enough for a demo project.

### Alternative: Supabase

1. Go to [https://supabase.com](https://supabase.com) → create a project.
2. Go to **Project Settings** → **Database** → copy the connection string (URI mode).
3. Use it as `DATABASE_URL` in `backend/.env`.

Add `?sslmode=require` if SSL is required.

---

## Local Setup

### Prerequisites

- Node.js 18+
- **Python 3.11 or 3.12** (avoid Python 3.14 for compatibility)
- A **free cloud PostgreSQL** database (see above) — **recommended**
- Docker — **optional** (only if you prefer a local database instead)

> **You do not need Docker** if you use a free cloud database.

### Important local URLs

| What | URL | Notes |
|------|-----|-------|
| **Frontend (open this in browser)** | http://localhost:5173 | Login, RFQs, UI |
| **Backend API** | http://localhost:8000 | JSON API only — not the website |
| **API health check** | http://localhost:8000/health | Should return `{"status":"ok"}` |
| **Swagger docs** | http://localhost:8000/docs | Test API endpoints |

### Step 1: Configure database connection

Copy the example env file and add your cloud `DATABASE_URL`:

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `backend/.env` and set your cloud connection string (Neon/Railway/Supabase).

#### Other database options (optional)

<details>
<summary>Local PostgreSQL (without Docker)</summary>

Install PostgreSQL locally and use:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/rfq_marketplace
```

</details>

<details>
<summary>Docker PostgreSQL (optional)</summary>

```bash
docker compose up -d
```

```env
DATABASE_URL=postgresql://rfq_user:rfq_password@localhost:5432/rfq_marketplace
```

</details>

### Step 2: Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Step 3: Frontend setup

```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm run dev
```

App: http://localhost:5173

### Quick start summary (cloud database, no Docker)

```bash
# 1. Create free DB on Neon → paste DATABASE_URL into backend/.env

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy .env.example .env          # then edit DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Push to GitHub

```bash
cd B2B-RFQ-Marketplace
git add .
git commit -m "B2B RFQ Marketplace initial commit"
git push -u origin main
```

If Git uses the wrong GitHub account on Windows:

```bash
gh auth logout
gh auth login
```

Choose **GitHub.com → HTTPS → Login with a web browser**, then sign in as the repo owner.

## Demo Test Data (optional)

Use password **`Test1234`** for all test accounts (minimum 8 characters).

| Role | Email | Full name |
|------|-------|-----------|
| Buyer | `buyer1@test.com` | Acme Corp Procurement |
| Buyer | `buyer2@test.com` | TechNova Industries |
| Buyer | `buyer3@test.com` | GreenBuild Solutions |
| Supplier | `supplier1@test.com` | Office Furnishings Pvt Ltd |
| Supplier | `supplier2@test.com` | SteelWorks India |
| Supplier | `supplier3@test.com` | CloudTech Supplies |

Register these via the app, then create RFQs as buyers and submit quotes as suppliers.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon/Railway/Supabase). App auto-converts `postgresql://` to `postgresql+psycopg://` |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | Default: `HS256` |
| `JWT_EXPIRE_HOURS` | Token expiry (default: 24) |
| `CORS_ORIGINS` | Comma-separated frontend URLs |

### Frontend (`frontend/.env` locally, Vercel env vars in production)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL for local dev (e.g. `http://localhost:8000`) |
| `API_URL` | Used on **Vercel** — set to your Railway API URL (no trailing slash, no `/api/v1`) |

> **Vercel note:** Set `API_URL` (not `VITE_API_URL`) in the Vercel dashboard. The build maps it into the frontend automatically. Do **not** add a trailing slash.

## API Overview

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### RFQs
- `POST /api/v1/rfqs/` — buyer create
- `GET /api/v1/rfqs/mine` — buyer list
- `GET /api/v1/rfqs/browse` — supplier browse with filters
- `GET /api/v1/rfqs/{id}` — detail
- `PUT /api/v1/rfqs/{id}` — buyer update
- `POST /api/v1/rfqs/{id}/finalize` — buyer awards one quotation and closes RFQ
- `DELETE /api/v1/rfqs/{id}` — buyer delete

### Quotations
- `POST /api/v1/quotations/` — supplier submit
- `GET /api/v1/quotations/mine` — supplier list
- `GET /api/v1/quotations/rfq/{rfq_id}` — buyer view received quotes

## Deployment (Live Demo)

Use the **same cloud `DATABASE_URL`** in Railway that you used locally. Your demo data (users, RFQs, quotes) will already be there.

### Full live demo stack

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend | [Vercel](https://vercel.com) | React app (live URL for submission) |
| Backend API | [Railway](https://railway.app) | FastAPI server |
| Database | Neon / Railway / Supabase | PostgreSQL (same DB as local dev) |

### Step 1: Database (if not done already)

Create a free PostgreSQL on **Neon** (recommended) or add PostgreSQL on **Railway**. Save the `DATABASE_URL`.

### Step 2: Backend (Railway)

1. Push your code to GitHub.
2. Create a Railway project → **Deploy from GitHub repo**.
3. Set the **root directory** to `backend`.
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon/Railway/Supabase connection string |
| `JWT_SECRET` | Long random secret string |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_HOURS` | `24` |
| `CORS_ORIGINS` | `https://b2-b-rfq-marketplace.vercel.app,http://localhost:5173` |

5. Start command (already in `railway.toml`):

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

6. Copy your Railway public URL (production: `https://b2b-rfq-marketplace-production.up.railway.app`).

### Step 3: Frontend (Vercel)

1. Import the GitHub repo on [Vercel](https://vercel.com).
2. Set **root directory** to `frontend`.
3. Add environment variable:

| Variable | Value |
|----------|-------|
| `API_URL` | `https://b2b-rfq-marketplace-production.up.railway.app` (no trailing slash) |

4. Deploy and copy your live URL (production: `https://b2-b-rfq-marketplace.vercel.app`).

### Step 4: Final CORS update

Go back to Railway → backend service → variables → confirm `CORS_ORIGINS` includes your Vercel URL, then redeploy if needed.

Example:

```env
CORS_ORIGINS=https://b2-b-rfq-marketplace.vercel.app,http://localhost:5173
```

The backend also allows any `https://*.vercel.app` origin via regex for preview deployments.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Browser shows `{"detail":"Not Found"}` on port 8000 | You opened the **API**, not the UI. Use http://localhost:5173 |
| Login/register shows **"Not Found"** on live site | Usually a trailing slash on `API_URL` causing `//api/v1` in requests. Remove the trailing slash in Vercel env vars and redeploy |
| **"Cannot reach the API"** when creating RFQs | You may be on **localhost:5173** without the backend running. Use the live Vercel URL, or start backend with `uvicorn app.main:app --reload --port 8000` |
| Login shows "Something went wrong" | Restart backend. Run `alembic upgrade head` (needs migration `002` for finalize) |
| Login shows "Invalid email or password" | Wrong password — register again or use the password from registration |
| My RFQs page error after finalize feature | Run `cd backend && alembic upgrade head` on your Neon database |
| Calendar not opening on deadline field | Click the **calendar icon** on the right, or type date manually |
| Location search returns nothing | Try `hyd` or `hyderabad`. Search also matches partial location text |
| `pip install` fails on Python 3.14 | Install **Python 3.12** and recreate your virtual environment |
| Git push uses wrong GitHub account | Run `gh auth logout` then `gh auth login` with the correct account |

## Assumptions and Limitations

- One user represents one company (no team/org accounts)
- No email verification or password reset
- No file attachments on RFQs
- No real-time notifications (refresh to see updates)
- Single currency (USD) assumed
- RFQs auto-close after deadline when browsing or submitting quotes, unless a buyer awards a quotation first
- Buyer can finalize one quotation while an RFQ is open; this closes the RFQ and marks the winning supplier
- Other supplier quotations are implicitly not selected (shown as "Not selected" in the supplier dashboard)
- No email/notification system — suppliers see the outcome in **My Quotations**
- One quotation per supplier per RFQ

## Testing the Flow

1. Register as a **Buyer** and create an RFQ
2. Register as a **Supplier** (use a different browser/incognito)
3. Browse RFQs, open the RFQ, submit a quotation
4. Log back in as the buyer, open **View Quotes**, and click **Finalize** on the preferred supplier
5. Log in as the supplier and confirm the quote shows **Won** in **My Quotations**

## License

MIT
