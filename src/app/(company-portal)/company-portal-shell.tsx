"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import {
  Box,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  History,
  Users,
} from "lucide-react";
import NProgress from "nprogress";

const navItems = [
  { title: "Dashboard", href: "/company", icon: LayoutDashboard },
  { title: "Developers", href: "/company/developers", icon: Users },
  { title: "Pending Reviews", href: "/company/reviews", icon: ClipboardCheck },
  { title: "Review History", href: "/company/history", icon: History },
];

export function CompanyPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Box className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">
              BYTEDOCKER
            </span>
            <span className="text-[10px] text-muted-foreground">
              Company Portal
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/company" &&
                pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => NProgress.start()}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden flex items-center gap-1 px-4 py-2 border-b border-border/50 bg-card/30 overflow-x-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/company" &&
              pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => NProgress.start()}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
    </div>
  );
}
