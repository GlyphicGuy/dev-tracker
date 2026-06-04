import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate, formatTime } from "@/lib/utils";
import { Activity } from "lucide-react";
import type { AttendanceLog } from "@/lib/types";

export function RecentActivityFeed({
  activities,
}: {
  activities: AttendanceLog[];
}) {
  if (activities.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Attendance logs will appear here once you start tracking."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary/50" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">
                      {log.developers?.full_name || "Unknown"}
                    </span>
                    <span className="text-muted-foreground"> — </span>
                    <span className="text-muted-foreground">
                      {log.developers?.companies?.name || ""}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(log.date)}
                    {log.check_in_time &&
                      ` · ${formatTime(log.check_in_time)}`}
                    {log.hours_logged && ` · ${log.hours_logged}h`}
                  </p>
                </div>
              </div>
              <AttendanceStatusBadge status={log.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
