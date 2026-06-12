-- Migration: Portal Architecture — Developer & Company Portals
-- Run this in Supabase SQL Editor

-- 1. Profiles table to map auth users to roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'developer', 'company')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Link developers to their auth accounts
ALTER TABLE developers ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- 3. Link companies to their auth accounts
ALTER TABLE companies ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- 4. Work sessions table (timer-based work tracking)
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  work_description TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'submitted', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(developer_id, date)
);

-- 5. Add approval_status to attendance_logs for backward compatibility
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES work_sessions(id);

-- 6. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins full access profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. RLS Policies for work_sessions
CREATE POLICY "Developers can manage own sessions" ON work_sessions
  FOR ALL USING (
    developer_id IN (SELECT id FROM developers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Companies can view their dev sessions" ON work_sessions
  FOR SELECT USING (
    developer_id IN (
      SELECT d.id FROM developers d
      JOIN companies c ON d.company_id = c.id
      WHERE c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can review their dev sessions" ON work_sessions
  FOR UPDATE USING (
    developer_id IN (
      SELECT d.id FROM developers d
      JOIN companies c ON d.company_id = c.id
      WHERE c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins full access work_sessions" ON work_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
