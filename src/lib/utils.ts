import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import type { AttendanceStatus, DeveloperStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatTime(time: string | null): string {
  if (!time) return "—";
  // time is in HH:mm:ss or HH:mm format
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAttendanceStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case "present":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "absent":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    case "half_day":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    case "on_leave":
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  }
}

export function getDeveloperStatusColor(status: DeveloperStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "inactive":
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
    case "on_leave":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    default:
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  }
}

export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case "present":
      return "Present";
    case "absent":
      return "Absent";
    case "half_day":
      return "Half Day";
    case "on_leave":
      return "On Leave";
    default:
      return status;
  }
}

export function getDeveloperStatusLabel(status: DeveloperStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "on_leave":
      return "On Leave";
    default:
      return status;
  }
}

export function todayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
