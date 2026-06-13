"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types";

export async function getDevelopers(filters?: {
  company_id?: string;
  status?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("developers")
    .select("*, companies(name)")
    .order("full_name");

  if (filters?.company_id) {
    query = query.eq("company_id", filters.company_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getDeveloper(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("developers")
    .select("*, companies(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDeveloper(formData: FormData) {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const role = (formData.get("role") as string) || null;
  const tech_stack = (formData.get("tech_stack") as string) || null;
  const company_id = (formData.get("company_id") as string) || null;
  const start_date = (formData.get("start_date") as string) || null;
  const status = (formData.get("status") as string) || "active";
  const notes = (formData.get("notes") as string) || null;
  const github_url = (formData.get("github_url") as string) || null;
  const linkedin_url = (formData.get("linkedin_url") as string) || null;
  const portfolio_url = (formData.get("portfolio_url") as string) || null;
  const deal_amount = formData.get("deal_amount")
    ? parseFloat(formData.get("deal_amount") as string)
    : null;

  if (!full_name) {
    return { error: "Full name is required" };
  }

  // ── Create login account if credentials provided ─────────────────
  const login_email = (formData.get("login_email") as string) || null;
  const login_password = (formData.get("login_password") as string) || null;
  let auth_user_id: string | null = null;

  if (login_email && login_password) {
    if (login_password.length < 6) {
      return { error: "Login password must be at least 6 characters" };
    }
    const result = await createPortalAccount(login_email, login_password, "developer");
    if (result.error) return { error: result.error };
    auth_user_id = result.userId!;
  }

  const { error } = await supabase.from("developers").insert({
    full_name,
    email,
    phone,
    role,
    tech_stack,
    company_id: company_id || null,
    start_date,
    status,
    notes,
    github_url,
    linkedin_url,
    portfolio_url,
    deal_amount,
    auth_user_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/developers");
  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateDeveloper(id: string, formData: FormData) {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const role = (formData.get("role") as string) || null;
  const tech_stack = (formData.get("tech_stack") as string) || null;
  const company_id = (formData.get("company_id") as string) || null;
  const start_date = (formData.get("start_date") as string) || null;
  const status = (formData.get("status") as string) || "active";
  const notes = (formData.get("notes") as string) || null;
  const github_url = (formData.get("github_url") as string) || null;
  const linkedin_url = (formData.get("linkedin_url") as string) || null;
  const portfolio_url = (formData.get("portfolio_url") as string) || null;
  const deal_amount = formData.get("deal_amount")
    ? parseFloat(formData.get("deal_amount") as string)
    : null;

  if (!full_name) {
    return { error: "Full name is required" };
  }

  // ── Create login account if credentials provided and not yet linked ──
  const login_email = (formData.get("login_email") as string) || null;
  const login_password = (formData.get("login_password") as string) || null;
  let auth_user_id: string | null = null;

  if (login_email && login_password) {
    // Check if developer already has an auth account
    const { data: existing } = await supabase
      .from("developers")
      .select("auth_user_id")
      .eq("id", id)
      .single();

    if (existing?.auth_user_id) {
      return { error: "This developer already has a login account" };
    }

    if (login_password.length < 6) {
      return { error: "Login password must be at least 6 characters" };
    }
    const result = await createPortalAccount(login_email, login_password, "developer");
    if (result.error) return { error: result.error };
    auth_user_id = result.userId!;
  }

  const updateData: Record<string, unknown> = {
    full_name,
    email,
    phone,
    role,
    tech_stack,
    company_id: company_id || null,
    start_date,
    status,
    notes,
    github_url,
    linkedin_url,
    portfolio_url,
    deal_amount,
  };

  if (auth_user_id) {
    updateData.auth_user_id = auth_user_id;
  }

  const { error } = await supabase
    .from("developers")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/developers");
  revalidatePath(`/developers/${id}`);
  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDeveloper(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("developers").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/developers");
  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Creates a Supabase auth user + profile row for portal access.
 * Used by both developer and company creation flows.
 */
export async function createPortalAccount(
  email: string,
  password: string,
  role: UserRole
): Promise<{ userId?: string; error?: string }> {
  const admin = createAdminClient();

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
      return { error: `An account with email ${email} already exists` };
    }
    return { error: `Failed to create login: ${authError.message}` };
  }

  const userId = authData.user.id;

  // Create profile row
  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: userId, role, display_name: email });

  if (profileError) {
    // Clean up: delete the auth user we just created
    await admin.auth.admin.deleteUser(userId);
    return { error: `Failed to create profile: ${profileError.message}` };
  }

  return { userId };
}
