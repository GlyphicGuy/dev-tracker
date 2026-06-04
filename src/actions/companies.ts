"use server";

import { createClient } from "@/lib/supabase/server";
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
  const industry = (formData.get("industry") as string) || null;

  if (!name) {
    return { error: "Company name is required" };
  }

  const { error } = await supabase.from("companies").insert({
    name,
    contact_person,
    contact_email,
    industry,
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
  const industry = (formData.get("industry") as string) || null;

  if (!name) {
    return { error: "Company name is required" };
  }

  const { error } = await supabase
    .from("companies")
    .update({ name, contact_person, contact_email, industry })
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
