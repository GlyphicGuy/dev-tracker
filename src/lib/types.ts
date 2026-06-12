export type DeveloperStatus = "active" | "inactive" | "on_leave";
export type AttendanceStatus = "present" | "absent" | "half_day" | "on_leave";
export type UserRole = "admin" | "developer" | "company";
export type SessionStatus = "running" | "stopped" | "submitted" | "approved" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  industry: string | null;
  auth_user_id: string | null;
  created_at: string;
  developer_count?: number;
}

export interface Developer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  tech_stack: string | null;
  company_id: string | null;
  start_date: string | null;
  status: DeveloperStatus;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  deal_amount: number | null;
  notes: string | null;
  auth_user_id: string | null;
  created_at: string;
  // Joined fields
  company?: Company | null;
  companies?: { name: string } | null;
}

export interface WorkSession {
  id: string;
  developer_id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  work_description: string | null;
  status: SessionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  // Joined fields
  developers?: {
    full_name: string;
    company_id: string | null;
    companies?: { name: string } | null;
  } | null;
}

export interface AttendanceLog {
  id: string;
  developer_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  work_summary: string | null;
  hours_logged: number | null;
  logged_by: string | null;
  approval_status: ApprovalStatus;
  session_id: string | null;
  created_at: string;
  // Joined fields
  developers?: {
    full_name: string;
    company_id: string | null;
    companies?: { name: string } | null;
  } | null;
}

export interface MonthlyStats {
  present: number;
  absent: number;
  half_day: number;
  on_leave: number;
  total_days: number;
  total_hours: number;
}

export interface DashboardStats {
  totalActiveDevelopers: number;
  totalCompanies: number;
  presentToday: number;
  absentToday: number;
  pendingApprovals: number;
}
