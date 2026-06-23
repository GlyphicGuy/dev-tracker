"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Users, Mail, FileText, Clock, AlertCircle } from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Developer {
  id: string;
  full_name: string;
  email?: string;
  role?: string;
  status?: string;
  todayAttendance?: {
    id: string;
    date: string;
    status: string;
    approval_status: string;
  } | null;
  pendingSessionsCount: number;
}

interface DevelopersClientProps {
  developers: Developer[];
}

export function DevelopersClient({ developers }: DevelopersClientProps) {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null
  );

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "absent":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "half_day":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "on_leave":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your team of developers
        </p>
      </div>

      {developers.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-12">
            <EmptyState
              icon={Users}
              title="No developers yet"
              description="Add developers to your team to get started"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map((dev) => (
            <Card
              key={dev.id}
              className="border-border/50 bg-card/50 hover:border-border/80 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedDeveloper(dev)}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* Developer header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-500/10 text-blue-400 text-sm font-medium">
                        {getInitials(dev.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{dev.full_name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {dev.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    {dev.role && (
                      <Badge variant="outline" className="text-xs">
                        {dev.role}
                      </Badge>
                    )}
                    {dev.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          dev.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        )}
                      >
                        {dev.status}
                      </Badge>
                    )}
                  </div>

                  <div className="border-t border-border/30 pt-3 space-y-2">
                    {/* Today's attendance */}
                    {dev.todayAttendance ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Today:{" "}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getAttendanceColor(dev.todayAttendance.status),
                            "capitalize"
                          )}
                        >
                          {dev.todayAttendance.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          No attendance recorded today
                        </span>
                      </div>
                    )}

                    {/* Pending sessions */}
                    {dev.pendingSessionsCount > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-400" />
                        <span className="text-xs">
                          <span className="font-medium text-amber-400">
                            {dev.pendingSessionsCount}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            pending review
                            {dev.pendingSessionsCount !== 1 ? "s" : ""}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Developer Detail Modal */}
      {selectedDeveloper && (
        <Dialog open={!!selectedDeveloper} onOpenChange={() => setSelectedDeveloper(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Developer Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-500/10 text-blue-400 text-lg font-medium">
                    {getInitials(selectedDeveloper.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedDeveloper.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDeveloper.email}
                  </p>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4 space-y-3">
                {/* Role */}
                {selectedDeveloper.role && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Role
                    </p>
                    <p className="text-sm capitalize">
                      {selectedDeveloper.role}
                    </p>
                  </div>
                )}

                {/* Status */}
                {selectedDeveloper.status && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        selectedDeveloper.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      )}
                    >
                      {selectedDeveloper.status}
                    </Badge>
                  </div>
                )}

                {/* Today's Attendance */}
                {selectedDeveloper.todayAttendance ? (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Today&apos;s Attendance
                    </p>
                    <div className="space-y-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          getAttendanceColor(
                            selectedDeveloper.todayAttendance.status
                          ),
                          "capitalize"
                        )}
                      >
                        {selectedDeveloper.todayAttendance.status.replace(
                          "_",
                          " "
                        )}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Approval:{" "}
                        <span className="text-foreground capitalize font-medium">
                          {selectedDeveloper.todayAttendance.approval_status}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Today&apos;s Attendance
                    </p>
                    <p className="text-sm text-muted-foreground">
                      No attendance recorded
                    </p>
                  </div>
                )}

                {/* Pending Reviews */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Pending Reviews
                  </p>
                  {selectedDeveloper.pendingSessionsCount > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                    >
                      {selectedDeveloper.pendingSessionsCount} session
                      {selectedDeveloper.pendingSessionsCount !== 1
                        ? "s"
                        : ""}{" "}
                      awaiting approval
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No pending reviews
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setSelectedDeveloper(null)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
