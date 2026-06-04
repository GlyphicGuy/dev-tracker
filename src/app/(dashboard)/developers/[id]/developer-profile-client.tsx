"use client";

import { useRouter } from "next/navigation";
import { deleteDeveloper } from "@/actions/developers";
import { DeveloperForm } from "@/components/developer-form";
import { AttendanceForm } from "@/components/attendance-form";
import { DeveloperStatusBadge, AttendanceStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Building2,
  Pencil,
  Trash2,
  CalendarPlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coffee,
  FileText,
  Globe,
  DollarSign,
  ExternalLink,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import { toast } from "sonner";
import type { Developer, MonthlyStats, AttendanceLog } from "@/lib/types";

interface AttendanceData {
  logs: AttendanceLog[];
  total: number;
  page: number;
  totalPages: number;
}

export function DeveloperProfileClient({
  developer,
  attendanceData,
  monthlyStats,
}: {
  developer: Developer;
  attendanceData: AttendanceData;
  monthlyStats: MonthlyStats;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this developer?")) return;
    const result = await deleteDeveloper(developer.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Developer deleted");
      router.push("/developers");
    }
  }

  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/developers")}
        className="text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Developers
      </Button>

      {/* Profile Header */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {getInitials(developer.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{developer.full_name}</h2>
                  <DeveloperStatusBadge status={developer.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {developer.role || "Developer"}
                  {developer.tech_stack && ` · ${developer.tech_stack}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {developer.companies?.name && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{developer.companies.name}</span>
                    </div>
                  )}
                  {developer.email && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{developer.email}</span>
                    </div>
                  )}
                  {developer.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{developer.phone}</span>
                    </div>
                  )}
                  {developer.start_date && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Started {formatDate(developer.start_date)}</span>
                    </div>
                  )}
                </div>
                {developer.deal_amount != null && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-sm">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-medium text-emerald-400">
                        {developer.deal_amount.toLocaleString()}
                      </span>
                      <span className="text-emerald-400/70 text-xs">deal</span>
                    </div>
                  </div>
                )}
                {(developer.github_url || developer.linkedin_url || developer.portfolio_url) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {developer.github_url && (
                      <a
                        href={developer.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        GitHub
                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                      </a>
                    )}
                    {developer.linkedin_url && (
                      <a
                        href={developer.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <LinkedinIcon className="h-3.5 w-3.5" />
                        LinkedIn
                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                      </a>
                    )}
                    {developer.portfolio_url && (
                      <a
                        href={developer.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Portfolio
                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                      </a>
                    )}
                  </div>
                )}
                {developer.notes && (
                  <div className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{developer.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <AttendanceForm
                developerId={developer.id}
                developerName={developer.full_name}
                trigger={
                  <Button size="sm">
                    <CalendarPlus className="mr-2 h-3.5 w-3.5" />
                    Log Attendance
                  </Button>
                }
                onSuccess={() => router.refresh()}
              />
              <DeveloperForm
                developer={developer}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                }
                onSuccess={() => router.refresh()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Stats */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {currentMonthName} Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-muted-foreground">Present</span>
              </div>
              <p className="text-2xl font-bold">{monthlyStats.present}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-xs text-muted-foreground">Absent</span>
              </div>
              <p className="text-2xl font-bold">{monthlyStats.absent}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-muted-foreground">Half Day</span>
              </div>
              <p className="text-2xl font-bold">{monthlyStats.half_day}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Coffee className="h-4 w-4 text-zinc-400" />
                <span className="text-xs text-muted-foreground">On Leave</span>
              </div>
              <p className="text-2xl font-bold">{monthlyStats.on_leave}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">
                  Total Days
                </span>
              </div>
              <p className="text-2xl font-bold">{monthlyStats.total_days}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">
                  Total Hours
                </span>
              </div>
              <p className="text-2xl font-bold">
                {monthlyStats.total_hours.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Attendance History */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceData.logs.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No attendance records"
              description="Start logging attendance to see the history here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden sm:table-cell">
                      Check In
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden sm:table-cell">
                      Check Out
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden md:table-cell">
                      Hours
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden lg:table-cell">
                      Work Summary
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {attendanceData.logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 pr-4">
                        <span className="text-sm">{formatDate(log.date)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <AttendanceStatusBadge status={log.status} />
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(log.check_in_time)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(log.check_out_time)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {log.hours_logged ? `${log.hours_logged}h` : "—"}
                        </span>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                          {log.work_summary || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination info */}
          {attendanceData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Showing {attendanceData.logs.length} of {attendanceData.total}{" "}
                records
              </p>
              <p className="text-xs text-muted-foreground">
                Page {attendanceData.page} of {attendanceData.totalPages}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
