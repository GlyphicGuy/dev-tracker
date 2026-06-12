import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

type UserRole = "admin" | "developer" | "company";

/**
 * Determines the user's role with fallback logic.
 * 1. Try the `profiles` table (may fail due to RLS).
 * 2. Fall back to checking `developers.auth_user_id`.
 * 3. Fall back to checking `companies.auth_user_id`.
 * 4. Default to "admin" if nothing matches.
 */
async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole> {
  // Attempt 1: profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role) {
    return profile.role as UserRole;
  }

  if (profileError) {
    console.warn("[middleware] profiles query failed:", profileError.message);
  }

  // Attempt 2: check developers table (no RLS)
  const { data: dev } = await supabase
    .from("developers")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (dev) {
    return "developer";
  }

  // Attempt 3: check companies table (no RLS)
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (company) {
    return "company";
  }

  // Default: admin
  return "admin";
}

// ── Route allowlists per role ──────────────────────────────────────────
// Each role can ONLY access paths starting with these prefixes.
// Everything else is blocked and redirected to the role's home.
const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/attendance", "/developers", "/companies"],
  developer: ["/dev"],
  company: ["/company"],
};

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/dashboard",
  developer: "/dev",
  company: "/company",
};

// Paths that any authenticated user may access (not role-gated)
const PUBLIC_AUTH_PATHS = ["/auth", "/login"];

/**
 * Returns true if the given pathname is allowed for the role.
 */
function isPathAllowed(pathname: string, role: UserRole): boolean {
  // Root "/" is handled by page.tsx (role-based redirect) — allow it through
  if (pathname === "/") return true;

  // Public auth paths are always allowed
  if (PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) return true;

  // Check role-specific allowlist
  const allowed = ROLE_ALLOWED_PREFIXES[role];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not remove this. It refreshes the auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Unauthenticated users: redirect to /login ──────────────────────
  if (
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Authenticated users: enforce role-based access ─────────────────
  if (user) {
    const role = await getUserRole(supabase, user.id);

    // If on /login, redirect to their home portal
    if (pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role];
      return NextResponse.redirect(url);
    }

    // If the path is NOT in this role's allowlist → redirect to home
    if (!isPathAllowed(pathname, role)) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role];
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
