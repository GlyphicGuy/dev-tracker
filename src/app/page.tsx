import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Determine role — try profiles first, fall back to developers/companies tables
  let role = "admin";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role) {
    role = profile.role;
  } else {
    // Fallback: check developers table
    const { data: dev } = await supabase
      .from("developers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (dev) {
      role = "developer";
    } else {
      // Fallback: check companies table
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (company) {
        role = "company";
      }
    }
  }

  if (role === "developer") {
    redirect("/dev");
  } else if (role === "company") {
    redirect("/company");
  } else {
    redirect("/dashboard");
  }
}

