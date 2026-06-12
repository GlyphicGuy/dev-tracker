import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CompanyPortalShell } from "./company-portal-shell";

export default async function CompanyPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role guard: only company users can access /company routes
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company" && profile?.role !== "admin") {
    redirect("/");
  }

  return <CompanyPortalShell>{children}</CompanyPortalShell>;
}
