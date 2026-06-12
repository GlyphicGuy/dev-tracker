import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DevPortalShell } from "./dev-portal-shell";

export default async function DevPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role guard: only developers can access /dev routes
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

  if (profile?.role !== "developer" && profile?.role !== "admin") {
    redirect("/");
  }

  return <DevPortalShell>{children}</DevPortalShell>;
}
