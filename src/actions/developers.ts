"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  if (!full_name) {
    return { error: "Full name is required" };
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

  if (!full_name) {
    return { error: "Full name is required" };
  }

  const { error } = await supabase
    .from("developers")
    .update({
      full_name,
      email,
      phone,
      role,
      tech_stack,
      company_id: company_id || null,
      start_date,
      status,
      notes,
    })
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
