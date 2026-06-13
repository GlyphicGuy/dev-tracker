"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.warn("[auth-helpers] profiles query failed:", error.message, "for user:", user.id);
  }

  return profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    throw new Error("Not authenticated");
  }
  if (profile.role !== role && profile.role !== "admin") {
    throw new Error(`Forbidden: requires ${role} role`);
  }
  return profile;
}

export async function getDeveloperForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("developers")
    .select("*, companies(name)")
    .eq("auth_user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[auth-helpers] getDeveloperForCurrentUser failed:", error.message, "for user:", user.id);
  }

  return data;
}

export async function getCompanyForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[auth-helpers] getCompanyForCurrentUser failed:", error.message, "for user:", user.id);
  }

  return data;
}
