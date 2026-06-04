"use client";

import { useState, useTransition } from "react";
import { quickMarkAttendance } from "@/actions/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { getInitials } from "@/lib/utils";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AttendanceStatus } from "@/lib/types";

interface TodayDev {
  id: string;
  full_name: string;
  role: string | null;
  companies: { name: string }[] | { name: string } | null;
  todayLog: { status: AttendanceStatus } | null;
}

const quickStatuses: { label: string; value: AttendanceStatus; color: string }[] = [
  { label: "P", value: "present", color: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30" },
  { label: "A", value: "absent", color: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30" },
  { label: "H", value: "half_day", color: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30" },
  { label: "L", value: "on_leave", color: "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-400 border-zinc-500/30" },
];

export function TodayAttendanceTable({
  developers,
}: {
  developers: TodayDev[];
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleQuickMark(developerId: string, status: AttendanceStatus) {
    setLoadingId(`${developerId}-${status}`);
    startTransition(async () => {
      const result = await quickMarkAttendance(developerId, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Attendance marked");
      }
      setLoadingId(null);
    });
  }

  if (developers.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Today&apos;s Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarCheck}
            title="No active developers"
            description="Add developers to start tracking attendance."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg">Today&apos;s Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                  Developer
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 hidden sm:table-cell">
                  Company
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                  Quick Mark
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {developers.map((dev) => (
                <tr key={dev.id} className="group">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(dev.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{dev.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dev.role || "Developer"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {Array.isArray(dev.companies)
                        ? dev.companies[0]?.name || "Unassigned"
                        : dev.companies?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {dev.todayLog ? (
                      <AttendanceStatusBadge status={dev.todayLog.status} />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Not marked
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      {quickStatuses.map((s) => {
                        const isLoading =
                          isPending && loadingId === `${dev.id}-${s.value}`;
                        return (
                          <Button
                            key={s.value}
                            variant="outline"
                            size="sm"
                            className={`h-7 w-7 p-0 text-xs font-bold border ${s.color}`}
                            onClick={() => handleQuickMark(dev.id, s.value)}
                            disabled={isPending}
                            title={s.value.replace("_", " ")}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              s.label
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
