"use server";

import { createClient } from "@/lib/supabase/server";
import { getCompanyForCurrentUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function getPendingReviews() {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) return [];

  const { data, error } = await supabase
    .from("work_sessions")
    .select("*, developers(full_name, role, companies(name))")
    .eq("status", "submitted")
    .in(
      "developer_id",
      (
        await supabase
          .from("developers")
          .select("id")
          .eq("company_id", company.id)
      ).data?.map((d) => d.id) || []
    )
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function approveAllPendingForDay(date: string) {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) return { error: "Company not found" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not found" };

  // Get all pending sessions for the company on this date
  const devIds =
    (
      await supabase
        .from("developers")
        .select("id")
        .eq("company_id", company.id)
    ).data?.map((d) => d.id) || [];

  if (devIds.length === 0) return { error: "No developers found" };

  const { data: pendingSessions, error: fetchError } = await supabase
    .from("work_sessions")
    .select("id, developer_id, date")
    .eq("status", "submitted")
    .eq("date", date)
    .in("developer_id", devIds);

  if (fetchError) return { error: fetchError.message };

  if (!pendingSessions || pendingSessions.length === 0) {
    return { success: true, count: 0, message: "No pending sessions for this date" };
  }

  const now = new Date().toISOString();

  // Approve all pending sessions
  const { error: updateError } = await supabase
    .from("work_sessions")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: now,
      review_notes: null,
    })
    .eq("status", "submitted")
    .eq("date", date)
    .in("developer_id", devIds);

  if (updateError) return { error: updateError.message };

  // Update attendance logs for all approved sessions
  for (const session of pendingSessions) {
    await supabase
      .from("attendance_logs")
      .update({ approval_status: "approved" })
      .eq("developer_id", session.developer_id)
      .eq("date", session.date);
  }

  revalidatePath("/company");
  revalidatePath("/company/reviews");
  revalidatePath("/company/developers");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/dev");

  return { 
    success: true, 
    count: pendingSessions.length,
    message: `Approved ${pendingSessions.length} session(s)` 
  };
}

export async function approveAllPending() {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) return { error: "Company not found" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not found" };

  // Get all developers in the company
  const devIds =
    (
      await supabase
        .from("developers")
        .select("id")
        .eq("company_id", company.id)
    ).data?.map((d) => d.id) || [];

  if (devIds.length === 0) return { error: "No developers found" };

  // Get all pending sessions for the company (all dates)
  const { data: pendingSessions, error: fetchError } = await supabase
    .from("work_sessions")
    .select("id, developer_id, date")
    .eq("status", "submitted")
    .in("developer_id", devIds);

  if (fetchError) return { error: fetchError.message };

  if (!pendingSessions || pendingSessions.length === 0) {
    return { success: true, count: 0, message: "No pending sessions to approve" };
  }

  const now = new Date().toISOString();

  // Approve all pending sessions
  const { error: updateError } = await supabase
    .from("work_sessions")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: now,
      review_notes: null,
    })
    .eq("status", "submitted")
    .in("developer_id", devIds);

  if (updateError) return { error: updateError.message };

  // Update attendance logs for all approved sessions
  for (const session of pendingSessions) {
    await supabase
      .from("attendance_logs")
      .update({ approval_status: "approved" })
      .eq("developer_id", session.developer_id)
      .eq("date", session.date);
  }

  revalidatePath("/company");
  revalidatePath("/company/reviews");
  revalidatePath("/company/developers");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/dev");

  return { 
    success: true, 
    count: pendingSessions.length,
    message: `Approved ${pendingSessions.length} session(s)` 
  };
}

export async function getCompanyDashboardStats() {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) {
    return {
      totalDevs: 0,
      pendingReviews: 0,
      approvedToday: 0,
      totalApproved: 0,
    };
  }

  const devIds =
    (
      await supabase
        .from("developers")
        .select("id")
        .eq("company_id", company.id)
    ).data?.map((d) => d.id) || [];

  if (devIds.length === 0) {
    return {
      totalDevs: 0,
      pendingReviews: 0,
      approvedToday: 0,
      totalApproved: 0,
    };
  }

  const today = new Date().toISOString().split("T")[0];

  const [pendingResult, approvedTodayResult, totalApprovedResult] =
    await Promise.all([
      supabase
        .from("work_sessions")
        .select("id", { count: "exact" })
        .eq("status", "submitted")
        .in("developer_id", devIds),
      supabase
        .from("work_sessions")
        .select("id", { count: "exact" })
        .eq("status", "approved")
        .eq("date", today)
        .in("developer_id", devIds),
      supabase
        .from("work_sessions")
        .select("id", { count: "exact" })
        .eq("status", "approved")
        .in("developer_id", devIds),
    ]);

  return {
    totalDevs: devIds.length,
    pendingReviews: pendingResult.count || 0,
    approvedToday: approvedTodayResult.count || 0,
    totalApproved: totalApprovedResult.count || 0,
  };
}

export async function approveSession(sessionId: string, notes?: string) {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) return { error: "Company not found" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Update work session
  const { error: sessionError } = await supabase
    .from("work_sessions")
    .update({
      status: "approved",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq("id", sessionId);

  if (sessionError) return { error: sessionError.message };

  // Also update the attendance log
  const { data: session } = await supabase
    .from("work_sessions")
    .select("developer_id, date")
    .eq("id", sessionId)
    .single();

  if (session) {
    await supabase
      .from("attendance_logs")
      .update({ approval_status: "approved" })
      .eq("developer_id", session.developer_id)
      .eq("date", session.date);
  }

  revalidatePath("/company");
  revalidatePath("/company/reviews");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/dev");
  return { success: true };
}

export async function rejectSession(sessionId: string, notes: string) {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) return { error: "Company not found" };

  if (!notes.trim()) {
    return { error: "Please provide a reason for rejection" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: sessionError } = await supabase
    .from("work_sessions")
    .update({
      status: "rejected",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes.trim(),
    })
    .eq("id", sessionId);

  if (sessionError) return { error: sessionError.message };

  // Also update attendance log
  const { data: session } = await supabase
    .from("work_sessions")
    .select("developer_id, date")
    .eq("id", sessionId)
    .single();

  if (session) {
    await supabase
      .from("attendance_logs")
      .update({ approval_status: "rejected" })
      .eq("developer_id", session.developer_id)
      .eq("date", session.date);
  }

  revalidatePath("/company");
  revalidatePath("/company/reviews");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/dev");
  return { success: true };
}

export async function getReviewHistory(limit: number = 20) {
  const supabase = await createClient();
  const company = await getCompanyForCurrentUser();

  if (!company) return [];

  const devIds =
    (
      await supabase
        .from("developers")
        .select("id")
        .eq("company_id", company.id)
    ).data?.map((d) => d.id) || [];

  if (devIds.length === 0) return [];

  const { data, error } = await supabase
    .from("work_sessions")
    .select("*, developers(full_name, role)")
    .in("status", ["approved", "rejected"])
    .in("developer_id", devIds)
    .order("reviewed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
