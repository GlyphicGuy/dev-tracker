"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { todayDateString } from "@/lib/utils";

export async function logAttendance(formData: FormData) {
  const supabase = await createClient();

  const developer_id = formData.get("developer_id") as string;
  const date = formData.get("date") as string;
  const status = formData.get("status") as string;
  const check_in_time = (formData.get("check_in_time") as string) || null;
  const check_out_time = (formData.get("check_out_time") as string) || null;
  const work_summary = (formData.get("work_summary") as string) || null;
  const hours_logged = formData.get("hours_logged")
    ? parseFloat(formData.get("hours_logged") as string)
    : null;
  const logged_by = (formData.get("logged_by") as string) || "Admin";

  if (!developer_id || !date || !status) {
    return { error: "Developer, date, and status are required" };
  }

  // Upsert: update if exists for same developer+date, insert otherwise
  const { error } = await supabase
    .from("attendance_logs")
    .upsert(
      {
        developer_id,
        date,
        status,
        check_in_time,
        check_out_time,
        work_summary,
        hours_logged,
        logged_by,
      },
      { onConflict: "developer_id,date" }
    );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath(`/developers/${developer_id}`);
  return { success: true };
}

export async function quickMarkAttendance(
  developerId: string,
  status: string
) {
  const supabase = await createClient();
  const today = todayDateString();

  const { error } = await supabase
    .from("attendance_logs")
    .upsert(
      {
        developer_id: developerId,
        date: today,
        status,
        logged_by: "Admin",
      },
      { onConflict: "developer_id,date" }
    );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath(`/developers/${developerId}`);
  return { success: true };
}

export async function getTodayAttendance() {
  const supabase = await createClient();
  const today = todayDateString();

  // Get all active developers with today's attendance if it exists
  const { data: developers, error: devError } = await supabase
    .from("developers")
    .select("id, full_name, role, status, company_id, companies(name)")
    .eq("status", "active")
    .order("full_name");

  if (devError) throw devError;

  const { data: todayLogs, error: logError } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("date", today);

  if (logError) throw logError;

  const logMap = new Map(
    (todayLogs || []).map((log) => [log.developer_id, log])
  );

  return (developers || []).map((dev) => ({
    ...dev,
    todayLog: logMap.get(dev.id) || null,
  }));
}

export async function getRecentActivity(limit: number = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendance_logs")
    .select("*, developers(full_name, companies(name))")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const today = todayDateString();

  const [devResult, companyResult, todayResult] = await Promise.all([
    supabase
      .from("developers")
      .select("id", { count: "exact" })
      .eq("status", "active"),
    supabase.from("companies").select("id", { count: "exact" }),
    supabase.from("attendance_logs").select("status").eq("date", today),
  ]);

  const totalActiveDevelopers = devResult.count || 0;
  const totalCompanies = companyResult.count || 0;
  const todayLogs = todayResult.data || [];

  const presentToday = todayLogs.filter(
    (l) => l.status === "present" || l.status === "half_day"
  ).length;
  const absentToday = todayLogs.filter((l) => l.status === "absent").length;

  return {
    totalActiveDevelopers,
    totalCompanies,
    presentToday,
    absentToday,
  };
}

export async function getDeveloperAttendance(
  developerId: string,
  page: number = 1,
  limit: number = 20
) {
  const supabase = await createClient();
  const start = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("attendance_logs")
    .select("*", { count: "exact" })
    .eq("developer_id", developerId)
    .order("date", { ascending: false })
    .range(start, start + limit - 1);

  if (error) throw error;

  return {
    logs: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getMonthlyStats(
  developerId: string,
  year: number,
  month: number
) {
  const supabase = await createClient();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("attendance_logs")
    .select("status, hours_logged")
    .eq("developer_id", developerId)
    .gte("date", startDate)
    .lt("date", endDate);

  if (error) throw error;

  const logs = data || [];
  return {
    present: logs.filter((l) => l.status === "present").length,
    absent: logs.filter((l) => l.status === "absent").length,
    half_day: logs.filter((l) => l.status === "half_day").length,
    on_leave: logs.filter((l) => l.status === "on_leave").length,
    total_days: logs.length,
    total_hours: logs.reduce((sum, l) => sum + (l.hours_logged || 0), 0),
  };
}

export async function getAttendanceLogs(filters?: {
  developer_id?: string;
  company_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const start = (page - 1) * limit;

  let query = supabase
    .from("attendance_logs")
    .select("*, developers(full_name, company_id, companies(name))", {
      count: "exact",
    })
    .order("date", { ascending: false })
    .range(start, start + limit - 1);

  if (filters?.developer_id) {
    query = query.eq("developer_id", filters.developer_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.start_date) {
    query = query.gte("date", filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte("date", filters.end_date);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  let results = data || [];

  // Client-side filter by company_id since it's a joined field
  if (filters?.company_id) {
    results = results.filter(
      (log) => log.developers?.company_id === filters.company_id
    );
  }

  return {
    logs: results,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}
