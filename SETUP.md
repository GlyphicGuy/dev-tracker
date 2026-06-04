# DevTracker — Setup & Deployment Guide

## 📋 Prerequisites

- Node.js 20+ installed
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- A GitHub repository

---

## 1. Supabase Project Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization, set a project name (e.g., `dev-tracker`), and set a database password
4. Select a region close to your users
5. Click **"Create new project"** and wait for it to initialize

### 1.2 Run the Database Schema SQL
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Paste the following SQL and click **"Run"**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE developer_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'on_leave');

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developers table
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT,
  tech_stack TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  start_date DATE,
  status developer_status DEFAULT 'active',
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance logs table
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  work_summary TEXT,
  hours_logged DECIMAL(4,2),
  logged_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(developer_id, date)
);

-- Indexes for performance
CREATE INDEX idx_attendance_date ON attendance_logs(date);
CREATE INDEX idx_attendance_developer ON attendance_logs(developer_id);
CREATE INDEX idx_developers_company ON developers(company_id);
CREATE INDEX idx_developers_status ON developers(status);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can do everything
CREATE POLICY "Authenticated users can read companies"
  ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert companies"
  ON companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete companies"
  ON companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read developers"
  ON developers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert developers"
  ON developers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update developers"
  ON developers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete developers"
  ON developers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read attendance"
  ON attendance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert attendance"
  ON attendance_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update attendance"
  ON attendance_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete attendance"
  ON attendance_logs FOR DELETE TO authenticated USING (true);
```

### 1.3 Create the Admin User
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter your admin email and a strong password
4. Check **"Auto Confirm User"** (so you don't need email verification)
5. Click **"Create User"**

### 1.4 Get Your API Keys
1. Go to **Settings** → **API**
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy the **anon/public** key (under "Project API keys")

---

## 2. Local Development Setup

### 2.1 Clone and Install
```bash
git clone <your-repo-url>
cd dev-tracker
npm install
```

### 2.2 Configure Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Sign in with the admin credentials you created in Supabase.

---

## 3. Deploy to Vercel

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Initial commit - DevTracker"
git push origin main
```

### 3.2 Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** and select your GitHub repo
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `dev-tracker` (if it's in a subdirectory)
5. Add **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **"Deploy"**

### 3.3 Done!
Your app will be live at `https://your-project.vercel.app`.

---

## 4. Project Structure

```
dev-tracker/
├── middleware.ts              # Auth route protection
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (dark mode, fonts, toaster)
│   │   ├── globals.css        # Tailwind theme
│   │   ├── page.tsx           # Redirects to /dashboard
│   │   ├── login/page.tsx     # Login page
│   │   ├── auth/callback/     # Auth callback handler
│   │   └── (dashboard)/       # Protected route group
│   │       ├── layout.tsx     # Sidebar + header layout
│   │       ├── dashboard/     # Dashboard with stats
│   │       ├── developers/    # Developer list + profiles
│   │       ├── companies/     # Company list + details
│   │       └── attendance/    # Attendance log + filters
│   ├── actions/               # Server actions (CRUD)
│   ├── components/            # Shared components + shadcn/ui
│   └── lib/                   # Supabase clients, types, utils
```

---

## 5. Features Overview

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats cards, today's attendance with quick-mark, recent activity |
| **Developers** | CRUD with company/status filters, profile pages with monthly stats |
| **Companies** | CRUD with assigned developer lists |
| **Attendance** | Full log with date/developer/company/status filters, CSV export |
| **Auth** | Email/password login, middleware-protected routes |
| **Dark Mode** | Professional dark theme throughout |
| **Mobile** | Responsive sidebar collapses to hamburger menu |
| **Notifications** | Toast messages for all success/error actions |
| **Empty States** | Helpful copy when no data exists |
