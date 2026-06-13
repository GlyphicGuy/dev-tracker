"use server";

import { createClient } from "@/lib/supabase/server";
import { createPortalAccount } from "@/actions/developers";
import { revalidatePath } from "next/cache";

export async function getCompanies() {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from("companies")
    .select("*, developers(id)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (companies || []).map((c) => ({
    ...c,
    developer_count: c.developers?.length || 0,
    developers: undefined,
  }));
}

export async function getCompany(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getCompanyWithDevelopers(id: string) {
  const supabase = await createClient();

  const [companyResult, developersResult] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase
      .from("developers")
      .select("*")
      .eq("company_id", id)
      .order("full_name"),
  ]);

  if (companyResult.error) throw companyResult.error;

  return {
    company: companyResult.data,
    developers: developersResult.data || [],
  };
}

export async function createCompany(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const contact_person = (formData.get("contact_person") as string) || null;
  const contact_email = (formData.get("contact_email") as string) || null;
  const contact_phone = (formData.get("contact_phone") as string) || null;
  const website_url = (formData.get("website_url") as string) || null;
  const industry = (formData.get("industry") as string) || null;

  if (!name) {
    return { error: "Company/Client name is required" };
  }

  // ── Create login account if credentials provided ─────────────────
  const login_email = (formData.get("login_email") as string) || null;
  const login_password = (formData.get("login_password") as string) || null;
  let auth_user_id: string | null = null;

  if (login_email && login_password) {
    if (login_password.length < 6) {
      return { error: "Login password must be at least 6 characters" };
    }
    const result = await createPortalAccount(login_email, login_password, "company");
    if (result.error) return { error: result.error };
    auth_user_id = result.userId!;
  }

  const { error } = await supabase.from("companies").insert({
    name,
    contact_person,
    contact_email,
    contact_phone,
    website_url,
    industry,
    auth_user_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const contact_person = (formData.get("contact_person") as string) || null;
  const contact_email = (formData.get("contact_email") as string) || null;
  const contact_phone = (formData.get("contact_phone") as string) || null;
  const website_url = (formData.get("website_url") as string) || null;
  const industry = (formData.get("industry") as string) || null;

  if (!name) {
    return { error: "Company/Client name is required" };
  }

  // ── Create login account if credentials provided and not yet linked ──
  const login_email = (formData.get("login_email") as string) || null;
  const login_password = (formData.get("login_password") as string) || null;
  let auth_user_id: string | null = null;

  if (login_email && login_password) {
    const { data: existing } = await supabase
      .from("companies")
      .select("auth_user_id")
      .eq("id", id)
      .single();

    if (existing?.auth_user_id) {
      return { error: "This company already has a login account" };
    }

    if (login_password.length < 6) {
      return { error: "Login password must be at least 6 characters" };
    }
    const result = await createPortalAccount(login_email, login_password, "company");
    if (result.error) return { error: result.error };
    auth_user_id = result.userId!;
  }

  const updateData: Record<string, unknown> = {
    name, contact_person, contact_email, contact_phone, website_url, industry,
  };

  if (auth_user_id) {
    updateData.auth_user_id = auth_user_id;
  }

  const { error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  revalidatePath("/developers");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCompany(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { success: true };
}
