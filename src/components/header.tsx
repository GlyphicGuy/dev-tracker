"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { logout } from "@/actions/auth";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Developers", href: "/developers", icon: Users },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Attendance Log", href: "/attendance", icon: CalendarCheck },
];

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-detect page title from pathname
  const title =
    pageTitle ||
    navItems.find(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/")
    )?.title ||
    "DevTracker";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          }
        />
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center gap-3 px-4 border-b border-border/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">
                DevTracker
              </span>
              <span className="text-[10px] text-muted-foreground">
                Workforce Manager
              </span>
            </div>
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-3 pb-4 space-y-2">
            <Separator className="opacity-50" />
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  );
}
