export type DeveloperStatus = "active" | "inactive" | "on_leave";
export type AttendanceStatus = "present" | "absent" | "half_day" | "on_leave";

export interface Company {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  industry: string | null;
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
  notes: string | null;
  created_at: string;
  // Joined fields
  company?: Company | null;
  companies?: { name: string } | null;
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
}
