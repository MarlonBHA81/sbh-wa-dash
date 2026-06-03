# SBH Analytics Dashboard

WhatsApp intake-funnel analytics for the City of Cape Town Small Business Helpdesk.

Two authenticated views:
- **Team** — full data, live KPIs, funnel chart, lead table with drawer, heatmap
- **Stakeholder** — aggregate-only view, no PII

---

## Stack

React + Vite + TypeScript · Tailwind CSS · Recharts · React Router v6 · @supabase/supabase-js

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sbh-wa-dash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://jeizxceyuwjjallvoapv.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Get the anon key from Supabase Dashboard → Settings → API.

### 3. Brand assets

Place the following files in `public/brand-assets/`:

```
public/brand-assets/
├── SBH_Primary_logo.jpg        ← circular badge (login screen, favicon)
├── SBH_Secondary_logo.png      ← light-background variant (login screen)
├── SBH_Secondary_logo_white.png ← white variant (dark header)
└── fonts/
    ├── Avenir-Regular.woff2
    ├── Avenir-Regular.woff
    ├── Avenir-Medium.woff2
    └── Avenir-Medium.woff
```

Font names expected match the `@font-face` declarations in `src/index.css`.
Avenir falls back to Nunito Sans / system-ui if files are absent.

### 4. Supabase: run the migration

In Supabase Dashboard → SQL Editor → New query, paste and run the full contents of:

```
supabase/migrations/20240601_rls_and_views.sql
```

This creates:
- RLS policies (team: full read; stakeholder: deny base tables)
- `get_stakeholder_metrics()` SECURITY DEFINER function
- `v_stakeholder_monthly_trend` view

### 5. Assign roles to users

In Supabase Dashboard → Authentication → Users → select a user → Edit:

```json
{ "role": "team" }
```

or

```json
{ "role": "stakeholder" }
```

This sets `app_metadata.role` (server-writable only — not modifiable by the user).

### 6. Seed fake data (optional)

```bash
# Add service-role key to your local .env (never commit this)
echo "SUPABASE_SERVICE_ROLE_KEY=eyJ..." >> .env

npm run seed
```

Inserts ~200 realistic South African conversations + events over the past 90 days.

### 7. Start dev server

```bash
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Vite

For SPA routing, add a `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Architecture

```
src/
├── context/AuthContext.tsx     Session + role state
├── hooks/                      Data-fetching hooks (one per data domain)
├── components/
│   ├── ui/                     Button, Card, KPICard, Spinner, EmptyState, Drawer
│   ├── layout/                 Header, Layout, ProtectedRoute
│   ├── team/                   TeamKPIs, FunnelChart, LeadTable, LeadDrawer,
│   │                           TimeSeriesChart, HeatmapChart
│   └── stakeholder/            StakeholderKPIs, FocusAreaBar, VendorDonut, MonthlyTrend
└── pages/                      Login, TeamDashboard, StakeholderDashboard
```

## Security

- Anon key is safe to expose in client code — it cannot bypass RLS
- Service-role key is only used in `supabase/seed.ts` and must never be committed or bundled
- Stakeholder role: zero access to base tables via RLS; only the `get_stakeholder_metrics()` function and `v_stakeholder_monthly_trend` view (aggregates only)
- Team role: full read on `conversations` and `events`
- Roles are set via `app_metadata` (server-only, immune to JWT spoofing)
