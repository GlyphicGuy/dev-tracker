"use server";

import { createClient } from "@/lib/supabase/server";
import { getDeveloperForCurrentUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { todayDateString } from "@/lib/utils";

export async function startSession() {
  const supabase = await createClient();
  const developer = await getDeveloperForCurrentUser();

  if (!developer) {
    return { error: "Developer profile not found" };
  }

  // Check if there's already a session today
  const today = todayDateString();
  const { data: existing } = await supabase
    .from("work_sessions")
    .select("id, status")
    .eq("developer_id", developer.id)
    .eq("date", today)
    .single();

  if (existing) {
    if (existing.status === "running") {
      return { error: "You already have a running session today" };
    }
    if (existing.status === "submitted" || existing.status === "approved") {
      return { error: "You have already submitted your work for today" };
    }
  }

  const now = new Date().toISOString();

  if (existing) {
    // Resume: update the existing stopped/rejected session
    const { error } = await supabase
      .from("work_sessions")
      .update({
        start_time: now,
        end_time: null,
        duration_minutes: null,
        status: "running",
        work_description: null,
        review_notes: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    // Create new session
    const { error } = await supabase.from("work_sessions").insert({
      developer_id: developer.id,
      date: today,
      start_time: now,
      status: "running",
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/dev");
  return { success: true };
}

export async function stopSession() {
  const supabase = await createClient();
  const developer = await getDeveloperForCurrentUser();

  if (!developer) {
    return { error: "Developer profile not found" };
  }

  const today = todayDateString();
  const { data: session } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("developer_id", developer.id)
    .eq("date", today)
    .eq("status", "running")
    .single();

  if (!session) {
    return { error: "No running session found" };
  }

  const now = new Date();
  const startTime = new Date(session.start_time);
  const durationMinutes = Math.round(
    (now.getTime() - startTime.getTime()) / 60000
  );

  const { error } = await supabase
    .from("work_sessions")
    .update({
      end_time: now.toISOString(),
      duration_minutes: durationMinutes,
      status: "stopped",
    })
    .eq("id", session.id);

  if (error) return { error: error.message };

  revalidatePath("/dev");
  return { success: true };
}

export async function submitSession(description: string) {
  const supabase = await createClient();
  const developer = await getDeveloperForCurrentUser();

  if (!developer) {
    return { error: "Developer profile not found" };
  }

  if (!description.trim()) {
    return { error: "Work description is required" };
  }

  const today = todayDateString();
  const { data: session } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("developer_id", developer.id)
    .eq("date", today)
    .eq("status", "stopped")
    .single();

  if (!session) {
    return { error: "No stopped session found. Please stop the timer first." };
  }

  const hoursLogged = session.duration_minutes
    ? Math.round((session.duration_minutes / 60) * 10) / 10
    : 0;

  // Update session to submitted
  const { error: sessionError } = await supabase
    .from("work_sessions")
    .update({
      work_description: description.trim(),
      status: "submitted",
    })
    .eq("id", session.id);

  if (sessionError) return { error: sessionError.message };

  // Also create/update the attendance log
  const { error: attendanceError } = await supabase
    .from("attendance_logs")
    .upsert(
      {
        developer_id: developer.id,
        date: today,
        status: "present",
        check_in_time: new Date(session.start_time).toLocaleTimeString(
          "en-GB",
          { hour: "2-digit", minute: "2-digit" }
        ),
        check_out_time: session.end_time
          ? new Date(session.end_time).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        work_summary: description.trim(),
        hours_logged: hoursLogged,
        logged_by: developer.full_name,
        approval_status: "pending",
        session_id: session.id,
      },
      { onConflict: "developer_id,date" }
    );

  if (attendanceError) return { error: attendanceError.message };

  revalidatePath("/dev");
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/company");
  return { success: true };
}

export async function getMyTodaySession() {
  const supabase = await createClient();
  const developer = await getDeveloperForCurrentUser();

  if (!developer) return null;

  const today = todayDateString();
  const { data } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("developer_id", developer.id)
    .eq("date", today)
    .single();

  return data;
}

export async function getMyRecentSessions(limit: number = 10) {
  const supabase = await createClient();
  const developer = await getDeveloperForCurrentUser();

  if (!developer) return [];

  const { data } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("developer_id", developer.id)
    .order("date", { ascending: false })
    .limit(limit);

  return data || [];
}
