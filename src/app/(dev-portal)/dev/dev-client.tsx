"use client";

import { useState, useTransition } from "react";
import { TimerWidget } from "@/components/timer-widget";
import { submitSession } from "@/actions/work-sessions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { WorkSession, Developer, SessionStatus } from "@/lib/types";

interface DevPortalClientProps {
  developer: Developer;
  todaySession: WorkSession | null;
  recentSessions: WorkSession[];
}

function getStatusConfig(status: SessionStatus) {
  switch (status) {
    case "running":
      return {
        label: "Running",
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        icon: Clock,
      };
    case "stopped":
      return {
        label: "Stopped",
        color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        icon: AlertCircle,
      };
    case "submitted":
      return {
        label: "Pending Review",
        color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        icon: Clock,
      };
    case "approved":
      return {
        label: "Approved",
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "bg-red-500/15 text-red-400 border-red-500/20",
        icon: XCircle,
      };
  }
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function DevPortalClient({
  developer,
  todaySession,
  recentSessions,
}: DevPortalClientProps) {
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const isStopped = todaySession?.status === "stopped";
  const isSubmitted =
    todaySession?.status === "submitted" ||
    todaySession?.status === "approved";

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitSession(description);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Work submitted successfully! 🎉");
        setDescription("");
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Hey, {developer.full_name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {developer.companies?.name
            ? `Working with ${developer.companies.name}`
            : "Ready to track your work"}
        </p>
      </div>

      {/* Timer Card */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <CardContent className="pt-8 pb-8">
          <TimerWidget session={todaySession} />
        </CardContent>
      </Card>

      {/* EOD Submission */}
      {isStopped && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-amber-400" />
              Submit End-of-Day Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Worked for{" "}
                <span className="font-semibold text-foreground">
                  {formatDuration(todaySession?.duration_minutes ?? null)}
                </span>{" "}
                today. Describe what you accomplished:
              </p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Built the login flow, fixed the dashboard bug, reviewed PRs..."
                rows={4}
                className="resize-none"
                disabled={isPending}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !description.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Work Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's submission result */}
      {isSubmitted && todaySession?.work_description && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
              Today&apos;s Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Hours: </span>
              <span className="font-medium">
                {formatDuration(todaySession.duration_minutes)}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Description: </span>
              <span>{todaySession.work_description}</span>
            </p>
            {todaySession.status === "approved" && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                Approved ✓
              </Badge>
            )}
            {todaySession.review_notes && (
              <p className="text-sm mt-2">
                <span className="text-muted-foreground">Review notes: </span>
                <span className="italic">{todaySession.review_notes}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rejected session notice */}
      {todaySession?.status === "rejected" && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              Submission Rejected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your submission was rejected. You can check in again and
              resubmit.
            </p>
            {todaySession.review_notes && (
              <p className="text-sm">
                <span className="text-muted-foreground">Reason: </span>
                <span className="italic">{todaySession.review_notes}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      {recentSessions.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions
                .filter((s) => s.date !== todaySession?.date)
                .slice(0, 5)
                .map((session) => {
                  const config = getStatusConfig(session.status);
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(session.date)}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {session.work_description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(session.duration_minutes)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${config.color}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
